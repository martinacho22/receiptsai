"""WhatsApp webhook — receives incoming messages from Twilio.

Twilio sends a POST request here whenever a driver sends a message to
the WhatsApp number. This handler:
- Extracts the sender's phone number and media (if any)
- Fires off the processing pipeline
- Returns a TwiML response immediately (Twilio needs this < 15s)
"""

from fastapi import APIRouter, Request
from twilio.twiml.messaging_response import MessagingResponse
from app.services.whatsapp_handler import process_incoming_message

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """Receive incoming WhatsApp message from Twilio."""
    form = await request.form()
    from_phone = form.get("From", "")
    message_sid = form.get("MessageSid", "")
    num_media = int(form.get("NumMedia", 0))

    if num_media > 0:
        media_url = form.get("MediaUrl0", "")
        media_content_type = form.get("MediaContentType0", "")

        # Process in background — reply to Twilio immediately
        await process_incoming_message(
            from_phone=from_phone,
            media_url=media_url,
            media_content_type=media_content_type,
            twilio_sid=message_sid,
            raw_payload=dict(form),
        )

    # Respond to Twilio immediately
    resp = MessagingResponse()
    resp.message("Recibido!")
    return Response(content=str(resp), media_type="application/xml")


from starlette.responses import Response
