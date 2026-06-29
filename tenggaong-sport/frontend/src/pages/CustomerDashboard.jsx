import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/index.js";

const SPORT_GRADIENTS = {
  Futsal: "sport-image-futsal",
  Badminton: "sport-image-badminton",
  Basketball: "sport-image-basketball",
  Volleyball: "sport-image-volleyball",
  Tennis: "sport-image-tennis",
};

export default function CustomerDashboard() {
  const [sports, setSports] = useState([]);
  const [fields, setFields] = useState({});
  const [selectedSport, setSelectedSport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getSports().then(async (s) => {
      setSports(s);
      if (s.length > 0) {
        setSelectedSport(s[0].id);
        const fieldMap = {};
        for (const sport of s) {
          fieldMap[sport.id] = await api.getFields(sport.id);
        }
        setFields(fieldMap);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Memuat lapangan...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div
        className="hero-image-banner"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80')`,
        }}
      >
        <div className="hero-image-text">
          <h1>🏟️ Tenggaong Sport</h1>
          <p>Booking lapangan olahraga favorit kamu dengan mudah. Futsal, Badminton, Basket, dan banyak lagi!</p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => document.querySelector(".sport-tabs")?.scrollIntoView({ behavior: "smooth" })}>
              Booking Sekarang →
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        <div className="card stat-card">
          <div className="icon">⚽</div>
          <div className="number">{sports.length}</div>
          <div className="label">Cabang Olahraga</div>
        </div>
        <div className="card stat-card">
          <div className="icon">🏟️</div>
          <div className="number">
            {Object.values(fields).reduce((sum, arr) => sum + arr.length, 0)}
          </div>
          <div className="label">Total Lapangan</div>
        </div>
        <div className="card stat-card">
          <div className="icon">💰</div>
          <div className="number">Mulai</div>
          <div className="label">Rp 75rb/jam</div>
        </div>
        <div className="card stat-card">
          <div className="icon">🕐</div>
          <div className="number">08:00</div>
          <div className="label">Buka Setiap Hari</div>
        </div>
      </div>

      {/* Membership Banner */}
      <div className="card" style={{ marginBottom: 24, padding: 20, background: "linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,206,201,0.1))", border: "1px solid rgba(108,92,231,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>🎫 Membership</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>Dapatkan diskon & booking unlimited dengan membership!</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/customer/membership")}>
            Lihat Paket →
          </button>
        </div>
      </div>

      {/* Section Title */}
      <div className="dashboard-header">
        <h2 className="page-title">Pilih Olahraga</h2>
      </div>

      {/* Sport tabs */}
      <div className="sport-tabs">
        {sports.map((s) => (
          <button
            key={s.id}
            className={`sport-tab ${selectedSport === s.id ? "active" : ""}`}
            onClick={() => setSelectedSport(s.id)}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      {/* Fields grid */}
      <div className="grid grid-2">
        {(selectedSport && fields[selectedSport] ? fields[selectedSport] : []).map((f) => {
          const sport = sports.find((s) => s.id === selectedSport);
          const gradientClass = SPORT_GRADIENTS[sport?.name] || "sport-image-futsal";

          return (
            <div className="card" key={f.id} style={{ padding: 0, overflow: "hidden" }}>
              <div className={`sport-image ${gradientClass}`}>
                {sport?.icon || "⚽"}
              </div>
              <div style={{ padding: "20px 24px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{f.name}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                      {sport?.name} • {f.description}
                    </p>
                    {f.owner_name && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        👑 {f.owner_name}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                  <div>
                    <span className="price">Rp {f.price_per_hour.toLocaleString()}</span>
                    <span className="price-per-hour"> / jam</span>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/customer/book/${f.id}`)}>
                    Booking →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSport && fields[selectedSport]?.length === 0 && (
        <div className="empty-state">
          <span className="icon">🏗️</span>
          <h3>Belum Ada Lapangan</h3>
          <p>Belum ada lapangan untuk olahraga ini. Coba pilih olahraga lain.</p>
        </div>
      )}
    </div>
  );
}
