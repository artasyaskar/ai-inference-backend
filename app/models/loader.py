import time
import asyncio
from typing import Optional, Dict, Any
from transformers import (
    AutoTokenizer, 
    AutoModel, 
    AutoModelForSequenceClassification, 
    AutoModelForSeq2SeqLM,
    AutoModelForCausalLM,
    pipeline
)
import torch

from .registry import ModelRegistry, ModelInfo, ModelType
from ..core.logging import StructuredLogger


class ModelLoader:
    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self.loaded_models: Dict[str, Any] = {}
        self.logger = StructuredLogger("model_loader")
    
    async def load_model(self, name: str, version: str = "v1") -> bool:
        """Load a model asynchronously"""
        model_info = self.registry.get_model(name, version)
        if not model_info:
            self.logger.error("Model not found in registry", model=name, version=version)
            return False
        
        model_key = f"{name}:{version}"
        
        # Check if already loaded
        if model_key in self.loaded_models:
            self.logger.info("Model already loaded", model=model_key)
            return True
        
        try:
            start_time = time.time()
            
            # Load model based on type
            if model_info.model_type == ModelType.CLASSIFIER:
                pipeline_obj = await self._load_classifier(model_info)
            elif model_info.model_type == ModelType.SUMMARIZER:
                pipeline_obj = await self._load_summarizer(model_info)
            elif model_info.model_type == ModelType.GENERATOR:
                pipeline_obj = await self._load_generator(model_info)
            else:
                raise ValueError(f"Unsupported model type: {model_info.model_type}")
            
            load_time = time.time() - start_time
            self.loaded_models[model_key] = pipeline_obj
            self.registry.mark_as_loaded(name, version, load_time)
            
            self.logger.info(
                "Model loaded successfully",
                model=model_key,
                load_time_ms=round(load_time * 1000, 2)
            )
            
            return True
            
        except Exception as e:
            self.logger.error(
                "Failed to load model",
                model=model_key,
                error=str(e)
            )
            return False
    
    async def _load_classifier(self, model_info: ModelInfo):
        """Load a classification model"""
        tokenizer = AutoTokenizer.from_pretrained(model_info.huggingface_model)
        model = AutoModelForSequenceClassification.from_pretrained(model_info.huggingface_model)
        
        return pipeline(
            "text-classification",
            model=model,
            tokenizer=tokenizer,
            device=0 if torch.cuda.is_available() else -1
        )
    
    async def _load_summarizer(self, model_info: ModelInfo):
        """Load a summarization model"""
        tokenizer = AutoTokenizer.from_pretrained(model_info.huggingface_model)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_info.huggingface_model)
        
        return pipeline(
            "summarization",
            model=model,
            tokenizer=tokenizer,
            device=0 if torch.cuda.is_available() else -1
        )
    
    async def _load_generator(self, model_info: ModelInfo):
        """Load a text generation model"""
        try:
            self.logger.info("Loading generator model", model=model_info.huggingface_model)
            tokenizer = AutoTokenizer.from_pretrained(model_info.huggingface_model)
            model = AutoModelForCausalLM.from_pretrained(model_info.huggingface_model)
            
            # Add pad token if it doesn't exist
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            
            pipeline_obj = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                device=0 if torch.cuda.is_available() else -1
            )
            
            self.logger.info("Generator model loaded successfully", model=model_info.huggingface_model)
            return pipeline_obj
        except Exception as e:
            self.logger.error("Failed to load generator model", model=model_info.huggingface_model, error=str(e))
            raise
    
    async def load_generator_model(self, model_name: str, version: str) -> Any:
        """Load text generation model with tokenizer"""
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
            import torch
            
            model_info = self.registry.get_model(model_name, version)
            model_path = model_info.huggingface_model
            
            self.logger.info(f"Loading advanced generator model", model=model_path)
            
            # Load tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(model_path)
            
            # Set pad token if not present
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            
            model = AutoModelForCausalLM.from_pretrained(
                model_path,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None
            )
            
            # Create generation config for better output
            generation_config = GenerationConfig(
                max_new_tokens=400,
                temperature=0.8,
                do_sample=True,
                top_p=0.9,
                top_k=50,
                no_repeat_ngram_size=2,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id,
                early_stopping=True
            )
            
            # Create a simple pipeline wrapper
            class AdvancedGenerator:
                def __init__(self, model, tokenizer, generation_config):
                    self.model = model
                    self.tokenizer = tokenizer
                    self.generation_config = generation_config
                
                def __call__(self, prompt, **kwargs):
                    # Merge with generation config
                    config = self.generation_config
                    for key, value in kwargs.items():
                        setattr(config, key, value)
                    
                    # Tokenize input
                    inputs = self.tokenizer.encode(prompt, return_tensors="pt")
                    if self.model.device.type != 'cpu':
                        inputs = inputs.to(self.model.device)
                    
                    # Generate
                    with torch.no_grad():
                        outputs = self.model.generate(
                            inputs,
                            generation_config=config,
                            return_dict_in_generate=True,
                            output_scores=True
                        )
                    
                    # Decode
                    generated_text = self.tokenizer.decode(
                        outputs.sequences[0], 
                        skip_special_tokens=True
                    )
                    
                    # Remove input prompt from output
                    if generated_text.startswith(prompt):
                        generated_text = generated_text[len(prompt):].strip()
                    
                    return [{"generated_text": generated_text}]
            
            generator = AdvancedGenerator(model, tokenizer, generation_config)
            
            self.logger.info("Advanced generator model loaded successfully", model=model_path)
            return generator
            
        except Exception as e:
            self.logger.error("Failed to load generator model", error=str(e))
            raise
    
    def get_model(self, name: str, version: str = "v1"):
        """Get a loaded model pipeline"""
        model_key = f"{name}:{version}"
        return self.loaded_models.get(model_key)
    
    def is_model_loaded(self, name: str, version: str = "v1") -> bool:
        """Check if a model is loaded"""
        model_key = f"{name}:{version}"
        return model_key in self.loaded_models
    
    async def unload_model(self, name: str, version: str = "v1"):
        """Unload a model from memory"""
        model_key = f"{name}:{version}"
        if model_key in self.loaded_models:
            del self.loaded_models[model_key]
            self.registry.mark_as_unloaded(name, version)
            
            self.logger.info("Model unloaded", model=model_key)
    
    async def unload_all_models(self):
        """Unload all models"""
        for model_key in list(self.loaded_models.keys()):
            name, version = model_key.split(":")
            await self.unload_model(name, version)
