"""
CrackD Authentication Utilities
Verifies Supabase Auth JWTs and syncs authenticated users to the local users table.

Supabase Auth handles all sign-in methods (Google, GitHub, email/password).
The backend only needs to:
  1. Verify the JWT from the Authorization header
  2. Ensure a matching row exists in our users table
"""

import os
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.user import User

# ─── Config ───
# Supabase JWT secret — found in Supabase Dashboard → Settings → API → JWT Secret
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
JWT_ALGORITHM = "HS256"

if not SUPABASE_JWT_SECRET:
    import warnings
    warnings.warn("SUPABASE_JWT_SECRET not set — auth will reject all requests")

# ─── FastAPI dependency ───
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Optional auth dependency. Returns the User if a valid token is present,
    or None if no token is provided. Raises 401 if token is present but invalid.
    """
    if credentials is None:
        return None

    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            audience="authenticated",
        )
        sub: str = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Sync user to local table (upsert)
    user = db.query(User).filter(User.id == sub).first()
    if user is None:
        # First time this Supabase user hits our backend — create a row
        email = payload.get("email", "")
        user_metadata = payload.get("user_metadata", {})
        full_name = (
            user_metadata.get("full_name")
            or user_metadata.get("name")
            or email.split("@")[0]
        )

        user = User(
            id=sub,
            email=email,
            hashed_password="SUPABASE_MANAGED",  # not used — Supabase handles passwords
            full_name=full_name,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.email != payload.get("email", user.email):
        # Email changed on Supabase side — keep in sync
        user.email = payload.get("email", user.email)
        user.updated_at = datetime.now(timezone.utc)
        db.commit()

    return user


def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Strict auth dependency. Returns the User or raises 401.
    Use this for endpoints that must be authenticated.
    """
    user = get_current_user(credentials, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
