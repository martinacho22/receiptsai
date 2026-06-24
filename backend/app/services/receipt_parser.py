"""Receipt image parser using GPT-4o Vision API.

Takes a receipt photo URL, sends it to OpenAI Vision, and returns
structured data: amount, currency, date, vendor, category, confidence.
"""

import json
import logging
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.openai_api_key)

PARSING_PROMPT = """
Eres un sistema de OCR especializado en recibos mexicanos.
Analiza la imagen del recibo y extrae la siguiente información en formato JSON:

{
  "amount": 450.00,
  "currency": "MXN",
  "receipt_date": "2026-06-23",
  "vendor_name": "PEMEX San Angel",
  "category": "fuel",
  "confidence": "high"
}

REGLAS:
- Monto = total pagado (el numero mas grande, con IVA incluido)
- Fecha en formato YYYY-MM-DD
- Categoria: gasolinera = fuel, caseta = toll, taller = maintenance, comida = meal
- Si no puedes leer algo claramente, pon null
- Responde SOLO el JSON, nada mas
"""


async def parse_receipt_image(image_url: str) -> dict:
    """Send receipt image to GPT-4o Vision and return structured data."""
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": PARSING_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                                "detail": "high",
                            },
                        },
                    ],
                }
            ],
            max_tokens=500,
            temperature=0.1,
        )

        raw = response.choices[0].message.content or "{}"

        # Strip markdown code fences if present
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0].strip()
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0].strip()

        parsed = json.loads(raw)

        if parsed.get("amount") is None:
            parsed["confidence"] = "low"

        logger.info(
            "Parsed receipt: amount=%s vendor=%s confidence=%s",
            parsed.get("amount"),
            parsed.get("vendor_name"),
            parsed.get("confidence"),
        )
        return parsed

    except Exception as e:
        logger.error("Receipt parsing failed: %s", e)
        return {
            "amount": None,
            "currency": "MXN",
            "receipt_date": None,
            "vendor_name": None,
            "category": "other",
            "confidence": "low",
            "error": str(e),
        }
