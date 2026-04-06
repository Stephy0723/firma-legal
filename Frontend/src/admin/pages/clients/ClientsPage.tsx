import { useState, useRef, KeyboardEvent } from 'react';
import { useData } from '../../../context/DataContext';
import type { DocumentAsset } from '../../../context/DataContext';
import AdminModal from '../../components/AdminModal';
import {
  FaUsers, FaSearch, FaTh, FaList, FaPlus, FaEdit, FaTrash,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaCloudUploadAlt,
  FaCheckCircle, FaFileAlt, FaTimes, FaTag,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';

type View = 'card' | 'list';
type StatusFilter = 'all' | 'Activo' | 'Inactivo' | 'Completado';

const EMPTY = {
  name: '', email: '', phone: '', address: '', caseTopic: '', notes: '',
  cedula: '', occupation: '', dateOfBirth: '', referredBy: '',
  status: 'Activo' as 'Activo' | 'Inactivo' | 'Completado',
};

const STATUS_BADGE: Record<string, string> = {
  'Activo':     'a-badge--primary',
  'Inactivo':   'a-badge--warning',
  'Completado': 'a-badge--default',
};

const CLIENTS_PER_PAGE = 25;

const ClientsPage = () => {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [view, setView] = useState<View>('card');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [topicFilter, setTopicFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [clientFiles, setClientFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const topics = Array.from(new Set(clients.map((c) => c.caseTopic).filter(Boolean))) as string[];

  const filtered = clients.filter((c) => {
    const matchSearch = [c.name, c.email, c.phone, c.address]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (c as any).status === statusFilter;
    const matchTopic = !topicFilter || c.caseTopic === topicFilter;
    return matchSearch && matchStatus && matchTopic;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / CLIENTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * CLIENTS_PER_PAGE, safePage * CLIENTS_PER_PAGE);

  const selectedClient = clients.find((c) => c.id === selected);

  const openAdd = () => {
    setForm({ ...EMPTY });
    setTags([]); setTagInput('');
    setClientFiles([]); setExistingFiles([]);
    setModal('add');
  };
  const openEdit = (id: string) => {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    setForm({
      name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '',
      caseTopic: c.caseTopic || '', notes: c.notes || '',
      cedula: (c as any).cedula || '', occupation: (c as any).occupation || '',
      dateOfBirth: (c as any).dateOfBirth || '', referredBy: (c as any).referredBy || '',
      status: (c as any).status || 'Activo',
    });
    setTags((c as any).tags || []);
    setTagInput('');
    setExistingFiles((c.assets || []).map((a: any) => ({ name: a.name || 'Archivo', url: a.url })));
    setClientFiles([]);
    setSelected(id);
    setModal('edit');
  };
  const openDelete = (id: string) => { setSelected(id); setModal('delete'); };
  const closeModal = () => {
    if (loading) return;
    setModal(null); setSelected(null);
    setClientFiles([]); setExistingFiles([]);
    setTags([]); setTagInput('');
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length) setTags(tags.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || loading) return;
    setLoading(true);
    try {
      // Preserve full DocumentAsset objects for files user kept
      const keptUrls = new Set(existingFiles.map((e) => e.url));
      const uploadedAssets: DocumentAsset[] = (selectedClient?.assets || []).filter(
        (a) => keptUrls.has(a.url),
      );
      // Upload new files and build proper DocumentAsset records
      for (const file of clientFiles) {
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
        name: form.name, email: form.email, phone: form.phone, address: form.address,
        caseTopic: form.caseTopic, notes: form.notes, assets: uploadedAssets,
        cedula: form.cedula, occupation: form.occupation,
        dateOfBirth: form.dateOfBirth, referredBy: form.referredBy,
        status: form.status, tags,
      };
      if (modal === 'add') await addClient(payload);
      else if (modal === 'edit' && selected) await updateClient(selected, payload);
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      await deleteClient(selected);
    } finally {
      setLoading(false);
    }
    closeModal();
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="a-page">
      <div className="a-page-header">
        <div className="a-page-header__title">
          <h2>Clientes</h2>
          <p>{clients.length} clientes — {filtered.length} visibles</p>
        </div>
        <div className="a-page-header__actions">
          <button type="button" className="a-btn a-btn--primary" onClick={openAdd}>
            <FaPlus /> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="a-toolbar">
        <div className="a-search">
          <FaSearch />
          <input
            placeholder="Buscar por nombre, correo o teléfono..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['all', 'Activo', 'Inactivo', 'Completado'] as StatusFilter[]).map((s) => (
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
        {topics.length > 0 && (
          <select
            className="a-select"
            style={{ minWidth: 160, fontSize: '0.82rem', height: 34 }}
            value={topicFilter}
            onChange={(e) => { setTopicFilter(e.target.value); setPage(1); }}
          >
            <option value="">Todos los temas</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <div className="a-view-toggle">
          <button type="button" className={view === 'card' ? 'is-active' : ''} onClick={() => setView('card')} title="Tarjetas"><FaTh /></button>
          <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} title="Lista"><FaList /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="a-empty">
          <FaUsers />
          <h3>Sin clientes</h3>
          <p>{search || statusFilter !== 'all' || topicFilter
            ? 'No hay resultados para los filtros seleccionados.'
            : 'Aún no has registrado ningún cliente.'}</p>
          {!search && statusFilter === 'all' && !topicFilter && (
            <button type="button" className="a-btn a-btn--primary" onClick={openAdd}><FaPlus /> Agregar cliente</button>
          )}
        </div>
      ) : view === 'card' ? (
        <div className="a-card-grid">
          {paginated.map((c) => (
            <div key={c.id} className="a-card">
              <div className="a-card__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="a-card__avatar">{initials(c.name)}</div>
                  <div>
                    <p className="a-card__title">{c.name}</p>
                    {c.caseTopic && <p className="a-card__subtitle">{c.caseTopic}</p>}
                  </div>
                </div>                <span className={`a-badge ${STATUS_BADGE[(c as any).status || 'Activo'] || 'a-badge--primary'}`}>
                  {(c as any).status || 'Activo'}
                </span>              </div>
              <div className="a-card__meta">
                {c.email && <span><FaEnvelope />{c.email}</span>}
                {c.phone && <span><FaPhone />{c.phone}</span>}
                {c.address && <span><FaMapMarkerAlt />{c.address}</span>}
                {(c as any).cedula && <span><FaIdCard />{(c as any).cedula}</span>}
                {(c.assets?.length || 0) > 0 && <span><FaFileAlt />{c.assets!.length} docs</span>}
              </div>
              {((c as any).tags?.length > 0) && (
                <div className="a-tags-row">
                  {((c as any).tags as string[]).map((t) => (
                    <span key={t} className="a-tag"><FaTag />{t}</span>
                  ))}
                </div>
              )}
              {c.notes && <p style={{ fontSize: '0.8rem', color: 'var(--tx2)', margin: 0, lineHeight: 1.5 }}>{c.notes}</p>}
              <div className="a-card__footer">
                <span style={{ fontSize: '0.72rem', color: 'var(--tx3)' }}>
                  {c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES') : '—'}
                </span>
                <div className="a-card__actions">
                  <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(c.id)} title="Editar"><FaEdit /></button>
                  <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(c.id)} title="Eliminar"><FaTrash /></button>
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
                <th>Estado</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Caso</th>
                <th>Etiquetas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div className="a-card__avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{initials(c.name)}</div>
                      <span className="a-table__name">{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`a-badge a-badge--dot ${STATUS_BADGE[(c as any).status || 'Activo']}`}>
                      {(c as any).status || 'Activo'}
                    </span>
                  </td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.caseTopic || '—'}</td>
                  <td>
                    {(c as any).tags?.length > 0 ? (
                      <div className="a-tags-row a-tags-row--sm">
                        {((c as any).tags as string[]).slice(0, 3).map((t) => (
                          <span key={t} className="a-tag">{t}</span>
                        ))}
                        {(c as any).tags.length > 3 && (
                          <span className="a-tag a-tag--more">+{(c as any).tags.length - 3}</span>
                        )}
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="a-table__actions">
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
        title={modal === 'add' ? 'Nuevo cliente' : 'Editar cliente'}
        subtitle={modal === 'add' ? 'Completa los datos del nuevo cliente.' : `Editando: ${selectedClient?.name}`}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modal === 'add' ? 'Crear cliente' : 'Guardar cambios'}
        loading={loading}
        size="lg"
      >
        <div className="a-form a-form--2col">
          <div className="a-field a-field--full"><div className="a-form-divider">Datos personales</div></div>
          <div className="a-field a-field--full">
            <label>Nombre completo *</label>
            <input className="a-input" placeholder="Ej. Juan García López" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Estado del cliente</label>
            <select className="a-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option>Activo</option><option>Inactivo</option><option>Completado</option>
            </select>
          </div>
          <div className="a-field">
            <label>Cédula / Identificación</label>
            <input className="a-input" placeholder="Número de cédula" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Fecha de nacimiento</label>
            <input className="a-input" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Ocupación</label>
            <input className="a-input" placeholder="Ej. Ingeniero, Médico..." value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Referido por</label>
            <input className="a-input" placeholder="¿Quién lo refirió?" value={form.referredBy} onChange={(e) => setForm({ ...form, referredBy: e.target.value })} />
          </div>

          <div className="a-field a-field--full"><div className="a-form-divider">Contacto</div></div>
          <div className="a-field">
            <label>Correo electrónico</label>
            <input className="a-input" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Teléfono</label>
            <input className="a-input" placeholder="+506 8888-8888" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="a-field a-field--full">
            <label>Dirección</label>
            <input className="a-input" placeholder="Dirección del cliente" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="a-field a-field--full"><div className="a-form-divider">Caso y etiquetas</div></div>
          <div className="a-field">
            <label>Tema del caso</label>
            <input className="a-input" placeholder="Ej. Divorcio, Laboral, Penal..." value={form.caseTopic} onChange={(e) => setForm({ ...form, caseTopic: e.target.value })} />
          </div>
          <div className="a-field">
            <label>
              Etiquetas&nbsp;
              <small style={{ color: 'var(--tx3)', fontWeight: 400 }}>(Enter o coma para agregar)</small>
            </label>
            <div className="a-tags-input">
              {tags.map((t) => (
                <span key={t} className="a-tags-input__chip">
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                    <FaTimes />
                  </button>
                </span>
              ))}
              <input
                className="a-tags-input__field"
                placeholder={tags.length ? '' : 'Etiqueta...'}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                onBlur={addTag}
              />
            </div>
          </div>

          <div className="a-field a-field--full"><div className="a-form-divider"><FaFileAlt style={{ marginRight: '0.3rem' }} /> Documentos del cliente</div></div>
          <div className="a-field a-field--full">
            {(existingFiles.length > 0 || clientFiles.length > 0) && (
              <div className="a-detail-list" style={{ marginBottom: '0.5rem' }}>
                {existingFiles.map((e, i) => (
                  <div key={`ex-${i}`} className="a-detail-list__item">
                    <FaCheckCircle />
                    <span>{e.name}</span>
                    <button type="button" onClick={() => setExistingFiles(existingFiles.filter((_, j) => j !== i))}><FaTimes /></button>
                  </div>
                ))}
                {clientFiles.map((f, i) => (
                  <div key={`new-${i}`} className="a-detail-list__item">
                    <FaCloudUploadAlt />
                    <span>{f.name} <small style={{ color: 'var(--tx3)' }}>({(f.size / 1024 / 1024).toFixed(2)} MB)</small></span>
                    <button type="button" onClick={() => setClientFiles(clientFiles.filter((_, j) => j !== i))}><FaTimes /></button>
                  </div>
                ))}
              </div>
            )}
            <div
              className="a-file-drop"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('is-dragover'); }}
              onDragLeave={e => e.currentTarget.classList.remove('is-dragover')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('is-dragover'); setClientFiles([...clientFiles, ...Array.from(e.dataTransfer.files)]); }}
            >
              <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt" style={{ display: 'none' }} onChange={e => { if (e.target.files) setClientFiles([...clientFiles, ...Array.from(e.target.files)]); e.target.value = ''; }} />
              <div className="a-file-drop__placeholder">
                <FaCloudUploadAlt />
                <span>Sube cédulas, contratos, documentos del cliente</span>
                <small>Imágenes, PDFs, documentos — varios a la vez</small>
              </div>
            </div>
          </div>

          <div className="a-field a-field--full"><div className="a-form-divider">Notas</div></div>
          <div className="a-field a-field--full">
            <label>Notas internas</label>
            <textarea className="a-textarea" placeholder="Notas adicionales sobre el cliente..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </AdminModal>

      {/* Delete confirmation */}
      <AdminModal
        open={modal === 'delete'}
        title="Eliminar cliente"
        subtitle={`¿Seguro que deseas eliminar a ${selectedClient?.name}? Esta acción no se puede deshacer.`}
        onClose={closeModal}
        onSubmit={handleDelete}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>
          Se perderán todos los datos asociados a este cliente.
        </p>
      </AdminModal>
    </div>
  );
};

export default ClientsPage;
