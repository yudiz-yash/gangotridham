import { useEffect, useState } from 'react';
import { api } from '../api';

const TYPE_LABELS = { kapat: 'कपाट', festival: 'उत्सव', yatra: 'यात्रा', event: 'कार्यक्रम' };
const TYPE_COLORS = { kapat: '#E07B39', festival: '#D4A017', yatra: '#2563EB', event: '#5C3317' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Events() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section" style={{ minHeight: '60vh' }}>
      <div className="container">
        <div className="sec-head">
          <h2 className="sec-head__en">Events &amp; News</h2>
          <span className="sec-head__hi">आगामी कार्यक्रम एवं समाचार</span>
          <div className="sec-head__bar" />
        </div>

        {loading ? (
          <div className="spinner-center"><div className="spinner spinner-lg" /></div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--t3)', padding: 'var(--s10) 0', fontFamily: 'var(--font-deva)' }}>
            कोई कार्यक्रम उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="events-grid">
            {events.map(ev => (
              <div key={ev.id} className={`card card-hover event-card ${ev.is_featured ? 'event-card--featured' : ''}`}>
                <div className={`event-date-block ${ev.is_featured ? 'event-date-block--gold' : 'event-date-block--primary'}`}>
                  <div className="event-date-block__icon">{ev.is_featured ? '⭐' : '📅'}</div>
                  <div className="event-date-block__month">{new Date(ev.event_date + 'T00:00:00').toLocaleString('en', { month: 'short' })}</div>
                  <div className="event-date-block__year">{new Date(ev.event_date + 'T00:00:00').getFullYear()}</div>
                </div>
                <div className="event-info">
                  {ev.is_featured && (
                    <span className="badge badge-warning event-info__badge">⭐ मुख्य आयोजन</span>
                  )}
                  <span
                    className="badge event-info__badge"
                    style={{ background: `${TYPE_COLORS[ev.event_type] || '#5C3317'}22`, color: TYPE_COLORS[ev.event_type] || '#5C3317', marginLeft: ev.is_featured ? 4 : 0 }}
                  >
                    {TYPE_LABELS[ev.event_type] || ev.event_type}
                  </span>
                  <h3>{ev.title_hindi || ev.title}</h3>
                  <div className="event-info__en">{ev.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--t3)', marginBottom: 6 }}>📅 {formatDate(ev.event_date)}</div>
                  {ev.description_hindi && <p>{ev.description_hindi}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
