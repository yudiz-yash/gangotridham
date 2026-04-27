import { useState } from 'react';
import { api } from '../api';

const PUJA_TYPES = [
  { emoji: '🪔', label: 'गंगा आरती' },
  { emoji: '🌺', label: 'श्री गंगा जी की पांच उपचार' },
  { emoji: '📿', label: 'सहस्त्रनाम पाठ' },
  { emoji: '🕉️', label: 'विभिन्न प्रकार की पूजा' },
  { emoji: '🙏', label: 'पूर्वजों के नाम से ब्राह्मण भंडारा' },
];
const PURPOSES = ['मनोकामना पूर्ति', 'पितृ शांति', 'स्वास्थ्य लाभ', 'विवाह', 'व्यापार वृद्धि', 'अन्य'];

const today = new Date().toISOString().split('T')[0];

export default function Booking() {
  const [selectedPuja, setSelectedPuja] = useState(PUJA_TYPES[0].label);
  const [form, setForm] = useState({ yajaman_name: '', mobile: '', email: '', puja_date: '', gotra: '', purpose: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.yajaman_name.trim()) e.yajaman_name = 'नाम आवश्यक है';
    if (!form.mobile.trim()) e.mobile = 'मोबाइल नंबर आवश्यक है';
    else if (!/^[+\d\s\-]{10,15}$/.test(form.mobile)) e.mobile = 'अमान्य मोबाइल नंबर';
    if (!form.puja_date) e.puja_date = 'तिथि चुनें';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      await api.submitBooking({ ...form, puja_type: selectedPuja });
      setSuccess(true);
      setForm({ yajaman_name: '', mobile: '', email: '', puja_date: '', gotra: '', purpose: '', message: '' });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 'var(--s10)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--s4)' }}>🙏</div>
          <h2 style={{ fontFamily: 'var(--font-deva)', fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: 'var(--s4)' }}>बुकिंग सफल!</h2>
          <p style={{ fontFamily: 'var(--font-deva)', color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--s6)' }}>
            आपकी बुकिंग प्राप्त हो गई।<br />रावल जी के प्रतिनिधि शीघ्र संपर्क करेंगे।<br /><strong style={{ color: 'var(--primary)' }}>जय गंगा मैया 🙏</strong>
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setSuccess(false)}>नई बुकिंग करें</button>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <div className="sec-head">
          <h2 className="sec-head__en">Visheşht Puja Booking</h2>
          <span className="sec-head__hi">विशेष पूजा बुकिंग</span>
          <div className="sec-head__bar" />
        </div>

        <div className="booking-wrap">
          <div className="card" style={{ padding: 'var(--s8)' }}>
            {apiError && <div className="alert alert-error" style={{ marginBottom: 'var(--s5)' }}>{apiError}</div>}

            <h3 style={{ fontFamily: 'var(--font-deva)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--t2)', marginBottom: 'var(--s4)' }}>
              पूजा का प्रकार चुनें
            </h3>
            <div className="puja-type-grid" style={{ marginBottom: 'var(--s7)' }}>
              {PUJA_TYPES.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className={`puja-type-btn ${selectedPuja === p.label ? 'selected' : ''}`}
                  onClick={() => setSelectedPuja(p.label)}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} noValidate>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">यजमान का नाम *</label>
                  <input className={`form-input ${errors.yajaman_name ? 'error' : ''}`} placeholder="पूरा नाम लिखें" value={form.yajaman_name} onChange={e => set('yajaman_name', e.target.value)} />
                  {errors.yajaman_name && <span className="form-error">{errors.yajaman_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">मोबाइल नंबर *</label>
                  <input className={`form-input ${errors.mobile ? 'error' : ''}`} placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                  {errors.mobile && <span className="form-error">{errors.mobile}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">ईमेल</label>
                  <input type="email" className="form-input" placeholder="आपका ईमेल" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">पूजा की तिथि *</label>
                  <input type="date" className={`form-input ${errors.puja_date ? 'error' : ''}`} min={today} value={form.puja_date} onChange={e => set('puja_date', e.target.value)} />
                  {errors.puja_date && <span className="form-error">{errors.puja_date}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">गोत्र</label>
                  <input className="form-input" placeholder="आपका गोत्र" value={form.gotra} onChange={e => set('gotra', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">पूजा का उद्देश्य</label>
                  <select className="form-select" value={form.purpose} onChange={e => set('purpose', e.target.value)}>
                    <option value="">-- उद्देश्य चुनें --</option>
                    {PURPOSES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">विशेष संदेश</label>
                  <textarea className="form-textarea" placeholder="कोई विशेष संदेश या इच्छा..." value={form.message} onChange={e => set('message', e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 'var(--s4)' }} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> &nbsp;भेज रहे हैं...</> : 'पूजा बुकिंग करें 🙏'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
