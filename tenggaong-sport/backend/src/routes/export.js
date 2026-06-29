import { Router } from "express";
import { getDb } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import ExcelJS from "exceljs";

const router = Router();

function ownerScope(req) {
  return req.user.role === "admin" ? req.user.managed_by : req.user.id;
}

// ─── Owner/Admin: Export Bookings ───
router.get("/bookings", authMiddleware(["owner", "admin", "superadmin"]), async (req, res) => {
  const db = getDb();
  const { status, date, start_date, end_date } = req.query;

  let sql = `SELECT b.*, COALESCE(b.customer_name, u.name) as customer_name, COALESCE(b.customer_phone, u.phone) as customer_phone,
             f.name as field_name, s.name as sport_name, s.icon as sport_icon,
             ow.name as owner_name, v.name as verified_by_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN fields f ON b.field_id = f.id
             JOIN sports s ON f.sport_id = s.id
             JOIN users ow ON f.owner_id = ow.id
             LEFT JOIN users v ON b.verified_by = v.id`;
  const params = [];
  const where = [];

  if (req.user.role !== "superadmin") {
    where.push("f.owner_id = ?");
    params.push(ownerScope(req));
  }
  if (status) { where.push("b.status = ?"); params.push(status); }
  if (date) { where.push("b.booking_date = ?"); params.push(date); }
  if (start_date) { where.push("b.booking_date >= ?"); params.push(start_date); }
  if (end_date) { where.push("b.booking_date <= ?"); params.push(end_date); }

  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY b.booking_date DESC, b.start_time";

  const bookings = db.prepare(sql).all(...params);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Bookings");

  ws.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Customer", key: "customer_name", width: 20 },
    { header: "No. HP", key: "customer_phone", width: 15 },
    { header: "Olahraga", key: "sport_name", width: 14 },
    { header: "Lapangan", key: "field_name", width: 18 },
    { header: "Tanggal", key: "booking_date", width: 14 },
    { header: "Jam Mulai", key: "start_time", width: 10 },
    { header: "Jam Selesai", key: "end_time", width: 10 },
    { header: "Harga", key: "total_price", width: 14 },
    { header: "Status", key: "status", width: 14 },
    { header: "Metode Bayar", key: "payment_method", width: 14 },
    { header: "PIN", key: "pin", width: 10 },
    { header: "Owner", key: "owner_name", width: 18 },
    { header: "Verified By", key: "verified_by_name", width: 18 },
  ];

  // Style header
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6C5CE7" } };

  bookings.forEach((b) => {
    ws.addRow({
      id: b.id,
      customer_name: b.customer_name,
      customer_phone: b.customer_phone,
      sport_name: b.sport_name,
      field_name: b.field_name,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      total_price: b.total_price,
      status: b.status,
      payment_method: b.payment_method || "-",
      pin: b.pin || "-",
      owner_name: b.owner_name,
      verified_by_name: b.verified_by_name || "-",
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=bookings_${new Date().toISOString().slice(0, 10)}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

// ─── Owner/Admin: Export Revenue ───
router.get("/revenue", authMiddleware(["owner", "admin", "superadmin"]), async (req, res) => {
  const db = getDb();
  const { period = "daily", start_date, end_date } = req.query;

  let groupBy;
  if (period === "weekly") groupBy = "strftime('%Y-%W', paid_at)";
  else if (period === "monthly") groupBy = "strftime('%Y-%m', paid_at)";
  else groupBy = "date(paid_at)";

  let sql = `SELECT ${groupBy} as period, COUNT(*) as total_bookings, SUM(amount) as total_revenue
             FROM payments p JOIN bookings b ON p.booking_id = b.id
             JOIN fields f ON b.field_id = f.id
             WHERE b.status = 'confirmed'`;
  const params = [];

  if (req.user.role !== "superadmin") {
    sql += " AND f.owner_id = ?";
    params.push(ownerScope(req));
  }
  if (start_date) { sql += " AND b.booking_date >= ?"; params.push(start_date); }
  if (end_date) { sql += " AND b.booking_date <= ?"; params.push(end_date); }

  sql += " GROUP BY period ORDER BY period DESC LIMIT 100";
  const revenue = db.prepare(sql).all(...params);

  // Total
  let totalSql = `SELECT COUNT(*) as total_bookings, COALESCE(SUM(amount),0) as total_revenue
                  FROM payments p JOIN bookings b ON p.booking_id = b.id
                  JOIN fields f ON b.field_id = f.id
                  WHERE b.status = 'confirmed'`;
  const totalParams = [];
  if (req.user.role !== "superadmin") {
    totalSql += " AND f.owner_id = ?";
    totalParams.push(ownerScope(req));
  }
  const total = db.prepare(totalSql).all(...totalParams)[0];

  // Per sport
  let sportSql = `SELECT s.name, s.icon, COUNT(*) as bookings, COALESCE(SUM(p.amount),0) as revenue
                  FROM payments p JOIN bookings b ON p.booking_id = b.id
                  JOIN fields f ON b.field_id = f.id
                  JOIN sports s ON f.sport_id = s.id
                  WHERE b.status = 'confirmed'`;
  const sportParams = [];
  if (req.user.role !== "superadmin") {
    sportSql += " AND f.owner_id = ?";
    sportParams.push(ownerScope(req));
  }
  sportSql += " GROUP BY s.id ORDER BY revenue DESC";
  const bySport = db.prepare(sportSql).all(...sportParams);

  const wb = new ExcelJS.Workbook();

  // Sheet 1: Timeline
  const ws1 = wb.addWorksheet("Revenue Timeline");
  ws1.columns = [
    { header: "Periode", key: "period", width: 16 },
    { header: "Jumlah Booking", key: "total_bookings", width: 18 },
    { header: "Total Revenue", key: "total_revenue", width: 20 },
  ];
  ws1.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws1.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6C5CE7" } };
  revenue.forEach((r) => ws1.addRow(r));

  // Summary row
  const summaryRow = ws1.addRow({ period: "TOTAL", total_bookings: total.total_bookings, total_revenue: total.total_revenue });
  summaryRow.font = { bold: true };

  // Sheet 2: Per Sport
  const ws2 = wb.addWorksheet("Revenue per Olahraga");
  ws2.columns = [
    { header: "Olahraga", key: "name", width: 20 },
    { header: "Booking", key: "bookings", width: 12 },
    { header: "Revenue", key: "revenue", width: 20 },
  ];
  ws2.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws2.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00CEC9" } };
  bySport.forEach((s) => ws2.addRow(s));

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=revenue_${new Date().toISOString().slice(0, 10)}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

// ─── Superadmin: Export All Users ───
router.get("/users", authMiddleware(["superadmin"]), async (req, res) => {
  const db = getDb();
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
           m.name as managed_by_name
    FROM users u LEFT JOIN users m ON u.managed_by = m.id
    ORDER BY u.role, u.name
  `).all();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Users");
  ws.columns = [
    { header: "ID", key: "id", width: 6 },
    { header: "Nama", key: "name", width: 22 },
    { header: "Email", key: "email", width: 32 },
    { header: "Role", key: "role", width: 14 },
    { header: "No. HP", key: "phone", width: 16 },
    { header: "Managed By", key: "managed_by_name", width: 22 },
    { header: "Dibuat", key: "created_at", width: 20 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6C5CE7" } };
  users.forEach((u) => ws.addRow(u));

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=users_${new Date().toISOString().slice(0, 10)}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

export default router;
