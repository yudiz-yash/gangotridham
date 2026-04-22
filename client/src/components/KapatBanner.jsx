import { useEffect, useState } from 'react';
import { api } from '../api';

export default function KapatBanner() {
  const [kapat, setKapat] = useState(null);

  useEffect(() => {
    api.getKapat().then(setKapat).catch(() => {});
  }, []);

  if (!kapat) return null;

  return (
    <div className={`kapat-banner ${kapat.is_open ? 'kapat-banner--open' : ''}`}>
      <div className="kapat-banner__inner">
        <span className="kapat-banner__bell">🔔</span>
        <span className="kapat-banner__text">
          {kapat.announcement || (kapat.is_open
            ? `🟢 श्री गंगोत्री धाम के कपाट अभी खुले हैं${kapat.close_date ? ` — ${kapat.close_date} तक` : ''}`
            : 'श्री गंगोत्री धाम के कपाट शीतकाल के लिए बंद हैं'
          )}
        </span>
        <span className="kapat-banner__bell">🔔</span>
      </div>
    </div>
  );
}
