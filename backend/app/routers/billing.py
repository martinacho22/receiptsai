"""Billing router — usage stats, plan info, subscription management."""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from pydantic import BaseModel
from app.database import get_db
from app.models.tenant import Tenant
from app.models.subscription import Subscription
from app.models.receipt import Receipt
from app.models.user import User

router = APIRouter(prefix="/billing", tags=["billing"])


class UsageOut(BaseModel):
    tenant_id: str
    company_name: str
    plan: str
    status: str
    receipt_count: int
    driver_count: int
    max_drivers: int
    receipt_limit: int | None = None


# Plan pricing (hardcoded for now — matches frontend configuracion.js)
PLAN_LIMITS = {
    "trial": {"receipts": 50, "drivers": 5},
    "basico": {"receipts": 100, "drivers": 5},
    "profesional": {"receipts": 500, "drivers": 20},
    "empresarial": {"receipts": 2000, "drivers": 999},
    "corporativo": {"receipts": 99999, "drivers": 99999},
}


@router.get("/usage")
async def get_usage(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get current usage and plan info for the company."""
    # Tenant
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # Subscription
    sub_result = await db.execute(
        select(Subscription).where(Subscription.tenant_id == tenant_id)
    )
    sub = sub_result.scalar_one_or_none()

    plan = sub.plan if sub else "trial"
    status = sub.status if sub else "trialing"
    max_drivers = sub.max_drivers if sub else PLAN_LIMITS.get(plan, {}).get("drivers", 5)

    # Receipt count
    count_result = await db.execute(
        select(func.count(Receipt.id)).where(Receipt.tenant_id == tenant_id)
    )
    receipt_count = count_result.scalar() or 0

    # Driver count
    driver_result = await db.execute(
        select(func.count(User.id)).where(
            User.tenant_id == tenant_id,
            User.role == "driver",
            User.is_active == True,
        )
    )
    driver_count = driver_result.scalar() or 0

    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["trial"])

    return UsageOut(
        tenant_id=str(tenant.id),
        company_name=tenant.name,
        plan=plan,
        status=status,
        receipt_count=receipt_count,
        driver_count=driver_count,
        max_drivers=max_drivers,
        receipt_limit=limits.get("receipts"),
    )
