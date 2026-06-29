import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db.js";
import { generateToken, authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/register", (req, res) => {
  const { name, email, password, role = "customer", phone, owner_email } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Nama, email, password wajib diisi" });

  const db = getDb();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return res.status(400).json({ error: "Email sudah terdaftar" });

  let managed_by = null;
  if (role === "admin") {
    if (!owner_email) return res.status(400).json({ error: "Admin harus memilih owner (owner_email)" });
    const owner = db.prepare("SELECT id FROM users WHERE email = ? AND role = 'owner'").get(owner_email);
    if (!owner) return res.status(400).json({ error: "Owner dengan email tersebut tidak ditemukan" });
    managed_by = owner.id;
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password, role, phone, managed_by) VALUES (?,?,?,?,?,?)")
    .run(name, email, hash, role, phone || null, managed_by);

  const user = db.prepare("SELECT id, name, email, role, phone, managed_by FROM users WHERE id = ?").get(info.lastInsertRowid);
  const token = generateToken(user);
  res.json({ token, user });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email dan password wajib diisi" });

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Email atau password salah" });

  const token = generateToken(user);
  const { password: _, ...userData } = user;
  res.json({ token, user: userData });
});

// Get list of owners (for admin registration)
router.get("/owners", (req, res) => {
  const db = getDb();
  const owners = db.prepare("SELECT id, name, email FROM users WHERE role = 'owner'").all();
  res.json(owners);
});

router.get("/me", authMiddleware(), (req, res) => {
  const db = getDb();
  const user = db.prepare("SELECT id, name, email, role, phone, managed_by FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

export default router;
