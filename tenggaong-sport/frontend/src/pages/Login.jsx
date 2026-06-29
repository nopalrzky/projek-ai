import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
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
        <p className="subtitle">Masuk ke akun kamu</p>

        {error && (
          <div className="alert alert-error">
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📧 Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@tenggaong.com"
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
              placeholder="••••••"
              required
            />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Memproses...</> : "Masuk"}
          </button>
        </form>

        <div className="auth-links">
          Belum punya akun? <Link to="/register">Daftar Sekarang</Link>
        </div>

        {/* Quick Login — Demo Accounts */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 10 }}>
            🔑 Akses Cepat Demo
          </p>
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            {[
            {label: "👤 Customer", email: "customer@tenggaong.com" },
              { label: "🛡️ Kasir", email: "admin@tenggaong.com" },
              { label: "👑 Owner", email: "bos@tenggaong.com" },
              { label: "⭐ Superadmin", email: "superadmin@tenggaong.com" },
            ].map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="btn btn-outline"
                style={{ fontSize: "0.85rem", justifyContent: "flex-start", gap: 8 }}
                onClick={async () => {
                  setEmail(acc.email);
                  setPassword("123456");
                  setError("");
                  setLoading(true);
                  try {
                    const user = await login(acc.email, "123456");
                    navigate(`/${user.role}`);
                  } catch (err) {
                    setError(err.message);
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
