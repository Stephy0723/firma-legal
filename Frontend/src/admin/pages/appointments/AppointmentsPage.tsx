import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import AdminModal from '../../components/AdminModal';
import {
  FaCalendarAlt, FaSearch, FaTh, FaList, FaPlus, FaEdit, FaTrash,
  FaPhone, FaEnvelope, FaUserTie, FaClock, FaEye, FaTimes,
  FaWhatsapp, FaMapMarkerAlt, FaInfoCircle,
} from 'react-icons/fa';
import type { Appointment } from '../../../context/DataContext';

type View = 'card' | 'list';
type StatusFilter = 'all' | Appointment['status'];

const STATUS_BADGE: Record<string, string> = {
  pending:   'a-badge--warning',
  confirmed: 'a-badge--success',
  cancelled: 'a-badge--danger',
};
const STATUS_LABEL: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};
const FORMAT_LABEL: Record<string, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  telefonica: 'Telefónica',
};
const SOURCE_LABEL: Record<string, string> = {
  website: 'Sitio web',
  admin: 'Admin',
  walkin: 'Presencial',
  phone: 'Teléfono',
  whatsapp: 'WhatsApp',
};

const EMPTY_FORM = {
  clientName: '',
  email: '',
  phone: '',
  date: '',
  time: '09:00',
  purpose: '',
  status: 'pending' as Appointment['status'],
  lawyerId: '',
  format: 'presencial' as NonNullable<Appointment['format']>,
  notes: '',
};

const AppointmentsPage = () => {
  const { appointments, team, addAppointment, updateAppointment, deleteAppointment } = useData();
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const filtered = appointments.filter((a) => {
    const matchSearch = [a.clientName, a.email, a.phone, a.purpose].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedAppt = appointments.find((a) => a.id === selected);
  const viewed = appointments.find((a) => a.id === viewId);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setModal('add');
  };
  const openEdit = (id: string) => {
    const a = appointments.find((x) => x.id === id);
    if (!a) return;
    setForm({
      clientName: a.clientName, email: a.email || '', phone: a.phone || '',
      date: a.date, time: a.time, purpose: a.purpose, status: a.status,
      lawyerId: a.lawyerId || '', format: a.format || 'presencial', notes: a.notes || '',
    });
    setSelected(id);
    setModal('edit');
  };
  const openDelete = (id: string) => { setSelected(id); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = () => {
    if (!form.clientName.trim() || !form.date) return;
    if (modal === 'add') {
      addAppointment({ ...form, source: 'admin', confirmationPreference: 'whatsapp' });
    } else if (modal === 'edit' && selected) {
      updateAppointment(selected, { ...form });
    }
    closeModal();
  };

  const lawyerName = (id: string) => team.find((m) => m.id === id)?.name || '—';
  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const whatsappUrl = (phone: string) => {
    const clean = phone.replace(/[^0-9+]/g, '');
    return `https://wa.me/${clean.startsWith('+') ? clean.slice(1) : clean}`;
  };

  return (
    <div className={`a-page a-split-layout ${viewed ? 'a-split-layout--open' : ''}`}>
      {/* ── Main content ── */}
      <div className="a-split-layout__main">
        <div className="a-page-header">
          <div className="a-page-header__title">
            <h2>Citas</h2>
            <p>
              {appointments.length} citas —{' '}
              {appointments.filter((a) => a.status === 'pending').length} pendientes
            </p>
          </div>
          <div className="a-page-header__actions">
            <button type="button" className="a-btn a-btn--primary" onClick={openAdd}>
              <FaPlus /> Nueva cita
            </button>
          </div>
        </div>

        <div className="a-toolbar">
          <div className="a-search">
            <FaSearch />
            <input
              placeholder="Buscar por cliente, motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['all', 'pending', 'confirmed', 'cancelled'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`a-filter-chip ${statusFilter === s ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'Todas' : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="a-view-toggle">
            <button type="button" className={view === 'card' ? 'is-active' : ''} onClick={() => setView('card')} title="Tarjetas"><FaTh /></button>
            <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} title="Lista"><FaList /></button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="a-empty">
            <FaCalendarAlt />
            <h3>Sin citas</h3>
            <p>{search || statusFilter !== 'all' ? 'No hay resultados.' : 'Aún no hay citas registradas.'}</p>
            {!search && statusFilter === 'all' && (
              <button type="button" className="a-btn a-btn--primary" onClick={openAdd}><FaPlus /> Agendar cita</button>
            )}
          </div>
        ) : view === 'card' ? (
              <div className="a-card-grid">
                {filtered.map((a) => (
                  <div key={a.id} className={`a-card ${viewId === a.id ? 'a-card--active' : ''}`}>
                    <div className="a-card__header">
                      <div>
                        <p className="a-card__title">{a.clientName}</p>
                        <p className="a-card__subtitle">{a.purpose}</p>
                      </div>
                      <span className={`a-badge a-badge--dot ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                    </div>
                    <div className="a-card__meta">
                      <span><FaCalendarAlt />{a.date} — {a.time}</span>
                      {a.email && <span><FaEnvelope />{a.email}</span>}
                      {a.phone && <span><FaPhone />{a.phone}</span>}
                      {a.lawyerId && <span><FaUserTie />{lawyerName(a.lawyerId)}</span>}
                      <span><FaClock />{FORMAT_LABEL[a.format || 'presencial']}</span>
                    </div>
                    {a.notes && <p style={{ fontSize: '0.8rem', color: 'var(--tx2)', margin: 0 }}>{a.notes}</p>}
                    <div className="a-card__footer">
                      <span style={{ fontSize: '0.72rem', color: 'var(--tx3)' }}>
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString('es-ES') : a.date}
                      </span>
                      <div className="a-card__actions">
                        <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => setViewId(viewId === a.id ? null : a.id)} title="Ver detalles"><FaEye /></button>
                        <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(a.id)} title="Editar"><FaEdit /></button>
                        <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(a.id)} title="Eliminar"><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="a-table-wrap">
                <table className="a-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Fecha y hora</th>
                      <th>Motivo</th>
                      <th>Abogado</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} className={viewId === a.id ? 'is-active' : ''}>
                        <td>
                          <div>
                            <div className="a-table__name">{a.clientName}</div>
                            {a.phone && <div style={{ fontSize: '0.75rem', color: 'var(--tx3)' }}>{a.phone}</div>}
                          </div>
                        </td>
                        <td>{a.date} {a.time}</td>
                        <td>{a.purpose}</td>
                        <td>{a.lawyerId ? lawyerName(a.lawyerId) : '—'}</td>
                        <td><span className={`a-badge a-badge--dot ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span></td>
                        <td>
                          <div className="a-table__actions">
                            <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => setViewId(viewId === a.id ? null : a.id)}><FaEye /></button>
                            <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(a.id)}><FaEdit /></button>
                            <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(a.id)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>

      {/* ── Detail side panel ── */}
      {viewed && (
            <aside className="a-side-panel">
              <div className="a-side-panel__header">
                <h3>Detalle de cita</h3>
                <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => setViewId(null)}><FaTimes /></button>
              </div>

              {/* Client info */}
              <div className="a-side-panel__profile">
                <div className="a-side-panel__avatar">{initials(viewed.clientName)}</div>
                <div>
                  <strong className="a-side-panel__name">{viewed.clientName}</strong>
                  {viewed.email && <span className="a-side-panel__sub">{viewed.email}</span>}
                  {viewed.phone && <span className="a-side-panel__sub">{viewed.phone}</span>}
                </div>
              </div>

              <div className="a-side-panel__divider" />

              <div className="a-side-panel__field">
                <small>Fecha y hora</small>
                <strong><FaCalendarAlt /> {viewed.date} — {viewed.time}</strong>
              </div>

              <div className="a-side-panel__divider" />

              <div className="a-side-panel__field">
                <small>Motivo</small>
                <strong>{viewed.purpose || '—'}</strong>
              </div>

              <div className="a-side-panel__divider" />

              {viewed.lawyerId && (
                <>
                  <div className="a-side-panel__field">
                    <small>Abogado encargado</small>
                    <strong><FaUserTie /> {lawyerName(viewed.lawyerId)}</strong>
                  </div>
                  <div className="a-side-panel__divider" />
                </>
              )}

              <div className="a-side-panel__row">
                <div className="a-side-panel__field">
                  <small>Modalidad</small>
                  <strong><FaMapMarkerAlt /> {FORMAT_LABEL[viewed.format || 'presencial']}</strong>
                </div>
                <div className="a-side-panel__field">
                  <small>Estado</small>
                  <span className={`a-badge a-badge--dot ${STATUS_BADGE[viewed.status]}`}>{STATUS_LABEL[viewed.status]}</span>
                </div>
              </div>

              <div className="a-side-panel__divider" />

              {viewed.source && (
                <>
                  <div className="a-side-panel__field">
                    <small>Origen</small>
                    <strong><FaInfoCircle /> {SOURCE_LABEL[viewed.source] || viewed.source}</strong>
                  </div>
                  <div className="a-side-panel__divider" />
                </>
              )}

              {viewed.notes && (
                <>
                  <div className="a-side-panel__field">
                    <small>Notas</small>
                    <p className="a-side-panel__notes">{viewed.notes}</p>
                  </div>
                  <div className="a-side-panel__divider" />
                </>
              )}

              {/* Quick status change */}
              <div className="a-side-panel__field">
                <small>Cambiar estado</small>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {(['pending', 'confirmed', 'cancelled'] as Appointment['status'][]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`a-btn a-btn--sm ${viewed.status === s ? (s === 'confirmed' ? 'a-btn--success' : s === 'cancelled' ? 'a-btn--danger' : 'a-btn--primary') : ''}`}
                      onClick={() => updateAppointment(viewed.id, { status: s })}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="a-side-panel__divider" />

              {/* Contact actions */}
              <div className="a-side-panel__field">
                <small>Contactar</small>
                <div className="a-side-panel__contacts">
                  {viewed.email && (
                    <a href={`mailto:${viewed.email}?subject=Cita: ${viewed.purpose}`} className="a-contact-pill" target="_blank" rel="noopener noreferrer">
                      <FaEnvelope /> Correo
                    </a>
                  )}
                  {viewed.phone && (
                    <a href={whatsappUrl(viewed.phone)} className="a-contact-pill a-contact-pill--whatsapp" target="_blank" rel="noopener noreferrer">
                      <FaWhatsapp /> WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="a-side-panel__footer">
                <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={() => { openEdit(viewed.id); setViewId(null); }}>
                  <FaEdit /> Editar
                </button>
                <button type="button" className="a-btn a-btn--danger a-btn--sm" onClick={() => { openDelete(viewed.id); setViewId(null); }}>
                  <FaTrash /> Eliminar
                </button>
              </div>
            </aside>
          )}

      {/* Add / Edit Modal */}
      <AdminModal
        open={modal === 'add' || modal === 'edit'}
        title={modal === 'add' ? 'Nueva cita' : 'Editar cita'}
        subtitle={modal === 'edit' ? `Editando cita de ${selectedAppt?.clientName}` : undefined}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modal === 'add' ? 'Crear cita' : 'Guardar cambios'}
        size="lg"
      >
        <div className="a-form a-form--2col">
          <div className="a-field a-field--full">
            <label>Nombre del cliente *</label>
            <input className="a-input" placeholder="Nombre completo" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Correo</label>
            <input className="a-input" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Teléfono</label>
            <input className="a-input" placeholder="+506 8888-8888" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Fecha *</label>
            <input className="a-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Hora</label>
            <input className="a-input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <div className="a-field a-field--full">
            <label>Motivo de la cita</label>
            <input className="a-input" placeholder="Consulta general, divorcio, contrato..." value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Estado</label>
            <select className="a-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Appointment['status'] })}>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div className="a-field">
            <label>Modalidad</label>
            <select className="a-select" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as NonNullable<Appointment['format']> })}>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="telefonica">Telefónica</option>
            </select>
          </div>
          <div className="a-field a-field--full">
            <label>Abogado asignado</label>
            <select className="a-select" value={form.lawyerId} onChange={(e) => setForm({ ...form, lawyerId: e.target.value })}>
              <option value="">— Sin asignar —</option>
              {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="a-field a-field--full">
            <label>Notas</label>
            <textarea className="a-textarea" placeholder="Instrucciones, observaciones..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </AdminModal>

      {/* Delete */}
      <AdminModal
        open={modal === 'delete'}
        title="Cancelar cita"
        subtitle={`¿Eliminar la cita de ${selectedAppt?.clientName}?`}
        onClose={closeModal}
        onSubmit={() => { if (selected) deleteAppointment(selected); closeModal(); }}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>Esta acción no se puede deshacer.</p>
      </AdminModal>
    </div>
  );
};

export default AppointmentsPage;
