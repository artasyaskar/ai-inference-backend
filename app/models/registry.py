from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import uuid


class ModelType(Enum):
    SUMMARIZER = "summarizer"
    CLASSIFIER = "classifier"
    GENERATOR = "generator"


@dataclass
class ModelInfo:
    name: str
    version: str
    model_type: ModelType
    description: str
    huggingface_model: str
    parameters: Dict[str, Any]
    is_loaded: bool = False
    load_time: Optional[float] = None


class ModelRegistry:
    def __init__(self):
        self._models: Dict[str, ModelInfo] = {}
        self._register_default_models()
    
    def _register_default_models(self):
        """Register default models available in the system"""
        
        # Simple summarizer model
        self.register_model(
            name="summarizer",
            version="v1",
            model_type=ModelType.SUMMARIZER,
            description="Lightweight text summarization model",
            huggingface_model="facebook/bart-large-cnn",
            parameters={"max_length": 150, "min_length": 30}
        )
        
        # Simple sentiment classifier
        self.register_model(
            name="sentiment",
            version="v1",
            model_type=ModelType.CLASSIFIER,
            description="Sentiment analysis classifier",
            huggingface_model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            parameters={}
        )
        
        # Text generator
        self.register_model(
            name="generator",
            version="v1",
            model_type=ModelType.GENERATOR,
            description="Lightweight text generation model",
            huggingface_model="gpt2",
            parameters={"max_length": 100, "num_return_sequences": 1}
        )
    
    def register_model(self, name: str, version: str, model_type: ModelType, 
                      description: str, huggingface_model: str, parameters: Dict[str, Any]):
        """Register a new model in the registry"""
        model_key = f"{name}:{version}"
        model_info = ModelInfo(
            name=name,
            version=version,
            model_type=model_type,
            description=description,
            huggingface_model=huggingface_model,
            parameters=parameters
        )
        self._models[model_key] = model_info
    
    def get_model(self, name: str, version: str = "v1") -> Optional[ModelInfo]:
        """Get model info by name and version"""
        model_key = f"{name}:{version}"
        return self._models.get(model_key)
    
    def list_models(self) -> List[ModelInfo]:
        """List all registered models"""
        return list(self._models.values())
    
    def get_loaded_models(self) -> List[str]:
        """Get list of currently loaded model keys"""
        return [key for key, model in self._models.items() if model.is_loaded]
    
    def mark_as_loaded(self, name: str, version: str, load_time: float):
        """Mark a model as loaded"""
        model_key = f"{name}:{version}"
        if model_key in self._models:
            self._models[model_key].is_loaded = True
            self._models[model_key].load_time = load_time
    
    def mark_as_unloaded(self, name: str, version: str):
        """Mark a model as unloaded"""
        model_key = f"{name}:{version}"
        if model_key in self._models:
            self._models[model_key].is_loaded = False
            self._models[model_key].load_time = None


# Global registry instance
model_registry = ModelRegistry()
