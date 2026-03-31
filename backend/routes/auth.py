"""
CrackD Auth Routes
GET /api/auth/me — return current user from Supabase JWT
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from backend.core.auth import require_auth
from backend.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_premium: bool


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(require_auth)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        is_premium=current_user.is_premium,
    )
