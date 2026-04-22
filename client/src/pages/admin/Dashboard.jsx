import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

export default function Dashboard() {
  const [stats,    setStats]    = useState(null);
  const [kapat,    setKapat]    = useState(null);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.getBookingStats(),
      api.getKapat(),
      api.getBookings({ limit: 5 }),
      api.getMessages(),
    ]).then(([s, k, b, m]) => {
      setStats(s); setKapat(k);
      setBookings(b.bookings || []);
      setMessages((m || []).slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-center"><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div className="admin-section-head" style={{ marginBottom: 'var(--s7)' }}>
        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Dashboard</h2>
        <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
          <span className={`badge ${kapat?.is_open ? 'badge-kapat-open' : 'badge-kapat-closed'}`}>
            {kapat?.is_open ? '🟢 Kapat Open' : '🔴 Kapat Closed'}
          </span>
          <Link to="/admin/kapat" className="btn btn-sm btn-outline">Manage Kapat</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-cards">
        <div className="card stat-card stat-card--primary">
          <div className="stat-card__label">Total Bookings</div>
          <div className="stat-card__value">{stats?.total ?? 0}</div>
          <div className="stat-card__sub">All time</div>
        </div>
        <div className="card stat-card stat-card--gold">
          <div className="stat-card__label">Pending</div>
          <div className="stat-card__value">{stats?.pending ?? 0}</div>
          <div className="stat-card__sub">Awaiting confirmation</div>
        </div>
        <div className="card stat-card stat-card--success">
          <div className="stat-card__label">Confirmed</div>
          <div className="stat-card__value">{stats?.confirmed ?? 0}</div>
          <div className="stat-card__sub">Ready</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Completed</div>
          <div className="stat-card__value">{stats?.completed ?? 0}</div>
          <div className="stat-card__sub">Done</div>
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s6)' }}>
        <div>
          <div className="admin-section-head">
            <h2>Recent Bookings</h2>
            <Link to="/admin/bookings" className="btn btn-sm btn-ghost">View all →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Yajaman</th><th>Puja</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.length === 0
                  ? <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--t3)', padding: 'var(--s7)' }}>No bookings yet</td></tr>
                  : bookings.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.yajaman_name}</strong><div className="td-muted">{b.mobile}</div></td>
                      <td style={{ fontFamily: 'var(--font-deva)', fontSize: '0.82rem' }}>{b.puja_type}</td>
                      <td className="td-muted">{b.puja_date}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="admin-section-head">
            <h2>Recent Messages</h2>
            <Link to="/admin/contact" className="btn btn-sm btn-ghost">View all →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Mobile</th><th>Status</th></tr></thead>
              <tbody>
                {messages.length === 0
                  ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--t3)', padding: 'var(--s7)' }}>No messages yet</td></tr>
                  : messages.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong><div className="td-muted" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</div></td>
                      <td className="td-muted">{m.mobile}</td>
                      <td><span className={`badge badge-${m.status}`}>{m.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
