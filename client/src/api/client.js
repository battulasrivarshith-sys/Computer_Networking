// Base API URL. In dev, requests are proxied to the backend by Vite (see vite.config.js).
const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/api/auth/me', { token }),

  listPasswords: (token, search = '') =>
    request(`/api/passwords${search ? `?search=${encodeURIComponent(search)}` : ''}`, { token }),
  createPassword: (token, payload) =>
    request('/api/passwords', { method: 'POST', body: payload, token }),
  updatePassword: (token, id, payload) =>
    request(`/api/passwords/${id}`, { method: 'PUT', body: payload, token }),
  deletePassword: (token, id) =>
    request(`/api/passwords/${id}`, { method: 'DELETE', token }),

  // Admin-only endpoint (role-based access)
  adminStats: (token) => request('/api/passwords/admin/stats', { token }),
};
