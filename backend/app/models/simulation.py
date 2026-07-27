from __future__ import annotations

from datetime import (
    datetime,
    timezone,
)
from typing import (
    TYPE_CHECKING,
    Optional,
)

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.route import Route
    from app.models.saved_result import (
        SavedResult,
    )
    from app.models.user import User


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = (
        mapped_column(
            ForeignKey(
                "users.id",
                ondelete="CASCADE",
            ),
            index=True,
            nullable=False,
        )
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="completed",
        index=True,
        nullable=False,
    )

    origin: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    audience: Mapped[str] = (
        mapped_column(
            String(50),
            nullable=False,
        )
    )

    content_type: Mapped[str] = (
        mapped_column(
            String(40),
            nullable=False,
        )
    )

    traffic_profile: Mapped[str] = (
        mapped_column(
            String(40),
            nullable=False,
        )
    )

    optimization_goal: Mapped[str] = (
        mapped_column(
            String(40),
            nullable=False,
        )
    )

    requests_per_second: Mapped[int] = (
        mapped_column(
            Integer,
            nullable=False,
        )
    )

    payload_size_kb: Mapped[int] = (
        mapped_column(
            Integer,
            nullable=False,
        )
    )

    cache_ttl_seconds: Mapped[int] = (
        mapped_column(
            Integer,
            nullable=False,
        )
    )

    warm_cache: Mapped[bool] = (
        mapped_column(
            Boolean,
            default=True,
            nullable=False,
        )
    )

    failover: Mapped[bool] = (
        mapped_column(
            Boolean,
            default=True,
            nullable=False,
        )
    )

    ai_routing: Mapped[bool] = (
        mapped_column(
            Boolean,
            default=True,
            nullable=False,
        )
    )

    result_data: Mapped[
        dict[str, object]
    ] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )

    created_at: Mapped[datetime] = (
        mapped_column(
            DateTime(timezone=True),
            default=utc_now,
            nullable=False,
        )
    )

    completed_at: Mapped[
        Optional[datetime]
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        back_populates="simulations",
    )

    routes: Mapped[
        list["Route"]
    ] = relationship(
        back_populates="simulation",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    saved_result: Mapped[
        Optional["SavedResult"]
    ] = relationship(
        back_populates="simulation",
        uselist=False,
        passive_deletes=True,
    )
