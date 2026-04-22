import { useEffect, useState } from 'react';
import { api } from '../../api';

function MessageModal({ msg, onUpdate, onClose }) {
  const markRead = async () => {
    try {
      await api.updateMessage(msg.id, { status: msg.status === 'read' ? 'unread' : 'read' });
      onUpdate(msg.id, msg.status === 'read' ? 'unread' : 'read');
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3>Message from {msg.name}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)', marginBottom: 'var(--s5)' }}>
            {[['Name', msg.name], ['Mobile', msg.mobile], ['Received', new Date(msg.created_at).toLocaleString()]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
                <div style={{ fontWeight: 500, color: 'var(--t1)' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--r2)', padding: 'var(--s5)', fontFamily: 'var(--font-deva)', lineHeight: 1.8, borderLeft: '3px solid var(--primary)' }}>
            {msg.message}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-outline btn-sm" onClick={markRead}>
            Mark as {msg.status === 'read' ? 'Unread' : 'Read'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageContact() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    api.getMessages().then(setMessages).catch(console.error).finally(() => setLoading(false));
  }, []);

  const onUpdate = (id, status) => {
    setMessages(ms => ms.map(m => m.id === id ? { ...m, status } : m));
    setSelected(s => s?.id === id ? { ...s, status } : s);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    setDeleting(id);
    try { await api.deleteMessage(id); setMessages(ms => ms.filter(m => m.id !== id)); }
    catch (err) { alert(err.message); } finally { setDeleting(null); }
  };

  const handleOpen = async (msg) => {
    setSelected(msg);
    if (msg.status === 'unread') {
      try {
        await api.updateMessage(msg.id, { status: 'read' });
        onUpdate(msg.id, 'read');
      } catch {}
    }
  };

  const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter);
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div>
      <div className="admin-section-head" style={{ marginBottom: 'var(--s5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
          <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Contact Messages</h2>
          {unreadCount > 0 && <span className="badge badge-unread">{unreadCount} unread</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s5)' }}>
        {['all', 'unread', 'read'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner-center"><div className="spinner spinner-lg" /></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Mobile</th><th>Message</th><th>Status</th><th>Received</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--t3)', padding: 'var(--s9)' }}>No messages.</td></tr>
                : filtered.map(m => (
                  <tr key={m.id} style={{ cursor: 'pointer', fontWeight: m.status === 'unread' ? 600 : 400 }} onClick={() => handleOpen(m)}>
                    <td><strong>{m.name}</strong></td>
                    <td className="td-muted">{m.mobile}</td>
                    <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-deva)', fontSize: '0.88rem', color: 'var(--t2)' }}>{m.message}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <span className={`badge badge-${m.status}`}>{m.status}</span>
                    </td>
                    <td className="td-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)} disabled={deleting === m.id}>
                        {deleting === m.id ? '...' : '✕'}
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {selected && <MessageModal msg={selected} onUpdate={onUpdate} onClose={() => setSelected(null)} />}
    </div>
  );
}
