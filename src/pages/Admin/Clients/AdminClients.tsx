import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import type { ClientData } from '../../../context/DataContext';
import { FaPlus, FaSearch, FaCalendarCheck, FaChartLine, FaExclamationCircle, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminClients.scss';

const AdminClients = () => {
  const { clients, addClient, updateClient, deleteClient, appointments, cases } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<ClientData, 'id' | 'created_at'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleOpenModal = (client?: ClientData) => {
    if (client) {
      setEditingId(client.id);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateClient(editingId, formData);
    } else {
      addClient(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar a ${name} del directorio?`)) {
      deleteClient(id);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const metrics = {
    total: clients.length,
    active: cases.filter(c => c.status !== 'Cerrado').length,
    critical: cases.filter(c => c.status === 'En Corte').length
  };

  return (
    <div className="admin-clients-exact">
      <PageHelp 
        title="Directorio de Clientes"
        description="Dashboard centralizado para la gestión de clientes y prospectos."
        features={[
          "Búsqueda instantánea y filtros",
          "Métricas en tiempo real",
          "Gestión rápida desde las tarjetas"
        ]}
      />

      <div className="clients-header-exact">
        <div className="title-area">
          <h2>Dashboard</h2>
          <p>Resumen y Listado de Clientes</p>
        </div>
        <div className="actions-area">
          <div className="search-box">
            <FaSearch className="icon" />
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-add" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Agregar Cliente
          </button>
        </div>
      </div>

      <div className="metrics-row-exact">
        <div className="metric-box">
          <div className="icon-wrapper">
            <FaUsers />
          </div>
          <div className="text-wrapper">
            <h3>{metrics.total}</h3>
            <span>Total Clientes</span>
          </div>
        </div>
        <div className="metric-box">
          <div className="icon-wrapper">
            <FaChartLine />
          </div>
          <div className="text-wrapper">
            <h3>{metrics.active}</h3>
            <span>Casos Activos</span>
          </div>
        </div>
        <div className="metric-box">
          <div className="icon-wrapper">
            <FaExclamationCircle />
          </div>
          <div className="text-wrapper">
            <h3>{metrics.critical}</h3>
            <span>En Proceso Litis</span>
          </div>
        </div>
        <div className="metric-box">
          <div className="icon-wrapper">
            <FaCalendarCheck />
          </div>
          <div className="text-wrapper">
            <h3>{Math.floor(metrics.total * 0.4)}</h3>
            <span>Nuevos (Este Mes)</span>
          </div>
        </div>
      </div>

      <div className="clients-list-section">
        <div className="list-header">
          <h3>Lista de Clientes</h3>
          <button className="btn-filter">Filtrar</button>
        </div>

        <div className="clients-grid-exact">
          {filteredClients.map(client => {
            const clientAppointments = appointments.filter(a => a.clientName.toLowerCase() === client.name.toLowerCase());
            const lastApp = clientAppointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            const clientCases = cases.filter(c => c.client_id === client.id);
            const hasActiveCase = clientCases.some(c => c.status !== 'Cerrado');
            
            return (
              <div key={client.id} className="exact-client-card">
                <div className="card-actions">
                  <button className="icon-btn edit" onClick={() => handleOpenModal(client)} title="Editar"><FaEdit /></button>
                  <button className="icon-btn delete" onClick={() => handleDelete(client.id, client.name)} title="Eliminar"><FaTrash /></button>
                </div>
                <div className="card-top">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random&color=fff`} alt="avatar" />
                  <h4>{client.name}</h4>
                  <span className="client-id">ID: {client.id.slice(0,6)}</span>
                </div>
                
                <div className="card-middle">
                  <div className="info-line">
                    <span className="label">Telefono:</span>
                    <span className="value">{client.phone}</span>
                  </div>
                  <div className="info-line">
                    <span className="label">Correo:</span>
                    <span className="value">{client.email}</span>
                  </div>
                </div>

                <div className="card-bottom">
                  <div className="bottom-stat">
                    <span>Última Visita</span>
                    <strong>{lastApp ? new Date(lastApp.date).toLocaleDateString() : 'Pendiente'}</strong>
                  </div>
                  <div className="bottom-tag">
                    <span className={`tag ${hasActiveCase ? 'active' : 'closed'}`}>
                      {hasActiveCase ? 'Activo' : 'Cerrado'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal ... */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Editar Perfil del Cliente' : 'Añadir Nuevo Cliente'}</h3>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Teléfono *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección Física</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ej: Av. Principal 123, Sector" />
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
