from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    """Validated application configuration."""

    app_name: str = "EdgeMind API"
    app_version: str = "0.1.0"

    environment: Literal[
        "development",
        "testing",
        "production",
    ] = "development"

    debug: bool = True
    api_prefix: str = "/api"

    host: str = "127.0.0.1"
    port: int = 8000

    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator(
        "api_prefix",
        mode="before",
    )
    @classmethod
    def normalize_api_prefix(
        cls,
        value: object,
    ) -> str:
        if not isinstance(value, str):
            return "/api"

        normalized = value.strip()

        if not normalized:
            return "/api"

        return (
            normalized
            if normalized.startswith("/")
            else f"/{normalized}"
        ).rstrip("/") or "/api"

    @property
    def cors_origin_list(
        self,
    ) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    """Return one cached settings instance."""

    return Settings()
