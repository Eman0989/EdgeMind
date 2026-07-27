from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import (
    CurrentUser,
)
from app.core.config import (
    get_settings,
)
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


def invalid_login_exception() -> HTTPException:
    return HTTPException(
        status_code=(
            status.HTTP_401_UNAUTHORIZED
        ),
        detail="Incorrect email or password.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=(
        status.HTTP_201_CREATED
    ),
    summary="Register a new user",
)
def register_user(
    payload: UserRegister,
    database: DatabaseSession,
) -> User:
    email = str(
        payload.email
    ).strip().lower()

    full_name = " ".join(
        payload.full_name.split()
    )

    if len(full_name) < 2:
        raise HTTPException(
            status_code=422,
            detail=(
                "Full name must contain "
                "at least two characters."
            ),
        )

    existing_user = database.scalar(
        select(User).where(
            User.email == email
        )
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "An account with this "
                "email already exists."
            ),
        )

    user = User(
        email=email,
        full_name=full_name,
        hashed_password=hash_password(
            payload.password
        ),
        is_active=True,
    )

    database.add(user)

    try:
        database.commit()
        database.refresh(user)

    except IntegrityError:
        database.rollback()

        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "An account with this "
                "email already exists."
            ),
        ) from None

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and receive a token",
)
def login_user(
    payload: UserLogin,
    database: DatabaseSession,
) -> TokenResponse:
    email = str(
        payload.email
    ).strip().lower()

    user = database.scalar(
        select(User).where(
            User.email == email
        )
    )

    if user is None:
        raise invalid_login_exception()

    if not verify_password(
        payload.password,
        user.hashed_password,
    ):
        raise invalid_login_exception()

    if not user.is_active:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=(
                "This user account "
                "is inactive."
            ),
        )

    settings = get_settings()

    access_token = create_access_token(
        subject=user.id
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=(
            settings
            .access_token_expire_minutes
            * 60
        ),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current user",
)
def read_current_user(
    current_user: CurrentUser,
) -> User:
    return current_user
