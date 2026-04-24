const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getToken() {
  return localStorage.getItem('gd_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Public
  getKapat:   () => request('/kapat'),
  getEvents:  () => request('/events'),
  submitBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  submitContact: (body) => request('/contact',  { method: 'POST', body: JSON.stringify(body) }),

  // Auth
  login:          (body) => request('/auth/login',           { method: 'POST', body: JSON.stringify(body) }),
  getMe:          ()     => request('/auth/me'),
  changePassword: (body) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),

  // Admin — events
  getAllEvents:   ()       => request('/events/all'),
  createEvent:   (body)   => request('/events',       { method: 'POST',   body: JSON.stringify(body) }),
  updateEvent:   (id, body)=> request(`/events/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteEvent:   (id)     => request(`/events/${id}`, { method: 'DELETE' }),

  // Admin — bookings
  getBookings:    (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/bookings${q ? '?' + q : ''}`);
  },
  getBookingStats: ()          => request('/bookings/stats/summary'),
  updateBooking:  (id, body)   => request(`/bookings/${id}`, { method: 'PATCH',  body: JSON.stringify(body) }),
  deleteBooking:  (id)         => request(`/bookings/${id}`, { method: 'DELETE' }),

  // Admin — kapat
  updateKapat: (body) => request('/kapat', { method: 'PUT', body: JSON.stringify(body) }),

  // Admin — contact
  getMessages:   ()     => request('/contact'),
  updateMessage: (id, body) => request(`/contact/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMessage: (id)   => request(`/contact/${id}`, { method: 'DELETE' }),
};
