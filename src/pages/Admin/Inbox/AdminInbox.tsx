import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { FaEnvelope, FaEnvelopeOpen, FaPhone, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './AdminInbox.scss';

const AdminInbox = () => {
  const { messages, markMessageRead } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMsg = messages.find(m => m.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    markMessageRead(id);
  };

  return (
    <div className="admin-inbox">
      <div className="admin-card admin-inbox__list">
        <div className="admin-card__header">
          <h3>Bandeja de Entrada</h3>
        </div>
        <div className="admin-inbox__items">
          {messages.length === 0 ? (
            <p className="admin-inbox__empty">No hay mensajes recibidos.</p>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`inbox-item ${selectedId === msg.id ? 'active' : ''} ${!msg.read ? 'unread' : ''}`}
                onClick={() => handleSelect(msg.id)}
              >
                <div className="inbox-item__icon">
                  {msg.read ? <FaEnvelopeOpen /> : <FaEnvelope />}
                </div>
                <div className="inbox-item__content">
                  <div className="inbox-item__header">
                    <h4>{msg.name}</h4>
                    <span className="inbox-item__date">
                      {new Date(msg.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="inbox-item__preview">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-card admin-inbox__detail">
        {selectedMsg ? (
          <>
            <div className="inbox-detail__header">
              <h3>Detalles del Mensaje</h3>
              <span className="admin-badge admin-badge--neutral">Área: {selectedMsg.area}</span>
            </div>
            
            <div className="inbox-detail__meta">
              <div className="meta-item">
                <FaUser /> <strong>De:</strong> {selectedMsg.name}
              </div>
              <div className="meta-item">
                <FaEnvelope /> <strong>Email:</strong> <a href={`mailto:${selectedMsg.email}`}>{selectedMsg.email}</a>
              </div>
              {selectedMsg.phone && (
                <div className="meta-item">
                  <FaPhone /> <strong>Tel:</strong> <a href={`tel:${selectedMsg.phone}`}>{selectedMsg.phone}</a>
                </div>
              )}
              <div className="meta-item">
                <FaCalendarAlt /> <strong>Fecha:</strong> {new Date(selectedMsg.date).toLocaleString()}
              </div>
            </div>

            <div className="inbox-detail__body">
              <p>{selectedMsg.message}</p>
            </div>

            <div className="inbox-detail__actions">
              <a href={`mailto:${selectedMsg.email}`} className="admin-btn-primary">Responder por Email</a>
              {selectedMsg.phone && (
                <a href={`https://wa.me/${selectedMsg.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="admin-btn-outline">Contactar por WhatsApp</a>
              )}
            </div>
          </>
        ) : (
          <div className="admin-inbox__empty-state">
            <FaEnvelope className="empty-icon" />
            <h3>Seleccione un mensaje</h3>
            <p>Haga clic en un mensaje de la lista para ver los detalles completos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInbox;
