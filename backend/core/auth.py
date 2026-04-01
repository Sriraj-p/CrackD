"""
CrackD Authentication Utilities
Verifies Supabase Auth JWTs and syncs authenticated users to the local users table.

Supabase Auth handles all sign-in methods (Google, GitHub, email/password).
The backend only needs to:
  1. Verify the JWT from the Authorization header
  2. Ensure a matching row exists in our users table

Uses PyJWT (not python-jose) for reliable ES256/JWKS support.
"""

import os
from datetime import datetime, timezone

import jwt as pyjwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.user import User

# ─── Config ───
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", ""))

if not SUPABASE_JWT_SECRET:
    import warnings
    warnings.warn("SUPABASE_JWT_SECRET not set — auth will reject all requests")

# ─── JWKS client (caches keys automatically) ───
_jwks_client = None


def _get_jwks_client():
    """Lazily initialise the JWKS client for ES256 verification."""
    global _jwks_client
    if _jwks_client is not None:
        return _jwks_client

    if not SUPABASE_URL:
        print("[AUTH] SUPABASE_URL not set — JWKS unavailable")
        return None

    jwks_url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
    try:
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
        print(f"[AUTH] JWKS client initialised: {jwks_url}")
        return _jwks_client
    except Exception as e:
        print(f"[AUTH] Failed to initialise JWKS client: {e}")
        return None


def _verify_token(token: str) -> dict:
    """
    Verify a Supabase JWT. Tries ES256 via JWKS first, then falls back to HS256.
    Returns the decoded payload dict.
    Raises an exception if verification fails.
    """
    # Read the token header to determine the algorithm
    try:
        header = pyjwt.get_unverified_header(token)
    except pyjwt.exceptions.DecodeError as e:
        raise ValueError(f"Malformed token header: {e}")

    alg = header.get("alg", "HS256")

    # ── ES256 path: use JWKS to get the public key ──
    if alg == "ES256":
        jwks_client = _get_jwks_client()
        if jwks_client:
            try:
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = pyjwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["ES256"],
                    audience="authenticated",
                )
                print(f"[AUTH] ES256 verification OK — sub={payload.get('sub')}")
                return payload
            except pyjwt.exceptions.PyJWKClientError as e:
                print(f"[AUTH] JWKS key lookup failed: {e}")
            except pyjwt.ExpiredSignatureError:
                raise ValueError("Token has expired")
            except pyjwt.InvalidAudienceError:
                raise ValueError("Invalid token audience")
            except pyjwt.InvalidTokenError as e:
                print(f"[AUTH] ES256 decode failed: {e}")

    # ── HS256 path: use the symmetric secret ──
    if SUPABASE_JWT_SECRET:
        try:
            payload = pyjwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
            print(f"[AUTH] HS256 verification OK — sub={payload.get('sub')}")
            return payload
        except pyjwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except pyjwt.InvalidAudienceError:
            raise ValueError("Invalid token audience")
        except pyjwt.InvalidTokenError as e:
            raise ValueError(f"Token verification failed: {e}")

    raise ValueError("No valid verification method available")


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
        payload = _verify_token(token)
        sub: str = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except ValueError as e:
        print(f"[AUTH] Rejected: {e}")
        raise credentials_exception

    # Sync user to local table (upsert)
    user = db.query(User).filter(User.id == sub).first()
    if user is None:
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
            hashed_password="SUPABASE_MANAGED",
            full_name=full_name,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.email != payload.get("email", user.email):
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