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

export default function OwnerDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Membership
  const [myTiers, setMyTiers] = useState([]);
  const [members, setMembers] = useState([]);
  const [showAddTier, setShowAddTier] = useState(false);
  const [newTier, setNewTier] = useState({ name: "", description: "", price: "", duration_days: 30, max_bookings: 0, discount_percent: 0, color: "#6C5CE7" });
  const [tierError, setTierError] = useState("");
  const [tierSuccess, setTierSuccess] = useState("");

  // Fields management
  const [myFields, setMyFields] = useState([]);
  const [sports, setSports] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState({ sport_id: "", name: "", description: "", price_per_hour: "" });
  const [fieldError, setFieldError] = useState("");
  const [fieldSuccess, setFieldSuccess] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getStats(),
      api.getRevenue(period),
      api.getAllBookings({ status: bookingFilter === "all" ? undefined : bookingFilter }),
    ])
      .then(([s, r, b]) => { setStats(s); setRevenue(r); setBookings(b); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadFields = () => {
    api.getMyFields().then(setMyFields).catch(() => {});
    api.getSports().then(setSports).catch(() => {});
  };

  const loadMembers = () => {
    api.getMyTiers().then(setMyTiers).catch(() => {});
    api.getMembers().then(setMembers).catch(() => {});
  };

  useEffect(() => {
    if (tab === "overview" || tab === "bookings" || tab === "revenue") loadData();
    if (tab === "fields") loadFields();
    if (tab === "membership") loadMembers();
  }, [tab, period, bookingFilter]);

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newField.sport_id || !newField.name || !newField.price_per_hour) {
      return setFieldError("Nama, olahraga, dan harga wajib diisi");
    }
    setFieldError("");
    setFieldSuccess("");
    try {
      await api.createField(newField.sport_id, {
        name: newField.name,
        description: newField.description || "",
        price_per_hour: Number(newField.price_per_hour),
      });
      setFieldSuccess(`✅ Lapangan "${newField.name}" berhasil ditambahkan!`);
      setNewField({ sport_id: "", name: "", description: "", price_per_hour: "" });
      setShowAddForm(false);
      loadFields();
    } catch (err) {
      setFieldError(err.message);
    }
  };

  const handleDeleteField = async (id, name) => {
    if (!confirm(`Hapus lapangan "${name}"?`)) return;
    try {
      await api.deleteField(id);
      setFieldSuccess(`✅ Lapangan "${name}" dinonaktifkan`);
      loadFields();
    } catch (err) {
      setFieldError(err.message);
    }
  };

  if (loading && tab !== "fields") {
    return <div className="loading"><div className="spinner" /><p>Memuat dashboard...</p></div>;
  }

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div className="sport-icon" style={{ width: 48, height: 48, fontSize: "1.5rem" }}>👑</div>
            <div>
              <h1>Dashboard Owner</h1>
              <p>Pantau revenue, kelola lapangan, dan lihat booking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { key: "overview", label: "📊 Overview" },
          { key: "fields", label: "🏟️ Lapangan" },
          { key: "bookings", label: "📋 Booking" },
          { key: "revenue", label: "💰 Revenue" },
          { key: "membership", label: "🎫 Membership" },
        ].map((t) => (
          <button key={t.key} className={`btn ${tab === t.key ? "btn-primary" : "btn-outline"}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW === */}
      {tab === "overview" && stats && (
        <>
          <div className="grid grid-3" style={{ marginBottom: 24 }}>
            <div className="card stat-card">
              <div className="icon">💰</div>
              <div className="number">Rp {(stats.total_revenue || 0).toLocaleString()}</div>
              <div className="label">Total Revenue</div>
            </div>
            <div className="card stat-card">
              <div className="icon">👥</div>
              <div className="number">{stats.total_customers}</div>
              <div className="label">Total Customer</div>
            </div>
            <div className="card stat-card">
              <div className="icon">📊</div>
              <div className="number">{stats.total_bookings}</div>
              <div className="label">Total Booking</div>
            </div>
          </div>
          {revenue?.bySport && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📊 Revenue per Olahraga</h3>
              {revenue.bySport.map((s, idx) => {
                const maxRev = Math.max(...revenue.bySport.map((x) => x.revenue));
                const pct = maxRev > 0 ? (s.revenue / maxRev) * 100 : 0;
                return (
                  <div key={s.name} style={{ marginBottom: idx < revenue.bySport.length - 1 ? 12 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>{s.icon} {s.name}</span>
                      <span style={{ fontWeight: 700 }}>Rp {s.revenue.toLocaleString()} ({s.bookings} booking)</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#6C5CE7", borderRadius: 10, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === FIELDS === */}
      {tab === "fields" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 className="page-title" style={{ margin: 0 }}>🏟️ Lapangan Saya ({myFields.length})</h2>
            <button className="btn btn-primary" onClick={() => { setShowAddForm(!showAddForm); setFieldError(""); setFieldSuccess(""); }}>
              {showAddForm ? "✖ Batal" : "➕ Tambah Lapangan"}
            </button>
          </div>

          {fieldSuccess && <div className="alert alert-success" style={{ marginBottom: 16 }}>{fieldSuccess}</div>}
          {fieldError && <div className="alert alert-error" style={{ marginBottom: 16 }}>❌ {fieldError}</div>}

          {/* Add Form */}
          {showAddForm && (
            <div className="card" style={{ marginBottom: 20, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>➕ Tambah Lapangan Baru</h3>
              <form onSubmit={handleAddField}>
                <div className="form-group">
                  <label>🏟️ Olahraga</label>
                  <select className="form-input" value={newField.sport_id} onChange={(e) => setNewField({...newField, sport_id: e.target.value})} required>
                    <option value="">Pilih olahraga...</option>
                    {sports.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>📛 Nama Lapangan</label>
                  <input className="form-input" type="text" value={newField.name} onChange={(e) => setNewField({...newField, name: e.target.value})} placeholder="Contoh: Lapangan A" required />
                </div>
                <div className="form-group">
                  <label>📝 Deskripsi (opsional)</label>
                  <input className="form-input" type="text" value={newField.description} onChange={(e) => setNewField({...newField, description: e.target.value})} placeholder="Contoh: Futsal 5v5" />
                </div>
                <div className="form-group">
                  <label>💰 Harga per Jam (Rp)</label>
                  <input className="form-input" type="number" value={newField.price_per_hour} onChange={(e) => setNewField({...newField, price_per_hour: e.target.value})} placeholder="120000" min="1" required />
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%" }} type="submit">
                  ✅ Simpan Lapangan
                </button>
              </form>
            </div>
          )}

          {/* My Fields List */}
          {myFields.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🏟️</span>
              <h3>Belum Ada Lapangan</h3>
              <p>Klik "Tambah Lapangan" untuk memulai.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {myFields.map((f) => (
                <div key={f.id} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: "1.5rem" }}>{f.sport_icon}</span>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: 15 }}>{f.name}</h4>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        {f.sport_name}{f.description ? ` • ${f.description}` : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ textAlign: "right" }}>
                      <div className="price" style={{ fontSize: "1rem" }}>Rp {f.price_per_hour.toLocaleString()}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/ jam</div>
                    </div>
                    <button className="btn btn-sm btn-outline" style={{ color: "#e74c3c", borderColor: "rgba(231,76,60,0.3)" }}
                      onClick={() => handleDeleteField(f.id, f.name)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === BOOKINGS === */}
      {tab === "bookings" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { key: "all", label: "Semua" }, { key: "paid", label: "💰 Perlu Verifikasi" },
              { key: "confirmed", label: "✅ Terverifikasi" }, { key: "cancelled", label: "❌ Dibatalkan" },
            ].map((f) => (
              <button key={f.key} className={`btn btn-sm ${bookingFilter === f.key ? "btn-primary" : "btn-outline"}`} onClick={() => setBookingFilter(f.key)}>{f.label}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn-sm btn-outline" onClick={() => api.exportBookings({ status: bookingFilter === 'all' ? undefined : bookingFilter })} style={{ padding: '6px 14px' }}>
              📥 Export Excel
            </button>
          </div>
          {bookings.length === 0 ? (
            <div className="empty-state"><span className="icon">📭</span><h3>Tidak Ada Booking</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Customer</th><th>Lapangan</th><th>Tanggal</th><th>Jam</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.customer_name}</strong>{b.customer_phone && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📱 {b.customer_phone}</div>}</td>
                      <td>{b.sport_icon} {b.sport_name} — {b.field_name}</td>
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
        </>
      )}

      {/* === REVENUE === */}
      {tab === "revenue" && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>📈 Revenue Timeline</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {["daily","weekly","monthly"].map((p) => (
                  <button key={p} className={`btn btn-sm ${period === p ? "btn-primary" : "btn-outline"}`} onClick={() => setPeriod(p)}>
                    {p === "daily" ? "📅 Harian" : p === "weekly" ? "📆 Mingguan" : "🗓️ Bulanan"}
                  </button>
                ))}
                <button className="btn btn-sm btn-outline" onClick={() => api.exportRevenue({ period })} style={{ marginLeft: 4 }}>
                  📥 Excel
                </button>
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
              <div className="empty-state" style={{ border: "none" }}><span className="icon">📊</span><h3>Belum Ada Data Revenue</h3></div>
            )}
          </div>
          {revenue?.total && (
            <div className="card" style={{ textAlign: "center", background: "linear-gradient(135deg, rgba(108,92,231,0.1), rgba(0,206,201,0.1))", border: "1px solid rgba(108,92,231,0.2)" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>💰 Total Revenue</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginTop: 8 }}>
                Rp {(revenue.total.total_revenue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 8 }}>📊 {revenue.total.total_bookings} booking terverifikasi</div>
            </div>
          )}
        </>
      )}

      {/* === MEMBERSHIP === */}
      {tab === "membership" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 className="page-title" style={{ margin: 0 }}>🎫 Membership Tiers ({myTiers.length})</h2>
            <button className="btn btn-primary" onClick={() => { setShowAddTier(!showAddTier); setTierError(""); setTierSuccess(""); }}>
              {showAddTier ? "✖ Batal" : "➕ Tambah Tier"}
            </button>
          </div>

          {tierSuccess && <div className="alert alert-success" style={{ marginBottom: 16 }}>{tierSuccess}</div>}
          {tierError && <div className="alert alert-error" style={{ marginBottom: 16 }}>❌ {tierError}</div>}

          {/* Add Tier Form */}
          {showAddTier && (
            <div className="card" style={{ marginBottom: 20, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>➕ Tier Baru</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newTier.name || !newTier.price) return setTierError("Nama dan harga wajib");
                setTierError(""); setTierSuccess("");
                try {
                  await api.createTier({ ...newTier, price: Number(newTier.price), duration_days: Number(newTier.duration_days) });
                  setTierSuccess("✅ Tier berhasil dibuat");
                  setNewTier({ name: "", description: "", price: "", duration_days: 30, max_bookings: 0, discount_percent: 0, color: "#6C5CE7" });
                  setShowAddTier(false);
                  loadMembers();
                } catch (err) { setTierError(err.message); }
              }}>
                <div className="form-group"><label>📛 Nama Tier</label><input className="form-input" value={newTier.name} onChange={e => setNewTier({...newTier, name: e.target.value})} placeholder="Bronze" required /></div>
                <div className="form-group"><label>📝 Deskripsi</label><input className="form-input" value={newTier.description} onChange={e => setNewTier({...newTier, description: e.target.value})} placeholder="4x booking sebulan" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group"><label>💰 Harga (Rp)</label><input className="form-input" type="number" value={newTier.price} onChange={e => setNewTier({...newTier, price: e.target.value})} required min="1" /></div>
                  <div className="form-group"><label>📆 Durasi (hari)</label><input className="form-input" type="number" value={newTier.duration_days} onChange={e => setNewTier({...newTier, duration_days: e.target.value})} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group"><label>🎯 Max Booking</label><input className="form-input" type="number" value={newTier.max_bookings} onChange={e => setNewTier({...newTier, max_bookings: e.target.value})} placeholder="0 = unlimited" /></div>
                  <div className="form-group"><label>🏷️ Diskon %</label><input className="form-input" type="number" value={newTier.discount_percent} onChange={e => setNewTier({...newTier, discount_percent: e.target.value})} /></div>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%" }} type="submit">✅ Simpan Tier</button>
              </form>
            </div>
          )}

          {/* Tier Cards */}
          {myTiers.length === 0 ? (
            <div className="empty-state"><span className="icon">🎫</span><h3>Belum Ada Tier Membership</h3></div>
          ) : (
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
              {myTiers.map((t) => (
                <div key={t.id} className="card" style={{ borderTop: `4px solid ${t.color}`, padding: 20 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.name}</h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 8 }}>{t.description}</p>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: t.color }}>Rp {t.price.toLocaleString()}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12 }}>/ {t.duration_days} hari</div>
                  <div style={{ display: "flex", gap: 12, fontSize: "0.82rem", marginBottom: 12 }}>
                    <span>🎯 {t.max_bookings === 0 ? "Unlimited" : `${t.max_bookings}x`}</span>
                    <span>🏷️ {t.discount_percent}% off</span>
                    <span>👥 {t.active_members} member</span>
                  </div>
                  <button className="btn btn-sm btn-outline" style={{ color: "#e74c3c", borderColor: "rgba(231,76,60,0.3)" }}
                    onClick={async () => {
                      if (!confirm(`Hapus tier "${t.name}"?`)) return;
                      try { await api.deleteTier(t.id); loadMembers(); } catch (err) { setTierError(err.message); }
                    }}>
                    🗑️ Nonaktifkan
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Active Members */}
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>👥 Member Aktif ({members.length})</h3>
          {members.length === 0 ? (
            <div className="empty-state"><span className="icon">👥</span><h3>Belum Ada Member</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Customer</th><th>Email</th><th>Tier</th><th>Mulai</th><th>Selesai</th><th>Status</th><th>Used</th></tr></thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td><strong>{m.customer_name}</strong></td>
                      <td>{m.customer_email}</td>
                      <td><span style={{ color: m.color, fontWeight: 700 }}>{m.tier_name}</span></td>
                      <td>{m.start_date}</td>
                      <td>{m.end_date}</td>
                      <td><span className={m.status === "active" ? "badge badge-confirmed" : "badge badge-cancelled"}>{m.status}</span></td>
                      <td>{m.used_bookings}{m.max_bookings > 0 ? `/${m.max_bookings}` : ""}</td>
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
