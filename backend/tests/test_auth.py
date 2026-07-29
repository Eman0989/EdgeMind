from fastapi.testclient import (
    TestClient,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    verify_password,
)
from app.models.user import User


TEST_EMAIL = "tester@edgemind.dev"
TEST_PASSWORD = "SecureTest123!"


def registration_payload(
    email: str = TEST_EMAIL,
) -> dict[str, str]:
    return {
        "email": email,
        "full_name": (
            "EdgeMind Test User"
        ),
        "password": TEST_PASSWORD,
    }


def register_user(
    client: TestClient,
    email: str = TEST_EMAIL,
):
    return client.post(
        "/api/auth/register",
        json=registration_payload(
            email
        ),
    )


def login_user(
    client: TestClient,
    email: str = TEST_EMAIL,
    password: str = TEST_PASSWORD,
):
    return client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )


def test_register_login_and_read_profile(
    client: TestClient,
    database: Session,
) -> None:
    register_response = register_user(
        client
    )

    assert (
        register_response.status_code
        == 201
    )

    registered = (
        register_response.json()
    )

    assert (
        registered["email"]
        == TEST_EMAIL
    )

    assert (
        registered["full_name"]
        == "EdgeMind Test User"
    )

    user = database.scalar(
        select(User).where(
            User.email == TEST_EMAIL
        )
    )

    assert user is not None

    assert (
        user.hashed_password
        != TEST_PASSWORD
    )

    assert verify_password(
        TEST_PASSWORD,
        user.hashed_password,
    )

    login_response = login_user(
        client
    )

    assert (
        login_response.status_code
        == 200
    )

    token_data = (
        login_response.json()
    )

    assert (
        token_data["token_type"]
        == "bearer"
    )

    assert len(
        token_data["access_token"]
    ) > 100

    profile_response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": (
                "Bearer "
                + token_data[
                    "access_token"
                ]
            ),
        },
    )

    assert (
        profile_response.status_code
        == 200
    )

    assert (
        profile_response.json()[
            "email"
        ]
        == TEST_EMAIL
    )


def test_duplicate_registration_is_rejected(
    client: TestClient,
) -> None:
    first_response = register_user(
        client
    )

    second_response = register_user(
        client
    )

    assert (
        first_response.status_code
        == 201
    )

    assert (
        second_response.status_code
        == 409
    )

    assert (
        second_response.json()[
            "detail"
        ]
        == (
            "An account with this "
            "email already exists."
        )
    )


def test_login_rejects_wrong_password(
    client: TestClient,
) -> None:
    register_user(client)

    response = login_user(
        client,
        password="WrongPassword123!",
    )

    assert response.status_code == 401

    assert response.json()[
        "detail"
    ] == (
        "Incorrect email or password."
    )


def test_profile_requires_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        "/api/auth/me"
    )

    assert response.status_code == 401

    assert response.json()[
        "detail"
    ] == (
        "Could not validate "
        "authentication credentials."
    )
