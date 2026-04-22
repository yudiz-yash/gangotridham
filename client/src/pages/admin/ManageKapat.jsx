import { useEffect, useState } from 'react';
import { api } from '../../api';

export default function ManageKapat() {
  const [kapat,   setKapat]   = useState(null);
  const [form,    setForm]    = useState({ is_open: false, open_date: '', close_date: '', announcement: '' });
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getKapat().then(k => {
      setKapat(k);
      setForm({ is_open: !!k.is_open, open_date: k.open_date || '', close_date: k.close_date || '', announcement: k.announcement || '' });
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const updated = await api.updateKapat(form);
      setKapat(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-center"><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div className="admin-section-head" style={{ marginBottom: 'var(--s7)' }}>
        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Kapat Status Management</h2>
        <span className={`badge ${form.is_open ? 'badge-kapat-open' : 'badge-kapat-closed'}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
          {form.is_open ? '🟢 Currently Open' : '🔴 Currently Closed'}
        </span>
      </div>

      <div className="card kapat-toggle-wrap" style={{ padding: 'var(--s8)' }}>
        {error  && <div className="alert alert-error"  style={{ marginBottom: 'var(--s5)' }}>{error}</div>}
        {saved  && <div className="alert alert-success" style={{ marginBottom: 'var(--s5)' }}>✅ Kapat status updated successfully!</div>}

        <form onSubmit={save}>
          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s5)', padding: 'var(--s6)', background: form.is_open ? 'var(--success-bg)' : 'var(--error-bg)', borderRadius: 'var(--r3)', marginBottom: 'var(--s7)', border: `1.5px solid ${form.is_open ? '#BBF7D0' : '#FECACA'}` }}>
            <label className="toggle-switch">
              <input type="checkbox" checked={form.is_open} onChange={e => setForm(f => ({ ...f, is_open: e.target.checked }))} />
              <span className="toggle-slider" />
            </label>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: form.is_open ? 'var(--success)' : 'var(--error)' }}>
                {form.is_open ? '🟢 Kapat is OPEN' : '🔴 Kapat is CLOSED'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--t3)', marginTop: 2 }}>
                Toggle to {form.is_open ? 'close' : 'open'} the kapat
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="form-grid-2" style={{ marginBottom: 'var(--s6)' }}>
            <div className="form-group">
              <label className="form-label">Kapat Opening Date</label>
              <input type="date" className="form-input" value={form.open_date} onChange={e => setForm(f => ({ ...f, open_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Kapat Closing Date</label>
              <input type="date" className="form-input" value={form.close_date} onChange={e => setForm(f => ({ ...f, close_date: e.target.value }))} />
            </div>
          </div>

          {/* Announcement */}
          <div className="form-group" style={{ marginBottom: 'var(--s7)' }}>
            <label className="form-label">Banner Announcement (Hindi)</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 100, fontFamily: 'var(--font-deva)' }}
              placeholder="श्री गंगोत्री धाम के कपाट अक्षय तृतीया को खुलेंगे..."
              value={form.announcement}
              onChange={e => setForm(f => ({ ...f, announcement: e.target.value }))}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>This text appears in the top announcement banner on the website.</span>
          </div>

          {/* Preview */}
          {form.announcement && (
            <div style={{ marginBottom: 'var(--s7)' }}>
              <div className="form-label" style={{ marginBottom: 'var(--s2)' }}>Banner Preview</div>
              <div className={`kapat-banner ${form.is_open ? 'kapat-banner--open' : ''}`} style={{ borderRadius: 'var(--r2)' }}>
                <div className="kapat-banner__inner">
                  <span className="kapat-banner__bell">🔔</span>
                  <span className="kapat-banner__text">{form.announcement}</span>
                  <span className="kapat-banner__bell">🔔</span>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />&nbsp;Saving...</> : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
