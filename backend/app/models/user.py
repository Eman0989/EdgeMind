from __future__ import annotations

from datetime import (
    datetime,
    timezone,
)
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    String,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.saved_result import (
        SavedResult,
    )
    from app.models.simulation import (
        Simulation,
    )


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        index=True,
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    hashed_password: Mapped[str] = (
        mapped_column(
            String(255),
            nullable=False,
        )
    )

    is_active: Mapped[bool] = (
        mapped_column(
            Boolean,
            default=True,
            nullable=False,
        )
    )

    created_at: Mapped[datetime] = (
        mapped_column(
            DateTime(timezone=True),
            default=utc_now,
            nullable=False,
        )
    )

    updated_at: Mapped[datetime] = (
        mapped_column(
            DateTime(timezone=True),
            default=utc_now,
            onupdate=utc_now,
            nullable=False,
        )
    )

    simulations: Mapped[
        list["Simulation"]
    ] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    saved_results: Mapped[
        list["SavedResult"]
    ] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
