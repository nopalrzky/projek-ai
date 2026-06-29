import { Router } from "express";
import { getDb } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digit
}

// Admin: manual booking (for walk-in customers)
router.post("/manual", authMiddleware(["admin"]), (req, res) => {
  const { field_id, booking_date, start_time, end_time, total_price, customer_name, customer_phone, payment_method } = req.body;
  if (!field_id || !booking_date || !start_time || !end_time || !total_price || !customer_name)
    return res.status(400).json({ error: "Semua field wajib diisi (field_id, tanggal, jam, harga, nama customer)" });

  const db = getDb();

  // Check field belongs to this cashier's owner
  const field = db.prepare("SELECT * FROM fields WHERE id = ? AND owner_id = ?").get(field_id, req.user.managed_by);
  if (!field) return res.status(403).json({ error: "Lapangan bukan milik owner kamu" });

  // Check slot available
  const conflict = db
    .prepare(
      `SELECT id FROM bookings
       WHERE field_id = ? AND booking_date = ? AND status IN ('pending','paid','confirmed')
       AND start_time < ? AND end_time > ?`
    )
    .get(field_id, booking_date, end_time, start_time);
  if (conflict) return res.status(400).json({ error: "Slot sudah dibooking" });

  // Generate PIN unik
  let pin;
  do { pin = generatePin(); } while (db.prepare("SELECT id FROM bookings WHERE pin = ?").get(pin));

  const info = db
    .prepare(
      `INSERT INTO bookings (user_id, field_id, booking_date, start_time, end_time, total_price, pin, payment_method, status, customer_name, customer_phone)
       VALUES (?,?,?,?,?,?,?,?,'paid',?,?)`
    )
    .run(req.user.id, field_id, booking_date, start_time, end_time, total_price, pin, payment_method || "cash", customer_name, customer_phone || null);

  // Auto payment record
  db.prepare("INSERT INTO payments (booking_id, amount, method) VALUES (?,?,?)")
    .run(info.lastInsertRowid, total_price, payment_method || "cash");

  const booking = db
    .prepare(
      `SELECT b.*, f.name as field_name, f.price_per_hour, s.name as sport_name, s.icon as sport_icon
       FROM bookings b
       JOIN fields f ON b.field_id = f.id
       JOIN sports s ON f.sport_id = s.id
       WHERE b.id = ?`
    )
    .get(info.lastInsertRowid);

  res.json(booking);
});

// Customer: create booking + bayar → dapet PIN
router.post("/", authMiddleware(["customer", "admin"]), (req, res) => {
  const { field_id, booking_date, start_time, end_time, notes, total_price, payment_method } = req.body;
  if (!field_id || !booking_date || !start_time || !end_time || !total_price)
    return res.status(400).json({ error: "Semua field wajib diisi" });

  const db = getDb();

  // Check slot available
  const conflict = db
    .prepare(
      `SELECT id FROM bookings
       WHERE field_id = ? AND booking_date = ? AND status IN ('pending','paid','confirmed')
       AND start_time < ? AND end_time > ?`
    )
    .get(field_id, booking_date, end_time, start_time);

  if (conflict) return res.status(400).json({ error: "Slot sudah dibooking" });

  // Generate PIN unik (cek duplikat)
  let pin;
  do {
    pin = generatePin();
  } while (db.prepare("SELECT id FROM bookings WHERE pin = ?").get(pin));

  const info = db
    .prepare(
      "INSERT INTO bookings (user_id, field_id, booking_date, start_time, end_time, total_price, notes, pin, payment_method, status) VALUES (?,?,?,?,?,?,?,?,?,'paid')"
    )
    .run(req.user.id, field_id, booking_date, start_time, end_time, total_price, notes || null, pin, payment_method || "transfer");

  // Auto-create payment record
  db.prepare("INSERT INTO payments (booking_id, amount, method) VALUES (?,?,?)")
    .run(info.lastInsertRowid, total_price, payment_method || "transfer");

  const booking = db
    .prepare(
      `SELECT b.*, f.name as field_name, f.price_per_hour, s.name as sport_name, s.icon as sport_icon
       FROM bookings b
       JOIN fields f ON b.field_id = f.id
       JOIN sports s ON f.sport_id = s.id
       WHERE b.id = ?`
    )
    .get(info.lastInsertRowid);

  res.json(booking);
});

// Customer: my bookings
router.get("/my", authMiddleware(["customer"]), (req, res) => {
  const db = getDb();
  const bookings = db
    .prepare(
      `SELECT b.*, f.name as field_name, f.price_per_hour, s.name as sport_name, s.icon as sport_icon
       FROM bookings b
       JOIN fields f ON b.field_id = f.id
       JOIN sports s ON f.sport_id = s.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC, b.start_time DESC`
    )
    .all(req.user.id);
  res.json(bookings);
});

// Admin/owner: all bookings (scoped by owner)
router.get("/all", authMiddleware(["admin", "owner"]), (req, res) => {
  const db = getDb();
  const { status, date } = req.query;
  const ownerId = req.user.role === "admin" ? req.user.managed_by : req.user.id;

  let sql = `SELECT b.*, COALESCE(b.customer_name, u.name) as customer_name, COALESCE(b.customer_phone, u.phone) as customer_phone,
             f.name as field_name, s.name as sport_name, s.icon as sport_icon,
             v.name as verified_by_name, f.owner_id,
             ow.name as owner_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN fields f ON b.field_id = f.id
             JOIN sports s ON f.sport_id = s.id
             LEFT JOIN users v ON b.verified_by = v.id
             LEFT JOIN users ow ON f.owner_id = ow.id`;
  const params = [];
  const where = ["f.owner_id = ?"];
  params.push(ownerId);
  if (status) { where.push("b.status = ?"); params.push(status); }
  if (date) { where.push("b.booking_date = ?"); params.push(date); }
  sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY b.created_at DESC";

  res.json(db.prepare(sql).all(...params));
});

// Admin: get booking by PIN (for cashier verification)
router.get("/pin/:pin", authMiddleware(["admin"]), (req, res) => {
  const db = getDb();
  const booking = db
    .prepare(
      `SELECT b.*, COALESCE(b.customer_name, u.name) as customer_name, COALESCE(b.customer_phone, u.phone) as customer_phone,
              f.name as field_name, f.price_per_hour, s.name as sport_name, s.icon as sport_icon
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN fields f ON b.field_id = f.id
       JOIN sports s ON f.sport_id = s.id
       WHERE b.pin = ?`
    )
    .get(req.params.pin);

  if (!booking) return res.status(404).json({ error: "PIN tidak ditemukan" });
  if (booking.status !== "paid")
    return res.status(400).json({ error: `Booking sudah ${booking.status}` });

  res.json(booking);
});

// Admin: verify by PIN — kasir input PIN, cocok → confirmed
router.post("/verify-pin", authMiddleware(["admin"]), (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: "PIN wajib diisi" });

  const db = getDb();
  const booking = db.prepare(
    `SELECT b.*, f.owner_id FROM bookings b JOIN fields f ON b.field_id = f.id WHERE b.pin = ?`
  ).get(pin);
  if (!booking) return res.status(404).json({ error: "PIN tidak ditemukan" });
  if (booking.status !== "paid")
    return res.status(400).json({ error: `Booking sudah ${booking.status}` });

  // Check ownership: admin hanya bisa verifikasi booking lapangan bosnya
  if (booking.owner_id !== req.user.managed_by)
    return res.status(403).json({ error: "Ini bukan booking untuk lapangan kamu" });

  db.prepare(
    "UPDATE bookings SET status = 'confirmed', verified_by = ?, verified_at = datetime('now','localtime') WHERE id = ?"
  ).run(req.user.id, booking.id);

  res.json({ ok: true, status: "confirmed", booking_id: booking.id });
});

// Admin: get single booking
router.get("/:id", authMiddleware(), (req, res) => {
  const db = getDb();
  const booking = db
    .prepare(
      `SELECT b.*, COALESCE(b.customer_name, u.name) as customer_name, COALESCE(b.customer_phone, u.phone) as customer_phone,
              f.name as field_name, f.price_per_hour, s.name as sport_name, s.icon as sport_icon,
              v.name as verified_by_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN fields f ON b.field_id = f.id
       JOIN sports s ON f.sport_id = s.id
       LEFT JOIN users v ON b.verified_by = v.id
       WHERE b.id = ?`
    )
    .get(req.params.id);

  if (!booking) return res.status(404).json({ error: "Booking tidak ditemukan" });
  if (req.user.role === "customer" && booking.user_id !== req.user.id)
    return res.status(403).json({ error: "Akses ditolak" });

  res.json(booking);
});

// Keep old verify endpoint for backward compat
router.put("/:id/verify", authMiddleware(["admin"]), (req, res) => {
  const { action } = req.body;
  if (!["confirmed", "cancelled"].includes(action))
    return res.status(400).json({ error: "Action harus 'confirmed' atau 'cancelled'" });

  const db = getDb();
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking tidak ditemukan" });

  db.prepare(
    "UPDATE bookings SET status = ?, verified_by = ?, verified_at = datetime('now','localtime') WHERE id = ?"
  ).run(action, req.user.id, req.params.id);

  if (action === "confirmed") {
    const pay = db.prepare("SELECT id FROM payments WHERE booking_id = ?").get(req.params.id);
    if (!pay) {
      db.prepare("INSERT INTO payments (booking_id, amount, method) VALUES (?,?,?)")
        .run(req.params.id, booking.total_price, "cash");
    }
  }

  res.json({ ok: true, status: action });
});

export default router;
