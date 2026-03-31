import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { useAdminNavigation, type AdminMenuItem } from '../../../context/AdminNavigationContext';
import './AdminSidebar.scss';
import logo from '../../../assets/logo.jpeg';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { menuItems, sidebarCollapsed, toggleSidebar } = useAdminNavigation();
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>('activity');

  const isMenuItemActive = (item: AdminMenuItem): boolean => {
    if (item.submenu) {
      return item.submenu.some((sub) => sub.path === location.pathname);
    }
    return item.path === location.pathname;
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_auth');
    localStorage.removeItem('crm_auth_time');
    window.location.href = '/admin/login';
  };

  const handleSubmenuToggle = (itemId: string) => {
    setExpandedSubmenu(expandedSubmenu === itemId ? null : itemId);
  };

  return (
    <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="admin-sidebar__header">
        <img src={logo} alt="JRL Logo" className="admin-sidebar__logo" />
        {!sidebarCollapsed && (
          <div className="admin-sidebar__brand">
            <h2>JRL</h2>
            <span>Admin</span>
          </div>
        )}
        <button className="admin-sidebar__toggle" onClick={toggleSidebar} title="Minimizar sidebar">
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar__nav">
        {/* Main Items */}
        <div className="admin-sidebar__section">
          {!sidebarCollapsed && <p className="admin-sidebar__section-label">Principal</p>}
          <ul>
            {menuItems
              .filter((item) => item.section === 'main' && !item.submenu)
              .map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`admin-sidebar__link ${isMenuItemActive(item) ? 'active' : ''}`}
                  >
                    <item.icon className="admin-sidebar__icon" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span className="admin-sidebar__badge">{item.badge}</span>
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        {/* Activity Section (with submenu) */}
        <div className="admin-sidebar__section">
          {!sidebarCollapsed && <p className="admin-sidebar__section-label">Actividad</p>}
          <ul>
            {menuItems
              .filter((item) => item.section === 'activity' && item.submenu)
              .map((item) => (
                <li key={item.id}>
                  <button
                    className={`admin-sidebar__link dropdown ${expandedSubmenu === item.id ? 'expanded' : ''}`}
                    onClick={() => handleSubmenuToggle(item.id)}
                  >
                    <item.icon className="admin-sidebar__icon" />
                    {!sidebarCollapsed && (
                      <>
                        <span>{item.label}</span>
                        <FaChevronDown className="admin-sidebar__chevron" />
                      </>
                    )}
                  </button>

                  {expandedSubmenu === item.id && !sidebarCollapsed && item.submenu && (
                    <ul className="admin-sidebar__submenu">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.id}>
                          <Link
                            to={subitem.path}
                            className={`admin-sidebar__sublink ${location.pathname === subitem.path ? 'active' : ''}`}
                          >
                            <subitem.icon className="admin-sidebar__icon" />
                            <span>{subitem.label}</span>
                            {subitem.badge && (
                              <span className="admin-sidebar__badge">{subitem.badge}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        </div>

        {/* Settings Section */}
        <div className="admin-sidebar__section">
          {!sidebarCollapsed && <p className="admin-sidebar__section-label">Configuración</p>}
          <ul>
            {menuItems
              .filter((item) => item.section === 'settings')
              .map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`admin-sidebar__link ${isMenuItemActive(item) ? 'active' : ''}`}
                  >
                    <item.icon className="admin-sidebar__icon" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="admin-sidebar__footer">
        <button className="admin-sidebar__logout" onClick={handleLogout} title="Cerrar sesión">
          <FaSignOutAlt />
          {!sidebarCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};
