import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const NAV = [
  { to: '/',        label: 'होम' },
  { to: '/events',  label: 'कार्यक्रम' },
  { to: '/booking', label: 'पूजा बुकिंग' },
  { to: '/contact', label: 'संपर्क' },
];

export default function Header() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const solid = scrolled || !isHome;

  return (
    <header className={`header ${solid ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src={logo} alt="Gangotri Dham" className="header__emblem" />
        </Link>

        <nav className="header__nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
              {n.label}
            </NavLink>
          ))}
        </nav>

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
