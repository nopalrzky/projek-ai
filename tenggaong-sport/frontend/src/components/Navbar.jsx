import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  const links = {
    customer: [
      { to: "/customer", label: "Beranda", exact: true },
      { to: "/customer/bookings", label: "Booking Saya" },
    ],
    admin: [
      { to: "/admin", label: "Dashboard" },
    ],
    owner: [
      { to: "/owner", label: "Dashboard" },
    ],
    superadmin: [
      { to: "/superadmin", label: "Dashboard" },
    ],
  };

  const roleLabel = { customer: "Customer", admin: "Kasir", owner: "Bos", superadmin: "⭐ Superadmin" };

  return (
    <nav className="navbar">
      <Link to={user ? `/${user.role}` : "/"} className="navbar-brand">
        🏟️ Tenggaong Sport
      </Link>
      {user && (
        <div className="navbar-nav">
          {links[user.role]?.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={l.exact ? (loc.pathname === l.to ? "active" : "") : (loc.pathname.startsWith(l.to) ? "active" : "")}
            >
              {l.label}
            </Link>
          ))}
          <span className="user-badge">{roleLabel[user.role]}</span>
          <button onClick={logout}>Keluar</button>
        </div>
      )}
    </nav>
  );
}
