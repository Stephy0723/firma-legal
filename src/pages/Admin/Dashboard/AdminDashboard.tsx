import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { 
  FaInbox, FaCalendarCheck, FaBalanceScale, FaUserTie, 
  FaChevronLeft, FaChevronRight, FaArrowRight,
  FaFileExport, FaBell, FaClock, FaChartLine
} from 'react-icons/fa';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const { services, team, messages, appointments } = useData();
  const navigate = useNavigate();

  const pendingMessages = messages.filter(m => !m.read).length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const totalClients = new Set(appointments.map(a => a.clientName)).size;

  // ── Calendar State ──
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const appointmentDates = useMemo(() => {
    const dates = new Set<string>();
    appointments.forEach(a => {
      const d = new Date(a.date);
      dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return dates;
  }, [appointments]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const isToday = (day: number) => 
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const hasEvent = (day: number) => 
    appointmentDates.has(`${year}-${month}-${day}`);

  // ── Notifications ──
  const notifications = useMemo(() => {
    const notifs: { text: string; type: 'warning' | 'info' | 'success' }[] = [];
    if (pendingMessages > 0) notifs.push({ text: `${pendingMessages} mensaje(s) sin leer`, type: 'warning' });
    if (pendingAppointments > 0) notifs.push({ text: `${pendingAppointments} cita(s) pendiente(s) por confirmar`, type: 'warning' });
    if (confirmedAppointments > 0) notifs.push({ text: `${confirmedAppointments} cita(s) confirmada(s) esta semana`, type: 'success' });
    if (notifs.length === 0) notifs.push({ text: 'Todo en orden. Sin alertas pendientes.', type: 'info' });
    return notifs;
  }, [pendingMessages, pendingAppointments, confirmedAppointments]);

  // Export functionality
  const handleExportCSV = () => {
    const headers = ['Cliente', 'Fecha', 'Hora', 'Propósito', 'Estado'];
    const rows = appointments.map(a => [a.clientName, a.date, a.time, a.purpose, a.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citas_jrl_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      {/* ── NOTIFICATIONS BAR ── */}
      <div className="dashboard-notifications">
        {notifications.map((n, i) => (
          <div key={i} className={`notif-item notif-item--${n.type}`}>
            <FaBell className="notif-icon" />
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* ── ROW 1: Stats ── */}
      <div className="dashboard-stats-grid">
        <div className="stat-card" onClick={() => navigate('/admin/inbox')}>
          <div className="stat-card__icon"><FaInbox /></div>
          <div className="stat-card__info">
            <span>Mensajes nuevos</span>
            <h3>{pendingMessages}</h3>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/admin/appointments')}>
          <div className="stat-card__icon"><FaCalendarCheck /></div>
          <div className="stat-card__info">
            <span>Citas pendientes</span>
            <h3>{pendingAppointments}</h3>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/admin/services')}>
          <div className="stat-card__icon"><FaBalanceScale /></div>
          <div className="stat-card__info">
            <span>Servicios activos</span>
            <h3>{services.length}</h3>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/admin/team')}>
          <div className="stat-card__icon"><FaUserTie /></div>
          <div className="stat-card__info">
            <span>Equipo</span>
            <h3>{team.length}</h3>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Calendar + Upcoming ── */}
      <div className="dashboard-row-2">
        <div className="mini-calendar">
          <div className="mini-calendar__header">
            <button onClick={prevMonth}><FaChevronLeft /></button>
            <span>{monthNames[month]} {year}</span>
            <button onClick={nextMonth}><FaChevronRight /></button>
          </div>
          <div className="mini-calendar__grid">
            {dayNames.map(d => <div key={d} className="mini-calendar__day-name">{d}</div>)}
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`mini-calendar__day ${day === null ? 'empty' : ''} ${day && isToday(day) ? 'mini-calendar__day--today' : ''} ${day && hasEvent(day) ? 'mini-calendar__day--has-event' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="upcoming-panel">
          <div className="upcoming-panel__header">
            <h3>Próximas citas</h3>
            <button className="link-btn" onClick={() => navigate('/admin/appointments')}>
              Ver todas <FaArrowRight />
            </button>
          </div>
          <div className="upcoming-panel__list">
            {appointments.length === 0 ? (
              <p className="empty-text">No hay citas programadas.</p>
            ) : (
              appointments
                .filter(a => a.status !== 'cancelled')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(app => (
                  <div className="upcoming-item" key={app.id}>
                    <div className="upcoming-item__date">
                      <span className="day">{new Date(app.date).getDate()}</span>
                      <span className="month">{monthNames[new Date(app.date).getMonth()].slice(0, 3)}</span>
                    </div>
                    <div className="upcoming-item__info">
                      <strong>{app.clientName}</strong>
                      <span>{app.purpose} — {app.time}</span>
                    </div>
                    <span className={`admin-badge admin-badge--${app.status}`}>
                      {app.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Activity + Summary + Tools ── */}
      <div className="dashboard-row-3">
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Actividad reciente</h3>
          </div>
          <div className="activity-list">
            {messages.slice(0, 4).map(msg => (
              <div className="activity-item" key={msg.id}>
                <div className="activity-icon"><FaInbox /></div>
                <div className="activity-info">
                  <p>Mensaje de <strong>{msg.name}</strong></p>
                  <span>{new Date(msg.date).toLocaleDateString('es-DO')}</span>
                </div>
              </div>
            ))}
            {appointments.slice(0, 3).map(app => (
              <div className="activity-item" key={app.id}>
                <div className="activity-icon"><FaCalendarCheck /></div>
                <div className="activity-info">
                  <p>Cita: <strong>{app.clientName}</strong></p>
                  <span>{new Date(app.date).toLocaleDateString('es-DO')} — {app.time}</span>
                </div>
              </div>
            ))}
            {messages.length === 0 && appointments.length === 0 && (
              <p className="empty-text">La actividad del CRM aparecerá aquí.</p>
            )}
          </div>
        </div>

        <div className="dashboard-sidebar-panels">
          {/* Summary */}
          <div className="content-panel summary-panel">
            <div className="panel-header">
              <h3 className="panel-title"><FaChartLine style={{marginRight: '0.5rem', fontSize: '0.85rem'}} /> Resumen</h3>
            </div>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Total mensajes</span>
                <strong>{messages.length}</strong>
              </div>
              <div className="summary-row">
                <span>Sin leer</span>
                <strong>{pendingMessages}</strong>
              </div>
              <div className="summary-row">
                <span>Clientes únicos</span>
                <strong>{totalClients}</strong>
              </div>
              <div className="summary-row">
                <span>Citas confirmadas</span>
                <strong>{confirmedAppointments}</strong>
              </div>
              <div className="summary-row">
                <span>Servicios</span>
                <strong>{services.length}</strong>
              </div>
              <div className="summary-row">
                <span>Miembros del equipo</span>
                <strong>{team.length}</strong>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="content-panel tools-panel">
            <div className="panel-header">
              <h3 className="panel-title">Herramientas</h3>
            </div>
            <div className="tools-grid">
              <button className="tool-btn" onClick={handleExportCSV}>
                <FaFileExport />
                <span>Exportar citas (CSV)</span>
              </button>
              <button className="tool-btn" onClick={() => navigate('/admin/appointments')}>
                <FaClock />
                <span>Nueva cita rápida</span>
              </button>
              <button className="tool-btn" onClick={() => navigate('/admin/inbox')}>
                <FaInbox />
                <span>Revisar inbox</span>
              </button>
              <button className="tool-btn" onClick={() => navigate('/admin/services')}>
                <FaBalanceScale />
                <span>Editar servicios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
