"""Demo data seeder - creates the demo tenant, users, and receipts.

Called by POST /auth/demo-login on first invocation. Idempotent:
subsequent calls simply return the existing demo tenant admin JWT.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant import Tenant
from app.models.user import User
from app.models.subscription import Subscription
from app.models.receipt import Receipt
from app.utils.auth import hash_password
from app.utils.demo import (
    DEMO_TENANT_ID,
    DEMO_TENANT_NAME,
    DEMO_TENANT_SLUG,
    DEMO_ADMIN_ID,
    DEMO_ADMIN_EMAIL,
    DEMO_ADMIN_PHONE,
    DEMO_ADMIN_NAME,
    DEMO_ADMIN_PASSWORD,
    DEMO_SUBSCRIPTION_ID,
    DEMO_DRIVERS,
    DEMO_RECEIPTS,
)


async def seed_demo_data(db: AsyncSession):
    """Ensure demo tenant + data exist. Returns the admin user."""
    # Check if demo tenant already exists
    result = await db.execute(
        select(Tenant).where(Tenant.slug == DEMO_TENANT_SLUG)
    )
    existing = result.scalar_one_or_none()
    if existing is not None:
        # Tenant exists - just find admin user
        admin_result = await db.execute(
            select(User).where(
                User.tenant_id == existing.id,
                User.role == "admin",
            )
        )
        return admin_result.scalar_one_or_none()

    # Create tenant with fixed ID
    tenant = Tenant(
        id=DEMO_TENANT_ID,
        name=DEMO_TENANT_NAME,
        slug=DEMO_TENANT_SLUG,
        country="MX",
        currency="MXN",
    )
    db.add(tenant)
    await db.flush()

    # Create subscription
    sub = Subscription(
        id=DEMO_SUBSCRIPTION_ID,
        tenant_id=DEMO_TENANT_ID,
        plan="trial",
        max_drivers=10,
        status="trialing",
    )
    db.add(sub)
    await db.flush()

    # Create admin user
    admin = User(
        id=DEMO_ADMIN_ID,
        tenant_id=DEMO_TENANT_ID,
        role="admin",
        name=DEMO_ADMIN_NAME,
        phone=DEMO_ADMIN_PHONE,
        email=DEMO_ADMIN_EMAIL,
        password_hash=hash_password(DEMO_ADMIN_PASSWORD),
        is_active=True,
    )
    db.add(admin)
    await db.flush()

    # Create driver users
    for d in DEMO_DRIVERS:
        driver = User(
            id=d["id"],
            tenant_id=DEMO_TENANT_ID,
            role="driver",
            name=d["name"],
            phone=d["phone"],
            is_active=True,
        )
        db.add(driver)
    await db.flush()

    # Create receipts
    for r in DEMO_RECEIPTS:
        driver_id = DEMO_DRIVERS[r["driver_idx"]]["id"]
        receipt = Receipt(
            id=r["id"],
            tenant_id=DEMO_TENANT_ID,
            driver_id=driver_id,
            amount=Decimal(str(r["amount"])),
            currency="MXN",
            receipt_date=r["receipt_date"],
            vendor_name=r["vendor_name"],
            category="fuel",
            status=r["status"],
            parsed_data={
                "liters": r.get("liters"),
                "price_per_liter": r.get("price_per_liter"),
                "vendor_raw": r["vendor_name"],
            },
        )
        if r["status"] == "paid":
            receipt.paid_at = datetime.combine(
                r["receipt_date"], datetime.min.time()
            ).replace(tzinfo=timezone.utc)

        db.add(receipt)

    await db.flush()

    return admin
