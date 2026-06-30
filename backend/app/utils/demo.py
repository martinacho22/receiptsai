"""Demo seed constants — fixed UUIDs and data for the demo tenant.

Used by services/demo.py to seed the database on first demo-login call.
"""

import uuid

# ── Fixed UUIDs for idempotent seeding ────────────────────────────────

DEMO_TENANT_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
DEMO_ADMIN_ID = uuid.UUID("00000000-0000-0000-0000-000000000100")
DEMO_SUBSCRIPTION_ID = uuid.UUID("00000000-0000-0000-0000-000000000200")

DEMO_DRIVER_IDS = [
    uuid.UUID("00000000-0000-0000-0000-000000000101"),  # Juan Pérez
    uuid.UUID("00000000-0000-0000-0000-000000000102"),  # María García
    uuid.UUID("00000000-0000-0000-0000-000000000103"),  # Carlos López
    uuid.UUID("00000000-0000-0000-0000-000000000104"),  # Ana Martínez
    uuid.UUID("00000000-0000-0000-0000-000000000105"),  # Pedro Ramírez
]

DEMO_RECEIPT_IDS = [
    uuid.UUID("00000000-0000-0000-0000-000000000201"),
    uuid.UUID("00000000-0000-0000-0000-000000000202"),
    uuid.UUID("00000000-0000-0000-0000-000000000203"),
    uuid.UUID("00000000-0000-0000-0000-000000000204"),
    uuid.UUID("00000000-0000-0000-0000-000000000205"),
    uuid.UUID("00000000-0000-0000-0000-000000000206"),
    uuid.UUID("00000000-0000-0000-0000-000000000207"),
    uuid.UUID("00000000-0000-0000-0000-000000000208"),
]

# ── Tenant ─────────────────────────────────────────────────────────────

DEMO_TENANT_NAME = "Concretera del Bajío"
DEMO_TENANT_SLUG = "demo"

# ── Admin user ─────────────────────────────────────────────────────────

DEMO_ADMIN_EMAIL = "demo@receiptsai.app"
DEMO_ADMIN_PHONE = "+521111111100"
DEMO_ADMIN_NAME = "Admin Demo"
DEMO_ADMIN_PASSWORD = "demo1234"  # hashed at runtime

# ── Drivers ────────────────────────────────────────────────────────────

DEMO_DRIVERS = [
    {"id": DEMO_DRIVER_IDS[0], "name": "Juan Pérez",    "vehicle": "Ram 3500 2021 · ABC-123", "phone": "+521111111101"},
    {"id": DEMO_DRIVER_IDS[1], "name": "María García",  "vehicle": "Kenworth T680 · DEF-456", "phone": "+521111111102"},
    {"id": DEMO_DRIVER_IDS[2], "name": "Carlos López",  "vehicle": "International HV · GHI-789", "phone": "+521111111103"},
    {"id": DEMO_DRIVER_IDS[3], "name": "Ana Martínez",  "vehicle": "Freightliner M2 · JKL-012", "phone": "+521111111104"},
    {"id": DEMO_DRIVER_IDS[4], "name": "Pedro Ramírez", "vehicle": "Ram 4500 2022 · MNO-345", "phone": "+521111111105"},
]

# ── Receipts ───────────────────────────────────────────────────────────

from datetime import date

DEMO_RECEIPTS = [
    {
        "id": DEMO_RECEIPT_IDS[0],
        "driver_idx": 0,  # Juan Pérez
        "vendor_name": "Gasolinera PEMEX León",
        "receipt_date": date(2026, 6, 22),
        "amount": 2856.00,
        "liters": 120,
        "price_per_liter": 23.80,
        "status": "pending",
    },
    {
        "id": DEMO_RECEIPT_IDS[1],
        "driver_idx": 0,  # Juan Pérez
        "vendor_name": "Gasolinera Oxxo Gas Silao",
        "receipt_date": date(2026, 6, 20),
        "amount": 1997.50,
        "liters": 85,
        "price_per_liter": 23.50,
        "status": "pending",
    },
    {
        "id": DEMO_RECEIPT_IDS[2],
        "driver_idx": 0,  # Juan Pérez
        "vendor_name": "PEMEX Irapuato",
        "receipt_date": date(2026, 6, 18),
        "amount": 2256.25,
        "liters": 95,
        "price_per_liter": 23.75,
        "status": "pending",
    },
    {
        "id": DEMO_RECEIPT_IDS[3],
        "driver_idx": 1,  # María García
        "vendor_name": "Gasolinera La Piedad",
        "receipt_date": date(2026, 6, 21),
        "amount": 4720.00,
        "liters": 200,
        "price_per_liter": 23.60,
        "status": "pending",
    },
    {
        "id": DEMO_RECEIPT_IDS[4],
        "driver_idx": 1,  # María García
        "vendor_name": "PEMEX Salamanca",
        "receipt_date": date(2026, 6, 19),
        "amount": 4212.00,
        "liters": 180,
        "price_per_liter": 23.40,
        "status": "approved",
    },
    {
        "id": DEMO_RECEIPT_IDS[5],
        "driver_idx": 2,  # Carlos López
        "vendor_name": "Oxxo Gas Celaya",
        "receipt_date": date(2026, 6, 23),
        "amount": 1434.00,
        "liters": 60,
        "price_per_liter": 23.90,
        "status": "pending",
    },
    {
        "id": DEMO_RECEIPT_IDS[6],
        "driver_idx": 3,  # Ana Martínez
        "vendor_name": "PEMEX Querétaro",
        "receipt_date": date(2026, 6, 17),
        "amount": 3532.50,
        "liters": 150,
        "price_per_liter": 23.55,
        "status": "paid",
    },
    {
        "id": DEMO_RECEIPT_IDS[7],
        "driver_idx": 4,  # Pedro Ramírez
        "vendor_name": "Gasolinera San Miguel",
        "receipt_date": date(2026, 6, 22),
        "amount": 2607.00,
        "liters": 110,
        "price_per_liter": 23.70,
        "status": "pending",
    },
]
