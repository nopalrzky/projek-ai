import { Router } from "express";
import { getDb } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Public: list sports
router.get("/", (req, res) => {
  const db = getDb();
  const sports = db.prepare("SELECT * FROM sports ORDER BY name").all();
  res.json(sports);
});

// Owner: my fields (all sports) — MUST be before /:sportId/fields
router.get("/my/fields", authMiddleware(["owner", "admin"]), (req, res) => {
  const db = getDb();
  const ownerId = req.user.role === "admin" ? req.user.managed_by : req.user.id;
  const fields = db
    .prepare(
      `SELECT f.*, s.name as sport_name, s.icon as sport_icon
       FROM fields f JOIN sports s ON f.sport_id = s.id
       WHERE f.owner_id = ? AND f.is_active = 1
       ORDER BY s.name, f.name`
    )
    .all(ownerId);
  res.json(fields);
});

// Public: fields by sport
router.get("/:sportId/fields", (req, res) => {
  const db = getDb();
  const { owner_id } = req.query;
  let sql = `SELECT f.*, s.name as sport_name, u.name as owner_name
             FROM fields f
             JOIN sports s ON f.sport_id = s.id
             JOIN users u ON f.owner_id = u.id
             WHERE f.sport_id = ? AND f.is_active = 1`;
  const params = [req.params.sportId];
  if (owner_id) { sql += " AND f.owner_id = ?"; params.push(owner_id); }
  sql += " ORDER BY f.name";
  const fields = db.prepare(sql).all(...params);
  res.json(fields);
});

// Admin: manage sports
router.post("/", authMiddleware(["admin", "owner"]), (req, res) => {
  const { name, description, icon } = req.body;
  if (!name) return res.status(400).json({ error: "Nama olahraga wajib diisi" });

  const db = getDb();
  try {
    const info = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run(name, description || "", icon || "🏟️");
    const sport = db.prepare("SELECT * FROM sports WHERE id = ?").get(info.lastInsertRowid);
    res.json(sport);
  } catch {
    res.status(400).json({ error: "Olahraga sudah ada" });
  }
});

// Admin: manage fields (auto-set owner_id from auth)
router.post("/:sportId/fields", authMiddleware(["owner", "admin"]), (req, res) => {
  const { name, description, price_per_hour } = req.body;
  if (!name || !price_per_hour)
    return res.status(400).json({ error: "Nama dan harga wajib diisi" });

  const ownerId = req.user.role === "admin" ? req.user.managed_by : req.user.id;
  const db = getDb();
  const info = db
    .prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)")
    .run(req.params.sportId, name, description || "", price_per_hour, ownerId);
  const field = db.prepare("SELECT * FROM fields WHERE id = ?").get(info.lastInsertRowid);
  res.json(field);
});

router.put("/fields/:id", authMiddleware(["owner", "admin"]), (req, res) => {
  const { name, description, price_per_hour, is_active } = req.body;
  const db = getDb();
  const field = db.prepare("SELECT * FROM fields WHERE id = ?").get(req.params.id);
  if (!field) return res.status(404).json({ error: "Lapangan tidak ditemukan" });

  const ownerId = req.user.role === "admin" ? req.user.managed_by : req.user.id;
  if (field.owner_id !== ownerId) return res.status(403).json({ error: "Bukan lapangan kamu" });

  db.prepare("UPDATE fields SET name=?, description=?, price_per_hour=?, is_active=? WHERE id=?")
    .run(name, description, price_per_hour, is_active ?? 1, req.params.id);
  res.json({ ok: true });
});

// Owner: delete field
router.delete("/fields/:id", authMiddleware(["owner", "admin"]), (req, res) => {
  const db = getDb();
  const field = db.prepare("SELECT * FROM fields WHERE id = ?").get(req.params.id);
  if (!field) return res.status(404).json({ error: "Lapangan tidak ditemukan" });

  const ownerId = req.user.role === "admin" ? req.user.managed_by : req.user.id;
  if (field.owner_id !== ownerId) return res.status(403).json({ error: "Bukan lapangan kamu" });

  db.prepare("UPDATE fields SET is_active = 0 WHERE id = ?").run(req.params.id);
  res.json({ ok: true, message: "Lapangan dinonaktifkan" });
});

router.delete("/:id", authMiddleware(["admin", "owner"]), (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM sports WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

export default router;
