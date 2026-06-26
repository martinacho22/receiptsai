# ReceiptsAI — Demo v2 (Premium Mock)

Full interactive webapp demo for **Concretera del Bajío**.

## How to view

Open the generated `demo/index.html` in your browser — it's a standalone file with zero external dependencies.

## How to rebuild (change data)

```bash
python3 demo/build_demo.py
# Output: demo/index.html
```

Edit `demo/build_demo.py` — all data (company, employees, receipts, pricing) is at the top as Python dicts.

## What's in it

| Page | What it shows |
|------|---------------|
| Dashboard | KPIs: total owed, employees, pending review, approved |
| A Pagar | Approved amounts per employee, mark-as-paid action, payment history |
| Comprobantes | All receipts with status, detail modal with AI confidence badges |
| Conductores | Driver list with WhatsApp link status, "Remind" action |
| Configuración | 4 pricing tiers (Básico through Corporativo) |

## Design decisions (per critique)

- Deep teal brand palette (`#0d7675`) instead of default blue
- Inter typeface + tabular-nums on all money columns
- Inline Lucide-style SVG icons instead of emoji
- Receipt review modal: photo + editable fields + per-field confidence badges
- Loading states: "Reading with AI…" spinner
- Job-based nav (A Pagar, not "Employees")
- Distinct "Paid" vs "Approved" visual styles
- Payment history + confirmation dialogs on money actions
- 44px min touch targets, focus-visible rings
- All aggregates computed from the same line-item data
