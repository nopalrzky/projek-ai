import { useState, useEffect } from "react";
import { api } from "../api/index.js";

const STATUS_BADGE = {
  pending: "badge badge-pending", paid: "badge badge-confirmed",
  confirmed: "badge badge-confirmed", cancelled: "badge badge-cancelled", completed: "badge badge-completed",
};
const STATUS_LABEL = {
  pending: "⏳ Menunggu", paid: "💰 Sudah Dibayar",
  confirmed: "✅ Terverifikasi", cancelled: "❌ Dibatalkan", completed: "🏁 Selesai",
};

const TIME_SLOTS = [];
for (let h = 6; h < 24; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
}

function getEndTime(start, dur) {
  const [h, m] = start.split(":").map(Number);
  const mins = h * 60 + m + dur * 60;
  return `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("verify");
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("paid");
  const [loading, setLoading] = useState(true);

  // === PIN verification ===
  const [pinInput, setPinInput] = useState("");
  const [pinBooking, setPinBooking] = useState(null);
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  // === Manual Booking ===
  const [myFields, setMyFields] = useState([]);
  const [sports, setSports] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [form, setForm] = useState({ sport_id: "", field_id: "", date: "", start_time: "", duration: 1, customer_name: "", customer_phone: "", payment_method: "cash" });
  const [manualResult, setManualResult] = useState(null);
  const [manualError, setManualError] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // Computed: fields filtered by selected sport
  const availableFields = myFields.filter((f) => String(f.sport_id) === form.sport_id);
  const selectedField = myFields.find((f) => String(f.id) === form.field_id);
  const endTime = form.start_time ? getEndTime(form.start_time, form.duration) : "";
  const totalPrice = selectedField ? selectedField.price_per_hour * form.duration : 0;

  const isSlotBooked = (slot) => {
    return existingBookings.some((b) => {
      if (b.field_id !== Number(form.field_id)) return false;
      if (b.status === "cancelled") return false;
      return slot >= b.start_time && slot < b.end_time;
    });
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getAllBookings({ status: filter === "all" ? undefined : filter }),
      api.getStats(),
    ])
      .then(([b, s]) => { setBookings(b); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadFields = () => {
    api.getMyFields().then(setMyFields).catch(() => {});
    api.getSports().then(setSports).catch(() => {});
  };

  useEffect(() => {
    if (tab === "verify" || tab === "bookings") loadData();
    if (tab === "booking") { loadFields(); loadData(); }
  }, [tab, filter]);

  // Load existing bookings when field + date changes (for slot grid)
  useEffect(() => {
    if (form.field_id && form.date) {
      api.getAllBookings({ date: form.date }).then(setExistingBookings).catch(() => {});
    } else {
      setExistingBookings([]);
    }
  }, [form.field_id, form.date]);

  // === PIN handlers ===
  const handlePinLookup = async () => {
    if (!pinInput || pinInput.length < 6) return setPinError("Masukkan PIN 6 digit");
    setPinError(""); setPinBooking(null); setPinSuccess(false); setPinLoading(true);
    try {
      const booking = await api.getBookingByPin(pinInput);
      setPinBooking(booking);
    } catch (err) {
      setPinError(err.message);
    } finally { setPinLoading(false); }
  };

  const handlePinVerify = async () => {
    setPinLoading(true);
    try {
      await api.verifyPin(pinInput);
      setPinSuccess(true);
      setPinBooking((prev) => ({ ...prev, status: "confirmed" }));
      loadData();
      setTimeout(() => { setPinInput(""); setPinBooking(null); setPinSuccess(false); }, 2000);
    } catch (err) {
      setPinError(err.message);
    } finally { setPinLoading(false); }
  };

  // === Manual Booking handler ===
  const handleManualBooking = async (e) => {
    e.preventDefault();
    if (!form.sport_id || !form.field_id || !form.date || !form.start_time || !form.customer_name) {
      return setManualError("Lengkapi semua field wajib");
    }
    setManualError(""); setManualResult(null); setManualLoading(true);
    try {
      const res = await api.manualBooking({
        field_id: Number(form.field_id),
        booking_date: form.date,
        start_time: form.start_time,
        end_time: endTime,
        total_price: totalPrice,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone || "",
        payment_method: form.payment_method,
      });
      setManualResult(res);
      setForm({ sport_id: "", field_id: "", date: "", start_time: "", duration: 1, customer_name: "", customer_phone: "", payment_method: "cash" });
      loadData();
    } catch (err) {
      setManualError(err.message);
    } finally { setManualLoading(false); }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="hero">
        <div className="hero-content">
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div className="sport-icon" style={{ width: 48, height: 48, fontSize: "1.5rem" }}>🛡️</div>
            <div>
              <h1>Dashboard Kasir</h1>
              <p>Verifikasi PIN & booking manual untuk walk-in customer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button className={`btn ${tab === "verify" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("verify")}>🔑 Verifikasi PIN</button>
        <button className={`btn ${tab === "booking" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("booking")}>📝 Booking Manual</button>
        <button className={`btn ${tab === "bookings" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("bookings")}>📋 Riwayat</button>
      </div>

      {/* === TAB: VERIFY PIN === */}
      {tab === "verify" && (
        <>
          <div className="card" style={{ marginBottom: 24, padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🔑 Verifikasi PIN Customer</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
              Minta customer menunjukkan kode PIN dari booking mereka.
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                className="form-input"
                style={{ flex: 1, minWidth: 200, fontSize: "1.5rem", fontWeight: 800, textAlign: "center", letterSpacing: 8, fontFamily: "'Courier New', monospace" }}
                placeholder="• • • • • •"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setPinError(""); setPinBooking(null); setPinSuccess(false); }}
                maxLength={6}
              />
              <button className="btn btn-primary btn-lg" onClick={handlePinLookup} disabled={pinLoading || pinInput.length < 6}>
                {pinLoading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Cari...</> : "🔍 Cari PIN"}
              </button>
            </div>
            {pinError && <div className="alert alert-error" style={{ marginTop: 12 }}>❌ {pinError}</div>}
            {pinSuccess && <div className="alert alert-success" style={{ marginTop: 12 }}>✅ Booking berhasil diverifikasi!</div>}
            {pinBooking && (
              <div className="card" style={{ marginTop: 16, padding: 20, border: pinSuccess ? "1px solid rgba(0,184,148,0.3)" : "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700 }}>{pinBooking.sport_icon} {pinBooking.sport_name} — {pinBooking.field_name}</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>
                      🧑 {pinBooking.customer_name}{pinBooking.customer_phone ? ` • ${pinBooking.customer_phone}` : ""}
                    </p>
                  </div>
                  <span className={STATUS_BADGE[pinBooking.status]}>{STATUS_LABEL[pinBooking.status]}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12, fontSize: "0.85rem" }}>
                  <div>📅 {pinBooking.booking_date}</div>
                  <div>⏰ {pinBooking.start_time} - {pinBooking.end_time}</div>
                  <div><span className="price">Rp {pinBooking.total_price.toLocaleString()}</span></div>
                </div>
                {pinBooking.status === "paid" && !pinSuccess && (
                  <button className="btn btn-success btn-lg" style={{ width: "100%" }} onClick={handlePinVerify} disabled={pinLoading}>
                    {pinLoading ? "Memverifikasi..." : "✅ Verifikasi & Konfirmasi"}
                  </button>
                )}
                {pinSuccess && (
                  <div style={{ textAlign: "center", padding: 12, background: "rgba(0,184,148,0.1)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontWeight: 700, color: "var(--success)" }}>✅ Booking Terverifikasi!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {stats && (
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
              <div className="card stat-card"><div className="icon">💰</div><div className="number">{stats.pending_bookings || 0}</div><div className="label">Menunggu Verifikasi</div></div>
              <div className="card stat-card"><div className="icon">✅</div><div className="number">{stats.confirmed_bookings}</div><div className="label">Terverifikasi</div></div>
              <div className="card stat-card"><div className="icon">📅</div><div className="number">{stats.today_bookings}</div><div className="label">Booking Hari Ini</div></div>
            </div>
          )}
        </>
      )}

      {/* === TAB: MANUAL BOOKING === */}
      {tab === "booking" && (
        <div style={{ display: "grid", gridTemplateColumns: manualResult ? "1fr 1fr" : "1fr", gap: 24, alignItems: "start" }}>
          {/* Form */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📝 Booking Manual (Walk-in)</h3>
            {manualError && <div className="alert alert-error" style={{ marginBottom: 16 }}>❌ {manualError}</div>}
            <form onSubmit={handleManualBooking}>
              <div className="form-group">
                <label>🏟️ Olahraga</label>
                <select className="form-input" value={form.sport_id} onChange={(e) => { setForm({ ...form, sport_id: e.target.value, field_id: "" }); }} required>
                  <option value="">Pilih olahraga...</option>
                  {sports.filter((s) => myFields.some((f) => String(f.sport_id) === String(s.id))).map((s) => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>🏟️ Lapangan</label>
                <select className="form-input" value={form.field_id} onChange={(e) => setForm({ ...form, field_id: e.target.value })} required disabled={!form.sport_id}>
                  <option value="">Pilih lapangan...</option>
                  {availableFields.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} — Rp {f.price_per_hour.toLocaleString()}/jam</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>📅 Tanggal</label>
                <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} min={today} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>⏰ Jam Mulai</label>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>Klik slot yang tersedia (hijau)</p>
                  <div className="time-slots">
                    {TIME_SLOTS.filter((t) => {
                      const [h] = t.split(":").map(Number);
                      return h >= 6;
                    }).map((slot) => {
                      const booked = isSlotBooked(slot + ":00");
                      return (
                        <div
                          key={slot}
                          className={`time-slot ${form.start_time === slot + ":00" ? "selected" : ""} ${booked ? "booked" : ""}`}
                          onClick={() => !booked && setForm({ ...form, start_time: slot })}
                        >
                          {slot}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label>⏱️ Durasi (jam)</label>
                  <select className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}>
                    {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} jam</option>)}
                  </select>
                  {form.start_time && (
                    <div style={{ marginTop: 16, background: "rgba(108,92,231,0.08)", borderRadius: "var(--radius-sm)", padding: "12px 16px" }}>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>⏰ <strong>{form.start_time?.slice(0,5)} - {endTime}</strong></div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 4 }}>💰 <strong className="price">Rp {totalPrice.toLocaleString()}</strong></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>🧑 Nama Customer</label>
                <input className="form-input" type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Nama walk-in customer" required />
              </div>
              <div className="form-group">
                <label>📱 No. HP (opsional)</label>
                <input className="form-input" type="text" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="0812xxxx" />
              </div>
              <div className="form-group">
                <label>💳 Metode Pembayaran</label>
                <select className="form-input" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                  <option value="cash">💵 Tunai</option>
                  <option value="transfer">🏦 Transfer</option>
                  <option value="qris">📱 QRIS</option>
                </select>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} type="submit" disabled={manualLoading}>
                {manualLoading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Memproses...</> : "✅ Booking Sekarang"}
              </button>
            </form>
          </div>

          {/* Success Result */}
          {manualResult && (
            <div className="card" style={{ padding: 24, border: "1px solid rgba(0,184,148,0.3)", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>✅</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Booking Berhasil!</h3>
              <div className="card" style={{ margin: "16px 0", padding: 24, background: "rgba(108,92,231,0.1)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 8 }}>🔑 Kode PIN Customer</div>
                <div style={{
                  fontSize: "2.8rem", fontWeight: 900, letterSpacing: 12,
                  fontFamily: "'Courier New', monospace", color: "var(--primary)",
                  background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-sm)", padding: "8px 16px",
                }}>
                  {manualResult.pin}
                </div>
              </div>
              <div style={{ textAlign: "left", fontSize: "0.88rem", lineHeight: 1.8 }}>
                <div>🧑 <strong>{manualResult.customer_name}</strong></div>
                <div>{manualResult.sport_icon} {manualResult.sport_name} — {manualResult.field_name}</div>
                <div>📅 {manualResult.booking_date} ⏰ {manualResult.start_time} - {manualResult.end_time}</div>
                <div>💰 <strong className="price">Rp {manualResult.total_price.toLocaleString()}</strong> ({manualResult.payment_method})</div>
              </div>
              <button className="btn btn-outline" style={{ marginTop: 16, width: "100%" }} onClick={() => setManualResult(null)}>
                📝 Booking Lagi
              </button>
            </div>
          )}
        </div>
      )}

      {/* === TAB: BOOKINGS HISTORY === */}
      {tab === "bookings" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { key: "paid", label: "💰 Perlu Verifikasi" },
              { key: "confirmed", label: "✅ Terverifikasi" },
              { key: "cancelled", label: "❌ Dibatalkan" },
              { key: "all", label: "Semua" },
            ].map((f) => (
              <button key={f.key} className={`btn btn-sm ${filter === f.key ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
          {loading ? (
            <div className="loading"><div className="spinner" /><p>Memuat...</p></div>
          ) : bookings.length === 0 ? (
            <div className="empty-state"><span className="icon">📭</span><h3>Tidak Ada Booking</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Customer</th><th>Lapangan</th><th>Tanggal</th><th>Jam</th><th>Total</th><th>Metode</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.customer_name}</strong>{b.customer_phone && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📱 {b.customer_phone}</div>}</td>
                      <td>{b.sport_icon} {b.sport_name} — {b.field_name}</td>
                      <td>📅 {b.booking_date}</td>
                      <td>⏰ {b.start_time} - {b.end_time}</td>
                      <td><span className="price">Rp {b.total_price.toLocaleString()}</span></td>
                      <td style={{ fontSize: "0.8rem" }}>{b.payment_method || "-"}</td>
                      <td>
                        <span className={STATUS_BADGE[b.status]}>{STATUS_LABEL[b.status]}</span>
                        {b.status === "paid" && b.pin && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>PIN: {b.pin}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
