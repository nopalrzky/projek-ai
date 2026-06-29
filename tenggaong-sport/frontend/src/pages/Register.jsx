import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/index.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("customer");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin") {
      api.getOwners().then(setOwners).catch(() => {});
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.register({
        name,
        email,
        password,
        phone: phone || undefined,
        role,
        owner_email: role === "admin" ? ownerEmail : undefined,
      });
      login(data.token, data.user);
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-icon">🏟️</div>
        <h1>Tenggaong Sport</h1>
        <p className="subtitle">Daftar akun baru</p>

        {error && (
          <div className="alert alert-error">
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div className="form-group">
            <label>🎯 Daftar Sebagai</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { key: "customer", label: "👤 Customer" },
                { key: "owner", label: "👑 Owner" },
                { key: "admin", label: "🛡️ Kasir" },
              ].map((r) => (
                <div
                  key={r.key}
                  className={`btn btn-sm ${role === r.key ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setRole(r.key)}
                  style={{ cursor: "pointer", flex: 1, textAlign: "center" }}
                >
                  {r.label}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>👤 Nama</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              required
            />
          </div>
          <div className="form-group">
            <label>📧 Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              required
            />
          </div>
          <div className="form-group">
            <label>🔒 Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>📱 No. WhatsApp (opsional)</label>
            <input
              className="form-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812xxxxxx"
            />
          </div>

          {/* Owner picker for admin */}
          {role === "admin" && (
            <div className="form-group">
              <label>🏪 Pilih Owner</label>
              {owners.length > 0 ? (
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                  {owners.map((o) => (
                    <div
                      key={o.id}
                      className={`btn btn-sm ${ownerEmail === o.email ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setOwnerEmail(o.email)}
                      style={{ cursor: "pointer", textAlign: "left", justifyContent: "flex-start", gap: 8 }}
                    >
                      👑 {o.name} ({o.email})
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Belum ada owner terdaftar. Hubungi admin.
                </p>
              )}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={loading || (role === "admin" && !ownerEmail)}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18 }} /> Mendaftarkan...</>
            ) : (
              "Daftar"
            )}
          </button>
        </form>

        <div className="auth-links">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </div>
      </div>
    </div>
  );
}
