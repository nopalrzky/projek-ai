import bcrypt from "bcryptjs";
import { getDb } from "./db.js";

const db = getDb();

// Clean existing data
db.exec("DELETE FROM payments; DELETE FROM bookings; DELETE FROM fields; DELETE FROM sports; DELETE FROM users;");

const hash = bcrypt.hashSync("123456", 10);

// === USERS ===
db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Customer Demo", "customer@tenggaong.com", hash, "customer");

const owner1 = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Bos Tenggaong", "bos@tenggaong.com", hash, "owner");
const owner2 = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run("Owner Badminton", "owner2@tenggaong.com", hash, "owner");

db.prepare("INSERT INTO users (name, email, password, role, managed_by) VALUES (?,?,?,?,?)").run("Kasir Bos", "admin@tenggaong.com", hash, "admin", owner1.lastInsertRowid);
db.prepare("INSERT INTO users (name, email, password, role, managed_by) VALUES (?,?,?,?,?)").run("Kasir Badminton", "admin2@tenggaong.com", hash, "admin", owner2.lastInsertRowid);

const o1 = owner1.lastInsertRowid;
const o2 = owner2.lastInsertRowid;

// === SPORTS (global) ===
const futsal = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Futsal", "Lapangan futsal 5v5 & 6v6", "⚽");
const badminton = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Badminton", "Lapangan badminton indoor", "🏸");
const basketball = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Basketball", "Lapangan basket full court", "🏀");
const volley = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Volleyball", "Lapangan voli pasir & indoor", "🏐");
const tennis = db.prepare("INSERT INTO sports (name, description, icon) VALUES (?,?,?)").run("Tennis", "Lapangan tennis", "🎾");

// === FIELDS per OWNER ===

// Owner 1 (Bos Tenggaong) — Futsal, Basketball, Volleyball, Tennis
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "Lapangan A", "Futsal 5v5", 120000, o1);
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "Lapangan B", "Futsal 6v6", 150000, o1);
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(futsal.lastInsertRowid, "Lapangan C", "Futsal 5v5 VIP", 180000, o1);
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(basketball.lastInsertRowid, "Lapangan Basket", "Full court", 200000, o1);
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(volley.lastInsertRowid, "Lapangan Voli", "Voli indoor", 100000, o1);
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(tennis.lastInsertRowid, "Lapangan Tennis 1", "Tennis court", 150000, o1);

// Owner 2 (Owner Badminton) — Badminton only
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(badminton.lastInsertRowid, "Lapangan 1", "Badminton indoor standar", 75000, o2);
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(badminton.lastInsertRowid, "Lapangan 2", "Badminton indoor standar", 75000, o2);
db.prepare("INSERT INTO fields (sport_id, name, description, price_per_hour, owner_id) VALUES (?,?,?,?,?)").run(badminton.lastInsertRowid, "Lapangan 3", "Badminton indoor VIP", 100000, o2);

console.log("✅ Seed multi-owner berhasil!");
console.log("");
console.log("👤 Customer    → customer@tenggaong.com");
console.log("👑 Bos         → bos@tenggaong.com        (Futsal, Basket, Voli, Tennis)");
console.log("👑 Owner 2     → owner2@tenggaong.com      (Badminton)");
console.log("🛡️ Kasir Bos   → admin@tenggaong.com");
console.log("🛡️ Kasir BD    → admin2@tenggaong.com");
console.log("   (password semua: 123456)");
