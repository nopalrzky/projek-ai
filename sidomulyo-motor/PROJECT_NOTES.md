# PROJECT_NOTES.md — Sidomulyo Motor

Generated: 2026-06-27 00:27 Asia/Jakarta

Purpose: continuity note for future OpenClaw/assistant sessions. Read this first when opening this project.

## Project Location

Primary duplicate project folder:

```text
/Users/naufalrizky/projek ai/sidomulyo-motor
```

Original working project folder used during repairs:

```text
/Users/naufalrizky/.openclaw/workspace/sidomulyo-motor
```

## App Summary

This is a local Node.js + Express + SQLite workshop/admin app for **Sidomulyo Motor**.

Main features:

- Customer + vehicle master data
- Item/sparepart stock master
- Work Order (WO / Buku Besar)
- Invoice / Nota + payment tracking
- PDF invoice generation
- WhatsApp message link generation + sent-status tracking
- Stock mutation
- Expenses
- Excel export/template
- Simple attendance page stub
- Flatpickr integration for Date Range Filter (Periode Dari - Sampai) in Buku Besar, Nota, and Activity Log

## How To Run

From this folder:

```bash
cd "/Users/naufalrizky/projek ai/sidomulyo-motor"
npm install
npm start
```

Default URL:

```text
http://localhost:3000
```

If port 3000 is occupied:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN -t | xargs kill -9
npm start
```

## Important Files/Folders

```text
server.js                 Main backend Express server + API actions + PDF/export logic
package.json              npm scripts/dependencies
package-lock.json         exact dependency lock
db/database.js            SQLite helper utilities; save/update/rows/find/etc
db/schema.sql             DB schema reference
public/index.html         HTML shell
public/app.js             Main frontend JS/UI logic; buttons/actions/form handlers
public/styles.css         Main CSS
public/style.css          Mentioned in old context, but current active seems styles.css
data/bengkel.db           MAIN SQLite database; do not lose
pdfs/                     generated invoice PDF files
exports/                  generated Excel exports/templates
uploads/                  temp uploaded import files
routes/                   folder exists; current rebuilt server mostly does not use routes
```

Critical DB file:

```text
data/bengkel.db
```

Do not delete it unless intentionally resetting all data.

## High-Level Architecture

### Frontend

The frontend is a single-page app in:

```text
public/app.js
```

It sends all API requests through:

```js
async function call(action, payload={}) {
  const r = await fetch('/api/'+action, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const j = await r.json();
  if(!j.ok) throw new Error(j.error);
  return j.data;
}
```

So frontend contract is:

```text
POST /api/<action>
Content-Type: application/json
Body = payload object
Response = { ok, data, error }
```

The page routing is in `go(page)`, with pages:

- `dashboard`
- `customers`
- `employees`
- `attendance`
- `stock`
- `workorders`
- `invoices`
- `expenses`
- `data`

Sidebar nav is grouped by `navSections`.

### Backend

The backend is in:

```text
server.js
```

It uses Express and a generic API action map:

```js
app.post('/api/:action', async (req,res)=>{
  const action = req.params.action;
  const map = { ... };
  const fn = map[action];
  const data = await fn(req.body || {});
  res.json({ ok:true, data, error:null });
});
```

Important static routes:

```js
app.use('/pdfs', express.static(PDF_DIR));
app.use('/exports', express.static(EXPORT_DIR));
app.use('/data', express.static(join(__dirname, 'data')));
app.use(express.static(PUBLIC_DIR));
```

DB download route intended:

```text
http://localhost:3000/data/bengkel.db
```

## Critical Historical Context

During repairs, `server.js` had previously been accidentally partially overwritten/corrupted with invalid fragments. There was no git/backup found. It was rebuilt to be minimal-compatible with existing frontend + DB schema. Because of this, always treat `server.js` as rebuilt and verify contracts before large changes.

Past errors fixed:

1. `ReferenceError: app is not defined` — caused by partial overwritten server.
2. better-sqlite3 native mismatch — fixed via `npm rebuild better-sqlite3` in original env.
3. port conflict `EADDRINUSE :3000` — killed stale PID.
4. `no such column: item_no` — DB `work_order_items` has no `item_no`; backend now orders by `created_at`.
5. `table work_orders has no column named items` — backend was spreading raw payload into WO insert; now saveWorkOrder whitelists columns.
6. PDF route `Unknown action: createInvoicePdf` — `/api/:action` caught route first; action map now includes `createInvoicePdf`.
7. PDF blank pages — PDF generator rewritten to fixed 1-page layout.
8. `ReferenceError: woDateFrom is not defined` / "Database belum disiapkan" on refresh — Flatpickr replaces date input element causing direct global variable lookup to fail. Fixed by using safe `document.getElementById(...)` DOM selector and wrapping Flatpickr reset call inside `setTimeout` to await value updates.
9. Wrong filter element IDs in work orders page — `renderWorkOrders` had incorrect input IDs (`invDateFrom`/`invDateTo`), causing WO date queries to fail. Fixed to `woDateFrom`/`woDateTo`.
10. Activity Log date comparison mismatch — Activity log dates are formatted in ISO (with 'T' separator) while filter selects plain date strings. Fixed by splitting with 'T'.

## DB Schema Notes

Actual DB tables observed:

```text
attendance
customers
vehicles
items
employees
work_orders
work_order_items
invoices
payments
expenses
stock_moves
settings
suppliers
purchases
purchase_items
users
audit_log
```

Important: there is **no `invoice_items` table** in actual DB. Invoice item details are derived from `work_order_items` through the invoice's `work_order_id`.

### customers

Fields observed:

```text
id, name, phone, address, notes, active, created_at, updated_at
```

`listCustomers_()` should attach vehicles:

```js
{ ...customer, vehicles: rows_('vehicles',{ customer_id: customer.id }) }
```

Frontend customer list expects `c.vehicles`.

### vehicles

Fields observed:

```text
id, customer_id, plate, brand, model, year, color, vin, odometer, notes, active, created_at, updated_at
```

### items

Fields observed:

```text
id, code, name, unit, location, stock, min_stock, hpp, sell_price, active, created_at, updated_at
```

### work_orders

Important expected fields include:

```text
id, wo_no, date, customer_id, vehicle_id, odometer, complaint, diagnosis, mechanics, notes, subtotal, discount, total, status, created_at, updated_at
```

WO number uses `SM/...` prefix format through `nextNo_('WO')`, but database helper has been changed so both WO and invoice use same `SM` numbering idea.

### work_order_items

Actual fields:

```text
id, work_order_id, type, item_id, description, qty, unit, unit_price, hpp, subtotal, mechanics, notes, created_at, updated_at
```

Important:

- No `item_no` field.
- `item_id` default is empty string, not null.
- `type` is normally `SERVICE` or `PART`.
- For sparepart/barang rows, frontend should send valid `item_id` from items master.

### invoices

Fields observed:

```text
id, invoice_no, work_order_id, date, customer_id, vehicle_id, subtotal, discount, total, paid, balance, payment_status, status, pdf_url, created_by, wa_sent_at, wa_sent_by, wa_service_sent_at, wa_service_sent_by, created_at, updated_at
```

Important:

- Invoice number should be same as WO number: `invoice_no = wo.wo_no`.
- Invoice details are resolved via `work_order_id` -> `work_order_items`.

### payments

Expected payment fields used by backend:

```text
id, invoice_id, date, amount, method, reference, notes, created_by, created_at
```

### stock_moves

Used for manual stock mutation + invoice finalization stock deduction.

Expected fields used by backend:

```text
id, date, item_id, type, qty, unit_cost, reference_type, reference_id, notes, created_by, created_at
```

## Frontend Pages + Important Functions

### Boot / Navigation

`boot()`:

- calls `bootstrap`
- sets user text
- restores last page from `localStorage.getItem('sidomulyo_page')`

`go(page)`:

- persists page to localStorage
- calls page-specific backend action

### Dashboard

Frontend expects dashboard response shape roughly:

```js
{
  date,
  vehicles,
  sales,
  received,
  receivables,
  expenses,
  lowStock
}
```

Backend `dashboard_()` was patched to return this shape.

### Customer & Vehicles

Frontend `renderCustomers(d)` expects customers with embedded vehicles:

```js
customer.vehicles
```

Backend `listCustomers_()` patched accordingly.

Vehicle edit/save uses `saveVehicle`.

### Stock

Frontend stock mutation sends:

```js
{
  item_id,
  type,
  qty,
  unit_cost,
  notes
}
```

Backend `adjustStock_()` was patched to accept this contract and call `moveStock_()`.

### Work Orders

Key frontend functions:

- `renderWorkOrders(d)`
- `openWorkOrder(existing=null)`
- `renderCustomerAutocomplete()`
- `selectCustomerFromAutocomplete()`
- `addLine()`
- `renderPartAutocomplete()`
- `selectPartFromAutocomplete()`
- `clearPartSelection()`
- `calcWO()`
- `saveWO(event)`
- `editWO(id)`
- `viewWO(id)`
- `deleteSelectedWO()`
- `makeInvoice(id)`

Important behavior desired by user:

- WO + invoice use one shared `SM/...` number.
- WO page should stay visible after creating invoice; avoid confusing auto-switch.
- Editable only if not paid/final.
- Barang/sparepart autocomplete should mirror customer autocomplete:
  - single text input
  - live filtered dropdown
  - no native select
- Jasa is free custom input.
- Barang must be selected from item master.
- Barang selected by `item_id`.
- Barang selected -> name and price locked; qty editable.
- There is a small `×` inside item field to clear selected item; separate from red row-delete `×`.
- Stock decreases when invoice is finalized, not merely when WO is saved.

Frontend `renderWorkOrders()` expects flat fields in list payload:

```js
customer_name
customer_phone
vehicle
vehicle_brand
vehicle_model
vehicle_plate
plate
total
```

Backend `flatWorkOrder_()` must return both flat + nested objects.

### Invoice / Nota

Key frontend functions:

- `renderInvoices(d)`
- `viewInvoice(id, source)`
- `paymentForm(id,balance)`
- `savePayment(event)`
- `pdfInvoice(id)`
- `sendInvoiceWa(id)`
- `sendServiceDoneWa(id)`

Frontend invoice list expects flat fields:

```js
invoice_no
customer_name
customer_phone
vehicle_brand
vehicle_model
vehicle_plate
mechanics
payment_status
wa_sent_at
wa_service_sent_at
```

Backend `flatInvoice_()` should return those plus nested:

```js
customer
vehicle
workOrder
```

Payment form sends `invoice_id`; backend `recordPayment_()` was patched to accept `invoice_id || id`.

WA status functions now update invoice timestamps.

### PDF

`pdfInvoice(id)` calls:

```js
call('createInvoicePdf', { id })
```

Backend action `createInvoicePdf` calls `createInvoicePdf_(id)`.

Current PDF generator aims for:

- professional clean layout
- 1 A4 page
- header: business name/address/phone
- green title strip
- payment status badge
- info block: no nota/date/mechanic/customer/phone/vehicle
- item table
- bottom left note/signature box
- bottom right total summary card
- footer thank-you

Recent PDF polish:

- blank pages fixed by fixed-position layout and text box heights
- page count verified `/Count 1`
- lower-right total box adjusted after user said it was messy

If polishing further, edit only `createInvoicePdf_()` carefully and test page count by:

```bash
curl -s -X POST http://localhost:3000/api/createInvoicePdf \
  -H 'Content-Type: application/json' \
  -d '{"id":"<invoice_id>"}'
strings pdfs/<file>.pdf | grep '/Count'
```

Expected page count:

```text
/Count 1
```

## Backend Functions Current Intent

### `bootstrap_()`

Returns:

```js
{ app:{ user, now, today }, settings }
```

### `dashboard_(p)`

Should return frontend dashboard shape. Computes daily invoices/payments/expenses/WO count.

### `listCustomers_()`

Returns customers sorted by name with `vehicles` array attached.

### `saveCustomer_(p)`

Whitelist only valid DB columns.

### `deleteCustomer_(p)`

Deletes vehicles first, then customer. Be careful if WO/invoices reference those IDs; current behavior may still fail if FK constraints block.

### `listVehicles_(p)`

If `p.customer_id`, filter by customer; else all vehicles.

### `saveVehicle_(p)`

Whitelist valid vehicle fields.

### `listItems_()`

All items sorted by name.

### `saveItem_(p)`

Whitelist valid item fields.

### `moveStock_(item_id, delta, meta)`

Central stock movement:

- finds item
- updates stock
- appends `stock_moves`
- returns updated item

Used by:

- `adjustStock_()`
- `finalizeInvoice_()` for sparepart deduction

### `adjustStock_(p)`

Accepts frontend payload:

```js
{ item_id, type, qty, unit_cost, notes }
```

Maps type to delta:

- `ADJUST_MINUS` -> negative
- other types -> positive

### `saveEmployee_(p)`

Whitelist valid employee fields. Do **not** use `role` because DB uses `position`, not role.

### `saveExpense_(p)`

Whitelist valid expenses fields.

### `listTables_()`

Must not include `invoice_items`, because table doesn't exist.

Current list should include:

```js
customers, vehicles, items, employees, work_orders, work_order_items, invoices, payments, expenses, stock_moves
```

### `hydrateWorkOrder_(wo)`

Attach:

```js
wo.customer
wo.vehicle
wo.items
```

Uses `created_at ASC` for items because no `item_no`.

### `flatWorkOrder_(wo)`

Creates frontend-compatible flat fields:

```js
customer_name
customer_phone
vehicle
vehicle_brand
vehicle_model
vehicle_plate
plate
total
```

### `saveWorkOrder_(p)`

Important:

- Do not spread raw payload into DB.
- `p.items` must not be inserted into `work_orders`.
- New WO date uses realtime `now_()` Asia/Jakarta.
- Edit existing WO preserves provided date.
- Computes subtotal/discount/total.
- Saves rows to `work_order_items` via `replaceChildren_()`.

### `deleteWorkOrders_(p)`

Accepts:

```js
{ ids:[...] }
```

Blocks deletion if WO already has invoice.

Deletes child `work_order_items` first, then WO.

### `finalizeInvoice_(p)`

Accepts:

```js
{ work_order_id, paid? }
```

Behavior:

- if invoice already exists for WO, return existing (prevents duplicate/double stock deduction)
- load WO + work_order_items
- compute totals
- save invoice with `invoice_no = wo.wo_no`
- date uses `now_()`
- reduce stock for items where `type === 'PART' && item_id`
- add stock movement `OUT`
- update WO status `INVOICED`

### `recordPayment_(p)`

Accepts:

```js
{ invoice_id, amount, method, reference, notes, date? }
```

Behavior:

- inserts `payments`
- updates invoice paid/balance/payment_status

### `setInvoiceStatus_(p)`

Accepts `invoice_id || id`, payment_status, paid.

### `markInvoiceWaSent_(p)`

Updates:

```js
wa_sent_at
wa_sent_by
updated_at
```

### `markInvoiceServiceWaSent_(p)`

Updates:

```js
wa_service_sent_at
wa_service_sent_by
updated_at
```

### `exportExcel_(p)`

Exports each table's first rows as JSON into Excel. Works with `/exports` static route.

### `exportTemplate_()`

Creates a workbook with one sheet per table and headers from `PRAGMA table_info`.

### `importExcel`

Currently safe stub:

- route exists
- accepts multipart file
- returns success with warning
- does not modify DB yet

This was intentional to avoid destructive import bugs after server rebuild.

## Known Remaining Limitation

Excel import is not fully implemented. It accepts upload but does not write DB.

If user asks to make Excel import real:

1. Design exact import format first.
2. Backup DB before import.
3. Validate rows against schema.
4. Never overwrite master data blindly.
5. Report row-level errors.

## User Preferences / Decisions

- User wants direct, practical fixes.
- User dislikes mismatch between frontend/backend; always inspect both before patch.
- WO and invoice should share same `SM/...` number.
- UI should not auto-switch pages in confusing ways.
- WA list columns should show status only; actual WA actions in detail modal.
- Paid/final invoices/WO should not be editable.
- Customer and sparepart autocomplete should be custom dropdowns, not native select/datalist.
- Barang/sparepart must be selected from item master by `item_id`.
- Jasa rows are free custom text input.
- PDF should be professional, clean, preferably 1 page.
- The user may want to duplicate/run this project separately from OpenClaw workspace.

## Recent UI/CSS Fixes

`public/styles.css` sparepart autocomplete dropdown was fixed because text was messy/overlapping/clipped:

- panel appears below input via `top: calc(100% + 6px)`
- higher z-index
- item padding/line-height normalized
- item min-height set
- box-sizing set

If dropdown still looks wrong, inspect CSS around:

```css
.part-autocomplete-panel
.part-autocomplete-item
.part-input-shell
.line-desc-wrap
```

## Server Start/Stop Helpers

Start:

```bash
cd "/Users/naufalrizky/projek ai/sidomulyo-motor"
npm start
```

Kill app server on port 3000:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN -t | xargs kill -9
```

Health check:

```bash
curl -s http://localhost:3000/health
```

Expected:

```json
{"ok":true}
```

## Recommended Smoke Test After Any Patch

Run server, open browser, hard refresh (`Cmd+Shift+R`), then:

1. Dashboard loads.
2. Customer list shows vehicles.
3. Create/edit customer.
4. Create/edit vehicle.
5. Create/edit item.
6. Mutate stock and confirm stock changes.
7. Create WO:
   - select customer
   - select vehicle
   - add jasa row
   - add sparepart row via dropdown
   - save WO
8. WO list shows no WO/customer/vehicle/plate empty fields.
9. Edit WO before invoice works.
10. Create invoice from WO.
11. Confirm sparepart stock decreases.
12. Invoice list shows customer/phone/vehicle/status.
13. Record payment; paid/balance/status update.
14. Send WA; WA status badge updates after refresh.
15. Create PDF; confirm it opens and is 1 page.
16. Export Excel; confirm link downloads.
17. Export template; confirm link downloads.

## Important Caution

Because `server.js` was reconstructed, never assume an action works without testing against both:

1. frontend payload in `public/app.js`
2. actual SQLite schema in `data/bengkel.db`

Useful inspection commands:

```bash
sqlite3 data/bengkel.db ".tables"
sqlite3 data/bengkel.db "PRAGMA table_info(work_orders);"
sqlite3 data/bengkel.db "PRAGMA table_info(work_order_items);"
sqlite3 data/bengkel.db "PRAGMA table_info(invoices);"
```

Find frontend calls:

```bash
grep -n "call('" public/app.js
```

Find backend action map:

```bash
grep -n "const map" -A20 server.js
```

## Last Known Status

Before duplication, the project was copied with:

```bash
rsync -av --exclude node_modules "/Users/naufalrizky/.openclaw/workspace/sidomulyo-motor/" "/Users/naufalrizky/projek ai/sidomulyo-motor/"
```

Copied important folders/files:

- `server.js`
- `package.json`
- `package-lock.json`
- `db/`
- `public/`
- `data/bengkel.db`
- `pdfs/`
- `exports/`
- `uploads/`

Excluded:

- `node_modules/`

After moving to this new folder, run `npm install` before `npm start`.

---

## Update — 2026-06-27 02:40 Asia/Jakarta

Recent hardening/fixes completed in the active folder:

```text
/Users/naufalrizky/projek ai/sidomulyo-motor
```

Git history now has a safe baseline + follow-up commits:

```text
61a4d6c chore: keep runtime database private and add smoke test
ca438e0 feat: import master data from Excel
891f740 feat: add optional PIN auth
c8aef77 chore: remove leftover UI debug logs
2b204b3 fix: correct dashboard and work order filters
615d610 fix: secure database route and polish pdf overflow
e25de2d fix: harden data export and invoice guards
6a8f54e chore: baseline sidomulyo motor project
```

### Current run/dev commands

```bash
cd "/Users/naufalrizky/projek ai/sidomulyo-motor"
npm install
npm start
```

Default app URL:

```text
http://localhost:3000
```

Smoke test:

```bash
npm run smoke
```

Current smoke checks cover:

- `/health`
- `bootstrap`
- `dashboard`
- `listCustomers`
- `listVehicles`
- `listItems`
- `listWorkOrders`
- `listInvoices`
- `listTables`
- `exportTemplate`
- `/data/bengkel.db` must return `403`

### Runtime database privacy

`data/bengkel.db` is now intentionally **untracked** and ignored by git.

Reason: it contains local/private operational data. Do not commit/push it.

Tracked placeholder:

```text
data/.gitkeep
```

Ignored local/runtime files include:

```text
data/*.db
data/*.db-shm
data/*.db-wal
exports/*.xlsx
pdfs/*.pdf
uploads/*
backups/*.db
node_modules/
```

The actual local DB should still exist at:

```text
data/bengkel.db
```

If it is missing, restore from local backup before running real operations.

### DB direct download protection

Old risk:

```js
app.use('/data', express.static(join(__dirname, 'data')))
```

This exposed:

```text
http://localhost:3000/data/bengkel.db
```

Current behavior:

```text
GET /data/bengkel.db -> 403 Forbidden
```

Use app export/backup flows instead of direct DB download.

### Data/export fixes

`listTables_()` now returns objects with counts, matching frontend expectation:

```js
[{ name: 'customers', count: 789 }, ...]
```

Previously it returned only strings and broke the Data page/export dropdown.

`exportExcel_()` now returns both:

```js
{ url, filename }
```

Frontend expects `filename` for download display.

`exportExcel_({ tables: 'customers' })` now supports exporting one requested table; `all` exports all supported tables.

### Invoice/WO/payment/stock guards

Backend now enforces important integrity rules, not just frontend UI:

- A work order that already has an invoice cannot be edited through `saveWorkOrder_()`.
- A work order that already has an invoice cannot be deleted.
- `finalizeInvoice_()` rejects negative payment and `paid > total`.
- `recordPayment_()` rejects `amount <= 0`.
- `recordPayment_()` rejects payments that exceed invoice total/sisa tagihan.
- `moveStock_()` rejects stock mutations that would make stock negative.

Important stock behavior remains:

- Sparepart stock decreases on `finalizeInvoice_()`.
- Stock does **not** decrease when merely saving WO.
- Invoice creation is duplicate-safe for an existing `work_order_id`.

### PDF overflow behavior

PDF invoice target remains single-page A4.

Old behavior:

```js
items.slice(0, 20)
```

This silently omitted item rows after 20.

Current behavior:

- Up to 19 item rows render normally if overflow exists.
- Last row becomes info row like `+ N item lain. Detail lengkap tetap tersimpan di nota digital.`
- Totals still use all items.
- PDF remains 1 page.

### Backup cleanup

A wrongly named tracked backup file was removed from git:

```text
data/bengkel.backup.$(date +%Y%m%d%H%M%S).db
```

It was moved locally to:

```text
backups/bengkel.backup.20260626-161700.db
```

`backups/*.db` is ignored.

### Frontend fixes

`public/app.js` fixes:

- Dashboard low-stock card now uses fresh dashboard payload `d.lowStock`, not stale `state.data.lowStock`.
- Work Order status multi-select filter no longer uses missing variable `status`; it uses `selectedStatuses` properly.
- Leftover `console.log` debug spam removed.
- Multi-select helper has null guards.

### Optional PIN auth

Optional lightweight PIN auth exists but is currently not required unless env var is set.

No PIN / simple local mode:

```bash
npm start
```

PIN mode:

```bash
SIDOMULYO_PIN=1234 npm start
```

When `SIDOMULYO_PIN` is set:

- `bootstrap` and `login` remain public.
- Other `/api/*` routes require header `x-sidomulyo-token`.
- `createInvoicePdf`, `exportExcel`, and `importExcel` also require auth.
- Frontend stores token in `sessionStorage`.

Decision at 2026-06-27 02:38: keep simple local run for now; do not force PIN by default.

### Excel import status

Excel import is now real for safe tables only:

Supported worksheets:

```text
customers
vehicles
items
employees
expenses
```

Unsupported intentionally for now:

```text
work_orders
work_order_items
invoices
payments
stock_moves
```

Reason: transaction tables affect stock/payment/invoice integrity and need stricter design.

Import implementation:

- Endpoint: `POST /api/importExcel` multipart `file`.
- Reads uploaded `.xlsx` using ExcelJS.
- Uses worksheet names as table names.
- Uses row 1 as headers.
- Ignores unsupported sheets.
- Deletes uploaded temp file afterward.
- Validates required fields per supported table.
- Runs inside SQLite transaction.

Required fields:

```text
customers: name
vehicles: customer_id, plate
items: name
employees: name
expenses: date, category, amount
```

Test performed:

- Empty official template import -> OK, 0 imported.
- Temporary test customer `CUS-TEST-IMPORT` imported -> verified in DB -> deleted immediately.

### Smoke-test state

Latest smoke test passed after all changes:

```text
health: OK
bootstrap: OK
dashboard: OK
listCustomers: OK
listVehicles: OK
listItems: OK
listWorkOrders: OK
listInvoices: OK
listTables: OK
exportTemplate: OK
db route forbidden: OK
```

### Known remaining tasks / non-blockers

1. Auth is optional, not permanently enabled. This is intentional for local/simple usage.
2. Full browser/manual UI smoke test has not been done after every frontend change; API smoke is OK.
3. Transaction Excel import is intentionally not implemented.
4. OpenClaw workspace bootstrap files (`BOOTSTRAP.md`, identity setup) remain pending/ignored; not relevant to the app runtime.
5. If deploying outside localhost/LAN, revisit auth, HTTPS, DB backups, and data exposure.

### Important caution for future assistants

Before making changes:

1. Read this `PROJECT_NOTES.md`.
2. Check actual schema with SQLite, do not assume columns. Example: `users` has `email`, not `username`.
3. Keep `data/bengkel.db` private/untracked.
4. Run `npm run smoke` before final reply.
5. Commit after edits.


## Update — 2026-06-27 04:40 Asia/Jakarta

Latest pushed GitHub state:

```text
origin/main commit: 9135c279d6bddec956acffcb893503f09dd02715
short: 9135c27 Improve dashboard and theme persistence
remote: git@github.com:nopalrzky/sidomulyo-motor.git
branch: main
```

Changes included in that push:

1. Report page layout widened
   - `public/app.js`: report page wrapped with `.reports-page`.
   - `public/styles.css`: added report-specific wider grid/filter/table layout.

2. Theme persistence fixed
   - Last-used theme stored in `localStorage.sidomulyo_theme`.
   - Refresh preserves last state:
     - last white -> white
     - last dark -> dark
   - `public/index.html` applies saved dark class before CSS loads to avoid white flash.
   - Theme button label syncs between `☾` and `☀`.

3. Dashboard expanded
   - `server.js` dashboard aggregate now returns:
     - `statusCounts`
     - `receivablesList`
     - `attention`
     - `activity`
     - sorted `lowStock`
   - `public/app.js` dashboard now displays:
     - Perlu Perhatian
     - Status WO
     - Piutang Belum Lunas
     - Aktivitas Terbaru
     - existing Arus Kas + Stok Menipis
   - `public/styles.css` adds responsive/dark-mode styles for new dashboard widgets.

4. CSS cleanup
   - `public/styles.css` was formatted for readability only.
   - Semantic-ish check confirmed CSS without whitespace/comment changes matched before/after.
   - Local backup created but intentionally not pushed:
     - `backups/styles.css.before-format-20260627-041102`

Validation before push:

```text
node --check server.js: OK
node --check public/app.js: OK
app.js parse: OK
npm run smoke: OK
```

Smoke output included:

```text
health: OK
bootstrap: OK
dashboard: OK
reportFinance: OK
globalSearch: OK
listCustomers: OK
listVehicles: OK
listItems: OK
listWorkOrders: OK
listInvoices: OK
listTables: OK
exportTemplate: OK
db route forbidden: OK
```

Untracked local files after push:

```text
backups/styles.css.before-format-20260627-041102
memory/
```

These were intentionally not committed/pushed.

## Planned Separate Project — Attendance Mobile App

User wants a separate native/mobile app, not a website, for employee attendance.

Recommended project location:

```text
/Users/naufalrizky/projek ai/sidomulyo-attendance-mobile
```

Keep it outside `sidomulyo-motor` because it is a different target/build/dependency set.

Intended integration:

```text
Android attendance app

## Mobile Attendance App — IMPLEMENTED

**Status: MVP Complete & Working (2026-06-27)**

Project: `/Users/naufalrizky/projek ai/sidomulyo-attendance-mobile`

GitHub:
- Backend: `https://github.com/nopalrzky/sidomulyo-motor`
- Mobile: `https://github.com/nopalrzky/Sidomulyo-attendance-mobile`

### Stack
- Mobile: React Native/Expo (web preview + Android APK)
- Backend: Express integrated into main server
- DB: SQLite tables in `data/bengkel.db`

### Features
**Mobile:** login, check-in/out (live camera+GPS), auto-push location every 30s, countdown timer (persistent), history
**Backend APIs:** `/api/mobile/login`, `/api/attendance/checkin|checkout|location|live|history|logs|locationLog`
**Admin:** page Absensi with Live Lokasi (realtime countdown), Log Hari Ini, Riwayat Sesi, Realtime Push Lokasi

### DB Tables
```sql
attendance_sessions (id, employee_id, check_in_at, check_in_lat/lng, check_in_photo_url, check_out_*, status, created_at)
attendance_locations (id, session_id, lat, lng, accuracy, recorded_at, created_at)
```

### Technical
- Session ID: `ATS-YYYYMMDD-HHmmss`
- Token: JWT in AsyncStorage; web preview relaxed (validates `session_id`+status only)
- Location push: 30s interval, countdown persistent via `lastPushTime` in AsyncStorage
- Admin countdown: realtime in Live Lokasi table

### Status
✅ Auto-push working (8+ DB entries confirmed)
✅ Check-in/out with photo
✅ Admin live tracking
✅ Countdown persistence implemented (awaiting test)

### Commits
Backend: `ec7a873`, `aec0a3b`, `9d07c28`
Mobile: `69269c5`, `d0d1a07`, `c092ab0`, `e2fa976`, `e174890`

### Run
```bash
# Backend
cd "/Users/naufalrizky/projek ai/sidomulyo-motor" && npm start

# Mobile
cd "/Users/naufalrizky/projek ai/sidomulyo-attendance-mobile" && npx expo start --web
```

Test: `EMP-001` (Hendra), PIN `1234`
