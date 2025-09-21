from agents import tracing  # type: ignore[import]
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
import pymongo
from pymongo import MongoClient
import logging

required = (
    "TracingProcessor",
    "Trace",
    "Span",
    "ResponseSpanData",
)
if not all(hasattr(tracing, name) for name in required):
    raise ImportError("The `agents` package is not installed.")


MONGO_URI = "mongodb+srv://admin:[REDACTED]@ifood-lcm-dev.8hqge.mongodb.net/"
logger = logging.getLogger(__name__)


class OpenAIAgentsTracingProcessor(tracing.TracingProcessor):  # type: ignore[no-redef]
        """Tracing processor for the `OpenAI Agents SDK <https://openai.github.io/openai-agents-python/>`_.

        Traces all intermediate steps of your OpenAI Agent to MongoDB.

        Args:
            mongo_uri: MongoDB connection URI. If not provided, uses default URI.
            database_name: Name of the MongoDB database to store traces.
            metadata: Metadata to associate with all traces.
            tags: Tags to associate with all traces.
            collection_prefix: Prefix for MongoDB collection names.
            name: Name of the root trace.

        Example:
            .. code-block:: python

                from agents import (
                    Agent,
                    FileSearchTool,
                    Runner,
                    WebSearchTool,
                    function_tool,
                    set_trace_processors,
                )

                set_trace_processors([OpenAIAgentsTracingProcessor()])

                @function_tool
                def get_weather(city: str) -> str:
                    return f"The weather in {city} is sunny"

                haiku_agent = Agent(
                    name="Haiku agent",
                    instructions="Always respond in haiku form",
                    model="o3-mini",
                    tools=[get_weather],
                )
                agent = Agent(
                    name="Assistant",
                    tools=[WebSearchTool()],
                    instructions="speak in spanish. use Haiku agent if they ask for a haiku or for the weather",
                    handoffs=[haiku_agent],
                )

                result = await Runner.run(
                    agent,
                    "write a haiku about the weather today and tell me a recent news story about new york",
                )
                print(result.final_output)
        """

        def __init__(
            self,
            mongo_uri: Optional[str] = None,
            *,
            database_name: str = "agent_traces",
            metadata: Optional[dict] = None,
            tags: Optional[list[str]] = None,
            collection_prefix: str = "trace",
            name: Optional[str] = None,
        ):
            self.mongo_uri = mongo_uri or MONGO_URI
            self.database_name = database_name
            self.collection_prefix = collection_prefix
            self._metadata = metadata or {}
            self._tags = tags or []
            self._name = name
            self._first_response_inputs: dict = {}
            self._last_response_outputs: dict = {}
            
            # Initialize MongoDB client
            try:
                self.client = MongoClient(self.mongo_uri)
                self.db = self.client[self.database_name]
                self.traces_collection = self.db[f"{self.collection_prefix}_traces"]
                self.spans_collection = self.db[f"{self.collection_prefix}_spans"]
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB: {e}")
                raise

            self._active_traces: dict[str, dict] = {}
            self._active_spans: dict[str, dict] = {}



        def on_trace_start(self, trace: tracing.Trace) -> None:
            """Start a new trace and store it in MongoDB."""
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
                "_id": trace_id,
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
            }
            
            try:
                self.traces_collection.insert_one(trace_document)
                self._active_traces[trace.trace_id] = trace_document
                logger.debug(f"Started trace: {trace.trace_id}")
            except Exception as e:
                logger.exception(f"Error creating trace in MongoDB: {e}")

        def on_trace_end(self, trace: tracing.Trace) -> None:
            """End a trace and update it in MongoDB."""
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
                self.traces_collection.update_one(
                    {"trace_id": trace.trace_id},
                    {"$set": update_data}
                )
                self._active_traces.pop(trace.trace_id, None)
                logger.debug(f"Completed trace: {trace.trace_id}")
            except Exception as e:
                logger.exception(f"Error updating trace in MongoDB: {e}")

        def on_span_start(self, span: tracing.Span) -> None:
            """Start a new span and store it in MongoDB."""
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
                "_id": span_id,
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
            }
            
            try:
                self.spans_collection.insert_one(span_document)
                self._active_spans[span.span_id] = span_document
                logger.debug(f"Started span: {span.span_id}")
            except Exception as e:
                logger.exception(f"Error creating span in MongoDB: {e}")

        def on_span_end(self, span: tracing.Span) -> None:
            """End a span and update it in MongoDB."""
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
                self.spans_collection.update_one(
                    {"span_id": span.span_id},
                    {"$set": update_data}
                )
                self._active_spans.pop(span.span_id, None)
                logger.debug(f"Completed span: {span.span_id}")
            except Exception as e:
                logger.exception(f"Error updating span in MongoDB: {e}")

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
            """Close MongoDB connection."""
            try:
                if hasattr(self, 'client'):
                    self.client.close()
                    logger.debug("MongoDB connection closed")
            except Exception as e:
                logger.exception(f"Error closing MongoDB connection: {e}")

        def force_flush(self) -> None:
            """Force flush any pending operations."""
            # MongoDB operations are synchronous by default, so no explicit flush needed
            pass