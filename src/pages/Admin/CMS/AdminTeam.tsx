import { useMemo, useState, useRef } from 'react';
import type { FormEvent } from 'react';
import type { IconType } from 'react-icons';
import {
  FaBalanceScale,
  FaBriefcase,
  FaCheckCircle,
  FaEdit,
  FaEnvelope,
  FaFilter,
  FaGavel,
  FaGlobeAmericas,
  FaMedal,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaTrash,
  FaUpload,
  FaUserTie,
  FaUsers,
} from 'react-icons/fa';
import { useData } from '../../../context/DataContext';
import type { TeamMember } from '../../../context/DataContext';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminTeam.scss';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80';

type PracticeLane = 'civil' | 'migratory' | 'forensic' | 'operations';
type TeamFilter = 'all' | 'legal' | 'specialists' | 'operations';

interface TeamInsight extends TeamMember {
  lane: PracticeLane;
  activeCases: number;
  closedCases: number;
  totalCases: number;
  educationCount: number;
  achievementCount: number;
  score: number;
  tags: string[];
}

const LANE_META: Array<{
  id: PracticeLane;
  title: string;
  description: string;
  icon: IconType;
}> = [
  { id: 'civil', title: 'Civil y litigio', description: 'Casos estrategicos y defensa principal.', icon: FaGavel },
  { id: 'migratory', title: 'Migracion y consulados', description: 'Procesos internacionales y regularizacion.', icon: FaGlobeAmericas },
  { id: 'forensic', title: 'Penal y pericial', description: 'Soporte tecnico, penal y forense.', icon: FaShieldAlt },
  { id: 'operations', title: 'Operaciones legales', description: 'Backoffice, diligencias y soporte.', icon: FaBriefcase },
];

const FILTERS: Array<{ id: TeamFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'legal', label: 'Abogacia' },
  { id: 'specialists', label: 'Especialidades' },
  { id: 'operations', label: 'Operaciones' },
];

const createEmptyFormData = (): Omit<TeamMember, 'id'> => ({
  name: '',
  role: 'Abogada',
  specialty: '',
  image: DEFAULT_IMAGE,
  bio: '',
  linkedin: '',
  email: '',
  education: [''],
  achievements: [''],
});

const cleanList = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

const extractTags = (specialty: string) =>
  specialty
    .split(',')
    .flatMap((item) => item.split(' y '))
    .map((item) => item.trim())
    .filter(Boolean);

const getLane = (member: TeamMember): PracticeLane => {
  const signature = `${member.role} ${member.specialty}`.toLowerCase();

  if (['perito', 'forense', 'documentoscopia', 'penal'].some((item) => signature.includes(item))) {
    return 'forensic';
  }

  if (['migratorio', 'consular', 'viaje'].some((item) => signature.includes(item))) {
    return 'migratory';
  }

  if (['correspondencia', 'encargado', 'operacion', 'administr'].some((item) => signature.includes(item))) {
    return 'operations';
  }

  return 'civil';
};

const compareByDate = (left: { date: string; time: string }, right: { date: string; time: string }) => {
  const leftTime = new Date(`${left.date}T${left.time || '00:00'}`).getTime();
  const rightTime = new Date(`${right.date}T${right.time || '00:00'}`).getTime();
  return leftTime - rightTime;
};

const AdminTeam = () => {
  const { team, cases, appointments, addTeamMember, updateTeamMember, deleteTeamMember } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TeamFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<TeamMember, 'id'>>(createEmptyFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insights = useMemo<TeamInsight[]>(() => {
    const activeMap = new Map<string, number>();
    const closedMap = new Map<string, number>();
    const totalMap = new Map<string, number>();

    cases.forEach((item) => {
      totalMap.set(item.lawyer_id, (totalMap.get(item.lawyer_id) ?? 0) + 1);
      if (item.status === 'Cerrado') {
        closedMap.set(item.lawyer_id, (closedMap.get(item.lawyer_id) ?? 0) + 1);
      } else {
        activeMap.set(item.lawyer_id, (activeMap.get(item.lawyer_id) ?? 0) + 1);
      }
    });

    return team
      .map((member) => {
        const educationCount = cleanList(member.education).length;
        const achievementCount = cleanList(member.achievements).length;
        const activeCases = activeMap.get(member.id) ?? 0;
        const closedCases = closedMap.get(member.id) ?? 0;
        const totalCases = totalMap.get(member.id) ?? 0;
        return {
          ...member,
          lane: getLane(member),
          activeCases,
          closedCases,
          totalCases,
          educationCount,
          achievementCount,
          tags: extractTags(member.specialty),
          score: Math.min(98, 48 + activeCases * 12 + closedCases * 9 + educationCount * 5 + achievementCount * 6),
        };
      })
      .sort((left, right) => right.score - left.score || right.activeCases - left.activeCases || left.name.localeCompare(right.name));
  }, [cases, team]);

  const filterCounts = {
    all: insights.length,
    legal: insights.filter((member) => member.lane !== 'operations').length,
    specialists: insights.filter((member) => member.lane === 'migratory' || member.lane === 'forensic').length,
    operations: insights.filter((member) => member.lane === 'operations').length,
  };

  const filteredTeam = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return insights.filter((member) => {
      const matchesSearch =
        !query ||
        [member.name, member.role, member.specialty, member.bio, member.email]
          .some((value) => value.toLowerCase().includes(query));

      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'legal'
            ? member.lane !== 'operations'
            : activeFilter === 'specialists'
              ? member.lane === 'migratory' || member.lane === 'forensic'
              : member.lane === 'operations';

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, insights, searchQuery]);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    insights.forEach((member) => {
      member.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([label]) => label);
  }, [insights]);

  const laneFolders = useMemo(
    () =>
      LANE_META.map((lane) => {
        const members = filteredTeam.filter((member) => member.lane === lane.id);
        const activeLoad = members.reduce((sum, member) => sum + member.activeCases, 0);
        return {
          ...lane,
          members,
          activeLoad,
          averageScore: members.length ? Math.round(members.reduce((sum, member) => sum + member.score, 0) / members.length) : 0,
        };
      }),
    [filteredTeam],
  );

  const laneMax = Math.max(1, ...laneFolders.map((lane) => lane.members.length));
  const activeCases = cases.filter((item) => item.status !== 'Cerrado').length;
  const closedCases = cases.filter((item) => item.status === 'Cerrado').length;
  const readiness = insights.length
    ? Math.round(
        (insights.filter((member) => member.bio && member.email && member.educationCount && member.achievementCount).length /
          insights.length) *
          100,
      )
    : 0;
  const legalProfiles = insights.filter((member) => member.lane !== 'operations').length;
  const resolution = cases.length ? Math.round((closedCases / cases.length) * 100) : 0;
  const featuredMember = filteredTeam[0] ?? insights[0];

  const agendaItems = useMemo(() => {
    const items = appointments
      .filter((item) => item.status !== 'cancelled')
      .sort(compareByDate)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: item.purpose || 'Seguimiento legal',
        detail: `${item.clientName}${item.time ? ` · ${item.time}` : ''}`,
        date: item.date,
      }));

    if (items.length) {
      return items;
    }

    return [
      {
        id: 'focus-roster',
        title: `${readiness}% del roster con ficha completa`,
        detail: 'Curaduria institucional del equipo',
        date: '',
      },
      {
        id: 'focus-capacity',
        title: `${activeCases || insights.length} frentes con seguimiento`,
        detail: 'Carga operativa del equipo',
        date: '',
      },
    ];
  }, [activeCases, appointments, insights.length, readiness]);

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setEditingId(member.id);
      setFormData({
        name: member.name,
        role: member.role,
        specialty: member.specialty,
        image: member.image || DEFAULT_IMAGE,
        bio: member.bio,
        linkedin: member.linkedin,
        email: member.email,
        education: member.education.length ? member.education : [''],
        achievements: member.achievements.length ? member.achievements : [''],
      });
    } else {
      setEditingId(null);
      setFormData(createEmptyFormData());
    }

    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsModalOpen(true);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...formData,
      image: formData.image.trim() || DEFAULT_IMAGE,
      education: cleanList(formData.education),
      achievements: cleanList(formData.achievements),
    };

    let memberId = editingId;

    if (memberId) {
      await updateTeamMember(memberId, payload);
    } else {
      memberId = await addTeamMember(payload);
    }

    if (imageFile && memberId) {
      const fd = new FormData();
      fd.append('image', imageFile);
      try {
        const res = await fetch(`http://localhost:3001/api/team/${memberId}/upload`, {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (data.image) {
          // Actualizar estado local con la URL completa de la imagen en el VPS
          await updateTeamMember(memberId, { image: data.image });
        }
      } catch (err) {
        console.error('Error subiendo imagen:', err);
      }
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData(createEmptyFormData());
    setImageFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="team-executive-studio">
      <PageHelp
        title="Atelier del equipo"
        description="La vista fue replanteada desde cero como una experiencia corporativa mas exclusiva, editorial y ejecutiva."
        features={[
          'Nuevo shell visual con composicion premium y lectura institucional.',
          'Folders por practica y galeria de perfiles con enfoque editorial.',
          'Panel lateral para liderazgo, cobertura y agenda del despacho.',
        ]}
      />

      <section className="team-executive-shell">
        <header className="team-command-bar">
          <div className="team-command-bar__heading">
            <span className="team-command-bar__eyebrow">Equipo / Executive Atelier</span>
            <h2>Una direccion visual nueva para presentar y gestionar el talento del despacho.</h2>
            <p>
              Rehice la pantalla con un lenguaje mas empresarial, elegante y exclusivo,
              inspirado en dashboards editoriales premium y no en la estructura anterior.
            </p>
          </div>

          <div className="team-command-bar__controls">
            <label className="team-search-field" aria-label="Buscar miembros del equipo">
              <FaSearch />
              <input
                type="search"
                placeholder="Buscar por nombre, rol o especialidad"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="team-filter-group">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`team-filter-chip ${activeFilter === filter.id ? 'is-active' : ''}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <FaFilter />
                  <span>{filter.label}</span>
                  <b>{filterCounts[filter.id]}</b>
                </button>
              ))}
            </div>

            <button type="button" className="admin-btn-primary team-command-bar__cta" onClick={() => handleOpenModal()}>
              <FaPlus />
              Nuevo perfil
            </button>
          </div>
        </header>

        <div className="team-executive-grid">
          <section className="team-storyboard">
            <div className="team-storyboard__hero">
              <div className="team-storyboard__copy">
                <span className="team-storyboard__label">Corporate roster experience</span>
                <h3>Arquitectura del equipo legal con presencia premium y lectura ejecutiva.</h3>
                <p>
                  El foco ahora esta en proyectar categoria institucional: una narrativa
                  visual sobria, carpetas de practica y perfiles que se sienten pensados
                  para un despacho corporativo.
                </p>

                <div className="team-pill-list">
                  {(topTags.length ? topTags : ['Equipo legal']).map((tag) => (
                    <span key={tag} className="team-pill">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="team-storyboard__capsule">
                <span className="team-storyboard__metric-label">Indice institucional</span>
                <strong>{readiness}%</strong>
                <p>{legalProfiles} perfiles juridicos activos y {resolution}% de resolucion sobre expedientes cerrados.</p>

                <div className="team-avatar-row">
                  {insights.slice(0, 5).map((member) => (
                    <img key={member.id} src={member.image || DEFAULT_IMAGE} alt={member.name} />
                  ))}
                  {insights.length > 5 ? <span>+{insights.length - 5}</span> : null}
                </div>
              </div>
            </div>

            <div className="team-metric-ribbon">
              <article className="team-ribbon-card">
                <FaUsers />
                <div><span>Equipo activo</span><strong>{insights.length}</strong></div>
              </article>
              <article className="team-ribbon-card">
                <FaBalanceScale />
                <div><span>Frentes abiertos</span><strong>{activeCases}</strong></div>
              </article>
              <article className="team-ribbon-card">
                <FaCheckCircle />
                <div><span>Perfiles listos</span><strong>{readiness}%</strong></div>
              </article>
              <article className="team-ribbon-card">
                <FaUserTie />
                <div><span>Leadership pool</span><strong>{legalProfiles}</strong></div>
              </article>
            </div>

            <div className="team-folder-grid">
              {laneFolders.map((lane) => {
                const LaneIcon = lane.icon;

                return (
                  <article key={lane.id} className={`team-folder team-folder--${lane.id}`}>
                    <div className="team-folder__top">
                      <div className="team-folder__icon"><LaneIcon /></div>
                      <span>{lane.members.length} perfiles</span>
                    </div>
                    <h4>{lane.title}</h4>
                    <p>{lane.description}</p>
                    <div className="team-folder__meta">
                      <span>Carga {lane.activeLoad}</span>
                      <strong>{lane.averageScore}%</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="team-executive-aside">
            {featuredMember ? (
              <section className="team-side-panel team-side-panel--lead">
                <div className="team-side-panel__eyebrow">Perfil de referencia</div>
                <img src={featuredMember.image || DEFAULT_IMAGE} alt={featuredMember.name} className="team-side-panel__portrait" />
                <h4>{featuredMember.name}</h4>
                <span>{featuredMember.role}</span>
                <p>{featuredMember.specialty}</p>
                <div className="team-side-panel__facts">
                  <div><small>Indice</small><strong>{featuredMember.score}%</strong></div>
                  <div><small>Activos</small><strong>{featuredMember.activeCases}</strong></div>
                </div>
                <button type="button" className="team-side-panel__button" onClick={() => handleOpenModal(featuredMember)}>
                  Editar perfil
                  <FaEdit />
                </button>
              </section>
            ) : null}

            <section className="team-side-panel">
              <div className="team-side-panel__eyebrow">Cobertura</div>
              <h4>Balance por practica</h4>
              <div className="team-coverage-list">
                {laneFolders.map((lane) => (
                  <div key={lane.id} className="team-coverage-row">
                    <div className="team-coverage-row__head">
                      <span>{lane.title}</span>
                      <strong>{lane.members.length}</strong>
                    </div>
                    <div className="team-coverage-row__bar">
                      <span style={{ width: `${Math.max(10, Math.round((lane.members.length / laneMax) * 100))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="team-side-panel">
              <div className="team-side-panel__eyebrow">Agenda ejecutiva</div>
              <h4>Proximos movimientos</h4>
              <div className="team-agenda-list">
                {agendaItems.map((item) => (
                  <div key={item.id} className="team-agenda-item">
                    <div className="team-agenda-item__dot" />
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="team-roster-gallery">
            <div className="team-section-head">
              <div>
                <span>Directorio editorial</span>
                <h3>Perfiles con una presentacion mas exclusiva</h3>
              </div>
              <small>{filteredTeam.length} perfiles visibles</small>
            </div>

            {filteredTeam.length ? (
              <div className="team-roster-grid">
                {filteredTeam.map((member, index) => (
                  <article key={member.id} className={`roster-card roster-card--${member.lane} ${index === 0 ? 'roster-card--feature' : ''}`}>
                    <div className="roster-card__visual">
                      <img src={member.image || DEFAULT_IMAGE} alt={member.name} />
                      <span className="roster-card__lane">{LANE_META.find((lane) => lane.id === member.lane)?.title}</span>
                    </div>

                    <div className="roster-card__paper">
                      <div className="roster-card__top">
                        <div>
                          <h4>{member.name}</h4>
                          <p>{member.role}</p>
                        </div>

                        <div className="roster-card__actions">
                          <button type="button" onClick={() => handleOpenModal(member)} aria-label={`Editar ${member.name}`}>
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => {
                              if (window.confirm('Deseas eliminar este perfil del directorio?')) {
                                deleteTeamMember(member.id);
                              }
                            }}
                            aria-label={`Eliminar ${member.name}`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <strong className="roster-card__specialty">{member.specialty}</strong>
                      <p className="roster-card__bio">{member.bio}</p>

                      <div className="roster-card__stats">
                        <span>Activos <b>{member.activeCases}</b></span>
                        <span>Cerrados <b>{member.closedCases}</b></span>
                        <span>Indice <b>{member.score}%</b></span>
                      </div>

                      <div className="roster-card__footer">
                        <a href={`mailto:${member.email}`}>
                          <FaEnvelope />
                          {member.email}
                        </a>
                        <span>
                          <FaMedal />
                          {member.achievementCount} logros
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="team-empty-state">
                <h4>No hay perfiles para este criterio</h4>
                <p>Cambia el filtro o la busqueda para volver a ver el roster completo.</p>
              </div>
            )}
          </section>

          <section className="team-practice-atlas">
            <div className="team-section-head">
              <div>
                <span>Atlas de practicas</span>
                <h3>Mapa operativo del equipo</h3>
              </div>
              <small>Lectura rapida por frente</small>
            </div>

            <div className="team-practice-columns">
              {laneFolders.map((lane) => {
                const LaneIcon = lane.icon;

                return (
                  <article key={lane.id} className={`practice-column practice-column--${lane.id}`}>
                    <div className="practice-column__header">
                      <div className="practice-column__icon"><LaneIcon /></div>
                      <div>
                        <h4>{lane.title}</h4>
                        <p>{lane.description}</p>
                      </div>
                    </div>

                    <div className="practice-column__body">
                      {lane.members.length ? (
                        lane.members.slice(0, 4).map((member) => (
                          <div key={member.id} className="practice-member-card">
                            <img src={member.image || DEFAULT_IMAGE} alt={member.name} />
                            <div>
                              <strong>{member.name}</strong>
                              <span>{member.role}</span>
                            </div>
                            <b>{member.activeCases}</b>
                          </div>
                        ))
                      ) : (
                        <div className="practice-column__empty">Sin perfiles visibles en este frente.</div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--team">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Editar perfil del equipo' : 'Agregar nuevo perfil'}</h3>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)} aria-label="Cerrar"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body team-form">
              <div className="form-group">
                <label>Nombre</label>
                <input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <input required value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })} />
              </div>
              <div className="form-group form-group--full">
                <label>Especialidad</label>
                <input required value={formData.specialty} onChange={(event) => setFormData({ ...formData, specialty: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
              </div>
              <div className="form-group form-group--full">
                <label>Foto del perfil</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label className="admin-btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <FaUpload />
                    Seleccionar archivo
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      style={{ display: 'none' }}
                      onChange={handleImageSelect}
                    />
                  </label>
                  {(previewUrl || formData.image) && (
                    <img
                      src={previewUrl || formData.image}
                      alt="Preview"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                  )}
                  {imageFile && <span style={{ fontSize: '0.85rem', color: '#666' }}>{imageFile.name}</span>}
                </div>
              </div>
              <div className="form-group">
                <label>LinkedIn (URL)</label>
                <input type="url" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={(event) => setFormData({ ...formData, linkedin: event.target.value })} />
              </div>
              <div className="form-group form-group--full">
                <label>Bio</label>
                <textarea rows={4} value={formData.bio} onChange={(event) => setFormData({ ...formData, bio: event.target.value })} />
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">{editingId ? 'Guardar cambios' : 'Crear perfil'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
