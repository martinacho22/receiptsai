# ReceiptsAI

WhatsApp receipt management for Mexican transport fleets. Drivers send gas/ maintenance receipts via WhatsApp → AI extracts the data → Web dashboard for review and payment.

## File Tree

```
receiptsai/
├── README.md
├── backend/
│   ├── .env.example          # Configuration template (15 vars)
│   └── app/
│       ├── __init__.py
│       ├── config.py         # Settings from env
│       ├── database.py       # SQLAlchemy async session
│       ├── main.py           # FastAPI app entry
│       ├── models/           # SQLAlchemy models (6 files)
│       ├── routers/          # API route handlers (5 files)
│       │   ├── auth.py       # JWT login
│       │   ├── drivers.py    # CRUD drivers
│       │   ├── receipts.py   # Receipt queries & updates
│       │   └── webhooks.py   # Twilio WhatsApp inbound
│       ├── schemas/          # Pydantic request/response models
│       ├── services/         # Business logic (5 files)
│       │   ├── billing.py
│       │   ├── image_storage.py
│       │   ├── receipt_parser.py
│       │   └── whatsapp_handler.py
│       └── utils/            # Auth helpers, Twilio client
└── demo/
    ├── README.md             # Demo build instructions
    ├── build_demo.py         # Python generator — edit data, re-run
    └── index.html            # Standalone SPA (no dependencies)
```

## Backend Setup

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Edit .env with your secrets
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Swagger docs at `/docs`.

## Demo

The demo is a self-contained HTML file in `/demo/`. Open it in any browser — no server needed.

To customize: edit data at the top of `demo/build_demo.py` (employees, receipts, pricing), then:

```bash
python3 demo/build_demo.py
```

This overwrites `demo/index.html`. Open it in your browser.

## Architecture

```
WhatsApp → Twilio Webhook → FastAPI → AI Parser (Gemini/OpenAI)
                                         ↓
                                    Database
                                         ↓
                                    FastAPI REST → React (future) / demo HTML (now)
```

- Async FastAPI with SQLAlchemy async sessions
- WhatsApp receipt ingestion via Twilio webhook
- AI receipt parsing with configurable provider (Gemini, GPT-4o, Claude)
- Per-field confidence scoring on extracted data
- Driver/vehicle management with group assignment
- Payment reconciliation & billing tiers
