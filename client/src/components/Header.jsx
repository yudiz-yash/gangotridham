import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/',        label: 'होम' },
  { to: '/events',  label: 'कार्यक्रम' },
  { to: '/booking', label: 'पूजा बुकिंग' },
  { to: '/contact', label: 'संपर्क' },
];

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <div className="header__emblem">ॐ</div>
          <div className="header__logo-text">
            <span className="en">GANGOTRI DHAM</span>
            <span className="hi">श्री गंगोत्री धाम</span>
          </div>
        </Link>

        <nav className="header__nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/booking" className="btn btn-primary btn-sm header__cta" style={{ display: 'none' }}>
          पूजा बुकिंग करें
        </Link>

        <button
          className={`header__hamburger ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>

      <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setMobileOpen(false)}>
            {n.label}
          </NavLink>
        ))}
        <Link
          to="/booking"
          className="btn btn-primary btn-sm"
          style={{ marginTop: '8px', textAlign: 'center' }}
          onClick={() => setMobileOpen(false)}
        >
          पूजा बुकिंग करें 🙏
        </Link>
      </nav>
    </header>
  );
}
