import { NavLink } from 'react-router-dom';
import {
  FaHome, FaFileAlt, FaSuitcase, FaUserTie,
  FaUsers, FaGavel, FaCalendarAlt, FaInbox, FaBell, FaCog, FaFolderOpen,
} from 'react-icons/fa';
import { forwardRef } from 'react';

type AdminSidebarProps = {
  collapsed: boolean;
  onRequestExpand: () => void;
};

const NAV_MAIN = [
  { to: '/admin',              end: true,  icon: <FaHome />,        label: 'Dashboard' },
  { to: '/admin/clients',      end: false, icon: <FaUsers />,       label: 'Clientes' },
  { to: '/admin/cases',        end: false, icon: <FaGavel />,       label: 'Casos' },
  { to: '/admin/expedientes',  end: false, icon: <FaFolderOpen />,  label: 'Expedientes' },
  { to: '/admin/appointments', end: false, icon: <FaCalendarAlt />, label: 'Citas' },
  { to: '/admin/inbox',        end: false, icon: <FaInbox />,       label: 'Consultas' },
];

const NAV_CONTENT = [
  { to: '/admin/documents', end: false, icon: <FaFileAlt />,    label: 'Documentos' },
  { to: '/admin/services',  end: false, icon: <FaSuitcase />,   label: 'Servicios' },
  { to: '/admin/team',      end: false, icon: <FaUserTie />,    label: 'Equipo' },
];

const NAV_SYSTEM = [
  { to: '/admin/notifications', end: false, icon: <FaBell />, label: 'Notificaciones' },
  { to: '/admin/settings',      end: false, icon: <FaCog />,  label: 'Ajustes' },
];

const AdminSidebar = forwardRef<HTMLElement, AdminSidebarProps>(({ collapsed, onRequestExpand }, ref) => {
  const name  = localStorage.getItem('admin_name')  || '';
  const email = localStorage.getItem('admin_email') || '';
  const displayName = name || email.split('@')[0] || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside
      ref={ref}
      className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''}`}
      onClick={() => { if (collapsed) onRequestExpand(); }}
    >
      {/* Brand */}
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-icon">
          <FaGavel />
        </div>
        {!collapsed && (
          <div>
            <strong>Despacho Legal</strong>
            <span>Panel admin</span>
          </div>
        )}
      </div>

      {/* Main nav */}
      <div className="admin-sidebar__section">
        {!collapsed && <span className="admin-sidebar__section-label">Principal</span>}
        <nav className="admin-sidebar__nav" aria-label="Navegación principal">
          {NAV_MAIN.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="admin-sidebar__link">
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Content nav */}
      <div className="admin-sidebar__section">
        {!collapsed && <span className="admin-sidebar__section-label">Contenido</span>}
        <nav className="admin-sidebar__nav" aria-label="Contenido">
          {NAV_CONTENT.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="admin-sidebar__link">
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* System nav */}
      <div className="admin-sidebar__section">
        {!collapsed && <span className="admin-sidebar__section-label">Sistema</span>}
        <nav className="admin-sidebar__nav" aria-label="Sistema">
          {NAV_SYSTEM.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="admin-sidebar__link">
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User info */}
      <div className="admin-sidebar__bottom">
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__user-avatar">{initials}</div>
          {!collapsed && (
            <div className="admin-sidebar__user-info">
              <strong>{displayName}</strong>
              <span>{email}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});

AdminSidebar.displayName = 'AdminSidebar';
export default AdminSidebar;
