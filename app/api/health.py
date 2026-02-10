import time
from datetime import datetime
from fastapi import APIRouter, Depends
from typing import List

from ..schemas.response import HealthResponse
from ..services.inference_service import InferenceService
from ..core.config import settings

router = APIRouter()

# Global service instance (will be injected in main.py)
inference_service: InferenceService = None

_start_time = time.time()


async def get_inference_service() -> InferenceService:
    """Dependency injection for inference service"""
    return inference_service


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    uptime = time.time() - _start_time
    loaded_models = []
    
    if inference_service:
        loaded_models = inference_service.get_loaded_models()
    
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        timestamp=datetime.utcnow(),
        models_loaded=loaded_models,
        uptime_seconds=round(uptime, 2)
    )


@router.get("/health/live")
async def liveness_probe():
    """Kubernetes liveness probe"""
    return {"status": "alive"}


@router.get("/health/ready")
async def readiness_probe():
    """Kubernetes readiness probe"""
    loaded_models = []
    if inference_service:
        loaded_models = inference_service.get_loaded_models()
    
    is_ready = len(loaded_models) > 0
    
    return {
        "status": "ready" if is_ready else "not_ready",
        "models_loaded": len(loaded_models)
    }
