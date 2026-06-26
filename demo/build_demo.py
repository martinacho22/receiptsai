#!/usr/bin/env python3
"""ReceiptsAI Demo v2 — Premium Mock Webapp Generator.

Run:  python3 demo/build_demo.py
Output: demo/index.html (standalone, zero-dependency HTML file)
"""

import json

# ── DATA ──────────────────────────────────────────────────────────────
COMPANY = "Concretera del Bajío"
COMPANY_SHORT = "CDB"

TIERS = [
    {"name": "Básico",     "range": "0–50 empleados",    "price_mxn": 400,
     "features": ["Hasta 50 empleados", "Gestión de recibos básica", "Soporte por WhatsApp"]},
    {"name": "Profesional","range": "50–100 empleados",   "price_mxn": 1000,
     "features": ["Hasta 100 empleados", "Conciliación automática", "Reportes semanales", "Soporte prioritario"]},
    {"name": "Empresarial","range": "100–500 empleados",  "price_mxn": 2500,
     "features": ["Hasta 500 empleados", "OCR avanzado", "API para contabilidad", "Reportes personalizados", "Gerente de cuenta"]},
    {"name": "Corporativo","range": "500+ empleados",     "price_mxn": 5000,
     "features": ["Empleados ilimitados", "Todo incluido", "Integración ERP", "SLA 99.9%", "Soporte 24/7"]},
]

_emp_data = [
    ("E001","Juan Pérez",         "Ram 3500 2021 · ABC-123",   True,  [0,1,2]),
    ("E002","María García",       "Kenworth T680 · DEF-456",   True,  [3,4]),
    ("E003","Carlos López",       "International HV · GHI-789",True,  [5]),
    ("E004","Ana Martínez",       "Freightliner M2 · JKL-012", False, [6]),
    ("E005","Pedro Ramírez",      "Ram 4500 2022 · MNO-345",   True,  [7]),
]

EMP = []
for eid, name, veh, link, rids in _emp_data:
    EMP.append({"id": eid, "name": name, "vehicle": veh, "linked": link, "receipts": rids})

_rec_data = [
    ("R001","E001","Gasolinera PEMEX León",     "2026-06-22",120,23.80,2856.00,"in_review",0.97),
    ("R002","E001","Gasolinera Oxxo Gas Silao", "2026-06-20",85, 23.50,1997.50,"in_review",0.88),
    ("R003","E001","PEMEX Irapuato",            "2026-06-18",95, 23.75,2256.25,"pending",  0.95),
    ("R004","E002","Gasolinera La Piedad",      "2026-06-21",200,23.60,4720.00,"in_review",0.72),
    ("R005","E002","PEMEX Salamanca",           "2026-06-19",180,23.40,4212.00,"approved", 0.99),
    ("R006","E003","Oxxo Gas Celaya",           "2026-06-23",60, 23.90,1434.00,"pending",  0.93),
    ("R007","E004","PEMEX Querétaro",           "2026-06-17",150,23.55,3532.50,"paid",     0.96),
    ("R008","E005","Gasolinera San Miguel",     "2026-06-22",110,23.70,2607.00,"pending",  0.91),
]

REC = []
for rid, eid, ven, dt, lit, ppl, amt, st, conf in _rec_data:
    REC.append({"id": rid, "emp_id": eid, "vendor": ven, "date": dt,
                "liters": lit, "price_per_liter": ppl, "amount": amt,
                "currency":"MXN", "status": st, "confidence": conf,
                "photo": "receipt_placeholder"})

STATUS_LABELS = {"pending":"Pendiente","in_review":"En revisión","approved":"Aprobado","paid":"Pagado"}

# Check icon constants shared between Python-generate HTML and JS-template HTML
CHECK_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
X_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
DOC_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
# ── END DATA ──

# ── HELPERS ──
def fmt(amount):
    return "${:,.2f}".format(amount)

def total_owed():
    return sum(r["amount"] for r in REC)

def pending_review_count():
    return sum(1 for r in REC if r["status"]=="in_review")

def pending_review_amount():
    return sum(r["amount"] for r in REC if r["status"]=="in_review")

def emp_total(e):
    return sum(REC[i]["amount"] for i in e["receipts"])

def emp_paid(e):
    return sum(REC[i]["amount"] for i in e["receipts"] if REC[i]["status"]=="paid")

def emp_approved(e):
    return sum(REC[i]["amount"] for i in e["receipts"] if REC[i]["status"]=="approved")

def emp_pending(e):
    return sum(REC[i]["amount"] for i in e["receipts"] if REC[i]["status"] in ("pending","in_review"))

def fee_total():
    return sum(r["amount"] for r in REC if r["status"] in ("paid","approved"))

# ── SVG ICONS (inline) ──
ICON = {}
ICON["logo"] = '<svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="24" height="18" rx="2"/><path d="M16 4v4M10 4v4M22 4v4"/><path d="M10 14h12M10 18h8M10 22h4"/></svg>'
ICON["dashboard"] = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
ICON["wallet"] = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1"/><path d="M19 12h-3a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 0 0-3z"/></svg>'
ICON["receipt"] = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5 4 2z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>'
ICON["users"] = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="3"/><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="7" r="3"/><path d="M15 21c0-3.3 2.7-6 6-6"/></svg>'
ICON["settings"] = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
ICON["upload"] = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
ICON["check"] = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
ICON["x"] = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
ICON["arrow_up"] = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>'
ICON["search"] = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
ICON["camera"] = '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="12" r="4"/></svg>'
ICON["refresh"] = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
ICON["trash"] = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
ICON["loader"] = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10" opacity=".2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>'

def svg(name):
    return ICON.get(name, "")

# ── BUILD HTML ──

def build():
    # Sidebar nav items
    nav_items = [
        ("dashboard","Dashboard"),
        ("pagar","A Pagar"),
        ("receipts","Comprobantes"),
        ("drivers","Conductores"),
    ]

    # Dashboard KPI summary
    kpi_cards = f'''
          <div class="kpi hero">
            <div class="label">Total adeudado este mes</div>
            <div class="value">{fmt(total_owed())}</div>
            <div class="sub">Suma de todos los comprobantes</div>
          </div>
          <div class="kpi">
            <div class="label">Empleados activos</div>
            <div class="value">{len(EMP)}</div>
            <div class="sub">{sum(1 for e in EMP if e["linked"])} vinculados a WhatsApp</div>
          </div>
          <div class="kpi">
            <div class="label">Pendientes de revisi&oacute;n</div>
            <div class="value">{pending_review_count()}</div>
            <div class="sub">{fmt(pending_review_amount())} por revisar</div>
          </div>
          <div class="kpi">
            <div class="label">Aprobado y por pagar</div>
            <div class="value">{fmt(fee_total())}</div>
            <div class="sub">{sum(1 for r in REC if r["status"]=="approved")} comprobantes</div>
          </div>'''

    # Employee summary table rows
    emp_rows = []
    for e in EMP:
        chk = CHECK_SVG if e["linked"] else X_SVG
        linked_text = f'''<span class="icon-check">{chk} Vinculado</span>''' if e["linked"] else f'''<span class="icon-x">{X_SVG} No vinculado</span>'''
        emp_rows.append(f'''<tr>
          <td><strong>{e["name"]}</strong></td>
          <td style="color:var(--g-500);font-size:13px;">{e["vehicle"]}</td>
          <td>{linked_text}</td>
          <td>{len(e["receipts"])}</td>
          <td class="money">{fmt(emp_total(e))}</td>
          <td class="money" style="color:var(--green)">{fmt(emp_paid(e))}</td>
          <td class="money" style="color:var(--amber)">{fmt(emp_pending(e))}</td>
        </tr>''')

    # Pagar table rows
    pagar_rows = []
    for e in EMP:
        pagar_rows.append(f'''<tr data-name="{e["name"].lower()}">
          <td><strong>{e["name"]}</strong></td>
          <td style="color:var(--g-500);font-size:13px;">{e["vehicle"]}</td>
          <td class="money" style="color:var(--green)">{fmt(emp_approved(e))}</td>
          <td class="money" style="color:var(--g-400)">{fmt(emp_paid(e))}</td>
          <td class="money" style="color:var(--amber);font-weight:700">{fmt(emp_approved(e)-emp_paid(e))}</td>
          <td><button class="btn btn-sm btn-success" onclick="markAsPaid('{e["id"]}')">{svg("check")} Pagar</button></td>
        </tr>''')

    # Receipt table rows
    rec_rows = []
    for r in REC:
        emp_name = [e["name"] for e in EMP if e["id"]==r["emp_id"]][0]
        lbl = STATUS_LABELS[r["status"]]
        paid_cls = "paid" if r["status"]=="paid" else ""
        rec_rows.append(f'''<tr class="{paid_cls}" data-id="{r["id"]}">
          <td style="color:var(--g-500);font-size:13px;">{r["id"]}</td>
          <td><strong>{emp_name}</strong></td>
          <td style="color:var(--g-500);font-size:13px;">{r["vendor"]}</td>
          <td>{r["date"]}</td>
          <td class="money">{r["liters"]}</td>
          <td class="money">{fmt(r["amount"])}</td>
          <td><span class="badge badge-{r["status"]}">{lbl}</span></td>
          <td><button class="btn btn-ghost btn-sm" onclick="openReceipt('{r["id"]}')">Detalle</button></td>
        </tr>''')

    # Drivers table rows
    drv_rows = []
    for e in EMP:
        linked_badge = f'''<span class="badge badge-approved">{svg("check")} Vinculado</span>''' if e["linked"] \
                       else '<span class="badge badge-pending">Sin vincular</span>'
        rec_count = len(e["receipts"])
        drv_rows.append(f'''<tr>
          <td><strong>{e["name"]}</strong></td>
          <td style="color:var(--g-500);font-size:13px;">{e["vehicle"]}</td>
          <td>{linked_badge}</td>
          <td>{rec_count}</td>
          <td class="money">{fmt(emp_total(e))}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="showToast('Recordatorio enviado a {e["name"]}')">Recordar</button></td>
        </tr>''')

    # Pricing cards
    pricing_cards = []
    for i, t in enumerate(TIERS):
        featured = i == 1
        badge_html = '<span class="popular-badge">M&aacute;s popular</span>' if featured else ''
        featured_cls = "featured" if featured else ""
        feats = "".join(f'<li>{svg("check")} {f}</li>' for f in t["features"])
        pricing_cards.append(f'''<div class="pricing-card {featured_cls}">
          {badge_html}
          <h3>{t["name"]}</h3>
          <p style="color:var(--g-400);font-size:13px;">{t["range"]}</p>
          <div class="price">${t["price_mxn"]:,}</div>
          <div class="price-sub">MXN / mes</div>
          <ul>{feats}</ul>
          <button class="btn btn-primary w-full">Seleccionar</button>
        </div>''')

    # Nav bar HTML — FIXED icon mapping
    nav_links = []
    for page_id, page_label in nav_items:
        active = "active" if page_id == "dashboard" else ""
        icon_name = {"dashboard":"dashboard","pagar":"wallet","receipts":"receipt","drivers":"users"}.get(page_id, "dashboard")
        nav_links.append(f'<a href="#" data-page="{page_id}" class="{active}">{svg(icon_name)} {page_label}</a>')
    nav_links.append('<div class="spacer"></div>')
    nav_links.append(f'<a href="#" data-page="settings">{svg("settings")} Configuraci&oacute;n</a>')

    # JSON data for JS
    r_json = json.dumps(REC)
    e_json = json.dumps([{"id": e["id"], "name": e["name"], "vehicle": e["vehicle"], "linked": e["linked"]} for e in EMP])

    # JS code with emoji-free strings (using SVG icons instead)
    approve_toast_icon = CHECK_SVG
    reject_toast_icon = X_SVG
    paid_toast_icon = CHECK_SVG
    upload_toast_icon = DOC_SVG

    html = f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{COMPANY} — ReceiptsAI · Control de Combustible</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  :root {{
    --p: #0d7675; --p-hover: #095c5b; --p-light: #e8f5f5;
    --s: #f7f5f2; --w: #ffffff; --b: #1a1a2e;
    --g-50:#f9fafb; --g-100:#f3f4f6; --g-200:#e5e7eb; --g-300:#d1d5db;
    --g-400:#9ca3af; --g-500:#6b7280; --g-600:#4b5563; --g-700:#374151;
    --amber:#d97706; --amber-bg:#fffbeb; --red:#dc2626; --red-bg:#fef2f2;
    --green:#059669; --blue:#2563eb;
    --radius:12px; --radius-sm:8px;
    --shadow-sm:0 1px 2px rgba(0,0,0,.06); --shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
    --shadow-md:0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.06);
    --font:'Inter',system-ui,-apple-system,sans-serif;
  }}
  html {{ font-size:16px; }}
  body {{ font-family:var(--font); background:var(--s); color:var(--b); min-height:100vh; }}
  .app {{ display:flex; min-height:100vh; }}
  /* ── Sidebar ── */
  .sidebar {{ width:240px; background:var(--w); border-right:1px solid var(--g-200); display:flex; flex-direction:column; position:sticky; top:0; height:100vh; }}
  .sidebar-brand {{ padding:20px 16px; display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--g-200); }}
  .sidebar-brand svg {{ color:var(--p); }}
  .sidebar-brand span {{ font-weight:600; font-size:16px; color:var(--b); }}
  .sidebar-brand small {{ font-size:11px; color:var(--g-400); display:block; margin-top:-2px; }}
  .sidebar-nav {{ flex:1; padding:12px 8px; display:flex; flex-direction:column; gap:2px; }}
  .sidebar-nav a {{ display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:var(--radius-sm); text-decoration:none; color:var(--g-600); font-size:14px; font-weight:500; transition:all .15s; min-height:44px; }}
  .sidebar-nav a:hover {{ background:var(--g-100); color:var(--b); }}
  .sidebar-nav a.active {{ background:var(--p-light); color:var(--p); }}
  .sidebar-nav a.active svg {{ stroke:var(--p); }}
  .sidebar-nav .spacer {{ flex:1; }}
  .sidebar-status {{ padding:16px; border-top:1px solid var(--g-200); }}
  .sidebar-status .indicator {{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--g-500); }}
  .sidebar-status .dot {{ width:8px; height:8px; border-radius:50%; background:var(--green); }}
  .sidebar-status .label {{ font-weight:500; }}
  /* ── Main ── */
  .main {{ flex:1; }}
  .topbar {{ display:flex; align-items:center; justify-content:space-between; padding:16px 32px; background:var(--w); border-bottom:1px solid var(--g-200); }}
  .topbar h1 {{ font-size:20px; font-weight:600; }}
  .topbar-right {{ display:flex; align-items:center; gap:16px; }}
  .topbar .avatar {{ width:36px; height:36px; border-radius:50%; background:var(--p-light); color:var(--p); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:14px; }}
  .page {{ padding:24px 32px; }}
  /* ── Cards ── */
  .card {{ background:var(--w); border-radius:var(--radius); box-shadow:var(--shadow); padding:20px; }}
  .card-header {{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }}
  .card-header h2 {{ font-size:16px; font-weight:600; }}
  .kpi-grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:24px; }}
  .kpi {{ background:var(--w); border-radius:var(--radius); padding:20px; box-shadow:var(--shadow); }}
  .kpi.hero {{ border-left:4px solid var(--p); background:linear-gradient(135deg,var(--w),var(--p-light)); }}
  .kpi .label {{ font-size:13px; color:var(--g-500); margin-bottom:4px; text-transform:uppercase; letter-spacing:.5px; font-weight:500; }}
  .kpi .value {{ font-size:28px; font-weight:700; font-variant-numeric:tabular-nums; color:var(--b); }}
  .kpi .sub {{ font-size:12px; color:var(--g-400); margin-top:2px; }}
  /* ── Tables ── */
  .table-wrap {{ overflow-x:auto; }}
  table {{ width:100%; border-collapse:collapse; font-size:14px; }}
  th {{ text-align:left; padding:10px 12px; font-weight:500; color:var(--g-500); font-size:12px; text-transform:uppercase; letter-spacing:.5px; border-bottom:2px solid var(--g-200); }}
  td {{ padding:10px 12px; border-bottom:1px solid var(--g-100); font-variant-numeric:tabular-nums; }}
  td.money {{ text-align:right; font-weight:600; font-variant-numeric:tabular-nums; white-space:nowrap; }}
  tr:hover td {{ background:var(--g-50); }}
  tr.paid td {{ opacity:.6; text-decoration:line-through; }}
  /* ── Badges ── */
  .badge {{ display:inline-flex; align-items:center; gap:4px; padding:2px 10px; border-radius:999px; font-size:12px; font-weight:500; }}
  .badge-pending {{ background:var(--amber-bg); color:var(--amber); }}
  .badge-in_review {{ background:#eff6ff; color:var(--blue); }}
  .badge-approved {{ background:#ecfdf5; color:var(--green); }}
  .badge-paid {{ background:var(--g-100); color:var(--g-500); }}
  /* Inline icon colors for linked/unlinked text */
  .icon-check svg {{ stroke:var(--green); vertical-align:middle; }}
  .icon-x svg {{ stroke:var(--g-400); vertical-align:middle; }}
  /* ── Buttons ── */
  .btn {{ display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:var(--radius-sm); font-size:13px; font-weight:500; border:none; cursor:pointer; transition:all .15s; text-decoration:none; min-height:44px; }}
  .btn-primary {{ background:var(--p); color:var(--w); }}
  .btn-primary:hover {{ background:var(--p-hover); }}
  .btn-ghost {{ background:transparent; color:var(--g-600); }}
  .btn-ghost:hover {{ background:var(--g-100); }}
  .btn-sm {{ padding:6px 12px; font-size:12px; min-height:32px; }}
  .btn-danger {{ background:var(--red-bg); color:var(--red); }}
  .btn-danger:hover {{ background:#fee2e2; }}
  .btn-success {{ background:#ecfdf5; color:var(--green); }}
  .btn-success:hover {{ background:#d1fae5; }}
  /* ── Modal ── */
  .modal-overlay {{ position:fixed; inset:0; background:rgba(0,0,0,.4); display:none; align-items:center; justify-content:center; z-index:100; backdrop-filter:blur(2px); }}
  .modal-overlay.open {{ display:flex; }}
  .modal {{ background:var(--w); border-radius:var(--radius); width:90%; max-width:640px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.2); padding:24px; }}
  .modal h2 {{ font-size:18px; margin-bottom:16px; }}
  .modal-close {{ float:right; background:none; border:none; cursor:pointer; padding:4px; min-height:36px; min-width:36px; }}
  .modal-actions {{ display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }}
  .receipt-review {{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }}
  .receipt-review .photo {{ background:var(--g-100); border-radius:var(--radius-sm); min-height:200px; display:flex; align-items:center; justify-content:center; color:var(--g-400); flex-direction:column; gap:8px; }}
  .receipt-review .photo svg {{ opacity:.4; }}
  .form-group {{ margin-bottom:12px; }}
  .form-group label {{ display:block; font-size:12px; font-weight:500; color:var(--g-600); margin-bottom:4px; }}
  .form-group input {{ width:100%; padding:8px 12px; border:1px solid var(--g-300); border-radius:var(--radius-sm); font-size:14px; font-family:var(--font); }}
  .form-group input:focus {{ outline:2px solid var(--p); outline-offset:-1px; border-color:transparent; }}
  .field-row {{ display:flex; align-items:center; gap:8px; }}
  .field-row input {{ flex:1; }}
  /* ── Pricing ── */
  .pricing-grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }}
  .pricing-card {{ background:var(--w); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow); border:1px solid var(--g-200); position:relative; }}
  .pricing-card.featured {{ border:2px solid var(--p); }}
  .pricing-card .popular-badge {{ position:absolute; top:-10px; right:16px; background:var(--p); color:var(--w); padding:2px 12px; border-radius:999px; font-size:11px; font-weight:600; }}
  .pricing-card h3 {{ font-size:18px; font-weight:600; }}
  .pricing-card .price {{ font-size:32px; font-weight:700; color:var(--p); margin:8px 0 4px; font-variant-numeric:tabular-nums; }}
  .pricing-card .price-sub {{ font-size:13px; color:var(--g-500); }}
  .pricing-card ul {{ list-style:none; margin:16px 0; }}
  .pricing-card ul li {{ padding:4px 0; font-size:13px; display:flex; align-items:center; gap:8px; }}
  .pricing-card ul li svg {{ stroke:var(--green); flex-shrink:0; }}
  /* ── Upload ── */
  .dropzone {{ border:2px dashed var(--g-300); border-radius:var(--radius); padding:40px; text-align:center; cursor:pointer; transition:all .2s; }}
  .dropzone:hover {{ border-color:var(--p); background:var(--p-light); }}
  .dropzone svg {{ color:var(--g-400); margin-bottom:8px; }}
  .dropzone p {{ color:var(--g-500); font-size:14px; }}
  .upload-result {{ display:none; }}
  .upload-result.visible {{ display:block; }}
  /* ── Toast / alerts ── */
  .toast {{ position:fixed; bottom:24px; right:24px; background:var(--b); color:var(--w); padding:12px 20px; border-radius:var(--radius-sm); font-size:14px; box-shadow:var(--shadow-md); z-index:200; display:none; }}
  .toast.show {{ display:block; }}
  .toast svg {{ stroke:var(--w); vertical-align:middle; margin-right:4px; }}
  .alert {{ padding:12px 16px; border-radius:var(--radius-sm); font-size:13px; display:flex; align-items:center; gap:8px; margin-bottom:16px; }}
  .alert-warning {{ background:var(--amber-bg); color:var(--amber); border:1px solid #fde68a; }}
  .alert-error {{ background:var(--red-bg); color:var(--red); border:1px solid #fecaca; }}
  .alert-info {{ background:var(--p-light); color:var(--p); border:1px solid #b2dfdb; }}
  .alert-success {{ background:#ecfdf5; color:var(--green); border:1px solid #a7f3d0; }}
  /* ── Empty state ── */
  .empty-state {{ text-align:center; padding:48px 24px; }}
  .empty-state svg {{ width:48px; height:48px; color:var(--g-300); margin-bottom:12px; }}
  .empty-state h3 {{ font-size:16px; color:var(--g-600); margin-bottom:4px; }}
  .empty-state p {{ font-size:14px; color:var(--g-400); }}
  /* ── Loading ── */
  .loading-overlay {{ display:none; align-items:center; justify-content:center; padding:40px; flex-direction:column; gap:12px; }}
  .loading-overlay.visible {{ display:flex; }}
  .loading-overlay svg.spin {{ animation:spin 1s linear infinite; width:28px; height:28px; }}
  .loading-overlay p {{ color:var(--g-500); font-size:14px; }}
  @keyframes spin {{ 100% {{ transform:rotate(360deg); }} }}
  /* ── Responsive ── */
  @media (max-width:768px) {{
    .app {{ flex-direction:column; }}
    .sidebar {{ width:100%; height:auto; position:static; flex-direction:row; overflow-x:auto; }}
    .sidebar-brand {{ display:none; }}
    .sidebar-nav {{ flex-direction:row; padding:8px; gap:4px; }}
    .sidebar-nav a {{ font-size:12px; padding:8px 10px; white-space:nowrap; }}
    .sidebar-status {{ display:none; }}
    .topbar {{ padding:12px 16px; }}
    .page {{ padding:16px; }}
    .kpi-grid {{ grid-template-columns:1fr 1fr; }}
    .pricing-grid {{ grid-template-columns:1fr; }}
    .receipt-review {{ grid-template-columns:1fr; }}
  }}
  /* ── Page visibility ── */
  .page-section {{ display:none; }}
  .page-section.active {{ display:block; }}
  .flex {{ display:flex; }} .gap-2 {{ gap:8px; }} .gap-4 {{ gap:16px; }} .items-center {{ align-items:center; }} .justify-between {{ justify-content:space-between; }} .mt-4 {{ margin-top:16px; }} .mb-4 {{ margin-bottom:16px; }} .w-full {{ width:100%; }}
</style>
</head>
<body>
<div class="app">
  <!-- Sidebar -->
  <nav class="sidebar">
    <div class="sidebar-brand">
      {svg("logo")}
      <div>
        <span>{COMPANY_SHORT}</span>
        <small>ReceiptsAI</small>
      </div>
    </div>
    <div class="sidebar-nav">
      {''.join(nav_links)}
    </div>
    <div class="sidebar-status">
      <div class="indicator">
        <span class="dot"></span>
        <span class="label">WhatsApp conectado</span>
      </div>
      <div style="font-size:11px;color:var(--g-400);margin-top:4px;padding-left:16px;">12 recibos hoy</div>
    </div>
  </nav>

  <!-- Main content -->
  <div class="main">
    <header class="topbar">
      <h1 id="page-title">Dashboard</h1>
      <div class="topbar-right">
        <button class="btn btn-ghost btn-sm" onclick="showUploadModal()">{svg("upload")} Subir recibo</button>
        <div class="avatar">AD</div>
      </div>
    </header>

    <div class="page">
      <!-- ================================================================ -->
      <!-- DASHBOARD -->
      <!-- ================================================================ -->
      <div class="page-section active" id="page-dashboard">
        <div class="kpi-grid">{kpi_cards}</div>

        <div class="card">
          <div class="card-header">
            <h2>Resumen por empleado</h2>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Veh&iacute;culo</th>
                  <th>WhatsApp</th>
                  <th>Comprobantes</th>
                  <th class="money">Total adeudado</th>
                  <th class="money">Pagado</th>
                  <th class="money">Pendiente</th>
                </tr>
              </thead>
              <tbody>{''.join(emp_rows)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- A PAGAR -->
      <!-- ================================================================ -->
      <div class="page-section" id="page-pagar">
        <div class="alert alert-info">
          {svg("check")} Comprobantes aprobados listos para liquidar.
        </div>
        <div class="card">
          <div class="card-header">
            <h2>Pendientes de pago</h2>
            <input type="text" placeholder="Buscar empleado&hellip;" style="padding:8px 12px;border:1px solid var(--g-300);border-radius:var(--radius-sm);font-size:13px;width:200px;" oninput="filterPagar(this.value)">
          </div>
          <div class="table-wrap">
            <table id="pagar-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Veh&iacute;culo</th>
                  <th class="money">Aprobado</th>
                  <th class="money">Pagado</th>
                  <th class="money">Pendiente de pago</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{''.join(pagar_rows)}</tbody>
            </table>
          </div>
        </div>
        <div class="card mt-4">
          <div class="card-header"><h2>Historial de pagos</h2></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Empleado</th><th>Monto</th><th>Fecha</th><th>Comprobante</th></tr></thead>
              <tbody>
                <tr><td>Ana Mart&iacute;nez</td><td class="money">{fmt(3532.50)}</td><td>17 jun 2026</td><td>R007</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- COMPROBANTES -->
      <!-- ================================================================ -->
      <div class="page-section" id="page-receipts">
        <div class="flex gap-4 items-center mb-4">
          <div style="display:flex;align-items:center;gap:4px;border:1px solid var(--g-300);border-radius:var(--radius-sm);padding:4px 12px;flex:1;max-width:320px;">
            {svg("search")}
            <input type="text" placeholder="Buscar por empleado, estaci&oacute;n&hellip;" style="border:none;outline:none;flex:1;padding:6px 0;font-size:13px;">
          </div>
          <select style="padding:8px 12px;border:1px solid var(--g-300);border-radius:var(--radius-sm);font-size:13px;">
            <option>Todos los estados</option>
            <option>Pendiente</option>
            <option>En revisi&oacute;n</option>
            <option>Aprobado</option>
            <option>Pagado</option>
          </select>
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Empleado</th>
                  <th>Estaci&oacute;n</th>
                  <th>Fecha</th>
                  <th class="money">Litros</th>
                  <th class="money">Importe</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{''.join(rec_rows)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- CONDUCTORES -->
      <!-- ================================================================ -->
      <div class="page-section" id="page-drivers">
        <div class="flex justify-between items-center mb-4">
          <h2 style="font-size:16px;font-weight:600;">Conductores registrados</h2>
          <button class="btn btn-primary btn-sm">{svg("users")} Invitar conductor</button>
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Veh&iacute;culo</th>
                  <th>WhatsApp</th>
                  <th>Recibos este mes</th>
                  <th class="money">Total adeudado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{''.join(drv_rows)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- CONFIGURACI&Oacute;N / PRICING -->
      <!-- ================================================================ -->
      <div class="page-section" id="page-settings">
        <div class="alert alert-info">
          {svg("check")} Est&aacute;s en el plan <strong>B&aacute;sico</strong> ($400 MXN/mes).
        </div>
        <div class="pricing-grid">
          {''.join(pricing_cards)}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Receipt Detail Modal -->
<div class="modal-overlay" id="receipt-modal" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <button class="modal-close" onclick="closeModal()">{svg("x")}</button>
    <h2>Revisar comprobante</h2>
    <div class="receipt-review" id="modal-review">
      <div class="photo">
        {svg("camera")}
        <span style="font-size:12px;">Vista previa del recibo</span>
      </div>
      <div id="modal-fields">
        <div class="form-group">
          <label>Empleado</label>
          <input type="text" id="mf-employee" readonly>
        </div>
        <div class="form-group">
          <label>Estaci&oacute;n</label>
          <div class="field-row">
            <input type="text" id="mf-vendor">
            <span class="badge badge-high" id="mf-conf-vendor">Alta</span>
          </div>
        </div>
        <div class="form-group">
          <label>Importe total</label>
          <div class="field-row">
            <input type="text" id="mf-amount" style="font-weight:700;">
            <span class="badge badge-high" id="mf-conf-amount">Alta</span>
          </div>
        </div>
        <div class="form-group">
          <label>Litros</label>
          <div class="field-row">
            <input type="text" id="mf-liters">
            <span class="badge badge-high" id="mf-conf-liters">Alta</span>
          </div>
        </div>
        <div class="form-group">
          <label>Fecha</label>
          <input type="text" id="mf-date">
        </div>
      </div>
    </div>
    <div id="modal-history" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--g-200);font-size:13px;color:var(--g-500);display:none;">
      <strong style="display:block;margin-bottom:8px;">Historial</strong>
      <div id="modal-history-list"></div>
    </div>
    <div class="modal-actions" id="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-danger" id="btn-reject" onclick="rejectReceipt()">Rechazar</button>
      <button class="btn btn-primary" id="btn-approve" onclick="approveReceipt()">{svg("check")} Aprobar</button>
    </div>
  </div>
</div>

<!-- Upload Modal -->
<div class="modal-overlay" id="upload-modal" onclick="if(event.target===this)closeUploadModal()">
  <div class="modal" style="max-width:480px;">
    <button class="modal-close" onclick="closeUploadModal()">{svg("x")}</button>
    <h2>Subir comprobante</h2>
    <div id="upload-dropzone" class="dropzone" onclick="simulateUpload()">
      {svg("upload")}
      <p>Haz clic o arrastra una foto del recibo</p>
      <span style="font-size:12px;color:var(--g-400);">PNG, JPG o PDF</span>
    </div>
    <div class="loading-overlay" id="upload-loading">
      {svg("loader")}
      <p>Leyendo recibo con IA&hellip;</p>
    </div>
    <div class="upload-result" id="upload-result">
      <div class="alert alert-success">{svg("check")} Recibo procesado &mdash; Pendiente de revisi&oacute;n</div>
    </div>
  </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
  // ── SVG icon strings for toast messages (emoji-free) ──
  var CHK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
  var XIC = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var DOC = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';

  // ── Data ──
  const RECEIPTS = {r_json};
  const EMPLOYEES = {e_json};
  let currentReceiptId = null;

  // ── Navigation ──
  document.querySelectorAll('[data-page]').forEach(function(a) {{
    a.addEventListener('click', function(e) {{
      e.preventDefault();
      document.querySelectorAll('[data-page]').forEach(function(x) {{ x.classList.remove('active'); }});
      a.classList.add('active');
      document.querySelectorAll('.page-section').forEach(function(x) {{ x.classList.remove('active'); }});
      var page = document.getElementById('page-' + a.dataset.page);
      if (page) page.classList.add('active');
      document.getElementById('page-title').textContent = a.textContent.trim();
    }});
  }});

  // ── Receipt detail ──
  function openReceipt(id) {{
    currentReceiptId = id;
    var r = null;
    for (var i = 0; i < RECEIPTS.length; i++) {{
      if (RECEIPTS[i].id === id) {{ r = RECEIPTS[i]; break; }}
    }}
    var emp = null;
    for (var j = 0; j < EMPLOYEES.length; j++) {{
      if (EMPLOYEES[j].id === r.emp_id) {{ emp = EMPLOYEES[j]; break; }}
    }}
    if (!r || !emp) return;
    document.getElementById('mf-employee').value = emp.name;
    document.getElementById('mf-vendor').value = r.vendor;
    document.getElementById('mf-amount').value = '$' + r.amount.toFixed(2);
    document.getElementById('mf-liters').value = r.liters;
    document.getElementById('mf-date').value = r.date;

    // Confidence badges
    var c = r.confidence;
    var badges = document.querySelectorAll('#modal-fields .badge');
    var lvl = c >= 0.9 ? 'high' : c >= 0.75 ? 'medium' : 'low';
    var labels = {{ 'high': 'Alta', 'medium': 'Revisar', 'low': 'Baja' }};
    for (var k = 0; k < badges.length; k++) {{
      badges[k].className = 'badge badge-' + lvl;
      badges[k].textContent = labels[lvl];
    }}

    // Actions visibility
    var canAct = (r.status === 'in_review' || r.status === 'pending');
    document.getElementById('btn-approve').style.display = canAct ? '' : 'none';
    document.getElementById('btn-reject').style.display = canAct ? '' : 'none';

    // History
    var hist = document.getElementById('modal-history');
    var histList = document.getElementById('modal-history-list');
    if (r.status === 'paid') {{
      hist.style.display = 'block';
      histList.innerHTML = '<div style="margin:4px 0;">' + CHK + ' Aprobado por Admin &mdash; 22 jun 2026</div><div style="margin:4px 0;color:var(--green);">' + CHK + ' Pagado &mdash; 23 jun 2026</div>';
    }} else if (r.status === 'approved') {{
      hist.style.display = 'block';
      histList.innerHTML = '<div style="margin:4px 0;">' + CHK + ' Aprobado por Admin &mdash; 22 jun 2026</div>';
    }} else {{
      hist.style.display = 'none';
    }}

    document.getElementById('receipt-modal').classList.add('open');
  }}

  function approveReceipt() {{
    if (!currentReceiptId) return;
    // Find receipt amount for confirmation message
    var r = null;
    for (var i = 0; i < RECEIPTS.length; i++) {{
      if (RECEIPTS[i].id === currentReceiptId) {{ r = RECEIPTS[i]; break; }}
    }}
    var amountStr = r ? '$' + r.amount.toFixed(2) : '';
    if (!confirm('Confirmar aprobacion de ' + amountStr + ' para este comprobante? Esta accion puede revertirse desde el historial.')) return;
    showToast(CHK + ' Comprobante aprobado');
    closeModal();
  }}

  function rejectReceipt() {{
    if (!currentReceiptId) return;
    showToast(XIC + ' Comprobante rechazado');
    closeModal();
  }}

  function closeModal() {{
    document.getElementById('receipt-modal').classList.remove('open');
    currentReceiptId = null;
  }}

  // Close on Esc key
  document.addEventListener('keydown', function(e) {{
    if (e.key === 'Escape') {{
      closeModal();
    }}
  }});

  // ── Mark as paid ──
  function markAsPaid(empId) {{
    if (!confirm('Confirmas que este pago se ha liquidado?')) return;
    showToast(CHK + ' Pago registrado');
  }}

  // ── Upload ──
  function showUploadModal() {{
    document.getElementById('upload-modal').classList.add('open');
    document.getElementById('upload-dropzone').style.display = 'block';
    document.getElementById('upload-loading').classList.remove('visible');
    document.getElementById('upload-result').classList.remove('visible');
  }}

  function closeUploadModal() {{
    document.getElementById('upload-modal').classList.remove('open');
  }}

  function simulateUpload() {{
    document.getElementById('upload-dropzone').style.display = 'none';
    document.getElementById('upload-loading').classList.add('visible');
    setTimeout(function() {{
      document.getElementById('upload-loading').classList.remove('visible');
      document.getElementById('upload-result').classList.add('visible');
      setTimeout(function() {{ closeUploadModal(); showToast(DOC + ' Recibo recibido &mdash; Pendiente de revisi&oacute;n'); }}, 1500);
    }}, 2000);
  }}

  // ── Filter ──
  function filterPagar(val) {{
    val = val.toLowerCase();
    var rows = document.querySelectorAll('#pagar-table tbody tr');
    for (var i = 0; i < rows.length; i++) {{
      rows[i].style.display = rows[i].dataset.name.indexOf(val) > -1 ? '' : 'none';
    }}
  }}

  // ── Toast ──
  function showToast(msg) {{
    var t = document.getElementById('toast');
    t.innerHTML = msg;
    t.classList.add('show');
    setTimeout(function() {{ t.classList.remove('show'); }}, 2500);
  }}
</script>
</body>
</html>'''

    return html


if __name__ == '__main__':
    import os
    html = build()
    out_dir = 'demo'
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, 'index.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    size_kb = len(html) / 1024
    print(f"Generated {path} ({size_kb:.0f} KB)")
