import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import 'dotenv/config';
import multer from "multer";
import FormData from "form-data";
import { getDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import sportRoutes from "./routes/sports.js";
import bookingRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";
import superadminRoutes from "./routes/superadmin.js";
import exportRoutes from "./routes/export.js";
import membershipRoutes from "./routes/membership.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const form = new FormData();
    form.append("model", "groq/whisper-large-v3-turbo");
    form.append("file", req.file.buffer, req.file.originalname);

    const r = await fetch(`${process.env.NINEROUTER_URL}/audio/transcriptions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}` },
      body: form,
    });

    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/membership", membershipRoutes);

// Health
app.get("/api/health", (_, res) => res.json({ ok: true }));

function ensureSeed() {
  try {
    const db = getDb();
    const sportCount = db.prepare("SELECT COUNT(*) as c FROM sports").get().c;
    if (sportCount === 0) {
      console.log("🌱 Seeding default data...");
      const hash = bcrypt.hashSync("123456", 10);

      // Users
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Rudi Hartono", "rudi@email.com", hash, "customer");
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Sinta Dewi", "sinta@email.com", hash, "customer");
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Bambang G", "bambang@email.com", hash, "customer");
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Maya Sari", "maya@email.com", hash, "customer");
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Andi Pratama", "andi@email.com", hash, "customer");
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Dian Permata", "dian@email.com", hash, "customer");
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Customer Demo", "customer@tenggaong.com", hash, "customer");
      const o1 = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Bos Tenggaong", "bos@tenggaong.com", hash, "owner").lastInsertRowid;
      const o2 = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Owner Badminton", "owner2@tenggaong.com", hash, "owner").lastInsertRowid;
      const o3 = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Hendra Sport", "hendra@tenggaong.com", hash, "owner").lastInsertRowid;
      const o4 = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Futsal King", "futsalking@tenggaong.com", hash, "owner").lastInsertRowid;
      db.prepare("INSERT INTO users (name, email, password, role, managed_by) VALUES (?,?,?,?,?)").run("Kasir Bos", "admin@tenggaong.com", hash, "admin", o1);
      db.prepare("INSERT INTO users (name, email, password, role, managed_by) VALUES (?,?,?,?,?)").run("Kasir Badminton", "admin2@tenggaong.com", hash, "admin", o2);
      db.prepare("INSERT INTO users (name, email, password, role, managed_by) VALUES (?,?,?,?,?)").run("Kasir Hendra", "admin3@tenggaong.com", hash, "admin", o3);
      db.prepare("INSERT INTO users (name, email, password, role, managed_by) VALUES (?,?,?,?,?)").run("Kasir Futsal King", "admin4@tenggaong.com", hash, "admin", o4);
      db.prepare("INSERT INTO users (name, email, password, role, managed_by) VALUES (?,?,?,?,?)").run("Kasir Futsal King 2", "admin5@tenggaong.com", hash, "admin", o4);

      // Sports
      const futsal = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Futsal", "Lapangan futsal 5v5 & 6v6", "⚽");
      const badminton = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Badminton", "Lapangan badminton indoor", "🏸");
      const bball = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Basketball", "Lapangan basket full court", "🏀");
      const volley = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Volleyball", "Lapangan voli pasir & indoor", "🏐");
      const tennis = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Tennis", "Lapangan tennis", "🎾");

      // Fields — Owner 1 (Bos)
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "Lapangan A", "Futsal 5v5", 120000, o1);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "Lapangan B", "Futsal 6v6", 150000, o1);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "Lapangan C", "Futsal 5v5 VIP", 180000, o1);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(bball.lastInsertRowid, "Lapangan Basket", "Full court", 200000, o1);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(volley.lastInsertRowid, "Lapangan Voli", "Voli indoor", 100000, o1);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(tennis.lastInsertRowid, "Lapangan Tennis 1", "Tennis court", 150000, o1);

      // Fields — Owner 2 (Badminton)
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(badminton.lastInsertRowid, "Lapangan 1", "Badminton indoor standar", 75000, o2);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(badminton.lastInsertRowid, "Lapangan 2", "Badminton indoor standar", 75000, o2);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(badminton.lastInsertRowid, "Lapangan 3", "Badminton indoor VIP", 100000, o2);

      // Fields — Owner 3 (Hendra Sport — Futsal)
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "Lapangan Premier", "Futsal 5v5 premium", 200000, o3);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "Mini Court", "Futsal 4v4", 100000, o3);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(volley.lastInsertRowid, "Voli Outdoor", "Voli pantai", 80000, o3);

      // Fields — Owner 4 (Futsal King)
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "King Court 1", "Futsal 5v5 standar", 130000, o4);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "King Court 2", "Futsal 6v6 standar", 160000, o4);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "King Court VIP", "Futsal VIP AC", 250000, o4);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(tennis.lastInsertRowid, "Tennis Clay", "Tennis clay court", 200000, o4);
      db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(tennis.lastInsertRowid, "Tennis Grass", "Tennis grass court", 250000, o4);

      // Membership tiers (demo for each owner)
      db.prepare("INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)").run("Bronze", "Basic membership - 4x booking", 150000, 30, 4, 5, "#CD7F32", o1);
      db.prepare("INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)").run("Silver", "8x booking + diskon 10%", 250000, 30, 8, 10, "#C0C0C0", o1);
      db.prepare("INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)").run("Gold", "Unlimited booking + diskon 15%", 500000, 30, 0, 15, "#FFD700", o1);
      db.prepare("INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)").run("Basic", "3x booking badminton", 100000, 30, 3, 5, "#CD7F32", o2);
      db.prepare("INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)").run("Premium Badminton", "6x booking + 1 gratis", 200000, 30, 7, 10, "#6C5CE7", o2);
      db.prepare("INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)").run("Hendra Member", "5x booking futsal", 180000, 30, 5, 8, "#00CEC9", o3);
      db.prepare("INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)").run("King Member", "Unlimited futsal", 600000, 30, 0, 20, "#E17055", o4);
      db.prepare("INSERT INTO membership_tiers (name, description, price, duration_days, max_bookings, discount_percent, color, owner_id) VALUES (?,?,?,?,?,?,?,?)").run("Platinum", "All sports unlimited", 1000000, 30, 0, 25, "#E5E4E2", o4);
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }

  // Always ensure superadmin exists
  try {
    const db = getDb();
    const hash = bcrypt.hashSync("123456", 10);
    const sa = db.prepare("SELECT id FROM users WHERE email = 'superadmin@tenggaong.com'").get();
    if (!sa) {
      db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Super Admin", "superadmin@tenggaong.com", hash, "superadmin");
    }
  } catch {}
}

app.listen(PORT, () => {
  ensureSeed();
  console.log(`🚀 Tenggaong Sport API running on http://localhost:${PORT}`);
  console.log(`📧 Demo (password semua: 123456):`);
  console.log(`   👤 Customer      → customer@tenggaong.com / rudi@email.com / sinta@email.com / bambang@email.com / maya@email.com / andi@email.com / dian@email.com`);
  console.log(`   👑 Bos Tenggaong → bos@tenggaong.com (Futsal, Basket, Voli, Tennis)`);
  console.log(`   👑 Owner BD      → owner2@tenggaong.com (Badminton)`);
  console.log(`   👑 Hendra Sport  → hendra@tenggaong.com (Futsal, Voli)`);
  console.log(`   👑 Futsal King   → futsalking@tenggaong.com (Futsal, Tennis)`);
  console.log(`   🛡️ Kasir Bos     → admin@tenggaong.com`);
  console.log(`   🛡️ Kasir BD      → admin2@tenggaong.com`);
  console.log(`   🛡️ Kasir Hendra  → admin3@tenggaong.com`);
  console.log(`   🛡️ Kasir Futsal  → admin4@tenggaong.com / admin5@tenggaong.com`);
  console.log(`   ⭐ Super Admin   → superadmin@tenggaong.com`);
  console.log(`   (password semua: 123456)`);
});
