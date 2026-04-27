import { useEffect, useRef, useState } from 'react';
import { api } from '../../api';

const TABS = [
  { key: 'about',      label: '📖 About Dham' },
  { key: 'info_chips', label: '📌 Info Chips' },
  { key: 'nearby',     label: '🗺️ Nearby Places' },
  { key: 'rawal',      label: '🙏 Rawal Ji' },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── About Dham editor ── */
function AboutEditor({ data, onSave }) {
  const [paragraphs, setParagraphs] = useState(data.paragraphs || []);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (i, v) => setParagraphs(ps => ps.map((p, j) => j === i ? v : p));
  const add = () => setParagraphs(ps => [...ps, '']);
  const remove = (i) => setParagraphs(ps => ps.filter((_, j) => j !== i));
  const move = (i, dir) => {
    const arr = [...paragraphs];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setParagraphs(arr);
  };

  const submit = async () => {
    setSaving(true); setMsg('');
    try {
      await onSave('about', { paragraphs: paragraphs.filter(p => p.trim()) });
      setMsg('✅ About section saved!');
    } catch (e) { setMsg('❌ ' + e.message); } finally { setSaving(false); }
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--s5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>गंगोत्री धाम — परिचय अनुच्छेद</h3>
        <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
          {msg && <span style={{ fontSize: '0.85rem', color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{msg}</span>}
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {paragraphs.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 'var(--s4)', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>↑</button>
            <button className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === paragraphs.length - 1} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>↓</button>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 4, fontSize: '0.78rem', color: 'var(--t3)' }}>अनुच्छेद {i + 1}</div>
            <textarea
              className="form-textarea"
              style={{ fontFamily: 'var(--font-deva)', fontSize: '0.95rem', minHeight: 90, resize: 'vertical' }}
              value={p}
              onChange={e => set(i, e.target.value)}
              placeholder="अनुच्छेद यहाँ लिखें..."
            />
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => remove(i)} style={{ marginTop: 24, flexShrink: 0 }}>🗑</button>
        </div>
      ))}

      <button className="btn btn-outline btn-sm" onClick={add} style={{ marginTop: 'var(--s3)' }}>+ नया अनुच्छेद जोड़ें</button>
    </div>
  );
}

/* ── Info Chips editor ── */
function ChipsEditor({ data, onSave }) {
  const [chips, setChips] = useState(data.chips || []);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (i, k, v) => setChips(cs => cs.map((c, j) => j === i ? { ...c, [k]: v } : c));
  const add = () => setChips(cs => [...cs, { icon: '⭐', val: '', lbl: '' }]);
  const remove = (i) => setChips(cs => cs.filter((_, j) => j !== i));

  const submit = async () => {
    setSaving(true); setMsg('');
    try {
      await onSave('info_chips', { chips: chips.filter(c => c.val || c.lbl) });
      setMsg('✅ Info chips saved!');
    } catch (e) { setMsg('❌ ' + e.message); } finally { setSaving(false); }
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--s5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>मुख्य जानकारी चिप्स</h3>
        <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
          {msg && <span style={{ fontSize: '0.85rem', color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{msg}</span>}
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--s5)' }}>
        {chips.map((c, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r3)', padding: 'var(--s5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--t3)', fontWeight: 600 }}>Chip {i + 1}</span>
              <button className="btn btn-danger btn-sm" onClick={() => remove(i)} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>🗑 Remove</button>
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--s3)' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Icon (emoji)</label>
              <input className="form-input" value={c.icon} onChange={e => set(i, 'icon', e.target.value)} placeholder="⛰️" style={{ fontSize: '1.2rem' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--s3)' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Value</label>
              <input className="form-input" value={c.val} onChange={e => set(i, 'val', e.target.value)} placeholder="3140m" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Label (Hindi)</label>
              <input className="form-input" style={{ fontFamily: 'var(--font-deva)' }} value={c.lbl} onChange={e => set(i, 'lbl', e.target.value)} placeholder="समुद्रतल से ऊँचाई" />
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-outline btn-sm" onClick={add} style={{ marginTop: 'var(--s5)' }}>+ नई चिप जोड़ें</button>
    </div>
  );
}

/* ── Nearby Places editor ── */
function NearbyEditor({ data, onSave }) {
  const [places, setPlaces] = useState(data.places || []);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (i, v) => setPlaces(ps => ps.map((p, j) => j === i ? v : p));
  const add = () => setPlaces(ps => [...ps, '🏔️ ']);
  const remove = (i) => setPlaces(ps => ps.filter((_, j) => j !== i));

  const submit = async () => {
    setSaving(true); setMsg('');
    try {
      await onSave('nearby', { places: places.filter(p => p.trim()) });
      setMsg('✅ Nearby places saved!');
    } catch (e) { setMsg('❌ ' + e.message); } finally { setSaving(false); }
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--s5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>समीपवर्ती स्थान — Nearby Places</h3>
        <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
          {msg && <span style={{ fontSize: '0.85rem', color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{msg}</span>}
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--s3)' }}>
        {places.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
            <input
              className="form-input"
              style={{ fontFamily: 'var(--font-deva)', flex: 1 }}
              value={p}
              onChange={e => set(i, e.target.value)}
              placeholder="🏔️ स्थान का नाम"
            />
            <button className="btn btn-danger btn-sm" onClick={() => remove(i)}>🗑</button>
          </div>
        ))}
      </div>

      <button className="btn btn-outline btn-sm" onClick={add} style={{ marginTop: 'var(--s5)' }}>+ नया स्थान जोड़ें</button>

      <div style={{ marginTop: 'var(--s5)', padding: 'var(--s4)', background: 'var(--surface-2)', borderRadius: 'var(--r2)', fontSize: '0.8rem', color: 'var(--t3)' }}>
        💡 स्थान के नाम के साथ emoji भी जोड़ें — जैसे: 🏔️ हर्षिल, 🌊 भागीरथी
      </div>
    </div>
  );
}

/* ── Rawal Ji editor ── */
function RawalEditor({ data, onSave }) {
  const [form, setForm] = useState({
    name:      data.name      || '',
    title:     data.title     || '',
    photo:     data.photo     || '',
    bio_cards: data.bio_cards || [],
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCard = (i, k, v) => setForm(f => ({ ...f, bio_cards: f.bio_cards.map((c, j) => j === i ? { ...c, [k]: v } : c) }));
  const addCard = () => setForm(f => ({ ...f, bio_cards: [...f.bio_cards, { h: '', p: '' }] }));
  const removeCard = (i) => setForm(f => ({ ...f, bio_cards: f.bio_cards.filter((_, j) => j !== i) }));
  const moveCard = (i, dir) => {
    const arr = [...form.bio_cards];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setForm(f => ({ ...f, bio_cards: arr }));
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB.'); return; }
    try {
      const b64 = await fileToBase64(file);
      set('photo', b64);
    } catch { alert('Failed to read file.'); }
  };

  const submit = async () => {
    setSaving(true); setMsg('');
    try {
      await onSave('rawal', form);
      setMsg('✅ Rawal Ji section saved!');
    } catch (e) { setMsg('❌ ' + e.message); } finally { setSaving(false); }
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--s6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>परम पूज्य रावल जी महाराज</h3>
        <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
          {msg && <span style={{ fontSize: '0.85rem', color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{msg}</span>}
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Basic info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s5)', marginBottom: 'var(--s6)' }}>
        <div className="form-group">
          <label className="form-label">नाम (Hindi)</label>
          <input className="form-input" style={{ fontFamily: 'var(--font-deva)' }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="परम पूज्य शिवप्रकाश जी महाराज" />
        </div>
        <div className="form-group">
          <label className="form-label">पद / Title</label>
          <input className="form-input" style={{ fontFamily: 'var(--font-deva)' }} value={form.title} onChange={e => set('title', e.target.value)} placeholder="रावल — श्री गंगोत्री धाम" />
        </div>
      </div>

      {/* Photo */}
      <div style={{ marginBottom: 'var(--s7)' }}>
        <label className="form-label">फ़ोटो</label>
        <div style={{ display: 'flex', gap: 'var(--s6)', alignItems: 'flex-start' }}>
          <div
            style={{ width: 140, height: 170, border: '2px dashed var(--border-2)', borderRadius: 'var(--r2)', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)' }}
            onClick={() => fileRef.current?.click()}
          >
            {form.photo
              ? <img src={form.photo} alt="Rawal Ji" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '0.8rem', padding: 8 }}>Click to<br />upload photo</div>
            }
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--t3)', paddingTop: 'var(--s3)' }}>
            <div>• JPEG, PNG, WEBP — max 5 MB</div>
            <div style={{ marginTop: 4 }}>• फ़ोटो क्लिक करके बदलें</div>
            {form.photo && (
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--s4)', fontSize: '0.78rem' }} onClick={() => set('photo', '')}>
                🗑 Remove photo
              </button>
            )}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhoto} />
      </div>

      {/* Bio cards */}
      <div style={{ marginBottom: 'var(--s5)' }}>
        <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: 'var(--t2)', marginBottom: 'var(--s5)' }}>जीवन परिचय कार्ड्स</h4>
        {form.bio_cards.map((card, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r3)', padding: 'var(--s5)', marginBottom: 'var(--s4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s4)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--t3)', fontWeight: 600 }}>Card {i + 1}</span>
              <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => moveCard(i, -1)} disabled={i === 0} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>↑</button>
                <button className="btn btn-ghost btn-sm" onClick={() => moveCard(i, 1)} disabled={i === form.bio_cards.length - 1} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>↓</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeCard(i)} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>🗑 Remove</button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--s3)' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>शीर्षक (Heading)</label>
              <input className="form-input" style={{ fontFamily: 'var(--font-deva)' }} value={card.h} onChange={e => setCard(i, 'h', e.target.value)} placeholder="जैसे: जन्म एवं शिक्षा" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>विवरण (Description)</label>
              <textarea className="form-textarea" style={{ fontFamily: 'var(--font-deva)', minHeight: 90, resize: 'vertical' }} value={card.p} onChange={e => setCard(i, 'p', e.target.value)} placeholder="विवरण यहाँ लिखें..." />
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addCard}>+ नया कार्ड जोड़ें</button>
      </div>
    </div>
  );
}

/* ── Main ManageHomepage ── */
export default function ManageHomepage() {
  const [tab,     setTab]     = useState('about');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.getAllContent()
      .then(setContent)
      .catch(() => setError('Failed to load homepage content.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (section, data) => {
    const updated = await api.updateContent(section, data);
    setContent(c => ({ ...c, [section]: updated }));
  };

  if (loading) return <div className="spinner-center"><div className="spinner spinner-lg" /></div>;
  if (error)   return <div className="alert alert-error" style={{ margin: 'var(--s8)' }}>{error}</div>;

  return (
    <div>
      <div style={{ marginBottom: 'var(--s6)' }}>
        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Homepage Content</h2>
        <p style={{ color: 'var(--t3)', fontSize: '0.85rem', marginTop: 4 }}>होमपेज के सभी सेक्शन यहाँ से मैनेज करें। बदलाव तुरंत वेबसाइट पर दिखेंगे।</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--s2)', borderBottom: '2px solid var(--border)', marginBottom: 'var(--s7)', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: 'var(--s3) var(--s5)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? 'var(--primary)' : 'var(--t2)',
              borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -2,
              fontSize: '0.9rem',
              transition: 'color 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r3)', padding: 'var(--s7)' }}>
        {tab === 'about'      && <AboutEditor  data={content?.about      || {}} onSave={handleSave} />}
        {tab === 'info_chips' && <ChipsEditor  data={content?.info_chips || {}} onSave={handleSave} />}
        {tab === 'nearby'     && <NearbyEditor data={content?.nearby     || {}} onSave={handleSave} />}
        {tab === 'rawal'      && <RawalEditor  data={content?.rawal      || {}} onSave={handleSave} />}
      </div>
    </div>
  );
}
