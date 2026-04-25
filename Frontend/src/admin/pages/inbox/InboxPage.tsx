import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import AdminModal from '../../components/AdminModal';
import {
  FaInbox, FaSearch, FaTrash, FaEnvelope, FaEnvelopeOpen,
  FaWhatsapp, FaTimes, FaCheckDouble, FaCircle, FaEye,
  FaCalendarAlt,
} from 'react-icons/fa';


const InboxPage = () => {
  const { messages, markMessageRead, deleteMessage } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  const filtered = messages.filter((m) => {
    const matchSearch = [m.name, m.email, m.area, m.message].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'unread' && !m.read) || (filter === 'read' && m.read);
    return matchSearch && matchFilter;
  });

  const unreadCount = messages.filter((m) => !m.read).length;
  const viewed = messages.find((m) => m.id === viewId);

  const openMessage = (id: string) => {
    setViewId(viewId === id ? null : id);
    const m = messages.find((x) => x.id === id);
    if (m && !m.read) markMessageRead(m.id);
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return date; }
  };

  const whatsappUrl = (phone: string) => {
    const clean = phone.replace(/[^0-9+]/g, '');
    return `https://wa.me/${clean.startsWith('+') ? clean.slice(1) : clean}`;
  };

  return (
    <div className={`a-page a-split-layout ${viewed ? 'a-split-layout--open' : ''}`}>
      <div className="a-split-layout__main">
        <div className="a-page-header">
          <div className="a-page-header__title">
            <h2>Consultas</h2>
            <p>{messages.length} consultas{unreadCount > 0 && ` · ${unreadCount} sin leer`}</p>
          </div>
          {unreadCount > 0 && (
            <div className="a-page-header__actions">
              <button type="button" className="a-btn a-btn--ghost"
                onClick={() => messages.filter((m) => !m.read).forEach((m) => markMessageRead(m.id))}>
                <FaCheckDouble /> Marcar todos leídos
              </button>
            </div>
          )}
        </div>

        <div className="a-toolbar">
          <div className="a-search">
            <FaSearch />
            <input placeholder="Buscar por nombre, correo, área..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="inbox-filters">
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button key={f} type="button" className={`a-filter-chip ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? `Todos (${messages.length})` : f === 'unread' ? `Sin leer (${unreadCount})` : `Leídos (${messages.length - unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="a-empty">
            <FaInbox />
            <h3>Sin consultas</h3>
            <p>{search || filter !== 'all' ? 'No se encontraron resultados.' : 'No hay consultas recibidas.'}</p>
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Remitente</th>
                  <th>Área</th>
                  <th>Mensaje</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className={`${!m.read ? 'is-unread' : ''} ${viewId === m.id ? 'is-active' : ''}`}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div className="a-card__avatar">{initials(m.name)}</div>
                        <div>
                          <div className="a-table__name">{m.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--tx3)' }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="a-badge a-badge--primary">{m.area}</span></td>
                    <td><span style={{ fontSize: '0.82rem', color: 'var(--tx2)' }}>{m.message.length > 60 ? m.message.slice(0, 60) + '...' : m.message}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--tx3)', whiteSpace: 'nowrap' }}>{formatDate(m.date)}</td>
                    <td>
                      {m.read
                        ? <span style={{ fontSize: '0.75rem', color: 'var(--tx3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaEnvelopeOpen /> Leído</span>
                        : <span className="a-badge a-badge--warning">Sin leer</span>
                      }
                    </td>
                    <td>
                      <div className="a-table__actions">
                        <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openMessage(m.id)} title="Ver"><FaEye /></button>
                        <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => setDeleteModal(m.id)} title="Eliminar"><FaTrash /></button>
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
            <h3>Detalle de consulta</h3>
            <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => setViewId(null)}><FaTimes /></button>
          </div>

          <div className="a-side-panel__profile">
            <div className="a-side-panel__avatar">{initials(viewed.name)}</div>
            <div>
              <strong className="a-side-panel__name">{viewed.name}</strong>
              {viewed.email && <span className="a-side-panel__sub">{viewed.email}</span>}
              {viewed.phone && <span className="a-side-panel__sub">{viewed.phone}</span>}
            </div>
          </div>

          <div className="a-side-panel__divider" />

          <div className="a-side-panel__field">
            <small>Área legal</small>
            <span className="a-badge a-badge--primary">{viewed.area}</span>
          </div>

          <div className="a-side-panel__divider" />

          <div className="a-side-panel__field">
            <small>Mensaje</small>
            <p className="a-side-panel__notes">{viewed.message}</p>
          </div>

          <div className="a-side-panel__divider" />

          <div className="a-side-panel__field">
            <small>Recibido</small>
            <strong><FaCalendarAlt /> {formatDate(viewed.date)}</strong>
          </div>

          <div className="a-side-panel__divider" />

          <div className="a-side-panel__field">
            <small>Estado</small>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--tx2)' }}>
              {viewed.read ? <><FaEnvelopeOpen /> Leído</> : <><FaCircle style={{ fontSize: '0.5rem', color: 'var(--ac)' }} /> Sin leer</>}
            </span>
          </div>

          <div className="a-side-panel__divider" />

          {/* Contact actions */}
          <div className="a-side-panel__field">
            <small>Contactar</small>
            <div className="a-side-panel__contacts">
              {viewed.email && (
                <a href={`mailto:${viewed.email}?subject=Re: Consulta ${viewed.area} — ${viewed.name}`} className="a-contact-pill" target="_blank" rel="noopener noreferrer">
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
            <button type="button" className="a-btn a-btn--danger a-btn--sm" onClick={() => { setDeleteModal(viewed.id); setViewId(null); }}>
              <FaTrash /> Eliminar
            </button>
          </div>
        </aside>
      )}

      {/* Delete confirmation */}
      <AdminModal
        open={deleteModal !== null}
        title="Eliminar consulta"
        subtitle="¿Eliminar esta consulta? No se puede deshacer."
        onClose={() => setDeleteModal(null)}
        onSubmit={() => { if (deleteModal) deleteMessage(deleteModal); setDeleteModal(null); }}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>La consulta será eliminada permanentemente.</p>
      </AdminModal>
    </div>
  );
};

export default InboxPage;
