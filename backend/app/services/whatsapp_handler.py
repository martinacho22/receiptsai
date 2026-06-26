"""WhatsApp message handler — orchestrates the full receipt processing pipeline.

Flow:
1. Receive incoming message from Twilio webhook
2. Look up sender by phone number
3. If unknown → reply with registration prompt
4. If known driver → download image, upload to S3, parse with AI, save to DB
5. Reply to driver with confirmation
"""

import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_factory
from app.models.user import User
from app.models.receipt import Receipt
from app.models.whatsapp_message import WhatsAppMessage
from app.services.receipt_parser import parse_receipt_image
from app.services.image_storage import upload_receipt_image
from app.utils.twilio_client import send_whatsapp_message

logger = logging.getLogger(__name__)


async def process_incoming_message(
    from_phone: str,
    media_url: str | None,
    media_content_type: str | None,
    twilio_sid: str,
    raw_payload: dict | None = None,
) -> None:
    """Main pipeline — takes a WhatsApp message and processes it end-to-end."""
    async with async_session_factory() as db:
        try:
            # Step 1: Normalize phone number
            clean_phone = from_phone.replace("whatsapp:", "").replace("+", "")

            # Step 2: Look up driver
            result = await db.execute(
                select(User).where(
                    User.phone.like(f"%{clean_phone}"),
                    User.role == "driver",
                    User.is_active == True,
                )
            )
            driver = result.scalar_one_or_none()

            if driver is None:
                # Unknown number — log and reply
                await _log_message(
                    db, twilio_sid, from_phone, "text",
                    is_processed=False, processing_error="unknown_driver",
                )
                await send_whatsapp_message(
                    from_phone,
                    "Hola! Este bot es para empleados de empresas registradas. "
                    "Pide a tu jefe que registre tu numero en ReceiptsAI.",
                )
                return

            # Step 3: Validate — must be an image
            if media_url is None or "image" not in (media_content_type or ""):
                await send_whatsapp_message(
                    from_phone,
                    "Para registrar un gasto, envia una FOTO del recibo. "
                    "Los mensajes de texto no los proceso.",
                )
                return

            # Step 4: Upload image to permanent storage
            object_key = f"{driver.tenant_id}/{driver.id}/{twilio_sid}.jpg"
            s3_url = await upload_receipt_image(media_url, object_key)

            if s3_url is None:
                await send_whatsapp_message(
                    from_phone,
                    "Error al guardar la imagen. Intenta de nuevo.",
                )
                return

            # Step 5: Parse receipt with AI
            parsed = await parse_receipt_image(s3_url)

            # Step 6: Save receipt to database
            receipt = Receipt(
                tenant_id=driver.tenant_id,
                driver_id=driver.id,
                image_url=s3_url,
                parsed_data=parsed,
                amount=parsed.get("amount"),
                receipt_date=parsed.get("receipt_date"),
                vendor_name=parsed.get("vendor_name"),
                category=parsed.get("category", "other"),
                status="pending",
            )
            db.add(receipt)
            await db.commit()

            # Step 7: Send confirmation to driver
            if parsed.get("amount") and parsed.get("confidence") != "low":
                msg_lines = [
                    "Recibo guardado:",
                    f"Monto: ${parsed['amount']:,.2f} MXN",
                ]
                if parsed.get("vendor_name"):
                    msg_lines.append(f"Establecimiento: {parsed['vendor_name']}")
                if parsed.get("receipt_date"):
                    msg_lines.append(f"Fecha: {parsed['receipt_date']}")
                msg_lines.append("La oficina ya puede revisarlo.")
                await send_whatsapp_message(from_phone, "\n".join(msg_lines))
            else:
                await send_whatsapp_message(
                    from_phone,
                    "Recibo guardado, pero no pude leerlo todo con claridad. "
                    "La oficina lo revisara manualmente. "
                    "Para la proxima, env?a una foto mas clara.",
                )

            # Step 8: Log the processed message
            await _log_message(
                db, twilio_sid, from_phone, "image",
                media_url=media_url,
                driver_id=driver.id,
                receipt_id=receipt.id,
                is_processed=True,
            )

        except Exception as e:
            logger.error("Failed to process message: %s", e, exc_info=True)
            try:
                await send_whatsapp_message(
                    from_phone,
                    "Ocurrio un error procesando tu recibo. Intenta de nuevo.",
                )
            except Exception:
                logger.error("Also failed to send error reply")
            await _log_message(
                db, twilio_sid, from_phone, "image" if media_url else "text",
                media_url=media_url,
                is_processed=False,
                processing_error=str(e),
            )


async def _log_message(
    db: AsyncSession,
    twilio_sid: str,
    from_phone: str,
    message_type: str,
    media_url: str | None = None,
    driver_id=None,
    receipt_id=None,
    is_processed: bool = False,
    processing_error: str | None = None,
) -> None:
    """Helper to persist a WhatsApp message log row."""
    log_entry = WhatsAppMessage(
        twilio_sid=twilio_sid,
        from_phone=from_phone,
        message_type=message_type,
        media_url=media_url,
        driver_id=driver_id,
        receipt_id=receipt_id,
        is_processed=is_processed,
        processing_error=processing_error,
    )
    db.add(log_entry)
    await db.commit()
