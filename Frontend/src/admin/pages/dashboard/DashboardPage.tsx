import { useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import {
  FaUsers, FaSuitcase, FaCalendarAlt, FaInbox,
  FaFileAlt, FaUserTie, FaArrowRight, FaChartBar,
} from 'react-icons/fa';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { clients, cases, appointments, messages, documents, team } = useData();
  const name = localStorage.getItem('admin_name') || localStorage.getItem('admin_email') || 'Administrador';
  const firstName = name.split(' ')[0].split('@')[0];

  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
  const unreadMessages = messages.filter((m) => !m.read).length;
  const activeCases = cases.filter((c) => c.status !== 'Cerrado').length;

  const recentClients = [...clients]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5);

  const recentAppointments = [...appointments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const stats = [
    { label: 'Clientes',      value: clients.length,      sub: 'registrados',   icon: <FaUsers />,       color: '#6366F1', bg: '#EEF2FF', path: '/admin/clients' },
    { label: 'Casos activos', value: activeCases,          sub: 'en proceso',    icon: <FaSuitcase />,    color: '#0D9488', bg: '#F0FDFA', path: '/admin/cases' },
    { label: 'Citas pend.',   value: pendingAppointments,  sub: 'por confirmar', icon: <FaCalendarAlt />, color: '#F59E0B', bg: '#FFFBEB', path: '/admin/appointments' },
    { label: 'Mensajes',      value: unreadMessages,       sub: 'sin leer',      icon: <FaInbox />,       color: '#EC4899', bg: '#FDF2F8', path: '/admin/inbox' },
    { label: 'Documentos',    value: documents.length,     sub: 'archivados',    icon: <FaFileAlt />,     color: '#8B5CF6', bg: '#F5F3FF', path: '/admin/documents' },
    { label: 'Equipo',        value: team.length,          sub: 'miembros',      icon: <FaUserTie />,     color: '#2563EB', bg: '#EFF6FF', path: '/admin/team' },
  ];

  const statusBadge: Record<string, string> = {
    pending:   'a-badge--warning',
    confirmed: 'a-badge--success',
    cancelled: 'a-badge--danger',
  };
  const statusLabel: Record<string, string> = {
    pending:   'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
  };
  const caseStatusBadge: Record<string, string> = {
    'Evaluación': 'a-badge--warning',
    'En Proceso':  'a-badge--primary',
    'En Corte':    'a-badge--danger',
    'Cerrado':     'a-badge--default',
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="a-page">
      <div className="a-page-header">
        <div className="a-page-header__title">
          <h2>{greeting}, {firstName}</h2>
          <p>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className="a-page-header__actions">
          <button type="button" className="a-btn a-btn--primary" onClick={() => navigate('/admin/appointments')}>
            <FaCalendarAlt /> Nueva cita
          </button>
          <button type="button" className="a-btn" onClick={() => navigate('/admin/clients')}>
            <FaUsers /> Nuevo cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="a-stats-grid">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            className="a-stat"
            style={{ cursor: 'pointer', textAlign: 'left', width: '100%', border: '1px solid var(--bd)', borderRadius: 'var(--radius)' }}
            onClick={() => navigate(s.path)}
          >
            <div className="a-stat__icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="a-stat__body">
              <div className="a-stat__value">{s.value}</div>
              <div className="a-stat__label">{s.label}</div>
              <div className="a-stat__sub">{s.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>
        {/* Citas recientes */}
        <div className="a-section">
          <div className="a-section__header">
            <h3><FaCalendarAlt style={{ marginRight: '0.4rem', opacity: 0.6 }} />Citas recientes</h3>
            <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate('/admin/appointments')}>
              Ver todas <FaArrowRight />
            </button>
          </div>
          {recentAppointments.length === 0 ? (
            <div className="a-empty" style={{ padding: '2rem' }}><p>No hay citas aún.</p></div>
          ) : (
            <table className="a-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((a) => (
                  <tr key={a.id}>
                    <td className="a-table__name">{a.clientName}</td>
                    <td>{a.date}</td>
                    <td>
                      <span className={`a-badge a-badge--dot ${statusBadge[a.status] || 'a-badge--default'}`}>
                        {statusLabel[a.status] || a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Clientes recientes */}
        <div className="a-section">
          <div className="a-section__header">
            <h3><FaUsers style={{ marginRight: '0.4rem', opacity: 0.6 }} />Clientes recientes</h3>
            <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate('/admin/clients')}>
              Ver todos <FaArrowRight />
            </button>
          </div>
          {recentClients.length === 0 ? (
            <div className="a-empty" style={{ padding: '2rem' }}><p>No hay clientes aún.</p></div>
          ) : (
            <table className="a-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((c) => (
                  <tr key={c.id}>
                    <td className="a-table__name">{c.name}</td>
                    <td>{c.email || '—'}</td>
                    <td>{c.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Casos */}
      <div className="a-section">
        <div className="a-section__header">
          <h3><FaChartBar style={{ marginRight: '0.4rem', opacity: 0.6 }} />Casos por estado</h3>
          <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate('/admin/cases')}>
            Ver todos <FaArrowRight />
          </button>
        </div>
        <div className="a-section__body">
          <div className="a-meta-grid">
            {(['Evaluación', 'En Proceso', 'En Corte', 'Cerrado'] as const).map((status) => {
              const count = cases.filter((c) => c.status === status).length;
              return (
                <div key={status} className="a-meta-item">
                  <small>{status}</small>
                  <strong style={{ fontSize: '1.5rem', letterSpacing: '-0.03em', display: 'block', margin: '0.15rem 0 0.3rem' }}>
                    {count}
                  </strong>
                  <span className={`a-badge ${caseStatusBadge[status]}`}>
                    {cases.length ? Math.round((count / cases.length) * 100) : 0}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
