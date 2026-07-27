from typing import Annotated

from fastapi import (
    Depends,
    HTTPException,
    status,
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy.orm import Session

from app.core.security import (
    InvalidTokenError,
    decode_access_token,
)
from app.db.session import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(
    auto_error=False,
)


def unauthorized_exception() -> HTTPException:
    return HTTPException(
        status_code=(
            status.HTTP_401_UNAUTHORIZED
        ),
        detail=(
            "Could not validate "
            "authentication credentials."
        ),
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials
        | None,
        Depends(bearer_scheme),
    ],
    database: Annotated[
        Session,
        Depends(get_db),
    ],
) -> User:
    if (
        credentials is None
        or credentials.scheme.lower()
        != "bearer"
    ):
        raise unauthorized_exception()

    try:
        payload = decode_access_token(
            credentials.credentials,
        )

        subject = payload.get("sub")

        if subject is None:
            raise unauthorized_exception()

        user_id = int(subject)

    except (
        InvalidTokenError,
        TypeError,
        ValueError,
    ):
        raise unauthorized_exception() from None

    user = database.get(
        User,
        user_id,
    )

    if user is None:
        raise unauthorized_exception()

    if not user.is_active:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="User account is inactive.",
        )

    return user


CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]
