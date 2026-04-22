import { useEffect, useState } from 'react';
import { api } from '../../api';

const TYPES = ['event', 'kapat', 'festival', 'yatra'];
const TYPE_LABELS = { kapat: 'कपाट', festival: 'उत्सव', yatra: 'यात्रा', event: 'कार्यक्रम' };

const EMPTY = { title: '', title_hindi: '', description: '', description_hindi: '', event_date: '', event_type: 'event', is_featured: false, is_published: true };

function EventModal({ event, onSave, onClose }) {
  const [form, setForm] = useState(event ? { ...event, is_featured: !!event.is_featured, is_published: !!event.is_published } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.event_date) { setError('Title and date are required'); return; }
    setSaving(true); setError('');
    try {
      const saved = event ? await api.updateEvent(event.id, form) : await api.createEvent(form);
      onSave(saved, !!event);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{event ? 'Edit Event' : 'New Event'}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 'var(--s5)' }}>{error}</div>}
          <form id="ev-form" onSubmit={submit}>
            <div className="form-grid-2">
              <div className="form-group full">
                <label className="form-label">Title (English) *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Event title" />
              </div>
              <div className="form-group full">
                <label className="form-label">शीर्षक (Hindi)</label>
                <input className="form-input" style={{ fontFamily: 'var(--font-deva)' }} value={form.title_hindi} onChange={e => set('title_hindi', e.target.value)} placeholder="हिंदी शीर्षक" />
              </div>
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input type="date" className="form-input" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.event_type} onChange={e => set('event_type', e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t] || t} ({t})</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Description (English)</label>
                <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description..." />
              </div>
              <div className="form-group full">
                <label className="form-label">विवरण (Hindi)</label>
                <textarea className="form-textarea" style={{ fontFamily: 'var(--font-deva)' }} value={form.description_hindi} onChange={e => set('description_hindi', e.target.value)} placeholder="हिंदी विवरण..." />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--s3)' }}>
                <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
                <label htmlFor="is_featured" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>⭐ Featured event</label>
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--s3)' }}>
                <input type="checkbox" id="is_published" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} />
                <label htmlFor="is_published" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>🌐 Published (visible on website)</label>
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="ev-form" type="submit" disabled={saving}>
            {saving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageEvents() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | 'new' | event obj
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    api.getAllEvents().then(setEvents).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onSave = (saved, isUpdate) => {
    setEvents(ev => isUpdate ? ev.map(e => e.id === saved.id ? saved : e) : [saved, ...ev]);
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    setDeleting(id);
    try { await api.deleteEvent(id); setEvents(ev => ev.filter(e => e.id !== id)); }
    catch (err) { alert(err.message); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="admin-section-head" style={{ marginBottom: 'var(--s6)' }}>
        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Events &amp; News</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('new')}>+ New Event</button>
      </div>

      {loading ? <div className="spinner-center"><div className="spinner spinner-lg" /></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Hindi Title</th><th>Date</th><th>Type</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--t3)', padding: 'var(--s9)' }}>No events. Create one!</td></tr>
                : events.map(ev => (
                  <tr key={ev.id}>
                    <td>
                      <strong>{ev.title}</strong>
                      {ev.is_featured ? <span className="badge badge-warning" style={{ marginLeft: 6 }}>⭐</span> : null}
                    </td>
                    <td style={{ fontFamily: 'var(--font-deva)', fontSize: '0.88rem' }}>{ev.title_hindi || '—'}</td>
                    <td className="td-muted">{ev.event_date}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                        {TYPE_LABELS[ev.event_type] || ev.event_type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ev.is_published ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {ev.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(ev)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)} disabled={deleting === ev.id}>
                          {deleting === ev.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <EventModal
          event={modal === 'new' ? null : modal}
          onSave={onSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
