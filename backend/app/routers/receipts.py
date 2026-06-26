"""Receipts router — list, filter, approve, reject, and export receipts."""

import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from pydantic import BaseModel
from app.database import get_db
from app.models.receipt import Receipt
from app.models.user import User

router = APIRouter(prefix="/receipts", tags=["receipts"])


# --- Schemas ---

class ReceiptOut(BaseModel):
    id: str
    driver_id: str
    driver_name: str = ""
    image_url: str | None = None
    amount: float | None = None
    currency: str = "MXN"
    receipt_date: str | None = None
    vendor_name: str | None = None
    category: str | None = None
    status: str
    notes: str | None = None
    created_at: str

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str  # approved, rejected, paid
    notes: str | None = None


class SummaryOut(BaseModel):
    total_pending: int
    total_approved: int
    total_paid: int
    pending_amount: float
    approved_amount: float
    paid_amount: float


# --- Routes ---

@router.get("/summary")
async def get_summary(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Dashboard summary — counts and totals by status."""
    # Pending
    pending = await db.execute(
        select(func.count(), func.coalesce(func.sum(Receipt.amount), 0))
        .where(Receipt.tenant_id == tenant_id, Receipt.status == "pending")
    )
    pending_count, pending_amount = pending.one()

    # Approved
    approved = await db.execute(
        select(func.count(), func.coalesce(func.sum(Receipt.amount), 0))
        .where(Receipt.tenant_id == tenant_id, Receipt.status == "approved")
    )
    approved_count, approved_amount = approved.one()

    # Paid
    paid = await db.execute(
        select(func.count(), func.coalesce(func.sum(Receipt.amount), 0))
        .where(Receipt.tenant_id == tenant_id, Receipt.status == "paid")
    )
    paid_count, paid_amount = paid.one()

    return SummaryOut(
        total_pending=pending_count,
        total_approved=approved_count,
        total_paid=paid_count,
        pending_amount=float(pending_amount),
        approved_amount=float(approved_amount),
        paid_amount=float(paid_amount),
    )


@router.get("")
async def list_receipts(
    tenant_id: uuid.UUID,
    driver_id: uuid.UUID | None = None,
    status: str | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List receipts with filters. Ordered by created_at descending."""
    query = (
        select(Receipt)
        .options(joinedload(Receipt.driver))
        .where(Receipt.tenant_id == tenant_id)
    )

    if driver_id:
        query = query.where(Receipt.driver_id == driver_id)
    if status:
        query = query.where(Receipt.status == status)
    if category:
        query = query.where(Receipt.category == category)
    if date_from:
        query = query.where(Receipt.receipt_date >= date_from)
    if date_to:
        query = query.where(Receipt.receipt_date <= date_to)

    query = query.order_by(Receipt.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    receipts = result.scalars().all()

    return [
        ReceiptOut(
            id=str(r.id),
            driver_id=str(r.driver_id),
            driver_name=r.driver.name if r.driver else "",
            image_url=r.image_url,
            amount=float(r.amount) if r.amount else None,
            currency=r.currency,
            receipt_date=str(r.receipt_date) if r.receipt_date else None,
            vendor_name=r.vendor_name,
            category=r.category,
            status=r.status,
            notes=r.notes,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in receipts
    ]


@router.patch("/{receipt_id}/status")
async def update_receipt_status(
    receipt_id: uuid.UUID,
    update: StatusUpdate,
    admin_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Approve, reject, or mark a receipt as paid."""
    result = await db.execute(select(Receipt).where(Receipt.id == receipt_id))
    receipt = result.scalar_one_or_none()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    receipt.status = update.status
    receipt.notes = update.notes or receipt.notes
    receipt.approved_by = admin_id

    if update.status == "paid":
        from datetime import datetime, timezone
        receipt.paid_at = datetime.now(timezone.utc)

    await db.commit()

    return {"message": f"Receipt {update.status}", "id": str(receipt_id)}
