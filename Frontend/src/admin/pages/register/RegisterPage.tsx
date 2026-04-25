import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminTheme } from '../../theme/AdminThemeContext';
import { FaMoon, FaSun, FaGavel, FaLock, FaEnvelope, FaUser } from 'react-icons/fa';

const TEMP_BYPASS_ADMIN_AUTH = true;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAdminTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Completa todos los campos.'); return; }
    setLoading(true);
    setError('');

    if (TEMP_BYPASS_ADMIN_AUTH) {
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_name', name.trim());
      localStorage.setItem('admin_email', email.trim());
      navigate('/admin');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al registrar cuenta.'); return; }
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_name', data.name);
      localStorage.setItem('admin_email', data.email);
      navigate('/admin');
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-auth">
      <div className="admin-auth__card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div className="admin-auth__logo"><FaGavel /></div>
          <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={toggleTheme}>
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <h1 className="admin-auth__title">Crear cuenta</h1>
        <p className="admin-auth__subtitle">Registra un nuevo administrador del despacho.</p>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            {error}
          </div>
        )}

        <form className="admin-auth__form" onSubmit={handleSubmit}>
          <div className="a-field">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--tx2)' }}>Nombre completo</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: '0.85rem' }} />
              <input className="a-input" type="text" placeholder="Tu nombre" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} style={{ paddingLeft: '2.4rem' }} required />
            </div>
          </div>
          <div className="a-field">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--tx2)' }}>Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: '0.85rem' }} />
              <input className="a-input" type="email" placeholder="correo@despacho.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} style={{ paddingLeft: '2.4rem' }} required />
            </div>
          </div>
          <div className="a-field">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--tx2)' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: '0.85rem' }} />
              <input className="a-input" type="password" placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} style={{ paddingLeft: '2.4rem' }} required />
            </div>
          </div>
          <button type="submit" className="a-btn a-btn--primary a-btn--lg" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="admin-auth__footer">
          ¿Ya tienes cuenta? <Link to="/admin/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
