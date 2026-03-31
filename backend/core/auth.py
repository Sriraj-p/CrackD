"""
CrackD Authentication Utilities
Verifies Supabase Auth JWTs and syncs authenticated users to the local users table.

Supabase Auth handles all sign-in methods (Google, GitHub, email/password).
The backend only needs to:
  1. Verify the JWT from the Authorization header
  2. Ensure a matching row exists in our users table

Supports both legacy HS256 (symmetric) and new ES256 (asymmetric) Supabase JWT signing.
"""

import os
import json
import urllib.request
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt, jwk
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.user import User

# ─── Config ───
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", os.getenv("SUPABASE_URL", ""))

if not SUPABASE_JWT_SECRET:
    import warnings
    warnings.warn("SUPABASE_JWT_SECRET not set — auth will reject all requests")

# ─── JWKS cache for ES256 verification ───
_jwks_cache = None


def _fetch_jwks():
    """Fetch JWKS from Supabase for ES256 token verification."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    if not SUPABASE_URL:
        return None

    try:
        jwks_url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
        req = urllib.request.Request(jwks_url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            _jwks_cache = json.loads(resp.read().decode())
            print(f"[AUTH] Fetched JWKS from Supabase ({len(_jwks_cache.get('keys', []))} keys)")
            return _jwks_cache
    except Exception as e:
        print(f"[AUTH] Failed to fetch JWKS: {e}")
        return None


def _get_signing_key(token):
    """
    Determine the correct key and algorithm for verifying a Supabase JWT.
    Returns (key, algorithms) tuple.
    """
    try:
        header = jwt.get_unverified_header(token)
    except JWTError:
        return SUPABASE_JWT_SECRET, ["HS256"]

    alg = header.get("alg", "HS256")

    # Legacy HS256 — use the symmetric secret directly
    if alg.startswith("HS"):
        return SUPABASE_JWT_SECRET, [alg]

    # ES256 / RS256 — need the public key from JWKS
    kid = header.get("kid")
    jwks = _fetch_jwks()

    if jwks and kid:
        for key_data in jwks.get("keys", []):
            if key_data.get("kid") == kid:
                public_key = jwk.construct(key_data, algorithm=alg)
                return public_key, [alg]

    # Fallback: try the legacy secret anyway
    print(f"[AUTH] Warning: token alg={alg} kid={kid} but no matching JWKS key found, falling back to legacy secret")
    return SUPABASE_JWT_SECRET, ["HS256"]


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
        key, algorithms = _get_signing_key(token)

        # python-jose needs the key as a string for HMAC, or a key object for EC/RSA
        if isinstance(key, str):
            payload = jwt.decode(
                token,
                key,
                algorithms=algorithms,
                audience="authenticated",
            )
        else:
            payload = jwt.decode(
                token,
                key.to_pem().decode("utf-8"),
                algorithms=algorithms,
                audience="authenticated",
            )

        sub: str = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except JWTError as e:
        print(f"[AUTH DEBUG] JWT decode failed: {e}")
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