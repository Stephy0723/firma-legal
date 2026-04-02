import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import AdminModal from '../../components/AdminModal';
import { FaSuitcase, FaSearch, FaTh, FaList, FaPlus, FaEdit, FaTrash, FaTimes, FaCheckCircle } from 'react-icons/fa';

type View = 'card' | 'list';
const EMPTY_FORM = { title: '', description: '', fullDescription: '', details: [] as string[], newDetail: '' };

const ServicesPage = () => {
  const { services, addService, updateService, deleteService } = useData();
  const [view, setView] = useState<View>('card');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const filtered = services.filter((s) =>
    [s.title, s.description].join(' ').toLowerCase().includes(search.toLowerCase()),
  );

  const selectedService = services.find((s) => s.id === selected);

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setModal('add'); };
  const openEdit = (id: string) => {
    const s = services.find((x) => x.id === id);
    if (!s) return;
    setForm({ title: s.title, description: s.description, fullDescription: s.fullDescription, details: s.details || [], newDetail: '' });
    setSelected(id);
    setModal('edit');
  };
  const openDelete = (id: string) => { setSelected(id); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const details = form.details.filter(d => d.trim());
    if (modal === 'add') {
      addService({ icon: 'FaSuitcase', title: form.title, description: form.description, fullDescription: form.fullDescription || form.description, details });
    } else if (modal === 'edit' && selected) {
      updateService(selected, { title: form.title, description: form.description, fullDescription: form.fullDescription || form.description, details });
    }
    closeModal();
  };

  const COLORS = ['#6366F1','#0D9488','#EC4899','#F59E0B','#8B5CF6','#2563EB','#10B981','#EF4444'];
  const colorFor = (i: number) => COLORS[i % COLORS.length];

  return (
    <div className="a-page">
      <div className="a-page-header">
        <div className="a-page-header__title">
          <h2>Servicios</h2>
          <p>{services.length} servicios legales publicados</p>
        </div>
        <div className="a-page-header__actions">
          <button type="button" className="a-btn a-btn--primary" onClick={openAdd}>
            <FaPlus /> Nuevo servicio
          </button>
        </div>
      </div>

      <div className="a-toolbar">
        <div className="a-search">
          <FaSearch />
          <input placeholder="Buscar servicio..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="a-view-toggle">
          <button type="button" className={view === 'card' ? 'is-active' : ''} onClick={() => setView('card')} title="Tarjetas"><FaTh /></button>
          <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} title="Lista"><FaList /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="a-empty">
          <FaSuitcase />
          <h3>Sin servicios</h3>
          <p>{search ? 'Sin resultados.' : 'Agrega los servicios del despacho.'}</p>
          {!search && <button type="button" className="a-btn a-btn--primary" onClick={openAdd}><FaPlus /> Agregar servicio</button>}
        </div>
      ) : view === 'card' ? (
        <div className="a-card-grid">
          {filtered.map((s, i) => {
            const color = colorFor(i);
            return (
              <div key={s.id} className="a-card">
                <div className="a-card__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="a-card__avatar" style={{ background: `${color}20`, color }}>
                      <FaSuitcase />
                    </div>
                    <p className="a-card__title">{s.title}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--tx2)', margin: 0, lineHeight: 1.5 }}>{s.description}</p>
                {s.details?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                    <span className="a-badge a-badge--default"><FaCheckCircle style={{ fontSize: '0.65rem', marginRight: '0.25rem' }} />{s.details.length} incluidos</span>
                  </div>
                )}
                <div className="a-card__footer">
                  <div className="a-card__actions">
                    <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(s.id)}><FaEdit /></button>
                    <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(s.id)}><FaTrash /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr><th>Servicio</th><th>Descripción</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="a-table__name">{s.title}</td>
                  <td>{s.description}</td>
                  <td>
                    <div className="a-table__actions">
                      <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(s.id)}><FaEdit /></button>
                      <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(s.id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal
        open={modal === 'add' || modal === 'edit'}
        title={modal === 'add' ? 'Nuevo servicio' : 'Editar servicio'}
        subtitle={modal === 'edit' ? `Editando: ${selectedService?.title}` : undefined}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modal === 'add' ? 'Crear servicio' : 'Guardar cambios'}
      >
        <div className="a-form">
          <div className="a-field">
            <label>Título del servicio *</label>
            <input className="a-input" placeholder="Ej. Derecho de Familia" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Descripción corta</label>
            <input className="a-input" placeholder="Resumen breve que aparece en la tarjeta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Descripción completa</label>
            <textarea className="a-textarea" placeholder="Descripción detallada del servicio..." value={form.fullDescription} onChange={(e) => setForm({ ...form, fullDescription: e.target.value })} />
          </div>
          <div className="a-field">
            <label>¿Qué incluye esta área?</label>
            <div className="a-detail-list">
              {form.details.map((d, i) => (
                <div key={i} className="a-detail-list__item">
                  <FaCheckCircle />
                  <span>{d}</span>
                  <button type="button" onClick={() => setForm({ ...form, details: form.details.filter((_, j) => j !== i) })}><FaTimes /></button>
                </div>
              ))}
            </div>
            <div className="a-detail-list__add">
              <input
                className="a-input"
                placeholder="Ej. Asesoría inicial gratuita"
                value={form.newDetail}
                onChange={(e) => setForm({ ...form, newDetail: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && form.newDetail.trim()) {
                    e.preventDefault();
                    setForm({ ...form, details: [...form.details, form.newDetail.trim()], newDetail: '' });
                  }
                }}
              />
              <button
                type="button"
                className="a-btn a-btn--ghost"
                disabled={!form.newDetail.trim()}
                onClick={() => {
                  if (form.newDetail.trim()) {
                    setForm({ ...form, details: [...form.details, form.newDetail.trim()], newDetail: '' });
                  }
                }}
              >
                <FaPlus /> Agregar
              </button>
            </div>
            <small>Presiona Enter o clic en Agregar para añadir cada elemento</small>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={modal === 'delete'}
        title="Eliminar servicio"
        subtitle={`¿Eliminar "${selectedService?.title}"?`}
        onClose={closeModal}
        onSubmit={() => { if (selected) deleteService(selected); closeModal(); }}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>Esta acción no se puede deshacer.</p>
      </AdminModal>
    </div>
  );
};

export default ServicesPage;
