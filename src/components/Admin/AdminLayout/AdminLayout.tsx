import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaInbox, FaCalendarAlt, FaBalanceScale, FaUsers, FaSignOutAlt, FaSearch, FaMoon, FaSun, FaBars, FaTimes, FaAddressBook, FaBriefcase, FaFolder, FaUserCircle } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import './AdminLayout.scss';
import logo from '../../../assets/logo.jpeg';

const sidebarLinks = [
  { path: '/admin', label: 'Overview', icon: FaHome },
  { path: '/admin/inbox', label: 'Mensajes', icon: FaInbox },
  { path: '/admin/appointments', label: 'Citas', icon: FaCalendarAlt },
  { path: '/admin/clients', label: 'Clientes', icon: FaAddressBook },
  { path: '/admin/cases', label: 'Expedientes', icon: FaBriefcase },
  { path: '/admin/documents', label: 'Documentos', icon: FaFolder },
  { path: '/admin/services', label: 'Servicios', icon: FaBalanceScale },
  { path: '/admin/team', label: 'Equipo', icon: FaUsers },
  { path: '/admin/profile', label: 'Mi Perfil', icon: FaUserCircle },
];

const AdminLayout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('crm_auth');
    localStorage.removeItem('crm_auth_time');
    nav('/admin/login');
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{title: string, type: string, path: string}[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
        const res = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}`);
        if(res.ok) {
          setSearchResults(await res.json());
        }
      } catch (e) {
        // Silently ignore search errors
      }
    };
    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getPageTitle = () => {
    const activeLink = sidebarLinks.find(link => link.path === location.pathname);
    return activeLink ? activeLink.label : 'Panel de Control';
  };

  return (
    <div className="admin-layout">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar__header">
          <img src={logo} alt="JRL Logo" className="admin-sidebar__logo" />
          <div className="admin-sidebar__brand">
            <h2>JRL Inversiones</h2>
            <span>Control Center</span>
          </div>
          <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="admin-sidebar__menu-label">MENU</div>
        
        <nav className="admin-sidebar__nav">
          <ul>
            {sidebarLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`admin-sidebar__link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  <link.icon className="admin-sidebar__icon" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__status">
            <div className="status-dot"></div>
            <span>Sistema Online</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <button className="admin-header__mobile-toggle" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <h1 className="admin-header__title">{getPageTitle()}</h1>
          
          <div className="admin-header__actions">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>

            <div className="admin-header__search" ref={searchRef}>
              <FaSearch className="search-icon"/>
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
              />
              <span className="shortcut">⌘K</span>
              
              {showSearch && searchQuery.length >= 2 && (
                <div className="search-results-dropdown">
                  {searchResults.length === 0 ? (
                    <div className="search-empty">No se encontraron resultados.</div>
                  ) : (
                    searchResults.map((res, i) => (
                      <div key={i} className="search-result-item" onClick={() => { nav(res.path); setShowSearch(false); setSearchQuery(''); }}>
                        <span className="res-type">{res.type}</span>
                        <span className="res-title">{res.title}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <button className="admin-header__logout" onClick={handleLogout}>
              <FaSignOutAlt /> Salir
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
