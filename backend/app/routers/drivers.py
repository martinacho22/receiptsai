"""Drivers router — CRUD for drivers within a company (tenant)."""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.receipt import Receipt

router = APIRouter(prefix="/drivers", tags=["drivers"])


class DriverCreate(BaseModel):
    tenant_id: uuid.UUID
    name: str
    phone: str
    email: str | None = None


class DriverOut(BaseModel):
    id: str
    name: str
    phone: str
    email: str | None = None
    whatsapp_subscribed: bool = True
    receipt_count: int = 0
    is_active: bool

    class Config:
        from_attributes = True


@router.get("")
async def list_drivers(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """List all active drivers for a company, with receipt counts."""
    result = await db.execute(
        select(User).where(
            User.tenant_id == tenant_id,
            User.role == "driver",
            User.is_active == True,
        ).order_by(User.name)
    )
    drivers = result.scalars().all()

    # Build receipt counts per driver
    driver_ids = [d.id for d in drivers]
    count_rows = {}
    if driver_ids:
        count_result = await db.execute(
            select(Receipt.driver_id, func.count(Receipt.id))
            .where(Receipt.driver_id.in_(driver_ids))
            .group_by(Receipt.driver_id)
        )
        count_rows = dict(count_result.all())

    return [
        DriverOut(
            id=str(d.id),
            name=d.name,
            phone=d.phone,
            email=d.email,
            whatsapp_subscribed=d.whatsapp_subscribed,
            receipt_count=count_rows.get(d.id, 0),
            is_active=d.is_active,
        )
        for d in drivers
    ]


@router.post("", status_code=201)
async def add_driver(
    driver: DriverCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a new driver to a company."""
    # Check for duplicate phone
    existing = await db.execute(
        select(User).where(User.phone == driver.phone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Phone number already registered")

    new_driver = User(
        tenant_id=driver.tenant_id,
        role="driver",
        name=driver.name,
        phone=driver.phone,
        email=driver.email,
    )
    db.add(new_driver)
    await db.commit()

    return {
        "message": "Driver added successfully",
        "id": str(new_driver.id),
    }


@router.delete("/{driver_id}")
async def remove_driver(
    driver_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a driver (set is_active=False)."""
    result = await db.execute(select(User).where(User.id == driver_id))
    driver = result.scalar_one_or_none()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    driver.is_active = False
    await db.commit()

    return {"message": "Driver removed"}
