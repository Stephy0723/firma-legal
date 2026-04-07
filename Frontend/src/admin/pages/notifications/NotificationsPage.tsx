import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaBell,
  FaCalendarAlt,
  FaCheck,
  FaCheckDouble,
  FaEnvelope,
  FaEye,
  FaInbox,
  FaSearch,
  FaTimesCircle,
} from 'react-icons/fa';
import { useData } from '../../../context/DataContext';

type NotificationFilter = 'all' | 'message' | 'appointment';

type NotificationItem = {
  key: string;
  id: string;
  type: 'message' | 'appointment';
  title: string;
  subtitle: string;
  body: string;
  timestamp: string;
  path: string;
  unread: boolean;
  area?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  format?: string;
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { messages, appointments, markMessageRead, updateAppointmentStatus } = useData();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const unreadMessages = useMemo(() => messages.filter((message) => !message.read).length, [messages]);
  const pendingAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'pending').length,
    [appointments],
  );

  const notifications = useMemo<NotificationItem[]>(() => {
    const messageNotifications = messages
      .filter((message) => !message.read)
      .map((message) => ({
        key: `message-${message.id}`,
        id: message.id,
        type: 'message' as const,
        title: message.name || 'Mensaje nuevo',
        subtitle: message.area || 'Consulta recibida',
        body: message.message || 'Sin contenido.',
        timestamp: message.date,
        path: '/admin/inbox',
        unread: !message.read,
        area: message.area,
        email: message.email,
        phone: message.phone,
      }));

    const appointmentNotifications = appointments
      .filter((appointment) => appointment.status === 'pending')
      .map((appointment) => ({
        key: `appointment-${appointment.id}`,
        id: appointment.id,
        type: 'appointment' as const,
        title: appointment.clientName || 'Cita pendiente',
        subtitle: appointment.purpose || 'Cita por confirmar',
        body: `${appointment.date} ${appointment.time}${appointment.format ? ` · ${appointment.format}` : ''}`,
        timestamp: appointment.createdAt || `${appointment.date}T${appointment.time || '00:00'}`,
        path: '/admin/appointments',
        unread: true,
        email: appointment.email,
        phone: appointment.phone,
        date: appointment.date,
        time: appointment.time,
        format: appointment.format,
      }));

    return [...messageNotifications, ...appointmentNotifications].sort(
      (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    );
  }, [appointments, messages]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchFilter = filter === 'all' || notification.type === filter;
      const matchSearch =
        !query ||
        [
          notification.title,
          notification.subtitle,
          notification.body,
          notification.area,
          notification.email,
          notification.phone,
          notification.date,
          notification.time,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchFilter && matchSearch;
    });
  }, [filter, notifications, search]);

  const selectedNotification = useMemo(
    () => notifications.find((notification) => notification.key === selectedKey) || null,
    [notifications, selectedKey],
  );

  const formatTimestamp = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const markAllMessagesAsRead = () => {
    messages.filter((message) => !message.read).forEach((message) => markMessageRead(message.id));
    if (selectedNotification?.type === 'message') {
      setSelectedKey(null);
    }
  };

  const openNotification = (notification: NotificationItem) => {
    setSelectedKey((current) => (current === notification.key ? null : notification.key));
  };

  const openSource = (notification: NotificationItem) => {
    if (notification.type === 'message' && notification.unread) {
      markMessageRead(notification.id);
    }

    navigate(notification.path);
  };

  const markSelectedMessageAsRead = () => {
    if (!selectedNotification || selectedNotification.type !== 'message') {
      return;
    }

    markMessageRead(selectedNotification.id);
    setSelectedKey(null);
  };

  const confirmSelectedAppointment = () => {
    if (!selectedNotification || selectedNotification.type !== 'appointment') {
      return;
    }

    updateAppointmentStatus(selectedNotification.id, 'confirmed');
    setSelectedKey(null);
  };

  const cancelSelectedAppointment = () => {
    if (!selectedNotification || selectedNotification.type !== 'appointment') {
      return;
    }

    updateAppointmentStatus(selectedNotification.id, 'cancelled');
    setSelectedKey(null);
  };

  const totalNotifications = notifications.length;

  return (
    <div className={`a-page a-split-layout ${selectedNotification ? 'a-split-layout--open' : ''}`}>
      <div className="a-split-layout__main">
        <div className="a-page-header">
          <div className="a-page-header__title">
            <h2>Notificaciones</h2>
            <p>{totalNotifications} alertas activas en el sistema</p>
          </div>
          <div className="a-page-header__actions">
            {unreadMessages > 0 && (
              <button type="button" className="a-btn a-btn--ghost" onClick={markAllMessagesAsRead}>
                <FaCheckDouble /> Marcar mensajes leidos
              </button>
            )}
          </div>
        </div>

        <div className="a-stats-grid">
          <div className="a-stat">
            <div className="a-stat__icon" style={{ background: 'var(--ac-bg)', color: 'var(--ac)' }}>
              <FaBell />
            </div>
            <div className="a-stat__body">
              <div className="a-stat__value">{totalNotifications}</div>
              <div className="a-stat__label">Alertas activas</div>
              <div className="a-stat__sub">Mensajes sin leer y citas pendientes</div>
            </div>
          </div>

          <div className="a-stat">
            <div className="a-stat__icon" style={{ background: 'var(--ac-bg)', color: 'var(--ac)' }}>
              <FaInbox />
            </div>
            <div className="a-stat__body">
              <div className="a-stat__value">{unreadMessages}</div>
              <div className="a-stat__label">Mensajes sin leer</div>
              <div className="a-stat__sub">Consultas nuevas por revisar</div>
            </div>
          </div>

          <div className="a-stat">
            <div className="a-stat__icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <FaCalendarAlt />
            </div>
            <div className="a-stat__body">
              <div className="a-stat__value">{pendingAppointments}</div>
              <div className="a-stat__label">Citas pendientes</div>
              <div className="a-stat__sub">Solicitudes esperando confirmacion</div>
            </div>
          </div>
        </div>

        <div className="a-toolbar">
          <div className="a-search">
            <FaSearch />
            <input
              placeholder="Buscar por remitente, cliente o detalle..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(['all', 'message', 'appointment'] as NotificationFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                className={`a-filter-chip ${filter === value ? 'is-active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {value === 'all'
                  ? `Todas (${notifications.length})`
                  : value === 'message'
                    ? `Mensajes (${unreadMessages})`
                    : `Citas (${pendingAppointments})`}
              </button>
            ))}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="a-empty">
            <FaBell />
            <h3>Sin alertas activas</h3>
            <p>{search || filter !== 'all' ? 'No hay coincidencias para ese filtro.' : 'Todo esta al dia por ahora.'}</p>
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Notificacion</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((notification) => (
                  <tr
                    key={notification.key}
                    className={`${notification.unread ? 'is-unread' : ''} ${selectedNotification?.key === notification.key ? 'is-active' : ''}`}
                  >
                    <td>
                      <span className={`a-badge ${notification.type === 'message' ? 'a-badge--primary' : 'a-badge--warning'}`}>
                        {notification.type === 'message' ? 'Mensaje' : 'Cita'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="a-table__name">{notification.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--tx2)', marginTop: '0.2rem' }}>
                          {notification.subtitle}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--tx3)', whiteSpace: 'nowrap' }}>
                      {formatTimestamp(notification.timestamp)}
                    </td>
                    <td>
                      <span className={`a-badge ${notification.type === 'message' ? 'a-badge--warning' : 'a-badge--warning'}`}>
                        {notification.type === 'message' ? 'Sin leer' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <div className="a-table__actions">
                        <button
                          type="button"
                          className="a-btn a-btn--ghost a-btn--icon"
                          onClick={() => openNotification(notification)}
                          title="Ver detalle"
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          className="a-btn a-btn--ghost a-btn--icon"
                          onClick={() => openSource(notification)}
                          title="Abrir origen"
                        >
                          <FaArrowRight />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedNotification && (
        <aside className="a-side-panel">
          <div className="a-side-panel__header">
            <h3>Detalle de notificacion</h3>
            <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => setSelectedKey(null)}>
              <FaTimesCircle />
            </button>
          </div>

          <div className="a-side-panel__profile">
            <div className="a-side-panel__avatar">
              {selectedNotification.type === 'message' ? <FaEnvelope /> : <FaCalendarAlt />}
            </div>
            <div>
              <strong className="a-side-panel__name">{selectedNotification.title}</strong>
              <span className="a-side-panel__sub">
                {selectedNotification.type === 'message' ? 'Mensaje sin leer' : 'Cita pendiente'}
              </span>
            </div>
          </div>

          <div className="a-side-panel__divider" />

          <div className="a-side-panel__field">
            <small>Resumen</small>
            <strong>{selectedNotification.subtitle}</strong>
          </div>

          <div className="a-side-panel__divider" />

          <div className="a-side-panel__field">
            <small>Detalle</small>
            <p className="a-side-panel__notes">{selectedNotification.body}</p>
          </div>

          <div className="a-side-panel__divider" />

          <div className="a-side-panel__field">
            <small>Fecha</small>
            <strong>{formatTimestamp(selectedNotification.timestamp)}</strong>
          </div>

          {selectedNotification.type === 'message' && (
            <>
              {selectedNotification.area && (
                <>
                  <div className="a-side-panel__divider" />
                  <div className="a-side-panel__field">
                    <small>Area</small>
                    <span className="a-badge a-badge--primary">{selectedNotification.area}</span>
                  </div>
                </>
              )}

              {(selectedNotification.email || selectedNotification.phone) && (
                <>
                  <div className="a-side-panel__divider" />
                  <div className="a-side-panel__field">
                    <small>Contacto</small>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                      {selectedNotification.email && <strong>{selectedNotification.email}</strong>}
                      {selectedNotification.phone && <strong>{selectedNotification.phone}</strong>}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {selectedNotification.type === 'appointment' && (
            <>
              <div className="a-side-panel__divider" />
              <div className="a-side-panel__row">
                <div className="a-side-panel__field">
                  <small>Fecha</small>
                  <strong>{selectedNotification.date || 'Sin fecha'}</strong>
                </div>
                <div className="a-side-panel__field">
                  <small>Hora</small>
                  <strong>{selectedNotification.time || '--:--'}</strong>
                </div>
              </div>

              {selectedNotification.format && (
                <>
                  <div className="a-side-panel__divider" />
                  <div className="a-side-panel__field">
                    <small>Modalidad</small>
                    <strong>{selectedNotification.format}</strong>
                  </div>
                </>
              )}
            </>
          )}

          <div className="a-side-panel__footer">
            <button
              type="button"
              className="a-btn a-btn--ghost a-btn--sm"
              onClick={() => openSource(selectedNotification)}
            >
              <FaArrowRight /> Abrir origen
            </button>

            {selectedNotification.type === 'message' ? (
              <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={markSelectedMessageAsRead}>
                <FaCheck /> Marcar leida
              </button>
            ) : (
              <>
                <button type="button" className="a-btn a-btn--success a-btn--sm" onClick={confirmSelectedAppointment}>
                  <FaCheck /> Confirmar
                </button>
                <button type="button" className="a-btn a-btn--danger a-btn--sm" onClick={cancelSelectedAppointment}>
                  <FaTimesCircle /> Cancelar
                </button>
              </>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

export default NotificationsPage;
