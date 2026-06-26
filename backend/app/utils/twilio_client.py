"""Twilio client — sends WhatsApp messages back to drivers."""

import logging
from twilio.rest import Client
from app.config import settings

logger = logging.getLogger(__name__)

twilio_client = Client(settings.twilio_account_sid, settings.twilio_auth_token)


async def send_whatsapp_message(to: str, message: str) -> bool:
    """Send a WhatsApp message via Twilio.

    Args:
        to: Recipient number including 'whatsapp:' prefix, e.g. 'whatsapp:+5215551234567'
        message: Text content to send.

    Returns:
        True if sent successfully, False otherwise.
    """
    try:
        twilio_client.messages.create(
            body=message,
            from_=settings.twilio_whatsapp_number,
            to=to,
        )
        logger.info("Sent WhatsApp to %s: %.50s...", to, message)
        return True
    except Exception as e:
        logger.error("Failed to send WhatsApp to %s: %s", to, e)
        return False
