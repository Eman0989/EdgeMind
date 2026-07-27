from datetime import (
    datetime,
    timezone,
)

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Integer,
    String,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class EdgeNode(Base):
    __tablename__ = "edge_nodes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    code: Mapped[str] = mapped_column(
        String(10),
        unique=True,
        index=True,
        nullable=False,
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    country: Mapped[str] = (
        mapped_column(
            String(100),
            nullable=False,
        )
    )

    region: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    latitude: Mapped[float] = (
        mapped_column(
            Float,
            nullable=False,
        )
    )

    longitude: Mapped[float] = (
        mapped_column(
            Float,
            nullable=False,
        )
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="healthy",
        index=True,
        nullable=False,
    )

    capacity_rps: Mapped[int] = (
        mapped_column(
            Integer,
            default=10000,
            nullable=False,
        )
    )

    current_load_percent: Mapped[
        float
    ] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    base_latency_ms: Mapped[int] = (
        mapped_column(
            Integer,
            default=10,
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
