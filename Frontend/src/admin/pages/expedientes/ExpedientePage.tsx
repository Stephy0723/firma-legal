import { useState, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaFolderOpen, FaSearch, FaArrowLeft, FaUser, FaUserTie,
  FaGavel, FaFileAlt, FaUsers, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaIdCard, FaCalendarAlt,
  FaClipboardList, FaStickyNote, FaExternalLinkAlt,
  FaExclamationTriangle, FaEdit,
} from 'react-icons/fa';
import './ExpedientePage.scss';

type StatusFilter = 'all' | 'Evaluación' | 'En Proceso' | 'En Corte' | 'Cerrado';

const STATUS_BADGE: Record<string, string> = {
  'Evaluación': 'a-badge--warning',
  'En Proceso':  'a-badge--primary',
  'En Corte':    'a-badge--danger',
  'Cerrado':     'a-badge--default',
};

const PRIORITY_BADGE: Record<string, string> = {
  'Baja':    'a-badge--default',
  'Media':   'a-badge--primary',
  'Alta':    'a-badge--warning',
  'Urgente': 'a-badge--danger',
};

const ExpedientePage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { cases, clients, team } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // ─── Listing mode helpers ──────────────────
  const filtered = useMemo(() => {
    if (id) return [];
    const q = search.toLowerCase();
    return cases.filter(c => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      if (!matchStatus) return false;
      const client = clients.find(cl => cl.id === c.client_id);
      const lawyer = team.find(t => t.id === c.lawyer_id);
      return (
        c.title.toLowerCase().includes(q) ||
        (c as any).caseNumber?.toLowerCase().includes(q) ||
        c.cedula?.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q) ||
        lawyer?.name.toLowerCase().includes(q)
      );
    });
  }, [cases, clients, team, search, id, statusFilter]);

  // ─── Detail mode helpers ──────────────────
  const caso = id ? cases.find(c => c.id === id) : null;
  const cliente = caso ? clients.find(cl => cl.id === caso.client_id) : null;
  const abogado = caso ? team.find(t => t.id === caso.lawyer_id) : null;

  const getClient = (cid: string) => clients.find(cl => cl.id === cid);
  const getLawyer = (lid: string) => team.find(t => t.id === lid);

  // ═══════════════════════════════════════════════
  // LISTING VIEW
  // ═══════════════════════════════════════════════
  if (!id) {
    const activos = cases.filter(c => c.status !== 'Cerrado').length;
    return (
      <div className="a-page">
        <div className="a-page-header">
          <div className="a-page-header__title">
            <h2><FaFolderOpen style={{ marginRight: '0.4rem' }} /> Expedientes</h2>
            <p>{cases.length} expediente{cases.length !== 1 ? 's' : ''} — {activos} activo{activos !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="a-toolbar">
          <div className="a-search">
            <FaSearch />
            <input placeholder="Buscar por caso, número, cédula, cliente o abogado..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(['all', 'Evaluación', 'En Proceso', 'En Corte', 'Cerrado'] as StatusFilter[]).map(s => (
              <button
                key={s}
                type="button"
                className={`a-filter-chip ${statusFilter === s ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'Todos' : s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="a-empty">
            <FaFolderOpen />
            <h3>Sin expedientes</h3>
            <p>{search || statusFilter !== 'all' ? 'No hay resultados con ese filtro.' : 'Aún no hay casos registrados. Crea un caso desde la sección de Casos.'}</p>
          </div>
        ) : (
          <div className="exp-list">
            {filtered.map(c => {
              const cl = getClient(c.client_id);
              const lw = getLawyer(c.lawyer_id);
              const extra = c as any;
              return (
                <div
                  key={c.id}
                  className="exp-card exp-card--clickable"
                  onClick={() => navigate(`/admin/expedientes/${c.id}`)}
                >
                  <div className="exp-card__top">
                    <div className="exp-card__title">
                      <h4>{c.title}</h4>
                      {extra.caseNumber && <span className="exp-card__number">#{extra.caseNumber}</span>}
                    </div>
                    <div className="exp-card__badges">
                      <span className={`a-badge ${STATUS_BADGE[c.status] || ''}`}>{c.status}</span>
                      {extra.priority && extra.priority !== 'Media' && <span className={`a-badge ${PRIORITY_BADGE[extra.priority] || ''}`}>{extra.priority}</span>}
                    </div>
                  </div>
                  <div className="exp-card__meta">
                    {cl && <span><FaUser /> {cl.name}</span>}
                    {lw && <span><FaUserTie /> {lw.name}</span>}
                    {extra.courtCase && <span className="exp-card__court"><FaGavel /> Tribunal</span>}
                    {c.witnesses && c.witnesses.length > 0 && <span><FaUsers /> {c.witnesses.length} testigo{c.witnesses.length !== 1 ? 's' : ''}</span>}
                    {c.assets && c.assets.length > 0 && <span><FaFileAlt /> {c.assets.length} evidencia{c.assets.length !== 1 ? 's' : ''}</span>}
                    {c.cedula && <span><FaIdCard /> {c.cedula}</span>}
                  </div>
                  {c.description && <p className="exp-card__desc">{c.description}</p>}
                  <div className="exp-card__footer">
                    <span className="exp-card__date">
                      <FaCalendarAlt /> {c.created_at ? new Date(c.created_at).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                    <span className="exp-card__open-hint">
                      <FaFolderOpen /> Abrir expediente
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // DETAIL VIEW (read-only)
  // ═══════════════════════════════════════════════
  if (!caso) {
    return (
      <div className="a-page">
        <div className="a-page-header">
          <div className="a-page-header__title">
            <h2>Expediente no encontrado</h2>
          </div>
        </div>
        <div className="a-empty">
          <FaExclamationTriangle />
          <p>El expediente solicitado no existe o fue eliminado.</p>
          <button className="a-btn" onClick={() => navigate('/admin/expedientes')}><FaArrowLeft /> Volver a expedientes</button>
        </div>
      </div>
    );
  }

  const extra = caso as any;

  return (
    <div className="a-page exp-page">
      {/* Header */}
      <div className="a-page-header">
        <div className="a-page-header__title">
          <button className="a-btn a-btn--ghost" onClick={() => navigate('/admin/expedientes')} style={{ marginRight: '0.5rem' }}><FaArrowLeft /></button>
          <div>
            <h2>
              <FaFolderOpen style={{ marginRight: '0.4rem', opacity: 0.7 }} />
              {caso.title}
              {extra.caseNumber && <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--tx3)', marginLeft: '0.5rem' }}>#{extra.caseNumber}</span>}
            </h2>
            <p>Expediente detallado del caso</p>
          </div>
        </div>
        <div className="a-page-header__actions">
          <span className={`a-badge ${STATUS_BADGE[caso.status] || ''}`}>{caso.status}</span>
          {extra.priority && <span className={`a-badge ${PRIORITY_BADGE[extra.priority] || ''}`}>{extra.priority}</span>}
          <button type="button" className="a-btn a-btn--sm" onClick={() => navigate('/admin/cases')} title="Ir a gestionar casos">
            <FaEdit /> Editar en Casos
          </button>
        </div>
      </div>

      <div className="exp-grid">
        {/* ── LEFT: Main info ── */}
        <div className="exp-main">

          {/* Case Info */}
          <div className="a-section">
            <div className="a-section__header">
              <h3><FaClipboardList style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Información del caso</h3>
            </div>
            <div className="a-section__body">
              <div className="a-meta-grid">
                <div className="a-meta-item">
                  <small>Título</small>
                  <strong>{caso.title}</strong>
                </div>
                <div className="a-meta-item">
                  <small>Estado</small>
                  <strong><span className={`a-badge ${STATUS_BADGE[caso.status] || ''}`}>{caso.status}</span></strong>
                </div>
                {extra.priority && (
                  <div className="a-meta-item">
                    <small>Prioridad</small>
                    <strong><span className={`a-badge ${PRIORITY_BADGE[extra.priority] || ''}`}>{extra.priority}</span></strong>
                  </div>
                )}
                {extra.caseNumber && (
                  <div className="a-meta-item">
                    <small>Número de expediente</small>
                    <strong>#{extra.caseNumber}</strong>
                  </div>
                )}
                {caso.cedula && (
                  <div className="a-meta-item">
                    <small>Cédula</small>
                    <strong>{caso.cedula}</strong>
                  </div>
                )}
                {caso.created_at && (
                  <div className="a-meta-item">
                    <small>Fecha de apertura</small>
                    <strong>{new Date(caso.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>
                )}
              </div>
              {caso.description && (
                <div className="exp-desc-block">
                  <small>Descripción</small>
                  <p>{caso.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tribunal / Court */}
          {extra.courtCase && (
            <div className="a-section">
              <div className="a-section__header">
                <h3><FaGavel style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Información de tribunal</h3>
              </div>
              <div className="a-section__body">
                <div className="a-meta-grid">
                  {extra.tribunal && (
                    <div className="a-meta-item">
                      <small>Tribunal / Juzgado</small>
                      <strong>{extra.tribunal}</strong>
                    </div>
                  )}
                  {extra.judge && (
                    <div className="a-meta-item">
                      <small>Juez asignado</small>
                      <strong>{extra.judge}</strong>
                    </div>
                  )}
                  {extra.courtDate && (
                    <div className="a-meta-item">
                      <small>Fecha de audiencia</small>
                      <strong>{new Date(extra.courtDate).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </div>
                  )}
                  {extra.courtAddress && (
                    <div className="a-meta-item">
                      <small>Dirección del tribunal</small>
                      <strong>{extra.courtAddress}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Witnesses */}
          {caso.witnesses && caso.witnesses.length > 0 && (
            <div className="a-section">
              <div className="a-section__header">
                <h3><FaUsers style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Testigos ({caso.witnesses.length})</h3>
              </div>
              <div className="a-section__body">
                <div className="exp-witnesses">
                  {caso.witnesses.map((w, i) => (
                    <div key={w.id || i} className="exp-witness-card">
                      <div className="exp-witness-card__name">
                        <FaUser /> {w.name}
                      </div>
                      <div className="exp-witness-card__details">
                        {w.cedula && <span><FaIdCard /> {w.cedula}</span>}
                        {w.phone && <span><FaPhone /> {w.phone}</span>}
                      </div>
                      {w.note && <p className="exp-witness-card__note">{w.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Evidence / Assets */}
          {caso.assets && caso.assets.length > 0 && (
            <div className="a-section">
              <div className="a-section__header">
                <h3><FaFileAlt style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Evidencia y documentos ({caso.assets.length})</h3>
              </div>
              <div className="a-section__body">
                <div className="exp-evidence-list">
                  {caso.assets.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="exp-evidence-item">
                      <FaFileAlt />
                      <span>{a.name}</span>
                      <FaExternalLinkAlt className="exp-evidence-item__ext" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {extra.notes && (
            <div className="a-section">
              <div className="a-section__header">
                <h3><FaStickyNote style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Notas internas</h3>
              </div>
              <div className="a-section__body">
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--tx2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{extra.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="exp-sidebar">

          {/* Lawyer */}
          <div className="a-section">
            <div className="a-section__header">
              <h3><FaUserTie style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Abogado asignado</h3>
            </div>
            <div className="a-section__body">
              {abogado ? (
                <div className="exp-person">
                  {abogado.image && <img src={abogado.image} alt={abogado.name} className="exp-person__avatar" />}
                  <div className="exp-person__info">
                    <strong>{abogado.name}</strong>
                    <span>{abogado.role}</span>
                    {abogado.specialty && <span className="exp-person__specialty">{abogado.specialty}</span>}
                    {abogado.email && <a href={`mailto:${abogado.email}`}><FaEnvelope /> {abogado.email}</a>}
                  </div>
                </div>
              ) : (
                <p className="exp-empty-text">Sin abogado asignado</p>
              )}
            </div>
          </div>

          {/* Client */}
          <div className="a-section">
            <div className="a-section__header">
              <h3><FaUser style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Cliente</h3>
            </div>
            <div className="a-section__body">
              {cliente ? (
                <div className="exp-person">
                  <div className="exp-person__info">
                    <strong>{cliente.name}</strong>
                    {(cliente as any).cedula && <span><FaIdCard style={{ marginRight: '0.25rem' }} />{(cliente as any).cedula}</span>}
                    {cliente.email && <a href={`mailto:${cliente.email}`}><FaEnvelope /> {cliente.email}</a>}
                    {cliente.phone && <span><FaPhone style={{ marginRight: '0.25rem' }} />{cliente.phone}</span>}
                    {cliente.address && <span><FaMapMarkerAlt style={{ marginRight: '0.25rem' }} />{cliente.address}</span>}
                    {(cliente as any).occupation && <span>Ocupación: {(cliente as any).occupation}</span>}
                    {cliente.caseTopic && <span>Tema: {cliente.caseTopic}</span>}
                  </div>
                </div>
              ) : (
                <p className="exp-empty-text">Sin cliente asignado</p>
              )}
            </div>
          </div>

          {/* Client Documents */}
          {cliente && cliente.assets && cliente.assets.length > 0 && (
            <div className="a-section">
              <div className="a-section__header">
                <h3><FaFileAlt style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Docs. del cliente ({cliente.assets.length})</h3>
              </div>
              <div className="a-section__body">
                <div className="exp-evidence-list">
                  {cliente.assets.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="exp-evidence-item">
                      <FaFileAlt />
                      <span>{a.name}</span>
                      <FaExternalLinkAlt className="exp-evidence-item__ext" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick dates */}
          <div className="a-section">
            <div className="a-section__header">
              <h3><FaCalendarAlt style={{ marginRight: '0.4rem', opacity: 0.6 }} /> Fechas</h3>
            </div>
            <div className="a-section__body">
              <div className="exp-dates">
                {caso.created_at && (
                  <div className="exp-dates__item">
                    <small>Creado</small>
                    <span>{new Date(caso.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
                {caso.updatedAt && (
                  <div className="exp-dates__item">
                    <small>Actualizado</small>
                    <span>{new Date(caso.updatedAt).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
                {extra.courtDate && (
                  <div className="exp-dates__item">
                    <small>Audiencia</small>
                    <span>{new Date(extra.courtDate).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpedientePage;
