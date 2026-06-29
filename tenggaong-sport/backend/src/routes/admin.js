import { Router } from "express";
import { getDb } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

function getOwnerId(req) {
  return req.user.role === "admin" ? req.user.managed_by : req.user.id;
}

// Revenue dashboard (scoped by owner)
router.get("/revenue", authMiddleware(["owner", "admin"]), (req, res) => {
  const db = getDb();
  const { period = "daily" } = req.query;
  const ownerId = getOwnerId(req);

  let groupBy;
  if (period === "weekly") groupBy = "strftime('%Y-%W', paid_at)";
  else if (period === "monthly") groupBy = "strftime('%Y-%m', paid_at)";
  else groupBy = "date(paid_at)";

  const revenue = db
    .prepare(
      `SELECT ${groupBy} as period, COUNT(*) as total_bookings, SUM(amount) as total_revenue
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN fields f ON b.field_id = f.id
       WHERE b.status = 'confirmed' AND f.owner_id = ?
       GROUP BY period ORDER BY period DESC LIMIT 30`
    )
    .all(ownerId);

  const total = db
    .prepare(
      `SELECT COUNT(*) as total_bookings, COALESCE(SUM(amount),0) as total_revenue
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN fields f ON b.field_id = f.id
       WHERE b.status = 'confirmed' AND f.owner_id = ?`
    )
    .get(ownerId);

  const bySport = db
    .prepare(
      `SELECT s.name, s.icon, COUNT(*) as bookings, COALESCE(SUM(p.amount),0) as revenue
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN fields f ON b.field_id = f.id
       JOIN sports s ON f.sport_id = s.id
       WHERE b.status = 'confirmed' AND f.owner_id = ?
       GROUP BY s.id ORDER BY revenue DESC`
    )
    .all(ownerId);

  res.json({ revenue, total, bySport });
});

// Owner: list customers who booked their fields
router.get("/customers", authMiddleware(["owner", "admin"]), (req, res) => {
  const db = getDb();
  const ownerId = getOwnerId(req);
  const customers = db
    .prepare(
      `SELECT DISTINCT u.id, u.name, u.email, u.phone, u.created_at,
              (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as total_bookings,
              (SELECT COUNT(*) FROM bookings WHERE user_id = u.id AND status = 'confirmed') as confirmed_bookings
       FROM users u
       JOIN bookings b ON b.user_id = u.id
       JOIN fields f ON b.field_id = f.id
       WHERE u.role = 'customer' AND f.owner_id = ?
       ORDER BY u.created_at DESC`
    )
    .all(ownerId);
  res.json(customers);
});

// Dashboard stats (scoped by owner)
router.get("/stats", authMiddleware(["owner", "admin"]), (req, res) => {
  const db = getDb();
  const ownerId = getOwnerId(req);
  const today = new Date().toISOString().slice(0, 10);

  const stats = {
    total_customers: db
      .prepare(
        `SELECT COUNT(DISTINCT u.id) as c FROM users u
         JOIN bookings b ON b.user_id = u.id
         JOIN fields f ON b.field_id = f.id
         WHERE u.role = 'customer' AND f.owner_id = ?`
      )
      .get(ownerId).c,
    total_bookings: db
      .prepare("SELECT COUNT(*) as c FROM bookings b JOIN fields f ON b.field_id = f.id WHERE f.owner_id = ?")
      .get(ownerId).c,
    paid_bookings: db
      .prepare("SELECT COUNT(*) as c FROM bookings b JOIN fields f ON b.field_id = f.id WHERE f.owner_id = ? AND b.status = 'paid'")
      .get(ownerId).c,
    pending_bookings: db
      .prepare("SELECT COUNT(*) as c FROM bookings b JOIN fields f ON b.field_id = f.id WHERE f.owner_id = ? AND b.status = 'pending'")
      .get(ownerId).c,
    confirmed_bookings: db
      .prepare("SELECT COUNT(*) as c FROM bookings b JOIN fields f ON b.field_id = f.id WHERE f.owner_id = ? AND b.status = 'confirmed'")
      .get(ownerId).c,
    today_bookings: db
      .prepare("SELECT COUNT(*) as c FROM bookings b JOIN fields f ON b.field_id = f.id WHERE f.owner_id = ? AND b.booking_date = ?")
      .get(ownerId, today).c,
    total_revenue: db
      .prepare("SELECT COALESCE(SUM(p.amount),0) as c FROM payments p JOIN bookings b ON p.booking_id = b.id JOIN fields f ON b.field_id = f.id WHERE b.status = 'confirmed' AND f.owner_id = ?")
      .get(ownerId).c,
  };

  res.json(stats);
});

export default router;
