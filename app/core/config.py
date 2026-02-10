from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    model_config = {"protected_namespaces": ("settings_",)}
    
    app_name: str = "AI Inference Backend"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = 8000
    
    # Model settings
    default_model: str = "summarizer"
    model_cache_dir: str = "./models_cache"
    
    # Performance settings
    max_batch_size: int = 8
    batch_timeout_ms: int = 100


settings = Settings()
