"""ReceiptsAI — FastAPI Application Entry Point.

Run with: uvicorn app.main:app --reload
"""

import logging
import os
from contextlib import asynccontextmanager

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
    allow_origins=["*"] if settings.environment == "development" else [settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth.router)
app.include_router(receipts.router)
app.include_router(drivers.router)


# --- Health check ---
@app.get("/health")
async def health():
    return {"status": "ok", "service": "receiptsai", "version": "0.1.0"}


# --- Static files (frontend SPA) — mount AFTER API routes ---
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")
if os.path.isdir(frontend_dir):
    # Mount the frontend at /app so index.html is served at /app/
    # All static assets (js/, css/, assets/) are served under /app/ too
    logger.info(f"Mounting frontend from {frontend_dir} at /app")
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")
else:
    logger.warning(f"Frontend directory not found at {frontend_dir} — serving API only")
