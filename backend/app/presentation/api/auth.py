from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.application.services.auth_service import AuthService
from app.application.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    request: RegisterRequest, db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.register(request)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(request)


@router.post("/logout")
async def logout():
    # JWT is stateless - client just discards the token
    return {"message": "Logged out successfully"}