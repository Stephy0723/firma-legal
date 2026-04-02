import { useState, useRef } from 'react';
import { useData } from '../../../context/DataContext';
import AdminModal from '../../components/AdminModal';
import { FaUserTie, FaSearch, FaTh, FaList, FaPlus, FaEdit, FaTrash, FaEnvelope, FaLinkedin, FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';

type View = 'card' | 'list';

const EMPTY_FORM = {
  name: '', role: '', specialty: '', bio: '', email: '', linkedin: '', image: '',
};

const TeamPage = () => {
  const { team, addTeamMember, updateTeamMember, deleteTeamMember } = useData();
  const [view, setView] = useState<View>('card');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const filtered = team.filter((m) =>
    [m.name, m.role, m.specialty, m.email].join(' ').toLowerCase().includes(search.toLowerCase()),
  );

  const selectedMember = team.find((m) => m.id === selected);

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setModal('add'); };
  const openEdit = (id: string) => {
    const m = team.find((x) => x.id === id);
    if (!m) return;
    setForm({ name: m.name, role: m.role, specialty: m.specialty, bio: m.bio, email: m.email, linkedin: m.linkedin, image: m.image });
    setSelected(id);
    setModal('edit');
  };
  const openDelete = (id: string) => { setSelected(id); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setPhotoFile(null); };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    try {
      if (modal === 'add') {
        const memberId = await addTeamMember({ ...form, education: [], achievements: [] });
        // Upload photo if selected
        if (photoFile && memberId) {
          const fd = new FormData();
          fd.append('image', photoFile);
          await fetch(`http://localhost:3001/api/team/${memberId}/upload`, { method: 'POST', body: fd });
        }
      } else if (modal === 'edit' && selected) {
        // Upload photo first if selected
        if (photoFile) {
          const fd = new FormData();
          fd.append('image', photoFile);
          const res = await fetch(`http://localhost:3001/api/team/${selected}/upload`, { method: 'POST', body: fd });
          const data = await res.json();
          if (data.image) {
            updateTeamMember(selected, { name: form.name, role: form.role, specialty: form.specialty, bio: form.bio, email: form.email, linkedin: form.linkedin, image: data.image });
            closeModal();
            return;
          }
        }
        updateTeamMember(selected, { name: form.name, role: form.role, specialty: form.specialty, bio: form.bio, email: form.email, linkedin: form.linkedin, image: form.image });
      }
      closeModal();
    } catch (err) {
      console.error('Error subiendo foto:', err);
    }
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const COLORS = ['#6366F1','#0D9488','#EC4899','#F59E0B','#8B5CF6','#2563EB','#10B981','#EF4444','#F97316','#06B6D4'];
  const colorFor = (i: number) => COLORS[i % COLORS.length];

  return (
    <div className="a-page">
      <div className="a-page-header">
        <div className="a-page-header__title">
          <h2>Equipo</h2>
          <p>{team.length} miembros del equipo legal</p>
        </div>
        <div className="a-page-header__actions">
          <button type="button" className="a-btn a-btn--primary" onClick={openAdd}>
            <FaPlus /> Nuevo miembro
          </button>
        </div>
      </div>

      <div className="a-toolbar">
        <div className="a-search">
          <FaSearch />
          <input
            placeholder="Buscar por nombre, rol o especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="a-view-toggle">
          <button type="button" className={view === 'card' ? 'is-active' : ''} onClick={() => setView('card')} title="Tarjetas"><FaTh /></button>
          <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} title="Lista"><FaList /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="a-empty">
          <FaUserTie />
          <h3>Sin miembros</h3>
          <p>{search ? 'Sin resultados para tu búsqueda.' : 'Agrega el primer miembro del equipo.'}</p>
          {!search && <button type="button" className="a-btn a-btn--primary" onClick={openAdd}><FaPlus /> Agregar miembro</button>}
        </div>
      ) : view === 'card' ? (
        <div className="a-card-grid">
          {filtered.map((m, i) => {
            const color = colorFor(i);
            return (
              <div key={m.id} className="a-card" style={{ borderTop: `3px solid ${color}` }}>
                <div className="a-card__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {m.image ? (
                      <img src={m.image} alt={m.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div className="a-card__avatar" style={{ background: `${color}20`, color }}>{initials(m.name)}</div>
                    )}
                    <div>
                      <p className="a-card__title">{m.name}</p>
                      <p className="a-card__subtitle">{m.role}</p>
                    </div>
                  </div>
                </div>
                {m.specialty && (
                  <span className="a-badge a-badge--default">{m.specialty}</span>
                )}
                {m.bio && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--tx2)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.bio}</p>
                )}
                <div className="a-card__meta">
                  {m.email && <span><FaEnvelope />{m.email}</span>}
                  {m.linkedin && <span><FaLinkedin />LinkedIn</span>}
                </div>
                <div className="a-card__footer">
                  <div className="a-card__actions">
                    <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(m.id)}><FaEdit /></button>
                    <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(m.id)}><FaTrash /></button>
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
              <tr>
                <th>Miembro</th>
                <th>Rol</th>
                <th>Especialidad</th>
                <th>Correo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const color = colorFor(i);
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        {m.image ? (
                          <img src={m.image} alt={m.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div className="a-card__avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', background: `${color}20`, color }}>{initials(m.name)}</div>
                        )}
                        <span className="a-table__name">{m.name}</span>
                      </div>
                    </td>
                    <td>{m.role}</td>
                    <td>{m.specialty || '—'}</td>
                    <td>{m.email || '—'}</td>
                    <td>
                      <div className="a-table__actions">
                        <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => openEdit(m.id)}><FaEdit /></button>
                        <button type="button" className="a-btn a-btn--danger a-btn--icon" onClick={() => openDelete(m.id)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AdminModal
        open={modal === 'add' || modal === 'edit'}
        title={modal === 'add' ? 'Nuevo miembro' : 'Editar miembro'}
        subtitle={modal === 'edit' ? `Editando: ${selectedMember?.name}` : undefined}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modal === 'add' ? 'Crear miembro' : 'Guardar cambios'}
        size="lg"
      >
        <div className="a-form a-form--2col">
          <div className="a-field a-field--full">
            <label>Nombre completo *</label>
            <input className="a-input" placeholder="Ej. Dra. Ana María López" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Rol / Cargo</label>
            <input className="a-input" placeholder="Ej. Abogada, Socio, Pasante" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Especialidad</label>
            <input className="a-input" placeholder="Ej. Derecho de familia" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          </div>
          <div className="a-field">
            <label>Correo</label>
            <input className="a-input" type="email" placeholder="correo@despacho.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="a-field">
            <label>LinkedIn (URL)</label>
            <input className="a-input" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
          </div>
          <div className="a-field a-field--full">
            <label>Foto de perfil</label>
            <div
              className={`a-file-drop${photoFile || form.image ? ' has-file' : ''}`}
              onClick={() => photoInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('is-dragover'); }}
              onDragLeave={e => e.currentTarget.classList.remove('is-dragover')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('is-dragover'); if (e.dataTransfer.files[0]) setPhotoFile(e.dataTransfer.files[0]); }}
            >
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) setPhotoFile(e.target.files[0]); }}
              />
              {photoFile ? (
                <div className="a-file-drop__info">
                  <FaCheckCircle />
                  <span>{photoFile.name}</span>
                  <small>{(photoFile.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
              ) : form.image ? (
                <div className="a-file-drop__info">
                  <img src={form.image} alt="Preview" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <span>Foto actual cargada</span>
                  <small>Selecciona una nueva para reemplazar</small>
                </div>
              ) : (
                <div className="a-file-drop__placeholder">
                  <FaCloudUploadAlt />
                  <span>Haz clic o arrastra una imagen</span>
                  <small>JPG o PNG — máx. 5 MB</small>
                </div>
              )}
            </div>
          </div>
          <div className="a-field a-field--full">
            <label>Biografía</label>
            <textarea className="a-textarea" placeholder="Descripción profesional del miembro..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
        </div>
      </AdminModal>

      {/* Delete */}
      <AdminModal
        open={modal === 'delete'}
        title="Eliminar miembro"
        subtitle={`¿Eliminar a ${selectedMember?.name} del equipo?`}
        onClose={closeModal}
        onSubmit={() => { if (selected) deleteTeamMember(selected); closeModal(); }}
        submitLabel="Sí, eliminar"
        submitDanger
        size="sm"
      >
        <p style={{ margin: 0, color: 'var(--tx2)', fontSize: '0.875rem' }}>Esta acción no se puede deshacer.</p>
      </AdminModal>
    </div>
  );
};

export default TeamPage;
