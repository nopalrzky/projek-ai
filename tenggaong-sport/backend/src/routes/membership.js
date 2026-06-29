import { Router } from "express";
import { getDb } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

function ownerScope(req) {
  return req.user.role === "admin" ? req.user.managed_by : req.user.id;
}

// ─── PUBLIC: Active tiers for a venue ───
router.get("/tiers", (req, res) => {
  const db = getDb();
  const { owner_id } = req.query;
  let sql = "SELECT * FROM membership_tiers WHERE is_active = 1";
  const params = [];
  if (owner_id) { sql += " AND owner_id = ?"; params.push(owner_id); }
  sql += " ORDER BY price";
  res.json(db.prepare(sql).all(...params));
});

// ─── OWNER: Manage tiers ───
router.post("/tiers", authMiddleware(["owner"]), (req, res) => {
  const { name, description, price, duration_days, max_bookings, discount_percent, color } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Nama dan harga wajib diisi" });

  const db = getDb();
  const info = db.prepare(
    "INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)"
  ).run(name, description || "", price, duration_days || 30, max_bookings || 0, discount_percent || 0, color || "#6C5CE7", req.user.id);

  res.json(db.prepare("SELECT * FROM membership_tiers WHERE id = ?").get(info.lastInsertRowid));
});

router.put("/tiers/:id", authMiddleware(["owner"]), (req, res) => {
  const db = getDb();
  const tier = db.prepare("SELECT * FROM membership_tiers WHERE id = ? AND owner_id = ?").get(req.params.id, req.user.id);
  if (!tier) return res.status(404).json({ error: "Tier tidak ditemukan" });

  const { name, description, price, duration_days, max_bookings, discount_percent, color, is_active } = req.body;
  db.prepare(
    "UPDATE membership_tiers SET name=?, description=?, price=?, duration_days=?, max_bookings=?, discount_percent=?, color=?, is_active=? WHERE id=?"
  ).run(name, description, price, duration_days, max_bookings, discount_percent, color, is_active ?? 1, req.params.id);

  res.json({ ok: true });
});

router.delete("/tiers/:id", authMiddleware(["owner"]), (req, res) => {
  const db = getDb();
  const tier = db.prepare("SELECT * FROM membership_tiers WHERE id = ? AND owner_id = ?").get(req.params.id, req.user.id);
  if (!tier) return res.status(404).json({ error: "Tier tidak ditemukan" });
  db.prepare("UPDATE membership_tiers SET is_active = 0 WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ─── OWNER: My tiers ───
router.get("/my-tiers", authMiddleware(["owner", "admin"]), (req, res) => {
  const db = getDb();
  const ownerId = ownerScope(req);
  const tiers = db.prepare(
    "SELECT mt.*, (SELECT COUNT(*) FROM memberships WHERE tier_id = mt.id AND status = 'active') as active_members FROM membership_tiers mt WHERE mt.owner_id = ? ORDER BY mt.price"
  ).all(ownerId);
  res.json(tiers);
});

// ─── CUSTOMER: Subscribe ───
router.post("/subscribe", authMiddleware(["customer"]), (req, res) => {
  const { tier_id } = req.body;
  if (!tier_id) return res.status(400).json({ error: "Pilih paket membership" });

  const db = getDb();
  const tier = db.prepare("SELECT * FROM membership_tiers WHERE id = ? AND is_active = 1").get(tier_id);
  if (!tier) return res.status(404).json({ error: "Paket tidak ditemukan" });

  // Check if already have active membership at this owner
  const existing = db.prepare(
    "SELECT m.* FROM memberships m JOIN membership_tiers t ON m.tier_id = t.id WHERE m.user_id = ? AND t.owner_id = ? AND m.status = 'active'"
  ).get(req.user.id, tier.owner_id);
  if (existing) return res.status(400).json({ error: "Kamu sudah punya membership aktif di venue ini" });

  const startDate = new Date().toISOString().slice(0, 10);
  const end = new Date();
  end.setDate(end.getDate() + tier.duration_days);
  const endDate = end.toISOString().slice(0, 10);

  const info = db.prepare(
    "INSERT INTO memberships (user_id, tier_id, start_date, end_date, status, created_by) VALUES (?,?,?,?,'active',?)"
  ).run(req.user.id, tier_id, startDate, endDate, req.user.id);

  // Auto payment record
  db.prepare("INSERT INTO payments (booking_id, amount, method) VALUES (?,?,?)")
    .run(0, tier.price, "membership");

  res.json({
    id: info.lastInsertRowid,
    tier: tier.name,
    start_date: startDate,
    end_date: endDate,
    price: tier.price,
  });
});

// ─── CUSTOMER: My memberships ───
router.get("/my", authMiddleware(["customer"]), (req, res) => {
  const db = getDb();
  const memberships = db.prepare(
    `SELECT m.*, mt.name as tier_name, mt.description, mt.price, mt.duration_days, mt.max_bookings, 
            mt.discount_percent, mt.color, mt.owner_id, u.name as owner_name
     FROM memberships m
     JOIN membership_tiers mt ON m.tier_id = mt.id
     JOIN users u ON mt.owner_id = u.id
     WHERE m.user_id = ?
     ORDER BY m.created_at DESC`
  ).all(req.user.id);
  res.json(memberships);
});

// ─── OWNER: List members ───
router.get("/members", authMiddleware(["owner", "admin"]), (req, res) => {
  const db = getDb();
  const ownerId = ownerScope(req);
  const members = db.prepare(
    `SELECT m.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
            mt.name as tier_name, mt.color, mt.max_bookings, mt.discount_percent
     FROM memberships m
     JOIN membership_tiers mt ON m.tier_id = mt.id
     JOIN users u ON m.user_id = u.id
     WHERE mt.owner_id = ?
     ORDER BY m.created_at DESC`
  ).all(ownerId);
  res.json(members);
});

// ─── Recurring: create ───
router.post("/recurring", authMiddleware(["customer", "admin"]), (req, res) => {
  const { field_id, day_of_week, start_time, end_time, start_date, end_date, total_price } = req.body;
  if (!field_id || day_of_week === undefined || !start_time || !end_time || !start_date)
    return res.status(400).json({ error: "Field wajib: field, hari, jam, mulai" });

  const db = getDb();
  const info = db.prepare(
    "INSERT INTO recurring_bookings (user_id, field_id, day_of_week, start_time, end_time, start_date, end_date, total_price) VALUES (?,?,?,?,?,?,?,?)"
  ).run(req.user.id, field_id, day_of_week, start_time, end_time, start_date, end_date || null, total_price);

  res.json(db.prepare("SELECT * FROM recurring_bookings WHERE id = ?").get(info.lastInsertRowid));
});

// ─── Recurring: my recurring bookings ───
router.get("/recurring", authMiddleware(["customer", "admin", "owner"]), (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const recurring = db.prepare(
    `SELECT r.*, f.name as field_name, s.name as sport_name, s.icon as sport_icon
     FROM recurring_bookings r
     JOIN fields f ON r.field_id = f.id
     JOIN sports s ON f.sport_id = s.id
     WHERE r.user_id = ? AND r.status = 'active'
     ORDER BY r.day_of_week, r.start_time`
  ).all(userId);

  res.json(recurring.map(r => ({ ...r, day_label: DAYS[r.day_of_week] })));
});

export default router;
