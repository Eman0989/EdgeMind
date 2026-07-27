from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.orm import Session

from app.api.dependencies import (
    CurrentUser,
)
from app.db.session import get_db
from app.schemas.dashboard import (
    DashboardSnapshot,
)
from app.services.dashboard_service import (
    build_dashboard_snapshot,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


@router.get(
    "",
    response_model=DashboardSnapshot,
    response_model_by_alias=True,
    summary="Get dashboard snapshot",
)
def read_dashboard(
    current_user: CurrentUser,
    database: DatabaseSession,
) -> DashboardSnapshot:
    return build_dashboard_snapshot(
        database=database,
        user_id=current_user.id,
    )
