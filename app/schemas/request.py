from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any


class InferenceRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to process")
    model: Optional[str] = Field(None, description="Model name to use")
    version: Optional[str] = Field("v1", description="Model version")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Model-specific parameters")
    
    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or whitespace only')
        return v.strip()


class BatchInferenceRequest(BaseModel):
    requests: List[InferenceRequest] = Field(..., min_items=1, max_items=100)
    
    @validator('requests')
    def validate_requests(cls, v):
        if len(v) == 0:
            raise ValueError('At least one request is required')
        return v
