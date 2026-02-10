from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any

from ..schemas.request import InferenceRequest, BatchInferenceRequest
from ..schemas.response import InferenceResponse, MetricsResponse
from ..services.inference_service import InferenceService
from ..core.logging import StructuredLogger

router = APIRouter()
logger = StructuredLogger("inference_api")

# Global service instance (shared with health.py)
inference_service: InferenceService = None


async def get_inference_service() -> InferenceService:
    """Dependency injection for inference service"""
    global inference_service
    if inference_service is None:
        inference_service = InferenceService()
        await inference_service.initialize()
    return inference_service


@router.post("/infer", response_model=InferenceResponse)
async def inference(
    request: InferenceRequest,
    service: InferenceService = Depends(get_inference_service)
):
    """
    Process a single inference request
    
    - **text**: Text to process (1-10000 characters)
    - **model**: Optional model name (defaults to configured default)
    - **version**: Model version (defaults to v1)
    - **parameters**: Optional model-specific parameters
    """
    try:
        response = await service.process_inference(request)
        return response
    except Exception as e:
        logger.error("Inference endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/infer/batch", response_model=List[InferenceResponse])
async def batch_inference(
    batch_request: BatchInferenceRequest,
    service: InferenceService = Depends(get_inference_service)
):
    """
    Process multiple inference requests in parallel
    
    - **requests**: List of inference requests (1-100 items)
    """
    try:
        responses = await service.process_batch_inference(batch_request)
        return responses
    except Exception as e:
        logger.error("Batch inference endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models", response_model=List[Dict[str, Any]])
async def list_models():
    """List all available models with their information"""
    from ..models.registry import model_registry
    
    models = []
    for model_info in model_registry.list_models():
        models.append({
            "name": model_info.name,
            "version": model_info.version,
            "type": model_info.model_type.value,
            "description": model_info.description,
            "is_loaded": model_info.is_loaded,
            "parameters": model_info.parameters
        })
    
    return models


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(service: InferenceService = Depends(get_inference_service)):
    """Get service metrics and performance statistics"""
    try:
        metrics_data = service.get_metrics()
        return MetricsResponse(**metrics_data)
    except Exception as e:
        logger.error("Metrics endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/{model_name}/load")
async def load_model(
    model_name: str,
    version: str = Query(default="v1", description="Model version"),
    service: InferenceService = Depends(get_inference_service)
):
    """Load a specific model into memory"""
    try:
        success = await service.model_loader.load_model(model_name, version)
        if success:
            return {"message": f"Model {model_name}:{version} loaded successfully"}
        else:
            raise HTTPException(status_code=404, detail=f"Model {model_name}:{version} not found or failed to load")
    except Exception as e:
        logger.error("Model load error", model=model_name, version=version, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/{model_name}/unload")
async def unload_model(
    model_name: str,
    version: str = Query(default="v1", description="Model version"),
    service: InferenceService = Depends(get_inference_service)
):
    """Unload a specific model from memory"""
    try:
        await service.model_loader.unload_model(model_name, version)
        return {"message": f"Model {model_name}:{version} unloaded successfully"}
    except Exception as e:
        logger.error("Model unload error", model=model_name, version=version, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
