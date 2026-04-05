import { useAdminTheme } from '../../theme/AdminThemeContext';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaMoon, FaSun, FaSignOutAlt, FaUser, FaShieldAlt, FaPalette, FaInfoCircle } from 'react-icons/fa';
import './SettingsPage.scss';

const SettingsPage = () => {
  const { theme, toggleTheme } = useAdminTheme();
  const navigate = useNavigate();

  const email = localStorage.getItem('admin_email') || '—';
  const name  = localStorage.getItem('admin_name')  || '—';

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_name');
    navigate('/admin/login');
  };

  return (
    <div className="a-page settings-page">
      <div className="a-page-header">
        <div className="a-page-header__title">
          <h2><FaCog style={{ marginRight: '0.4rem', opacity: 0.7 }} /> Ajustes</h2>
          <p>Configuración del panel de administración</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="a-section settings-section">
          <div className="a-section__header">
            <h3><FaUser style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Perfil</h3>
          </div>
          <div className="a-section__body">
            <div className="settings-profile">
              <div className="settings-profile__avatar">
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div className="settings-profile__info">
                <strong>{name}</strong>
                <span>{email}</span>
                <span className="a-badge a-badge--primary">Administrador</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="a-section settings-section">
          <div className="a-section__header">
            <h3><FaPalette style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Apariencia</h3>
          </div>
          <div className="a-section__body">
            <div className="settings-row">
              <div className="settings-row__info">
                <strong>Tema del panel</strong>
                <span>Actualmente: <b>{theme === 'dark' ? 'Oscuro' : 'Claro'}</b></span>
              </div>
              <button type="button" className="a-btn" onClick={toggleTheme}>
                {theme === 'dark' ? <><FaSun /> Cambiar a Claro</> : <><FaMoon /> Cambiar a Oscuro</>}
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="a-section settings-section">
          <div className="a-section__header">
            <h3><FaShieldAlt style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Seguridad</h3>
          </div>
          <div className="a-section__body">
            <div className="settings-row">
              <div className="settings-row__info">
                <strong>Cerrar sesión</strong>
                <span>Cierra la sesión actual del panel de administración.</span>
              </div>
              <button type="button" className="a-btn a-btn--danger" onClick={handleLogout}>
                <FaSignOutAlt /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* System */}
        <div className="a-section settings-section">
          <div className="a-section__header">
            <h3><FaInfoCircle style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Sistema</h3>
          </div>
          <div className="a-section__body">
            <div className="a-meta-grid">
              <div className="a-meta-item">
                <small>Versión</small>
                <strong>1.0.0</strong>
              </div>
              <div className="a-meta-item">
                <small>Entorno</small>
                <strong>Producción</strong>
              </div>
              <div className="a-meta-item">
                <small>Plataforma</small>
                <strong>Web</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
