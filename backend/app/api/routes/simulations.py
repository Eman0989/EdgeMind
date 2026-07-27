from datetime import (
    datetime,
    timezone,
)
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.exc import (
    SQLAlchemyError,
)
from sqlalchemy.orm import Session

from app.api.dependencies import (
    CurrentUser,
)
from app.db.session import get_db
from app.models.route import Route
from app.models.simulation import (
    Simulation,
)
from app.schemas.simulation import (
    CompletedSimulationResponse,
    RunSimulationRequest,
    SimulationResultSchema,
)
from app.services.simulation_engine import (
    calculate_simulation,
    format_route,
)

router = APIRouter(
    prefix="/simulations",
    tags=["Simulations"],
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


@router.post(
    "",
    response_model=(
        CompletedSimulationResponse
    ),
    response_model_by_alias=True,
    status_code=(
        status.HTTP_201_CREATED
    ),
    summary="Run a CDN simulation",
)
def run_simulation(
    payload: RunSimulationRequest,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> CompletedSimulationResponse:
    config = payload.config

    calculation = calculate_simulation(
        config
    )

    completed_at = datetime.now(
        timezone.utc
    )

    simulation = Simulation(
        user_id=current_user.id,
        name=config.name,
        status="completed",
        origin=config.origin,
        audience=config.audience,
        content_type=(
            config.content_type
        ),
        traffic_profile=(
            config.traffic_profile
        ),
        optimization_goal=(
            config.optimization_goal
        ),
        requests_per_second=(
            config.requests_per_second
        ),
        payload_size_kb=(
            config.payload_size_kb
        ),
        cache_ttl_seconds=(
            config.cache_ttl_seconds
        ),
        warm_cache=config.warm_cache,
        failover=config.failover,
        ai_routing=config.ai_routing,
        result_data={},
        completed_at=completed_at,
    )

    database.add(simulation)

    try:
        database.flush()

        public_id = (
            f"SIM-{simulation.id:06d}"
        )

        selected_route_text = (
            format_route(
                calculation.selected_route
            )
        )

        alternative_route_text = (
            format_route(
                calculation
                .alternative_route
            )
        )

        simulation.result_data = {
            "id": public_id,
            "route": selected_route_text,
            "selected_route": (
                calculation.selected_route
            ),
            "alternative_route": (
                calculation
                .alternative_route
            ),
            "latency_ms": (
                calculation
                .selected_latency_ms
            ),
            "alternative_latency_ms": (
                calculation
                .alternative_latency_ms
            ),
            "cache_hit_rate": (
                calculation.cache_hit_rate
            ),
            "origin_requests": (
                calculation.origin_requests
            ),
            "bandwidth_saved_gb": (
                calculation
                .bandwidth_saved_gb
            ),
            "confidence": (
                calculation.confidence
            ),
        }

        selected_route = Route(
            simulation_id=simulation.id,
            route_type="selected",
            path=(
                calculation.selected_route
            ),
            latency_ms=(
                calculation
                .selected_latency_ms
            ),
            cache_hit_rate=(
                calculation.cache_hit_rate
            ),
            confidence=float(
                calculation.confidence
            ),
            is_selected=True,
        )

        alternative_route = Route(
            simulation_id=simulation.id,
            route_type="alternative",
            path=(
                calculation
                .alternative_route
            ),
            latency_ms=(
                calculation
                .alternative_latency_ms
            ),
            cache_hit_rate=max(
                0.0,
                round(
                    calculation
                    .cache_hit_rate
                    - 3.0,
                    1,
                ),
            ),
            confidence=float(
                max(
                    0,
                    calculation.confidence
                    - 8,
                )
            ),
            is_selected=False,
        )

        database.add_all(
            [
                selected_route,
                alternative_route,
            ]
        )

        database.commit()
        database.refresh(simulation)

    except SQLAlchemyError:
        database.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "The simulation could "
                "not be saved."
            ),
        ) from None

    return CompletedSimulationResponse(
        config=config,
        result=SimulationResultSchema(
            id=public_id,
            route=selected_route_text,
            latency_ms=(
                calculation
                .selected_latency_ms
            ),
            cache_hit_rate=(
                calculation.cache_hit_rate
            ),
            origin_requests=(
                calculation.origin_requests
            ),
            bandwidth_saved_gb=(
                calculation
                .bandwidth_saved_gb
            ),
            confidence=(
                calculation.confidence
            ),
        ),
        completed_at=completed_at,
    )
