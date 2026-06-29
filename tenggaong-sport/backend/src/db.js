import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "tenggaong.db");

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema();
    migrate();
  }
  return db;
}

function migrate() {
  try { db.exec("ALTER TABLE bookings ADD COLUMN pin TEXT"); } catch {}
  try { db.exec("ALTER TABLE bookings ADD COLUMN payment_method TEXT DEFAULT 'transfer'"); } catch {}
  try { db.exec("ALTER TABLE bookings ADD COLUMN customer_name TEXT"); } catch {}
  try { db.exec("ALTER TABLE bookings ADD COLUMN customer_phone TEXT"); } catch {}
  try { db.exec("ALTER TABLE fields ADD COLUMN owner_id INTEGER REFERENCES users(id)"); } catch {}
  try { db.exec("ALTER TABLE users ADD COLUMN managed_by INTEGER REFERENCES users(id)"); } catch {}
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('customer','admin','owner','superadmin')),
      phone TEXT,
      managed_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS sports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT DEFAULT '🏟️',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sport_id INTEGER NOT NULL REFERENCES sports(id),
      name TEXT NOT NULL,
      description TEXT,
      price_per_hour INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      owner_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      field_id INTEGER NOT NULL REFERENCES fields(id),
      booking_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','confirmed','cancelled','completed')),
      pin TEXT,
      payment_method TEXT DEFAULT 'transfer',
      notes TEXT,
      verified_by INTEGER REFERENCES users(id),
      verified_at TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL REFERENCES bookings(id),
      amount INTEGER NOT NULL,
      method TEXT DEFAULT 'transfer',
      status TEXT DEFAULT 'paid',
      paid_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS membership_tiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      duration_days INTEGER NOT NULL DEFAULT 30,
      max_bookings INTEGER DEFAULT 0,
      discount_percent INTEGER DEFAULT 0,
      color TEXT DEFAULT '#6C5CE7',
      is_active INTEGER DEFAULT 1,
      owner_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      tier_id INTEGER NOT NULL REFERENCES membership_tiers(id),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','expired','cancelled')),
      used_bookings INTEGER DEFAULT 0,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS recurring_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      field_id INTEGER NOT NULL REFERENCES fields(id),
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','paused','cancelled')),
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);
}
