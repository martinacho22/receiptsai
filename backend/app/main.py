"""ReceiptsAI — FastAPI Application Entry Point.

Run with: uvicorn app.main:app --reload
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import auth, receipts, drivers

# --- Logging setup ---
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# --- Lifespan (startup/shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ReceiptsAI...")
    if settings.environment == "development":
        await init_db()
        logger.info("Database tables created (dev mode)")
    yield
    logger.info("Shutting down ReceiptsAI...")


# --- App instance ---
app = FastAPI(
    title="ReceiptsAI API",
    description="WhatsApp-based receipt management for transport fleets in Mexico.",
    version="0.1.0",
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth.router)
app.include_router(receipts.router)
app.include_router(drivers.router)

# --- Static files (frontend) ---
frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend"
if frontend_dir.is_dir():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")
    logger.info("Frontend mounted from %s", frontend_dir)
else:
    logger.warning("Frontend directory not found at %s — serving API only", frontend_dir)


# --- Health check ---
@app.get("/health")
async def health():
    return {"status": "ok", "service": "receiptsai", "version": "0.1.0"}
