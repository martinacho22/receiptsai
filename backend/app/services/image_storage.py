"""Image storage service — uploads receipt photos to S3-compatible storage.

Supports Cloudflare R2, AWS S3, MinIO, or any S3-compatible API.
"""

import logging
import httpx
import boto3
from botocore.config import Config
from app.config import settings

logger = logging.getLogger(__name__)

s3_client = boto3.client(
    "s3",
    endpoint_url=settings.storage_endpoint,
    aws_access_key_id=settings.storage_access_key_id,
    aws_secret_access_key=settings.storage_secret_access_key,
    config=Config(signature_version="s3v4"),
)


async def upload_receipt_image(
    twilio_media_url: str, object_key: str
) -> str | None:
    """Download a receipt from Twilio's temp URL and upload to S3/R2.

    Args:
        twilio_media_url: Temporary Twilio media URL.
        object_key: Desired S3 key, e.g. 'tenant_id/driver_id/msg_id.jpg'

    Returns:
        Public URL of the uploaded image, or None on failure.
    """
    try:
        # Download from Twilio
        async with httpx.AsyncClient() as http:
            resp = await http.get(twilio_media_url, timeout=30)
            resp.raise_for_status()
            image_bytes = resp.content

        # Upload to S3/R2
        s3_client.put_object(
            Bucket=settings.storage_bucket_name,
            Key=object_key,
            Body=image_bytes,
            ContentType=resp.headers.get("content-type", "image/jpeg"),
        )

        # Construct public URL
        if settings.storage_public_url:
            public_url = f"{settings.storage_public_url.rstrip('/')}/{object_key}"
        else:
            public_url = (
                f"{settings.storage_endpoint.rstrip('/')}/"
                f"{settings.storage_bucket_name}/{object_key}"
            )

        logger.info("Uploaded receipt image to %s", public_url)
        return public_url

    except Exception as e:
        logger.error("Failed to upload receipt image: %s", e)
        return None
