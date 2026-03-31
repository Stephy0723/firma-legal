import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminLogin.scss';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === 'admin@jrlinversiones.com' && password === 'admin123') {
      localStorage.setItem('crm_auth', 'true');
      localStorage.setItem('crm_auth_time', Date.now().toString());
      navigate('/admin');
    } else {
      setError('Credenciales incorrectas. Verifica el correo o la contraseña.');
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Se enviará un enlace de recuperación a tu correo electrónico.');
  };

  return (
    <div className="admin-login-layout">

      {/* ── LEFT: Brand / Visual ── */}
      <div className="admin-login-brand">
        <div className="brand-content">
          <span className="brand-eyebrow">Portal Administrativo</span>

          <div className="brand-center">
            <h1>Dirección&nbsp;legal con&nbsp;propósito.</h1>
            <div className="brand-rule" />
            <p className="brand-desc">
              Gestiona casos, clientes y el equipo del despacho desde un
              solo centro de mando seguro y privado.
            </p>
            <div className="brand-pillars">
              <span className="brand-pillar">Confidencialidad garantizada</span>
              <span className="brand-pillar">Acceso exclusivo autorizado</span>
              <span className="brand-pillar">Datos cifrados en tránsito</span>
            </div>
          </div>

          <span className="brand-footer">
            &copy; {new Date().getFullYear()} JRL Asuntos Jurídicos — Todos los derechos reservados.
          </span>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="admin-login-form-container">
        <Link to="/" className="back-link">
          <FaArrowLeft />
          Volver al sitio
        </Link>

        <div className="form-wrapper">
          <div className="form-header">
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa tus credenciales para acceder al panel.</p>
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jrlinversiones.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Contraseña</label>
                <a href="#" className="forgot-password" onClick={handleForgotPassword}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AdminLogin;
