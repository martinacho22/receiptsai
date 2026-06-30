"""Authentication router — login, register, demo login, token refresh."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.tenant import Tenant
from app.models.user import User
from app.models.subscription import Subscription
from app.utils.auth import hash_password, verify_password, create_access_token
from app.services.demo import seed_demo_data

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


class UserInfo(BaseModel):
    id: str
    tenant_id: str
    company_name: str
    role: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


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
    await db.flush()

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
    await db.flush()

    # Generate JWT so user is logged in immediately
    token = create_access_token(
        user_id=admin.id,
        tenant_id=admin.tenant_id,
        role=admin.role,
    )

    await db.commit()

    return AuthResponse(
        access_token=token,
        user=UserInfo(
            id=str(admin.id),
            tenant_id=str(admin.tenant_id),
            company_name=tenant.name,
            role=admin.role,
        ),
    )


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

    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == user.tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    return AuthResponse(
        access_token=token,
        user=UserInfo(
            id=str(user.id),
            tenant_id=str(user.tenant_id),
            company_name=tenant.name if tenant else "",
            role=user.role,
        ),
    )


@router.post("/demo-login", operation_id="demo_login")
async def demo_login(db: AsyncSession = Depends(get_db)):
    """One-click demo login. Seeds demo data on first call, logs in on every call.

    Creates a demo tenant ("Concretera del Bajío") with an admin user,
    five drivers, and eight sample fuel receipts. Idempotent — subsequent
    calls just return a fresh JWT for the same demo admin.
    """
    from app.utils.demo import DEMO_TENANT_NAME

    admin = await seed_demo_data(db)

    if admin is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to create or find demo user",
        )

    token = create_access_token(
        user_id=admin.id,
        tenant_id=admin.tenant_id,
        role=admin.role,
    )

    await db.commit()

    return AuthResponse(
        access_token=token,
        user=UserInfo(
            id=str(admin.id),
            tenant_id=str(admin.tenant_id),
            company_name=DEMO_TENANT_NAME,
            role=admin.role,
        ),
    )
