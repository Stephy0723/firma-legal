import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import type { IconType } from 'react-icons';
import {
  FaChevronRight,
  FaDownload,
  FaFileAlt,
  FaFilePdf,
  FaFileUpload,
  FaFileWord,
  FaFolderOpen,
  FaFolderPlus,
  FaHistory,
  FaImage,
  FaPencilAlt,
  FaPlus,
  FaSearch,
  FaStickyNote,
  FaTag,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useData } from '../../../context/DataContext';
import type {
  DocumentAsset,
  DocumentInfo,
  DocumentUpdateMeta,
} from '../../../context/DataContext';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminDocuments.scss';

type DocFilter = 'all' | 'linked' | 'system';

type DocTypeMeta = {
  type: string;
  label: string;
  icon: IconType;
  tone: 'sky' | 'emerald' | 'amber' | 'pink';
};

type DocumentFormState = {
  title: string;
  client_id: string;
  folder_id: string;
  type: string;
  url: string;
  note: string;
  tagsInput: string;
  assets: DocumentAsset[];
};

const DOC_TYPES: DocTypeMeta[] = [
  { type: 'Identificacion', label: 'Identificacion', icon: FaFilePdf, tone: 'sky' },
  { type: 'Contrato', label: 'Contrato', icon: FaFileWord, tone: 'pink' },
  { type: 'Evidencia', label: 'Evidencia', icon: FaFilePdf, tone: 'amber' },
  { type: 'General', label: 'General', icon: FaFileAlt, tone: 'emerald' },
];

const FILTERS: Array<{ id: DocFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'linked', label: 'Vinculados' },
  { id: 'system', label: 'Internos' },
];

const FOLDER_TONES: Array<DocTypeMeta['tone']> = ['sky', 'emerald', 'amber', 'pink'];

const normalizeValue = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const resolveDocType = (value: string) =>
  DOC_TYPES.find((item) => normalizeValue(item.type) === normalizeValue(value)) ??
  DOC_TYPES[DOC_TYPES.length - 1];

const compareDocuments = (a: DocumentInfo, b: DocumentInfo) =>
  new Date(b.updatedAt || b.uploadDate).getTime() - new Date(a.updatedAt || a.uploadDate).getTime();

const formatDateLabel = (value?: string) => {
  if (!value) {
    return 'Sin fecha';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

const getPseudoSize = (doc: DocumentInfo) => {
  const seed = `${doc.id}-${doc.title}-${doc.type}-${doc.assets?.length || 0}`;
  const total = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const whole = (total % 24) + 3;
  const decimal = total % 10;

  return `${whole}.${decimal} MB`;
};

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase();

const truncateText = (value: string, max = 120) =>
  value.length > max ? `${value.slice(0, max).trimEnd()}...` : value;

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

const readFilesAsAssets = async (fileList: FileList) =>
  Promise.all(
    Array.from(fileList).map(async (file) => ({
      id: createAssetId(),
      name: file.name,
      kind: file.type.startsWith('image/') ? ('image' as const) : ('file' as const),
      type: file.type || 'application/octet-stream',
      url: await readFileAsDataUrl(file),
    })),
  );

const createDocumentFormState = (
  defaultFolderId = '',
  document?: DocumentInfo,
): DocumentFormState => ({
  title: document?.title || '',
  client_id: document?.client_id || '',
  folder_id: document?.folder_id || defaultFolderId,
  type: resolveDocType(document?.type || DOC_TYPES[0].type).type,
  url: document?.url && document.url !== '#' ? document.url : '',
  note: document?.note || '',
  tagsInput: (document?.tags || []).join(', '),
  assets: document?.assets || [],
});

const buildUpdateMeta = (
  previous: DocumentInfo,
  nextForm: DocumentFormState,
  resolvedTags: string[],
): DocumentUpdateMeta => {
  const nextUrl = nextForm.url.trim() || '#';
  const changes = [
    nextForm.title !== previous.title ? `nombre cambiado a ${nextForm.title}` : null,
    nextForm.note.trim() !== (previous.note || '') ? 'nota actualizada' : null,
    JSON.stringify(resolvedTags) !== JSON.stringify(previous.tags || []) ? 'tags actualizados' : null,
    nextForm.folder_id !== (previous.folder_id || '') ? 'folder ajustado' : null,
    nextForm.assets.length !== (previous.assets?.length || 0) ? 'imagenes actualizadas' : null,
    nextUrl !== (previous.url || '#') ? 'referencia actualizada' : null,
  ].filter(Boolean);

  return {
    action: 'Editado',
    details: changes.join(', ') || 'Se actualizo la ficha del documento.',
    actor: 'Panel admin',
  };
};

const AdminDocuments = () => {
  const {
    documentFolders,
    addFolder,
    deleteFolder,
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    clients,
  } = useData();

  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [docFilter, setDocFilter] = useState<DocFilter>('all');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentInfo | null>(null);
  const [folderName, setFolderName] = useState('');
  const [assetLoading, setAssetLoading] = useState(false);
  const [docFormData, setDocFormData] = useState<DocumentFormState>(() => createDocumentFormState());

  const folderMap = useMemo(
    () => new Map(documentFolders.map((folder) => [folder.id, folder])),
    [documentFolders],
  );
  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);

  const sortedDocuments = useMemo(
    () => [...documents].sort(compareDocuments),
    [documents],
  );

  const folderCards = useMemo(
    () =>
      documentFolders
        .map((folder, index) => {
          const docs = sortedDocuments.filter((document) => document.folder_id === folder.id);

          return {
            folder,
            count: docs.length,
            linkedCount: docs.filter((document) => Boolean(document.client_id)).length,
            latest: docs[0],
            tone: FOLDER_TONES[index % FOLDER_TONES.length],
          };
        })
        .sort((left, right) => {
          const rightDate = new Date(
            right.latest?.updatedAt || right.latest?.uploadDate || right.folder.created_at || 0,
          ).getTime();
          const leftDate = new Date(
            left.latest?.updatedAt || left.latest?.uploadDate || left.folder.created_at || 0,
          ).getTime();

          return rightDate - leftDate;
        }),
    [documentFolders, sortedDocuments],
  );

  const visibleDocuments = useMemo(() => {
    const normalizedSearch = normalizeValue(searchQuery.trim());

    return sortedDocuments.filter((document) => {
      if (currentFolder === 'root' && document.folder_id) {
        return false;
      }

      if (currentFolder !== 'all' && currentFolder !== 'root' && document.folder_id !== currentFolder) {
        return false;
      }

      if (docFilter === 'linked' && !document.client_id) {
        return false;
      }

      if (docFilter === 'system' && document.client_id) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const folderNameForSearch = document.folder_id ? folderMap.get(document.folder_id)?.name || '' : 'archivo central';
      const clientNameForSearch =
        document.clientName || (document.client_id ? clientMap.get(document.client_id)?.name || '' : '');
      const haystack = normalizeValue(
        [
          document.title,
          document.type,
          document.note || '',
          (document.tags || []).join(' '),
          folderNameForSearch,
          clientNameForSearch,
        ].join(' '),
      );

      return haystack.includes(normalizedSearch);
    });
  }, [clientMap, currentFolder, docFilter, folderMap, searchQuery, sortedDocuments]);

  const selectedDocument =
    visibleDocuments.find((document) => document.id === selectedDocumentId) || visibleDocuments[0] || null;

  const selectedHistory = useMemo(() => {
    if (!selectedDocument) {
      return [];
    }

    if (selectedDocument.history?.length) {
      return selectedDocument.history;
    }

    return [
      {
        id: `history-${selectedDocument.id}`,
        action: 'Creado',
        details: 'Registro importado a la biblioteca documental.',
        actor: 'Sistema',
        date: selectedDocument.uploadDate,
      },
    ];
  }, [selectedDocument]);

  const activeFolderLabel = useMemo(() => {
    if (currentFolder === 'all') {
      return 'Biblioteca completa';
    }

    if (currentFolder === 'root') {
      return 'Archivo central';
    }

    return folderMap.get(currentFolder)?.name || 'Folder';
  }, [currentFolder, folderMap]);

  const linkedClients = useMemo(
    () => new Set(documents.filter((document) => document.client_id).map((document) => document.client_id)).size,
    [documents],
  );

  const topTypes = useMemo(() => {
    const counters = documents.reduce<Record<string, number>>((acc, document) => {
      acc[document.type] = (acc[document.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counters)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([type, count]) => ({
        meta: resolveDocType(type),
        count,
      }));
  }, [documents]);

  const documentsWithImages = useMemo(
    () => documents.filter((document) => (document.assets || []).some((asset) => asset.kind === 'image')).length,
    [documents],
  );

  const taggedDocuments = useMemo(
    () => documents.filter((document) => (document.tags || []).length > 0).length,
    [documents],
  );

  const rootDocumentsCount = useMemo(
    () => documents.filter((document) => !document.folder_id).length,
    [documents],
  );

  useEffect(() => {
    if (!visibleDocuments.length) {
      setSelectedDocumentId('');
      return;
    }

    if (!visibleDocuments.some((document) => document.id === selectedDocumentId)) {
      setSelectedDocumentId(visibleDocuments[0].id);
    }
  }, [selectedDocumentId, visibleDocuments]);

  const openCreateDocumentModal = (folderId?: string) => {
    setEditingDocument(null);
    setDocFormData(
      createDocumentFormState(
        folderId || (currentFolder !== 'all' && currentFolder !== 'root' ? currentFolder : ''),
      ),
    );
    setIsDocModalOpen(true);
  };

  const openEditDocumentModal = (document: DocumentInfo) => {
    setEditingDocument(document);
    setDocFormData(createDocumentFormState(document.folder_id || '', document));
    setIsDocModalOpen(true);
  };

  const closeDocumentModal = () => {
    setIsDocModalOpen(false);
    setEditingDocument(null);
    setDocFormData(createDocumentFormState());
    setAssetLoading(false);
  };

  const handleCreateFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!folderName.trim()) {
      return;
    }

    addFolder({
      name: folderName.trim(),
      created_at: new Date().toISOString(),
    });
    setFolderName('');
    setIsFolderModalOpen(false);
  };

  const handleDocumentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = docFormData.title.trim();

    if (!title) {
      return;
    }

    const resolvedTags = parseTags(docFormData.tagsInput);
    const selectedClient = docFormData.client_id ? clientMap.get(docFormData.client_id) : null;
    const payload = {
      title,
      client_id: docFormData.client_id || undefined,
      clientName: selectedClient?.name,
      folder_id: docFormData.folder_id || undefined,
      type: docFormData.type,
      url: docFormData.url.trim() || '#',
      note: docFormData.note.trim(),
      tags: resolvedTags,
      assets: docFormData.assets,
    };

    if (editingDocument) {
      await updateDocument(editingDocument.id, payload, buildUpdateMeta(editingDocument, docFormData, resolvedTags));
      setSelectedDocumentId(editingDocument.id);
    } else {
      await addDocument(payload);
    }

    closeDocumentModal();
  };

  const handleAssetSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }

    try {
      setAssetLoading(true);
      const nextAssets = await readFilesAsAssets(event.target.files);
      setDocFormData((prev) => ({
        ...prev,
        assets: [...prev.assets, ...nextAssets],
      }));
    } finally {
      setAssetLoading(false);
      event.target.value = '';
    }
  };

  const removePendingAsset = (assetId: string) => {
    setDocFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((asset) => asset.id !== assetId),
    }));
  };

  const handleDeleteFolder = (folderId: string) => {
    const hasDocuments = documents.some((document) => document.folder_id === folderId);

    if (hasDocuments) {
      window.alert('Este folder todavia tiene documentos. Muevelos o eliminalos primero.');
      return;
    }

    if (!window.confirm('Se eliminara este folder vacio. Deseas continuar?')) {
      return;
    }

    deleteFolder(folderId);

    if (currentFolder === folderId) {
      setCurrentFolder('all');
    }
  };

  const handleDeleteDocument = (document: DocumentInfo) => {
    if (!window.confirm(`Se eliminara "${document.title}". Deseas continuar?`)) {
      return;
    }

    deleteDocument(document.id);
  };

  const handleFolderCardKeyDown = (event: KeyboardEvent<HTMLElement>, folderId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setCurrentFolder(folderId);
    }
  };

  const handleDocumentCardKeyDown = (event: KeyboardEvent<HTMLElement>, documentId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedDocumentId(documentId);
    }
  };

  const handleDownloadDocument = (document: DocumentInfo) => {
    const primaryAsset = document.assets?.[0];

    if (primaryAsset?.url) {
      const link = window.document.createElement('a');
      link.href = primaryAsset.url;
      link.download = primaryAsset.name;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.click();
      return;
    }

    if (document.url && document.url !== '#') {
      window.open(document.url, '_blank', 'noopener,noreferrer');
    }
  };

  const selectedTypeMeta = selectedDocument ? resolveDocType(selectedDocument.type) : DOC_TYPES[0];
  const selectedFolderName = selectedDocument?.folder_id
    ? folderMap.get(selectedDocument.folder_id)?.name || 'Folder'
    : 'Archivo central';
  const selectedClientName =
    selectedDocument?.clientName
    || (selectedDocument?.client_id
      ? clientMap.get(selectedDocument.client_id)?.name || 'Cliente vinculado'
      : 'Interno');
  const selectedImageAssets = selectedDocument?.assets?.filter((asset) => asset.kind === 'image') || [];
  const selectedFileAssets = selectedDocument?.assets?.filter((asset) => asset.kind !== 'image') || [];

  return (
    <div className="documents-hub services-studio">
      <PageHelp
        title="Documentos"
        description="Organiza folders, documentos, tags, notas, adjuntos e historial desde una biblioteca visual del despacho."
        features={[
          'Crea folders y registra documentos con cliente, tipo y nota.',
          'Agrega tags, imagenes, archivos y referencias externas.',
          'Revisa historial de cambios y descarga adjuntos desde la ficha lateral.',
        ]}
      />

      <div className="documents-hub__shell">
        <header className="documents-topbar services-header">
          <div className="documents-topbar__copy services-header__copy">
            <div className="documents-breadcrumb">
              <button type="button" onClick={() => setCurrentFolder('all')}>
                Folders
              </button>
              <FaChevronRight />
              <span>{activeFolderLabel}</span>
            </div>
            <h1>Gestión documental expedientes</h1>
          </div>

          <div className="documents-topbar__panel services-header__controls">
            <label className="documents-search services-search" aria-label="Buscar documento">
              <FaSearch />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por documento, cliente, tag o nota"
              />
            </label>

            <div className="documents-actions">
              <button
                type="button"
                className="documents-action-btn documents-action-btn--ghost"
                onClick={() => setIsFolderModalOpen(true)}
              >
                <FaFolderPlus />
                Nuevo folder
              </button>
              <button
                type="button"
                className="documents-action-btn documents-action-btn--primary services-cta"
                onClick={() => openCreateDocumentModal()}
              >
                <FaPlus />
                Nuevo documento
              </button>
            </div>
          </div>
        </header>

        <div className="documents-toolbar">
          <div className="documents-toolbar__filters">
            <button
              type="button"
              className={`documents-filter-chip ${currentFolder === 'all' ? 'is-active' : ''}`}
              onClick={() => setCurrentFolder('all')}
            >
              Toda la biblioteca
            </button>
            <button
              type="button"
              className={`documents-filter-chip documents-filter-chip--folder ${
                currentFolder === 'root' ? 'is-active' : ''
              }`}
              onClick={() => setCurrentFolder('root')}
            >
              <FaFolderOpen />
              Archivo central
            </button>
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`documents-filter-chip ${docFilter === filter.id ? 'is-active' : ''}`}
                onClick={() => setDocFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="documents-metrics services-metrics">
            <div className="documents-metric services-metric">
              <strong>{documents.length}</strong>
              documentos
            </div>
            <div className="documents-metric services-metric">
              <strong>{documentsWithImages}</strong>
              con imagenes
            </div>
            <div className="documents-metric services-metric">
              <strong>{taggedDocuments}</strong>
              con tags
            </div>
          </div>
        </div>

        <section className="documents-section">
          <div className="documents-section__head">
            <div>
              <span className="documents-section__eyebrow">Folders</span>
              <h2>Estructura documental</h2>
            </div>
            <div className="documents-result-pill">
              <strong>{folderCards.length + 1}</strong>
              <span>espacios activos</span>
            </div>
          </div>

          <div className="folder-board">
            <article
              className={`folder-card service-card tone-sky ${currentFolder === 'root' ? 'is-active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setCurrentFolder('root')}
              onKeyDown={(event) => handleFolderCardKeyDown(event, 'root')}
            >
              <div className="folder-card__header">
                <span className="folder-card__icon">
                  <FaFolderOpen />
                </span>
              </div>
              <div>
                <h3>Archivo central</h3>
                <p>Documentos internos, formatos base y material de soporte sin cliente asignado.</p>
              </div>
              <div className="folder-card__meta">
                <div>
                  <span>Documentos</span>
                  <strong>{rootDocumentsCount}</strong>
                </div>
                <div>
                  <span>Actualizado</span>
                  <strong>
                    {formatDateLabel(
                      sortedDocuments.find((document) => !document.folder_id)?.updatedAt
                        || sortedDocuments.find((document) => !document.folder_id)?.uploadDate,
                    )}
                  </strong>
                </div>
              </div>
            </article>

            {folderCards.map(({ folder, count, linkedCount, latest, tone }) => (
              <article
                key={folder.id}
                className={`folder-card service-card tone-${tone} ${currentFolder === folder.id ? 'is-active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setCurrentFolder(folder.id)}
                onKeyDown={(event) => handleFolderCardKeyDown(event, folder.id)}
              >
                <div className="folder-card__header">
                  <span className="folder-card__icon">
                    <FaFolderOpen />
                  </span>
                  <button
                    type="button"
                    className="folder-card__delete"
                    aria-label={`Eliminar folder ${folder.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>

                <div>
                  <h3>{folder.name}</h3>
                  <p>
                    {latest
                      ? `Ultimo movimiento en ${formatDateLabel(latest.updatedAt || latest.uploadDate)}`
                      : 'Listo para recibir documentos, notas y evidencias visuales.'}
                  </p>
                </div>

                <div className="folder-card__meta">
                  <div>
                    <span>Documentos</span>
                    <strong>{count}</strong>
                  </div>
                  <div>
                    <span>Clientes</span>
                    <strong>{linkedCount}</strong>
                  </div>
                </div>
              </article>
            ))}

            <button
              type="button"
              className="folder-card folder-card--new service-card"
              onClick={() => setIsFolderModalOpen(true)}
            >
              <div className="folder-card__header">
                <span className="folder-card__plus">
                  <FaPlus />
                </span>
              </div>
              <div>
                <h3>Crear nuevo folder</h3>
                <p>Abre una nueva area para expedientes, contratos, custodia, migracion u otras practicas.</p>
              </div>
              <div className="folder-card__meta">
                <div>
                  <span>Ejemplo</span>
                  <strong>Folder legal</strong>
                </div>
                <div>
                  <span>Uso</span>
                  <strong>Subir y organizar</strong>
                </div>
              </div>
            </button>
          </div>
        </section>

        <section className="documents-section">
          <div className="documents-section__head">
            <div>
              <span className="documents-section__eyebrow">Documentos</span>
              <h2>{activeFolderLabel}</h2>
              <p>
                Visualiza documentos con tags, notas de actualizacion, imagenes adjuntas y acceso rapido a
                edicion o descarga.
              </p>
            </div>
            <div className="documents-result-pill">
              <strong>{visibleDocuments.length}</strong>
              <span>visibles ahora</span>
            </div>
          </div>

          {visibleDocuments.length ? (
            <div className="documents-workspace">
              <div className="document-board">
                {visibleDocuments.map((document) => {
                  const typeMeta = resolveDocType(document.type);
                  const folderName =
                    document.folder_id ? folderMap.get(document.folder_id)?.name || 'Folder' : 'Archivo central';
                  const clientName =
                    document.clientName
                    || (document.client_id
                      ? clientMap.get(document.client_id)?.name || 'Cliente vinculado'
                      : 'Interno');
                  const previewAsset = document.assets?.find((asset) => asset.kind === 'image') || document.assets?.[0];
                  const historyCount = document.history?.length || 1;
                  const tagList = document.tags || [];
                  const canDownload = Boolean(previewAsset?.url || (document.url && document.url !== '#'));

                  return (
                    <article
                      key={document.id}
                      className={`document-entry service-card tone-${typeMeta.tone} ${
                        selectedDocumentId === document.id ? 'is-active' : ''
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedDocumentId(document.id)}
                      onKeyDown={(event) => handleDocumentCardKeyDown(event, document.id)}
                    >
                      <div className="document-entry__top">
                        <span className="document-entry__type">{typeMeta.label}</span>
                        <div className="document-entry__actions service-card__actions">
                          <button
                            type="button"
                            className="document-entry__action-icon"
                            aria-label={`Editar ${document.title}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditDocumentModal(document);
                            }}
                          >
                            <FaPencilAlt />
                          </button>
                          <button
                            type="button"
                            className="document-entry__action-icon"
                            aria-label={`Eliminar ${document.title}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteDocument(document);
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <div className="document-entry__preview">
                        {previewAsset?.kind === 'image' ? (
                          <img src={previewAsset.url} alt={document.title} />
                        ) : (
                          <span className="document-entry__icon">
                            <typeMeta.icon />
                          </span>
                        )}
                        {(document.assets || []).length > 0 ? (
                          <span className="document-entry__preview-count">
                            {(document.assets || []).length} adjuntos
                          </span>
                        ) : null}
                      </div>

                      <div className="document-entry__hero">
                        <div className="document-entry__owner">
                          <span className="document-entry__avatar">{getInitials(clientName || folderName)}</span>
                          <div>
                            <strong>{document.title}</strong>
                            <span>
                              {folderName}
                              {' / '}
                              {clientName}
                            </span>
                          </div>
                        </div>
                        <span className={`document-entry__status ${document.client_id ? 'is-linked' : 'is-system'}`}>
                          {document.client_id ? 'Vinculado' : 'Interno'}
                        </span>
                      </div>

                      {tagList.length ? (
                        <div className="document-entry__tags">
                          {tagList.slice(0, 4).map((tag) => (
                            <span key={`${document.id}-${tag}`} className="documents-tag-chip">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {document.note ? <p className="document-entry__note">{truncateText(document.note, 118)}</p> : null}

                      <div className="document-entry__meta">
                        <div>
                          <span>Ultima actualizacion</span>
                          <strong>{formatDateLabel(document.updatedAt || document.uploadDate)}</strong>
                        </div>
                        <div>
                          <span>Volumen</span>
                          <strong>{getPseudoSize(document)}</strong>
                        </div>
                      </div>

                      <div className="document-entry__footer">
                        <button
                          type="button"
                          className="document-entry__action"
                          disabled={!canDownload}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDownloadDocument(document);
                          }}
                        >
                          <FaDownload />
                          Descargar
                        </button>
                        <span className="document-entry__footer-note">
                          <FaHistory />
                          {historyCount} cambios
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="documents-sidebar-stack">
                <div className={`documents-summary-card service-card documents-selected documents-selected--${selectedTypeMeta.tone}`}>
                  {selectedDocument ? (
                    <>
                      <div className="documents-selected__head">
                        <div>
                          <span className="documents-section__eyebrow">Ficha activa</span>
                          <h3>{selectedDocument.title}</h3>
                          <p>
                            {selectedFolderName}
                            {' / '}
                            {selectedClientName}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="documents-link-btn"
                          onClick={() => openEditDocumentModal(selectedDocument)}
                        >
                          <FaPencilAlt />
                          Editar
                        </button>
                      </div>

                      <div className="documents-selected__meta">
                        <div>
                          <span>Tipo</span>
                          <strong>{selectedTypeMeta.label}</strong>
                        </div>
                        <div>
                          <span>Tags</span>
                          <strong>{(selectedDocument.tags || []).length}</strong>
                        </div>
                        <div>
                          <span>Adjuntos</span>
                          <strong>{(selectedDocument.assets || []).length}</strong>
                        </div>
                        <div>
                          <span>Actualizado</span>
                          <strong>{formatDateLabel(selectedDocument.updatedAt || selectedDocument.uploadDate)}</strong>
                        </div>
                      </div>

                      <div className="documents-selected__section">
                        <div className="documents-selected__section-head">
                          <FaStickyNote />
                          <strong>Nota de ultima actualizacion</strong>
                        </div>
                        <p>
                          {selectedDocument.note
                            || 'Todavia no hay una nota asociada. Puedes agregar contexto, cambios recientes y responsables.'}
                        </p>
                      </div>

                      <div className="documents-selected__section">
                        <div className="documents-selected__section-head">
                          <FaTag />
                          <strong>Tags asociados</strong>
                        </div>
                        <div className="documents-selected__tags">
                          {(selectedDocument.tags || []).length ? (
                            (selectedDocument.tags || []).map((tag) => (
                              <span key={`selected-${selectedDocument.id}-${tag}`} className="documents-tag-chip">
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="documents-history__empty">Sin tags asignados todavia.</span>
                          )}
                        </div>
                      </div>

                      <div className="documents-selected__section">
                        <div className="documents-selected__section-head">
                          <FaImage />
                          <strong>Galeria y adjuntos</strong>
                        </div>
                        {(selectedDocument.assets || []).length ? (
                          <div className="documents-selected__gallery">
                            {selectedImageAssets.map((asset) => (
                              <a
                                key={asset.id}
                                className="documents-selected__thumb"
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
                                className="documents-selected__thumb documents-selected__thumb--file"
                                href={asset.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <FaFileUpload />
                                <span>{truncateText(asset.name, 36)}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="documents-history__empty">
                            Este documento aun no tiene imagenes ni archivos adjuntos.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="documents-empty documents-empty--compact services-empty">
                      <span className="documents-empty__icon">
                        <FaFileAlt />
                      </span>
                      <h3>Selecciona un documento</h3>
                      <p>Cuando abras una ficha veras su nota, tags, imagenes y el historial de cambios.</p>
                    </div>
                  )}
                </div>

                <div className="documents-summary-card service-card documents-summary-card--soft">
                  <span className="documents-section__eyebrow">Resumen</span>
                  <h3>Mapa de la biblioteca</h3>
                  <div className="documents-summary-stats">
                    <div>
                      <span>Folders creados</span>
                      <strong>{documentFolders.length}</strong>
                    </div>
                    <div>
                      <span>Clientes vinculados</span>
                      <strong>{linkedClients}</strong>
                    </div>
                    <div>
                      <span>Archivo central</span>
                      <strong>{rootDocumentsCount} documentos internos</strong>
                    </div>
                  </div>

                  <ul className="documents-type-list">
                    {topTypes.map(({ meta, count }) => (
                      <li key={meta.type} className="documents-type-row">
                        <span className="documents-type-row__icon">
                          <meta.icon />
                        </span>
                        <div>
                          <strong>{meta.label}</strong>
                          <span>{count} registros</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="documents-summary-card service-card documents-history">
                  <div className="documents-history__title">
                    <span className="documents-type-row__icon">
                      <FaHistory />
                    </span>
                    <div>
                      <h3>Historial de cambios</h3>
                      <p>Cada edicion deja una traza con accion, detalle y fecha.</p>
                    </div>
                  </div>

                  {selectedHistory.length ? (
                    <div className="documents-history__list">
                      {selectedHistory.map((item) => (
                        <article key={item.id} className="documents-history__item">
                          <strong>{item.action}</strong>
                          <p>{item.details}</p>
                          <span>
                            {item.actor}
                            {' / '}
                            {formatDateLabel(item.date)}
                          </span>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="documents-history__empty">Aun no hay movimientos registrados.</p>
                  )}
                </div>
              </aside>
            </div>
          ) : (
            <div className="documents-empty services-empty">
              <span className="documents-empty__icon">
                <FaSearch />
              </span>
              <h3>No encontramos documentos para esta vista.</h3>
              <p>
                Prueba otro folder, limpia la busqueda o crea un nuevo expediente con nota, tags e imagenes.
              </p>
            </div>
          )}
        </section>

        {isFolderModalOpen ? (
          <div className="admin-modal-overlay" role="presentation" onClick={() => setIsFolderModalOpen(false)}>
            <div className="admin-modal admin-modal--compact" onClick={(event) => event.stopPropagation()}>
              <div className="admin-modal__header">
                <div>
                  <span className="documents-modal__eyebrow">Nuevo folder</span>
                  <h3>Crear estructura documental</h3>
                </div>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Cerrar modal"
                  onClick={() => setIsFolderModalOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="admin-modal__body">
                <form className="documents-form" onSubmit={handleCreateFolder}>
                  <label className="documents-field">
                    <span>Nombre del folder</span>
                    <input
                      type="text"
                      value={folderName}
                      onChange={(event) => setFolderName(event.target.value)}
                      placeholder="Ej. Folder legal, Custodia, Contratos"
                    />
                  </label>

                  <div className="admin-modal__footer">
                    <button
                      type="button"
                      className="documents-action-btn documents-action-btn--ghost"
                      onClick={() => setIsFolderModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="documents-action-btn documents-action-btn--primary services-cta">
                      Guardar folder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        {isDocModalOpen ? (
          <div className="admin-modal-overlay" role="presentation" onClick={closeDocumentModal}>
            <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
              <div className="admin-modal__header">
                <div>
                  <span className="documents-modal__eyebrow">
                    {editingDocument ? 'Editar documento' : 'Nuevo documento'}
                  </span>
                  <h3>{editingDocument ? 'Actualizar ficha documental' : 'Registrar documento con metadata'}</h3>
                </div>
                <button
                  type="button"
                  className="admin-modal__close"
                  aria-label="Cerrar modal"
                  onClick={closeDocumentModal}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="admin-modal__body">
                <form className="documents-form" onSubmit={handleDocumentSubmit}>
                  <div className="documents-form__row">
                    <label className="documents-field">
                      <span>Nombre del documento</span>
                      <input
                        type="text"
                        value={docFormData.title}
                        onChange={(event) =>
                          setDocFormData((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Ej. Custodia provisional - marzo 2026"
                      />
                    </label>

                    <label className="documents-field">
                      <span>Cliente vinculado</span>
                      <select
                        value={docFormData.client_id}
                        onChange={(event) =>
                          setDocFormData((prev) => ({
                            ...prev,
                            client_id: event.target.value,
                          }))
                        }
                      >
                        <option value="">Interno / sin cliente</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="documents-form__row">
                    <label className="documents-field">
                      <span>Folder</span>
                      <select
                        value={docFormData.folder_id}
                        onChange={(event) =>
                          setDocFormData((prev) => ({
                            ...prev,
                            folder_id: event.target.value,
                          }))
                        }
                      >
                        <option value="">Archivo central</option>
                        {documentFolders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="documents-field">
                      <span>Tipo</span>
                      <select
                        value={docFormData.type}
                        onChange={(event) =>
                          setDocFormData((prev) => ({
                            ...prev,
                            type: event.target.value,
                          }))
                        }
                      >
                        {DOC_TYPES.map((type) => (
                          <option key={type.type} value={type.type}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="documents-form__row documents-form__row--split">
                    <label className="documents-field">
                      <span>Nota</span>
                      <textarea
                        value={docFormData.note}
                        onChange={(event) =>
                          setDocFormData((prev) => ({
                            ...prev,
                            note: event.target.value,
                          }))
                        }
                        placeholder="Ej. Ultima actualizacion realizada por el abogado responsable, pendiente de firma."
                        rows={4}
                      />
                    </label>

                    <div className="documents-form__stack">
                      <label className="documents-field">
                        <span>Tags</span>
                        <input
                          type="text"
                          value={docFormData.tagsInput}
                          onChange={(event) =>
                            setDocFormData((prev) => ({
                              ...prev,
                              tagsInput: event.target.value,
                            }))
                          }
                          placeholder="abogado, custodia, urgente, firmado"
                        />
                      </label>

                      <label className="documents-field">
                        <span>URL o referencia externa</span>
                        <input
                          type="url"
                          value={docFormData.url}
                          onChange={(event) =>
                            setDocFormData((prev) => ({
                              ...prev,
                              url: event.target.value,
                            }))
                          }
                          placeholder="https://..."
                        />
                      </label>
                    </div>
                  </div>

                  <div className="documents-upload-block">
                    <div className="documents-upload-block__header">
                      <div>
                        <span className="documents-upload-block__eyebrow">Adjuntos visuales</span>
                        <h4>Sube imagenes o archivos del expediente</h4>
                      </div>
                      <label className="documents-file-picker">
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

                    <div className="documents-dropzone">
                      <span className="documents-dropzone__icon">
                        <FaImage />
                      </span>
                      <strong>Adjunta evidencias, capturas, fotos o documentos escaneados</strong>
                      <p>
                        Puedes mezclar imagenes y archivos del caso. Cada cambio quedara reflejado en el
                        historial del documento.
                      </p>
                      {assetLoading ? <span className="documents-upload-block__status">Cargando adjuntos...</span> : null}
                    </div>

                    {docFormData.assets.length ? (
                      <div className="documents-asset-grid">
                        {docFormData.assets.map((asset) => (
                          <div
                            key={asset.id}
                            className={`documents-asset-thumb ${
                              asset.kind === 'image' ? '' : 'documents-asset-thumb--file'
                            }`}
                          >
                            {asset.kind === 'image' ? (
                              <img src={asset.url} alt={asset.name} />
                            ) : (
                              <span className="documents-asset-thumb__file">
                                <FaFileUpload />
                                {truncateText(asset.name, 30)}
                              </span>
                            )}
                            <button
                              type="button"
                              className="documents-asset-remove"
                              aria-label={`Quitar ${asset.name}`}
                              onClick={() => removePendingAsset(asset.id)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="admin-modal__footer">
                    <button
                      type="button"
                      className="documents-action-btn documents-action-btn--ghost"
                      onClick={closeDocumentModal}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="documents-action-btn documents-action-btn--primary services-cta">
                      {editingDocument ? 'Guardar cambios' : 'Crear documento'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDocuments;
