"""Authentication router — login, register, token refresh."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.tenant import Tenant
from app.models.user import User
from app.models.subscription import Subscription
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


# --- Request/Response schemas ---

class RegisterRequest(BaseModel):
    company_name: str
    admin_name: str
    admin_email: str
    admin_phone: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    tenant_id: str
    role: str


# --- Routes ---

@router.post("/register", status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new company (tenant) with an admin user and free trial."""
    # Check if email already exists
    existing = await db.execute(
        select(User).where(User.email == req.admin_email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create tenant
    slug = req.company_name.lower().replace(" ", "-").replace("ñ", "n")[:100]
    tenant = Tenant(
        name=req.company_name,
        slug=slug,
        country="MX",
        currency="MXN",
    )
    db.add(tenant)
    await db.flush()  # get tenant.id

    # Create subscription (free trial)
    sub = Subscription(
        tenant_id=tenant.id,
        plan="trial",
        max_drivers=5,
        status="trialing",
    )
    db.add(sub)

    # Create admin user
    admin = User(
        tenant_id=tenant.id,
        role="admin",
        name=req.admin_name,
        phone=req.admin_phone,
        email=req.admin_email,
        password_hash=hash_password(req.password),
    )
    db.add(admin)
    await db.commit()

    return {"message": "Company registered successfully", "tenant_id": str(tenant.id)}


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and return a JWT token."""
    result = await db.execute(
        select(User).where(User.email == req.email, User.is_active == True)
    )
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        user_id=user.id,
        tenant_id=user.tenant_id,
        role=user.role,
    )

    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        tenant_id=str(user.tenant_id),
        role=user.role,
    )
