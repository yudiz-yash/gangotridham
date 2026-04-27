import { useState } from 'react';
import { api } from '../api';

const CONTACTS = [
  { icon: '📍', label: 'पता', val: 'श्री गंगोत्री धाम, उत्तरकाशी, उत्तराखंड — 249193' },
  { icon: '📞', label: 'फ़ोन', val: '+91-9411174750' },
  { icon: '✉️', label: 'ईमेल', val: 'rawalshivprakashjimaharaj@yahoo.com' },
  { icon: '🕐', label: 'मंदिर समय', val: 'प्रातः 6:00 — सायं 8:00 (ग्रीष्मकाल)' },
  { icon: '🔔', label: 'कपाट अवधि', val: 'अक्षय तृतीया से दीपावली+1 (अप्रैल/मई — अक्टूबर/नवंबर)' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', mobile: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'नाम आवश्यक है';
    if (!form.mobile.trim())  e.mobile  = 'मोबाइल आवश्यक है';
    else if (!/^[+\d\s\-]{10,15}$/.test(form.mobile)) e.mobile = 'अमान्य मोबाइल';
    if (!form.message.trim()) e.message = 'संदेश आवश्यक है';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      await api.submitContact(form);
      setSent(true);
      setForm({ name: '', mobile: '', message: '' });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ background: 'var(--bg)', minHeight: '70vh' }}>
      <div className="container">
        <div className="sec-head">
          <h2 className="sec-head__en">Contact Us</h2>
          <span className="sec-head__hi">संपर्क करें</span>
          <div className="sec-head__bar" />
        </div>
        <div className="contact-layout">
          <div className="contact-info">
            <h3>संपर्क जानकारी</h3>
            {CONTACTS.map(c => (
              <div key={c.label} className="contact-item">
                <div className="contact-item__icon">{c.icon}</div>
                <div className="contact-item__text">
                  <strong>{c.label}</strong>
                  <span>{c.val}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 'var(--s7)' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', color: 'var(--primary-dark)', marginBottom: 'var(--s6)' }}>संदेश भेजें</h3>
            {sent ? (
              <div className="alert alert-success">
                📨 आपका संदेश प्राप्त हो गया। हम शीघ्र आपसे संपर्क करेंगे। जय गंगा मैया 🙏
                <button className="btn btn-sm btn-ghost" style={{ marginLeft: 12 }} onClick={() => setSent(false)}>नया संदेश</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                {apiError && <div className="alert alert-error" style={{ marginBottom: 'var(--s4)' }}>{apiError}</div>}
                <div className="form-group" style={{ marginBottom: 'var(--s5)' }}>
                  <label className="form-label">आपका नाम *</label>
                  <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="पूरा नाम" value={form.name} onChange={e => set('name', e.target.value)} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--s5)' }}>
                  <label className="form-label">मोबाइल नंबर *</label>
                  <input className={`form-input ${errors.mobile ? 'error' : ''}`} placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                  {errors.mobile && <span className="form-error">{errors.mobile}</span>}
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--s6)' }}>
                  <label className="form-label">संदेश *</label>
                  <textarea className={`form-textarea ${errors.message ? 'error' : ''}`} placeholder="आपका संदेश यहाँ लिखें..." style={{ minHeight: 130 }} value={form.message} onChange={e => set('message', e.target.value)} />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                  {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />&nbsp;भेज रहे हैं...</> : 'संदेश भेजें 📨'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
