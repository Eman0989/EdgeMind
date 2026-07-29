from fastapi.testclient import (
    TestClient,
)

import pytest


TEST_EMAIL = (
    "dashboard@edgemind.dev"
)

TEST_PASSWORD = (
    "SecureTest123!"
)


def register_and_login(
    client: TestClient,
) -> str:
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL,
            "full_name":
                "Dashboard Tester",
            "password":
                TEST_PASSWORD,
        },
    )

    assert (
        register_response.status_code
        == 201
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": TEST_EMAIL,
            "password":
                TEST_PASSWORD,
        },
    )

    assert (
        login_response.status_code
        == 200
    )

    return login_response.json()[
        "access_token"
    ]


def auth_headers(
    token: str,
) -> dict[str, str]:
    return {
        "Authorization":
            f"Bearer {token}",
    }


def simulation_payload() -> dict[
    str,
    object,
]:
    return {
        "config": {
            "name":
                "Dashboard Simulation",
            "origin": "frankfurt",
            "audience": "europe",
            "contentType": "api",
            "trafficProfile":
                "steady",
            "optimizationGoal":
                "balanced",
            "requestsPerSecond":
                1000,
            "payloadSizeKb": 32,
            "cacheTtlSeconds":
                300,
            "warmCache": True,
            "failover": True,
            "aiRouting": True,
        },
    }


def test_dashboard_requires_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        "/api/dashboard"
    )

    assert response.status_code == 401

    assert response.json()[
        "detail"
    ] == (
        "Could not validate "
        "authentication credentials."
    )


def test_empty_dashboard_snapshot(
    client: TestClient,
) -> None:
    token = register_and_login(
        client
    )

    response = client.get(
        "/api/dashboard",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    snapshot = response.json()

    assert (
        snapshot[
            "requestRatePerSecond"
        ]
        == 0
    )

    assert (
        snapshot["globalLatencyMs"]
        == 0
    )

    assert (
        snapshot["cacheHitRate"]
        == 0
    )

    assert (
        snapshot["bandwidthSavedGb"]
        == 0
    )

    assert isinstance(
        snapshot["metrics"],
        list,
    )

    assert isinstance(
        snapshot["nodes"],
        list,
    )

    assert snapshot["activity"] == []

    assert (
        snapshot["healthyNodes"]
        <= snapshot["totalNodes"]
    )

    assert snapshot[
        "generatedAt"
    ]


def test_dashboard_reflects_latest_simulation(
    client: TestClient,
) -> None:
    token = register_and_login(
        client
    )

    run_response = client.post(
        "/api/simulations",
        headers=auth_headers(token),
        json=simulation_payload(),
    )

    assert (
        run_response.status_code
        == 201
    )

    completed = run_response.json()

    response = client.get(
        "/api/dashboard",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    snapshot = response.json()
    result = completed["result"]

    assert (
        snapshot[
            "requestRatePerSecond"
        ]
        == 1000
    )

    assert (
        snapshot["globalLatencyMs"]
        == result["latencyMs"]
    )

    assert snapshot[
        "cacheHitRate"
    ] == pytest.approx(
        result["cacheHitRate"]
    )

    assert snapshot[
        "bandwidthSavedGb"
    ] == pytest.approx(
        result["bandwidthSavedGb"]
    )

    assert len(
        snapshot["activity"]
    ) == 1

    assert (
        "Dashboard Simulation"
        in snapshot["activity"][0][
            "detail"
        ]
    )

    assert (
        snapshot["activity"][0][
            "severity"
        ]
        == "success"
    )
