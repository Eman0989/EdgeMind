from datetime import (
    datetime,
    timezone,
)

from fastapi import APIRouter

from app.core.config import (
    Settings,
    get_settings,
)
from app.schemas.health import (
    HealthResponse,
)

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get(
    "",
    response_model=HealthResponse,
    summary="Check API health",
)
async def health_check() -> HealthResponse:
    settings: Settings = get_settings()

    return HealthResponse(
        status="healthy",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        timestamp=datetime.now(
            timezone.utc,
        ),
    )
