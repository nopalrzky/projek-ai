import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import BookField from "./pages/BookField.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import CustomerMembership from "./pages/CustomerMembership.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role))
    return <Navigate to={`/${user.role}`} />;
  return children;
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="container">{children}</div>
    </>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      {/* Customer routes */}
      <Route path="/customer" element={
        <ProtectedRoute roles={["customer"]}>
          <AppLayout><CustomerDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/customer/book/:fieldId" element={
        <ProtectedRoute roles={["customer"]}>
          <AppLayout><BookField /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/customer/bookings" element={
        <ProtectedRoute roles={["customer"]}>
          <AppLayout><MyBookings /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/customer/membership" element={
        <ProtectedRoute roles={["customer"]}>
          <AppLayout><CustomerMembership /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={["admin"]}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Owner routes */}
      <Route path="/owner" element={
        <ProtectedRoute roles={["owner"]}>
          <AppLayout><OwnerDashboard /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Superadmin routes */}
      <Route path="/superadmin" element={
        <ProtectedRoute roles={["superadmin"]}>
          <AppLayout><SuperAdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
