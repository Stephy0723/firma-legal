import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import type { Appointment } from '../../../context/DataContext';
import { FaAngleLeft, FaEllipsisH, FaFileAlt, FaAngleRight } from 'react-icons/fa';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminAppointments.scss';

const AdminAppointments = () => {
  const { appointments, addAppointment, updateAppointment, team } = useData();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    appointments.length > 0 ? appointments[0].id : null
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    date: '',
    time: '',
    purpose: '',
    status: 'pending' as Appointment['status'],
    lawyerId: '',
    notes: '',
  });

  const selectedApp = appointments.find(a => a.id === selectedAppId);
  const selectedLawyer = team.find(t => t.id === selectedApp?.lawyerId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment(formData);
    setIsModalOpen(false);
    setFormData({ clientName: '', date: '', time: '', purpose: '', status: 'pending', lawyerId: '', notes: '' });
  };

  const today = new Date().getDate();

  return (
    <div className="admin-appointments-panel">
      <PageHelp 
        title="Gestor de Citas y Consultas"
        description="Panel estilo clínico para gestionar y documentar todas las consultas legales."
        features={[
          "Ficha Interactiva: Selecciona una cita a la derecha para ver todos los detalles del cliente a la izquierda.",
          "Asignación de Abogados: Vincula un abogado específico a cada consulta.",
          "Notas de Consulta: Guarda apuntes importantes sobre lo discutido.",
          "Control de Estado: Confirma o rechaza citas rápidamente."
        ]}
      />

      <div className="appointments-medical-exact">
        {/* LEFT PANE: Ficha Médica/Legal */}
        <div className="patient-medical-pane">
          {selectedApp ? (
            <>
              <div className="medical-header">
                <button className="btn-back" onClick={() => setSelectedAppId(null)}><FaAngleLeft /> Volver</button>
                <div className="patient-profile">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedApp.clientName)}&background=random&color=fff`} alt="Avatar" className="avatar"/>
                  <div className="info">
                    <h2>{selectedApp.clientName}</h2>
                    <div className="tags">
                      <span className="tag-status">{selectedApp.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}</span>
                      <span className="tag-disease">{selectedApp.purpose}</span>
                    </div>
                  </div>
                  <button className="btn-options"><FaEllipsisH/></button>
                </div>
                
                <div className="patient-stats">
                  <div className="stat">
                    <span>Próxima Cita</span>
                    <strong>{new Date(selectedApp.date).toLocaleDateString()} a las {selectedApp.time}</strong>
                  </div>
                  <div className="stat">
                    <span>Abogado</span>
                    <strong>{selectedLawyer ? selectedLawyer.name : 'No Asignado'}</strong>
                  </div>
                </div>
              </div>

              <div className="medical-history">
                <div className="history-header">
                  <h3>Historial y Notas de Consulta</h3>
                  <div className="actions">
                    <button className="btn-icon"><FaFileAlt /></button>
                  </div>
                </div>
                
                <div className="timeline-container">
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="time">{selectedApp.time}</div>
                      <div className="details">
                        <h4>Consulta Actual</h4>
                        <p>{selectedApp.purpose}</p>
                        <textarea 
                          className="medical-notes"
                          placeholder="Escriba las notas resolutivas aquí..."
                          value={selectedApp.notes || ''}
                          onChange={(e) => updateAppointment(selectedApp.id, { notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Mock past history */}
                  <div className="timeline-item past">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="time">Hace 1 mes</div>
                      <div className="details">
                        <h4>Apertura de Expediente</h4>
                        <p>Evaluación de viabilidad y recolección de documentos básicos.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-medical-pane">
              <h3>Seleccione un paciente de la agenda</h3>
              <p>Haga clic en una cita futura para ver su historial y agregar prescripciones.</p>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Calendar & Actions */}
        <div className="schedule-medical-pane">
          <div className="mini-calendar-exact">
            <div className="cal-header">
              <button><FaAngleLeft/></button>
              <h4>Marzo 2026</h4>
              <button><FaAngleRight/></button>
            </div>
            <div className="cal-days-header">
              <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sa</span><span>Do</span>
            </div>
            <div className="cal-grid">
              {Array.from({length: 31}, (_,i) => i+1).map(d => (
                <div key={d} className={`cal-day ${d === today ? 'active' : ''} ${[5,12,19].includes(d) ? 'has-event' : ''}`}>
                  {d}
                </div>
              ))}
            </div>
          </div>

          <div className="schedule-actions">
            <button className="btn-write-prescription" onClick={() => setIsModalOpen(true)}>
              + Programar Nueva Cita
            </button>
          </div>

          <div className="doctors-list">
            <h4>Agenda de Abogados</h4>
            <div className="docs-scroll">
              {team.map(t => (
                <div key={t.id} className="doctor-item">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random&color=fff`} alt={t.name} />
                  <div className="doc-info">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="agenda-list-exact">
             <h4>Próximas Citas Hoy</h4>
             {appointments.filter(a => a.id !== selectedAppId).slice(0,3).map(app => (
               <div key={app.id} className="agenda-item" onClick={() => setSelectedAppId(app.id)}>
                 <span className="time">{app.time}</span>
                 <span className="name">{app.clientName}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Modal for new appointment */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>Programar Nueva Cita</h3>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="admin-modal__body">
              <div className="form-group">
                <label>Nombre del Cliente o Prospecto *</label>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="Ej. Juan Pérez" autoFocus />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Hora *</label>
                  <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Propósito de la Cita *</label>
                <input required type="text" placeholder="Ej. Consulta Familiar, Revisión Migratoria" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Abogado Asignado (Opcional)</label>
                <select value={formData.lawyerId} onChange={e => setFormData({...formData, lawyerId: e.target.value})}>
                  <option value="">Sin Asignar (General)</option>
                  {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">Registrar Cita</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
