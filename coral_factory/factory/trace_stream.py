from agents import tracing  # type: ignore[import]
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore
import logging
import os

required = (
    "TracingProcessor",
    "Trace",
    "Span",
    "ResponseSpanData",
)
if not all(hasattr(tracing, name) for name in required):
    raise ImportError("The `agents` package is not installed.")


# Firebase configuration
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
logger = logging.getLogger(__name__)



class OpenAIAgentsTracingProcessor(tracing.TracingProcessor):  # type: ignore[no-redef]
        """Tracing processor for the `OpenAI Agents SDK <https://openai.github.io/openai-agents-python/>`_.
        """

        def __init__(
            self,
            firebase_project_id: Optional[str] = None,
            firebase_service_account_path: Optional[str] = None,
            *,
            user_id: Optional[str] = None,
            metadata: Optional[dict] = None,
            tags: Optional[list[str]] = None,
            name: Optional[str] = None,
        ):
            self.firebase_project_id = firebase_project_id or FIREBASE_PROJECT_ID
            self.firebase_service_account_path = firebase_service_account_path or FIREBASE_SERVICE_ACCOUNT_PATH
            self.user_id = user_id or os.getenv("USER_ID", "anonymous")
            self._metadata = metadata or {}
            self._tags = tags or []
            self._name = name
            self._first_response_inputs: dict = {}
            self._last_response_outputs: dict = {}
            
            # Initialize Firebase Admin SDK
            try:
                if not firebase_admin._apps:
                    if self.firebase_service_account_path:
                        cred = credentials.Certificate(self.firebase_service_account_path)
                        firebase_admin.initialize_app(cred, {
                            'projectId': self.firebase_project_id
                        })
                    else:
                        # Use default credentials (for Cloud Run, etc.)
                        firebase_admin.initialize_app()
                
                self.db = firestore.client()
                logger.info("Successfully connected to Firebase Firestore")
            except Exception as e:
                logger.error(f"Failed to connect to Firebase Firestore: {e}")
                raise

            self._active_traces: dict[str, dict] = {}
            self._active_spans: dict[str, dict] = {}



        def on_trace_start(self, trace: tracing.Trace) -> None:
            """Start a new trace and store it in Firestore."""
            if self._name:
                trace_name = self._name
            elif trace.name:
                trace_name = trace.name
            else:
                trace_name = "Agent workflow"
            
            trace_id = str(uuid4())
            start_time = datetime.now(timezone.utc)
            
            trace_dict = trace.export() or {}
            
            trace_document = {
                "trace_id": trace.trace_id,
                "name": trace_name,
                "start_time": start_time,
                "end_time": None,
                "status": "running",
                "metadata": {
                    **self._metadata,
                    **(trace_dict.get("metadata") or {}),
                },
                "tags": self._tags,
                "group_id": trace_dict.get("group_id"),
                "inputs": {},
                "outputs": {},
                "created_at": start_time,
                "updated_at": start_time,
                "user_id": self.user_id,
            }
            
            try:
                # Store in users/{user_id}/agent_traces/{trace_id}
                trace_ref = self.db.collection('users').document(self.user_id).collection('agent_traces').document(trace_id)
                trace_ref.set(trace_document)
                self._active_traces[trace.trace_id] = trace_document
                logger.debug(f"Started trace: {trace.trace_id}")
            except Exception as e:
                logger.exception(f"Error creating trace in Firestore: {e}")

        def on_trace_end(self, trace: tracing.Trace) -> None:
            """End a trace and update it in Firestore."""
            if trace.trace_id not in self._active_traces:
                logger.warning(f"Trace {trace.trace_id} not found in active traces")
                return
                
            end_time = datetime.now(timezone.utc)
            trace_dict = trace.export() or {}
            
            # Get final inputs and outputs
            final_inputs = self._first_response_inputs.pop(trace.trace_id, {})
            final_outputs = self._last_response_outputs.pop(trace.trace_id, {})
            
            update_data = {
                "end_time": end_time,
                "status": "completed",
                "inputs": final_inputs,
                "outputs": final_outputs,
                "metadata": {
                    **self._metadata,
                    **(trace_dict.get("metadata") or {}),
                },
                "updated_at": end_time,
            }
            
            try:
                # Find the trace document to update
                trace_doc = self._active_traces[trace.trace_id]
                if "trace_id" in trace_doc:
                    # Update the trace using a query to find the document by trace_id
                    traces_ref = self.db.collection('users').document(self.user_id).collection('agent_traces')
                    docs = traces_ref.where('trace_id', '==', trace.trace_id).get()
                    
                    for doc in docs:
                        doc.reference.update(update_data)
                        break
                
                self._active_traces.pop(trace.trace_id, None)
                logger.debug(f"Completed trace: {trace.trace_id}")
            except Exception as e:
                logger.exception(f"Error updating trace in Firestore: {e}")

        def on_span_start(self, span: tracing.Span) -> None:
            """Start a new span and store it in Firestore."""
            if span.trace_id not in self._active_traces:
                logger.warning(f"Parent trace {span.trace_id} not found for span {span.span_id}")
                return
                
            span_id = str(uuid4())
            start_time = (
                datetime.fromisoformat(span.started_at)
                if span.started_at
                else datetime.now(timezone.utc)
            )
            
            # Extract span information
            span_name = getattr(span, 'name', None) or f"Span_{span.span_id}"
            span_type = getattr(span, 'type', 'unknown')
            
            span_document = {
                "span_id": span.span_id,
                "trace_id": span.trace_id,
                "parent_id": span.parent_id,
                "name": span_name,
                "type": span_type,
                "start_time": start_time,
                "end_time": None,
                "status": "running",
                "inputs": self._extract_span_inputs(span),
                "outputs": {},
                "metadata": {
                    "openai_span_id": span.span_id,
                    "openai_trace_id": span.trace_id,
                    "openai_parent_id": span.parent_id,
                },
                "tags": self._tags,
                "created_at": start_time,
                "updated_at": start_time,
                "user_id": self.user_id,
            }
            
            try:
                # Store in users/{user_id}/agent_spans/{span_id}
                span_ref = self.db.collection('users').document(self.user_id).collection('agent_spans').document(span_id)
                span_ref.set(span_document)
                self._active_spans[span.span_id] = span_document
                logger.debug(f"Started span: {span.span_id}")
            except Exception as e:
                logger.exception(f"Error creating span in Firestore: {e}")

        def on_span_end(self, span: tracing.Span) -> None:
            """End a span and update it in Firestore."""
            if span.span_id not in self._active_spans:
                logger.warning(f"Span {span.span_id} not found in active spans")
                return
                
            end_time = (
                datetime.fromisoformat(span.ended_at)
                if span.ended_at
                else datetime.now(timezone.utc)
            )
            
            outputs = self._extract_span_outputs(span)
            inputs = self._extract_span_inputs(span)
            
            update_data = {
                "end_time": end_time,
                "status": "completed" if not span.error else "error",
                "inputs": inputs,
                "outputs": outputs,
                "error": str(span.error) if span.error else None,
                "updated_at": end_time,
            }
            
            # Store response data for trace-level aggregation
            if isinstance(span.span_data, tracing.ResponseSpanData):
                self._first_response_inputs[span.trace_id] = (
                    self._first_response_inputs.get(span.trace_id) or inputs
                )
                self._last_response_outputs[span.trace_id] = outputs
            
            try:
                # Find the span document to update
                spans_ref = self.db.collection('users').document(self.user_id).collection('agent_spans')
                docs = spans_ref.where('span_id', '==', span.span_id).get()
                
                for doc in docs:
                    doc.reference.update(update_data)
                    break
                
                self._active_spans.pop(span.span_id, None)
                logger.debug(f"Completed span: {span.span_id}")
            except Exception as e:
                logger.exception(f"Error updating span in Firestore: {e}")

        def _extract_span_inputs(self, span: tracing.Span) -> dict:
            """Extract inputs from span data."""
            try:
                if hasattr(span, 'span_data') and span.span_data:
                    span_data = span.span_data
                    if hasattr(span_data, 'input'):
                        return {"input": span_data.input}
                    elif hasattr(span_data, 'inputs'):
                        return span_data.inputs
                return {}
            except Exception as e:
                logger.warning(f"Error extracting span inputs: {e}")
                return {}

        def _extract_span_outputs(self, span: tracing.Span) -> dict:
            """Extract outputs from span data."""
            try:
                if hasattr(span, 'span_data') and span.span_data:
                    span_data = span.span_data
                    if hasattr(span_data, 'output'):
                        return {"output": span_data.output}
                    elif hasattr(span_data, 'outputs'):
                        return span_data.outputs
                return {}
            except Exception as e:
                logger.warning(f"Error extracting span outputs: {e}")
                return {}

        def shutdown(self) -> None:
            """Clean up Firebase connection."""
            try:
                # Firebase Admin SDK doesn't require explicit connection closing
                logger.debug("Firebase connection cleaned up")
            except Exception as e:
                logger.exception(f"Error cleaning up Firebase connection: {e}")

        def force_flush(self) -> None:
            """Force flush any pending operations."""
            # Firestore operations are synchronous by default, so no explicit flush needed
            pass