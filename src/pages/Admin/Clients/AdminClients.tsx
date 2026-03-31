import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useData } from '../../../context/DataContext';
import type { Appointment, ClientData, DocumentAsset, LegalCase } from '../../../context/DataContext';
import {
  FaBriefcase,
  FaCalendarCheck,
  FaEdit,
  FaEnvelope,
  FaFileUpload,
  FaGavel,
  FaImage,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaSearch,
  FaStickyNote,
  FaTag,
  FaTimes,
  FaTrash,
  FaUserCircle,
  FaUsers,
} from 'react-icons/fa';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminClients.scss';

type ClientFilter = 'all' | 'active' | 'scheduled' | 'idle';

type ClientFormState = Omit<ClientData, 'id' | 'created_at' | 'updatedAt' | 'tags'> & {
  tagsInput: string;
};

type ClientRecord = {
  client: ClientData;
  clientCases: LegalCase[];
  activeCases: LegalCase[];
  clientAppointments: Appointment[];
  lastAppointment: Appointment | null;
  nextAppointment: Appointment | null;
  activityDate?: string;
};

const FILTERS: Array<{ id: ClientFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Con casos activos' },
  { id: 'scheduled', label: 'Con citas' },
  { id: 'idle', label: 'Sin seguimiento' },
];

const createEmptyClient = (): ClientFormState => ({
  name: '',
  email: '',
  phone: '',
  address: '',
  caseTopic: '',
  notes: '',
  assets: [],
  tagsInput: '',
});

const normalizeValue = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const formatDateLabel = (value?: string) => {
  if (!value) {
    return 'Sin fecha';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

const parseTags = (value: string) =>
  Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );

const createAssetId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const readFilesAsAssets = async (fileList: FileList): Promise<DocumentAsset[]> =>
  Promise.all(
    Array.from(fileList).map(async (file) => ({
      id: createAssetId(),
      name: file.name,
      kind: file.type.startsWith('image/') ? ('image' as const) : ('file' as const),
      type: file.type || 'application/octet-stream',
      url: await readFileAsDataUrl(file),
    })),
  );

const AdminClients = () => {
  const { clients, addClient, updateClient, deleteClient, appointments, cases } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('all');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [formData, setFormData] = useState<ClientFormState>(createEmptyClient());
  const [assetLoading, setAssetLoading] = useState(false);

  const clientRecords = useMemo<ClientRecord[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return clients
      .map((client) => {
        const clientCases = cases.filter((caseItem) => caseItem.client_id === client.id);
        const activeCases = clientCases.filter((caseItem) => caseItem.status !== 'Cerrado');
        const clientAppointments = appointments
          .filter((appointment) => normalizeValue(appointment.clientName) === normalizeValue(client.name))
          .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

        const chronologicalAppointments = [...clientAppointments].reverse();
        const nextAppointment =
          chronologicalAppointments.find(
            (appointment) => new Date(appointment.date).getTime() >= today.getTime(),
          ) || null;
        const lastAppointment = clientAppointments[0] || null;

        return {
          client,
          clientCases,
          activeCases,
          clientAppointments,
          lastAppointment,
          nextAppointment,
          activityDate: lastAppointment?.date || client.created_at,
        };
      })
      .sort((left, right) => {
        const rightDate = new Date(right.activityDate || 0).getTime();
        const leftDate = new Date(left.activityDate || 0).getTime();

        if (right.activeCases.length !== left.activeCases.length) {
          return right.activeCases.length - left.activeCases.length;
        }

        return rightDate - leftDate;
      });
  }, [appointments, cases, clients]);

  const visibleClients = useMemo(() => {
    const query = normalizeValue(searchQuery.trim());

    return clientRecords.filter((record) => {
      if (filter === 'active' && !record.activeCases.length) {
        return false;
      }

      if (filter === 'scheduled' && !record.clientAppointments.length) {
        return false;
      }

      if (filter === 'idle' && (record.activeCases.length || record.clientAppointments.length)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return normalizeValue(
        [
          record.client.name,
          record.client.email,
          record.client.phone,
          record.client.address,
          record.client.caseTopic || '',
          record.client.notes || '',
          (record.client.tags || []).join(' '),
        ].join(' '),
      ).includes(query);
    });
  }, [clientRecords, filter, searchQuery]);

  const selectedRecord =
    visibleClients.find((record) => record.client.id === selectedClientId) || visibleClients[0] || null;

  const metrics = useMemo(
    () => ({
      total: clients.length,
      active: clientRecords.filter((record) => record.activeCases.length > 0).length,
      scheduled: clientRecords.filter((record) => record.clientAppointments.length > 0).length,
      idle: clientRecords.filter((record) => !record.activeCases.length && !record.clientAppointments.length).length,
    }),
    [clientRecords, clients.length],
  );

  useEffect(() => {
    if (!visibleClients.length) {
      setSelectedClientId('');
      return;
    }

    if (!visibleClients.some((record) => record.client.id === selectedClientId)) {
      setSelectedClientId(visibleClients[0].client.id);
    }
  }, [selectedClientId, visibleClients]);

  const openModal = (client?: ClientData) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        caseTopic: client.caseTopic || '',
        notes: client.notes || '',
        assets: client.assets || [],
        tagsInput: (client.tags || []).join(', '),
      });
    } else {
      setEditingClient(null);
      setFormData(createEmptyClient());
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData(createEmptyClient());
    setAssetLoading(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const resolvedTags = parseTags(formData.tagsInput);
    const payload = {
      ...formData,
      tags: resolvedTags,
    };

    delete (payload as Partial<ClientFormState>).tagsInput;

    if (editingClient) {
      updateClient(editingClient.id, payload);
    } else {
      addClient({
        ...payload,
        created_at: new Date().toISOString(),
      });
    }

    closeModal();
  };

  const handleAssetSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }

    try {
      setAssetLoading(true);
      const nextAssets = await readFilesAsAssets(event.target.files);
      setFormData((prev) => ({
        ...prev,
        assets: [...(prev.assets || []), ...nextAssets],
      }));
    } finally {
      setAssetLoading(false);
      event.target.value = '';
    }
  };

  const removeAsset = (assetId: string) => {
    setFormData((prev) => ({
      ...prev,
      assets: (prev.assets || []).filter((asset) => asset.id !== assetId),
    }));
  };

  const handleDelete = (client: ClientData) => {
    if (!window.confirm(`Se eliminara a ${client.name} del directorio. Deseas continuar?`)) {
      return;
    }

    deleteClient(client.id);
  };

  const selectedImageAssets = selectedRecord?.client.assets?.filter((asset) => asset.kind === 'image') || [];
  const selectedFileAssets = selectedRecord?.client.assets?.filter((asset) => asset.kind !== 'image') || [];

  return (
    <div className="clients-studio services-studio">
      <PageHelp
        title="Relacion con clientes"
        description="Gestiona el directorio completo, revisa actividad y accede al contexto de cada cliente desde una sola vista."
        features={[
          'Busqueda y filtros por actividad.',
          'Resumen de casos y citas por cliente.',
          'CRUD completo desde tarjetas y ficha lateral.',
        ]}
      />

      <div className="clients-shell">
        <header className="services-header clients-header">
          <div className="services-header__copy">
            <span className="services-header__eyebrow">CRM / Clientes</span>
            <h2>Directorio ejecutivo de clientes</h2>
            <p>Una vista mas clara para priorizar casos activos, seguimiento y datos de contacto sin perder velocidad operativa.</p>
          </div>

          <div className="services-header__controls clients-header__controls">
            <label className="services-search" aria-label="Buscar cliente">
              <FaSearch />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por nombre, correo o telefono"
              />
            </label>
            <button type="button" className="services-cta" onClick={() => openModal()}>
              <FaPlus />
              Nuevo cliente
            </button>
          </div>
        </header>

        <div className="clients-toolbar">
          <div className="clients-toolbar__filters">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`clients-filter-chip ${filter === item.id ? 'is-active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="clients-toolbar__summary">
            <span>{visibleClients.length} visibles</span>
            <span>{metrics.active} con seguimiento legal</span>
          </div>
        </div>

        <div className="services-metrics clients-metrics">
          <div className="services-metric">
            <FaUsers />
            <div>
              <span>Total clientes</span>
              <strong>{metrics.total}</strong>
            </div>
          </div>
          <div className="services-metric">
            <FaGavel />
            <div>
              <span>Con casos activos</span>
              <strong>{metrics.active}</strong>
            </div>
          </div>
          <div className="services-metric">
            <FaCalendarCheck />
            <div>
              <span>Con citas registradas</span>
              <strong>{metrics.scheduled}</strong>
            </div>
          </div>
          <div className="services-metric">
            <FaUserCircle />
            <div>
              <span>Sin seguimiento</span>
              <strong>{metrics.idle}</strong>
            </div>
          </div>
        </div>

        {visibleClients.length ? (
          <div className="clients-workspace">
            <div className="clients-grid">
              {visibleClients.map((record) => {
                const status =
                  record.activeCases.length > 0 ? 'Activo' : record.clientAppointments.length > 0 ? 'En agenda' : 'Sin movimiento';

                return (
                  <article
                    key={record.client.id}
                    className={`client-card service-card ${selectedRecord?.client.id === record.client.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedClientId(record.client.id)}
                  >
                    <div className="client-card__top">
                      <div className="client-card__identity">
                        <span className="client-card__avatar">{getInitials(record.client.name)}</span>
                        <div>
                          <h3>{record.client.name}</h3>
                          <p>{record.client.email}</p>
                        </div>
                      </div>

                      <div className="service-card__actions">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openModal(record.client);
                          }}
                          aria-label={`Editar ${record.client.name}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(record.client);
                          }}
                          aria-label={`Eliminar ${record.client.name}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="client-card__contact">
                      <span><FaPhoneAlt /> {record.client.phone}</span>
                      <span><FaMapMarkerAlt /> {record.client.address || 'Sin direccion registrada'}</span>
                    </div>

                    <div className="client-card__summary">
                      <span className="client-card__summary-label">
                        <FaBriefcase />
                        Asunto principal
                      </span>
                      <p>{record.client.caseTopic || 'Sin asunto legal definido todavia.'}</p>
                    </div>

                    {(record.client.tags || []).length ? (
                      <div className="client-card__tags">
                        {(record.client.tags || []).slice(0, 4).map((tag) => (
                          <span key={`${record.client.id}-${tag}`} className="client-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="client-card__stats">
                      <div>
                        <span>Casos</span>
                        <strong>{record.clientCases.length}</strong>
                      </div>
                      <div>
                        <span>Citas</span>
                        <strong>{record.clientAppointments.length}</strong>
                      </div>
                      <div>
                        <span>Ultima actividad</span>
                        <strong>{formatDateLabel(record.activityDate)}</strong>
                      </div>
                      <div>
                        <span>Adjuntos</span>
                        <strong>{record.client.assets?.length || 0}</strong>
                      </div>
                    </div>

                    <div className="client-card__footer">
                      <span className={`client-status client-status--${record.activeCases.length ? 'active' : record.clientAppointments.length ? 'scheduled' : 'idle'}`}>
                        {status}
                      </span>
                      <span>{record.activeCases.length ? `${record.activeCases.length} casos abiertos` : 'Directorio general'}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="clients-sidebar">
              {selectedRecord ? (
                <>
                  <div className="client-profile service-card">
                    <div className="client-profile__hero">
                      <span className="client-profile__avatar">{getInitials(selectedRecord.client.name)}</span>
                      <div>
                        <span className="services-header__eyebrow">Ficha activa</span>
                        <h3>{selectedRecord.client.name}</h3>
                        <p>Cliente registrado el {formatDateLabel(selectedRecord.client.created_at)}</p>
                      </div>
                    </div>

                    <div className="client-profile__contact">
                      <span><FaEnvelope /> {selectedRecord.client.email}</span>
                      <span><FaPhoneAlt /> {selectedRecord.client.phone}</span>
                      <span><FaMapMarkerAlt /> {selectedRecord.client.address || 'Sin direccion registrada'}</span>
                    </div>

                    <div className="client-profile__section">
                      <div className="client-profile__section-head">
                        <FaBriefcase />
                        <strong>De que es el caso</strong>
                      </div>
                      <p>{selectedRecord.client.caseTopic || 'Aun no se ha documentado el asunto principal del cliente.'}</p>
                    </div>

                    {(selectedRecord.client.tags || []).length ? (
                      <div className="client-profile__section">
                        <div className="client-profile__section-head">
                          <FaTag />
                          <strong>Tags del cliente</strong>
                        </div>
                        <div className="client-card__tags">
                          {(selectedRecord.client.tags || []).map((tag) => (
                            <span key={`profile-${selectedRecord.client.id}-${tag}`} className="client-tag">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="client-profile__metrics">
                      <div>
                        <span>Casos activos</span>
                        <strong>{selectedRecord.activeCases.length}</strong>
                      </div>
                      <div>
                        <span>Total citas</span>
                        <strong>{selectedRecord.clientAppointments.length}</strong>
                      </div>
                      <div>
                        <span>Ultima cita</span>
                        <strong>{formatDateLabel(selectedRecord.lastAppointment?.date)}</strong>
                      </div>
                      <div>
                        <span>Proxima cita</span>
                        <strong>{formatDateLabel(selectedRecord.nextAppointment?.date)}</strong>
                      </div>
                    </div>

                    <div className="client-profile__section">
                      <div className="client-profile__section-head">
                        <FaStickyNote />
                        <strong>Nota interna</strong>
                      </div>
                      <p>{selectedRecord.client.notes || 'No hay nota interna registrada para este cliente.'}</p>
                    </div>

                    <div className="client-profile__section">
                      <div className="client-profile__section-head">
                        <FaFileUpload />
                        <strong>Imagenes y documentos</strong>
                      </div>
                      {(selectedRecord.client.assets || []).length ? (
                        <div className="client-assets">
                          {selectedImageAssets.map((asset) => (
                            <a
                              key={asset.id}
                              className="client-assets__thumb"
                              href={asset.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img src={asset.url} alt={asset.name} />
                            </a>
                          ))}
                          {selectedFileAssets.map((asset) => (
                            <a
                              key={asset.id}
                              className="client-assets__thumb client-assets__thumb--file"
                              href={asset.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FaFileUpload />
                              <span>{asset.name}</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p>No hay adjuntos cargados para este cliente.</p>
                      )}
                    </div>

                    <div className="client-profile__actions">
                      <button type="button" className="admin-btn-outline" onClick={() => openModal(selectedRecord.client)}>
                        <FaEdit />
                        Editar
                      </button>
                      <button type="button" className="admin-btn-outline danger" onClick={() => handleDelete(selectedRecord.client)}>
                        <FaTrash />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="client-panel service-card">
                    <div className="client-panel__head">
                      <h4>Casos del cliente</h4>
                      <span>{selectedRecord.clientCases.length} registros</span>
                    </div>
                    {selectedRecord.clientCases.length ? (
                      <div className="client-panel__list">
                        {selectedRecord.clientCases.slice(0, 4).map((caseItem) => (
                          <article key={caseItem.id} className="client-panel__item">
                            <strong>{caseItem.title}</strong>
                            <p>{caseItem.description}</p>
                            <span>{caseItem.status}</span>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="client-panel__empty">Este cliente aun no tiene casos asociados.</p>
                    )}
                  </div>

                  <div className="client-panel service-card">
                    <div className="client-panel__head">
                      <h4>Citas y seguimiento</h4>
                      <span>{selectedRecord.clientAppointments.length} registradas</span>
                    </div>
                    {selectedRecord.clientAppointments.length ? (
                      <div className="client-panel__list">
                        {selectedRecord.clientAppointments.slice(0, 4).map((appointment) => (
                          <article key={appointment.id} className="client-panel__item">
                            <strong>{appointment.purpose}</strong>
                            <p>{formatDateLabel(appointment.date)} / {appointment.time}</p>
                            <span>{appointment.status}</span>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="client-panel__empty">No hay citas registradas para este cliente.</p>
                    )}
                  </div>
                </>
              ) : null}
            </aside>
          </div>
        ) : (
          <div className="clients-empty service-card">
            <h3>No encontramos clientes para esta vista.</h3>
            <p>Prueba otro filtro, ajusta la busqueda o crea un nuevo perfil desde el boton superior.</p>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="admin-modal-overlay" role="presentation" onClick={closeModal}>
          <div className="admin-modal admin-modal--services" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editingClient ? 'Editar cliente' : 'Nuevo cliente'}</h3>
              <button className="admin-modal__close" onClick={closeModal} aria-label="Cerrar">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__body clients-form">
              <div className="form-group form-group--full">
                <label>Nombre completo</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div className="clients-form__row">
                <div className="form-group">
                  <label>Correo</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="correo@cliente.com"
                  />
                </div>

                <div className="form-group">
                  <label>Telefono</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="809-000-0000"
                  />
                </div>
              </div>

              <div className="form-group form-group--full">
                <label>De que es el caso</label>
                <input
                  type="text"
                  value={formData.caseTopic || ''}
                  onChange={(event) => setFormData((prev) => ({ ...prev, caseTopic: event.target.value }))}
                  placeholder="Ej. Custodia provisional, demanda civil, contrato inmobiliario"
                />
              </div>

              <div className="clients-form__row">
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    value={formData.tagsInput}
                    onChange={(event) => setFormData((prev) => ({ ...prev, tagsInput: event.target.value }))}
                    placeholder="vip, custodia, urgente, abogado"
                  />
                </div>

                <div className="form-group">
                  <label>Adjuntos actuales</label>
                  <input
                    type="text"
                    value={`${formData.assets?.length || 0} archivo(s) cargado(s)`}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group form-group--full">
                <label>Direccion</label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Direccion fisica o referencia del cliente"
                />
              </div>

              <div className="form-group form-group--full">
                <label>Nota interna importante</label>
                <textarea
                  rows={4}
                  value={formData.notes || ''}
                  onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Detalles sensibles, observaciones del abogado, estatus actual o prioridades."
                />
              </div>

              <div className="clients-upload-block">
                <div className="clients-upload-block__header">
                  <div>
                    <span className="services-header__eyebrow">Adjuntos del cliente</span>
                    <h4>Sube imagenes o documentos importantes</h4>
                  </div>
                  <label className="clients-file-picker">
                    <FaFileUpload />
                    Seleccionar archivos
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleAssetSelection}
                    />
                  </label>
                </div>

                <div className="clients-upload-block__dropzone">
                  <span className="clients-upload-block__icon">
                    <FaImage />
                  </span>
                  <strong>Documentos de identidad, contratos, evidencias o capturas</strong>
                  <p>Puedes cargar imagenes y archivos del cliente para tener todo el contexto en una sola ficha.</p>
                  {assetLoading ? <span className="clients-upload-block__status">Cargando adjuntos...</span> : null}
                </div>

                {formData.assets?.length ? (
                  <div className="clients-assets-grid">
                    {formData.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className={`clients-assets-grid__item ${
                          asset.kind === 'image' ? '' : 'clients-assets-grid__item--file'
                        }`}
                      >
                        {asset.kind === 'image' ? (
                          <img src={asset.url} alt={asset.name} />
                        ) : (
                          <span className="clients-assets-grid__file">
                            <FaFileUpload />
                            {asset.name}
                          </span>
                        )}
                        <button
                          type="button"
                          className="clients-assets-grid__remove"
                          aria-label={`Quitar ${asset.name}`}
                          onClick={() => removeAsset(asset.id)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingClient ? 'Guardar cambios' : 'Crear cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminClients;
