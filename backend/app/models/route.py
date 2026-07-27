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
    Float,
    ForeignKey,
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
    from app.models.simulation import (
        Simulation,
    )


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    simulation_id: Mapped[int] = (
        mapped_column(
            ForeignKey(
                "simulations.id",
                ondelete="CASCADE",
            ),
            index=True,
            nullable=False,
        )
    )

    route_type: Mapped[str] = (
        mapped_column(
            String(30),
            nullable=False,
        )
    )

    path: Mapped[list[str]] = (
        mapped_column(
            JSON,
            default=list,
            nullable=False,
        )
    )

    latency_ms: Mapped[int] = (
        mapped_column(
            nullable=False,
        )
    )

    cache_hit_rate: Mapped[
        Optional[float]
    ] = mapped_column(
        Float,
        nullable=True,
    )

    confidence: Mapped[
        Optional[float]
    ] = mapped_column(
        Float,
        nullable=True,
    )

    is_selected: Mapped[bool] = (
        mapped_column(
            Boolean,
            default=False,
            index=True,
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

    simulation: Mapped[
        "Simulation"
    ] = relationship(
        back_populates="routes",
    )
