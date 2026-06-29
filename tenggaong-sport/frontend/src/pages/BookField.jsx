import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/index.js";

const TIME_SLOTS = [];
for (let h = 8; h < 22; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
}

export default function BookField() {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [sport, setSport] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    api.getSports().then(async (sports) => {
      for (const s of sports) {
        const fs = await api.getFields(s.id);
        const f = fs.find((x) => x.id === Number(fieldId));
        if (f) {
          setField(f);
          setSport(s);
          break;
        }
      }
      setLoading(false);
    });
  }, [fieldId]);

  useEffect(() => {
    if (field && date) {
      api.getAllBookings({ date }).then(setExistingBookings).catch(() => {});
    }
  }, [field, date]);

  useEffect(() => {
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      const totalMin = h * 60 + m + duration * 60;
      const endH = Math.floor(totalMin / 60) % 24;
      const endM = totalMin % 60;
      setEndTime(`${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`);
    }
  }, [startTime, duration]);

  const isSlotBooked = (slot) => {
    return existingBookings.some((b) => {
      if (b.field_id !== Number(fieldId)) return false;
      if (b.status === "cancelled") return false;
      return slot >= b.start_time && slot < b.end_time;
    });
  };

  const totalPrice = field ? field.price_per_hour * duration : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime) return setError("Pilih jam mulai dulu!");
    setError("");
    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        field_id: Number(fieldId),
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        total_price: totalPrice,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });
      setBookingResult(booking);
      setSuccess("✅ Pembayaran berhasil!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /><p>Memuat...</p></div>;
  if (!field) return <div className="alert alert-error">❌ Lapangan tidak ditemukan</div>;

  // SUCCESS VIEW — show PIN
  if (bookingResult) {
    return (
      <div style={{ maxWidth: 520, margin: "40px auto" }}>
        <Link to="/customer" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          ← Kembali ke Beranda
        </Link>

        <div className="card" style={{
          textAlign: "center",
          padding: "48px 32px",
          animation: "slideUp 0.5s ease-out",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8, background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Booking Berhasil!
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Berikut kode PIN kamu. Tunjukkan ke kasir saat datang.
          </p>

          {/* PIN display */}
          <div style={{
            background: "linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,206,201,0.1))",
            border: "2px dashed rgba(108,92,231,0.3)",
            borderRadius: "var(--radius)",
            padding: "24px",
            marginBottom: 24,
          }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" }}>
              Kode PIN
            </div>
            <div style={{
              fontSize: "3rem",
              fontWeight: 900,
              letterSpacing: "12px",
              fontFamily: "'Courier New', monospace",
              background: "var(--gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {bookingResult.pin}
            </div>
          </div>

          {/* Booking summary */}
          <div style={{ textAlign: "left", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Lapangan</span>
              <span style={{ fontWeight: 600 }}>{sport?.icon} {sport?.name} — {field.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Tanggal</span>
              <span style={{ fontWeight: 600 }}>{bookingResult.booking_date}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Jam</span>
              <span style={{ fontWeight: 600 }}>{bookingResult.start_time} - {bookingResult.end_time}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Total Bayar</span>
              <span className="price">Rp {bookingResult.total_price.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => navigate("/customer/bookings")}>
              Lihat Booking Saya →
            </button>
            <button className="btn btn-outline" onClick={() => navigate("/customer")}>
              Booking Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // BOOKING FORM
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <Link to="/customer" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        ← Kembali ke Beranda
      </Link>
      <h2 className="page-title">Booking Lapangan</h2>

      {/* Field Info Card */}
      <div className="card" style={{ marginBottom: 20, padding: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div className="sport-icon" style={{ width: 64, height: 64, fontSize: "2rem" }}>
            {sport?.icon || "⚽"}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>{sport?.name} — {field.name}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>{field.description}</p>
            <div style={{ marginTop: 8 }}>
              <span className="price">Rp {field.price_per_hour.toLocaleString()}</span>
              <span className="price-per-hour"> / jam</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 20, fontWeight: 700 }}>Detail Booking</h3>

          <div className="form-group">
            <label>📅 Tanggal</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          <div className="form-group">
            <label>⏰ Jam Mulai</label>
            <div className="time-slots">
              {TIME_SLOTS.slice(0, -1).map((slot) => {
                const booked = isSlotBooked(slot);
                return (
                  <div
                    key={slot}
                    className={`time-slot ${startTime === slot ? "selected" : ""} ${booked ? "booked" : ""}`}
                    onClick={() => !booked && setStartTime(slot)}
                  >
                    {slot}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>⏳ Durasi</label>
            <select className="form-input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {[1, 2, 3, 4].map((d) => (
                <option key={d} value={d}>{d} Jam — Rp {(field.price_per_hour * d).toLocaleString()}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>💳 Metode Pembayaran</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "transfer", label: "🏦 Transfer Bank" },
                { key: "qris", label: "📱 QRIS" },
                { key: "cash", label: "💵 Bayar di Tempat" },
              ].map((m) => (
                <div
                  key={m.key}
                  className={`btn btn-sm ${paymentMethod === m.key ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setPaymentMethod(m.key)}
                  style={{ cursor: "pointer" }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {startTime && (
            <div style={{
              background: "rgba(108,92,231,0.08)",
              border: "1px solid rgba(108,92,231,0.2)",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              marginBottom: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Jam Selesai</p>
                  <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{endTime}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total</p>
                  <p style={{ fontWeight: 800, fontSize: "1.3rem", background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Rp {totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>📝 Catatan (opsional)</label>
            <textarea
              className="form-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan..."
              style={{ minHeight: 60 }}
            />
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={submitting || !startTime}>
            {submitting ? (
              <><span className="spinner" style={{ width: 18, height: 18 }} /> Memproses Pembayaran...</>
            ) : (
              <>Bayar & Booking — Rp {totalPrice.toLocaleString()}</>
            )}
          </button>

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 12 }}>
            Setelah bayar, kamu akan mendapatkan kode PIN untuk verifikasi di tempat.
          </p>
        </div>
      </form>
    </div>
  );
}
