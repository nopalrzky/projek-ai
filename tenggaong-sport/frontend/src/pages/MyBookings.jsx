import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/index.js";

const STATUS_BADGE = {
  pending: "badge badge-pending",
  paid: "badge badge-confirmed",
  confirmed: "badge badge-confirmed",
  cancelled: "badge badge-cancelled",
  completed: "badge badge-completed",
};
const STATUS_LABEL = {
  pending: "⏳ Menunggu",
  paid: "💰 Sudah Dibayar",
  confirmed: "✅ Terverifikasi",
  cancelled: "❌ Dibatalkan",
  completed: "🏁 Selesai",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getMyBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Memuat booking...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div>
        <h2 className="page-title">Booking Saya</h2>
        <div className="empty-state">
          <span className="icon">📋</span>
          <h3>Belum Ada Booking</h3>
          <p>Kamu belum melakukan booking lapangan. Yuk booking sekarang!</p>
          <button className="btn btn-primary" onClick={() => navigate("/customer")}>
            Booking Sekarang →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="page-title">Booking Saya</h2>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {bookings.length} booking
        </span>
      </div>

      <div className="grid">
        {bookings.map((b) => (
          <div className="card" key={b.id} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div className="sport-icon" style={{ width: 48, height: 48 }}>
                  {b.sport_icon || "⚽"}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{b.sport_name} — {b.field_name}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>
                    📅 {b.booking_date} • ⏰ {b.start_time} - {b.end_time}
                  </p>
                </div>
              </div>
              <span className={STATUS_BADGE[b.status]}>{STATUS_LABEL[b.status]}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Total Bayar</span>
                <div className="price" style={{ fontSize: "1.1rem" }}>Rp {b.total_price.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {b.status === "paid" && b.pin && (
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4 }}>KODE PIN</div>
                    <div style={{
                      fontSize: "1.3rem",
                      fontWeight: 900,
                      letterSpacing: 6,
                      fontFamily: "'Courier New', monospace",
                      color: "var(--primary-light)",
                    }}>{b.pin}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                      🔴 Tunjukkan ke kasir
                    </div>
                  </div>
                )}
                {b.status === "confirmed" && b.verified_by_name && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    ✅ Verifikasi: {b.verified_by_name}
                  </div>
                )}
                {b.status === "confirmed" && (
                  <div style={{ fontSize: "0.8rem", color: "var(--success)", marginTop: 4 }}>✅ Selesai</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
