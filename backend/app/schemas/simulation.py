from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)
from pydantic.alias_generators import (
    to_camel,
)


class CamelCaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


OriginRegion = Literal[
    "warsaw",
    "frankfurt",
    "virginia",
    "singapore",
    "sydney",
]

AudienceRegion = Literal[
    "europe",
    "north-america",
    "asia-pacific",
    "global",
]

ContentType = Literal[
    "web",
    "api",
    "video",
    "downloads",
]

TrafficProfile = Literal[
    "steady",
    "bursty",
    "event",
    "growth",
]

OptimizationGoal = Literal[
    "balanced",
    "latency",
    "cache",
    "resilience",
]


class SimulationConfigSchema(
    CamelCaseModel
):
    name: str = Field(
        min_length=2,
        max_length=200,
    )

    origin: OriginRegion
    audience: AudienceRegion
    content_type: ContentType
    traffic_profile: TrafficProfile
    optimization_goal: OptimizationGoal

    requests_per_second: int = Field(
        ge=1,
        le=1_000_000,
    )

    payload_size_kb: int = Field(
        ge=1,
        le=1_000_000,
    )

    cache_ttl_seconds: int = Field(
        ge=0,
        le=31_536_000,
    )

    warm_cache: bool = True
    failover: bool = True
    ai_routing: bool = True


class RunSimulationRequest(
    CamelCaseModel
):
    config: SimulationConfigSchema


class SimulationResultSchema(
    CamelCaseModel
):
    id: str
    route: str

    latency_ms: int = Field(
        ge=0,
    )

    cache_hit_rate: float = Field(
        ge=0,
        le=100,
    )

    origin_requests: int = Field(
        ge=0,
    )

    bandwidth_saved_gb: float = Field(
        ge=0,
    )

    confidence: int = Field(
        ge=0,
        le=100,
    )


class CompletedSimulationResponse(
    CamelCaseModel
):
    config: SimulationConfigSchema
    result: SimulationResultSchema
    completed_at: datetime


class SimulationHistoryItem(
    CamelCaseModel
):
    id: str
    name: str
    status: str
    route: str

    latency_ms: int = Field(
        ge=0,
    )

    cache_hit_rate: float = Field(
        ge=0,
        le=100,
    )

    confidence: int = Field(
        ge=0,
        le=100,
    )

    created_at: datetime
    completed_at: datetime | None


class SimulationListResponse(
    CamelCaseModel
):
    simulations: list[
        SimulationHistoryItem
    ]

    total: int = Field(
        ge=0,
    )

    page: int = Field(
        ge=1,
    )

    page_size: int = Field(
        ge=1,
    )

    total_pages: int = Field(
        ge=0,
    )


class SimulationRenameRequest(
    CamelCaseModel
):
    name: str = Field(
        min_length=2,
        max_length=200,
    )


class SimulationRenameResponse(
    CamelCaseModel
):
    id: str
    name: str
    updated_at: datetime
