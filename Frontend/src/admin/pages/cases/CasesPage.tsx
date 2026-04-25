import { useState, useRef } from 'react';
import { useData } from '../../../context/DataContext';
import AdminModal from '../../components/AdminModal';
import { useNavigate } from 'react-router-dom';
import {
  FaSuitcase, FaSearch, FaTh, FaList, FaPlus, FaEdit, FaTrash,
  FaUser, FaUserTie, FaTimes, FaCloudUploadAlt, FaCheckCircle,
  FaFileAlt, FaGavel, FaFolderOpen,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import type { LegalCase, CaseWitness, DocumentAsset } from '../../../context/DataContext';

type View = 'card' | 'list';
type StatusFilter = 'all' | LegalCase['status'];
type PriorityFilter = 'all' | 'Baja' | 'Media' | 'Alta' | 'Urgente';

const CASES_PER_PAGE = 20;

const EMPTY_WITNESS: CaseWitness = { id: '', name: '', cedula: '', phone: '', note: '' };

const EMPTY_FORM = {
  title: '',
  description: '',
  cedula: '',
  status: 'Evaluación' as LegalCase['status'],
  client_id: '',
  lawyer_id: '',
  courtCase: false,
  tribunal: '',
  courtDate: '',
  courtAddress: '',
  judge: '',
  caseNumber: '',
  priority: 'Media' as 'Baja' | 'Media' | 'Alta' | 'Urgente',
  notes: '',
};

const STATUS_BADGE: Record<string, string> = {
  'Evaluación': 'a-badge--warning',
  'En Proceso':  'a-badge--primary',
  'En Corte':    'a-badge--danger',
  'Cerrado':     'a-badge--default',
};

const PRIORITY_BADGE: Record<string, string> = {
  'Baja': 'a-badge--default',
  'Media': 'a-badge--primary',
  'Alta': 'a-badge--warning',
  'Urgente': 'a-badge--danger',
};

const CasesPage = () => {
  const navigate = useNavigate();
  const { cases, clients, team, addCase, updateCase, deleteCase } = useData();
  const [view, setView] = useState<View>('card');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [lawyerFilter, setLawyerFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [courtFilter, setCourtFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [witnesses, setWitnesses] = useState<CaseWitness[]>([]);
  const [newWitness, setNewWitness] = useState({ ...EMPTY_WITNESS });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [existingEvidence, setExistingEvidence] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const evidenceInputRef = useRef<HTMLInputElement>(null);

  const filtered = cases.filter((c) => {
    const matchSearch = [c.title, c.description, c.cedula].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || (c as any).priority === priorityFilter;
    const matchLawyer = !lawyerFilter || c.lawyer_id === lawyerFilter;
    const matchClient = !clientFilter || c.client_id === clientFilter;
    const matchCourt = !courtFilter || (c as any).courtCase === true;
    return matchSearch && matchStatus && matchPriority && matchLawyer && matchClient && matchCourt;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / CASES_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * CASES_PER_PAGE, safePage * CASES_PER_PAGE);

  const selectedCase = cases.find((c) => c.id === selected);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setWitnesses([]);
    setEvidenceFiles([]);
    setExistingEvidence([]);
    setNewWitness({ ...EMPTY_WITNESS });
    setModal('add');
  };

  const openEdit = (id: string) => {
    const c = cases.find((x) => x.id === id);
    if (!c) return;
    setForm({
      title: c.title, description: c.description, cedula: c.cedula, status: c.status,
      client_id: c.client_id, lawyer_id: c.lawyer_id,
      courtCase: (c as any).courtCase || false,
      tribunal: (c as any).tribunal || '',
      courtDate: (c as any).courtDate || '',
      courtAddress: (c as any).courtAddress || '',
      judge: (c as any).judge || '',
      caseNumber: (c as any).caseNumber || '',
      priority: (c as any).priority || 'Media',
      notes: (c as any).notes || '',
    });
    setWitnesses(c.witnesses || []);
    setExistingEvidence((c.assets || []).map((a: any) => ({ name: a.name || a.filename || 'Archivo', url: a.url })));
    setEvidenceFiles([]);
    setNewWitness({ ...EMPTY_WITNESS });
    setSelected(id);
    setModal('edit');
  };

  const openDelete = (id: string) => { setSelected(id); setModal('delete'); };

  const closeModal = () => {
    if (loading) return;
    setModal(null); setSelected(null);
    setEvidenceFiles([]); setExistingEvidence([]);
    setWitnesses([]); setNewWitness({ ...EMPTY_WITNESS });
  };

  const addWitness = () => {
    if (!newWitness.name.trim()) return;
    setWitnesses([...witnesses, { ...newWitness, id: Date.now().toString() }]);
    setNewWitness({ ...EMPTY_WITNESS });
  };

  const removeWitness = (wId: string) => setWitnesses(witnesses.filter(w => w.id !== wId));

  const handleSubmit = async () => {
    if (!form.title.trim() || loading) return;
    setLoading(true);
    try {
      // Preserve full DocumentAsset objects for evidence the user kept
      const keptUrls = new Set(existingEvidence.map((e) => e.url));
      const uploadedAssets: DocumentAsset[] = (selectedCase?.assets || []).filter(
        (a) => keptUrls.has(a.url),
      );
      // Upload new evidence and build proper DocumentAsset records
      for (const file of evidenceFiles) {
        try {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch('http://localhost:3001/api/documents/upload', { method: 'POST', body: fd });
          const data = await res.json();
          if (res.ok) uploadedAssets.push({
            id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            kind: file.type.startsWith('image/') ? 'image' : 'file',
            type: file.type || 'application/octet-stream',
            url: data.url,
          });
        } catch { /* skip failed upload */ }
      }
      const payload: any = {
        title: form.title, description: form.description, cedula: form.cedula,
        status: form.status, client_id: form.client_id, lawyer_id: form.lawyer_id,
        witnesses, assets: uploadedAssets,
        courtCase: form.courtCase, tribunal: form.tribunal,
        courtDate: form.courtDate, courtAddress: form.courtAddress,
        judge: form.judge, caseNumber: form.caseNumber,
        priority: form.priority, notes: form.notes,
      };
      if (modal === 'add') await addCase(payload);
      else if (modal === 'edit' && selected) await updateCase(selected, payload);
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || '—';
  const lawyerName = (id: string) => team.find((m) => m.id === id)?.name || '—';

  return (
    <div className="a-page">
      <div className="a-page-header">
        <div className="a-page-header__title">
          <h2>Casos</h2>
          <p>{cases.length} expedientes — {cases.filter((c) => c.status !== 'Cerrado').length} activos — {filtered.length} visibles</p>
        </div>
        <div className="a-page-header__actions">
          <button type="button" className="a-btn a-btn--primary" onClick={openAdd}>
            <FaPlus /> Nuevo caso
          </button>
        </div>
      </div>

      <div className="a-toolbar">
        <div className="a-search">
          <FaSearch />
          <input
            placeholder="Buscar por título, descripción o cédula..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['all', 'Evaluación', 'En Proceso', 'En Corte', 'Cerrado'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`a-filter-chip ${statusFilter === s ? 'is-active' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="a-select"
            style={{ width: 'auto', minWidth: 120, fontSize: '0.82rem', height: 34 }}
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as PriorityFilter); setPage(1); }}
          >
            <option value="all">Prioridad</option>
            <option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option>
          </select>
          {team.length > 0 && (
            <select
              className="a-select"
              style={{ width: 'auto', minWidth: 140, fontSize: '0.82rem', height: 34 }}
              value={lawyerFilter}
              onChange={(e) => { setLawyerFilter(e.target.value); setPage(1); }}
            >
              <option value="">Abogado</option>
              {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
          {clients.length > 0 && (
            <select
              className="a-select"
              style={{ width: 'auto', minWidth: 140, fontSize: '0.82rem', height: 34 }}
              value={clientFilter}
              onChange={(e) => { setClientFilter(e.target.value); setPage(1); }}
            >
              <option value="">Cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button
            type="button"
            className={`a-filter-chip ${courtFilter ? 'is-active' : ''}`}
            onClick={() => { setCourtFilter(!courtFilter); setPage(1); }}
          >
            <FaGavel /> Tribunal
          </button>
        </div>
        <div className="a-view-toggle">
          <button type="button" className={view === 'card' ? 'is-active' : ''} onClick={() => setView('card')} title="Tarjetas"><FaTh /></button>
          <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} title="Lista"><FaList /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="a-empty">
          <FaSuitcase />
          <h3>Sin casos</h3>
          <p>{search || statusFilter !== 'all' || priorityFilter !== 'all' || lawyerFilter || clientFilter || courtFilter
            ? 'No hay resultados para los filtros seleccionados.'
            : 'Aún no hay expedientes registrados.'}
          </p>
          {!search && statusFilter === 'all' && priorityFilter === 'all' && !lawyerFilter && !clientFilter && !courtFilter && (
            <button type="button" className="a-btn a-btn--primary" onClick={openAdd}><FaPlus /> Agregar caso</button>
          )}
        </div>
      ) : view === 'card' ? (
        <div className="a-card-grid">
          {paginated.map((c) => (
            <div key={c.id} className="a-card" style={{ borderLeft: '3px solid var(--ac)' }}>
              <div className="a-card__header">
                <div>
                  <p className="a-card__title">{c.title}</p>
                  {c.cedula && <p className="a-card__subtitle">Cédula: {c.cedula}</p>}
                </div>
                <span className={`a-badge ${STATUS_BADGE[c.status] || 'a-badge--default'}`}>{c.status}</span>
              </div>
              {c.description && <p style={{ fontSize: '0.82rem', color: 'var(--tx2)', margin: 0, lineHeight: 1.5 }}>{c.description}</p>}
              <div className="a-card__meta">
                {c.client_id && <span><FaUser />{clientName(c.client_id)}</span>}
                {c.lawyer_id && <span><FaUserTie />{lawyerName(c.lawyer_id)}</span>}
                {(c as any).courtCase && <span><FaGavel />Tribunal</span>}
                {(c.witnesses?.length || 0) > 0 && <span><FaUser />{c.witnesses!.length} testigos</span>}
                {(c.assets?.length || 0) > 0 && <span><FaFileAlt />{c.assets!.length} evidencias</span>}
              </div>
              {(c as any).priority && (c as any).priority !== 'Media' && (
                <span className={`a-badge ${PRIORITY_BADGE[(c as any).priority] || 'a-badge--default'}`} style={{ marginTop: '0.3rem', display: 'inline-flex' }}>
                  Prioridad: {(c as any).priority}
                </span>
              )}
              <div className="a-card__footer">
                <span style={{ fontSize: '0.72rem', color: 'var(--tx3)' }}>
                  {c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES') : '—'}
                </span>
                <div className="a-card__actions">
                  <button type="button" className="a-btn a-btn--ghost a-btn--icon" title="Ver expediente" onClick={() => navigate(`/admin/expedientes/${c.id}`)}><FaFolderOpen /></button>
                  <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(c.id)}><FaEdit /></button>
                  <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(c.id)}><FaTrash /></button>
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
                <th>Título</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Abogado</th>
                <th>Cédula</th>
                <th>Prioridad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id}>
                  <td className="a-table__name">
                    {c.title}
                    {(c as any).courtCase && <FaGavel style={{ marginLeft: '0.35rem', fontSize: '0.7rem', color: 'var(--danger)' }} />}
                  </td>
                  <td><span className={`a-badge a-badge--dot ${STATUS_BADGE[c.status] || 'a-badge--default'}`}>{c.status}</span></td>
                  <td>{clientName(c.client_id)}</td>
                  <td>{lawyerName(c.lawyer_id)}</td>
                  <td>{c.cedula || '—'}</td>
                  <td><span className={`a-badge ${PRIORITY_BADGE[(c as any).priority || 'Media']}`}>{(c as any).priority || 'Media'}</span></td>
                  <td>
                    <div className="a-table__actions">
                      <button type="button" className="a-btn a-btn--ghost a-btn--icon" title="Ver expediente" onClick={() => navigate(`/admin/expedientes/${c.id}`)}><FaFolderOpen /></button>
                      <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(c.id)}><FaEdit /></button>
                      <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(c.id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="a-pagination">
          <button
            className="a-btn a-btn--ghost a-btn--icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            <FaChevronLeft />
          </button>
          <span className="a-pagination__info">Página {safePage} de {totalPages}</span>
          <button
            className="a-btn a-btn--ghost a-btn--icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AdminModal
        open={modal === 'add' || modal === 'edit'}
        title={modal === 'add' ? 'Nuevo caso' : 'Editar caso'}
        subtitle={modal === 'edit' ? `Editando: ${selectedCase?.title}` : 'Completa toda la información del expediente'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modal === 'add' ? 'Crear caso' : 'Guardar cambios'}
        loading={loading}
        size="lg"
      >
        <div className="a-form a-form--2col">
          {/* ── Información general ── */}
          <div className="a-field a-field--full"><div className="a-form-divider">Información general</div></div>
          <div className="a-field a-field--full">
            <label>Título del caso *</label>
            <input className="a-input" placeholder="Ej. Divorcio contencioso García vs. García" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Estado</label>
            <select className="a-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LegalCase['status'] })}>
              <option>Evaluación</option><option>En Proceso</option><option>En Corte</option><option>Cerrado</option>
            </select>
          </div>
          <div className="a-field">
            <label>Prioridad</label>
            <select className="a-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
              <option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option>
            </select>
          </div>
          <div className="a-field">
            <label>Cédula del expediente</label>
            <input className="a-input" placeholder="Número de cédula / expediente" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Número de caso</label>
            <input className="a-input" placeholder="Ej. EXP-2024-001" value={form.caseNumber} onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Cliente</label>
            <select className="a-select" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
              <option value="">— Sin asignar —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="a-field">
            <label>Abogado asignado</label>
            <select className="a-select" value={form.lawyer_id} onChange={(e) => setForm({ ...form, lawyer_id: e.target.value })}>
              <option value="">— Sin asignar —</option>
              {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="a-field a-field--full">
            <label>Descripción del caso</label>
            <textarea className="a-textarea" rows={3} placeholder="Resumen detallado del caso, antecedentes, pretensiones..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* ── Tribunal / Corte ── */}
          <div className="a-field a-field--full"><div className="a-form-divider"><FaGavel style={{ marginRight: '0.3rem' }} /> Información de tribunal</div></div>
          <div className="a-field a-field--full">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.courtCase} onChange={(e) => setForm({ ...form, courtCase: e.target.checked })} />
              <span>Este caso requiere ir a tribunal / corte</span>
            </label>
          </div>
          {form.courtCase && (
            <>
              <div className="a-field">
                <label>Nombre del tribunal</label>
                <input className="a-input" placeholder="Ej. Tribunal Superior de Justicia" value={form.tribunal} onChange={(e) => setForm({ ...form, tribunal: e.target.value })} />
              </div>
              <div className="a-field">
                <label>Juez asignado</label>
                <input className="a-input" placeholder="Nombre del juez" value={form.judge} onChange={(e) => setForm({ ...form, judge: e.target.value })} />
              </div>
              <div className="a-field">
                <label>Fecha de audiencia</label>
                <input className="a-input" type="date" value={form.courtDate} onChange={(e) => setForm({ ...form, courtDate: e.target.value })} />
              </div>
              <div className="a-field">
                <label>Dirección del tribunal</label>
                <input className="a-input" placeholder="Dirección del juzgado" value={form.courtAddress} onChange={(e) => setForm({ ...form, courtAddress: e.target.value })} />
              </div>
            </>
          )}

          {/* ── Testigos ── */}
          <div className="a-field a-field--full"><div className="a-form-divider"><FaUser style={{ marginRight: '0.3rem' }} /> Testigos</div></div>
          <div className="a-field a-field--full">
            {witnesses.length > 0 && (
              <div className="a-detail-list" style={{ marginBottom: '0.75rem' }}>
                {witnesses.map(w => (
                  <div key={w.id} className="a-detail-list__item">
                    <FaUser />
                    <span><strong>{w.name}</strong>{w.cedula ? ` — Cédula: ${w.cedula}` : ''}{w.phone ? ` — Tel: ${w.phone}` : ''}{w.note ? ` — ${w.note}` : ''}</span>
                    <button type="button" onClick={() => removeWitness(w.id)}><FaTimes /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="a-witness-add">
              <input className="a-input" placeholder="Nombre *" value={newWitness.name} onChange={e => setNewWitness({ ...newWitness, name: e.target.value })} />
              <input className="a-input" placeholder="Cédula" value={newWitness.cedula} onChange={e => setNewWitness({ ...newWitness, cedula: e.target.value })} />
              <input className="a-input" placeholder="Teléfono" value={newWitness.phone} onChange={e => setNewWitness({ ...newWitness, phone: e.target.value })} />
              <input className="a-input" placeholder="Nota" value={newWitness.note} onChange={e => setNewWitness({ ...newWitness, note: e.target.value })} />
              <button type="button" className="a-btn" disabled={!newWitness.name.trim()} onClick={addWitness}><FaPlus /> Agregar</button>
            </div>
          </div>

          {/* ── Evidencia ── */}
          <div className="a-field a-field--full"><div className="a-form-divider"><FaFileAlt style={{ marginRight: '0.3rem' }} /> Evidencia y documentos</div></div>
          <div className="a-field a-field--full">
            {(existingEvidence.length > 0 || evidenceFiles.length > 0) && (
              <div className="a-detail-list" style={{ marginBottom: '0.5rem' }}>
                {existingEvidence.map((e, i) => (
                  <div key={`ex-${i}`} className="a-detail-list__item">
                    <FaCheckCircle />
                    <span>{e.name}</span>
                    <button type="button" onClick={() => setExistingEvidence(existingEvidence.filter((_, j) => j !== i))}><FaTimes /></button>
                  </div>
                ))}
                {evidenceFiles.map((f, i) => (
                  <div key={`new-${i}`} className="a-detail-list__item">
                    <FaCloudUploadAlt />
                    <span>{f.name} <small style={{ color: 'var(--tx3)' }}>({(f.size / 1024 / 1024).toFixed(2)} MB)</small></span>
                    <button type="button" onClick={() => setEvidenceFiles(evidenceFiles.filter((_, j) => j !== i))}><FaTimes /></button>
                  </div>
                ))}
              </div>
            )}
            <div
              className="a-file-drop"
              onClick={() => evidenceInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('is-dragover'); }}
              onDragLeave={e => e.currentTarget.classList.remove('is-dragover')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('is-dragover'); setEvidenceFiles([...evidenceFiles, ...Array.from(e.dataTransfer.files)]); }}
            >
              <input ref={evidenceInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.pptx,.txt,.csv" style={{ display: 'none' }} onChange={e => { if (e.target.files) setEvidenceFiles([...evidenceFiles, ...Array.from(e.target.files)]); e.target.value = ''; }} />
              <div className="a-file-drop__placeholder">
                <FaCloudUploadAlt />
                <span>Haz clic o arrastra archivos de evidencia</span>
                <small>Imágenes, PDFs, documentos — puedes subir varios a la vez</small>
              </div>
            </div>
          </div>

          {/* ── Notas ── */}
          <div className="a-field a-field--full"><div className="a-form-divider">Notas adicionales</div></div>
          <div className="a-field a-field--full">
            <label>Notas internas</label>
            <textarea className="a-textarea" rows={3} placeholder="Anotaciones internas, observaciones, estrategia legal..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </AdminModal>

      {/* Delete */}
      <AdminModal
        open={modal === 'delete'}
        title="Eliminar caso"
        subtitle={`¿Eliminar el caso "${selectedCase?.title}"?`}
        onClose={closeModal}
        onSubmit={async () => { if (selected) { await deleteCase(selected); } closeModal(); }}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>Esta acción no se puede deshacer.</p>
      </AdminModal>
    </div>
  );
};

export default CasesPage;
