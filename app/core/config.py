from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "AI Inference Backend"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Model settings
    default_model: str = "summarizer"
    model_cache_dir: str = "./models_cache"
    
    # Performance settings
    max_batch_size: int = 8
    batch_timeout_ms: int = 100
    
    class Config:
        env_file = ".env"


settings = Settings()
