from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class InferenceResponse(BaseModel):
    success: bool = Field(..., description="Whether the inference was successful")
    result: Optional[str] = Field(None, description="Inference result")
    model_used: str = Field(..., description="Model name and version used")
    latency_ms: float = Field(..., description="Total latency in milliseconds")
    request_id: str = Field(..., description="Unique request identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    error: Optional[str] = Field(None, description="Error message if failed")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service health status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Health check timestamp")
    models_loaded: List[str] = Field(default_factory=list, description="List of loaded models")
    uptime_seconds: Optional[float] = Field(None, description="Service uptime in seconds")


class MetricsResponse(BaseModel):
    total_requests: int = Field(..., description="Total number of requests processed")
    successful_requests: int = Field(..., description="Number of successful requests")
    failed_requests: int = Field(..., description="Number of failed requests")
    average_latency_ms: float = Field(..., description="Average latency in milliseconds")
    requests_per_model: Dict[str, int] = Field(default_factory=dict, description="Request count per model")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Metrics timestamp")
