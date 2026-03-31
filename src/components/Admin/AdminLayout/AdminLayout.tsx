import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FaAddressBook,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaBalanceScale,
  FaBars,
  FaBriefcase,
  FaCalendarAlt,
  FaChartBar,
  FaChevronDown,
  FaFolder,
  FaHome,
  FaInbox,
  FaMoon,
  FaSearch,
  FaSignOutAlt,
  FaSun,
  FaTimes,
  FaUserCircle,
  FaUsers,
} from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useData } from '../../../context/DataContext';
import './AdminLayout.scss';
import logo from '../../../assets/logo.jpeg';

type SidebarLink = {
  path: string;
  label: string;
  icon: IconType;
  badge?: number;
};

type ActivityLink = SidebarLink & {
  tone: 'violet' | 'pink' | 'coral';
};

const homeLink: SidebarLink = { path: '/admin', label: 'Home', icon: FaHome };

const activityLinks: ActivityLink[] = [
  { path: '/admin/inbox', label: 'Mensajes', icon: FaInbox, tone: 'violet' },
  { path: '/admin/appointments', label: 'Citas', icon: FaCalendarAlt, tone: 'pink' },
  { path: '/admin/cases', label: 'Expedientes', icon: FaBriefcase, tone: 'coral' },
];

const staticMenuLinks: SidebarLink[] = [
  { path: '/admin/clients', label: 'Clientes', icon: FaAddressBook },
  { path: '/admin/documents', label: 'Documentos', icon: FaFolder },
  { path: '/admin/services', label: 'Servicios', icon: FaBalanceScale },
];

const otherLinks: SidebarLink[] = [
  { path: '/admin/profile', label: 'Mi Perfil', icon: FaUserCircle },
];

const AdminLayout = () => {
  const location = useLocation();
  const nav = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { team } = useData();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activityOpen, setActivityOpen] = useState(
    activityLinks.some((link) => link.path === location.pathname),
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string; type: string; path: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const menuLinks = useMemo(
    () => [
      ...staticMenuLinks,
      { path: '/admin/team', label: 'Equipo', icon: FaUsers, badge: team.length },
    ],
    [team.length],
  );

  const allLinks = useMemo(
    () => [homeLink, ...activityLinks, ...menuLinks, ...otherLinks],
    [menuLinks],
  );

  const isActivityActive = activityLinks.some((link) => link.path === location.pathname);

  useEffect(() => {
    if (isActivityActive) {
      setActivityOpen(true);
    }
  }, [isActivityActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}`,
        );

        if (res.ok) {
          setSearchResults(await res.json());
        }
      } catch {
        // Ignore local search failures in the shell.
      }
    };

    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('crm_auth');
    localStorage.removeItem('crm_auth_time');
    nav('/admin/login');
  };

  const handleSidebarNavigate = () => {
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    const activeLink = allLinks.find((link) => link.path === location.pathname);
    return activeLink ? activeLink.label : 'Panel de Control';
  };

  const themeLabel = theme === 'light' ? 'Modo oscuro' : 'Modo claro';
  const ThemeIcon = theme === 'light' ? FaMoon : FaSun;

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${
          sidebarCollapsed ? 'is-collapsed' : ''
        }`}
      >
        <div className="admin-sidebar__chrome">
          <span className="admin-sidebar__chrome-dot is-red"></span>
          <span className="admin-sidebar__chrome-dot is-amber"></span>
          <span className="admin-sidebar__chrome-dot is-green"></span>
        </div>

        <div className="admin-sidebar__header">
          <Link to="/admin" className="admin-sidebar__identity" onClick={handleSidebarNavigate}>
            <span className="admin-sidebar__logo-shell">
              <img src={logo} alt="JRL Logo" className="admin-sidebar__logo" />
            </span>

            <div className="admin-sidebar__brand">
              <strong>jrl.legal</strong>
              <span>admin suite</span>
            </div>
          </Link>

          <button
            type="button"
            className="admin-sidebar__collapse-btn"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {sidebarCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
          </button>

          <button type="button" className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="admin-sidebar__section admin-sidebar__section--primary">
          <div className="admin-sidebar__section-label">Menu</div>

          <nav className="admin-sidebar__nav">
            <ul>
              <li>
                <Link
                  to={homeLink.path}
                  className={`admin-sidebar__link ${location.pathname === homeLink.path ? 'active' : ''}`}
                  onClick={handleSidebarNavigate}
                  title={sidebarCollapsed ? homeLink.label : undefined}
                >
                  <homeLink.icon className="admin-sidebar__icon" />
                  <span className="admin-sidebar__label">{homeLink.label}</span>
                </Link>
              </li>

              <li
                className={`admin-sidebar__group ${activityOpen ? 'is-open' : ''} ${
                  isActivityActive ? 'is-active' : ''
                }`}
              >
                <button
                  type="button"
                  className="admin-sidebar__group-trigger"
                  onClick={() => setActivityOpen((prev) => !prev)}
                  aria-expanded={activityOpen}
                  title={sidebarCollapsed ? 'Actividad' : undefined}
                >
                  <FaChartBar className="admin-sidebar__icon" />
                  <span className="admin-sidebar__label">Actividad</span>
                  <FaChevronDown className="admin-sidebar__caret" />
                </button>

                <ul className="admin-sidebar__submenu">
                  {activityLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={`admin-sidebar__submenu-link ${
                          location.pathname === link.path ? 'active' : ''
                        }`}
                        onClick={handleSidebarNavigate}
                        title={sidebarCollapsed ? link.label : undefined}
                      >
                        <span className={`admin-sidebar__submenu-dot tone-${link.tone}`}></span>
                        <span className="admin-sidebar__submenu-label">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {menuLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`admin-sidebar__link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={handleSidebarNavigate}
                    title={sidebarCollapsed ? link.label : undefined}
                  >
                    <link.icon className="admin-sidebar__icon" />
                    <span className="admin-sidebar__label">{link.label}</span>
                    {typeof link.badge === 'number' && link.badge > 0 ? (
                      <span className="admin-sidebar__badge">{link.badge}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="admin-sidebar__section admin-sidebar__section--secondary">
          <div className="admin-sidebar__section-label">Other</div>

          <nav className="admin-sidebar__nav admin-sidebar__nav--secondary">
            <ul>
              {otherLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`admin-sidebar__link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={handleSidebarNavigate}
                    title={sidebarCollapsed ? link.label : undefined}
                  >
                    <link.icon className="admin-sidebar__icon" />
                    <span className="admin-sidebar__label">{link.label}</span>
                  </Link>
                </li>
              ))}

              <li>
                <button
                  type="button"
                  className="admin-sidebar__link"
                  onClick={toggleTheme}
                  title={sidebarCollapsed ? themeLabel : undefined}
                >
                  <ThemeIcon className="admin-sidebar__icon" />
                  <span className="admin-sidebar__label">Apariencia</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="admin-sidebar__link admin-sidebar__link--danger"
                  onClick={handleLogout}
                  title={sidebarCollapsed ? 'Salir' : undefined}
                >
                  <FaSignOutAlt className="admin-sidebar__icon" />
                  <span className="admin-sidebar__label">Salir</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__status">
            <span className="status-dot"></span>
            <span>Sistema online</span>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="admin-header__mobile-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>

          <h1 className="admin-header__title">{getPageTitle()}</h1>

          <div className="admin-header__actions">
            <div className="admin-header__search" ref={searchRef}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
              />
              <span className="shortcut">CTRL K</span>

              {showSearch && searchQuery.length >= 2 && (
                <div className="search-results-dropdown">
                  {searchResults.length === 0 ? (
                    <div className="search-empty">No se encontraron resultados.</div>
                  ) : (
                    searchResults.map((result, index) => (
                      <div
                        key={`${result.path}-${index}`}
                        className="search-result-item"
                        onClick={() => {
                          nav(result.path);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                      >
                        <span className="res-type">{result.type}</span>
                        <span className="res-title">{result.title}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
