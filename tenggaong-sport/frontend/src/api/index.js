const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request gagal");
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getOwners: () => request("/auth/owners"),
  me: () => request("/auth/me"),

  // Sports
  getSports: () => request("/sports"),
  getFields: (sportId) => request(`/sports/${sportId}/fields`),
  createSport: (data) =>
    request("/sports", { method: "POST", body: JSON.stringify(data) }),
  createField: (sportId, data) =>
    request(`/sports/${sportId}/fields`, { method: "POST", body: JSON.stringify(data) }),
  getMyFields: () => request("/sports/my/fields"),
  updateField: (id, data) =>
    request(`/sports/fields/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteField: (id) =>
    request(`/sports/fields/${id}`, { method: "DELETE" }),

  // Bookings
  createBooking: (data) =>
    request("/bookings", { method: "POST", body: JSON.stringify(data) }),
  manualBooking: (data) =>
    request("/bookings/manual", { method: "POST", body: JSON.stringify(data) }),
  getMyBookings: () => request("/bookings/my"),
  getAllBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/bookings/all${q ? "?" + q : ""}`);
  },
  getBooking: (id) => request(`/bookings/${id}`),
  verifyBooking: (id, action) =>
    request(`/bookings/${id}/verify`, { method: "PUT", body: JSON.stringify({ action }) }),

  // Admin: PIN verification
  getBookingByPin: (pin) => request(`/bookings/pin/${pin}`),
  verifyPin: (pin) =>
    request("/bookings/verify-pin", { method: "POST", body: JSON.stringify({ pin }) }),

  // Admin / Owner
  getRevenue: (period = "daily") => request(`/admin/revenue?period=${period}`),
  getCustomers: () => request("/admin/customers"),
  getStats: () => request("/admin/stats"),

  // Superadmin
  superadminStats: () => request("/superadmin/stats"),
  superadminUsers: () => request("/superadmin/users"),
  superadminOwnerAdmins: () => request("/superadmin/owner-admins"),
  superadminRevenue: (period = "daily") => request(`/superadmin/revenue?period=${period}`),
  superadminBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/superadmin/bookings${q ? "?" + q : ""}`);
  },

  // Export
  exportBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    window.open(`/api/export/bookings?${q}&token=${encodeURIComponent(getToken())}`);
  },
  exportRevenue: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    window.open(`/api/export/revenue?${q}&token=${encodeURIComponent(getToken())}`);
  },
  exportUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    window.open(`/api/export/users?${q}&token=${encodeURIComponent(getToken())}`);
  },

  // Membership
  getTiers: (owner_id) => request(`/membership/tiers?owner_id=${owner_id}`),
  getMyTiers: () => request("/membership/my-tiers"),
  createTier: (data) => request("/membership/tiers", { method: "POST", body: JSON.stringify(data) }),
  updateTier: (id, data) => request(`/membership/tiers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTier: (id) => request(`/membership/tiers/${id}`, { method: "DELETE" }),
  subscribeMembership: (tier_id) => request("/membership/subscribe", { method: "POST", body: JSON.stringify({ tier_id }) }),
  getMyMemberships: () => request("/membership/my"),
  getMembers: () => request("/membership/members"),

  // Recurring
  createRecurring: (data) => request("/membership/recurring", { method: "POST", body: JSON.stringify(data) }),
  getMyRecurring: () => request("/membership/recurring"),
};
