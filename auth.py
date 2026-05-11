"""Bearer-token auth for single-coach v0.1."""

import os
from pathlib import Path
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.requests import Request

# Load token from env or a file
_token = os.getenv("COACH_API_TOKEN")
if not _token:
    token_file = Path(__file__).resolve().parent / ".coach_token"
    if token_file.exists():
        _token = token_file.read_text().strip()

security = HTTPBearer(auto_error=False)


def get_coach_token() -> str:
    """Return the configured bearer token. Call once at startup to fail fast."""
    if not _token:
        raise RuntimeError(
            "COACH_API_TOKEN env var or .coach_token file must be set"
        )
    return _token


async def require_coach(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = None,
):
    """Dependency: reject unauthenticated requests."""
    if not _token:
        return True  # no token configured = open access during dev

    # Try header first
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer ") and auth[7:] == _token:
        return True

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing bearer token",
        headers={"WWW-Authenticate": "Bearer"},
    )
