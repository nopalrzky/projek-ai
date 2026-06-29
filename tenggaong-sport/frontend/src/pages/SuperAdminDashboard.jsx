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

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [ownerAdmins, setOwnerAdmins] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.superadminStats(),
      api.superadminUsers(),
      api.superadminOwnerAdmins(),
      api.superadminRevenue(period),
      api.superadminBookings(),
    ])
      .then(([st, u, oa, r, b]) => { setStats(st); setUsers(u); setOwnerAdmins(oa); setRevenue(r); setBookings(b); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="loading"><div className="spinner" /><p>Memuat...</p></div>;

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="sport-icon" style={{ width: 48, height: 48, fontSize: "1.5rem" }}>⭐</div>
            <div>
              <h1>Super Admin</h1>
              <p>Pantau seluruh owner, kasir, booking, dan revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { key: "overview", label: "📊 Overview" },
          { key: "users", label: "👥 Pengguna" },
          { key: "owner-admins", label: "👑 Owner & Kasir" },
          { key: "bookings", label: "📋 Booking" },
          { key: "revenue", label: "💰 Revenue" },
        ].map((t) => (
          <button key={t.key} className={`btn ${tab === t.key ? "btn-primary" : "btn-outline"}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* === OVERVIEW === */}
      {tab === "overview" && stats && (
        <>
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            <div className="card stat-card"><div className="icon">💰</div><div className="number">Rp {(stats.total_revenue || 0).toLocaleString()}</div><div className="label">Total Revenue</div></div>
            <div className="card stat-card"><div className="icon">📊</div><div className="number">{stats.total_bookings}</div><div className="label">Total Booking</div></div>
            <div className="card stat-card"><div className="icon">⏳</div><div className="number">{stats.paid_bookings}</div><div className="label">Perlu Verifikasi</div></div>
            <div className="card stat-card"><div className="icon">📅</div><div className="number">{stats.today_bookings}</div><div className="label">Booking Hari Ini</div></div>
          </div>
          <div className="grid grid-3" style={{ marginBottom: 24 }}>
            <div className="card stat-card" style={{ background: "rgba(108,92,231,0.08)" }}><div className="icon">👑</div><div className="number">{stats.total_owners}</div><div className="label">Owner</div></div>
            <div className="card stat-card" style={{ background: "rgba(0,206,201,0.08)" }}><div className="icon">🛡️</div><div className="number">{stats.total_admins}</div><div className="label">Kasir</div></div>
            <div className="card stat-card" style={{ background: "rgba(253,121,168,0.08)" }}><div className="icon">👤</div><div className="number">{stats.total_customers}</div><div className="label">Customer</div></div>
          </div>

          {/* Quick owner list */}
          {ownerAdmins.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>👑 Daftar Owner & Kasir</h3>
              <div style={{ display: "grid", gap: 16 }}>
                {ownerAdmins.map((o) => (
                  <div key={o.id} style={{
                    padding: 16, borderRadius: "var(--radius-sm)",
                    background: "rgba(108,92,231,0.05)", border: "1px solid rgba(108,92,231,0.1)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>👑 {o.name}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: 8 }}>{o.email}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: "0.85rem" }}>
                        <span>🏟️ {o.total_fields} lapangan</span>
                        <span>📊 {o.total_bookings} booking</span>
                        <span className="price">Rp {o.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    {o.admins && o.admins.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6 }}>🛡️ Kasir:</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {o.admins.map((a) => (
                            <span key={a.id} style={{
                              padding: "4px 12px", borderRadius: 20,
                              background: "rgba(0,206,201,0.1)", color: "var(--secondary)",
                              fontSize: "0.85rem", fontWeight: 500,
                            }}>
                              {a.name} <span style={{ opacity: 0.5 }}>({a.email})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!o.admins || o.admins.length === 0) && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        🛡️ Belum punya kasir
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue per Owner */}
          {revenue?.byOwner && revenue.byOwner.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📊 Revenue per Owner</h3>
              {revenue.byOwner.map((o, idx) => {
                const maxRev = Math.max(...revenue.byOwner.map(x => Number(x.total_revenue)));
                const pct = maxRev > 0 ? (Number(o.total_revenue) / maxRev) * 100 : 0;
                return (
                  <div key={o.owner_name} style={{ marginBottom: idx < revenue.byOwner.length - 1 ? 12 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>👑 {o.owner_name}</span>
                      <span style={{ fontWeight: 700 }}>Rp {Number(o.total_revenue).toLocaleString()} ({o.total_bookings} booking)</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: idx % 2 ? "#6C5CE7" : "#00CEC9", borderRadius: 10, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === USERS === */}
      {tab === "users" && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>👥 Semua Pengguna ({users.length})</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Nama</th><th>Email</th><th>Role</th><th>Bergabung</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "superadmin" ? "badge-confirmed" : u.role === "owner" ? "badge-confirmed" : u.role === "admin" ? "badge-pending" : "badge-completed"}`}>
                        {u.role === "superadmin" ? "⭐ Superadmin" : u.role === "owner" ? "👑 Owner" : u.role === "admin" ? `🛡️ Kasir${u.managed_by_name ? ` (${u.managed_by_name})` : ""}` : "👤 Customer"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === OWNER & KASIR === */}
      {tab === "owner-admins" && (
        <div style={{ display: "grid", gap: 20 }}>
          {ownerAdmins.map((o) => (
            <div key={o.id} className="card" style={{
              borderLeft: "4px solid var(--primary)",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                flexWrap: "wrap", gap: 12, marginBottom: 16,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.5rem" }}>👑</span>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{o.name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{o.email}</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: "0.85rem" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "var(--primary-light)" }}>{o.total_fields}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Lapangan</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700 }}>{o.total_bookings}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Booking</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "var(--success)" }}>Rp {o.revenue.toLocaleString()}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Revenue</div>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 10, fontWeight: 600 }}>
                  🛡️ Kasir ({o.admins ? o.admins.length : 0})
                </div>
                {o.admins && o.admins.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {o.admins.map((a) => (
                      <div key={a.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", borderRadius: "var(--radius-sm)",
                        background: "rgba(255,255,255,0.03)",
                      }}>
                        <span style={{ fontSize: "1.1rem" }}>🛡️</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.02)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    ❌ Owner ini belum punya kasir
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === BOOKINGS === */}
      {tab === "bookings" && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📋 Semua Booking ({bookings.length})</h3>
          {bookings.length === 0 ? (
            <div className="empty-state" style={{ border: "none" }}><span className="icon">📭</span><h3>Belum Ada Booking</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Customer</th><th>Lapangan</th><th>Owner</th><th>Tanggal</th><th>Jam</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.customer_name}</strong></td>
                      <td>{b.sport_icon} {b.sport_name} — {b.field_name}</td>
                      <td style={{ fontSize: "0.85rem" }}>👑 {b.owner_name}</td>
                      <td>📅 {b.booking_date}</td>
                      <td>⏰ {b.start_time} - {b.end_time}</td>
                      <td><span className="price">Rp {b.total_price.toLocaleString()}</span></td>
                      <td><span className={STATUS_BADGE[b.status]}>{STATUS_LABEL[b.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* === REVENUE === */}
      {tab === "revenue" && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>📈 Gross Revenue</h3>
              <div style={{ display: "flex", gap: 6 }}>
                {["daily","weekly","monthly"].map((p) => (
                  <button key={p} className={`btn btn-sm ${period === p ? "btn-primary" : "btn-outline"}`} onClick={() => setPeriod(p)}>
                    {p === "daily" ? "📅 Harian" : p === "weekly" ? "📆 Mingguan" : "🗓️ Bulanan"}
                  </button>
                ))}
              </div>
            </div>
            {revenue?.revenue?.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Periode</th><th>Booking</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {revenue.revenue.map((r) => (
                      <tr key={r.period}><td style={{ fontWeight: 500 }}>{r.period}</td><td>{r.total_bookings}</td><td style={{ fontWeight: 700 }}><span className="price">Rp {Number(r.total_revenue).toLocaleString()}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ border: "none" }}><span className="icon">📊</span><h3>Belum Ada Revenue</h3></div>
            )}
          </div>

          {revenue?.topFields?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🏆 Top 10 Lapangan Terlaris</h3>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>#</th><th>Lapangan</th><th>Owner</th><th>Booking</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {revenue.topFields.map((f, i) => (
                      <tr key={f.field_name + i}>
                        <td style={{ fontWeight: 700, color: "var(--primary-light)" }}>#{i + 1}</td>
                        <td>{f.sport_icon} {f.sport_name} — {f.field_name}</td>
                        <td>👑 {f.owner_name}</td>
                        <td>{f.bookings}x booking</td>
                        <td><span className="price">Rp {Number(f.revenue).toLocaleString()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {revenue?.total && (
            <div className="card" style={{ textAlign: "center", background: "linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,206,201,0.1))", border: "1px solid rgba(108,92,231,0.2)" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>💰 Total Revenue Keseluruhan</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginTop: 8 }}>
                Rp {(revenue.total.total_revenue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 8 }}>
                📊 {revenue.total.total_bookings} booking terverifikasi
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
