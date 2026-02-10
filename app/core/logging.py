import logging
import json
import time
from datetime import datetime
from typing import Dict, Any
from functools import wraps


class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def log(self, level: str, message: str, **kwargs):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "message": message,
            **kwargs
        }
        self.logger.info(json.dumps(log_data))
    
    def info(self, message: str, **kwargs):
        self.log("INFO", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        self.log("ERROR", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        self.log("WARNING", message, **kwargs)


def log_performance(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        logger = StructuredLogger("performance")
        
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            
            logger.info(
                "Function completed",
                function=func.__name__,
                duration_ms=round(duration * 1000, 2),
                success=True
            )
            
            return result
        except Exception as e:
            duration = time.time() - start_time
            
            logger.error(
                "Function failed",
                function=func.__name__,
                duration_ms=round(duration * 1000, 2),
                error=str(e),
                success=False
            )
            
            raise
    
    return wrapper
