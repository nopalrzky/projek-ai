const BASE_URL = 'http://192.168.100.34:3001/api';

class ApiClient {
  constructor() {
    this.token = null;
    this.baseUrl = BASE_URL;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed (${response.status})`);
      }

      return data;
    } catch (error) {
      if (error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and server status.');
      }
      throw error;
    }
  }

  // ─── Auth ────────────────────────────────────────

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: data,
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  getOwners() {
    return this.request('/auth/owners');
  }

  // ─── Sports & Fields ──────────────────────────────

  getSports() {
    return this.request('/sports');
  }

  getFields(sportId) {
    return this.request(`/sports/${sportId}/fields`);
  }

  getMyFields() {
    return this.request('/sports/my/fields');
  }

  // ─── Bookings ─────────────────────────────────────

  createBooking(data) {
    return this.request('/bookings', {
      method: 'POST',
      body: data,
    });
  }

  getMyBookings() {
    return this.request('/bookings/my');
  }

  getAllBookings() {
    return this.request('/bookings/all');
  }

  getBookingByPin(pin) {
    return this.request(`/bookings/pin/${pin}`);
  }

  verifyPin(pin) {
    return this.request('/bookings/verify-pin', {
      method: 'POST',
      body: { pin },
    });
  }

  // ─── Membership ───────────────────────────────────

  getMembershipTiers() {
    return this.request('/membership/tiers');
  }

  subscribeMembership(tierId) {
    return this.request('/membership/subscribe', {
      method: 'POST',
      body: { tier_id: tierId },
    });
  }

  getMyMembership() {
    return this.request('/membership/my');
  }

  getMyTiers() {
    return this.request('/membership/my-tiers');
  }

  createMembershipTier(data) {
    return this.request('/membership/tiers', {
      method: 'POST',
      body: data,
    });
  }

  // ─── Admin ─────────────────────────────────────────

  getAdminStats() {
    return this.request('/admin/stats');
  }

  getAdminRevenue() {
    return this.request('/admin/revenue');
  }

  // ─── Superadmin ───────────────────────────────────

  superadmin(endpoint, options = {}) {
    return this.request(`/superadmin${endpoint}`, options);
  }

  getUsers(params = {}) {
    const query = params.query ? `?query=${encodeURIComponent(params.query)}` : '';
    return this.superadmin(`/users${query}`);
  }

  updateUserRole(userId, role) {
    return this.superadmin(`/users/${userId}/role`, {
      method: 'PUT',
      body: { role },
    });
  }

  deleteUser(userId) {
    return this.superadmin(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  getSystemStats() {
    return this.superadmin('/stats');
  }

  getAllBookingsAdmin(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.superadmin(`/bookings${qs ? '?' + qs : ''}`);
  }

  getSystemRevenue() {
    return this.superadmin('/revenue');
  }

  createOwner(data) {
    return this.superadmin('/create-owner', {
      method: 'POST',
      body: data,
    });
  }

  createKasir(data) {
    return this.superadmin('/create-kasir', {
      method: 'POST',
      body: data,
    });
  }
}

const api = new ApiClient();
export default api;
