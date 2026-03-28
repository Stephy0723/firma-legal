import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import type { LegalCase } from '../../../context/DataContext';
import { FaPlus, FaEdit, FaTrash, FaBriefcase, FaUserTie, FaUser, FaInfoCircle } from 'react-icons/fa';
import './AdminCases.scss';

const AdminCases = () => {
  const { cases, addCase, updateCase, deleteCase, clients, team } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [formData, setFormData] = useState<Omit<LegalCase, 'id' | 'created_at'>>({
    client_id: '',
    lawyer_id: '',
    title: '',
    description: '',
    status: 'Evaluación',
  });

  const handleOpenModal = (caseItem?: LegalCase) => {
    if (caseItem) {
      setEditingId(caseItem.id);
      setFormData({
        client_id: caseItem.client_id,
        lawyer_id: caseItem.lawyer_id,
        title: caseItem.title,
        description: caseItem.description,
        status: caseItem.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        client_id: '',
        lawyer_id: '',
        title: '',
        description: '',
        status: 'Evaluación',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCase(editingId, formData);
    } else {
      addCase(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`¿Está seguro de eliminar el caso "${title}"?`)) {
      deleteCase(id);
    }
  };

  const statusColors: Record<string, string> = {
    'Evaluación': 'admin-badge--neutral',
    'En Proceso': 'admin-badge--warning',
    'En Corte': 'admin-badge--accent',
    'Cerrado': 'admin-badge--success',
  };

  const filteredCases = filterStatus === 'all' 
    ? cases 
    : cases.filter(c => c.status === filterStatus);

  return (
    <div className="admin-cases">
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h3>Seguimiento de Expedientes</h3>
            <p className="small-text">Gestione el estado jurídico de los casos, asigne abogados y vincule clientes.</p>
          </div>
          <button className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleOpenModal()}>
            <FaPlus /> Abrir Expediente
          </button>
        </div>

        <div className="cases-filters">
          {['all', 'Evaluación', 'En Proceso', 'En Corte', 'Cerrado'].map(status => (
            <button 
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'Todos los Casos' : status}
            </button>
          ))}
        </div>

        <div className="cases-grid">
          {filteredCases.length === 0 ? (
            <div className="empty-state">No hay casos registrados en esta categoría.</div>
          ) : (
            filteredCases.map(caseItem => {
              const client = clients.find(c => c.id === caseItem.client_id);
              const lawyer = team.find(t => t.id === caseItem.lawyer_id);

              return (
                <div key={caseItem.id} className="case-card">
                  <div className="case-card__header">
                    <span className={`admin-badge ${statusColors[caseItem.status]}`}>{caseItem.status}</span>
                    <div className="case-actions">
                      <button className="icon-btn edit-btn" onClick={() => handleOpenModal(caseItem)}><FaEdit /></button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(caseItem.id, caseItem.title)}><FaTrash /></button>
                    </div>
                  </div>
                  
                  <h4 className="case-title"><FaBriefcase /> {caseItem.title}</h4>
                  
                  <div className="case-parties">
                    <div className="party">
                      <FaUser className="party-icon" />
                      <div>
                        <span className="party-label">Cliente</span>
                        <span className="party-name">{client ? client.name : 'Cliente Desconocido'}</span>
                      </div>
                    </div>
                    <div className="party">
                      <FaUserTie className="party-icon" />
                      <div>
                        <span className="party-label">Abogado Asignado</span>
                        <span className="party-name">{lawyer ? lawyer.name : 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="case-desc">
                    <FaInfoCircle /> {caseItem.description ? (caseItem.description.length > 80 ? caseItem.description.substring(0, 80) + '...' : caseItem.description) : 'Sin descripción.'}
                  </div>
                  
                  <div className="case-footer">
                    Apertura: {new Date(caseItem.created_at || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Actualizar Expediente' : 'Apertura de Expediente'}</h3>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="form-group">
                <label>Título del Caso / Referencia *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Demanda Laboral Familia Pérez" />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Cliente Vinculado *</label>
                  <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                    <option value="">-- Seleccionar Cliente --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Abogado Asignado *</label>
                  <select required value={formData.lawyer_id} onChange={e => setFormData({...formData, lawyer_id: e.target.value})}>
                    <option value="">-- Seleccionar Abogado --</option>
                    {team.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Estado del Proceso</label>
                <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as LegalCase['status']})}>
                  <option value="Evaluación">Evaluación Inicial</option>
                  <option value="En Proceso">En Proceso / Trámites</option>
                  <option value="En Corte">En Corte / Litigio</option>
                  <option value="Cerrado">Cerrado / Resuelto</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descripción / Observaciones</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detalles relevantes del caso..." />
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Aperturar Expediente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCases;
