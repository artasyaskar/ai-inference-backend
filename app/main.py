from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .api import health, inference
from .core.config import settings
from .core.logging import StructuredLogger

# Initialize logger
logger = StructuredLogger("main")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Production-ready AI inference backend platform",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
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

@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info(
        "AI Inference Backend starting up",
        app_name=settings.app_name,
        version=settings.app_version,
        debug=settings.debug
    )

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("AI Inference Backend shutting down")
    
    # Unload all models
    from .services.inference_service import inference_service
    if inference_service:
        await inference_service.model_loader.unload_all_models()

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
