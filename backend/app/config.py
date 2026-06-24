"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    secret_key: str = "change-me"

    # Database
    database_url: str = "postgresql+asyncpg://localhost:5432/receiptsai"

    # Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_number: str = "whatsapp:+14155238886"

    # OpenAI
    openai_api_key: str = ""

    # Storage (S3-compatible — works with R2, MinIO, AWS S3)
    storage_endpoint: str = ""
    storage_access_key_id: str = ""
    storage_secret_access_key: str = ""
    storage_bucket_name: str = "receiptsai-uploads"
    storage_public_url: str = ""

    # Mercado Pago
    mercadopago_access_token: str = ""
    mercadopago_public_key: str = ""

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # JWT
    jwt_secret: str = "change-me-too"
    jwt_expiry_hours: int = 168

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
