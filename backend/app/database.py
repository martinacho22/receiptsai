"""Database engine, async session, and base model for SQLAlchemy.

Includes portable GUID and JSON types that work with both PostgreSQL and SQLite.
"""

import uuid
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.types import TypeDecorator, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from app.config import settings


# ── Portable column types ──────────────────────────────────────────────

class GUID(TypeDecorator):
    """Portable UUID column: native PostgreSQL UUID or SQLite String(36).

    Use instead of ``sqlalchemy.dialects.postgresql.UUID(as_uuid=True)``
    when you want the code to work with both PostgreSQL and SQLite.
    """
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)


class JSONCompat(TypeDecorator):
    """Portable JSON column: native PostgreSQL JSONB or SQLite Text.

    Serializes/deserializes via ``json.dumps`` / ``json.loads`` on SQLite.
    """
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value
        return json.dumps(value, default=str)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value
        if isinstance(value, str):
            return json.loads(value)
        return value


# ── Engine & session ───────────────────────────────────────────────────

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=5,
    max_overflow=10,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency that yields a database session per request."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables. Use Alembic migrations in production."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
