from dataclasses import dataclass
from math import log10

from app.schemas.simulation import (
    AudienceRegion,
    ContentType,
    OptimizationGoal,
    OriginRegion,
    SimulationConfigSchema,
    TrafficProfile,
)


@dataclass(
    frozen=True,
    slots=True,
)
class SimulationCalculation:
    selected_route: list[str]
    alternative_route: list[str]

    selected_latency_ms: int
    alternative_latency_ms: int

    cache_hit_rate: float
    origin_requests: int
    bandwidth_saved_gb: float
    confidence: int


ROUTES: dict[
    AudienceRegion,
    dict[
        OriginRegion,
        list[str],
    ],
] = {
    "europe": {
        "warsaw": [
            "WAW",
            "FRA",
            "LON",
        ],
        "frankfurt": [
            "FRA",
            "AMS",
            "LON",
        ],
        "virginia": [
            "IAD",
            "NYC",
            "LON",
        ],
        "singapore": [
            "SIN",
            "DXB",
            "FRA",
        ],
        "sydney": [
            "SYD",
            "SIN",
            "FRA",
        ],
    },
    "north-america": {
        "warsaw": [
            "WAW",
            "FRA",
            "NYC",
        ],
        "frankfurt": [
            "FRA",
            "LON",
            "NYC",
        ],
        "virginia": [
            "IAD",
            "NYC",
            "SFO",
        ],
        "singapore": [
            "SIN",
            "TYO",
            "SFO",
        ],
        "sydney": [
            "SYD",
            "HNL",
            "SFO",
        ],
    },
    "asia-pacific": {
        "warsaw": [
            "WAW",
            "FRA",
            "SIN",
        ],
        "frankfurt": [
            "FRA",
            "DXB",
            "SIN",
        ],
        "virginia": [
            "IAD",
            "SFO",
            "TYO",
        ],
        "singapore": [
            "SIN",
            "HKG",
            "TYO",
        ],
        "sydney": [
            "SYD",
            "SIN",
            "TYO",
        ],
    },
    "global": {
        "warsaw": [
            "WAW",
            "FRA",
            "GLOBAL",
        ],
        "frankfurt": [
            "FRA",
            "AMS",
            "GLOBAL",
        ],
        "virginia": [
            "IAD",
            "NYC",
            "GLOBAL",
        ],
        "singapore": [
            "SIN",
            "HKG",
            "GLOBAL",
        ],
        "sydney": [
            "SYD",
            "SIN",
            "GLOBAL",
        ],
    },
}


AUDIENCE_LATENCY: dict[
    AudienceRegion,
    int,
] = {
    "europe": 21,
    "north-america": 38,
    "asia-pacific": 54,
    "global": 46,
}


CONTENT_CACHE_BONUS: dict[
    ContentType,
    int,
] = {
    "web": 7,
    "api": -12,
    "video": 14,
    "downloads": 18,
}


TRAFFIC_PENALTY: dict[
    TrafficProfile,
    int,
] = {
    "steady": 0,
    "bursty": 5,
    "event": 9,
    "growth": 3,
}


OPTIMIZATION_LATENCY_BONUS: dict[
    OptimizationGoal,
    int,
] = {
    "balanced": 5,
    "latency": 10,
    "cache": 3,
    "resilience": 2,
}


ALTERNATIVE_MIDDLE_NODE: dict[
    str,
    str,
] = {
    "FRA": "AMS",
    "AMS": "LON",
    "LON": "AMS",
    "NYC": "IAD",
    "IAD": "NYC",
    "SFO": "SEA",
    "TYO": "HKG",
    "HKG": "TYO",
    "SIN": "DXB",
    "DXB": "SIN",
    "HNL": "SFO",
}


def clamp(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    return min(
        maximum,
        max(minimum, value),
    )


def create_alternative_route(
    selected_route: list[str],
) -> list[str]:
    if len(selected_route) != 3:
        return selected_route.copy()

    origin_node = selected_route[0]
    middle_node = selected_route[1]
    destination_node = (
        selected_route[2]
    )

    alternative_middle = (
        ALTERNATIVE_MIDDLE_NODE.get(
            middle_node,
            "AMS",
        )
    )

    if alternative_middle in {
        origin_node,
        destination_node,
    }:
        alternative_middle = "FRA"

    return [
        origin_node,
        alternative_middle,
        destination_node,
    ]


def calculate_simulation(
    config: SimulationConfigSchema,
) -> SimulationCalculation:
    selected_route = ROUTES[
        config.audience
    ][config.origin].copy()

    alternative_route = (
        create_alternative_route(
            selected_route
        )
    )

    ttl_factor = (
        log10(
            max(
                config.cache_ttl_seconds,
                1,
            )
        )
        * 7
    )

    cache_hit_rate = clamp(
        54
        + ttl_factor
        + CONTENT_CACHE_BONUS[
            config.content_type
        ]
        + (
            9
            if config.warm_cache
            else 0
        )
        + (
            6
            if config.optimization_goal
            == "cache"
            else 0
        ),
        18,
        98.7,
    )

    selected_latency_ms = round(
        clamp(
            AUDIENCE_LATENCY[
                config.audience
            ]
            + TRAFFIC_PENALTY[
                config.traffic_profile
            ]
            - OPTIMIZATION_LATENCY_BONUS[
                config.optimization_goal
            ]
            - (
                4
                if config.ai_routing
                else 0
            ),
            7,
            120,
        )
    )

    alternative_penalty = (
        8
        if config.optimization_goal
        == "latency"
        else 6
    )

    if (
        config.traffic_profile
        == "event"
    ):
        alternative_penalty += 2

    alternative_latency_ms = (
        selected_latency_ms
        + alternative_penalty
    )

    origin_requests = max(
        1,
        round(
            config.requests_per_second
            * (
                1
                - cache_hit_rate
                / 100
            )
        ),
    )

    bandwidth_saved_gb = (
        config.requests_per_second
        * config.payload_size_kb
        * (
            cache_hit_rate
            / 100
        )
        * 3600
        / 1_000_000
    )

    confidence = round(
        clamp(
            76
            + (
                10
                if config.ai_routing
                else 0
            )
            + (
                5
                if config.failover
                else 0
            )
            + (
                3
                if config.warm_cache
                else 0
            ),
            70,
            98,
        )
    )

    return SimulationCalculation(
        selected_route=selected_route,
        alternative_route=(
            alternative_route
        ),
        selected_latency_ms=(
            selected_latency_ms
        ),
        alternative_latency_ms=(
            alternative_latency_ms
        ),
        cache_hit_rate=round(
            cache_hit_rate,
            1,
        ),
        origin_requests=origin_requests,
        bandwidth_saved_gb=round(
            bandwidth_saved_gb,
            1,
        ),
        confidence=confidence,
    )


def format_route(
    route: list[str],
) -> str:
    return " → ".join(route)
