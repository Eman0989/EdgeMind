from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


class UserRegister(BaseModel):
    email: EmailStr

    full_name: str = Field(
        min_length=2,
        max_length=120,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
        repr=False,
    )


class UserLogin(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
        repr=False,
    )


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=120,
    )

    email: EmailStr | None = None


class TokenResponse(BaseModel):
    access_token: str

    token_type: Literal[
        "bearer"
    ] = "bearer"

    expires_in: int


class TokenPayload(BaseModel):
    sub: str
