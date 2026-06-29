import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/index.js";

export default function CustomerMembership() {
  const [tiers, setTiers] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subMsg, setSubMsg] = useState("");
  const [subError, setSubError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getTiers(),
      api.getMyMemberships().catch(() => []),
    ]).then(([t, m]) => {
      setTiers(t || []);
      setMyMemberships(m || []);
      setLoading(false);
    });
  }, []);

  const handleSubscribe = async (tierId) => {
    setSubMsg(""); setSubError("");
    try {
      const r = await api.subscribeMembership(tierId);
      setSubMsg(`✅ Berhasil! Membership ${r.tier} aktif hingga ${r.end_date}`);
      const m = await api.getMyMemberships().catch(() => []);
      setMyMemberships(m);
    } catch (err) {
      setSubError(err.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /><p>Memuat paket membership...</p></div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => navigate("/customer")}>
        ← Kembali
      </button>

      <h2 className="page-title">🎫 Membership</h2>

      {/* Active memberships */}
      {myMemberships.filter((m) => m.status === "active").length > 0 && (
        <div className="card" style={{ marginBottom: 24, border: "1px solid rgba(0,184,148,0.3)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>✅ Membership Aktif</h3>
          {myMemberships.filter((m) => m.status === "active").map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <span style={{ color: m.color, fontWeight: 700, fontSize: 15 }}>{m.tier_name}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginLeft: 8 }}>@{m.owner_name}</span>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.82rem" }}>
                <div>{m.start_date} → <strong>{m.end_date}</strong></div>
                <div style={{ color: "var(--text-muted)" }}>{m.used_bookings}{m.max_bookings > 0 ? `/${m.max_bookings}` : ""} booking</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{subMsg}</div>}
      {subError && <div className="alert alert-error" style={{ marginBottom: 16 }}>❌ {subError}</div>}

      {/* Available Tiers */}
      {tiers.length === 0 ? (
        <div className="empty-state"><span className="icon">🎫</span><h3>Belum Ada Paket Membership</h3></div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {/* Group by owner */}
          {[...new Set(tiers.map((t) => t.owner_id))].map((oid) => {
            const ownerTiers = tiers.filter((t) => t.owner_id === oid);
            return (
              <div key={oid}>
                <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "var(--text-secondary)" }}>
                  👑 {ownerTiers[0]?.owner_name || `Owner #${oid}`}
                </p>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {ownerTiers.map((t) => {
                    const owned = myMemberships.find((m) => m.tier_id === t.id && m.status === "active");
                    return (
                      <div key={t.id} className="card" style={{ borderTop: `4px solid ${t.color}`, padding: 20, display: "flex", flexDirection: "column" }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700 }}>{t.name}</h4>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 8, flex: 1 }}>{t.description}</p>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: t.color }}>Rp {t.price.toLocaleString()}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12 }}>/ {t.duration_days} hari</div>
                        <div style={{ display: "flex", gap: 12, fontSize: "0.82rem", marginBottom: 16 }}>
                          <span>🎯 {t.max_bookings === 0 ? "Unlimited" : `${t.max_bookings}x`}</span>
                          <span>🏷️ {t.discount_percent}% off</span>
                        </div>
                        <button className={`btn ${owned ? "btn-success" : "btn-primary"}`} style={{ width: "100%" }}
                          disabled={!!owned}
                          onClick={() => handleSubscribe(t.id)}>
                          {owned ? "✅ Sudah Aktif" : `Ambil Rp ${t.price.toLocaleString()}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
