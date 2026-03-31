import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaFilter,
  FaGlobe,
  FaPhoneAlt,
  FaPlus,
  FaSearch,
  FaTimesCircle,
  FaUserTie,
  FaWhatsapp,
} from 'react-icons/fa';
import { useData } from '../../../context/DataContext';
import type { Appointment } from '../../../context/DataContext';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import { loadAdminWorkspaceSettings } from '../../../utils/adminWorkspace';
import './AdminAppointments.scss';

type StatusFilter = 'all' | Appointment['status'];
type SourceFilter = 'all' | NonNullable<Appointment['source']>;

const STATUS_LABELS: Record<Appointment['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

const SOURCE_LABELS: Record<NonNullable<Appointment['source']>, string> = {
  website: 'Pagina web',
  admin: 'Panel admin',
  walkin: 'Presencial',
  phone: 'Telefono',
  whatsapp: 'WhatsApp',
};

const FORMAT_LABELS: Record<NonNullable<Appointment['format']>, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  telefonica: 'Telefonica',
};

const CONFIRM_LABELS: Record<NonNullable<Appointment['confirmationPreference']>, string> = {
  whatsapp: 'WhatsApp',
  email: 'Correo',
  call: 'Llamada',
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const createEmptyFormData = (date?: string): Omit<Appointment, 'id'> => {
  const settings = loadAdminWorkspaceSettings();

  return {
    clientName: '',
    email: '',
    phone: '',
    date: date || new Date().toISOString().slice(0, 10),
    time: '',
    purpose: '',
    status: 'pending',
    lawyerId: '',
    notes: '',
    source: 'admin',
    format: settings.defaultAppointmentFormat,
    confirmationPreference: settings.defaultConfirmationChannel,
    createdAt: '',
    updatedAt: '',
  };
};

const compareAppointments = (left: Appointment, right: Appointment) =>
  new Date(`${left.date}T${left.time || '00:00'}`).getTime() -
  new Date(`${right.date}T${right.time || '00:00'}`).getTime();

const normalizeValue = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const formatDateLong = (value: string) => new Intl.DateTimeFormat('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00`));
const formatDateShort = (value: string) => new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'short' }).format(new Date(`${value}T00:00`));
const formatTime = (value: string) => value || '--:--';

const buildWhatsAppPhone = (phone?: string) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `1${digits}`;
  return digits;
};

const AdminAppointments = () => {
  const { appointments, addAppointment, updateAppointment, updateAppointmentStatus, team } = useData();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [focusedDate, setFocusedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>(createEmptyFormData());

  const sortedAppointments = useMemo(() => [...appointments].sort(compareAppointments), [appointments]);
  const selectedYear = currentMonth.getFullYear();
  const selectedMonthIndex = currentMonth.getMonth();

  const filteredAppointments = useMemo(() => {
    const query = normalizeValue(searchQuery.trim());
    return sortedAppointments.filter((appointment) => {
      const matchesQuery =
        !query ||
        normalizeValue(
          [
            appointment.clientName,
            appointment.email || '',
            appointment.phone || '',
            appointment.purpose,
            appointment.notes || '',
          ].join(' '),
        ).includes(query);

      const matchesStatus = statusFilter === 'all' ? true : appointment.status === statusFilter;
      const matchesSource = sourceFilter === 'all' ? true : appointment.source === sourceFilter;
      return matchesQuery && matchesStatus && matchesSource;
    });
  }, [searchQuery, sortedAppointments, sourceFilter, statusFilter]);

  const monthAppointments = useMemo(
    () =>
      filteredAppointments.filter((appointment) => {
        const date = new Date(`${appointment.date}T00:00`);
        return date.getFullYear() === selectedYear && date.getMonth() === selectedMonthIndex;
      }),
    [filteredAppointments, selectedMonthIndex, selectedYear],
  );

  const agendaAppointments = focusedDate
    ? monthAppointments.filter((appointment) => appointment.date === focusedDate)
    : monthAppointments;

  const selectedAppointment =
    agendaAppointments.find((appointment) => appointment.id === selectedAppId) ||
    monthAppointments.find((appointment) => appointment.id === selectedAppId) ||
    null;

  const selectedLawyer = team.find((member) => member.id === selectedAppointment?.lawyerId);
  const monthAppointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    monthAppointments.forEach((appointment) => {
      const entries = map.get(appointment.date) || [];
      entries.push(appointment);
      map.set(appointment.date, entries);
    });
    return map;
  }, [monthAppointments]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonthIndex, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => new Date(selectedYear, selectedMonthIndex, index - offset + 1));
  }, [selectedMonthIndex, selectedYear]);

  const metrics = useMemo(
    () => ({
      total: appointments.length,
      month: monthAppointments.length,
      web: appointments.filter((appointment) => appointment.source === 'website').length,
      pending: appointments.filter((appointment) => appointment.status === 'pending').length,
    }),
    [appointments, monthAppointments.length],
  );

  const sourceCounts = useMemo(
    () =>
      ['website', 'admin', 'walkin', 'phone', 'whatsapp'].map((source) => ({
        id: source,
        label: SOURCE_LABELS[source as NonNullable<Appointment['source']>],
        count: appointments.filter((appointment) => appointment.source === source).length,
      })),
    [appointments],
  );

  useEffect(() => {
    if (!agendaAppointments.length) {
      setSelectedAppId(null);
      return;
    }
    if (!agendaAppointments.some((appointment) => appointment.id === selectedAppId)) {
      setSelectedAppId(agendaAppointments[0].id);
    }
  }, [agendaAppointments, selectedAppId]);

  const openModal = () => {
    setFormData(createEmptyFormData(focusedDate || new Date(selectedYear, selectedMonthIndex, 1).toISOString().slice(0, 10)));
    setIsModalOpen(true);
  };

  const openModalForDate = (date: string) => {
    setFocusedDate(date);
    setFormData(createEmptyFormData(date));
    setIsModalOpen(true);
  };

  const moveMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + (direction === 'next' ? 1 : -1), 1));
    setFocusedDate('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(createEmptyFormData());
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const createdAt = new Date().toISOString();
    await addAppointment({ ...formData, createdAt });
    setCurrentMonth(new Date(`${formData.date}T00:00`));
    setFocusedDate(formData.date);
    closeModal();
  };

  const confirmationText = selectedAppointment
    ? encodeURIComponent(
        `Hola ${selectedAppointment.clientName}, le escribimos de JR&L Inversiones para confirmar su cita del ${formatDateLong(selectedAppointment.date)} a las ${formatTime(selectedAppointment.time)}. Favor responder para validar asistencia.`,
      )
    : '';
  const emailHref = selectedAppointment?.email
    ? `mailto:${selectedAppointment.email}?subject=${encodeURIComponent('Confirmacion de cita JR&L Inversiones')}&body=${confirmationText}`
    : '';
  const whatsappHref = selectedAppointment?.phone
    ? `https://wa.me/${buildWhatsAppPhone(selectedAppointment.phone)}?text=${confirmationText}`
    : '';
  const callHref = selectedAppointment?.phone ? `tel:${selectedAppointment.phone}` : '';

  return (
    <div className="appointments-studio services-studio">
      <PageHelp
        title="Citas"
        description="Agenda centralizada con calendario grande, origen de citas y acciones de confirmacion."
        features={[
          'Citas creadas desde pagina web, panel admin, presencial, telefono o WhatsApp.',
          'Calendario amplio con navegacion por meses y anos.',
          'Acciones de confirmacion por correo, WhatsApp o llamada.',
        ]}
      />

      <section className="appointments-hero">
        <div className="appointments-hero__copy">
          <span className="appointments-hero__eyebrow">Agenda legal</span>
          <h2>Calendario ejecutivo para toda la agenda del despacho.</h2>
          <p>Ahora las citas muestran de donde llegan, como se atenderan y por que canal conviene confirmarlas.</p>
        </div>

        <div className="appointments-hero__stats">
          <div className="appointments-hero__stat appointments-hero__stat--primary"><span>Total</span><strong>{metrics.total}</strong><small>citas registradas</small></div>
          <div className="appointments-hero__stat"><span>Del mes</span><strong>{metrics.month}</strong><small>segun filtros</small></div>
          <div className="appointments-hero__stat"><span>Web</span><strong>{metrics.web}</strong><small>entradas del sitio</small></div>
          <div className="appointments-hero__stat"><span>Pendientes</span><strong>{metrics.pending}</strong><small>por confirmar</small></div>
        </div>
      </section>

      <section className="appointments-toolbar">
        <label className="appointments-search" aria-label="Buscar citas">
          <FaSearch />
          <input type="search" placeholder="Buscar por cliente, correo, telefono o motivo" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        </label>

        <div className="appointments-filters">
          {(['all', 'pending', 'confirmed', 'cancelled'] as StatusFilter[]).map((status) => (
            <button key={status} type="button" className={`appointments-filter ${statusFilter === status ? 'is-active' : ''}`} onClick={() => setStatusFilter(status)}>
              <FaFilter />
              <span>{status === 'all' ? 'Todas' : STATUS_LABELS[status]}</span>
            </button>
          ))}
        </div>

        <div className="appointments-filters appointments-filters--sources">
          {(['all', 'website', 'admin', 'walkin', 'phone', 'whatsapp'] as SourceFilter[]).map((source) => (
            <button key={source} type="button" className={`appointments-filter ${sourceFilter === source ? 'is-active' : ''}`} onClick={() => setSourceFilter(source)}>
              {source === 'all' ? 'Origen: todos' : SOURCE_LABELS[source]}
            </button>
          ))}
        </div>

        <button type="button" className="admin-btn-primary appointments-toolbar__cta" onClick={openModal}>
          <FaPlus />
          Nueva cita
        </button>
      </section>

      <div className="appointments-planner">
        <section className="appointments-card appointments-calendar-card">
          <div className="appointments-card__header">
            <div>
              <span>Calendario</span>
              <h3>Vista mensual</h3>
            </div>
            {focusedDate ? <button type="button" className="appointments-clear" onClick={() => setFocusedDate('')}>Ver mes</button> : null}
          </div>

          <div className="appointments-calendar__head">
            <button type="button" className="appointments-calendar__nav" onClick={() => moveMonth('prev')}>
              &lt;
            </button>
            <strong>{MONTH_LABELS[selectedMonthIndex]} {selectedYear}</strong>
            <button type="button" className="appointments-calendar__nav" onClick={() => moveMonth('next')}>
              &gt;
            </button>
          </div>

          <div className="appointments-calendar">
            <div className="appointments-calendar__weekdays">
              {WEEKDAY_LABELS.map((label) => <span key={label}>{label}</span>)}
            </div>

            <div className="appointments-calendar__grid">
              {calendarCells.map((dateCell) => {
                const dateValue = dateCell.toISOString().slice(0, 10);
                const isCurrentMonth = dateCell.getMonth() === selectedMonthIndex;
                const isFocused = focusedDate === dateValue;
                const items = monthAppointmentsByDate.get(dateValue) || [];
                return (
                  <button
                    key={dateValue}
                    type="button"
                    className={`appointments-day ${isCurrentMonth ? '' : 'is-muted'} ${isFocused ? 'is-focused' : ''} ${items.length ? 'has-items' : ''}`}
                    onClick={() => openModalForDate(dateValue)}
                  >
                    <div className="appointments-day__head">
                      <strong>{dateCell.getDate()}</strong>
                      {items.length ? <span>{items.length}</span> : null}
                    </div>
                    <div className="appointments-day__events">
                      {items.slice(0, 3).map((appointment) => (
                        <span key={appointment.id} className={`appointments-day__event appointments-day__event--${appointment.status}`}>
                          {appointment.clientName}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="appointments-card appointments-overview-card">
          <div className="appointments-card__header">
            <div>
              <span>Origen</span>
              <h3>Entrada de citas</h3>
            </div>
            <FaGlobe />
          </div>

          <div className="appointments-source-list">
            {sourceCounts.map((item) => (
              <article key={item.id} className="appointments-source-item">
                <div>
                  <strong>{item.label}</strong>
                  <span>canal activo</span>
                </div>
                <b>{item.count}</b>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <div className="appointments-workspace">
        <section className="appointments-card appointments-list-card">
          <div className="appointments-card__header">
            <div>
              <span>Agenda</span>
              <h3>{focusedDate ? formatDateLong(focusedDate) : `Citas de ${MONTH_LABELS[selectedMonthIndex]} ${selectedYear}`}</h3>
            </div>
            <small>{agendaAppointments.length} item(s)</small>
          </div>

          <div className="appointments-list">
            {agendaAppointments.length ? (
              agendaAppointments.map((appointment) => (
                <button key={appointment.id} type="button" className={`appointment-list-item ${appointment.id === selectedAppId ? 'is-selected' : ''}`} onClick={() => setSelectedAppId(appointment.id)}>
                  <div className="appointment-list-item__time">
                    <strong>{formatTime(appointment.time)}</strong>
                    <span>{formatDateShort(appointment.date)}</span>
                  </div>
                  <div className="appointment-list-item__content">
                    <strong>{appointment.clientName}</strong>
                    <span>{appointment.purpose}</span>
                    <small>{SOURCE_LABELS[appointment.source || 'website']} · {FORMAT_LABELS[appointment.format || 'presencial']}</small>
                  </div>
                  <div className={`appointment-list-item__status appointment-list-item__status--${appointment.status}`}>
                    {appointment.status === 'confirmed' ? <FaCheckCircle /> : appointment.status === 'cancelled' ? <FaTimesCircle /> : <FaClock />}
                  </div>
                </button>
              ))
            ) : (
              <div className="appointments-empty">
                <h4>No hay citas en esta vista.</h4>
                <p>Cambia el mes, el origen o registra una cita nueva.</p>
              </div>
            )}
          </div>
        </section>

        <section className="appointments-card appointments-detail-card">
          <div className="appointments-card__header">
            <div>
              <span>Detalle</span>
              <h3>Ficha de la cita</h3>
            </div>
            {selectedAppointment ? <small>{STATUS_LABELS[selectedAppointment.status]}</small> : null}
          </div>

          {selectedAppointment ? (
            <div className="appointment-detail">
              <div className="appointment-detail__hero">
                <div>
                  <h4>{selectedAppointment.clientName}</h4>
                  <p>{selectedAppointment.purpose}</p>
                </div>
                <span className={`appointment-status-pill appointment-status-pill--${selectedAppointment.status}`}>{STATUS_LABELS[selectedAppointment.status]}</span>
              </div>

              <div className="appointment-detail__meta">
                <div><small>Fecha</small><strong>{formatDateLong(selectedAppointment.date)}</strong></div>
                <div><small>Hora</small><strong>{formatTime(selectedAppointment.time)}</strong></div>
                <div><small>Origen</small><strong>{SOURCE_LABELS[selectedAppointment.source || 'website']}</strong></div>
                <div><small>Formato</small><strong>{FORMAT_LABELS[selectedAppointment.format || 'presencial']}</strong></div>
                <div><small>Correo</small><strong>{selectedAppointment.email || 'No registrado'}</strong></div>
                <div><small>Telefono</small><strong>{selectedAppointment.phone || 'No registrado'}</strong></div>
              </div>

              <div className="appointment-detail__actions">
                {(['pending', 'confirmed', 'cancelled'] as Appointment['status'][]).map((status) => (
                  <button key={status} type="button" className={`status-action status-action--${status} ${selectedAppointment.status === status ? 'is-active' : ''}`} onClick={() => updateAppointmentStatus(selectedAppointment.id, status)}>
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>

              <div className="appointment-contact-actions">
                {selectedAppointment.email ? <a className="appointment-contact-btn" href={emailHref}><FaEnvelope />Enviar correo</a> : <span className="appointment-contact-btn is-disabled"><FaEnvelope />Sin correo</span>}
                {selectedAppointment.phone ? <a className="appointment-contact-btn" href={whatsappHref} target="_blank" rel="noreferrer"><FaWhatsapp />WhatsApp</a> : <span className="appointment-contact-btn is-disabled"><FaWhatsapp />Sin WhatsApp</span>}
                {selectedAppointment.phone ? <a className="appointment-contact-btn" href={callHref}><FaPhoneAlt />Llamar</a> : <span className="appointment-contact-btn is-disabled"><FaPhoneAlt />Sin telefono</span>}
              </div>

              <div className="appointment-detail__grid">
                <div className="form-group">
                  <label>Abogado asignado</label>
                  <select value={selectedAppointment.lawyerId || ''} onChange={(event) => updateAppointment(selectedAppointment.id, { lawyerId: event.target.value })}>
                    <option value="">Sin asignar</option>
                    {team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Preferencia de confirmacion</label>
                  <select value={selectedAppointment.confirmationPreference || 'whatsapp'} onChange={(event) => updateAppointment(selectedAppointment.id, { confirmationPreference: event.target.value as Appointment['confirmationPreference'] })}>
                    {Object.entries(CONFIRM_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Origen</label>
                  <select value={selectedAppointment.source || 'website'} onChange={(event) => updateAppointment(selectedAppointment.id, { source: event.target.value as Appointment['source'] })}>
                    {Object.entries(SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Formato</label>
                  <select value={selectedAppointment.format || 'presencial'} onChange={(event) => updateAppointment(selectedAppointment.id, { format: event.target.value as Appointment['format'] })}>
                    {Object.entries(FORMAT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input type="email" value={selectedAppointment.email || ''} onChange={(event) => updateAppointment(selectedAppointment.id, { email: event.target.value })} />
                </div>
                <div className="form-group">
                  <label>Telefono</label>
                  <input type="text" value={selectedAppointment.phone || ''} onChange={(event) => updateAppointment(selectedAppointment.id, { phone: event.target.value })} />
                </div>
                <div className="form-group form-group--full">
                  <label>Motivo principal</label>
                  <input type="text" value={selectedAppointment.purpose} onChange={(event) => updateAppointment(selectedAppointment.id, { purpose: event.target.value })} />
                </div>
              </div>

              <div className="appointment-notes">
                <div className="appointment-notes__header">
                  <h4>Notas internas</h4>
                  <FaUserTie />
                </div>
                <textarea value={selectedAppointment.notes || ''} onChange={(event) => updateAppointment(selectedAppointment.id, { notes: event.target.value })} placeholder="Confirmacion, referencias, documentos pendientes y observaciones..." />
                <p>Abogado: {selectedLawyer ? selectedLawyer.name : 'Sin asignar'}.</p>
              </div>
            </div>
          ) : (
            <div className="appointments-empty">
              <h4>No hay una cita seleccionada.</h4>
              <p>Seleccione una fecha con actividad o cree una nueva cita.</p>
            </div>
          )}
        </section>
      </div>

      {isModalOpen ? (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--appointments" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Nueva cita</h3>
              <button type="button" className="admin-modal__close" onClick={closeModal}>x</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="admin-modal__body appointments-form">
              <div className="form-group">
                <label>Cliente o prospecto</label>
                <input required type="text" value={formData.clientName} onChange={(event) => setFormData((current) => ({ ...current, clientName: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Correo</label>
                <input type="email" value={formData.email || ''} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Telefono</label>
                <input type="text" value={formData.phone || ''} onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Motivo</label>
                <input required type="text" value={formData.purpose} onChange={(event) => setFormData((current) => ({ ...current, purpose: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input required type="date" value={formData.date} onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <input required type="time" value={formData.time} onChange={(event) => setFormData((current) => ({ ...current, time: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Origen</label>
                <select value={formData.source || 'admin'} onChange={(event) => setFormData((current) => ({ ...current, source: event.target.value as Appointment['source'] }))}>
                  {Object.entries(SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Formato</label>
                <select value={formData.format || 'presencial'} onChange={(event) => setFormData((current) => ({ ...current, format: event.target.value as Appointment['format'] }))}>
                  {Object.entries(FORMAT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Confirmacion preferida</label>
                <select value={formData.confirmationPreference || 'whatsapp'} onChange={(event) => setFormData((current) => ({ ...current, confirmationPreference: event.target.value as Appointment['confirmationPreference'] }))}>
                  {Object.entries(CONFIRM_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Abogado asignado</label>
                <select value={formData.lawyerId || ''} onChange={(event) => setFormData((current) => ({ ...current, lawyerId: event.target.value }))}>
                  <option value="">Sin asignar</option>
                  {team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </div>
              <div className="form-group form-group--full">
                <label>Notas</label>
                <textarea rows={4} value={formData.notes || ''} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} />
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">Guardar cita</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminAppointments;
