import express from 'express';
import multer from 'multer';
import { existsSync, mkdirSync, createWriteStream, readFileSync, rmSync, copyFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import db, {
  id_, today_, now_, num_, text_, user_, normalize_, rupiah_, settings_, currentTimestamp,
  rows_, find_, append_, update_, save_, deleteById_,
  searchRows_, audit_, required_, nextNo_,
  replaceChildren_, updateInvoiceStatus_
} from './db/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, 'public');
const PDF_DIR = join(__dirname, 'pdfs');
const EXPORT_DIR = join(__dirname, 'exports');
const UPLOAD_DIR = join(__dirname, 'uploads');
for (const d of [PDF_DIR, EXPORT_DIR, UPLOAD_DIR]) if (!existsSync(d)) mkdirSync(d, { recursive: true });
ensureItemSupplierColumn_();

const ATTENDANCE_PHOTO_DIR = join(UPLOAD_DIR, 'attendance');
if (!existsSync(ATTENDANCE_PHOTO_DIR)) mkdirSync(ATTENDANCE_PHOTO_DIR, { recursive: true });

const app = express();
const upload = multer({ dest: UPLOAD_DIR });
const woPhotoUpload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 5 * 1024 * 1024 } });
const APP_PIN = process.env.SIDOMULYO_PIN || '';
const SESSION_TOKEN = crypto.randomBytes(32).toString('hex');
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  if(req.method==='OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/pdfs', express.static(PDF_DIR));
app.use('/exports', express.static(EXPORT_DIR));
app.get('/data/:file', (_, res) => res.status(403).json(json(false, null, 'Download database langsung dinonaktifkan. Gunakan export/backup resmi.')));
app.use(express.static(PUBLIC_DIR));

const json = (ok, data = null, error = null) => ({ ok, data, error });
const eq = (a, b) => String(a ?? '') === String(b ?? '');

function bootstrap_() {
  const s = settings_();
  return { app: { user: user_(), now: now_(), today: today_(), authRequired: !!APP_PIN }, settings: s };
}
function login_(p) { if (!APP_PIN) return { token: SESSION_TOKEN }; if (String(p.pin || '') !== APP_PIN) throw new Error('PIN salah.'); return { token: SESSION_TOKEN }; }
function requireAuth_(req) { if (!APP_PIN) return; const token = String(req.get('x-sidomulyo-token') || ''); if (token !== SESSION_TOKEN) throw new Error('Unauthorized. Login ulang.'); }

function dashboard_() {
  const date = arguments[0]?.date || today_();
  const day = x => String(x.date || x.created_at || '').slice(0,10);
  const invAll = rows_('invoices');
  const woAll = rows_('work_orders');
  const payAll = rows_('payments');
  const expAll = rows_('expenses');
  const inv = invAll.filter(x => day(x) === date);
  const pay = payAll.filter(x => day(x) === date);
  const exp = expAll.filter(x => day(x) === date);
  const wo = woAll.filter(x => day(x) === date);
  const statusCounts = ['OPEN','DIKERJAKAN','TUNGGU_PART','SELESAI','INVOICED'].reduce((a,s)=>(a[s]=0,a),{});
  woAll.forEach(x => { const s=text_(x.status||'OPEN').toUpperCase(); if(s.startsWith('INVOICED')) statusCounts.INVOICED++; else statusCounts[s]=(statusCounts[s]||0)+1; });
  const receivableRows = invAll.filter(x=>num_(x.balance)>0).map(flatInvoice_).sort((a,b)=>num_(b.balance)-num_(a.balance));
  const lowStock = rows_('items').filter(x=>num_(x.stock)<=num_(x.min_stock)).sort((a,b)=>num_(a.stock)-num_(b.stock));
  const oldOpen = woAll.filter(x=>{ const s=text_(x.status).toUpperCase(); return !s.startsWith('INVOICED') && s!=='SELESAI' && day(x) < date; }).map(flatWorkOrder_).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,8);
  const readyInvoice = woAll.filter(x=>text_(x.status).toUpperCase()==='SELESAI' && !rows_('invoices',{work_order_id:x.id})[0]).map(flatWorkOrder_).slice(0,8);
  const attention = [
    ...oldOpen.map(x=>({type:'WO lewat hari',title:x.wo_no||x.id,subtitle:[x.customer_name,x.vehicle_plate,x.status].filter(Boolean).join(' · '),page:'workorders',id:x.id,level:'warn'})),
    ...readyInvoice.map(x=>({type:'Belum jadi nota',title:x.wo_no||x.id,subtitle:[x.customer_name,x.vehicle_plate].filter(Boolean).join(' · '),page:'workorders',id:x.id,level:'warn'})),
    ...receivableRows.slice(0,5).map(x=>({type:'Piutang',title:x.invoice_no||x.id,subtitle:[x.customer_name,rupiah_(x.balance)].filter(Boolean).join(' · '),page:'invoices',id:x.id,level:'warn'}))
  ].slice(0,12);
  const activity = [
    ...woAll.map(x=>({time:x.created_at||x.date,type:'WO',title:x.wo_no||x.id,subtitle:[flatWorkOrder_(x).customer_name,flatWorkOrder_(x).vehicle_plate].filter(Boolean).join(' · '),page:'workorders',id:x.id})),
    ...invAll.map(x=>({time:x.created_at||x.date,type:'Nota',title:x.invoice_no||x.id,subtitle:[flatInvoice_(x).customer_name,rupiah_(x.total)].filter(Boolean).join(' · '),page:'invoices',id:x.id})),
    ...payAll.map(x=>({time:x.created_at||x.date,type:'Bayar',title:rupiah_(x.amount),subtitle:x.method||'',page:'invoices',id:x.invoice_id})),
    ...expAll.map(x=>({time:x.created_at||x.date,type:'Expense',title:rupiah_(x.amount),subtitle:x.category||'',page:'expenses',id:x.id}))
  ].sort((a,b)=>String(b.time).localeCompare(String(a.time))).slice(0,10);
  return { date, vehicles: wo.length, sales: inv.reduce((a,x)=>a+num_(x.total),0), received: pay.reduce((a,x)=>a+num_(x.amount),0), receivables: receivableRows.reduce((a,x)=>a+num_(x.balance),0), expenses: exp.reduce((a,x)=>a+num_(x.amount),0), lowStock, statusCounts, receivablesList: receivableRows.slice(0,8), attention, activity };
}
function reportFinance_(p={}) {
  const from = text_(p.from || today_()).slice(0,10), to = text_(p.to || from).slice(0,10);
  if (from > to) throw new Error('Tanggal awal tidak boleh lebih besar dari tanggal akhir.');
  const inRange = x => { const d = String(x.date || x.created_at || '').slice(0,10); return d >= from && d <= to; };
  const inv = rows_('invoices').filter(inRange);
  const pay = rows_('payments').filter(inRange);
  const exp = rows_('expenses').filter(inRange);
  const owner = rows_('owner_withdrawals').filter(inRange);
  const wo = rows_('work_orders').filter(inRange);
  const sales = inv.reduce((a,x)=>a+num_(x.total),0);
  const received = pay.reduce((a,x)=>a+num_(x.amount),0);
  const expenses = exp.reduce((a,x)=>a+num_(x.amount),0);
  const cashReceived = pay.filter(x=>text_(x.method||'CASH').toUpperCase()==='CASH').reduce((a,x)=>a+num_(x.amount),0);
  const cashExpenses = exp.filter(x=>text_(x.method||'CASH').toUpperCase()==='CASH').reduce((a,x)=>a+num_(x.amount),0);
  const ownerTaken = owner.reduce((a,x)=>a+num_(x.amount),0);
  const cogs = inv.reduce((sum, invoice) => sum + rows_('work_order_items', { work_order_id: invoice.work_order_id }).reduce((a,i)=>a+(num_(i.hpp)*num_(i.qty)),0), 0);
  const days = {};
  for (let d = new Date(from + 'T00:00:00'); d <= new Date(to + 'T00:00:00'); d.setDate(d.getDate()+1)) {
    const key = d.toISOString().slice(0,10); days[key] = { date:key, invoices:0, sales:0, received:0, expenses:0, netCash:0 };
  }
  inv.forEach(x => { const k=String(x.date||'').slice(0,10); if(days[k]) { days[k].invoices++; days[k].sales += num_(x.total); } });
  pay.forEach(x => { const k=String(x.date||'').slice(0,10); if(days[k]) days[k].received += num_(x.amount); });
  exp.forEach(x => { const k=String(x.date||'').slice(0,10); if(days[k]) days[k].expenses += num_(x.amount); });
  Object.values(days).forEach(x => x.netCash = x.received - x.expenses);
  const outstanding = rows_('invoices').filter(x=>num_(x.balance)>0).map(flatInvoice_).sort((a,b)=>num_(b.balance)-num_(a.balance)).slice(0,20);
  return { from, to, summary:{ vehicles:wo.length, invoices:inv.length, sales, received, expenses, netCash:received-expenses, cogs, grossProfit:sales-cogs, outstanding:outstanding.reduce((a,x)=>a+num_(x.balance),0), cashReceived, cashExpenses, cashNet:cashReceived-cashExpenses, ownerTaken, ownerRemaining:cashReceived-cashExpenses-ownerTaken }, days:Object.values(days).reverse(), outstanding, ownerWithdrawals: owner.sort((a,b)=>String(b.date).localeCompare(String(a.date))) };
}

function listCustomers_() { return rows_('customers', {}, 'name ASC').map(c => ({ ...c, vehicles: rows_('vehicles', { customer_id: c.id }, 'plate ASC') })); }
function saveCustomer_(p) { 
  required_(p, ['name']); 
  const customer = save_('customers', { 
    id:p.id||undefined, 
    name:text_(p.name), 
    phone:text_(p.phone), 
    address:text_(p.address), 
    notes:text_(p.notes), 
    active:p.active==null?1:num_(p.active) 
  }, 'CST');
  
  // Save vehicles if provided
  if (p.vehicles && Array.isArray(p.vehicles)) {
    p.vehicles.forEach(v => {
      if (v.plate && v.plate.trim()) {
        saveVehicle_({
          id: v.id,
          customer_id: customer.id,
          plate: v.plate,
          brand: v.brand,
          model: v.model,
          year: v.year,
          color: v.color,
          vin: v.vin,
          odometer: v.odometer,
          notes: v.notes
        });
      }
    });
  }
  
  return customer;
}
function deleteCustomer_(p) { rows_('vehicles', { customer_id:p.id }).forEach(v=>deleteById_('vehicles', v.id)); return deleteById_('customers', p.id); }
function listVehicles_(p) { return p?.customer_id ? rows_('vehicles', { customer_id: p.customer_id }, 'plate ASC') : rows_('vehicles', {}, 'plate ASC'); }
function saveVehicle_(p) { required_(p, ['customer_id', 'plate']); return save_('vehicles', { id:p.id||undefined, customer_id:p.customer_id, plate:text_(p.plate).toUpperCase(), brand:text_(p.brand), model:text_(p.model), year:text_(p.year), color:text_(p.color), vin:text_(p.vin), odometer:num_(p.odometer), notes:text_(p.notes), active:p.active==null?1:num_(p.active) }, 'VEH'); }
function deleteVehicle_(p) { return deleteById_('vehicles', p.id); }
function listItems_() { return rows_('items', {}, 'name ASC'); }
function saveItem_(p) { required_(p, ['name']); return save_('items', { id:p.id||undefined, code:text_(p.code), name:text_(p.name), unit:text_(p.unit)||'PCS', location:text_(p.location), supplier:text_(p.supplier), stock:num_(p.stock), min_stock:num_(p.min_stock), hpp:num_(p.hpp), sell_price:num_(p.sell_price), active:p.active==null?1:num_(p.active) }, 'ITM'); }
function bulkSaveItems_(p){
  const items=Array.isArray(p.items)?p.items:[]; if(!items.length) throw new Error('Minimal 1 barang.');
  const out={added:0,updated:0,skipped:0,errors:[]};
  db.transaction(()=>{
    for(const [i,x] of items.entries()){
      const code=text_(x.code), name=text_(x.name); if(!name){out.skipped++; continue}
      const existing = code ? db.prepare('SELECT * FROM items WHERE UPPER(code)=UPPER(?) LIMIT 1').get(code) : null;
      if(existing){
        if(normalize_(existing.name)!==normalize_(name)){out.errors.push(`Baris ${i+1}: kode ${code} sudah dipakai untuk ${existing.name}`); continue}
        const qty=num_(x.stock); if(qty) moveStock_(existing.id, qty, { type:'IMPORT', notes:'Import barang bulk' });
        const patch={ updated_at:now_() };
        for(const k of ['supplier','unit','location']) if(text_(x[k])) patch[k]=text_(x[k]);
        for(const k of ['min_stock','hpp','sell_price']) if(String(x[k]??'')!=='') patch[k]=num_(x[k]);
        update_('items', existing.id, patch); out.updated++;
      } else { saveItem_(x); out.added++; }
    }
    if(out.errors.length) throw new Error(out.errors.join('\n'));
  })();
  return out;
}
function moveStock_(item_id, delta, meta={}) { const it=find_('items', item_id); if(!it) throw new Error('Item tidak ditemukan'); const next=num_(it.stock)+num_(delta); if(next < 0) throw new Error(`Stok ${it.name || item_id} tidak cukup. Stok: ${num_(it.stock)}, diminta: ${Math.abs(num_(delta))}`); update_('items', item_id, { stock: next, updated_at: now_() }); append_('stock_moves', { id:id_('STM'), date:meta.date||now_(), item_id, type:meta.type||'ADJUST', qty:num_(delta), unit_cost:num_(meta.unit_cost), reference_type:text_(meta.reference_type), reference_id:text_(meta.reference_id), notes:text_(meta.notes), created_by:user_(), created_at:now_() }); logActivity_(num_(delta)<0?'Stok keluar':'Stok masuk','item',item_id,{ref:it.code||it.name,amount:Math.abs(num_(delta))*num_(meta.unit_cost||it.hpp),detail:`${it.name} ${num_(delta)>0?'+':''}${num_(delta)} ${it.unit||''}`}); return find_('items', item_id); }
function adjustStock_(p) { const item_id=p.item_id||p.id; const qty=num_(p.qty||p.delta); const type=text_(p.type||'ADJUST_PLUS'); const delta=type==='ADJUST_MINUS' ? -qty : qty; return moveStock_(item_id, delta, { type, unit_cost:p.unit_cost, notes:p.notes }); }
function ensureEmployeePinColumn_(){
  const cols=db.prepare('PRAGMA table_info(employees)').all().map(c=>c.name);
  if(!cols.includes('pin')) db.exec("ALTER TABLE employees ADD COLUMN pin TEXT NOT NULL DEFAULT ''");
  db.prepare("UPDATE employees SET pin='' WHERE pin=position AND pin NOT GLOB '[0-9]*'").run();
}
function listEmployees_() {
  ensureEmployeePinColumn_();
  return rows_('employees', {}, 'name ASC').map(e=>({ ...e, pin: (text_(e.pin)===text_(e.position) && !/^\d+$/.test(text_(e.pin))) ? '' : e.pin }));
}
function saveEmployee_(p) {
  ensureEmployeePinColumn_();
  required_(p, ['name']);
  const row = save_('employees', { id:p.id||undefined, name:text_(p.name), phone:text_(p.phone), pin:text_(p.pin), position:text_(p.position||'Mekanik'), notes:text_(p.notes), active:p.active==null?1:num_(p.active) }, 'EMP');
  const saved = find_('employees', row.id);
  if (text_(saved?.pin) !== text_(p.pin)) throw new Error('PIN absensi gagal tersimpan.');
  return saved;
}
function deleteEmployee_(p) { return deleteById_('employees', p.id); }
function listOwnerWithdrawals_(p={}){ const from=text_(p.from||'0000-00-00').slice(0,10), to=text_(p.to||'9999-99-99').slice(0,10); return rows_('owner_withdrawals').filter(x=>String(x.date||'').slice(0,10)>=from&&String(x.date||'').slice(0,10)<=to).sort((a,b)=>String(b.date).localeCompare(String(a.date))); }
function saveOwnerWithdrawal_(p){ required_(p,['date','amount']); const amount=num_(p.amount); if(amount<=0) throw new Error('Nominal bos ambil wajib lebih dari 0.'); return save_('owner_withdrawals',{ id:p.id||undefined, date:text_(p.date).slice(0,10), amount, notes:text_(p.notes), created_by:user_(), created_at:now_() }, 'OWN'); }
function deleteOwnerWithdrawal_(p){ return deleteById_('owner_withdrawals', p.id); }
function listExpenses_() { return rows_('expenses', {}, 'date DESC'); }
function saveExpense_(p) { required_(p, ['date', 'amount', 'category']); return save_('expenses', { id:p.id||undefined, date:text_(p.date), category:text_(p.category), description:text_(p.description), amount:num_(p.amount), method:text_(p.method||'CASH'), notes:text_(p.notes), created_by:user_() }, 'EXP'); }
function deleteExpense_(p) { return deleteById_('expenses', p.id); }
const DATA_TABLES = ['customers','vehicles','items','employees','work_orders','work_order_items','invoices','payments','expenses','stock_moves'];
function listTables_() {
  return DATA_TABLES.map(name => ({
    name,
    count: db.prepare(`SELECT COUNT(*) AS count FROM ${name}`).get().count
  }));
}

function hydrateWorkOrder_(wo){ if(!wo) return wo; wo.customer = find_('customers', wo.customer_id); wo.vehicle = find_('vehicles', wo.vehicle_id); wo.items = rows_('work_order_items', { work_order_id: wo.id }, 'created_at ASC'); return wo; }
function getWorkOrder_(id) { return hydrateWorkOrder_(find_('work_orders', id)); }
function invoiceProfit_(inv){ const items = rows_('work_order_items', { work_order_id: inv.work_order_id }); const cogs = items.reduce((a,i)=>a+(num_(i.hpp)*num_(i.qty)),0); const gross_profit = num_(inv.total)-cogs; const margin_percent = num_(inv.total) ? (gross_profit/num_(inv.total))*100 : 0; return { cogs, gross_profit, margin_percent }; }
function getInvoice_(id) {
  const inv = find_('invoices', id);
  if (!inv) throw new Error('Nota tidak ditemukan');
  inv.customer = find_('customers', inv.customer_id);
  inv.vehicle = find_('vehicles', inv.vehicle_id);
  inv.workOrder = hydrateWorkOrder_(find_('work_orders', inv.work_order_id));
  inv.items = inv.workOrder?.items || [];
  Object.assign(inv, invoiceProfit_(inv));
  return inv;
}
function vehicleHistory_(p){ const vehicle_id=text_(p.vehicle_id||p.id); if(!vehicle_id) throw new Error('vehicle_id wajib.'); const vehicle=find_('vehicles', vehicle_id); if(!vehicle) throw new Error('Kendaraan tidak ditemukan.'); const customer=find_('customers', vehicle.customer_id)||{}; const workOrders=rows_('work_orders',{vehicle_id},'date DESC').map(wo=>{ const inv=rows_('invoices',{work_order_id:wo.id})[0]; return {...flatWorkOrder_(wo), invoice: inv ? flatInvoice_(inv) : null}; }); const total=workOrders.reduce((a,x)=>a+num_(x.invoice?.total||x.total),0); return { vehicle, customer, workOrders, summary:{ visits:workOrders.length, total, last_service:workOrders[0]?.date||'' } }; }
function globalSearch_(p){ const q=text_(p.q).toLowerCase(); if(q.length<2) return []; const hit=(...v)=>v.join(' ').toLowerCase().includes(q); const out=[]; rows_('customers').forEach(x=>{if(hit(x.name,x.phone,x.address,x.notes))out.push({type:'Customer',title:x.name,subtitle:[x.phone,x.address].filter(Boolean).join(' · '),page:'customers',id:x.id})}); rows_('vehicles').forEach(v=>{const c=find_('customers',v.customer_id)||{}; if(hit(v.plate,v.brand,v.model,v.year,c.name))out.push({type:'Kendaraan',title:v.plate,subtitle:[v.brand,v.model,v.year,c.name].filter(Boolean).join(' · '),page:'customers',id:v.id})}); rows_('work_orders').forEach(wo=>{const f=flatWorkOrder_(wo); if(hit(f.wo_no,f.customer_name,f.vehicle_plate,f.complaint,f.mechanics))out.push({type:'WO',title:f.wo_no,subtitle:[f.customer_name,f.vehicle_plate,f.status,rp_(f.total)].filter(Boolean).join(' · '),page:'workorders',id:f.id})}); rows_('invoices').forEach(inv=>{const f=flatInvoice_(inv); if(hit(f.invoice_no,f.customer_name,f.customer_phone,f.vehicle_plate,f.mechanics))out.push({type:'Nota',title:f.invoice_no,subtitle:[f.customer_name,f.vehicle_plate,f.payment_status,rp_(f.total)].filter(Boolean).join(' · '),page:'invoices',id:f.id})}); rows_('items').forEach(x=>{if(hit(x.code,x.name,x.location))out.push({type:'Barang',title:x.name,subtitle:[x.code,x.location,`Stok ${x.stock} ${x.unit}`].filter(Boolean).join(' · '),page:'stock',id:x.id})}); return out.slice(0,30); }
function rp_(n){ return 'Rp '+num_(n).toLocaleString('id-ID'); }
function ensureItemSupplierColumn_(){ const cols=db.prepare('PRAGMA table_info(items)').all().map(c=>c.name); if(!cols.includes('supplier')) db.exec("ALTER TABLE items ADD COLUMN supplier TEXT NOT NULL DEFAULT ''"); }
function logActivity_(action, entity, entity_id, detail={}){
  append_('audit_log',{ id:id_('LOG'), timestamp:now_(), user:user_(), action, entity, entity_id:text_(entity_id), detail:JSON.stringify(detail||{}) });
}
function parseLogDetail_(s){ try{return JSON.parse(s||'{}')}catch{return {text:s||''}} }

function flatWorkOrder_(wo){ const h=hydrateWorkOrder_(wo); const c=h.customer||{}, v=h.vehicle||{}; const subtotal=(h.items||[]).reduce((a,x)=>a+num_(x.subtotal||num_(x.qty)*num_(x.unit_price)),0); const total=Math.max(0, subtotal-num_(h.discount)); const has_service=(h.items||[]).some(x=>String(x.type||'').toUpperCase()==='SERVICE'); return {...h, customer_name:c.name||'', customer_phone:c.phone||'', vehicle:[v.brand,v.model].filter(Boolean).join(' '), vehicle_brand:v.brand||'', vehicle_model:v.model||'', vehicle_plate:v.plate||'', plate:v.plate||'', has_service, total}; }
function listWorkOrders_() { return rows_('work_orders', {}, 'created_at DESC').map(flatWorkOrder_); }
function listWorkOrderActivities_(){
  const wanted=['WO dibuat','WO diedit','Status WO berubah','Item WO diubah','Mekanik WO diubah','Stok keluar','Stok masuk','Pembayaran','WA nota dikirim','WA selesai dikirim','WO dihapus','Nota dibuat','Status invoice berubah'];
  const logs = rows_('audit_log', {}, 'timestamp DESC').filter(x=>wanted.includes(x.action)).slice(0,60).map(x=>{
    const d=parseLogDetail_(x.detail); return { type:x.action, date:x.timestamp, ref:d.ref||d.wo_no||d.invoice_no||'', customer:d.customer||'', amount:num_(d.amount), detail:d.detail||d.message||d.status||d.method||'', actor:x.user||'', entity:x.entity, entity_id:x.entity_id };
  });
  if(logs.length) return logs.slice(0,20);
  const out=[];
  rows_('work_orders').forEach(wo=>{ const c=find_('customers',wo.customer_id)||{}; out.push({type:'WO dibuat',date:wo.created_at||wo.date,ref:wo.wo_no,customer:c.name||'',amount:num_(wo.total),detail:text_(wo.complaint||wo.status)}); });
  rows_('invoices').forEach(inv=>{ const c=find_('customers',inv.customer_id)||{}; out.push({type:'Nota dibuat',date:inv.created_at||inv.date,ref:inv.invoice_no,customer:c.name||'',amount:num_(inv.total),detail:inv.payment_status||''}); });
  rows_('payments').forEach(pay=>{ const inv=find_('invoices',pay.invoice_id)||{}; const c=find_('customers',inv.customer_id)||{}; out.push({type:'Pembayaran',date:pay.created_at||pay.date,ref:inv.invoice_no||'',customer:c.name||'',amount:num_(pay.amount),detail:pay.method||'CASH'}); });
  return out.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(0,20);
}
const WO_STATUSES = ['OPEN','DIKERJAKAN','TUNGGU_PART','SELESAI'];
function updateWorkOrderStatus_(p){ const id=text_(p.id||p.work_order_id); const status=text_(p.status).toUpperCase(); if(!WO_STATUSES.includes(status)) throw new Error('Status WO tidak valid.'); const wo=find_('work_orders',id); if(!wo) throw new Error('WO tidak ditemukan.'); if(rows_('invoices',{work_order_id:id})[0] || wo.status==='INVOICED') throw new Error('WO yang sudah jadi nota tidak bisa diubah status manual.'); const updated=flatWorkOrder_(update_('work_orders', id, { status, updated_at: now_() })); logActivity_('Status WO berubah','work_order',id,{ref:wo.wo_no,customer:updated.customer_name,before:wo.status,after:status,detail:`${wo.status} → ${status}`}); return updated; }
function updateWorkOrderMechanic_(p){ const id=text_(p.id||p.work_order_id), mechanics=text_(p.mechanics); const wo=find_('work_orders',id); if(!wo) throw new Error('WO tidak ditemukan.'); const flat=flatWorkOrder_(wo); if(!flat.has_service) throw new Error('Mekanik hanya untuk WO yang punya jasa.'); const updated=flatWorkOrder_(update_('work_orders',id,{mechanics,updated_at:now_()})); logActivity_('Mekanik WO diubah','work_order',id,{ref:wo.wo_no,customer:updated.customer_name,before:wo.mechanics,after:mechanics,detail:`${wo.mechanics||'-'} → ${mechanics||'Kosong'}`}); return updated; }
function saveWorkOrder_(p) {
  required_(p, ['customer_id']);
  if (p.id) {
    const inv = rows_('invoices', { work_order_id: p.id })[0];
    if (inv && (inv.payment_status === 'LUNAS' || num_(inv.balance) === 0)) {
      throw new Error('WO yang sudah lunas tidak bisa diedit.');
    }
  }
  const isNew = !p.id;
  const subtotal = (Array.isArray(p.items)?p.items:[]).reduce((a,x)=>a+num_(x.qty||1)*num_(x.unit_price||0),0);
  const discount = num_(p.discount || 0);
  const wo = { id: p.id || undefined, customer_id: p.customer_id, vehicle_id: p.vehicle_id, wo_no: p.wo_no || nextNo_('WO'), date: isNew ? now_() : (p.date || now_()), status: p.status || 'OPEN', subtotal, discount, total:Math.max(0, subtotal-discount), mechanics: text_(p.mechanics), complaint: text_(p.complaint), diagnosis: text_(p.diagnosis), notes: text_(p.notes), odometer: num_(p.odometer) };
  const saved = save_('work_orders', wo, 'WO');
  const items = Array.isArray(p.items) ? p.items : [];
  replaceChildren_('work_order_items', 'work_order_id', saved.id, items.map((x) => ({ id: x.id || id_('WOI'), work_order_id: saved.id, type: x.type || 'SERVICE', item_id: x.item_id || '', description: text_(x.description), qty: num_(x.qty || 1), unit: text_(x.unit || 'PCS'), unit_price: num_(x.unit_price || 0), hpp: num_(x.hpp || 0), subtotal: num_(x.qty || 1) * num_(x.unit_price || 0), created_at: now_(), updated_at: now_() })));
  const flat=flatWorkOrder_(saved);
  logActivity_(isNew?'WO dibuat':'WO diedit','work_order',saved.id,{ref:saved.wo_no,customer:flat.customer_name,amount:saved.total,detail:text_(saved.complaint||saved.status)});
  if(items.length) logActivity_('Item WO diubah','work_order',saved.id,{ref:saved.wo_no,customer:flat.customer_name,amount:saved.total,detail:`${items.length} item/baris`});
  return saved;
}
function deleteWorkOrders_(p) { const ids = Array.isArray(p.ids)?p.ids:[p.id].filter(Boolean); let deleted=0; ids.forEach(id=>{ const wo=find_('work_orders',id)||{}; const inv=rows_('invoices',{work_order_id:id})[0]; if(inv) throw new Error('WO yang sudah jadi nota tidak bisa dihapus.'); db.prepare('DELETE FROM work_order_items WHERE work_order_id = ?').run(id); deleteById_('work_orders', id); logActivity_('WO dihapus','work_order',id,{ref:wo.wo_no||id,detail:'WO dibatalkan/dihapus'}); deleted++; }); return { deleted }; }

function flatInvoice_(inv){ const c=find_('customers', inv.customer_id)||{}, v=find_('vehicles', inv.vehicle_id)||{}, w=hydrateWorkOrder_(find_('work_orders', inv.work_order_id))||{}; return {...inv, ...invoiceProfit_(inv), customer_name:c.name||'', customer_phone:c.phone||'', vehicle_brand:v.brand||'', vehicle_model:v.model||'', vehicle_plate:v.plate||'', mechanics:w.mechanics||'', workOrder:w, customer:c, vehicle:v}; }
function listInvoices_() { return rows_('invoices', {}, 'created_at DESC').map(flatInvoice_); }
function finalizeInvoice_(p) {
  required_(p, ['work_order_id']);
  const wo = find_('work_orders', p.work_order_id); if (!wo) throw new Error('WO tidak ditemukan');
  const existing = rows_('invoices', { work_order_id: wo.id })[0]; if (existing) return existing;
  const items = rows_('work_order_items', { work_order_id: wo.id }, 'created_at ASC');
  const subtotal = items.reduce((a, x) => a + num_(x.qty) * num_(x.unit_price), 0);
  const discount = num_(wo.discount || 0);
  const total = Math.max(0, subtotal - discount);
  const paid = num_(p.paid || 0);
  if (paid < 0) throw new Error('Nominal bayar tidak valid.');
  if (paid > total) throw new Error('Nominal bayar melebihi total nota.');
  const balance = Math.max(0, total - paid);
  const payment_status = paid >= total && total > 0 ? 'LUNAS' : (paid > 0 ? 'NYICIL' : 'BELUM LUNAS');
  const inv = save_('invoices', { id: p.id, work_order_id: wo.id, invoice_no: wo.wo_no || nextNo_('INV'), customer_id: wo.customer_id, vehicle_id: wo.vehicle_id, date: p.date || now_(), subtotal, discount, total, paid, balance, payment_status }, 'INV');
  items.filter(x=>x.type==='PART' && x.item_id).forEach(x=>moveStock_(x.item_id, -num_(x.qty), { type:'OUT', reference_type:'INVOICE', reference_id:inv.id, notes:`Nota ${inv.invoice_no}` }));
  const woStatus = payment_status === 'LUNAS' ? 'INVOICED_PAID' : (payment_status === 'NYICIL' ? 'INVOICED_PARTIAL' : 'INVOICED_UNPAID');
  update_('work_orders', wo.id, { status: woStatus, updated_at: now_() });
  const c=find_('customers',wo.customer_id)||{};
  logActivity_('Nota dibuat','invoice',inv.id,{ref:inv.invoice_no,invoice_no:inv.invoice_no,customer:c.name||'',amount:total,status:payment_status,detail:payment_status});
  logActivity_('Status WO berubah','work_order',wo.id,{ref:wo.wo_no,customer:c.name||'',before:wo.status,after:woStatus,detail:`${wo.status} → ${woStatus}`});
  return inv;
}
function recordPayment_(p) { 
  const inv = find_('invoices', p.invoice_id||p.id); 
  if (!inv) throw new Error('Nota tidak ditemukan'); 
  const amount=num_(p.amount); 
  if(amount <= 0) throw new Error('Nominal pembayaran wajib lebih dari 0.'); 
  if(num_(inv.paid)+amount > num_(inv.total)) throw new Error('Nominal pembayaran melebihi sisa tagihan.'); 
  append_('payments', { id:id_('PAY'), invoice_id:inv.id, date:p.date||now_(), amount, method:text_(p.method||'CASH'), reference:text_(p.reference), notes:text_(p.notes), created_by:user_(), created_at:now_() }); 
  const paid = num_(inv.paid) + amount; 
  const balance = Math.max(0, num_(inv.total) - paid); 
  const payment_status = balance <= 0 ? 'LUNAS' : 'NYICIL';
  const updated = update_('invoices', inv.id, { paid, balance, payment_status, updated_at:now_() });
  const woStatus = payment_status === 'LUNAS' ? 'INVOICED_PAID' : 'INVOICED_PARTIAL';
  update_('work_orders', inv.work_order_id, { status: woStatus, updated_at: now_() });
  const c=find_('customers',inv.customer_id)||{};
  logActivity_('Pembayaran','invoice',inv.id,{ref:inv.invoice_no,invoice_no:inv.invoice_no,customer:c.name||'',amount,method:text_(p.method||'CASH'),detail:text_(p.method||'CASH')});
  logActivity_('Status invoice berubah','invoice',inv.id,{ref:inv.invoice_no,customer:c.name||'',before:inv.payment_status,after:payment_status,detail:`${inv.payment_status} → ${payment_status}`});
  return updated;
}
function setInvoiceStatus_(p){ const inv=find_('invoices', p.invoice_id||p.id); if(!inv) throw new Error('Nota tidak ditemukan'); const paid=p.paid==null?num_(inv.paid):num_(p.paid); const balance=Math.max(0,num_(inv.total)-paid); const payment_status=text_(p.payment_status)|| (balance<=0?'LUNAS':'NYICIL'); const updated=update_('invoices', inv.id, { paid, balance, payment_status, updated_at:now_() }); const c=find_('customers',inv.customer_id)||{}; logActivity_('Status invoice berubah','invoice',inv.id,{ref:inv.invoice_no,customer:c.name||'',before:inv.payment_status,after:payment_status,detail:`${inv.payment_status} → ${payment_status}`}); return updated; }
function markInvoiceWaSent_(p) { const inv=find_('invoices',p.id)||{}; const c=find_('customers',inv.customer_id)||{}; const updated=update_('invoices', p.id, { wa_sent_at:now_(), wa_sent_by:user_(), updated_at:now_() }); logActivity_('WA nota dikirim','invoice',p.id,{ref:inv.invoice_no,customer:c.name||'',detail:'Nota dikirim via WhatsApp'}); return updated; }
function markInvoiceServiceWaSent_(p) { const inv=find_('invoices',p.id)||{}; const c=find_('customers',inv.customer_id)||{}; const updated=update_('invoices', p.id, { wa_service_sent_at:now_(), wa_service_sent_by:user_(), updated_at:now_() }); logActivity_('WA selesai dikirim','invoice',p.id,{ref:inv.invoice_no,customer:c.name||'',detail:'Info kendaraan selesai dikirim via WhatsApp'}); return updated; }

async function createInvoicePdf_(id) {
  const inv = getInvoice_(id);
  const s = settings_();
  const doc = new PDFDocument({ size: 'A4', margin: 28, bufferPages: false, autoFirstPage: true });
  const filename = `Nota_${inv.invoice_no.replace(/\//g, '-')}.pdf`;
  const filepath = join(PDF_DIR, filename);
  const stream = createWriteStream(filepath);
  doc.pipe(stream);
  const pageW = doc.page.width, pageH = doc.page.height, x0 = 32, x1 = pageW - 32, contentW = x1 - x0;
  const fmt = (v) => rupiah_(num_(v));
  const green = '#184E43', muted = '#5E6E68', dark = '#161616', border = '#D4DEDA', soft = '#F3F7F5', danger='#A54646';
  const txt=(t,x,y,w,opt={})=>doc.fillColor(opt.color||dark).font(opt.bold?'Helvetica-Bold':'Helvetica').fontSize(opt.size||8.5).text(String(t??'-'),x,y,{width:w,height:opt.height||12,align:opt.align||'left',lineGap:0,ellipsis:true});
  const line=(y,xl=x0,xr=x1,c=border,w=.7)=>doc.moveTo(xl,y).lineTo(xr,y).lineWidth(w).strokeColor(c).stroke();
  const badge = (label, color, bx, by, bw=96, bh=18)=>{ doc.save().roundedRect(bx,by,bw,bh,5).fill(color).restore(); txt(label,bx,by+4,bw,{bold:true,size:8.2,align:'center',color:'#fff'}); };
  txt((s.business_name || 'SIDOMULYO MOTOR').toUpperCase(), x0, 26, contentW, {bold:true,size:17,align:'center',color:green});
  txt(s.business_address || '', x0, 48, contentW, {size:8,align:'center',color:muted,height:10});
  txt(s.business_phone ? `Telp: ${s.business_phone}` : '', x0, 60, contentW, {size:8,align:'center',color:muted,height:10});
  line(76);
  doc.save().rect(x0,84,contentW,28).fill(green).restore();
  txt('NOTA SERVIS & PENJUALAN', x0+10, 92, 260, {bold:true,size:12,color:'#fff'});
  const st = String(inv.payment_status||'BELUM LUNAS').toUpperCase();
  badge(st, st==='LUNAS' ? '#2B8E62' : (st==='NYICIL' ? '#C4872A' : '#A54646'), x1-110, 89, 100, 18);
  const infoY = 122, colW = contentW/2 - 8, rowH = 15, lx = x0, rx = x0 + contentW/2 + 8;
  const pair=(l,v,x,y)=>{txt(l,x,y,62,{size:8,color:muted,height:10}); txt(v,x+66,y, colW-66,{bold:true,size:8.3,height:10});};
  pair('No. Nota', inv.invoice_no, lx, infoY);
  pair('Tanggal', String(inv.date).replace('T',' ').slice(0,16), lx, infoY+rowH);
  pair('Mekanik', inv.workOrder?.mechanics || '-', lx, infoY+rowH*2);
  pair('Customer', inv.customer?.name || '-', rx, infoY);
  pair('Telepon', inv.customer?.phone || '-', rx, infoY+rowH);
  pair('Kendaraan', [inv.vehicle?.plate,[inv.vehicle?.brand,inv.vehicle?.model].filter(Boolean).join(' ')].filter(Boolean).join(' · ') || '-', rx, infoY+rowH*2);
  line(174);
  txt('DETAIL BARANG & JASA', x0, 182, contentW, {bold:true,size:9.2,color:green});
  const items = inv.items || inv.workOrder?.items || [];
  const tableY = 198, headerH = 18, rowMinH = 17, cNo = x0, cType = x0+24, cItem = x0+82, cQty = x0+330, cPrice = x0+378, cSub = x0+458;
  doc.save().rect(x0, tableY, contentW, headerH).fill(green).restore();
  txt('No', cNo+2, tableY+5, 18, {bold:true,size:8,align:'center',color:'#fff'}); txt('Jenis', cType, tableY+5, 48, {bold:true,size:8,align:'center',color:'#fff'}); txt('Barang / Jasa', cItem, tableY+5, 220, {bold:true,size:8,color:'#fff'}); txt('Qty', cQty, tableY+5, 34, {bold:true,size:8,align:'center',color:'#fff'}); txt('Harga', cPrice, tableY+5, 74, {bold:true,size:8,color:'#fff'}); txt('Subtotal', cSub, tableY+5, 74, {bold:true,size:8,color:'#fff'});
  let y = tableY + headerH;
  const maxPdfRows = 20;
  const pdfItems = items.length > maxPdfRows ? items.slice(0, maxPdfRows - 1) : items;
  pdfItems.forEach((item, i)=>{ const h=rowMinH; if(i%2===0) doc.save().rect(x0,y,contentW,h).fill('#FAFCFB').restore(); txt(i+1,cNo+2,y+4,18,{size:8,align:'center'}); txt(item.type==='PART'?'Sparepart':'Jasa',cType+2,y+4,50,{size:8,align:'center'}); txt(item.description||'',cItem,y+4,232,{size:8}); txt(item.qty||'',cQty,y+4,34,{size:8,align:'center'}); txt(fmt(item.unit_price),cPrice,y+4,76,{size:8,align:'right'}); txt(fmt(num_(item.subtotal||num_(item.qty)*num_(item.unit_price))),cSub,y+4,76,{size:8,align:'right'}); line(y+h,x0,x1,'#E6ECE9',.35); y+=h; });
  if(items.length > maxPdfRows){ const h=rowMinH; const hidden = items.length - (maxPdfRows - 1); doc.save().rect(x0,y,contentW,h).fill('#FFF7E6').restore(); txt('…',cNo+2,y+4,18,{size:8,align:'center'}); txt('Info',cType+2,y+4,50,{size:8,align:'center'}); txt(`+ ${hidden} item lain. Detail lengkap tetap tersimpan di nota digital.`,cItem,y+4,232,{size:8,bold:true,color:danger}); txt('',cQty,y+4,34,{size:8,align:'center'}); txt('',cPrice,y+4,76,{size:8,align:'right'}); txt('',cSub,y+4,76,{size:8,align:'right'}); line(y+h,x0,x1,'#E6ECE9',.35); y+=h; }
  const sumY = 618, sumW = 228, sumH = 94, sumX = x1 - sumW;
  doc.save().roundedRect(sumX, sumY, sumW, sumH, 6).fill(soft).restore();
  doc.roundedRect(sumX, sumY, sumW, sumH, 6).lineWidth(0.7).strokeColor(border).stroke();
  const sx1 = sumX+14, sx2 = sumX+130;
  const sLine = (l,v,yy,b=false,c=dark)=>{ txt(l,sx1,yy,104,{size:8.5,bold:b,color:c,height:11}); txt(v,sx2,yy,84,{size:8.5,bold:b,align:'right',color:c,height:11}); };
  sLine('Subtotal', fmt(inv.subtotal), sumY+12);
  sLine('Diskon', fmt(inv.discount), sumY+27);
  line(sumY+44,sumX+12,sumX+sumW-12,'#CDD8D4',.6);
  doc.save().roundedRect(sumX+3,sumY+48,sumW-6,16,4).fill('#E7F1EC').restore();
  sLine('TOTAL', fmt(inv.total), sumY+51, true, green);
  sLine('Dibayar', fmt(inv.paid), sumY+68);
  sLine('Sisa', fmt(inv.balance), sumY+83, true, inv.balance>0?danger:green);

  doc.save().roundedRect(x0, 626, 212, 86, 6).strokeColor(border).lineWidth(.7).stroke().restore();
  txt('Catatan', x0+10, 634, 80, {bold:true,size:8.5,color:muted});
  txt(inv.workOrder?.notes || '-', x0+10, 648, 192, {size:8,height:34});
  txt('Ttd. Customer', x0+10, 690, 90, {size:7.5,color:muted});
  line(706, x0+10, x0+90, '#D5DEDA', .6);

  txt('Terima kasih atas kepercayaan Anda.', x0, pageH-26, contentW, {size:7.2,align:'center',color:muted,height:9});
  doc.end();
  return new Promise((resolve, reject) => { stream.on('finish', () => { update_('invoices', id, { pdf_url: `/pdfs/${filename}`, updated_at: now_() }); audit_('PDF', 'Invoice', id, { url: `/pdfs/${filename}` }); resolve({ url: `/pdfs/${filename}`, filename }); }); stream.on('error', reject); });
}

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.post('/api/uploadWorkOrderPhoto', woPhotoUpload.single('file'), async (req,res)=>{ try { requireAuth_(req); res.json(json(true, uploadWorkOrderPhoto_(req.file, req.body||{}))); } catch(e){ if(req.file?.path) try{rmSync(req.file.path)}catch{}; res.json(json(false,null,e.message)); } });
app.post('/api/importExcel', upload.single('file'), async (req, res) => { try { requireAuth_(req); res.json(json(true, await importExcel_(req.file))); } catch (e) { res.json(json(false, null, e.message)); } finally { if (req.file?.path) try { rmSync(req.file.path); } catch {} } });
function setupApp_(){ return { ok:true }; }
function ensureMobileAttendanceSchema_(){
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL DEFAULT '',
      employee_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      check_in_at TEXT NOT NULL DEFAULT '',
      check_in_lat REAL,
      check_in_lng REAL,
      check_in_accuracy REAL,
      check_in_photo_url TEXT NOT NULL DEFAULT '',
      check_out_at TEXT NOT NULL DEFAULT '',
      check_out_lat REAL,
      check_out_lng REAL,
      check_out_accuracy REAL,
      check_out_photo_url TEXT NOT NULL DEFAULT '',
      last_lat REAL,
      last_lng REAL,
      last_accuracy REAL,
      last_ping_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_attendance_sessions_employee ON attendance_sessions(employee_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_sessions_status ON attendance_sessions(status);
    CREATE TABLE IF NOT EXISTS attendance_locations (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL DEFAULT '',
      employee_id TEXT NOT NULL DEFAULT '',
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      accuracy REAL,
      recorded_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_attendance_locations_session ON attendance_locations(session_id);
  `);
}
function mobileToken_(emp){ return Buffer.from(`${emp.id}:${crypto.createHash('sha256').update(`${emp.id}:${emp.pin||''}:${SESSION_TOKEN}`).digest('hex')}`).toString('base64url'); }
function mobileEmployeeFromReq_(req){
  const auth = text_(req.get('authorization')).replace(/^Bearer\s+/i,'');
  if(!auth) throw new Error('Unauthorized mobile token.');
  let raw=''; try{ raw=Buffer.from(auth,'base64url').toString('utf8'); }catch{}
  const [id, sig] = raw.split(':'); const emp=find_('employees', id);
  if(!emp || !emp.active) throw new Error('Karyawan tidak aktif.');
  const good = crypto.createHash('sha256').update(`${emp.id}:${emp.pin||''}:${SESSION_TOKEN}`).digest('hex');
  if(sig !== good) throw new Error('Unauthorized mobile token.');
  return emp;
}
function saveAttendancePhoto_(base64, prefix){
  const clean=text_(base64).replace(/^data:image\/\w+;base64,/, '');
  if(!clean) throw new Error('Foto wajib.');
  const buf=Buffer.from(clean,'base64');
  if(buf.length < 1024) throw new Error('Foto tidak valid.');
  const filename=`${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.jpg`;
  writeFileSync(join(ATTENDANCE_PHOTO_DIR, filename), buf);
  return `/uploads/attendance/${filename}`;
}
function mobileLogin_(p){
  ensureMobileAttendanceSchema_();
  const username=text_(p.username||p.employee_id||p.id);
  const pin=text_(p.pin);
  const emp=rows_('employees').find(e=>e.active && (eq(e.id,username) || eq(e.phone,username) || text_(e.name).toLowerCase()===username.toLowerCase()));
  if(!emp || (text_(emp.pin) && !eq(emp.pin,pin))) throw new Error('Login karyawan gagal.');
  if(!text_(emp.pin) && pin) throw new Error('PIN karyawan belum diset di admin.');
  return { token: mobileToken_(emp), employee:{ id:emp.id, name:emp.name, phone:emp.phone, position:emp.position } };
}
function attendanceCheckin_(req){
  ensureMobileAttendanceSchema_();
  const emp=mobileEmployeeFromReq_(req), p=req.body||{};
  const existing=rows_('attendance_sessions',{employee_id:emp.id}).find(x=>x.status==='ACTIVE');
  if(existing) return { session_id: existing.id, status: existing.status };
  const at=now_(), photo=saveAttendancePhoto_(p.photo_base64, `in_${emp.id}`), sid=id_('ATS');
  append_('attendance_sessions',{ id:sid, employee_id:emp.id, employee_name:emp.name, status:'ACTIVE', check_in_at:at, check_in_lat:num_(p.lat), check_in_lng:num_(p.lng), check_in_accuracy:num_(p.accuracy), check_in_photo_url:photo, last_lat:num_(p.lat), last_lng:num_(p.lng), last_accuracy:num_(p.accuracy), last_ping_at:at, created_at:at, updated_at:at });
  append_('attendance_locations',{ id:id_('ATL'), session_id:sid, employee_id:emp.id, lat:num_(p.lat), lng:num_(p.lng), accuracy:num_(p.accuracy), recorded_at:at, created_at:at });
  append_('attendance',{ id:id_('ATT'), date:at.slice(0,10), time:at.slice(11,19), employee_id:emp.id, employee_name:emp.name, type:'IN', pin_ok:1, lat:num_(p.lat), lng:num_(p.lng), accuracy:num_(p.accuracy), photo_url:photo, method:'MOBILE', created_at:at });
  return { session_id:sid, status:'ACTIVE' };
}
function attendanceLocation_(req){
  ensureMobileAttendanceSchema_();
  const p=req.body||{};
  const sid=text_(p.session_id);
  if(!sid) throw new Error('session_id wajib');
  const s=rows_('attendance_sessions',{id:sid})[0];
  if(!s || s.status!=='ACTIVE') throw new Error('Sesi absensi tidak aktif.');
  const recorded=text_(p.recorded_at||now_());
  append_('attendance_locations',{ id:id_('ATL'), session_id:sid, employee_id:s.employee_id, lat:num_(p.lat), lng:num_(p.lng), accuracy:num_(p.accuracy), recorded_at:recorded, created_at:now_() });
  update_('attendance_sessions', sid, { last_lat:num_(p.lat), last_lng:num_(p.lng), last_accuracy:num_(p.accuracy), last_ping_at:recorded, updated_at:now_() });
  return { ok:true };
}
function attendanceCheckout_(req){
  ensureMobileAttendanceSchema_();
  const p=req.body||{};
  const sid=text_(p.session_id); const s=rows_('attendance_sessions',{id:sid})[0];
  if(!s || s.status!=='ACTIVE') throw new Error('Sesi absensi tidak aktif.');
  let emp;
  try { emp=mobileEmployeeFromReq_(req); } catch { emp=rows_('employees',{id:s.employee_id})[0]; }
  if(!emp || emp.id!==s.employee_id) throw new Error('Karyawan tidak aktif.');
  const at=now_(), photo=saveAttendancePhoto_(p.photo_base64, `out_${emp.id}`);
  update_('attendance_sessions', sid, { status:'CLOSED', check_out_at:at, check_out_lat:num_(p.lat), check_out_lng:num_(p.lng), check_out_accuracy:num_(p.accuracy), check_out_photo_url:photo, last_lat:num_(p.lat), last_lng:num_(p.lng), last_accuracy:num_(p.accuracy), last_ping_at:at, updated_at:at });
  append_('attendance_locations',{ id:id_('ATL'), session_id:sid, employee_id:emp.id, lat:num_(p.lat), lng:num_(p.lng), accuracy:num_(p.accuracy), recorded_at:at, created_at:at });
  append_('attendance',{ id:id_('ATT'), date:at.slice(0,10), time:at.slice(11,19), employee_id:emp.id, employee_name:emp.name, type:'OUT', pin_ok:1, lat:num_(p.lat), lng:num_(p.lng), accuracy:num_(p.accuracy), photo_url:photo, method:'MOBILE', created_at:at });
  return { session_id:sid, status:'CLOSED' };
}
function attendanceLive_(){ ensureMobileAttendanceSchema_(); return rows_('attendance_sessions',{status:'ACTIVE'},'last_ping_at DESC'); }
function listMechanicJobs_(p) {
  const name = text_(p.name).toLowerCase().trim();
  if (!name) throw new Error('Nama mekanik wajib.');
  return rows_('work_orders', {}, 'created_at DESC').map(flatWorkOrder_).filter(wo => (wo.mechanics || '').toLowerCase().includes(name));
}
function sameDate_(v,date){ return !date || String(v||'').slice(0,10)===date; }
function sessionOnDate_(s,date){ return !date || sameDate_(s.check_in_at,date) || sameDate_(s.check_out_at,date) || sameDate_(s.created_at,date); }
function attendanceLocationLog_(p={}){
  ensureMobileAttendanceSchema_();
  const sessions = Object.fromEntries(rows_('attendance_sessions').map(s => [s.id, s]));
  const employees = Object.fromEntries(rows_('employees').map(e => [e.id, e]));
  return rows_('attendance_locations', p.session_id?{session_id:p.session_id}:{}, 'recorded_at DESC')
    .filter(x => sameDate_(x.recorded_at, p.date))
    .slice(0,200).map(x => {
      const sess = sessions[x.session_id] || {};
      const emp = employees[x.employee_id || sess.employee_id] || {};
      return { ...x, employee_name: emp.name || sess.employee_name || x.employee_id || sess.employee_id || '-' };
    });
}
function attendanceHistory_(p={}){ ensureMobileAttendanceSchema_(); return rows_('attendance_sessions', p.employee_id?{employee_id:p.employee_id}:{}, 'created_at DESC').filter(s=>sessionOnDate_(s,p.date)).slice(0,200); }
function listAttendance_(p){ ensureMobileAttendanceSchema_(); return rows_('attendance', p?.date ? { date:p.date } : {}, 'created_at DESC'); }
app.post('/api/mobile/login', (req,res)=>{ try { res.json(json(true, mobileLogin_(req.body||{}))); } catch(e){ res.json(json(false,null,e.message)); } });
app.post('/api/attendance/checkin', (req,res)=>{ try { res.json(json(true, attendanceCheckin_(req))); } catch(e){ res.json(json(false,null,e.message)); } });
app.post('/api/attendance/location', (req,res)=>{ try { res.json(json(true, attendanceLocation_(req))); } catch(e){ res.json(json(false,null,e.message)); } });
app.post('/api/attendance/checkout', (req,res)=>{ try { res.json(json(true, attendanceCheckout_(req))); } catch(e){ res.json(json(false,null,e.message)); } });
app.post('/api/mobile/mechanic-jobs', (req,res)=>{ try { res.json(json(true, listMechanicJobs_(req.body||{}))); } catch(e){ res.json(json(false,null,e.message)); } });
app.get('/api/attendance/live', (req,res)=>{ try { res.json(json(true, attendanceLive_())); } catch(e){ res.json(json(false,null,e.message)); } });
app.get('/api/attendance/history', (req,res)=>{ try { res.json(json(true, attendanceHistory_(req.query||{}))); } catch(e){ res.json(json(false,null,e.message)); } });
app.post('/api/:action', async (req, res) => {
  try {
    const action = req.params.action;
    if (action !== 'bootstrap' && action !== 'login') requireAuth_(req);
    const map = {
      bootstrap: bootstrap_, login: login_, setupApp: setupApp_, dashboard: dashboard_, reportFinance: reportFinance_, vehicleHistory: vehicleHistory_, globalSearch: globalSearch_, listWorkOrderPhotos: listWorkOrderPhotos_, exportFinancePdf: exportFinancePdf_, updateWorkOrderStatus: updateWorkOrderStatus_, updateWorkOrderMechanic: updateWorkOrderMechanic_, listAttendance: listAttendance_, attendanceLive: attendanceLive_, attendanceLocationLog: attendanceLocationLog_, attendanceHistory: attendanceHistory_, listCustomers: listCustomers_, saveCustomer: saveCustomer_, deleteCustomer: deleteCustomer_,
      listVehicles: listVehicles_, saveVehicle: saveVehicle_, deleteVehicle: deleteVehicle_, listItems: listItems_, saveItem: saveItem_, bulkSaveItems: bulkSaveItems_, adjustStock: adjustStock_,
      listEmployees: listEmployees_, saveEmployee: saveEmployee_, deleteEmployee: deleteEmployee_, listWorkOrders: listWorkOrders_, listWorkOrderActivities: listWorkOrderActivities_, getWorkOrder: (p)=>getWorkOrder_(p.id),
      saveWorkOrder: saveWorkOrder_, deleteWorkOrders: deleteWorkOrders_, finalizeInvoice: finalizeInvoice_, listInvoices: listInvoices_, getInvoice: (p)=>getInvoice_(p.id),
      listBukuBesar: () => [], recordPayment: recordPayment_, updateInvoiceStatus: setInvoiceStatus_, markInvoiceWaSent: markInvoiceWaSent_, markInvoiceServiceWaSent: markInvoiceServiceWaSent_, createInvoicePdf: (p)=>createInvoicePdf_(p.id), exportExcel: exportExcel_, exportTemplate: exportTemplate_, listExpenses: listExpenses_, saveExpense: saveExpense_, deleteExpense: deleteExpense_, listOwnerWithdrawals: listOwnerWithdrawals_, saveOwnerWithdrawal: saveOwnerWithdrawal_, deleteOwnerWithdrawal: deleteOwnerWithdrawal_, listTables: listTables_
    };
    const fn = map[action]; if (!fn) throw new Error(`Unknown action: ${action}`);
    const data = await fn(req.body || {});
    res.json(json(true, data));
  } catch (e) { res.json(json(false, null, e.message)); }
});
app.post('/api/createInvoicePdf', async (req, res) => { try { requireAuth_(req); res.json(json(true, await createInvoicePdf_(req.body.id))); } catch (e) { res.json(json(false, null, e.message)); } });
app.post('/api/exportExcel', async (req, res) => { try { requireAuth_(req); res.json(json(true, await exportExcel_(req.body || {}))); } catch (e) { res.json(json(false, null, e.message)); } });

async function exportExcel_(p = {}) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Data');
  ws.columns = [{ header: 'Tabel', key: 'table', width: 20 }, { header: 'JSON', key: 'json', width: 120 }];
  const requested = text_(p.tables || 'all');
  const tables = requested && requested !== 'all' ? DATA_TABLES.filter(t => t === requested) : DATA_TABLES;
  tables.forEach(t => ws.addRow({ table: t, json: JSON.stringify(rows_(t).slice(0, 20)) }));
  const filename = `export_${Date.now()}.xlsx`;
  const file = join(EXPORT_DIR, filename);
  await wb.xlsx.writeFile(file);
  return { url: `/exports/${filename}`, filename };
}


async function exportFinancePdf_(p={}) {
  const r = reportFinance_(p);
  const filename = `laporan_${r.from}_${r.to}.pdf`;
  const file = join(PDF_DIR, filename);
  const money = n => rupiah_(n);
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size:'A4', margin:32 });
    doc.pipe(createWriteStream(file)).on('finish', resolve).on('error', reject);
    const pageW = doc.page.width, left = 32, right = pageW - 32, width = right - left;
    const green = '#15382f', muted = '#6d7b76', line = '#dfe7e3', soft = '#f4f8f6';
    const txt = (t,x,y,w,o={}) => doc.font(o.bold?'Helvetica-Bold':'Helvetica').fontSize(o.size||9).fillColor(o.color||'#17332d').text(String(t ?? ''), x, y, { width:w, align:o.align||'left' });
    doc.roundedRect(left, 28, width, 58, 10).fill(green);
    doc.fillColor('#dfe95a').font('Helvetica-Bold').fontSize(18).text('LAPORAN KEUANGAN', left+18, 42, { width: width-36 });
    doc.fillColor('#dbe8e3').font('Helvetica').fontSize(10).text(`Sidomulyo Motor • ${r.from} s/d ${r.to}`, left+18, 65);
    const s = r.summary;
    const cards = [
      ['Penjualan', money(s.sales)], ['Uang Masuk', money(s.received)], ['Pengeluaran', money(s.expenses)],
      ['Kas Bersih', money(s.netCash)], ['HPP', money(s.cogs)], ['Laba Kotor', money(s.grossProfit)],
      ['Piutang', money(s.outstanding)], ['Nota', s.invoices], ['Mobil Datang', `${s.vehicles} unit`]
    ];
    let y = 102, cardW = (width - 16) / 3, cardH = 43;
    cards.forEach((c,i)=>{ const x = left + (i%3)*(cardW+8), cy = y + Math.floor(i/3)*(cardH+8); doc.roundedRect(x,cy,cardW,cardH,8).fill(soft).strokeColor(line).stroke(); txt(c[0],x+10,cy+8,cardW-20,{size:8,color:muted}); txt(c[1],x+10,cy+22,cardW-20,{size:11,bold:true,align:'right',color:green}); });
    y += 3*(cardH+8)+8;
    txt('Rekap Harian', left, y, width, {size:13,bold:true,color:green}); y += 22;
    const cols = [0,74,112,206,300,394,488];
    const heads = ['Tanggal','Nota','Penjualan','Masuk','Keluar','Kas Bersih'];
    doc.roundedRect(left,y,width,22,6).fill(green);
    heads.forEach((h,i)=>txt(h,left+cols[i]+6,y+7,(cols[i+1]-cols[i]-8),{size:8,bold:true,color:'#fff',align:i<2?'left':'right'}));
    y += 22;
    const rows = r.days.slice().reverse().filter(d => d.invoices || d.sales || d.received || d.expenses || d.netCash);
    (rows.length ? rows : r.days.slice().reverse()).forEach((d,idx)=>{
      if (y > 742) { doc.addPage(); y = 36; }
      if(idx%2===0) doc.rect(left,y,width,20).fill('#fbfcfb');
      txt(d.date,left+cols[0]+6,y+6,cols[1]-cols[0]-8,{size:8});
      txt(d.invoices,left+cols[1]+6,y+6,cols[2]-cols[1]-8,{size:8,align:'right'});
      txt(money(d.sales),left+cols[2]+6,y+6,cols[3]-cols[2]-8,{size:8,align:'right'});
      txt(money(d.received),left+cols[3]+6,y+6,cols[4]-cols[3]-8,{size:8,align:'right'});
      txt(money(d.expenses),left+cols[4]+6,y+6,cols[5]-cols[4]-8,{size:8,align:'right'});
      txt(money(d.netCash),left+cols[5]+6,y+6,cols[6]-cols[5]-8,{size:8,bold:true,align:'right'});
      doc.strokeColor(line).moveTo(left,y+20).lineTo(right,y+20).stroke(); y += 20;
    });
    y += 16;
    txt('Piutang Terbesar', left, y, width, {size:13,bold:true,color:green}); y += 20;
    const pCols = [0,94,274,398,488];
    doc.roundedRect(left,y,width,22,6).fill(green);
    ['Nota','Customer','Kendaraan','Sisa'].forEach((h,i)=>txt(h,left+pCols[i]+6,y+7,pCols[i+1]-pCols[i]-8,{size:8,bold:true,color:'#fff',align:i===3?'right':'left'}));
    y += 22;
    const outRows = r.outstanding.slice(0,8);
    if (!outRows.length) { txt('Tidak ada piutang.', left+8, y+6, width-16, {size:8,color:muted}); y += 20; }
    outRows.forEach((x,idx)=>{
      if (y > 744) { doc.addPage(); y = 36; }
      if(idx%2===0) doc.rect(left,y,width,20).fill('#fbfcfb');
      txt(x.invoice_no,left+pCols[0]+6,y+6,pCols[1]-pCols[0]-8,{size:8});
      txt(x.customer_name,left+pCols[1]+6,y+6,pCols[2]-pCols[1]-8,{size:8});
      txt(x.vehicle_plate,left+pCols[2]+6,y+6,pCols[3]-pCols[2]-8,{size:8});
      txt(money(x.balance),left+pCols[3]+6,y+6,pCols[4]-pCols[3]-8,{size:8,bold:true,align:'right'});
      doc.strokeColor(line).moveTo(left,y+20).lineTo(right,y+20).stroke(); y+=20;
    });
    doc.fontSize(8).fillColor(muted).text(`Dicetak ${now_()}`, left, 784, { width, align:'right', lineBreak:false });
    doc.end();
  });
  return { url:`/pdfs/${filename}`, filename };
}
function listWorkOrderPhotos_(p){ const id=text_(p.id||p.work_order_id); return rows_('work_order_photos',{work_order_id:id},'created_at DESC'); }
function uploadWorkOrderPhoto_(file, body={}){ const work_order_id=text_(body.work_order_id||body.id); if(!file) throw new Error('Foto wajib diupload.'); if(!find_('work_orders',work_order_id)) throw new Error('WO tidak ditemukan.'); const ext=(file.originalname?.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg'; const filename=`wo_${work_order_id}_${Date.now()}.${ext}`; const dest=join(UPLOAD_DIR,filename); copyFileSync(file.path,dest); rmSync(file.path); return append_('work_order_photos',{id:id_('WOP'),work_order_id,filename,url:`/uploads/${filename}`,caption:text_(body.caption),created_at:now_(),created_by:user_()}); }

async function exportTemplate_() {
  const wb = new ExcelJS.Workbook();
  for (const t of DATA_TABLES) {
    const ws = wb.addWorksheet(t);
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
    ws.columns = cols.map(c => ({ header:c, key:c, width:18 }));
  }
  const filename = `template_${Date.now()}.xlsx`;
  const file = join(EXPORT_DIR, filename);
  await wb.xlsx.writeFile(file);
  return { url:`/exports/${filename}`, filename };
}

async function importExcel_(file) {
  if (!file) throw new Error('File Excel wajib diupload.');
  const allowed = new Set(['customers', 'vehicles', 'items', 'employees', 'expenses']);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file.path);
  const imported = {}, errors = [];
  const tx = db.transaction(() => {
    wb.worksheets.forEach(ws => {
      const table = ws.name;
      if (!allowed.has(table)) return;
      const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
      const colSet = new Set(cols);
      const headers = [];
      ws.getRow(1).eachCell((cell, col) => headers[col] = text_(cell.value));
      let count = 0;
      for (let r = 2; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const obj = {};
        headers.forEach((h, col) => { if (h && colSet.has(h)) obj[h] = row.getCell(col).value ?? ''; });
        if (!Object.values(obj).some(v => text_(v) !== '')) continue;
        delete obj.created_at; delete obj.updated_at;
        try {
          if (table === 'customers') { if (!text_(obj.name)) throw new Error('name wajib'); saveCustomer_(obj); }
          else if (table === 'vehicles') { if (!text_(obj.customer_id) || !text_(obj.plate)) throw new Error('customer_id dan plate wajib'); saveVehicle_(obj); }
          else if (table === 'items') { if (!text_(obj.name)) throw new Error('name wajib'); saveItem_(obj); }
          else if (table === 'employees') { if (!text_(obj.name)) throw new Error('name wajib'); saveEmployee_(obj); }
          else if (table === 'expenses') { if (!text_(obj.date) || !text_(obj.category) || !num_(obj.amount)) throw new Error('date, category, amount wajib'); saveExpense_(obj); }
          count++;
        } catch (e) { errors.push(`${table} baris ${r}: ${e.message}`); }
      }
      imported[table] = count;
    });
  });
  tx();
  if (!Object.keys(imported).length) errors.push('Tidak ada worksheet import yang didukung. Pakai template resmi.');
  return { imported, errors };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sidomulyo Motor running on http://localhost:${PORT}`));
