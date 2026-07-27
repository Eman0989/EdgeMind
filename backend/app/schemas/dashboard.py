from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
)
from pydantic.alias_generators import (
    to_camel,
)


class DashboardModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


DashboardMetricTone = Literal[
    "green",
    "cyan",
    "violet",
    "orange",
]


class DashboardMetric(
    DashboardModel
):
    key: str
    label: str
    value: float
    unit: str
    change_percent: float
    detail: str
    tone: DashboardMetricTone


EdgeNodeStatus = Literal[
    "healthy",
    "watch",
    "offline",
]


class DashboardEdgeNode(
    DashboardModel
):
    id: str
    code: str
    city: str
    region: str
    latitude: float
    longitude: float
    latency_ms: int
    load_percent: float
    cache_hit_rate: float
    requests_per_second: int
    status: EdgeNodeStatus


class DashboardRouteDecision(
    DashboardModel
):
    selected_route: list[str]
    alternative_route: list[str]
    selected_latency_ms: int
    alternative_latency_ms: int
    confidence: int
    reason: str


ActivitySeverity = Literal[
    "info",
    "success",
    "warning",
    "error",
]


class DashboardActivity(
    DashboardModel
):
    id: str
    occurred_at: datetime
    title: str
    detail: str
    severity: ActivitySeverity


class DashboardSnapshot(
    DashboardModel
):
    generated_at: datetime

    request_rate_per_second: int
    global_latency_ms: int
    cache_hit_rate: float

    healthy_nodes: int
    total_nodes: int

    origin_health_percent: float
    bandwidth_saved_gb: float
    error_rate_percent: float
    failover_time_ms: int

    metrics: list[DashboardMetric]
    nodes: list[DashboardEdgeNode]

    route_decision: (
        DashboardRouteDecision
    )

    activity: list[
        DashboardActivity
    ]
