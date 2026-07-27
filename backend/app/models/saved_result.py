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
    DateTime,
    ForeignKey,
    JSON,
    Text,
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
    from app.models.user import User


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SavedResult(Base):
    __tablename__ = "saved_results"

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

    simulation_id: Mapped[int] = (
        mapped_column(
            ForeignKey(
                "simulations.id",
                ondelete="CASCADE",
            ),
            unique=True,
            index=True,
            nullable=False,
        )
    )

    snapshot: Mapped[
        dict[str, object]
    ] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )

    notes: Mapped[
        Optional[str]
    ] = mapped_column(
        Text,
        nullable=True,
    )

    saved_at: Mapped[datetime] = (
        mapped_column(
            DateTime(timezone=True),
            default=utc_now,
            nullable=False,
        )
    )

    user: Mapped["User"] = relationship(
        back_populates="saved_results",
    )

    simulation: Mapped[
        "Simulation"
    ] = relationship(
        back_populates="saved_result",
    )
