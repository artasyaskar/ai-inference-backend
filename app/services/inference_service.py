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
            self.logger.info("Checking if model is loaded", model=model_name, version=version)
            if not self.model_loader.is_model_loaded(model_name, version):
                self.logger.info("Model not loaded, loading now", model=model_name, version=version)
                success = await self.model_loader.load_model(model_name, version)
                self.logger.info("Model loading result", model=model_name, version=version, success=success)
                if not success:
                    raise ValueError(f"Failed to load model {model_name}:{version}")
            
            # Get the model pipeline
            model_pipeline = self.model_loader.get_model(model_name, version)
            if not model_pipeline:
                raise ValueError(f"Model {model_name}:{version} not available")
            
            # Get model info for parameters
            model_info = model_registry.get_model(model_name, version)
            model_params = model_info.parameters.copy()
            model_params.update(request.parameters or {})
            
            self.logger.info("Running inference", model=model_name, text_length=len(request.text), params=model_params)
            
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
            # Text generation - automatically create detailed content
            try:
                # Create a better prompt for content generation
                if len(text.strip()) < 3:
                    prompt = f"Write a comprehensive, detailed, and extensive article about the topic: {text}. Include multiple aspects, examples, and thorough explanations. Make it very informative and lengthy."
                else:
                    prompt = f"Write a comprehensive, detailed, and extensive article about: {text}. Include multiple aspects, examples, and thorough explanations. Make it very informative and lengthy."
                
                result = model_pipeline(
                    prompt,
                    max_length=400,
                    temperature=0.8,
                    do_sample=True,
                    min_length=150,
                    pad_token_id=model_pipeline.tokenizer.eos_token_id
                )
                
                self.logger.info("Generation result received", result=result)
                
                if result and len(result) > 0:
                    generated_text = result[0]['generated_text']
                    
                    # Clean up the generated text
                    generated_text = generated_text.strip()
                    
                    # Ensure we're not just echoing input
                    if len(generated_text) > len(text) * 2:  # Ensure it's substantially longer than input
                        return generated_text
                    else:
                        return "Generation failed - please try a different topic"
                else:
                    self.logger.error("Empty generation result", result=result)
                    return "Generation failed - no result returned"
            except Exception as e:
                self.logger.error("Generation pipeline error", error=str(e))
                return f"Generation failed: {str(e)}"
        
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
