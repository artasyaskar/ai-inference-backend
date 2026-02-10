from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from .api import health, inference
from .core.config import settings
from .core.logging import StructuredLogger

# Initialize logger
logger = StructuredLogger("main")

# Global service instance
inference_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan event handlers"""
    # Startup
    logger.info(
        "AI Inference Backend starting up",
        app_name=settings.app_name,
        version=settings.app_version,
        debug=settings.debug
    )
    
    # Initialize inference service
    from .services.inference_service import InferenceService
    global inference_service
    inference_service = InferenceService()
    await inference_service.initialize()
    
    # Set the global service in health and inference modules
    health.inference_service = inference_service
    inference.inference_service = inference_service
    
    yield
    
    # Shutdown
    logger.info("AI Inference Backend shutting down")
    
    # Unload all models
    if inference_service:
        await inference_service.model_loader.unload_all_models()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Production-ready AI inference backend platform",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(inference.router, tags=["Inference"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Inference Backend Platform",
        "version": settings.app_version,
        "status": "running"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
