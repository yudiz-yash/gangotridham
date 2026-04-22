import { useEffect, useState } from 'react';
import { api } from '../../api';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

function DetailModal({ booking, onUpdate, onClose }) {
  const [status, setStatus] = useState(booking.status);
  const [notes,  setNotes]  = useState(booking.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const save = async () => {
    setSaving(true); setError('');
    try {
      const updated = await api.updateBooking(booking.id, { status, admin_notes: notes });
      onUpdate(updated);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3>Booking #{booking.id}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 'var(--s4)' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)', marginBottom: 'var(--s5)' }}>
            {[
              ['यजमान', booking.yajaman_name], ['Mobile', booking.mobile],
              ['Email', booking.email || '—'], ['गोत्र', booking.gotra || '—'],
              ['पूजा प्रकार', booking.puja_type], ['तिथि', booking.puja_date],
              ['उद्देश्य', booking.purpose || '—'], ['Submitted', new Date(booking.created_at).toLocaleDateString()],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 2 }}>{lbl}</div>
                <div style={{ fontFamily: 'var(--font-deva)', fontSize: '0.95rem', color: 'var(--t1)', fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>

          {booking.message && (
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r2)', padding: 'var(--s4)', marginBottom: 'var(--s5)', fontFamily: 'var(--font-deva)', fontSize: '0.9rem', color: 'var(--t2)', borderLeft: '3px solid var(--gold)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--t3)', marginBottom: 4 }}>MESSAGE</div>
              {booking.message}
            </div>
          )}

          <div className="divider" />

          <div className="form-group" style={{ marginBottom: 'var(--s4)' }}>
            <label className="form-label">Update Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Admin Notes</label>
            <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Update Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [filter,   setFilter]   = useState('all');
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const LIMIT = 15;

  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filter !== 'all') params.status = filter;
    api.getBookings(params)
      .then(d => { setBookings(d.bookings); setTotal(d.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [filter]);
  useEffect(load, [filter, page]);

  const onUpdate = (updated) => {
    setBookings(bs => bs.map(b => b.id === updated.id ? updated : b));
    setSelected(updated);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this booking?')) return;
    setDeleting(id);
    try { await api.deleteBooking(id); setBookings(bs => bs.filter(b => b.id !== id)); setTotal(t => t - 1); }
    catch (err) { alert(err.message); } finally { setDeleting(null); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="admin-section-head" style={{ marginBottom: 'var(--s5)' }}>
        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Puja Bookings <span style={{ color: 'var(--t3)', fontWeight: 400 }}>({total})</span></h2>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s5)', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner-center"><div className="spinner spinner-lg" /></div> : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>यजमान</th><th>पूजा प्रकार</th><th>तिथि</th><th>Mobile</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--t3)', padding: 'var(--s9)' }}>No bookings found.</td></tr>
                  : bookings.map(b => (
                    <tr key={b.id}>
                      <td className="td-muted">{b.id}</td>
                      <td><strong>{b.yajaman_name}</strong></td>
                      <td style={{ fontFamily: 'var(--font-deva)', fontSize: '0.85rem' }}>{b.puja_type}</td>
                      <td className="td-muted">{b.puja_date}</td>
                      <td className="td-muted">{b.mobile}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                      <td className="td-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(b)}>View</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)} disabled={deleting === b.id}>
                            {deleting === b.id ? '...' : '✕'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', gap: 'var(--s2)', justifyContent: 'center', marginTop: 'var(--s5)' }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ padding: '7px 14px', fontSize: '0.875rem', color: 'var(--t2)' }}>Page {page} of {pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {selected && <DetailModal booking={selected} onUpdate={onUpdate} onClose={() => setSelected(null)} />}
    </div>
  );
}
