from fastapi import FastAPI
from fastapi.middleware.cors import (
    CORSMiddleware,
)

from app.api.router import api_router
from app.core.config import (
    Settings,
    get_settings,
)


def create_application() -> FastAPI:
    settings: Settings = get_settings()

    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=(
            f"{settings.api_prefix}/openapi.json"
        ),
        description=(
            "Backend API for the EdgeMind "
            "intelligent CDN simulator."
        ),
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=(
            settings.cors_origin_list
        ),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(
        api_router,
        prefix=settings.api_prefix,
    )

    @application.get(
        "/",
        tags=["Root"],
        summary="Read API information",
    )
    async def read_root() -> dict[str, str]:
        return {
            "service": settings.app_name,
            "version": settings.app_version,
            "environment": (
                settings.environment
            ),
            "health": (
                f"{settings.api_prefix}/health"
            ),
            "docs": "/docs",
        }

    return application


app = create_application()
