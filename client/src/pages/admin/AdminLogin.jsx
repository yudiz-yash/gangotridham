import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

export default function AdminLogin() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('ईमेल और पासवर्ड दर्ज करें'); return; }
    setLoading(true); setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="card admin-login__card">
        <div className="admin-login__header">
          <img src={logo} alt="Gangotri Dham" className="emblem" style={{ objectFit: 'cover', background: 'none' }} />
          <h1>Admin Panel</h1>
          <p>श्री गंगोत्री धाम — Admin Access</p>
        </div>
        <div className="admin-login__body">
          {error && <div className="alert alert-error" style={{ marginBottom: 'var(--s5)' }}>{error}</div>}
          <form onSubmit={submit} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className="form-input" placeholder="admin@gangotridham.org"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="username"
              />
            </div>
            <div className="form-group" style={{ marginTop: 'var(--s5)' }}>
              <label className="form-label">Password</label>
              <input
                type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 'var(--s6)' }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />&nbsp;Signing in...</> : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
