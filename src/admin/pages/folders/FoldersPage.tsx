import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import AdminModal from '../../components/AdminModal';
import { FaFolderOpen, FaSearch, FaPlus, FaEdit, FaTrash, FaFileAlt } from 'react-icons/fa';

const FoldersPage = () => {
  const { documentFolders, documents, addFolder, updateFolder, deleteFolder } = useData();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');

  const filtered = documentFolders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedFolder = documentFolders.find((f) => f.id === selected);

  const openAdd = () => { setName(''); setModal('add'); };
  const openEdit = (id: string) => {
    const f = documentFolders.find((x) => x.id === id);
    if (!f) return;
    setName(f.name);
    setSelected(id);
    setModal('edit');
  };
  const openDelete = (id: string) => { setSelected(id); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (modal === 'add') addFolder({ name });
    else if (modal === 'edit' && selected) updateFolder(selected, { name });
    closeModal();
  };

  const docCount = (id: string) => documents.filter((d) => d.folder_id === id).length;

  return (
    <div className="a-page">
      <div className="a-page-header">
        <div className="a-page-header__title">
          <h2>Carpetas</h2>
          <p>{documentFolders.length} carpetas documentales</p>
        </div>
        <div className="a-page-header__actions">
          <button type="button" className="a-btn a-btn--primary" onClick={openAdd}>
            <FaPlus /> Nueva carpeta
          </button>
        </div>
      </div>

      <div className="a-toolbar">
        <div className="a-search">
          <FaSearch />
          <input placeholder="Buscar carpeta..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="a-empty">
          <FaFolderOpen />
          <h3>Sin carpetas</h3>
          <p>{search ? 'Sin resultados.' : 'Crea carpetas para organizar tus documentos.'}</p>
          {!search && <button type="button" className="a-btn a-btn--primary" onClick={openAdd}><FaPlus /> Crear carpeta</button>}
        </div>
      ) : (
        <div className="a-card-grid">
          {filtered.map((f) => {
            const count = docCount(f.id);
            return (
              <div key={f.id} className="a-card">
                <div className="a-card__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="a-card__avatar" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                      <FaFolderOpen />
                    </div>
                    <p className="a-card__title">{f.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tx2)', fontSize: '0.82rem' }}>
                  <FaFileAlt style={{ color: 'var(--tx3)' }} />
                  {count} {count === 1 ? 'documento' : 'documentos'}
                </div>
                <div className="a-card__footer">
                  <span style={{ fontSize: '0.72rem', color: 'var(--tx3)' }}>
                    {f.created_at ? new Date(f.created_at).toLocaleDateString('es-ES') : '—'}
                  </span>
                  <div className="a-card__actions">
                    <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(f.id)}><FaEdit /></button>
                    <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(f.id)}><FaTrash /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminModal
        open={modal === 'add' || modal === 'edit'}
        title={modal === 'add' ? 'Nueva carpeta' : 'Renombrar carpeta'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modal === 'add' ? 'Crear carpeta' : 'Guardar'}
        size="sm"
      >
        <div className="a-form">
          <div className="a-field">
            <label>Nombre de la carpeta *</label>
            <input className="a-input" placeholder="Ej. Contratos 2024" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={modal === 'delete'}
        title="Eliminar carpeta"
        subtitle={`¿Eliminar la carpeta "${selectedFolder?.name}"?`}
        onClose={closeModal}
        onSubmit={() => { if (selected) deleteFolder(selected); closeModal(); }}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>
          Los documentos dentro de esta carpeta no se eliminarán, solo perderán la asignación de carpeta.
        </p>
      </AdminModal>
    </div>
  );
};

export default FoldersPage;
