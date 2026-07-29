import os
from collections.abc import (
    Generator,
)
from typing import Any

import pytest
from fastapi.testclient import (
    TestClient,
)
from sqlalchemy import (
    create_engine,
    event,
)
from sqlalchemy.orm import (
    Session,
    sessionmaker,
)
from sqlalchemy.pool import (
    StaticPool,
)


# These variables are applied before
# importing the EdgeMind application.
# The real edgemind.db is never used.
os.environ["ENVIRONMENT"] = "testing"
os.environ["DEBUG"] = "false"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = (
    "edgemind-automated-test-secret-key"
)


from app.core.config import (  # noqa: E402
    get_settings,
)

get_settings.cache_clear()


from app.db.base import Base  # noqa: E402
from app.db.session import (  # noqa: E402
    get_db,
)
import app.models  # noqa: E402, F401
from app.main import (  # noqa: E402
    create_application,
)


test_engine = create_engine(
    "sqlite://",
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)


@event.listens_for(
    test_engine,
    "connect",
)
def enable_test_foreign_keys(
    dbapi_connection: Any,
    connection_record: Any,
) -> None:
    del connection_record

    cursor = dbapi_connection.cursor()
    cursor.execute(
        "PRAGMA foreign_keys=ON"
    )
    cursor.close()


TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    expire_on_commit=False,
)


def override_get_db() -> Generator[
    Session,
    None,
    None,
]:
    database = TestingSessionLocal()

    try:
        yield database
    finally:
        database.close()


application = create_application()

application.dependency_overrides[
    get_db
] = override_get_db


@pytest.fixture(
    autouse=True,
)
def reset_test_database() -> Generator[
    None,
    None,
    None,
]:
    Base.metadata.drop_all(
        bind=test_engine
    )

    Base.metadata.create_all(
        bind=test_engine
    )

    yield

    Base.metadata.drop_all(
        bind=test_engine
    )


@pytest.fixture
def client() -> Generator[
    TestClient,
    None,
    None,
]:
    with TestClient(
        application
    ) as test_client:
        yield test_client


@pytest.fixture
def database() -> Generator[
    Session,
    None,
    None,
]:
    database_session = (
        TestingSessionLocal()
    )

    try:
        yield database_session
    finally:
        database_session.close()
