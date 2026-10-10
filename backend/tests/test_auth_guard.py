from datetime import timedelta

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from app.middleware.auth_guard import get_current_user, require_roles


def request_with_auth(value=None):
    headers = [] if value is None else [(b"authorization", value.encode())]
    return Request({"type": "http", "headers": headers, "method": "GET", "path": "/"})


@pytest.mark.parametrize("header", [None, "", "Basic abc", "Bearer", "Bearer "])
def test_missing_or_malformed_authorization_is_401(header):
    with pytest.raises(HTTPException) as exc:
        get_current_user(request_with_auth(header))
    assert exc.value.status_code == 401
    assert exc.value.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.parametrize(
    "claims",
    [
        {"expires_delta": timedelta(seconds=-1)},
        {"issuer": "someone-else"},
        {"token_type": "refresh"},
        {"include_exp": False},
        {"include_sub": False},
        {"algorithm": "none"},
    ],
)
def test_invalid_jwt_claims_are_rejected(client, token_factory, claims):
    token = token_factory(**claims)
    with pytest.raises(HTTPException) as exc:
        get_current_user(request_with_auth(f"Bearer {token}"))
    assert exc.value.status_code == 401


def test_corrupt_token_is_401(client):
    with pytest.raises(HTTPException) as exc:
        get_current_user(request_with_auth("Bearer not.a.jwt"))
    assert exc.value.status_code == 401


def test_current_user_defaults_optional_email_and_role(client, token_factory):
    user = get_current_user(request_with_auth(f"Bearer {token_factory(role='staff')}"))
    assert (user.id, user.email, user.role) == ("user-1", "", "staff")


@pytest.mark.parametrize("role", ["admin", "manager"])
def test_allowed_roles_and_admin_wildcard(role):
    from app.middleware.auth_guard import CurrentUser

    user = CurrentUser("1", "", role)
    assert require_roles("manager").dependency(user=user) is user


def test_disallowed_role_is_403():
    from app.middleware.auth_guard import CurrentUser

    with pytest.raises(HTTPException) as exc:
        require_roles("manager").dependency(user=CurrentUser("1", "", "staff"))
    assert exc.value.status_code == 403
