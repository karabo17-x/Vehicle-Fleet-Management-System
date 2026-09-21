"""
auth guard: verifies JWTs issued by the Go auth and enforces RBAC
does not call auth/authorize endpoint on every request instead
fetches the auth services RSA *public* key at first use then caches it
"""
from functools import lru_cache

import httpx
from fastapi import Depends, HTTPException,Request,status
from jose import JWTError, jwt
from app.config import settings

@lru_cache
def _load_public_key() -> str:
    """load auth RSA public key from path(local/dev/docker-compose)
    or fetch it over HTTP from AUTH_PUBLIC_KEY_URL"""
    if settings.auth_public_key_url:
        response = httpx.get(settings.auth_public_key_url, timeout=5.0)
        response.raise_for_status()
        return response.text

    with open(settings.auth_public_key_path, "r", encoding="utf-8") as f:
        return f.read()

class CurrentUser:
    "represents authentication for duration request, decoded out of verified JWT"
    def __init__(self, sub, str, email: str, roles: str):
        self.id = sub
        self.email = email
        self.role = self.role

    def __repr__(self) -> str: #debugging aid
        return f"CurrentUser(id={self,id!r}, role={self.role!r})"

def get_current_user(request: Request) -> CurrentUser:
    "fastapi: extracts and verifies the Bear token"
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bear "):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Missing or malformed Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token_str = auth_header.removeprefix("Bearer ")

    try:
        public_key = _load_public_key()
        payload = jwt.decode(
            token_str,
            public_key,
            algorithms=[settings.jwt_algoithm],
            issuer=settings.jwt_issuer,
            options={"require_exp": True, "require_sub": True},
        )  
    except JWTError as exc:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    if payload.get("token_type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not access token")
    return  CurrentUser(sub=payload["sub"], email=payload.get("email", ""), role=payload.get("role", ""))

def require_roles(*allowed_roles: str):
    " use `Depends(require_roles(admin, manager ))` on any route "
    "admin implicitly passes every check, mirroring the ***wildcard in Go serices internal/rbac/policy.go"

    def checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role == "admin" or user.role in allowed_roles:
            return user
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"Role '{user.role}' is not permitted to perform this function",
        )
    return checker



            
