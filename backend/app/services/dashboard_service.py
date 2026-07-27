from datetime import (
    datetime,
    timezone,
)
from typing import Literal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.edge_node import EdgeNode
from app.models.route import Route
from app.models.simulation import (
    Simulation,
)
from app.schemas.dashboard import (
    DashboardActivity,
    DashboardEdgeNode,
    DashboardMetric,
    DashboardRouteDecision,
    DashboardSnapshot,
)


NodeStatus = Literal[
    "healthy",
    "watch",
    "offline",
]


def clamp(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    return min(
        maximum,
        max(minimum, value),
    )


def number_value(
    value: object,
    default: float = 0.0,
) -> float:
    if isinstance(
        value,
        (int, float),
    ) and not isinstance(value, bool):
        return float(value)

    return default


def integer_value(
    value: object,
    default: int = 0,
) -> int:
    return round(
        number_value(
            value,
            float(default),
        )
    )


def string_list(
    value: object,
) -> list[str]:
    if not isinstance(value, list):
        return []

    return [
        item
        for item in value
        if isinstance(item, str)
    ]


def percentage_change(
    current: float,
    previous: float,
) -> float:
    if previous == 0:
        return 0.0

    return round(
        (
            (current - previous)
            / previous
        )
        * 100,
        1,
    )


def normalize_node_status(
    status: str,
) -> NodeStatus:
    if status == "offline":
        return "offline"

    if status == "watch":
        return "watch"

    return "healthy"


def simulation_result_value(
    simulation: Simulation | None,
    key: str,
    default: float = 0.0,
) -> float:
    if simulation is None:
        return default

    return number_value(
        simulation.result_data.get(
            key
        ),
        default,
    )


def create_dashboard_nodes(
    nodes: list[EdgeNode],
) -> list[DashboardEdgeNode]:
    dashboard_nodes: list[
        DashboardEdgeNode
    ] = []

    for node in nodes:
        status = normalize_node_status(
            node.status
        )

        requests_per_second = round(
            node.capacity_rps
            * (
                node.current_load_percent
                / 100
            )
        )

        cache_hit_rate = clamp(
            93.5
            + (
                100
                - node.current_load_percent
            )
            * 0.035
            - (
                2.5
                if status == "watch"
                else 0
            )
            - (
                12
                if status == "offline"
                else 0
            ),
            0,
            99.5,
        )

        dashboard_nodes.append(
            DashboardEdgeNode(
                id=f"node-{node.id}",
                code=node.code,
                city=node.city,
                region=node.region,
                latitude=node.latitude,
                longitude=node.longitude,
                latency_ms=(
                    node.base_latency_ms
                    + round(
                        node
                        .current_load_percent
                        / 30
                    )
                ),
                load_percent=(
                    node
                    .current_load_percent
                ),
                cache_hit_rate=round(
                    cache_hit_rate,
                    1,
                ),
                requests_per_second=(
                    requests_per_second
                ),
                status=status,
            )
        )

    return dashboard_nodes


def create_route_decision(
    latest_simulation:
        Simulation | None,
    routes: list[Route],
) -> DashboardRouteDecision:
    if latest_simulation is None:
        return DashboardRouteDecision(
            selected_route=[],
            alternative_route=[],
            selected_latency_ms=0,
            alternative_latency_ms=0,
            confidence=0,
            reason=(
                "Run a simulation to "
                "generate a route decision."
            ),
        )

    selected_route = next(
        (
            route
            for route in routes
            if route.is_selected
        ),
        None,
    )

    alternative_route = next(
        (
            route
            for route in routes
            if not route.is_selected
        ),
        None,
    )

    result_data = (
        latest_simulation.result_data
    )

    selected_path = (
        selected_route.path
        if selected_route
        else string_list(
            result_data.get(
                "selected_route"
            )
        )
    )

    alternative_path = (
        alternative_route.path
        if alternative_route
        else string_list(
            result_data.get(
                "alternative_route"
            )
        )
    )

    selected_latency = (
        selected_route.latency_ms
        if selected_route
        else integer_value(
            result_data.get(
                "latency_ms"
            )
        )
    )

    alternative_latency = (
        alternative_route.latency_ms
        if alternative_route
        else integer_value(
            result_data.get(
                "alternative_latency_ms"
            )
        )
    )

    confidence = (
        round(
            selected_route.confidence
        )
        if (
            selected_route
            and selected_route.confidence
            is not None
        )
        else integer_value(
            result_data.get(
                "confidence"
            )
        )
    )

    goal_reasons = {
        "balanced": (
            "Balanced latency, cache "
            "efficiency, and resilience."
        ),
        "latency": (
            "Lowest predicted latency "
            "for the target audience."
        ),
        "cache": (
            "Highest predicted edge-cache "
            "efficiency."
        ),
        "resilience": (
            "Strongest fallback capacity "
            "and route stability."
        ),
    }

    return DashboardRouteDecision(
        selected_route=selected_path,
        alternative_route=(
            alternative_path
        ),
        selected_latency_ms=(
            selected_latency
        ),
        alternative_latency_ms=(
            alternative_latency
        ),
        confidence=confidence,
        reason=goal_reasons.get(
            latest_simulation
            .optimization_goal,
            (
                "Best available route "
                "for the configuration."
            ),
        ),
    )


def create_activity(
    simulations: list[Simulation],
) -> list[DashboardActivity]:
    activity: list[
        DashboardActivity
    ] = []

    for simulation in simulations[:6]:
        route_value = (
            simulation.result_data.get(
                "route"
            )
        )

        route_text = (
            route_value
            if isinstance(
                route_value,
                str,
            )
            else "Route calculated"
        )

        occurred_at = (
            simulation.completed_at
            or simulation.created_at
            or datetime.now(
                timezone.utc
            )
        )

        activity.append(
            DashboardActivity(
                id=(
                    f"simulation-"
                    f"{simulation.id}"
                ),
                occurred_at=occurred_at,
                title=(
                    "Simulation completed"
                ),
                detail=(
                    f"{simulation.name} · "
                    f"{route_text}"
                ),
                severity="success",
            )
        )

    return activity


def build_dashboard_snapshot(
    database: Session,
    user_id: int,
) -> DashboardSnapshot:
    simulations = list(
        database.scalars(
            select(Simulation)
            .where(
                Simulation.user_id
                == user_id
            )
            .order_by(
                Simulation.id.desc()
            )
            .limit(8)
        ).all()
    )

    latest_simulation = (
        simulations[0]
        if simulations
        else None
    )

    previous_simulation = (
        simulations[1]
        if len(simulations) > 1
        else None
    )

    nodes = list(
        database.scalars(
            select(EdgeNode)
            .where(
                EdgeNode.is_active
                .is_(True)
            )
            .order_by(
                EdgeNode.code
            )
        ).all()
    )

    routes: list[Route] = []

    if latest_simulation:
        routes = list(
            database.scalars(
                select(Route)
                .where(
                    Route.simulation_id
                    == latest_simulation.id
                )
                .order_by(
                    Route.is_selected
                    .desc()
                )
            ).all()
        )

    request_rate = (
        latest_simulation
        .requests_per_second
        if latest_simulation
        else 0
    )

    previous_request_rate = (
        previous_simulation
        .requests_per_second
        if previous_simulation
        else 0
    )

    global_latency = round(
        simulation_result_value(
            latest_simulation,
            "latency_ms",
        )
    )

    previous_latency = (
        simulation_result_value(
            previous_simulation,
            "latency_ms",
        )
    )

    cache_hit_rate = round(
        simulation_result_value(
            latest_simulation,
            "cache_hit_rate",
        ),
        1,
    )

    previous_cache_hit_rate = (
        simulation_result_value(
            previous_simulation,
            "cache_hit_rate",
        )
    )

    bandwidth_saved = round(
        simulation_result_value(
            latest_simulation,
            "bandwidth_saved_gb",
        ),
        1,
    )

    healthy_nodes = sum(
        1
        for node in nodes
        if node.status == "healthy"
    )

    watch_nodes = sum(
        1
        for node in nodes
        if node.status == "watch"
    )

    offline_nodes = sum(
        1
        for node in nodes
        if node.status == "offline"
    )

    total_nodes = len(nodes)

    origin_health = round(
        clamp(
            100
            - watch_nodes * 0.4
            - offline_nodes * 5,
            0,
            100,
        ),
        1,
    )

    error_rate = round(
        clamp(
            0.03
            + watch_nodes * 0.02
            + offline_nodes * 0.5,
            0,
            100,
        ),
        2,
    )

    failover_time = (
        280
        if (
            latest_simulation
            and latest_simulation.failover
        )
        else 0
    )

    metrics = [
        DashboardMetric(
            key="requests",
            label="Request rate",
            value=request_rate,
            unit="requests/s",
            change_percent=(
                percentage_change(
                    request_rate,
                    previous_request_rate,
                )
            ),
            detail=(
                "Latest simulation traffic"
            ),
            tone="green",
        ),
        DashboardMetric(
            key="latency",
            label="Global latency",
            value=global_latency,
            unit="ms",
            change_percent=(
                percentage_change(
                    global_latency,
                    previous_latency,
                )
            ),
            detail=(
                "Selected route latency"
            ),
            tone="cyan",
        ),
        DashboardMetric(
            key="cache",
            label="Cache hit rate",
            value=cache_hit_rate,
            unit="%",
            change_percent=(
                percentage_change(
                    cache_hit_rate,
                    previous_cache_hit_rate,
                )
            ),
            detail=(
                "Latest cache prediction"
            ),
            tone="violet",
        ),
        DashboardMetric(
            key="nodes",
            label="Healthy nodes",
            value=healthy_nodes,
            unit="nodes",
            change_percent=0,
            detail=(
                f"{healthy_nodes} of "
                f"{total_nodes} operational"
            ),
            tone="orange",
        ),
    ]

    return DashboardSnapshot(
        generated_at=datetime.now(
            timezone.utc
        ),
        request_rate_per_second=(
            request_rate
        ),
        global_latency_ms=(
            global_latency
        ),
        cache_hit_rate=(
            cache_hit_rate
        ),
        healthy_nodes=healthy_nodes,
        total_nodes=total_nodes,
        origin_health_percent=(
            origin_health
        ),
        bandwidth_saved_gb=(
            bandwidth_saved
        ),
        error_rate_percent=(
            error_rate
        ),
        failover_time_ms=(
            failover_time
        ),
        metrics=metrics,
        nodes=create_dashboard_nodes(
            nodes
        ),
        route_decision=(
            create_route_decision(
                latest_simulation,
                routes,
            )
        ),
        activity=create_activity(
            simulations
        ),
    )
