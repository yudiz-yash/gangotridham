import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const NAV = [
  { to: '/admin',          icon: '📊', label: 'Dashboard',    end: true },
  { to: '/admin/kapat',    icon: '🔔', label: 'Kapat Status' },
  { to: '/admin/events',   icon: '📅', label: 'Events / News' },
  { to: '/admin/bookings', icon: '📝', label: 'Puja Bookings' },
  { to: '/admin/gallery',  icon: '🖼️', label: 'Gallery' },
  { to: '/admin/homepage', icon: '🏠', label: 'Homepage Content' },
  { to: '/admin/contact',  icon: '💬', label: 'Messages' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="admin-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-sidebar__logo">
          <img src={logo} alt="Gangotri Dham" className="emblem" />
          <div className="lbl">Gangotri Dham<span className="sub">Admin Panel</span></div>
        </Link>

        <nav className="admin-nav">
          <div className="admin-nav__section">
            <span className="admin-nav__section-label">Menu</span>
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}>
                <span className="icon">{n.icon}</span> {n.label}
              </NavLink>
            ))}
          </div>
          <div className="admin-nav__section">
            <span className="admin-nav__section-label">Site</span>
            <a href="/" target="_blank" rel="noreferrer" className="admin-nav__link">
              <span className="icon">🌐</span> View Website
            </a>
          </div>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <strong>{user?.name || 'Admin'}</strong>
            {user?.email}
          </div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout} style={{ justifyContent: 'flex-start' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <h1>श्री गंगोत्री धाम</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--t3)' }}>Welcome, {user?.name}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
