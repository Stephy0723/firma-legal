import { useState, useMemo, useRef } from 'react';
import { useData } from '../../../context/DataContext';
import AdminModal from '../../components/AdminModal';
import {
  FaFileAlt, FaSearch, FaEdit, FaTrash, FaFolderOpen,
  FaFolderPlus, FaUpload, FaChevronLeft, FaEllipsisV, FaUserTie,
  FaUser, FaCalendarAlt, FaPalette, FaCloudUploadAlt, FaCheckCircle,
} from 'react-icons/fa';
import { createApiUrl } from '../../../utils/api';

const FOLDER_COLORS = [
  { value: '#6366F1', label: 'Índigo' },
  { value: '#8B5CF6', label: 'Violeta' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#F59E0B', label: 'Ámbar' },
  { value: '#10B981', label: 'Verde' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#64748B', label: 'Gris' },
];

const DOC_TYPES = ['General','Contrato','Escritura','Sentencia','Poder','Demanda','Acuerdo','Acta','Factura','Identificación','Otro'];

type ModalType = 'add-folder' | 'edit-folder' | 'delete-folder' | 'add-doc' | 'edit-doc' | 'delete-doc' | null;

const EMPTY_FOLDER_FORM = { name: '', description: '', color: '#6366F1', lawyer_id: '', client_id: '' };
const EMPTY_DOC_FORM = { title: '', type: 'General', description: '', note: '', folder_id: '', lawyer_id: '', client_id: '', clientName: '', url: '' };
const GENERAL_FOLDER_ID = '__general__';
const isGeneralDocumentFolder = (folderId?: string) => !folderId || folderId === GENERAL_FOLDER_ID;

const DocumentsPage = () => {
  const { documents, documentFolders, team, clients, addDocument, updateDocument, deleteDocument, addFolder, updateFolder, deleteFolder } = useData();

  // View state
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [folderMenuId, setFolderMenuId] = useState<string | null>(null);

  // Forms
  const [folderForm, setFolderForm] = useState({ ...EMPTY_FOLDER_FORM });
  const [docForm, setDocForm] = useState({ ...EMPTY_DOC_FORM });
  const [docFile, setDocFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed
  const lawyers = team;

  const generalDocCount = useMemo(
    () => documents.filter(d => isGeneralDocumentFolder(d.folder_id)).length,
    [documents],
  );

  const isGeneralView = activeFolderId === GENERAL_FOLDER_ID;
  const activeFolder = activeFolderId && !isGeneralView ? documentFolders.find(f => f.id === activeFolderId) : null;

  const folderDocs = useMemo(() => {
    let list = isGeneralView
      ? documents.filter(d => isGeneralDocumentFolder(d.folder_id))
      : activeFolderId
        ? documents.filter(d => d.folder_id === activeFolderId)
        : documents;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        [d.title, d.type, d.clientName, d.description, d.note].join(' ').toLowerCase().includes(q),
      );
    }
    return list;
  }, [documents, activeFolderId, isGeneralView, search]);

  const filteredFolders = useMemo(() => {
    if (!search.trim()) return documentFolders;
    const q = search.toLowerCase();
    return documentFolders.filter(f =>
      [f.name, f.description].join(' ').toLowerCase().includes(q),
    );
  }, [documentFolders, search]);

  const docCountForFolder = (folderId: string) => documents.filter(d => d.folder_id === folderId).length;

  // Folder actions
  const openAddFolder = () => { setFolderForm({ ...EMPTY_FOLDER_FORM }); setModal('add-folder'); };
  const openEditFolder = (id: string) => {
    const f = documentFolders.find(x => x.id === id);
    if (!f) return;
    setFolderForm({ name: f.name, description: f.description || '', color: f.color || '#6366F1', lawyer_id: f.lawyer_id || '', client_id: f.client_id || '' });
    setSelectedId(id);
    setModal('edit-folder');
  };
  const openDeleteFolder = (id: string) => { setSelectedId(id); setModal('delete-folder'); };
  const handleFolderSubmit = () => {
    if (!folderForm.name.trim()) return;
    const payload = { name: folderForm.name, description: folderForm.description || undefined, color: folderForm.color, lawyer_id: folderForm.lawyer_id || undefined, client_id: folderForm.client_id || undefined };
    if (modal === 'add-folder') addFolder(payload);
    else if (modal === 'edit-folder' && selectedId) updateFolder(selectedId, payload);
    closeModal();
  };

  // Document actions
  const openAddDoc = () => {
    setDocForm({ ...EMPTY_DOC_FORM, folder_id: isGeneralView ? '' : activeFolderId || '' });
    setModal('add-doc');
  };
  const openEditDoc = (id: string) => {
    const d = documents.find(x => x.id === id);
    if (!d) return;
    setDocForm({
      title: d.title, type: d.type, description: d.description || '', note: d.note || '',
      folder_id: isGeneralDocumentFolder(d.folder_id) ? '' : d.folder_id || '', lawyer_id: d.lawyer_id || '', client_id: d.client_id || '',
      clientName: d.clientName || '', url: d.url || '',
    });
    setSelectedId(id);
    setModal('edit-doc');
  };
  const openDeleteDoc = (id: string) => { setSelectedId(id); setModal('delete-doc'); };
  const handleDocSubmit = async () => {
    if (!docForm.title.trim()) return;
    try {
      let fileUrl = docForm.url || '#';
      if (docFile) {
        const fd = new FormData();
        fd.append('file', docFile);
        const res = await fetch(createApiUrl('/api/documents/upload'), { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        fileUrl = data.url;
      }
      const payload = {
        title: docForm.title, type: docForm.type, description: docForm.description || undefined,
        note: docForm.note || undefined, folder_id: docForm.folder_id || undefined,
        lawyer_id: docForm.lawyer_id || undefined, client_id: docForm.client_id || undefined,
        clientName: docForm.clientName || undefined, url: fileUrl,
        tags: [] as string[], assets: [], history: [],
      };
      if (modal === 'add-doc') addDocument(payload);
      else if (modal === 'edit-doc' && selectedId) updateDocument(selectedId, payload);
      closeModal();
    } catch (err) {
      console.error('Error subiendo archivo:', err);
    }
  };

  const closeModal = () => { setModal(null); setSelectedId(null); setFolderMenuId(null); setDocFile(null); };

  const lawyerName = (id?: string) => team.find(m => m.id === id)?.name;
  const clientName = (id?: string) => clients.find(c => c.id === id)?.name;

  const selectedDoc = selectedId ? documents.find(d => d.id === selectedId) : null;
  const selectedFolder = selectedId ? documentFolders.find(f => f.id === selectedId) : null;

  // ── RENDER ──
  return (
    <div className="a-page">
      {/* Header */}
      <div className="a-page-header">
        <div className="a-page-header__title">
          {activeFolderId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => { setActiveFolderId(null); setSearch(''); }}>
                <FaChevronLeft />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="doc-folder-dot" style={{ background: isGeneralView ? '#64748B' : activeFolder?.color || '#6366F1' }} />
                <div>
                  <h2>{isGeneralView ? 'General' : activeFolder?.name || 'Carpeta'}</h2>
                  <p>{folderDocs.length} documentos{!isGeneralView && activeFolder?.description ? ` — ${activeFolder.description}` : ''}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2>Gestión Documental</h2>
              <p>{documents.length} documentos · {documentFolders.length} carpetas</p>
            </div>
          )}
        </div>
        <div className="a-page-header__actions">
          {!activeFolderId && (
            <button type="button" className="a-btn" onClick={openAddFolder}>
              <FaFolderPlus /> Crear carpeta
            </button>
          )}
          <button type="button" className="a-btn a-btn--primary" onClick={openAddDoc}>
            <FaUpload /> Subir documento
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="a-toolbar">
        <div className="a-search">
          <FaSearch />
          <input placeholder={activeFolderId ? 'Buscar en esta carpeta...' : 'Buscar documentos o carpetas...'} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Folder Grid (only on root view) */}
      {!activeFolderId && (
        <div className="doc-folders">
          {/* General folder */}
          <button
            type="button"
            className="doc-folder-card doc-folder-card--general"
            onClick={() => setActiveFolderId(GENERAL_FOLDER_ID)}
          >
            <div className="doc-folder-card__icon" style={{ background: '#64748B20', color: '#64748B' }}>
              <FaFolderOpen />
            </div>
            <div className="doc-folder-card__info">
              <span className="doc-folder-card__name">General</span>
              <span className="doc-folder-card__count">{generalDocCount} documentos</span>
            </div>
          </button>

          {filteredFolders.map(f => {
            const count = docCountForFolder(f.id);
            const color = f.color || '#6366F1';
            return (
              <div key={f.id} className="doc-folder-card" style={{ '--folder-color': color } as React.CSSProperties}>
                <button
                  type="button"
                  className="doc-folder-card__main"
                  onClick={() => { setActiveFolderId(f.id); setSearch(''); }}
                >
                  <div className="doc-folder-card__icon" style={{ background: `${color}18`, color }}>
                    <FaFolderOpen />
                  </div>
                  <div className="doc-folder-card__info">
                    <span className="doc-folder-card__name">{f.name}</span>
                    <span className="doc-folder-card__count">{count} documentos</span>
                    {f.description && <span className="doc-folder-card__desc">{f.description}</span>}
                  </div>
                  <div className="doc-folder-card__meta">
                    {f.lawyer_id && <span className="doc-folder-card__tag"><FaUserTie /> {lawyerName(f.lawyer_id) || 'Abogado'}</span>}
                    {f.client_id && <span className="doc-folder-card__tag"><FaUser /> {clientName(f.client_id) || 'Cliente'}</span>}
                  </div>
                </button>
                <div className="doc-folder-card__menu-wrap">
                  <button type="button" className="doc-folder-card__menu-btn" onClick={e => { e.stopPropagation(); setFolderMenuId(folderMenuId === f.id ? null : f.id); }}>
                    <FaEllipsisV />
                  </button>
                  {folderMenuId === f.id && (
                    <div className="doc-folder-card__dropdown">
                      <button type="button" onClick={() => { openEditFolder(f.id); setFolderMenuId(null); }}><FaEdit /> Editar</button>
                      <button type="button" className="is-danger" onClick={() => { openDeleteFolder(f.id); setFolderMenuId(null); }}><FaTrash /> Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Documents list (inside a folder or general) */}
      {activeFolderId && (
        folderDocs.length === 0 ? (
          <div className="a-empty">
            <FaFileAlt />
            <h3>Sin documentos</h3>
            <p>{search ? 'Sin resultados para la búsqueda.' : 'Esta carpeta está vacía.'}</p>
            {!search && (
              <button type="button" className="a-btn a-btn--primary" onClick={openAddDoc}><FaUpload /> Subir documento</button>
            )}
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Tipo</th>
                  <th>Abogado</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {folderDocs.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="doc-file-cell">
                        <div className="doc-file-icon"><FaFileAlt /></div>
                        <div>
                          <span className="doc-file-title">{d.title}</span>
                          {d.description && <span className="doc-file-desc">{d.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td><span className="a-badge a-badge--default">{d.type}</span></td>
                    <td>{lawyerName(d.lawyer_id) || '—'}</td>
                    <td>{d.clientName || clientName(d.client_id) || '—'}</td>
                    <td>
                      <span className="doc-date">
                        <FaCalendarAlt />
                        {d.uploadDate?.slice(0, 10)}
                      </span>
                    </td>
                    <td>
                      <div className="a-table__actions">
                        <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEditDoc(d.id)}><FaEdit /></button>
                        <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDeleteDoc(d.id)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Root view: show recent docs under folders */}
      {!activeFolderId && !search && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--tx2)', marginBottom: '0.75rem' }}>
            <FaCalendarAlt style={{ marginRight: '0.4rem', fontSize: '0.78rem' }} />
            Documentos recientes
          </h3>
          {documents.length === 0 ? (
            <p style={{ color: 'var(--tx3)', fontSize: '0.82rem' }}>No hay documentos aún.</p>
          ) : (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  <tr><th>Documento</th><th>Tipo</th><th>Carpeta</th><th>Fecha</th><th></th></tr>
                </thead>
                <tbody>
                  {documents.slice(0, 8).map(d => (
                    <tr key={d.id}>
                      <td>
                        <div className="doc-file-cell">
                          <div className="doc-file-icon"><FaFileAlt /></div>
                          <span className="doc-file-title">{d.title}</span>
                        </div>
                      </td>
                      <td><span className="a-badge a-badge--default">{d.type}</span></td>
                      <td>
                        {!isGeneralDocumentFolder(d.folder_id) ? (
                          <button type="button" className="doc-folder-link" onClick={() => { setActiveFolderId(d.folder_id!); setSearch(''); }}>
                            <FaFolderOpen /> {documentFolders.find(f => f.id === d.folder_id)?.name || '—'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--tx3)' }}>General</span>
                        )}
                      </td>
                      <td>{d.uploadDate?.slice(0, 10)}</td>
                      <td>
                        <div className="a-table__actions">
                          <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEditDoc(d.id)}><FaEdit /></button>
                          <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDeleteDoc(d.id)}><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}

      {/* Add / Edit Folder */}
      <AdminModal
        open={modal === 'add-folder' || modal === 'edit-folder'}
        title={modal === 'add-folder' ? 'Crear carpeta' : 'Editar carpeta'}
        subtitle={modal === 'edit-folder' ? `Editando: ${selectedFolder?.name}` : 'Organiza tus documentos en carpetas'}
        onClose={closeModal}
        onSubmit={handleFolderSubmit}
        submitLabel={modal === 'add-folder' ? 'Crear carpeta' : 'Guardar cambios'}
        size="lg"
      >
        <div className="a-form a-form--2col">
          <div className="a-field a-field--full">
            <label>Nombre de la carpeta *</label>
            <input className="a-input" placeholder="Ej. Contratos 2024" value={folderForm.name} onChange={e => setFolderForm({ ...folderForm, name: e.target.value })} />
          </div>
          <div className="a-field a-field--full">
            <label>Descripción</label>
            <textarea className="a-textarea" placeholder="Describe el contenido de esta carpeta..." value={folderForm.description} onChange={e => setFolderForm({ ...folderForm, description: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Abogado asignado</label>
            <select className="a-select" value={folderForm.lawyer_id} onChange={e => setFolderForm({ ...folderForm, lawyer_id: e.target.value })}>
              <option value="">— Sin asignar —</option>
              {lawyers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="a-field">
            <label>Cliente asociado</label>
            <select className="a-select" value={folderForm.client_id} onChange={e => setFolderForm({ ...folderForm, client_id: e.target.value })}>
              <option value="">— Sin asignar —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="a-field a-field--full">
            <label><FaPalette style={{ marginRight: '0.3rem' }} /> Color de la carpeta</label>
            <div className="doc-color-picker">
              {FOLDER_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`doc-color-swatch ${folderForm.color === c.value ? 'is-active' : ''}`}
                  style={{ '--swatch': c.value } as React.CSSProperties}
                  onClick={() => setFolderForm({ ...folderForm, color: c.value })}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
      </AdminModal>

      {/* Delete Folder */}
      <AdminModal
        open={modal === 'delete-folder'}
        title="Eliminar carpeta"
        subtitle={`¿Eliminar la carpeta "${selectedFolder?.name}"?`}
        onClose={closeModal}
        onSubmit={() => { if (selectedId) deleteFolder(selectedId); closeModal(); }}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>
          Los documentos dentro de esta carpeta no se eliminarán, solo perderán la asignación de carpeta.
        </p>
      </AdminModal>

      {/* Add / Edit Document */}
      <AdminModal
        open={modal === 'add-doc' || modal === 'edit-doc'}
        title={modal === 'add-doc' ? 'Subir documento' : 'Editar documento'}
        subtitle={modal === 'edit-doc' ? `Editando: ${selectedDoc?.title}` : 'Completa la información del documento'}
        onClose={closeModal}
        onSubmit={handleDocSubmit}
        submitLabel={modal === 'add-doc' ? 'Subir documento' : 'Guardar cambios'}
        size="lg"
      >
        <div className="a-form a-form--2col">
          <div className="a-field a-field--full">
            <label>Título del documento *</label>
            <input className="a-input" placeholder="Ej. Contrato de arrendamiento local A" value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Tipo de documento</label>
            <select className="a-select" value={docForm.type} onChange={e => setDocForm({ ...docForm, type: e.target.value })}>
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="a-field">
            <label>Carpeta</label>
            <select className="a-select" value={docForm.folder_id} onChange={e => setDocForm({ ...docForm, folder_id: e.target.value })}>
              <option value="">General (sin carpeta)</option>
              {documentFolders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="a-field">
            <label>Abogado responsable</label>
            <select className="a-select" value={docForm.lawyer_id} onChange={e => setDocForm({ ...docForm, lawyer_id: e.target.value })}>
              <option value="">— Sin asignar —</option>
              {lawyers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="a-field">
            <label>Cliente relacionado</label>
            <select className="a-select" value={docForm.client_id} onChange={e => setDocForm({ ...docForm, client_id: e.target.value })}>
              <option value="">— Sin asignar —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="a-field a-field--full">
            <label>Descripción</label>
            <textarea className="a-textarea" placeholder="Describe brevemente el contenido del documento..." value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })} />
          </div>
          <div className="a-field a-field--full">
            <label>Archivo</label>
            <div
              className={`a-file-drop${docFile ? ' has-file' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('is-dragover'); }}
              onDragLeave={e => e.currentTarget.classList.remove('is-dragover')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('is-dragover'); if (e.dataTransfer.files[0]) setDocFile(e.dataTransfer.files[0]); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.pptx,.txt,.csv,.odt,.ods"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) setDocFile(e.target.files[0]); }}
              />
              {docFile ? (
                <div className="a-file-drop__info">
                  <FaCheckCircle />
                  <span>{docFile.name}</span>
                  <small>{(docFile.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
              ) : docForm.url && docForm.url !== '#' ? (
                <div className="a-file-drop__info">
                  <FaFileAlt />
                  <span>Archivo actual cargado</span>
                  <small>Selecciona un nuevo archivo para reemplazar</small>
                </div>
              ) : (
                <div className="a-file-drop__placeholder">
                  <FaCloudUploadAlt />
                  <span>Haz clic o arrastra un archivo aquí</span>
                  <small>PDF, Word, Excel, imágenes — máx. 20 MB</small>
                </div>
              )}
            </div>
          </div>
          <div className="a-field a-field--full">
            <label>Nota interna</label>
            <textarea className="a-textarea" rows={2} placeholder="Observaciones internas sobre el documento..." value={docForm.note} onChange={e => setDocForm({ ...docForm, note: e.target.value })} />
          </div>
        </div>
      </AdminModal>

      {/* Delete Document */}
      <AdminModal
        open={modal === 'delete-doc'}
        title="Eliminar documento"
        subtitle={`¿Eliminar "${selectedDoc?.title}"?`}
        onClose={closeModal}
        onSubmit={() => { if (selectedId) deleteDocument(selectedId); closeModal(); }}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>Esta acción no se puede deshacer.</p>
      </AdminModal>
    </div>
  );
};

export default DocumentsPage;
