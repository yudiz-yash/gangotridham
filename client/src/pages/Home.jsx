import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import banner1 from '../assets/home-banner.jpg';
import banner2 from '../assets/home-banner-2.jpg';
import banner3 from '../assets/home-banner-3.jpg';
import rawalPhoto from '../assets/shivprakashji.jpeg';

const BANNERS = [banner1, banner2, banner3];

/* ── Intersection observer for fade-in ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; obs.disconnect(); }
    }, { threshold: 0.1 });
    el.style.opacity = '0'; el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const INFO = [
  { icon: '⛰️', val: '3140m', lbl: 'समुद्रतल से ऊँचाई' },
  { icon: '🛣️', val: '100 km', lbl: 'उत्तरकाशी से दूरी' },
  { icon: '🔔', val: 'अक्षय तृतीया', lbl: 'कपाट खुलने का पर्व' },
  { icon: '🥾', val: '18 km', lbl: 'गोमुख ट्रेकिंग' },
];
const NEARBY = ['🏔️ हर्षिल', '🏔️ गोमुख', '🌿 दयारा बुग्याल', '🏞️ डोडीताल', '🗺️ नेलांग घाटी', '🛕 मुखबा गाँव', '⛺ केदार ताल', '🌊 भागीरथी'];
const GALLERY = [
  { icon: '🛕', caption: 'गंगोत्री मंदिर' }, { icon: '🔔', caption: 'कपाट उद्घाटन' },
  { icon: '🪔', caption: 'गंगाजल कलश यात्रा' }, { icon: '🕉️', caption: 'पशुपतिनाथ जलाभिषेक' },
  { icon: '🙏', caption: 'रावल जी दर्शन' }, { icon: '🏔️', caption: 'हिमालय दृश्य' },
  { icon: '🥾', caption: 'गोमुख यात्रा' }, { icon: '🌿', caption: 'हर्षिल घाटी' },
];

export default function Home() {
  const [kapat, setKapat] = useState(null);
  const [slide, setSlide] = useState(0);
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal();

  useEffect(() => { api.getKapat().then(setKapat).catch(() => {}); }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ── Hero / Banner Slider ── */}
      <section className="hero" id="home" style={{ background: 'none', backgroundColor: '#1C1712' }}>
        {/* Slider images */}
        {BANNERS.map((img, i) => (
          <div
            key={i}
            className={`hero__slide${i === slide ? ' hero__slide--active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        {/* Dark overlay for readability */}
        <div className="hero__overlay" />

        {/* Hero content */}
        <div className="hero__content">
          <div className="hero__om">ॐ</div>
          <h1 className="hero__title">GANGOTRI DHAM</h1>
          <p className="hero__subtitle">श्री गंगोत्री धाम — देवभूमि उत्तराखंड</p>
          <div className="hero__buttons">
            <Link to="/booking" className="btn btn-primary btn-lg">पूजा बुकिंग करें 🙏</Link>
            <a href="#about" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>धाम परिचय पढ़ें</a>
          </div>
          {kapat && (
            <div className="hero__kapat-box">
              <h3>{kapat.is_open ? '🟢 कपाट अभी खुले हैं' : '🔔 कपाट उद्घाटन सूचना'}</h3>
              <p>{kapat.announcement || (kapat.is_open ? `श्री गंगोत्री धाम के कपाट खुले हैं।${kapat.close_date ? ` बंद होने की तिथि: ${kapat.close_date}` : ''}` : 'श्री गंगोत्री धाम के कपाट शीतकाल के लिए बंद हैं।')}</p>
              {!kapat.is_open && <span className="hero__badge">⭐ अक्षय तृतीया 2025 — तिथि घोषणा शीघ्र</span>}
            </div>
          )}
        </div>

        {/* Prev / Next arrows */}
        <button className="hero__prev" onClick={() => setSlide(s => (s - 1 + BANNERS.length) % BANNERS.length)} aria-label="Previous">&#8249;</button>
        <button className="hero__next" onClick={() => setSlide(s => (s + 1) % BANNERS.length)} aria-label="Next">&#8250;</button>

        {/* Dot indicators */}
        <div className="hero__dots">
          {BANNERS.map((_, i) => (
            <button key={i} className={`hero__dot${i === slide ? ' hero__dot--active' : ''}`} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>

        <button className="hero__scroll" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>↓</button>
      </section>

      {/* ── About Dham ── */}
      <section className="section" id="about" style={{ background: '#fff' }}>
        <div className="container">
          <div ref={r1} className="sec-head">
            <h2 className="sec-head__en">About Gangotri Dham</h2>
            <span className="sec-head__hi">गंगोत्री धाम परिचय</span>
            <div className="sec-head__bar" />
          </div>
          <div ref={r2} className="dham-grid">
            <div className="dham-text">
              <p>उत्तराखंड के जनपद उत्तरकाशी में समुद्रतल से 3140 मीटर की ऊँचाई और जिला मुख्यालय उत्तरकाशी से 100 किमी की दूरी पर स्थित गंगोत्री हिन्दुओं का पवित्र तीर्थ क्षेत्र है।</p>
              <p>उत्तराखंड के चार धामों में से एक गंगोत्री धाम, गंगा 'उतरी' से बना है — वह जगह जहाँ गंगा उतरीं। पुराणों के अनुसार यहीं पर राजा भागीरथ ने एक शिला पर बैठकर 5500 वर्षों तक तपस्या की थी।</p>
              <p>गंगोत्री मंदिर के कपाट अक्षय तृतीया के पावन पर्व पर खुलते हैं और दीपावली के दूसरे दिन शीतकाल के लिए बंद कर दिए जाते हैं। देवी गंगा की प्रतिमा हर्षिल के निकट 'मुखबा' गाँव में लाकर रख दी जाती है।</p>
              <p>गंगोत्री मंदिर का निर्माण 18वीं शताब्दी में गोरखा सेनापति अमर सिंह थापा ने प्रारंभ करवाया, जिसे जयपुर नरेश ने पूरा करवाया।</p>
            </div>
            <div className="info-chips">
              {INFO.map(c => (
                <div key={c.lbl} className="info-chip">
                  <div className="info-chip__icon">{c.icon}</div>
                  <div className="info-chip__val">{c.val}</div>
                  <div className="info-chip__lbl">{c.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div ref={r3} className="nearby-wrap">
            <h3>समीपवर्ती स्थान — Nearby Places</h3>
            <div className="nearby-tags">
              {NEARBY.map(n => <span key={n} className="nearby-tag">{n}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ── About Rawal Ji ── */}
      <section className="section" id="rawal" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="sec-head">
            <h2 className="sec-head__en">Rawal Shivprakash Ji Maharaj</h2>
            <span className="sec-head__hi">परम पूज्य रावल जी महाराज</span>
            <div className="sec-head__bar" />
          </div>
          <div ref={r4} className="rawal-layout">
            <div className="rawal-photo-col">
              <div className="rawal-photo-card">
                <div className="rawal-photo-img-wrap">
                  <img src={rawalPhoto} alt="परम पूज्य शिवप्रकाश जी महाराज" className="rawal-photo-img" />
                </div>
                <div className="rawal-nameplate">
                  <div className="name">परम पूज्य शिवप्रकाश जी महाराज</div>
                  <div className="title">रावल — श्री गंगोत्री धाम</div>
                </div>
              </div>
            </div>
            <div className="bio-cards">
              {[
                { h: 'जन्म एवं शिक्षा', p: 'श्री गंगोत्री धाम के रावल परम पूज्य शिवप्रकाश जी महाराज का जन्म 15 नवंबर 1975 को उत्तराखंड राज्य के उत्तरकाशी जिले में हुआ था। 11 साल की बाल्यावस्था में ही घर परिवार का त्याग कर विभिन्न आश्रमों में रहकर वेद, उपनिषद, पुराण, संस्कृत और कर्मकांड शिक्षा ली।' },
                { h: 'पद एवं परंपरा', p: 'रावल — गंगोत्री धाम के मुख्य पुजारी को "रावल" कहा जाता है। यह पद वंशानुगत/परंपरागत है और रावल ही मंदिर की पूजा-पद्धति, कपाट खुलने-बंद होने व धार्मिक परंपराओं के प्रमुख होते हैं।' },
                { h: 'पशुपतिनाथ जलाभिषेक', p: 'अनादि काल से चली आ रही परंपरा के तहत गंगोत्री धाम के कपाट शीतकाल में बंद होने के बाद रावल जी गंगोत्री से गंगाजल का कलश लेकर नेपाल स्थित पशुपतिनाथ मंदिर जाते हैं और वहाँ भगवान शिव का जलाभिषेक करते हैं। हर वर्ष लगभग 1100 लीटर गंगाजल लेकर हरिद्वार, मुरादाबाद, बरेली होते हुए काठमांडू जाते हैं।' },
                { h: 'सामाजिक विचार', p: 'युवाओं को पाश्चात्य संस्कृति छोड़कर ऋषि परंपराओं का अनुसरण करना चाहिए। गंगा, गाय और भारतीय संस्कृति के संरक्षण पर विशेष जोर।' },
                { h: 'हाल की गतिविधियाँ', p: '26 अक्टूबर 2024 को गंगोत्री से 1100 लीटर गंगाजल लेकर हरिद्वार पहुँचे। नवंबर 2024 में मुरादाबाद में धर्म-संस्कृति पर वार्ता। बरेली में "माँ गंगा बचाओ वेलफेयर सोसाइटी" ने सम्मानित किया।' },
              ].map(b => (
                <div key={b.h} className="bio-card">
                  <h3>{b.h}</h3>
                  <p>{b.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="section" id="gallery" style={{ background: '#fff' }}>
        <div className="container">
          <div className="sec-head">
            <h2 className="sec-head__en">Gallery</h2>
            <span className="sec-head__hi">फ़ोटो गैलरी</span>
            <div className="sec-head__bar" />
          </div>
          <div ref={r5} className="gallery-grid">
            {GALLERY.map(g => (
              <div key={g.caption} className="gallery-card">
                <div className="gallery-card__icon">{g.icon}</div>
                <div className="gallery-card__caption">{g.caption}</div>
                <div className="gallery-card__overlay">🔍</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
