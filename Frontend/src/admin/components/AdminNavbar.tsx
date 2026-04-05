import { useState, useRef, useEffect, useMemo } from 'react';
import {
  FaMoon, FaSignOutAlt, FaSun, FaBars, FaBell, FaSearch,
  FaTimes, FaChevronRight, FaCog, FaEnvelope,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminTheme } from '../theme/AdminThemeContext';
import { useData } from '../../context/DataContext';

const PAGE_META: Record<string, { title: string; icon?: string }> = {
  '/admin':              { title: 'Dashboard' },
  '/admin/clients':      { title: 'Clientes' },
  '/admin/cases':        { title: 'Casos' },
  '/admin/expedientes':  { title: 'Expedientes' },
  '/admin/appointments': { title: 'Citas' },
  '/admin/inbox':        { title: 'Consultas' },
  '/admin/documents':    { title: 'Documentos' },
  '/admin/services':     { title: 'Servicios' },
  '/admin/team':         { title: 'Equipo' },
  '/admin/notifications':{ title: 'Notificaciones' },
  '/admin/settings':     { title: 'Ajustes' },
};

const SEARCH_LINKS = [
  { path: '/admin',              label: 'Dashboard',      keywords: 'inicio panel principal' },
  { path: '/admin/clients',      label: 'Clientes',       keywords: 'clientes personas contactos' },
  { path: '/admin/cases',        label: 'Casos',          keywords: 'casos legales' },
  { path: '/admin/expedientes',  label: 'Expedientes',    keywords: 'expedientes caso detalle abogado tribunal testigos' },
  { path: '/admin/appointments', label: 'Citas',          keywords: 'citas reuniones agenda calendario' },
  { path: '/admin/inbox',        label: 'Consultas',      keywords: 'consultas mensajes correo bandeja entrada' },
  { path: '/admin/documents',    label: 'Documentos',     keywords: 'documentos archivos pdf carpetas' },
  { path: '/admin/services',     label: 'Servicios',      keywords: 'servicios ofrecemos' },
  { path: '/admin/team',         label: 'Equipo',         keywords: 'equipo abogados miembros' },
  { path: '/admin/notifications',label: 'Notificaciones', keywords: 'notificaciones alertas avisos' },
  { path: '/admin/settings',     label: 'Ajustes',        keywords: 'ajustes configuracion preferencias' },
];

type AdminNavbarProps = {
  onToggleSidebar?: () => void;
};

const AdminNavbar = ({ onToggleSidebar }: AdminNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useAdminTheme();
  const { messages, appointments } = useData();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notiOpen, setNotiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pageMeta = PAGE_META[location.pathname] || { title: 'Admin' };

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notiRef.current && !notiRef.current.contains(t)) setNotiOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(t)) { setSearchOpen(false); setSearchQuery(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Keyboard shortcut: Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Unread messages count
  const unreadCount = useMemo(() => messages.filter(m => !m.read).length, [messages]);

  // Pending appointments count
  const pendingAppointments = useMemo(
    () => appointments.filter(a => a.status === 'pending').length,
    [appointments],
  );

  const totalNotifications = unreadCount + pendingAppointments;

  // Recent notifications (combine unread messages + pending appointments)
  const recentNotifications = useMemo(() => {
    const items: { id: string; type: 'message' | 'appointment'; title: string; subtitle: string; time: string; path: string }[] = [];

    messages
      .filter(m => !m.read)
      .slice(0, 4)
      .forEach(m => {
        items.push({
          id: m.id,
          type: 'message',
          title: m.name,
          subtitle: m.message.length > 60 ? m.message.slice(0, 60) + '…' : m.message,
          time: m.date,
          path: '/admin/inbox',
        });
      });

    appointments
      .filter(a => a.status === 'pending')
      .slice(0, 3)
      .forEach(a => {
        items.push({
          id: a.id,
          type: 'appointment',
          title: a.clientName,
          subtitle: `${a.purpose} — ${a.date} ${a.time}`,
          time: a.date,
          path: '/admin/appointments',
        });
      });

    return items.slice(0, 6);
  }, [messages, appointments]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return SEARCH_LINKS.filter(
      link => link.label.toLowerCase().includes(q) || link.keywords.includes(q),
    );
  }, [searchQuery]);

  // User info
  const name = localStorage.getItem('admin_name') || '';
  const email = localStorage.getItem('admin_email') || '';
  const displayName = name || email.split('@')[0] || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_name');
    navigate('/admin/login');
  };

  const handleSearchNavigate = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="admin-navbar">
      {/* LEFT: toggle + breadcrumb */}
      <div className="admin-navbar__left">
        {onToggleSidebar && (
          <button type="button" className="admin-navbar__toggle" onClick={onToggleSidebar} title="Menú">
            <FaBars />
          </button>
        )}
        <nav className="admin-navbar__breadcrumb">
          <Link to="/admin" className="admin-navbar__breadcrumb-root">Admin</Link>
          {location.pathname !== '/admin' && (
            <>
              <FaChevronRight className="admin-navbar__breadcrumb-sep" />
              <span className="admin-navbar__breadcrumb-current">{pageMeta.title}</span>
            </>
          )}
        </nav>
      </div>

      {/* CENTER: search */}
      <div className="admin-navbar__center" ref={searchRef}>
        {!searchOpen ? (
          <button
            type="button"
            className="admin-navbar__search-trigger"
            onClick={() => setSearchOpen(true)}
          >
            <FaSearch />
            <span>Buscar…</span>
            <kbd>Ctrl K</kbd>
          </button>
        ) : (
          <div className="admin-navbar__search-box">
            <FaSearch className="admin-navbar__search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="admin-navbar__search-input"
              placeholder="Buscar páginas, funciones…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  handleSearchNavigate(searchResults[0].path);
                }
              }}
            />
            <button
              type="button"
              className="admin-navbar__search-close"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
            >
              <FaTimes />
            </button>

            {searchQuery.trim() && (
              <div className="admin-navbar__search-results">
                {searchResults.length === 0 ? (
                  <div className="admin-navbar__search-empty">No se encontraron resultados</div>
                ) : (
                  searchResults.map(r => (
                    <button
                      key={r.path}
                      type="button"
                      className="admin-navbar__search-item"
                      onClick={() => handleSearchNavigate(r.path)}
                    >
                      <FaChevronRight />
                      <span>{r.label}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: notifications + theme + profile */}
      <div className="admin-navbar__right">
        {/* Notifications */}
        <div className="admin-navbar__noti-wrap" ref={notiRef}>
          <button
            type="button"
            className={`admin-navbar__icon-btn ${notiOpen ? 'is-active' : ''}`}
            onClick={() => { setNotiOpen(v => !v); setProfileOpen(false); }}
            title="Notificaciones"
          >
            <FaBell />
            {totalNotifications > 0 && (
              <span className="admin-navbar__badge">{totalNotifications > 9 ? '9+' : totalNotifications}</span>
            )}
          </button>

          {notiOpen && (
            <div className="admin-navbar__dropdown admin-navbar__dropdown--noti">
              <div className="admin-navbar__dropdown-header">
                <strong>Notificaciones</strong>
                {totalNotifications > 0 && (
                  <span className="a-badge a-badge--primary">{totalNotifications}</span>
                )}
              </div>

              <div className="admin-navbar__dropdown-body">
                {recentNotifications.length === 0 ? (
                  <div className="admin-navbar__dropdown-empty">Sin notificaciones nuevas</div>
                ) : (
                  recentNotifications.map(n => (
                    <button
                      key={n.id}
                      type="button"
                      className="admin-navbar__noti-item"
                      onClick={() => { navigate(n.path); setNotiOpen(false); }}
                    >
                      <div className={`admin-navbar__noti-icon admin-navbar__noti-icon--${n.type}`}>
                        {n.type === 'message' ? <FaEnvelope /> : <FaCalendarAlt />}
                      </div>
                      <div className="admin-navbar__noti-content">
                        <span className="admin-navbar__noti-title">{n.title}</span>
                        <span className="admin-navbar__noti-sub">{n.subtitle}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="admin-navbar__dropdown-footer">
                <Link to="/admin/notifications" onClick={() => setNotiOpen(false)}>
                  Ver todas las notificaciones
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          className="admin-navbar__icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>

        {/* Profile dropdown */}
        <div className="admin-navbar__profile-wrap" ref={profileRef}>
          <button
            type="button"
            className={`admin-navbar__profile-btn ${profileOpen ? 'is-active' : ''}`}
            onClick={() => { setProfileOpen(v => !v); setNotiOpen(false); }}
          >
            <div className="admin-navbar__avatar">{initials}</div>
            <div className="admin-navbar__user-info">
              <span className="admin-navbar__user-name">{displayName}</span>
              <span className="admin-navbar__user-role">Administrador</span>
            </div>
          </button>

          {profileOpen && (
            <div className="admin-navbar__dropdown admin-navbar__dropdown--profile">
              <div className="admin-navbar__dropdown-header">
                <div className="admin-navbar__avatar admin-navbar__avatar--lg">{initials}</div>
                <div>
                  <strong>{displayName}</strong>
                  <span>{email}</span>
                </div>
              </div>

              <div className="admin-navbar__dropdown-body">
                <button
                  type="button"
                  className="admin-navbar__menu-item"
                  onClick={() => { navigate('/admin/settings'); setProfileOpen(false); }}
                >
                  <FaCog /> <span>Ajustes</span>
                </button>
                <button
                  type="button"
                  className="admin-navbar__menu-item"
                  onClick={() => { navigate('/admin/notifications'); setProfileOpen(false); }}
                >
                  <FaBell /> <span>Notificaciones</span>
                </button>
              </div>

              <div className="admin-navbar__dropdown-divider" />

              <div className="admin-navbar__dropdown-body">
                <button
                  type="button"
                  className="admin-navbar__menu-item admin-navbar__menu-item--danger"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
