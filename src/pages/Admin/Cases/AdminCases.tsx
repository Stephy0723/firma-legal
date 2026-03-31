import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useData } from '../../../context/DataContext';
import type { CaseWitness, DocumentAsset, LegalCase } from '../../../context/DataContext';
import {
  FaBalanceScale,
  FaBriefcase,
  FaEdit,
  FaFileUpload,
  FaGavel,
  FaIdCard,
  FaPaperclip,
  FaPlus,
  FaSearch,
  FaTrash,
  FaUser,
  FaUserFriends,
  FaUserTie,
} from 'react-icons/fa';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminCases.scss';

type CaseFormState = Omit<LegalCase, 'id' | 'created_at' | 'updatedAt' | 'witnesses' | 'assets'> & {
  witnesses: CaseWitness[];
  assets: DocumentAsset[];
};

const STATUS_OPTIONS: Array<LegalCase['status'] | 'all'> = ['all', 'Evaluación', 'En Proceso', 'En Corte', 'Cerrado'];
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createWitness = (): CaseWitness => ({ id: createId(), name: '', cedula: '', phone: '', note: '' });
const createEmptyCase = (): CaseFormState => ({
  client_id: '',
  lawyer_id: '',
  title: '',
  cedula: '',
  description: '',
  status: 'Evaluación',
  witnesses: [],
  assets: [],
});

const normalizeValue = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const formatDateLabel = (value?: string) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const readFilesAsAssets = async (files: FileList): Promise<DocumentAsset[]> =>
  Promise.all(
    Array.from(files).map(async (file) => ({
      id: createId(),
      name: file.name,
      kind: file.type.startsWith('image/') ? ('image' as const) : ('file' as const),
      type: file.type || 'application/octet-stream',
      url: await readFileAsDataUrl(file),
    })),
  );

const AdminCases = () => {
  const { cases, addCase, updateCase, deleteCase, clients, team } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<(typeof STATUS_OPTIONS)[number]>('all');
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [assetLoading, setAssetLoading] = useState(false);
  const [formData, setFormData] = useState<CaseFormState>(createEmptyCase());

  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const lawyerMap = useMemo(() => new Map(team.map((member) => [member.id, member])), [team]);

  const visibleCases = useMemo(() => {
    const query = normalizeValue(searchQuery.trim());
    return [...cases]
      .filter((item) => (filterStatus === 'all' ? true : item.status === filterStatus))
      .filter((item) => {
        if (!query) return true;
        const clientName = clientMap.get(item.client_id)?.name || '';
        const lawyerName = lawyerMap.get(item.lawyer_id)?.name || '';
        const witnesses = (item.witnesses || []).map((witness) => `${witness.name} ${witness.cedula}`).join(' ');
        return normalizeValue([item.title, item.description, item.status, item.cedula, clientName, lawyerName, witnesses].join(' ')).includes(query);
      })
      .sort((a, b) => new Date(b.updatedAt || b.created_at || 0).getTime() - new Date(a.updatedAt || a.created_at || 0).getTime());
  }, [cases, clientMap, filterStatus, lawyerMap, searchQuery]);

  const metrics = useMemo(
    () => ({
      total: cases.length,
      active: cases.filter((item) => item.status !== 'Cerrado').length,
      court: cases.filter((item) => item.status === 'En Corte').length,
      evidence: cases.filter((item) => (item.assets || []).length > 0).length,
    }),
    [cases],
  );

  const selectedCase = visibleCases.find((item) => item.id === selectedCaseId) || visibleCases[0] || null;
  const selectedClient = selectedCase ? clientMap.get(selectedCase.client_id) : null;
  const selectedImageAssets = selectedCase?.assets?.filter((asset) => asset.kind === 'image') || [];
  const selectedFileAssets = selectedCase?.assets?.filter((asset) => asset.kind !== 'image') || [];

  useEffect(() => {
    if (!visibleCases.length) {
      setSelectedCaseId('');
      return;
    }
    if (!visibleCases.some((item) => item.id === selectedCaseId)) setSelectedCaseId(visibleCases[0].id);
  }, [selectedCaseId, visibleCases]);

  const openModal = (caseItem?: LegalCase) => {
    if (caseItem) {
      setEditingCase(caseItem);
      setFormData({
        client_id: caseItem.client_id,
        lawyer_id: caseItem.lawyer_id,
        title: caseItem.title,
        cedula: caseItem.cedula || '',
        description: caseItem.description,
        status: caseItem.status,
        witnesses: (caseItem.witnesses || []).map((witness) => ({ ...witness })),
        assets: [...(caseItem.assets || [])],
      });
    } else {
      setEditingCase(null);
      setFormData(createEmptyCase());
    }
    setAssetLoading(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCase(null);
    setAssetLoading(false);
    setFormData(createEmptyCase());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cedula = formData.cedula.trim();
    if (!cedula) {
      window.alert('La cédula es obligatoria en cada expediente.');
      return;
    }

    const witnesses = formData.witnesses
      .map((witness) => ({
        ...witness,
        name: witness.name.trim(),
        cedula: witness.cedula.trim(),
        phone: witness.phone?.trim() || '',
        note: witness.note?.trim() || '',
      }))
      .filter((witness) => witness.name || witness.cedula || witness.phone || witness.note);

    if (witnesses.some((witness) => !witness.name || !witness.cedula)) {
      window.alert('Cada testigo debe tener nombre y cédula.');
      return;
    }

    const payload: Omit<LegalCase, 'id' | 'created_at' | 'updatedAt'> = {
      client_id: formData.client_id,
      lawyer_id: formData.lawyer_id,
      title: formData.title.trim(),
      cedula,
      description: formData.description.trim(),
      status: formData.status,
      witnesses,
      assets: formData.assets,
    };

    if (editingCase) {
      updateCase(editingCase.id, payload);
      setSelectedCaseId(editingCase.id);
    } else {
      addCase({ ...payload, created_at: new Date().toISOString() });
    }

    closeModal();
  };

  const handleAssetSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    setAssetLoading(true);
    try {
      const nextAssets = await readFilesAsAssets(event.target.files);
      setFormData((prev) => ({ ...prev, assets: [...prev.assets, ...nextAssets] }));
    } finally {
      setAssetLoading(false);
      event.target.value = '';
    }
  };

  const removeAsset = (assetId: string) => {
    setFormData((prev) => ({ ...prev, assets: prev.assets.filter((asset) => asset.id !== assetId) }));
  };

  const addWitness = () => {
    setFormData((prev) => ({ ...prev, witnesses: [...prev.witnesses, createWitness()] }));
  };

  const updateWitness = (witnessId: string, field: keyof CaseWitness, value: string) => {
    setFormData((prev) => ({
      ...prev,
      witnesses: prev.witnesses.map((witness) => (witness.id === witnessId ? { ...witness, [field]: value } : witness)),
    }));
  };

  const removeWitness = (witnessId: string) => {
    setFormData((prev) => ({ ...prev, witnesses: prev.witnesses.filter((witness) => witness.id !== witnessId) }));
  };

  const handleDelete = (caseItem: LegalCase) => {
    if (!window.confirm(`Se eliminara el expediente "${caseItem.title}". Deseas continuar?`)) return;
    deleteCase(caseItem.id);
  };

  return (
    <div className="cases-studio services-studio">
      <PageHelp
        title="Expedientes"
        description="Gestiona expedientes con cédula, evidencias y testigos desde una sola ficha."
        features={['Cédula obligatoria.', 'Adjuntos de imagenes y documentos.', 'Testigos con identificacion.']}
      />

      <div className="cases-shell">
        <header className="services-header cases-header">
          <div className="services-header__copy">
            <span className="services-header__eyebrow">Operaciones / Expedientes</span>
            <h2>Expedientes con soporte documental</h2>
            <p>Busca por cliente, cédula o testigo y mantén el respaldo del caso listo para consulta.</p>
          </div>

          <div className="services-header__controls cases-header__controls">
            <label className="services-search" aria-label="Buscar expediente">
              <FaSearch />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por expediente, cliente, cedula o testigo"
              />
            </label>
            <button type="button" className="services-cta" onClick={() => openModal()}>
              <FaPlus />
              Abrir expediente
            </button>
          </div>
        </header>

        <div className="cases-toolbar">
          <div className="cases-toolbar__filters">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                className={`cases-filter-chip ${filterStatus === status ? 'is-active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status === 'all' ? 'Todos' : status}
              </button>
            ))}
          </div>

          <div className="cases-toolbar__summary">
            <span>{visibleCases.length} visibles</span>
            <span>{metrics.evidence} con evidencia</span>
          </div>
        </div>

        <div className="services-metrics cases-metrics">
          <div className="services-metric"><FaBriefcase /><div><span>Total expedientes</span><strong>{metrics.total}</strong></div></div>
          <div className="services-metric"><FaBalanceScale /><div><span>Activos</span><strong>{metrics.active}</strong></div></div>
          <div className="services-metric"><FaGavel /><div><span>En corte</span><strong>{metrics.court}</strong></div></div>
          <div className="services-metric"><FaPaperclip /><div><span>Con evidencia</span><strong>{metrics.evidence}</strong></div></div>
        </div>

        {visibleCases.length ? (
          <div className="cases-workspace">
            <div className="cases-grid">
              {visibleCases.map((caseItem) => {
                const client = clientMap.get(caseItem.client_id);
                const lawyer = lawyerMap.get(caseItem.lawyer_id);
                return (
                  <article
                    key={caseItem.id}
                    className={`case-card service-card ${selectedCase?.id === caseItem.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedCaseId(caseItem.id)}
                  >
                    <div className="case-card__top">
                      <span className={`case-status case-status--${normalizeValue(caseItem.status).replace(/\s+/g, '-')}`}>{caseItem.status}</span>
                      <div className="service-card__actions">
                        <button type="button" onClick={(event) => { event.stopPropagation(); openModal(caseItem); }} aria-label={`Editar ${caseItem.title}`}><FaEdit /></button>
                        <button type="button" className="danger" onClick={(event) => { event.stopPropagation(); handleDelete(caseItem); }} aria-label={`Eliminar ${caseItem.title}`}><FaTrash /></button>
                      </div>
                    </div>

                    <div className="case-card__title"><FaBriefcase /><h3>{caseItem.title}</h3></div>

                    <div className="case-card__meta">
                      <span><FaIdCard />{caseItem.cedula || 'Sin cédula'}</span>
                      <span><FaPaperclip />{(caseItem.assets || []).length} adjuntos</span>
                      <span><FaUserFriends />{(caseItem.witnesses || []).length} testigos</span>
                    </div>

                    <div className="case-card__party">
                      <span><FaUser /> {client?.name || 'Cliente sin asignar'}</span>
                      <span><FaUserTie /> {lawyer?.name || 'Abogado sin asignar'}</span>
                    </div>

                    <p className="case-card__description">{caseItem.description || 'Sin observaciones cargadas para este expediente.'}</p>

                    <div className="case-card__footer">
                      <span>Actualizado</span>
                      <strong>{formatDateLabel(caseItem.updatedAt || caseItem.created_at)}</strong>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="cases-sidebar">
              {selectedCase ? (
                <>
                  <div className="case-profile service-card">
                    <div className="case-profile__head">
                      <div>
                        <span className="services-header__eyebrow">Ficha activa</span>
                        <h3>{selectedCase.title}</h3>
                        <p>Abierto el {formatDateLabel(selectedCase.created_at)}</p>
                      </div>
                      <span className={`case-status case-status--${normalizeValue(selectedCase.status).replace(/\s+/g, '-')}`}>{selectedCase.status}</span>
                    </div>

                    <div className="case-profile__details">
                      <div><span>Cliente</span><strong>{selectedClient?.name || 'No asignado'}</strong></div>
                      <div><span>Abogado</span><strong>{lawyerMap.get(selectedCase.lawyer_id)?.name || 'No asignado'}</strong></div>
                      <div><span>Cedula</span><strong>{selectedCase.cedula || 'Pendiente'}</strong></div>
                      <div><span>Actualizado</span><strong>{formatDateLabel(selectedCase.updatedAt || selectedCase.created_at)}</strong></div>
                    </div>

                    <div className="case-profile__section">
                      <strong>Descripcion</strong>
                      <p>{selectedCase.description || 'Todavia no hay descripcion registrada para este expediente.'}</p>
                    </div>

                    <div className="case-profile__section">
                      <div className="case-profile__section-head"><strong>Testigos</strong><span>{(selectedCase.witnesses || []).length}</span></div>
                      {(selectedCase.witnesses || []).length ? (
                        <div className="case-witnesses">
                          {(selectedCase.witnesses || []).map((witness) => (
                            <article key={witness.id} className="case-witness">
                              <div className="case-witness__head"><strong>{witness.name}</strong><span>{witness.cedula}</span></div>
                              {witness.phone ? <p>Telefono: {witness.phone}</p> : null}
                              {witness.note ? <p>{witness.note}</p> : null}
                            </article>
                          ))}
                        </div>
                      ) : <p>No hay testigos registrados.</p>}
                    </div>

                    <div className="case-profile__section">
                      <div className="case-profile__section-head"><strong>Evidencias</strong><span>{(selectedCase.assets || []).length}</span></div>
                      {(selectedCase.assets || []).length ? (
                        <div className="case-profile__assets">
                          {selectedImageAssets.length ? (
                            <div className="case-profile__gallery">
                              {selectedImageAssets.map((asset) => (
                                <a key={asset.id} className="case-profile__asset" href={asset.url} target="_blank" rel="noreferrer">
                                  <img src={asset.url} alt={asset.name} />
                                </a>
                              ))}
                            </div>
                          ) : null}
                          {selectedFileAssets.length ? (
                            <div className="case-profile__files">
                              {selectedFileAssets.map((asset) => (
                                <a key={asset.id} className="case-profile__asset case-profile__asset--file" href={asset.url} target="_blank" rel="noreferrer">
                                  <FaFileUpload />
                                  <span>{asset.name}</span>
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : <p>Este expediente todavia no tiene archivos cargados.</p>}
                    </div>

                    <div className="case-profile__actions">
                      <button type="button" className="admin-btn-outline" onClick={() => openModal(selectedCase)}><FaEdit />Editar</button>
                      <button type="button" className="admin-btn-outline danger" onClick={() => handleDelete(selectedCase)}><FaTrash />Eliminar</button>
                    </div>
                  </div>

                  <div className="case-panel service-card">
                    <div className="case-panel__head"><h4>Contexto del cliente</h4></div>
                    <div className="case-panel__list">
                      <article className="case-panel__item"><strong>Correo</strong><p>{selectedClient?.email || 'Sin correo registrado'}</p></article>
                      <article className="case-panel__item"><strong>Telefono</strong><p>{selectedClient?.phone || 'Sin telefono registrado'}</p></article>
                      <article className="case-panel__item"><strong>Direccion</strong><p>{selectedClient?.address || 'Sin direccion registrada'}</p></article>
                      <article className="case-panel__item"><strong>Resumen</strong><p>{(selectedCase.assets || []).length} adjunto(s) y {(selectedCase.witnesses || []).length} testigo(s).</p></article>
                    </div>
                  </div>
                </>
              ) : null}
            </aside>
          </div>
        ) : (
          <div className="cases-empty service-card">
            <h3>No encontramos expedientes en esta vista.</h3>
            <p>Prueba otro estado o crea un nuevo expediente desde el boton superior.</p>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="admin-modal-overlay" role="presentation" onClick={closeModal}>
          <div className="admin-modal admin-modal--services" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editingCase ? 'Editar expediente' : 'Nuevo expediente'}</h3>
              <button type="button" className="admin-modal__close" onClick={closeModal} aria-label="Cerrar">×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__body cases-form">
              <div className="cases-form__row">
                <div className="form-group">
                  <label>Titulo del expediente</label>
                  <input required type="text" value={formData.title} onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))} placeholder="Ej. Custodia menor Garcia / audiencia preliminar" />
                </div>
                <div className="form-group">
                  <label>Cedula obligatoria</label>
                  <input required type="text" value={formData.cedula} onChange={(event) => setFormData((prev) => ({ ...prev, cedula: event.target.value }))} placeholder="000-0000000-0" />
                </div>
              </div>

              <div className="cases-form__row">
                <div className="form-group">
                  <label>Cliente vinculado</label>
                  <select required value={formData.client_id} onChange={(event) => setFormData((prev) => ({ ...prev, client_id: event.target.value }))}>
                    <option value="">Seleccionar cliente</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Abogado asignado</label>
                  <select required value={formData.lawyer_id} onChange={(event) => setFormData((prev) => ({ ...prev, lawyer_id: event.target.value }))}>
                    <option value="">Seleccionar abogado</option>
                    {team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group form-group--full">
                <label>Estado del proceso</label>
                <select value={formData.status} onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value as LegalCase['status'] }))}>
                  <option value="Evaluación">Evaluación</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="En Corte">En Corte</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>

              <div className="form-group form-group--full">
                <label>Descripcion y observaciones</label>
                <textarea rows={4} value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} placeholder="Resumen del conflicto, acuerdos y notas operativas." />
              </div>

              <section className="cases-form__section">
                <div className="cases-form__section-head">
                  <div>
                    <strong>Documentos e imagenes</strong>
                    <p>Sube evidencia visual, PDFs o documentos de soporte.</p>
                  </div>
                  <label className="cases-upload-button">
                    <FaPaperclip />
                    Adjuntar
                    <input type="file" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx" multiple onChange={handleAssetSelection} />
                  </label>
                </div>

                {assetLoading ? <p className="cases-form__hint">Cargando archivos...</p> : null}
                {formData.assets.length ? (
                  <div className="cases-assets-grid">
                    {formData.assets.map((asset) => (
                      <article key={asset.id} className={`cases-assets-grid__item ${asset.kind === 'image' ? '' : 'cases-assets-grid__item--file'}`}>
                        {asset.kind === 'image' ? <img src={asset.url} alt={asset.name} /> : <div className="cases-assets-grid__file"><FaFileUpload /><span>{asset.name}</span></div>}
                        <button type="button" className="cases-assets-grid__remove" onClick={() => removeAsset(asset.id)}>Quitar</button>
                      </article>
                    ))}
                  </div>
                ) : <p className="cases-form__hint">Todavia no hay adjuntos cargados.</p>}
              </section>

              <section className="cases-form__section">
                <div className="cases-form__section-head">
                  <div>
                    <strong>Testigos</strong>
                    <p>Guarda nombre, cédula y nota de cada testigo.</p>
                  </div>
                  <button type="button" className="admin-btn-outline" onClick={addWitness}><FaPlus />Agregar testigo</button>
                </div>

                {formData.witnesses.length ? (
                  <div className="cases-witness-list">
                    {formData.witnesses.map((witness, index) => (
                      <article key={witness.id} className="cases-witness-card">
                        <div className="cases-witness-card__head">
                          <strong>Testigo {index + 1}</strong>
                          <button type="button" className="cases-witness-card__remove" onClick={() => removeWitness(witness.id)}>Eliminar</button>
                        </div>
                        <div className="cases-witness-card__grid">
                          <div className="form-group">
                            <label>Nombre</label>
                            <input type="text" value={witness.name} onChange={(event) => updateWitness(witness.id, 'name', event.target.value)} placeholder="Nombre completo" />
                          </div>
                          <div className="form-group">
                            <label>Cedula</label>
                            <input type="text" value={witness.cedula} onChange={(event) => updateWitness(witness.id, 'cedula', event.target.value)} placeholder="Cedula del testigo" />
                          </div>
                        </div>
                        <div className="cases-witness-card__grid">
                          <div className="form-group">
                            <label>Telefono</label>
                            <input type="text" value={witness.phone || ''} onChange={(event) => updateWitness(witness.id, 'phone', event.target.value)} placeholder="Telefono de contacto" />
                          </div>
                          <div className="form-group">
                            <label>Nota</label>
                            <input type="text" value={witness.note || ''} onChange={(event) => updateWitness(witness.id, 'note', event.target.value)} placeholder="Contexto o detalle" />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <div className="cases-witness-empty"><p>No hay testigos agregados todavia.</p></div>}
              </section>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">{editingCase ? 'Guardar cambios' : 'Crear expediente'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminCases;
