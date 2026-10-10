from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.middleware import auth_guard
from app.models import assignment, driver, maintenance, vehicle  # noqa: F401
from app.services.audit_service import AuditLog  # noqa: F401


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    testing_session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = testing_session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture()
def client(db_session, monkeypatch):
    def override_db():
        yield db_session

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(auth_guard, "_load_public_key", lambda: "test-public-key")
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def token_factory():
    def make_token(
        role="manager",
        *,
        subject="user-1",
        issuer="vfms-auth",
        token_type="access",
        expires_delta=timedelta(minutes=10),
        algorithm="HS256",
        include_exp=True,
        include_sub=True,
    ):
        now = datetime.now(timezone.utc)
        claims = {"iss": issuer, "iat": now, "token_type": token_type, "role": role}
        if include_exp:
            claims["exp"] = now + expires_delta
        if include_sub:
            claims["sub"] = subject
        if algorithm == "none":
            return jwt.encode(claims, key="", algorithm="none")
        return jwt.encode(claims, key="unit-test-secret", algorithm=algorithm)

    return make_token


@pytest.fixture()
def auth_headers(token_factory):
    def headers(role="manager", **kwargs):
        return {"Authorization": f"Bearer {token_factory(role, **kwargs)}"}

    return headers
