import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import type { ServiceData } from '../../../context/DataContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './AdminServices.scss';

const AVAILABLE_ICONS = [
  { id: 'FaBalanceScale', label: 'Balanza (Judicial)' },
  { id: 'FaPassport', label: 'Pasaporte (Migratorio)' },
  { id: 'FaUsers', label: 'Usuarios (Familia)' },
  { id: 'FaBuilding', label: 'Edificio (Inmobiliario)' },
  { id: 'FaCar', label: 'Auto (Vehículos)' },
  { id: 'FaFileSignature', label: 'Firma (Notarial)' },
  { id: 'FaSearch', label: 'Lupa (Investigación)' },
  { id: 'FaSuitcase', label: 'Maletín (Corporativo)' },
];

const AdminServices = () => {
  const { services, addService, updateService, deleteService } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ServiceData, 'id'>>({
    icon: 'FaBalanceScale',
    title: '',
    description: '',
    fullDescription: '',
    details: [''],
  });

  const handleOpenModal = (service?: ServiceData) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        icon: service.icon,
        title: service.title,
        description: service.description,
        fullDescription: service.fullDescription,
        details: [...service.details],
      });
    } else {
      setEditingId(null);
      setFormData({
        icon: 'FaBalanceScale',
        title: '',
        description: '',
        fullDescription: '',
        details: [''],
      });
    }
    setIsModalOpen(true);
  };

  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...formData.details];
    newDetails[index] = value;
    setFormData({ ...formData, details: newDetails });
  };

  const addDetailField = () => {
    setFormData({ ...formData, details: [...formData.details, ''] });
  };

  const removeDetailField = (index: number) => {
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData({ ...formData, details: newDetails });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      details: formData.details.filter(d => d.trim() !== '')
    };

    if (editingId) {
      updateService(editingId, cleanData);
    } else {
      addService(cleanData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este servicio? Esto afectará la página web pública.')) {
      deleteService(id);
    }
  };

  return (
    <div className="admin-services">
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>Servicios Ofrecidos (Website)</h3>
          <button className="admin-btn-primary flex-btn" onClick={() => handleOpenModal()}>
            <FaPlus /> Añadir Servicio
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Icono</th>
                <th>Título</th>
                <th>Descripción Corta</th>
                <th>Características</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">No hay servicios configurados.</td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id}>
                    <td><span className="admin-badge admin-badge--neutral">{service.icon}</span></td>
                    <td className="font-medium">{service.title}</td>
                    <td className="text-truncate" style={{ maxWidth: '250px' }}>{service.description}</td>
                    <td>{service.details.length} items</td>
                    <td className="actions-cell">
                      <button className="icon-btn edit-btn" onClick={() => handleOpenModal(service)} title="Editar">
                        <FaEdit />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(service.id)} title="Eliminar">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--large">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body form-scrollable">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Título del Servicio</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Icono</label>
                  <select value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})}>
                    {AVAILABLE_ICONS.map(icon => (
                      <option key={icon.id} value={icon.id}>{icon.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Descripción Corta (Tarjeta)</label>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Descripción Completa (Detalle)</label>
                <textarea required rows={3} value={formData.fullDescription} onChange={e => setFormData({...formData, fullDescription: e.target.value})}></textarea>
              </div>

              <div className="form-group details-list">
                <label>Características / Detalles</label>
                {formData.details.map((detail, index) => (
                  <div key={index} className="detail-input-row">
                    <input 
                      type="text" 
                      value={detail} 
                      onChange={e => handleDetailChange(index, e.target.value)} 
                      placeholder="Ej. Representación en audiencias"
                    />
                    {formData.details.length > 1 && (
                      <button type="button" className="btn-remove-detail" onClick={() => removeDetailField(index)}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" className="admin-btn-outline add-detail-btn" onClick={addDetailField}>
                  + Añadir característica
                </button>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
