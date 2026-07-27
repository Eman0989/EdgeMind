from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.edge_node import EdgeNode


EDGE_NODE_DATA = [
    {
        "code": "WAW",
        "city": "Warsaw",
        "country": "Poland",
        "region": "Europe",
        "latitude": 52.2297,
        "longitude": 21.0122,
        "status": "healthy",
        "capacity_rps": 14000,
        "current_load_percent": 51.0,
        "base_latency_ms": 7,
    },
    {
        "code": "FRA",
        "city": "Frankfurt",
        "country": "Germany",
        "region": "Europe",
        "latitude": 50.1109,
        "longitude": 8.6821,
        "status": "healthy",
        "capacity_rps": 18000,
        "current_load_percent": 68.0,
        "base_latency_ms": 9,
    },
    {
        "code": "LON",
        "city": "London",
        "country": "United Kingdom",
        "region": "Europe",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "status": "healthy",
        "capacity_rps": 17000,
        "current_load_percent": 63.0,
        "base_latency_ms": 11,
    },
    {
        "code": "AMS",
        "city": "Amsterdam",
        "country": "Netherlands",
        "region": "Europe",
        "latitude": 52.3676,
        "longitude": 4.9041,
        "status": "healthy",
        "capacity_rps": 16000,
        "current_load_percent": 57.0,
        "base_latency_ms": 10,
    },
    {
        "code": "IAD",
        "city": "Ashburn",
        "country": "United States",
        "region": "North America",
        "latitude": 39.0438,
        "longitude": -77.4874,
        "status": "healthy",
        "capacity_rps": 19000,
        "current_load_percent": 66.0,
        "base_latency_ms": 36,
    },
    {
        "code": "NYC",
        "city": "New York",
        "country": "United States",
        "region": "North America",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "watch",
        "capacity_rps": 18000,
        "current_load_percent": 73.0,
        "base_latency_ms": 41,
    },
    {
        "code": "SFO",
        "city": "San Francisco",
        "country": "United States",
        "region": "North America",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "status": "healthy",
        "capacity_rps": 16500,
        "current_load_percent": 61.0,
        "base_latency_ms": 49,
    },
    {
        "code": "SIN",
        "city": "Singapore",
        "country": "Singapore",
        "region": "Asia Pacific",
        "latitude": 1.3521,
        "longitude": 103.8198,
        "status": "healthy",
        "capacity_rps": 17500,
        "current_load_percent": 59.0,
        "base_latency_ms": 54,
    },
    {
        "code": "HKG",
        "city": "Hong Kong",
        "country": "China",
        "region": "Asia Pacific",
        "latitude": 22.3193,
        "longitude": 114.1694,
        "status": "healthy",
        "capacity_rps": 15000,
        "current_load_percent": 48.0,
        "base_latency_ms": 57,
    },
    {
        "code": "TYO",
        "city": "Tokyo",
        "country": "Japan",
        "region": "Asia Pacific",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "status": "healthy",
        "capacity_rps": 17000,
        "current_load_percent": 55.0,
        "base_latency_ms": 59,
    },
    {
        "code": "SYD",
        "city": "Sydney",
        "country": "Australia",
        "region": "Asia Pacific",
        "latitude": -33.8688,
        "longitude": 151.2093,
        "status": "healthy",
        "capacity_rps": 13500,
        "current_load_percent": 46.0,
        "base_latency_ms": 68,
    },
    {
        "code": "DXB",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "region": "Middle East",
        "latitude": 25.2048,
        "longitude": 55.2708,
        "status": "healthy",
        "capacity_rps": 14500,
        "current_load_percent": 52.0,
        "base_latency_ms": 43,
    },
]


def seed_edge_nodes(
    database: Session,
) -> int:
    existing_codes = set(
        database.scalars(
            select(EdgeNode.code)
        ).all()
    )

    new_nodes = [
        EdgeNode(
            **node_data,
            is_active=True,
        )
        for node_data in EDGE_NODE_DATA
        if node_data["code"]
        not in existing_codes
    ]

    if not new_nodes:
        return 0

    database.add_all(new_nodes)
    database.commit()

    return len(new_nodes)
