import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaBriefcase,
  FaCalendarAlt,
  FaCog,
  FaEnvelopeOpenText,
  FaFileAlt,
  FaFolderOpen,
  FaGlobe,
  FaHome,
  FaPhoneAlt,
  FaUserCircle,
  FaUsers,
} from 'react-icons/fa';
import { useData } from '../../../context/DataContext';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import {
  loadAdminProfileConfig,
  loadAdminWorkspaceSettings,
} from '../../../utils/adminWorkspace';
import './AdminDashboardV2.scss';

type RangeFilter = '7' | '30' | '90' | 'all';

const RANGE_OPTIONS: { id: RangeFilter; label: string }[] = [
  { id: '7', label: '7 dias' },
  { id: '30', label: '30 dias' },
  { id: '90', label: '90 dias' },
  { id: 'all', label: 'Todo' },
];

const normalizeValue = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const getCaseStage = (status: string) => {
  const normalized = normalizeValue(status);
  if (normalized.includes('corte')) return 'court';
  if (normalized.includes('cerrado')) return 'closed';
  if (normalized.includes('proceso')) return 'progress';
  return 'review';
};

const isWithinRange = (value: string | undefined, range: RangeFilter) => {
  if (!value) return false;
  if (range === 'all') return true;

  const days = Number(range);
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(value).getTime() >= cutoff.getTime();
};

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const formatAppointmentDate = (date: string, time: string) =>
  new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${date}T${time || '00:00'}`));

const AdminDashboardV2 = () => {
  const navigate = useNavigate();
  const { messages, appointments, cases, clients, documents, team } = useData();
  const [range, setRange] = useState<RangeFilter>('30');

  const profile = useMemo(() => loadAdminProfileConfig(), []);
  const settings = useMemo(() => loadAdminWorkspaceSettings(), []);

  const scopedAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        isWithinRange(
          appointment.updatedAt || appointment.createdAt || `${appointment.date}T${appointment.time || '00:00'}`,
          range,
        ),
      ),
    [appointments, range],
  );
  const scopedCases = useMemo(
    () => cases.filter((caseItem) => isWithinRange(caseItem.updatedAt || caseItem.created_at, range)),
    [cases, range],
  );
  const unreadMessages = messages.filter((message) => !message.read).length;
  const activeCases = cases.filter((caseItem) => getCaseStage(caseItem.status) !== 'closed').length;
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending').length;
  const todayAppointments = appointments.filter(
    (appointment) => new Date(`${appointment.date}T00:00`).toDateString() === new Date().toDateString(),
  ).length;

  const quickLinks = [
    { label: 'Mensajes', meta: `${unreadMessages} nuevos`, route: '/admin/inbox', icon: FaEnvelopeOpenText },
    { label: 'Citas', meta: `${pendingAppointments} pendientes`, route: '/admin/appointments', icon: FaCalendarAlt },
    { label: 'Expedientes', meta: `${activeCases} activos`, route: '/admin/cases', icon: FaBriefcase },
    { label: 'Clientes', meta: `${clients.length} fichas`, route: '/admin/clients', icon: FaUsers },
    { label: 'Documentos', meta: `${documents.length} archivos`, route: '/admin/documents', icon: FaFolderOpen },
    { label: 'Mi perfil', meta: profile.role, route: '/admin/profile', icon: FaUserCircle },
    { label: 'Configuracion', meta: settings.websiteAppointmentsEnabled ? 'web activa' : 'web pausada', route: '/admin/settings', icon: FaCog },
    { label: 'Equipo', meta: `${team.length} perfiles`, route: '/admin/team', icon: FaHome },
  ];

  const metrics = [
    { label: 'Inbox', value: unreadMessages, icon: FaEnvelopeOpenText, route: '/admin/inbox' },
    { label: 'Hoy', value: todayAppointments, icon: FaCalendarAlt, route: '/admin/appointments' },
    { label: 'Activos', value: activeCases, icon: FaBriefcase, route: '/admin/cases' },
    { label: 'Docs', value: documents.length, icon: FaFileAlt, route: '/admin/documents' },
    { label: 'Clientes', value: clients.length, icon: FaUsers, route: '/admin/clients' },
    { label: 'Equipo', value: team.length, icon: FaUsers, route: '/admin/team' },
  ];

  const upcomingAppointments = useMemo(
    () =>
      [...appointments]
        .filter(
          (appointment) =>
            appointment.status !== 'cancelled' &&
            new Date(`${appointment.date}T${appointment.time || '00:00'}`).getTime() >= Date.now(),
        )
        .sort(
          (left, right) =>
            new Date(`${left.date}T${left.time || '00:00'}`).getTime() -
            new Date(`${right.date}T${right.time || '00:00'}`).getTime(),
        )
        .slice(0, 5),
    [appointments],
  );

  const inboxQueue = useMemo(
    () =>
      [...messages]
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
        .slice(0, 5),
    [messages],
  );

  const caseStages = useMemo(() => {
    const buckets = [
      { id: 'review', label: 'Evaluacion', count: 0 },
      { id: 'progress', label: 'Proceso', count: 0 },
      { id: 'court', label: 'Corte', count: 0 },
      { id: 'closed', label: 'Cerrado', count: 0 },
    ];

    scopedCases.forEach((caseItem) => {
      const bucket = buckets.find((item) => item.id === getCaseStage(caseItem.status));
      if (bucket) bucket.count += 1;
    });

    const total = buckets.reduce((sum, item) => sum + item.count, 0) || 1;
    return buckets.map((item) => ({ ...item, percentage: Math.round((item.count / total) * 100) }));
  }, [scopedCases]);

  const sourceCounts = useMemo(() => {
    const entries = [
      { id: 'website', label: 'Web' },
      { id: 'admin', label: 'Admin' },
      { id: 'walkin', label: 'Presencial' },
      { id: 'phone', label: 'Telefono' },
      { id: 'whatsapp', label: 'WhatsApp' },
    ] as const;

    return entries.map((entry) => ({
      ...entry,
      count: scopedAppointments.filter((appointment) => appointment.source === entry.id).length,
    }));
  }, [scopedAppointments]);

  return (
    <div className="dashboard-studio services-studio">
      <PageHelp
        title="Dashboard"
        description="Vista compacta del CRM con metricas, accesos directos y estado operativo."
        features={[
          'Links utiles a los modulos clave.',
          'Metricas rapidas del despacho.',
          'Vista de citas, mensajes y pipeline en una sola pantalla.',
        ]}
      />

      <section className="dashboard-header">
        <div className="dashboard-header__copy">
          <span className="dashboard-header__eyebrow">Centro operativo</span>
          <h2>Dashboard</h2>
          <p>{settings.firmName}</p>
        </div>

        <div className="dashboard-header__actions">
          <div className="dashboard-range">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`dashboard-range__chip ${range === option.id ? 'is-active' : ''}`}
                onClick={() => setRange(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button type="button" className="dashboard-header__action" onClick={() => navigate('/admin/settings')}>
            <FaCog />
            Configuracion
          </button>
        </div>
      </section>

      <section className="dashboard-metrics">
        {metrics.map((metric) => (
          <button
            key={metric.label}
            type="button"
            className="dashboard-metric"
            onClick={() => navigate(metric.route)}
          >
            <div className="dashboard-metric__icon">
              <metric.icon />
            </div>
            <div className="dashboard-metric__body">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          </button>
        ))}
      </section>

      <div className="dashboard-layout">
        <section className="dashboard-card dashboard-card--links">
          <div className="dashboard-card__header">
            <div>
              <span>Atajos</span>
              <h3>Links utiles</h3>
            </div>
          </div>

          <div className="dashboard-links">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                className="dashboard-link-card"
                onClick={() => navigate(link.route)}
              >
                <div className="dashboard-link-card__icon">
                  <link.icon />
                </div>
                <div className="dashboard-link-card__body">
                  <strong>{link.label}</strong>
                  <span>{link.meta}</span>
                </div>
                <FaArrowRight className="dashboard-link-card__arrow" />
              </button>
            ))}
          </div>
        </section>

        <aside className="dashboard-card dashboard-card--status">
          <div className="dashboard-card__header">
            <div>
              <span>Sistema</span>
              <h3>Estado actual</h3>
            </div>
            <FaGlobe />
          </div>

          <div className="dashboard-status">
            <article className="dashboard-status__item">
              <small>Agenda web</small>
              <strong>{settings.websiteAppointmentsEnabled ? 'Activa' : 'Pausada'}</strong>
            </article>
            <article className="dashboard-status__item">
              <small>Formato base</small>
              <strong>{settings.defaultAppointmentFormat}</strong>
            </article>
            <article className="dashboard-status__item">
              <small>Confirmacion</small>
              <strong>{settings.defaultConfirmationChannel}</strong>
            </article>
            <article className="dashboard-status__item">
              <small>Inbox</small>
              <strong>{settings.automaticInboxOpening ? 'Auto' : 'Manual'}</strong>
            </article>
          </div>

          <div className="dashboard-sources">
            {sourceCounts.map((source) => (
              <article key={source.id} className="dashboard-sources__row">
                <span>{source.label}</span>
                <strong>{source.count}</strong>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="dashboard-contact"
            onClick={() => navigate('/admin/profile')}
          >
            <FaPhoneAlt />
            <div>
              <strong>{profile.name}</strong>
              <span>{profile.phone}</span>
            </div>
          </button>
        </aside>

        <section className="dashboard-card dashboard-card--agenda">
          <div className="dashboard-card__header">
            <div>
              <span>Agenda</span>
              <h3>Proximas citas</h3>
            </div>
            <button type="button" className="dashboard-card__link" onClick={() => navigate('/admin/appointments')}>
              Ver todas
            </button>
          </div>

          <div className="dashboard-list">
            {upcomingAppointments.length ? (
              upcomingAppointments.map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  className="dashboard-list__item"
                  onClick={() => navigate('/admin/appointments')}
                >
                  <div className="dashboard-list__time">
                    <strong>{formatAppointmentDate(appointment.date, appointment.time)}</strong>
                    <span>{appointment.time || 'Sin hora'}</span>
                  </div>
                  <div className="dashboard-list__content">
                    <strong>{appointment.clientName}</strong>
                    <span>{appointment.purpose}</span>
                  </div>
                  <b>{appointment.status}</b>
                </button>
              ))
            ) : (
              <div className="dashboard-empty">
                <h4>Sin citas proximas</h4>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-card dashboard-card--messages">
          <div className="dashboard-card__header">
            <div>
              <span>Inbox</span>
              <h3>Ultimos mensajes</h3>
            </div>
            <button type="button" className="dashboard-card__link" onClick={() => navigate('/admin/inbox')}>
              Abrir
            </button>
          </div>

          <div className="dashboard-list">
            {inboxQueue.length ? (
              inboxQueue.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  className={`dashboard-list__item ${!message.read ? 'is-alert' : ''}`}
                  onClick={() => navigate('/admin/inbox')}
                >
                  <div className="dashboard-list__time">
                    <strong>{message.name}</strong>
                    <span>{formatShortDate(message.date)}</span>
                  </div>
                  <div className="dashboard-list__content">
                    <strong>{message.area || 'Consulta general'}</strong>
                    <span>{message.message}</span>
                  </div>
                  <b>{message.read ? 'Leido' : 'Nuevo'}</b>
                </button>
              ))
            ) : (
              <div className="dashboard-empty">
                <h4>Sin mensajes</h4>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-card dashboard-card--pipeline">
          <div className="dashboard-card__header">
            <div>
              <span>Pipeline</span>
              <h3>Expedientes</h3>
            </div>
          </div>

          <div className="dashboard-pipeline">
            {caseStages.map((stage) => (
              <article key={stage.id} className="dashboard-pipeline__row">
                <div className="dashboard-pipeline__copy">
                  <strong>{stage.label}</strong>
                  <span>{stage.count}</span>
                </div>
                <div className="dashboard-pipeline__bar">
                  <span style={{ width: `${stage.percentage}%` }} />
                </div>
                <b>{stage.percentage}%</b>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardV2;
