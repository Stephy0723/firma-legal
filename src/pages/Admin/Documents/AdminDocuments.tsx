import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import type { DocumentFolder, DocumentInfo } from '../../../context/DataContext';
import { FaFileAlt, FaFilePdf, FaFileWord, FaFileUpload, FaTrash, FaDownload, FaFolder, FaFolderPlus, FaChevronRight, FaLink } from 'react-icons/fa';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminDocuments.scss';

const DEFAULT_DOCS = [
  { type: 'Identificación', ext: 'pdf', icon: FaFilePdf },
  { type: 'Contrato', ext: 'docx', icon: FaFileWord },
  { type: 'Evidencia', ext: 'pdf', icon: FaFilePdf },
  { type: 'General', ext: 'txt', icon: FaFileAlt },
];

const AdminDocuments = () => {
  const { documentFolders, addFolder, deleteFolder, documents, addDocument, deleteDocument, clients } = useData();
  
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [folderName, setFolderName] = useState('');
  const [docFormData, setDocFormData] = useState<Omit<DocumentInfo, 'id' | 'uploadDate'>>({
    title: '',
    client_id: '',
    folder_id: '',
    type: 'Identificación',
    url: '#',
  });

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      addFolder({ name: folderName.trim() });
      setFolderName('');
      setIsFolderModalOpen(false);
    }
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      ...docFormData,
      folder_id: currentFolder ? currentFolder.id : docFormData.folder_id,
    });
    setIsDocModalOpen(false);
    setDocFormData({ title: '', client_id: '', folder_id: '', type: 'Identificación', url: '#' });
  };

  const getDocIcon = (type: string) => {
    const docType = DEFAULT_DOCS.find(d => d.type === type);
    const Icon = docType?.icon || FaFileAlt;
    return <Icon />;
  };

  const getClientName = (clientId?: string, fallbackStr?: string) => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) return client.name;
    }
    return fallbackStr || 'Sistema Central';
  };

  // Determinar qué documentos mostrar
  const visibleDocs = currentFolder 
    ? documents.filter(d => d.folder_id === currentFolder.id)
    : documents; // En vista root, mostrar todos (o recientes)

  return (
    <div className="admin-documents">
      <PageHelp 
        title="Gestor de Documentos"
        description="Organiza tus archivos como en una nube profesional. Crea carpetas para áreas específicas y sube documentos vinculados a tus clientes."
        features={[
          "Acceso Rápido: Navega instantáneamente por tus carpetas temáticas.",
          "Vista Global: Mira todos los archivos en la raíz o entra a una carpeta para ver su contenido aislado.",
          "Vinculación: Asigna documentos subidos directamente al perfil de un cliente."
        ]}
      />

      <div className="drive-header">
        <div className="drive-title">
          {currentFolder ? (
            <div className="breadcrumb">
              <span className="root-link" onClick={() => setCurrentFolder(null)}>Mi Unidad</span>
              <FaChevronRight className="divider" />
              <span className="current"><FaFolder /> {currentFolder.name}</span>
            </div>
          ) : (
             <div className="breadcrumb">
               <span className="current">Mi Unidad (Documentos)</span>
             </div>
          )}
        </div>

        <div className="drive-actions">
          {!currentFolder && (
            <button className="drive-btn-secondary" onClick={() => setIsFolderModalOpen(true)}>
              <FaFolderPlus /> Nueva Carpeta
            </button>
          )}
          <button className="drive-btn-primary" onClick={() => setIsDocModalOpen(true)}>
            <FaFileUpload /> Subir Archivo
          </button>
        </div>
      </div>

      <div className="drive-content">
        {!currentFolder && (
          <div className="drive-section">
            <h4 className="section-title">ACCESO RÁPIDO (CARPETAS)</h4>
            <div className="folders-grid">
              {documentFolders.length === 0 ? (
                <div className="empty-subtext">No hay carpetas creadas. Organice sus documentos creando una.</div>
              ) : (
                documentFolders.map(folder => {
                  const folderDocsCount = documents.filter(d => d.folder_id === folder.id).length;
                  return (
                    <div key={folder.id} className="drive-folder-card" onClick={() => setCurrentFolder(folder)}>
                      <div className="folder-top">
                        <span className="folder-tag">Carpeta</span>
                        <button className="icon-btn delete-icon" onClick={(e) => {
                          e.stopPropagation();
                          if(window.confirm('¿Eliminar carpeta?')) deleteFolder(folder.id);
                        }}><FaTrash /></button>
                      </div>
                      <div className="folder-body">
                        <FaFolder className="big-icon" />
                        <h5>{folder.name}</h5>
                      </div>
                      <div className="folder-footer">
                        <span>Última modificación reciente</span>
                        <span className="doc-count">{folderDocsCount} arch.</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="drive-section">
          <h4 className="section-title">{currentFolder ? `ARCHIVOS EN "${currentFolder.name.toUpperCase()}"` : 'TODOS LOS ARCHIVOS'}</h4>
          
          <div className="drive-list-container">
            <table className="drive-table">
              <thead>
                <tr>
                  <th>NOMBRE</th>
                  <th>PROPIETARIO / CLIENTE</th>
                  <th>ÚLTIMA MODIFICACIÓN</th>
                  <th>TAMAÑO</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {visibleDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-list">No hay archivos para mostrar aquí.</td>
                  </tr>
                ) : (
                  visibleDocs.map(doc => (
                    <tr key={doc.id} className="drive-file-row">
                      <td className="col-name">
                        <span className="file-icon">{getDocIcon(doc.type)}</span>
                        <span className="file-title">{doc.title}</span>
                      </td>
                      <td className="col-owner">
                        <div className="owner-chip">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getClientName(doc.client_id, doc.clientName))}&background=random`} alt="avatar" />
                          <span>{getClientName(doc.client_id, doc.clientName)}</span>
                        </div>
                      </td>
                      <td className="col-date">{new Date(doc.uploadDate).toLocaleString()}</td>
                      <td className="col-size">
                        {/* Simulación de tamaño */}
                        {Math.floor(Math.random() * 20) + 1} MB
                      </td>
                      <td className="col-actions text-right">
                        <button className="drive-icon-btn"><FaLink /></button>
                        <button className="drive-icon-btn"><FaDownload /></button>
                        <button className="drive-icon-btn delete" onClick={() => {
                          if(window.confirm('¿Eliminar archivo permanentemente?')) deleteDocument(doc.id);
                        }}><FaTrash /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Folders modal */}
      {isFolderModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal modal-sm">
            <div className="admin-modal__header">
              <h3>Crear Nueva Carpeta</h3>
              <button className="admin-modal__close" onClick={() => setIsFolderModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateFolder} className="admin-modal__body">
              <div className="form-group">
                <label>Nombre de la Carpeta *</label>
                <input required type="text" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Ej: Migración Visas 2024" autoFocus />
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsFolderModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {isDocModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>Subir Documento {currentFolder ? `a "${currentFolder.name}"` : 'a Mi Unidad'}</h3>
              <button className="admin-modal__close" onClick={() => setIsDocModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUploadDocument} className="admin-modal__body">
              <div className="form-group">
                <label>Título / Nombre del Documento *</label>
                <input required type="text" value={docFormData.title} onChange={e => setDocFormData({...docFormData, title: e.target.value})} placeholder="Ej. Copia Pasaporte" autoFocus />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Vincular a Cliente (Opcional)</label>
                  <select value={docFormData.client_id} onChange={e => setDocFormData({...docFormData, client_id: e.target.value})}>
                    <option value="">-- Sin Cliente (Sistema) --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {!currentFolder && (
                  <div className="form-group">
                    <label>Carpeta Destino (Opcional)</label>
                    <select value={docFormData.folder_id || ''} onChange={e => setDocFormData({...docFormData, folder_id: e.target.value})}>
                      <option value="">-- Raíz (Mi Unidad) --</option>
                      {documentFolders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Tipo de Documento</label>
                <select value={docFormData.type} onChange={e => setDocFormData({...docFormData, type: e.target.value})}>
                  {DEFAULT_DOCS.map(d => (
                    <option key={d.type} value={d.type}>{d.type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Carga de Archivo Segura (Simulación)</label>
                <div className="mock-file-upload">
                  <FaFileUpload className="upload-icon" />
                  <span>Haga clic o arrastre el archivo en formato PDF/DOCX</span>
                </div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsDocModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">Guardar Documento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
