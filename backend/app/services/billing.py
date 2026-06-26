"""Billing service — Mercado Pago subscription management.

Stub: implement full MP API calls when ready to launch payments.
"""

import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def create_subscription_preapproval(
    tenant_id: str,
    plan: str,
    payer_email: str,
) -> dict:
    """Create a Mercado Pago recurring subscription.

    TODO: Implement with MP's /preapproval endpoint.
    """
    logger.info(
        "Creating subscription: tenant=%s plan=%s email=%s",
        tenant_id, plan, payer_email,
    )
    return {
        "status": "pending",
        "preapproval_id": None,
        "init_point": None,
        "message": "Mercado Pago integration not yet implemented.",
    }


async def cancel_subscription(preapproval_id: str) -> bool:
    """Cancel an active Mercado Pago subscription."""
    logger.info("Cancelling subscription: %s", preapproval_id)
    return True
