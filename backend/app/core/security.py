from datetime import (
    datetime,
    timedelta,
    timezone,
)
from typing import Any

import jwt
from jwt.exceptions import (
    InvalidTokenError,
)
from pwdlib import PasswordHash

from app.core.config import (
    get_settings,
)

password_hash = (
    PasswordHash.recommended()
)


def hash_password(
    password: str,
) -> str:
    return password_hash.hash(
        password,
    )


def verify_password(
    password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        password,
        hashed_password,
    )


def create_access_token(
    subject: str | int,
    expires_delta: (
        timedelta | None
    ) = None,
) -> str:
    settings = get_settings()

    now = datetime.now(
        timezone.utc,
    )

    expiration = (
        now + expires_delta
        if expires_delta
        else now
        + timedelta(
            minutes=(
                settings
                .access_token_expire_minutes
            ),
        )
    )

    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expiration,
    }

    return jwt.encode(
        payload,
        settings.secret_key
        .get_secret_value(),
        algorithm=(
            settings.jwt_algorithm
        ),
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:
    settings = get_settings()

    return jwt.decode(
        token,
        settings.secret_key
        .get_secret_value(),
        algorithms=[
            settings.jwt_algorithm,
        ],
        options={
            "require": [
                "sub",
                "iat",
                "exp",
            ],
        },
    )


__all__ = [
    "InvalidTokenError",
    "create_access_token",
    "decode_access_token",
    "hash_password",
    "verify_password",
]
