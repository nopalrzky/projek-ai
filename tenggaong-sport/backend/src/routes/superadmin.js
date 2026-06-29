import { Router } from "express";
import { getDb } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All users + owner-admin mapping
router.get("/users", authMiddleware(["superadmin"]), (req, res) => {
  const db = getDb();
  const users = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at, u.managed_by,
              m.name as managed_by_name
       FROM users u
       LEFT JOIN users m ON u.managed_by = m.id
       ORDER BY u.role, u.name`
    )
    .all();

  // Build owner → admins map
  const ownerAdmins = {};
  for (const u of users) {
    if (u.role === "admin" && u.managed_by) {
      const ownerId = u.managed_by;
      if (!ownerAdmins[ownerId]) ownerAdmins[ownerId] = [];
      ownerAdmins[ownerId].push({ id: u.id, name: u.name, email: u.email });
    }
  }

  // Attach admins list to each owner
  for (const u of users) {
    if (u.role === "owner") {
      u.admins = ownerAdmins[u.id] || [];
    }
  }

  res.json(users);
});

// Owners with their admins (compact version)
router.get("/owner-admins", authMiddleware(["superadmin"]), (req, res) => {
  const db = getDb();
  const owners = db.prepare("SELECT id, name, email, created_at FROM users WHERE role = 'owner' ORDER BY name").all();
  for (const o of owners) {
    o.admins = db.prepare("SELECT id, name, email FROM users WHERE role = 'admin' AND managed_by = ?").all(o.id);
    o.total_fields = db.prepare("SELECT COUNT(*) as c FROM fields WHERE owner_id = ?").get(o.id).c;
    o.total_bookings = db.prepare("SELECT COUNT(*) as c FROM bookings b JOIN fields f ON b.field_id = f.id WHERE f.owner_id = ?").get(o.id).c;
    o.revenue = db.prepare("SELECT COALESCE(SUM(p.amount),0) as c FROM payments p JOIN bookings b ON p.booking_id = b.id JOIN fields f ON b.field_id = f.id WHERE b.status='confirmed' AND f.owner_id = ?").get(o.id).c;
  }
  res.json(owners);
});

// Full stats (all owners combined)
router.get("/stats", authMiddleware(["superadmin"]), (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const stats = {
    total_owners: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'owner'").get().c,
    total_admins: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get().c,
    total_customers: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get().c,
    total_bookings: db.prepare("SELECT COUNT(*) as c FROM bookings").get().c,
    paid_bookings: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'paid'").get().c,
    confirmed_bookings: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'confirmed'").get().c,
    today_bookings: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE booking_date = ?").get(today).c,
    total_revenue: db.prepare("SELECT COALESCE(SUM(amount),0) as c FROM payments p JOIN bookings b ON p.booking_id = b.id WHERE b.status = 'confirmed'").get().c,
  };
  res.json(stats);
});

// Full revenue (all owners)
router.get("/revenue", authMiddleware(["superadmin"]), (req, res) => {
  const db = getDb();
  const { period = "daily" } = req.query;

  let groupBy;
  if (period === "weekly") groupBy = "strftime('%Y-%W', paid_at)";
  else if (period === "monthly") groupBy = "strftime('%Y-%m', paid_at)";
  else groupBy = "date(paid_at)";

  const revenue = db
    .prepare(
      `SELECT ${groupBy} as period, COUNT(*) as total_bookings, SUM(amount) as total_revenue
       FROM payments p JOIN bookings b ON p.booking_id = b.id
       WHERE b.status = 'confirmed'
       GROUP BY period ORDER BY period DESC LIMIT 30`
    )
    .all();

  const total = db
    .prepare(
      `SELECT COUNT(*) as total_bookings, COALESCE(SUM(amount),0) as total_revenue
       FROM payments p JOIN bookings b ON p.booking_id = b.id
       WHERE b.status = 'confirmed'`
    )
    .get();

  const bySport = db
    .prepare(
      `SELECT s.name, s.icon, COUNT(*) as bookings, COALESCE(SUM(p.amount),0) as revenue
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN fields f ON b.field_id = f.id
       JOIN sports s ON f.sport_id = s.id
       WHERE b.status = 'confirmed'
       GROUP BY s.id ORDER BY revenue DESC`
    )
    .all();

  const byOwner = db
    .prepare(
      `SELECT u.name as owner_name, COUNT(DISTINCT b.id) as total_bookings, COALESCE(SUM(p.amount),0) as total_revenue
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN fields f ON b.field_id = f.id
       JOIN users u ON f.owner_id = u.id
       WHERE b.status = 'confirmed'
       GROUP BY f.owner_id ORDER BY total_revenue DESC`
    )
    .all();

  const topFields = db
    .prepare(
      `SELECT f.name as field_name, s.name as sport_name, s.icon as sport_icon, u.name as owner_name,
              COUNT(b.id) as bookings, COALESCE(SUM(p.amount),0) as revenue
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN fields f ON b.field_id = f.id
       JOIN sports s ON f.sport_id = s.id
       JOIN users u ON f.owner_id = u.id
       WHERE b.status = 'confirmed'
       GROUP BY f.id ORDER BY revenue DESC LIMIT 10`
    )
    .all();

  res.json({ revenue, total, bySport, byOwner, topFields });
});

// All bookings (unscoped)
router.get("/bookings", authMiddleware(["superadmin"]), (req, res) => {
  const db = getDb();
  const { status, date } = req.query;
  let sql = `SELECT b.*,
             COALESCE(b.customer_name, u.name) as customer_name, COALESCE(b.customer_phone, u.phone) as customer_phone, u.email as customer_email,
             f.name as field_name, s.name as sport_name, s.icon as sport_icon,
             ow.name as owner_name,
             v.name as verified_by_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN fields f ON b.field_id = f.id
             JOIN sports s ON f.sport_id = s.id
             JOIN users ow ON f.owner_id = ow.id
             LEFT JOIN users v ON b.verified_by = v.id`;
  const params = [];
  const where = [];
  if (status) { where.push("b.status = ?"); params.push(status); }
  if (date) { where.push("b.booking_date = ?"); params.push(date); }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY b.created_at DESC LIMIT 100";

  res.json(db.prepare(sql).all(...params));
});

export default router;
