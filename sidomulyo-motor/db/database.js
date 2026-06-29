import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_PATH = join(DATA_DIR, 'bengkel.db');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Init schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// Add migration for old date formats
migrateOldDates();

export default db;

// ── Utility Functions ──────────────────────────────────────────────────

export function id_(prefix = 'ID') {
  return `${prefix}-${uuidv4().split('-')[0].toUpperCase()}`;
}

export function today_() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

export function currentTimestamp() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T');
}

export function now_() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T');
}

export function num_(v) {
  const n = Number(String(v == null ? 0 : v).replace(/[^0-9.\-]/g, ''));
  return isFinite(n) ? n : 0;
}

export function text_(v) {
  return String(v == null ? '' : v).trim();
}

export function user_() {
  return 'admin';
}

const normalizeCache = new Map();
export function normalize_(v) {
  const s = text_(v).toUpperCase().replace(/\s+/g, ' ');
  return s;
}

// ── CRUD ───────────────────────────────────────────────────────────────

export function rows_(table, where = {}, orderBy = '') {
  const keys = Object.keys(where);
  let sql = `SELECT * FROM ${table}`;
  const params = [];
  if (keys.length) {
    sql += ' WHERE ' + keys.map((k, i) => {
      params.push(where[k]);
      return `${k} = ?`;
    }).join(' AND ');
  }
  if (orderBy) sql += ' ORDER BY ' + orderBy;
  return db.prepare(sql).all(...params);
}

export function find_(table, id) {
  return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) || null;
}

export function append_(table, obj) {
  const keys = Object.keys(obj);
  const vals = keys.map(k => obj[k]);
  const q = keys.map(() => '?').join(',');
  db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${q})`).run(...vals);
  return obj;
}

export function update_(table, id, patch) {
  const existing = find_(table, id);
  if (!existing) throw new Error(`${table} tidak ditemukan: ${id}`);
  const next = { ...existing, ...patch };
  const keys = Object.keys(patch);
  const vals = keys.map(k => next[k]);
  db.prepare(`UPDATE ${table} SET ${keys.map(k => `${k} = ?`).join(',')} WHERE id = ?`).run(...vals, id);
  return next;
}

export function save_(table, obj, prefix) {
  const now = now_();
  if (obj.id && find_(table, obj.id)) {
    return update_(table, obj.id, { ...obj, updated_at: now });
  }
  obj.id = obj.id || id_(prefix || table.slice(0, 3).toUpperCase());
  obj.created_at = obj.created_at || now;
  obj.updated_at = now;
  return append_(table, obj);
}

export function deleteById_(table, id) {
  const row = find_(table, id);
  if (!row) throw new Error(`${table} tidak ditemukan: ${id}`);
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  return true;
}

export function searchRows_(table, p, fields) {
  let d = rows_(table);
  const q = normalize_(p.q || '');
  if (q) d = d.filter(r => fields.some(f => normalize_(r[f]).includes(q)));
  if (p.limit) d = d.slice(0, num_(p.limit));
  return d;
}

export function audit_(action, entity, entityId, detail = {}) {
  append_('audit_log', {
    id: id_('LOG'),
    timestamp: now_(),
    user: user_(),
    action,
    entity,
    entity_id: entityId,
    detail: JSON.stringify(detail)
  });
}

export function required_(o, keys) {
  keys.forEach(k => {
    if (o[k] === undefined || o[k] === null || text_(o[k]) === '') {
      throw new Error(`${k} wajib diisi.`);
    }
  });
}

export function nextNo_(type) {
  const d = new Date();
  const y = d.getFullYear().toString();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const prefix = 'SM';
  const needle = `${prefix}/${y}/${m}/`;
  const table = type === 'INV' ? 'invoices' : 'work_orders';
  const field = type === 'INV' ? 'invoice_no' : 'wo_no';

  const maxNo = db.prepare(`
    SELECT MAX(CAST(SUBSTR(${field}, LENGTH(?) + 1) AS INTEGER)) as max_num
    FROM ${table}
    WHERE ${field} LIKE ? || '%'
  `).get(needle, needle);

  let currentMax = maxNo?.max_num || 0;
  return needle + String(currentMax + 1).padStart(4, '0');
}

export function rupiah_(v) {
  return 'Rp' + Math.round(num_(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function settings_() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const o = {};
  rows.forEach(r => o[r.key] = r.value);
  return o;
}

export function replaceChildren_(table, key, id, data) {
  db.prepare(`DELETE FROM ${table} WHERE ${key} = ?`).run(id);
  data.forEach(x => append_(table, x));
}

export function ensureSheetSchema_() {
  // No-op for SQLite — schema is fixed at creation
}

export function updateInvoiceStatus_(id, newStatus) {
  const inv = find_('invoices', id);
  if (!inv) throw new Error('Nota tidak ditemukan.');

  if (inv.payment_status === 'LUNAS' && newStatus !== 'VOID') {
    throw new Error('Status nota yang sudah LUNAS tidak dapat diubah.');
  }

  const valid = ['BELUM LUNAS', 'NYICIL', 'LUNAS', 'VOID'];
  if (!valid.includes(newStatus)) throw new Error('Status pembayaran tidak valid.');
  const next = { ...inv };
  if (newStatus === 'LUNAS') {
    next.paid = next.total;
    next.balance = 0;
  } else if (newStatus === 'BELUM LUNAS') {
    next.paid = 0;
    next.balance = next.total;
  }
  next.payment_status = newStatus;
  next.updated_at = now_();
  const keys = Object.keys(next).filter(k => k !== 'id');
  const vals = keys.map(k => next[k]);
  db.prepare(`UPDATE invoices SET ${keys.map(k => `${k} = ?`).join(',')} WHERE id = ?`).run(...vals, id);
  return next;
}

function migrateOldDates() {
  // Migrate work_orders dates
  const workOrders = db.prepare("SELECT id, date FROM work_orders WHERE LENGTH(date) = 10").all();
  workOrders.forEach(wo => {
    db.prepare("UPDATE work_orders SET date = ? WHERE id = ?").run(`${wo.date}T07:00:00`, wo.id);
  });
  if (workOrders.length > 0) console.log(`✅ Migrated ${workOrders.length} old work_order dates.`);

  // Migrate invoices dates
  const invoices = db.prepare("SELECT id, date FROM invoices WHERE LENGTH(date) = 10").all();
  invoices.forEach(inv => {
    db.prepare("UPDATE invoices SET date = ? WHERE id = ?").run(`${inv.date}T07:00:00`, inv.id);
  });
  if (invoices.length > 0) console.log(`✅ Migrated ${invoices.length} old invoice dates.`);
}