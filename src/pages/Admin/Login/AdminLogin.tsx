import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import logo from '../../../assets/logo.jpeg';
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
      {/* LEFT SIDE: BRANDING / IMAGE */}
      <div className="admin-login-brand">
        <div className="brand-overlay"></div>
        <div className="brand-content">
          <h1>JRL Inversiones</h1>
          <p>Portal Administrativo Central y Sistema de Gestión de Relaciones con los Clientes (CRM).</p>
          
          <div className="brand-footer">
            <span>&copy; {new Date().getFullYear()} JRL Asuntos Jurídicos. Todos los derechos reservados.</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="admin-login-form-container">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Volver al sitio web
        </Link>
        
        <div className="form-wrapper">
          <div className="form-header">
            <img src={logo} alt="JRL Logo" className="form-logo" />
            <h2>Bienvenido de nuevo</h2>
            <p>Por favor, ingresa a tu cuenta administrativa.</p>
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jrlinversiones.com"
                required
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
              />
            </div>

            <button type="submit" className="login-btn">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
