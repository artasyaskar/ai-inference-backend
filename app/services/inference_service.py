import time
import uuid
import asyncio
from typing import Optional, Dict, Any, List

from ..models.registry import model_registry, ModelType
from ..models.loader import ModelLoader
from ..schemas.request import InferenceRequest, BatchInferenceRequest
from ..schemas.response import InferenceResponse
from ..core.logging import StructuredLogger, log_performance
from ..core.config import settings


class InferenceService:
    def __init__(self):
        self.model_loader = ModelLoader(model_registry)
        self.logger = StructuredLogger("inference_service")
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_latency": 0.0,
            "requests_per_model": {}
        }
    
    async def initialize(self):
        """Initialize the service by loading the default model"""
        self.logger.info("Initializing inference service")
        await self.model_loader.load_model(settings.default_model)
        self.logger.info("Inference service initialized")
    
    @log_performance
    async def process_inference(self, request: InferenceRequest) -> InferenceResponse:
        """Process a single inference request"""
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # Determine which model to use
        model_name = request.model or settings.default_model
        version = request.version
        
        # Update metrics
        self.metrics["total_requests"] += 1
        model_key = f"{model_name}:{version}"
        self.metrics["requests_per_model"][model_key] = self.metrics["requests_per_model"].get(model_key, 0) + 1
        
        try:
            # Ensure model is loaded
            if not self.model_loader.is_model_loaded(model_name, version):
                await self.model_loader.load_model(model_name, version)
            
            # Get the model pipeline
            model_pipeline = self.model_loader.get_model(model_name, version)
            if not model_pipeline:
                raise ValueError(f"Model {model_name}:{version} not available")
            
            # Get model info for parameters
            model_info = model_registry.get_model(model_name, version)
            model_params = model_info.parameters.copy()
            model_params.update(request.parameters or {})
            
            # Process based on model type
            result = await self._run_inference(model_pipeline, request.text, model_info.model_type, model_params)
            
            # Calculate latency
            latency_ms = (time.time() - start_time) * 1000
            
            # Update success metrics
            self.metrics["successful_requests"] += 1
            self.metrics["total_latency"] += latency_ms
            
            self.logger.info(
                "Inference completed successfully",
                request_id=request_id,
                model=model_key,
                latency_ms=round(latency_ms, 2)
            )
            
            return InferenceResponse(
                success=True,
                result=result,
                model_used=model_key,
                latency_ms=round(latency_ms, 2),
                request_id=request_id,
                metadata={"model_type": model_info.model_type.value}
            )
            
        except Exception as e:
            # Calculate latency even for failures
            latency_ms = (time.time() - start_time) * 1000
            
            # Update failure metrics
            self.metrics["failed_requests"] += 1
            self.metrics["total_latency"] += latency_ms
            
            self.logger.error(
                "Inference failed",
                request_id=request_id,
                model=model_key,
                error=str(e),
                latency_ms=round(latency_ms, 2)
            )
            
            return InferenceResponse(
                success=False,
                model_used=model_key,
                latency_ms=round(latency_ms, 2),
                request_id=request_id,
                error=str(e)
            )
    
    async def _run_inference(self, model_pipeline, text: str, model_type: ModelType, params: Dict[str, Any]) -> str:
        """Run inference based on model type"""
        
        if model_type == ModelType.SUMMARIZER:
            # Summarization
            result = model_pipeline(text, **params)
            return result[0]['summary_text'] if result else ""
        
        elif model_type == ModelType.CLASSIFIER:
            # Classification
            result = model_pipeline(text)
            if result:
                # Format the classification result
                label = result[0]['label']
                score = result[0]['score']
                return f"Classification: {label} (confidence: {score:.3f})"
            return "Classification failed"
        
        elif model_type == ModelType.GENERATOR:
            # Text generation
            result = model_pipeline(text, **params)
            if result and len(result) > 0:
                generated_text = result[0]['generated_text']
                # Ensure we're not just echoing the input
                if generated_text.strip().lower() != text.strip().lower():
                    return generated_text
                else:
                    # If we got the same text, try again with different parameters
                    params_with_variation = params.copy()
                    params_with_variation['temperature'] = params.get('temperature', 0.7) + 0.2
                    params_with_variation['do_sample'] = True
                    result2 = model_pipeline(text, **params_with_variation)
                    if result2 and len(result2) > 0:
                        return result2[0]['generated_text']
            return "Generation failed - please try different input"
        
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    async def process_batch_inference(self, batch_request: BatchInferenceRequest) -> List[InferenceResponse]:
        """Process multiple inference requests in parallel"""
        tasks = [self.process_inference(req) for req in batch_request.requests]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Convert exceptions to error responses
        responses = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                responses.append(InferenceResponse(
                    success=False,
                    model_used="unknown",
                    latency_ms=0.0,
                    request_id=str(uuid.uuid4()),
                    error=str(result)
                ))
            else:
                responses.append(result)
        
        return responses
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current service metrics"""
        total_requests = self.metrics["total_requests"]
        avg_latency = (self.metrics["total_latency"] / total_requests) if total_requests > 0 else 0.0
        
        return {
            "total_requests": total_requests,
            "successful_requests": self.metrics["successful_requests"],
            "failed_requests": self.metrics["failed_requests"],
            "average_latency_ms": round(avg_latency, 2),
            "requests_per_model": self.metrics["requests_per_model"].copy()
        }
    
    def get_loaded_models(self) -> List[str]:
        """Get list of currently loaded models"""
        return self.model_loader.registry.get_loaded_models()
