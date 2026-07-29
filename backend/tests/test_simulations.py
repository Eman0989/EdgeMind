from fastapi.testclient import (
    TestClient,
)


TEST_PASSWORD = "SecureTest123!"


def register_and_login(
    client: TestClient,
    email: str,
    full_name: str,
) -> str:
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "full_name": full_name,
            "password": TEST_PASSWORD,
        },
    )

    assert (
        register_response.status_code
        == 201
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": TEST_PASSWORD,
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


def simulation_payload(
    name: str,
) -> dict[str, object]:
    return {
        "config": {
            "name": name,
            "origin": "frankfurt",
            "audience": "europe",
            "contentType": "api",
            "trafficProfile": "steady",
            "optimizationGoal": (
                "balanced"
            ),
            "requestsPerSecond": 1000,
            "payloadSizeKb": 32,
            "cacheTtlSeconds": 300,
            "warmCache": True,
            "failover": True,
            "aiRouting": True,
        },
    }


def run_simulation(
    client: TestClient,
    token: str,
    name: str,
):
    return client.post(
        "/api/simulations",
        headers=auth_headers(token),
        json=simulation_payload(name),
    )


def test_run_and_open_simulation(
    client: TestClient,
) -> None:
    token = register_and_login(
        client,
        "owner@edgemind.dev",
        "Simulation Owner",
    )

    run_response = run_simulation(
        client,
        token,
        "European API Test",
    )

    assert (
        run_response.status_code
        == 201
    )

    completed = run_response.json()

    assert (
        completed["result"]["id"]
        == "SIM-000001"
    )

    assert (
        completed["result"]["route"]
        == "FRA → AMS → LON"
    )

    detail_response = client.get(
        (
            "/api/simulations/"
            "SIM-000001"
        ),
        headers=auth_headers(token),
    )

    assert (
        detail_response.status_code
        == 200
    )

    assert (
        detail_response.json()[
            "config"
        ]["name"]
        == "European API Test"
    )


def test_history_pagination(
    client: TestClient,
) -> None:
    token = register_and_login(
        client,
        "pagination@edgemind.dev",
        "Pagination Tester",
    )

    for number in range(1, 4):
        response = run_simulation(
            client,
            token,
            f"Pagination Run {number}",
        )

        assert (
            response.status_code
            == 201
        )

    first_page = client.get(
        (
            "/api/simulations"
            "?page=1&pageSize=2"
        ),
        headers=auth_headers(token),
    )

    assert (
        first_page.status_code
        == 200
    )

    first_data = first_page.json()

    assert first_data["total"] == 3
    assert first_data["page"] == 1
    assert first_data["pageSize"] == 2
    assert first_data["totalPages"] == 2

    assert [
        item["id"]
        for item
        in first_data["simulations"]
    ] == [
        "SIM-000003",
        "SIM-000002",
    ]

    second_page = client.get(
        (
            "/api/simulations"
            "?page=2&pageSize=2"
        ),
        headers=auth_headers(token),
    )

    assert (
        second_page.status_code
        == 200
    )

    assert [
        item["id"]
        for item
        in second_page.json()[
            "simulations"
        ]
    ] == [
        "SIM-000001",
    ]


def test_rename_and_delete_simulation(
    client: TestClient,
) -> None:
    token = register_and_login(
        client,
        "editor@edgemind.dev",
        "Simulation Editor",
    )

    run_response = run_simulation(
        client,
        token,
        "Original Name",
    )

    simulation_id = (
        run_response.json()[
            "result"
        ]["id"]
    )

    rename_response = client.patch(
        (
            "/api/simulations/"
            f"{simulation_id}"
        ),
        headers=auth_headers(token),
        json={
            "name": "Renamed Test",
        },
    )

    assert (
        rename_response.status_code
        == 200
    )

    assert (
        rename_response.json()["name"]
        == "Renamed Test"
    )

    delete_response = client.delete(
        (
            "/api/simulations/"
            f"{simulation_id}"
        ),
        headers=auth_headers(token),
    )

    assert (
        delete_response.status_code
        == 204
    )

    missing_response = client.get(
        (
            "/api/simulations/"
            f"{simulation_id}"
        ),
        headers=auth_headers(token),
    )

    assert (
        missing_response.status_code
        == 404
    )

    assert missing_response.json()[
        "detail"
    ] == "Simulation not found."


def test_users_cannot_access_other_users_runs(
    client: TestClient,
) -> None:
    owner_token = register_and_login(
        client,
        "first@edgemind.dev",
        "First User",
    )

    attacker_token = register_and_login(
        client,
        "second@edgemind.dev",
        "Second User",
    )

    run_response = run_simulation(
        client,
        owner_token,
        "Private Simulation",
    )

    simulation_id = (
        run_response.json()[
            "result"
        ]["id"]
    )

    protected_path = (
        "/api/simulations/"
        f"{simulation_id}"
    )

    open_response = client.get(
        protected_path,
        headers=auth_headers(
            attacker_token
        ),
    )

    rename_response = client.patch(
        protected_path,
        headers=auth_headers(
            attacker_token
        ),
        json={
            "name":
                "Unauthorized Rename",
        },
    )

    delete_response = client.delete(
        protected_path,
        headers=auth_headers(
            attacker_token
        ),
    )

    for response in [
        open_response,
        rename_response,
        delete_response,
    ]:
        assert (
            response.status_code
            == 404
        )

        assert response.json()[
            "detail"
        ] == "Simulation not found."

    owner_response = client.get(
        protected_path,
        headers=auth_headers(
            owner_token
        ),
    )

    assert (
        owner_response.status_code
        == 200
    )

    assert (
        owner_response.json()[
            "config"
        ]["name"]
        == "Private Simulation"
    )
