import asyncio
from threading import Thread
from factory.builder import WorkflowConfig
from factory.builder import start_agents

import logging
logger = logging.getLogger(__name__)

class WorkflowRunner(Thread):
    def __init__(self, workflow_config: WorkflowConfig, user_id: str, user_task: str, trace_id: str):
        super().__init__()
        self.workflow_config = workflow_config
        self.trace_id = trace_id
        self.user_id = user_id
        self.user_task = user_task
        self.status = "pending"
        self.result = None

    def run(self):
        logger.info(f"Running workflow {self.trace_id}")
        self.status = "running"
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            # Run async func
            out = loop.run_until_complete(
                start_agents(
                    self.workflow_config, 
                    user_task=self.user_task, 
                    user_id=self.user_id
                )
            )
            loop.close()
        except Exception as e:
            logger.error(f"Workflow {self.trace_id} failed: {e}")
            self.status = "failed"
            self.result = str(e)
            return
        self.result = out
        self.status = "completed"
        logger.info(f"Workflow {self.trace_id} completed")
        return out