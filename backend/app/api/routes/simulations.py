from datetime import (
    datetime,
    timezone,
)
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)
from sqlalchemy import (
    func,
    select,
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
    SimulationConfigSchema,
    SimulationHistoryItem,
    SimulationListResponse,
    SimulationRenameRequest,
    SimulationRenameResponse,
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


def public_simulation_id(
    simulation_id: int,
) -> str:
    return (
        f"SIM-{simulation_id:06d}"
    )


def parse_public_id(
    public_id: str,
) -> int:
    normalized = (
        public_id
        .strip()
        .upper()
    )

    if (
        not normalized.startswith(
            "SIM-"
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Simulation not found."
            ),
        )

    number_part = normalized[4:]

    if (
        not number_part.isdigit()
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Simulation not found."
            ),
        )

    return int(number_part)


def get_owned_simulation(
    database: Session,
    user_id: int,
    public_id: str,
) -> Simulation:
    simulation_id = parse_public_id(
        public_id
    )

    simulation = database.scalar(
        select(Simulation)
        .where(
            Simulation.id
            == simulation_id,
            Simulation.user_id
            == user_id,
        )
    )

    if simulation is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Simulation not found."
            ),
        )

    return simulation


def simulation_config(
    simulation: Simulation,
) -> SimulationConfigSchema:
    return SimulationConfigSchema(
        name=simulation.name,
        origin=simulation.origin,
        audience=simulation.audience,
        content_type=(
            simulation.content_type
        ),
        traffic_profile=(
            simulation.traffic_profile
        ),
        optimization_goal=(
            simulation.optimization_goal
        ),
        requests_per_second=(
            simulation.requests_per_second
        ),
        payload_size_kb=(
            simulation.payload_size_kb
        ),
        cache_ttl_seconds=(
            simulation.cache_ttl_seconds
        ),
        warm_cache=(
            simulation.warm_cache
        ),
        failover=(
            simulation.failover
        ),
        ai_routing=(
            simulation.ai_routing
        ),
    )


def simulation_result(
    simulation: Simulation,
) -> SimulationResultSchema:
    result_data = (
        simulation.result_data
        or {}
    )

    return SimulationResultSchema(
        id=str(
            result_data.get(
                "id",
                public_simulation_id(
                    simulation.id
                ),
            )
        ),
        route=str(
            result_data.get(
                "route",
                "",
            )
        ),
        latency_ms=int(
            result_data.get(
                "latency_ms",
                0,
            )
        ),
        cache_hit_rate=float(
            result_data.get(
                "cache_hit_rate",
                0,
            )
        ),
        origin_requests=int(
            result_data.get(
                "origin_requests",
                0,
            )
        ),
        bandwidth_saved_gb=float(
            result_data.get(
                "bandwidth_saved_gb",
                0,
            )
        ),
        confidence=int(
            result_data.get(
                "confidence",
                0,
            )
        ),
    )


def completed_simulation(
    simulation: Simulation,
) -> CompletedSimulationResponse:
    completed_at = (
        simulation.completed_at
        or simulation.created_at
        or datetime.now(
            timezone.utc
        )
    )

    return CompletedSimulationResponse(
        config=simulation_config(
            simulation
        ),
        result=simulation_result(
            simulation
        ),
        completed_at=completed_at,
    )


def history_item(
    simulation: Simulation,
) -> SimulationHistoryItem:
    result = simulation_result(
        simulation
    )

    created_at = (
        simulation.created_at
        or simulation.completed_at
        or datetime.now(
            timezone.utc
        )
    )

    return SimulationHistoryItem(
        id=result.id,
        name=simulation.name,
        status=simulation.status,
        route=result.route,
        latency_ms=result.latency_ms,
        cache_hit_rate=(
            result.cache_hit_rate
        ),
        confidence=(
            result.confidence
        ),
        created_at=created_at,
        completed_at=(
            simulation.completed_at
        ),
    )


@router.get(
    "",
    response_model=(
        SimulationListResponse
    ),
    response_model_by_alias=True,
    summary="List simulation history",
)
def list_simulations(
    current_user: CurrentUser,
    database: DatabaseSession,
    page: Annotated[
        int,
        Query(
            ge=1,
        ),
    ] = 1,
    page_size: Annotated[
        int,
        Query(
            alias="pageSize",
            ge=1,
            le=100,
        ),
    ] = 10,
) -> SimulationListResponse:
    total = int(
        database.scalar(
            select(
                func.count(
                    Simulation.id
                )
            )
            .where(
                Simulation.user_id
                == current_user.id
            )
        )
        or 0
    )

    total_pages = (
        total + page_size - 1
    ) // page_size

    offset = (
        page - 1
    ) * page_size

    simulations = list(
        database.scalars(
            select(Simulation)
            .where(
                Simulation.user_id
                == current_user.id
            )
            .order_by(
                Simulation.id.desc()
            )
            .offset(offset)
            .limit(page_size)
        ).all()
    )

    return SimulationListResponse(
        simulations=[
            history_item(
                simulation
            )
            for simulation
            in simulations
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{simulation_public_id}",
    response_model=(
        CompletedSimulationResponse
    ),
    response_model_by_alias=True,
    summary="Get a simulation",
)
def get_simulation(
    simulation_public_id: str,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> CompletedSimulationResponse:
    simulation = get_owned_simulation(
        database=database,
        user_id=current_user.id,
        public_id=(
            simulation_public_id
        ),
    )

    return completed_simulation(
        simulation
    )


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
            public_simulation_id(
                simulation.id
            )
        )

        selected_route_text = (
            format_route(
                calculation.selected_route
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
        database.refresh(
            simulation
        )

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

    return completed_simulation(
        simulation
    )


@router.patch(
    "/{simulation_public_id}",
    response_model=(
        SimulationRenameResponse
    ),
    response_model_by_alias=True,
    summary="Rename a simulation",
)
def rename_simulation(
    simulation_public_id: str,
    payload: SimulationRenameRequest,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> SimulationRenameResponse:
    simulation = get_owned_simulation(
        database=database,
        user_id=current_user.id,
        public_id=(
            simulation_public_id
        ),
    )

    simulation.name = (
        payload.name.strip()
    )

    updated_at = datetime.now(
        timezone.utc
    )

    try:
        database.commit()
        database.refresh(
            simulation
        )

    except SQLAlchemyError:
        database.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "The simulation could "
                "not be renamed."
            ),
        ) from None

    return SimulationRenameResponse(
        id=public_simulation_id(
            simulation.id
        ),
        name=simulation.name,
        updated_at=updated_at,
    )


@router.delete(
    "/{simulation_public_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
    summary="Delete a simulation",
)
def delete_simulation(
    simulation_public_id: str,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> Response:
    simulation = get_owned_simulation(
        database=database,
        user_id=current_user.id,
        public_id=(
            simulation_public_id
        ),
    )

    try:
        database.delete(
            simulation
        )
        database.commit()

    except SQLAlchemyError:
        database.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "The simulation could "
                "not be deleted."
            ),
        ) from None

    return Response(
        status_code=(
            status.HTTP_204_NO_CONTENT
        )
    )
