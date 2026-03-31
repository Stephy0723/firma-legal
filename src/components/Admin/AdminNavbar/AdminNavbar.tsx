import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaMoon, FaSun, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import './AdminNavbar.scss';

interface Breadcrumb {
  label: string;
  path: string;
}

const getBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const breadcrumbMap: Record<string, Breadcrumb[]> = {
    '/admin': [{ label: 'Dashboard', path: '/admin' }],
    '/admin/inbox': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Mensajes', path: '/admin/inbox' },
    ],
    '/admin/appointments': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Citas', path: '/admin/appointments' },
    ],
    '/admin/cases': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Expedientes', path: '/admin/cases' },
    ],
    '/admin/clients': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Clientes', path: '/admin/clients' },
    ],
    '/admin/documents': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Documentos', path: '/admin/documents' },
    ],
    '/admin/services': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Servicios', path: '/admin/services' },
    ],
    '/admin/team': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Equipo', path: '/admin/team' },
    ],
    '/admin/profile': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Mi Perfil', path: '/admin/profile' },
    ],
    '/admin/settings': [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Configuración', path: '/admin/settings' },
    ],
  };

  return breadcrumbMap[pathname] || [{ label: 'Dashboard', path: '/admin' }];
};

export const AdminNavbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  const breadcrumbs = useMemo(() => getBreadcrumbs(location.pathname), [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('crm_auth');
    localStorage.removeItem('crm_auth_time');
    window.location.href = '/admin/login';
  };

  return (
    <header className="admin-navbar">
      {/* Breadcrumb */}
      <div className="admin-navbar__breadcrumb">
        {breadcrumbs.map((bc, index) => (
          <div key={bc.path} className="admin-navbar__breadcrumb-item">
            {index > 0 && <span className="admin-navbar__breadcrumb-separator">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="admin-navbar__breadcrumb-current">{bc.label}</span>
            ) : (
              <Link to={bc.path} className="admin-navbar__breadcrumb-link">
                {bc.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="admin-navbar__actions">
        {/* Search */}
        <div className="admin-navbar__search">
          <FaSearch className="admin-navbar__search-icon" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-navbar__search-input"
          />
        </div>

        {/* Theme Toggle */}
        <button
          className="admin-navbar__action-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        {/* Logout */}
        <button
          className="admin-navbar__action-btn logout"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <FaSignOutAlt />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};
