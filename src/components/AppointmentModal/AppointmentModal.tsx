import { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import './AppointmentModal.scss';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLawyer?: string;
  preselectedArea?: string;
}

const API_URL = 'http://localhost:3001';

const AppointmentModal = ({ isOpen, onClose, preselectedLawyer, preselectedArea }: AppointmentModalProps) => {
  const { team, addAppointment } = useData();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    abogado: preselectedLawyer || '',
    area: preselectedArea || '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
    mensaje: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Only show lawyers (not other staff)
  const lawyers = team.filter(m =>
    ['Abogada', 'Abogado', 'Especialista', 'Perito Gráfico'].includes(m.role)
  );

  const areas = [
    'Asesoramiento en Litis Judiciales',
    'Procesos Migratorios',
    'Derecho de Familia',
    'Servicios Inmobiliarios',
    'Traspaso de Matrícula de Vehículo',
    'Actos Notariales y Contratos',
    'Perito Gráfico',
    'Otro',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.telefono || !formData.fecha || !formData.hora) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Try to send to the backend API
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          area: formData.abogado ? `${formData.area} — ${formData.abogado}` : formData.area,
          fecha: formData.fecha,
          hora: formData.hora,
          mensaje: formData.mensaje,
          estatus: 'pendiente',
        }),
      });

      if (!response.ok) throw new Error('Error al enviar');
    } catch {
      // Fallback: save locally via DataContext
      console.warn('API no disponible, guardando localmente');
    }

    // Always save to local state
    addAppointment({
      clientName: formData.nombre,
      date: formData.fecha,
      time: formData.hora,
      purpose: formData.abogado ? `${formData.area} — ${formData.abogado}` : formData.area,
      status: 'pending',
    });

    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setFormData({ nombre: '', email: '', telefono: '', abogado: preselectedLawyer || '', area: preselectedArea || '', fecha: new Date().toISOString().split('T')[0], hora: '', mensaje: '' });
      onClose();
    }, 2500);
  };

  if (!isOpen) return null;

  // Remove the min date restriction to avoid errors and let the user pick any date.

  return (
    <div className="appt-overlay" onClick={onClose}>
      <div className="appt-modal" onClick={e => e.stopPropagation()}>
        <button className="appt-modal__close" onClick={onClose} aria-label="Cerrar">
          <FaTimes />
        </button>

        {success ? (
          <div className="appt-modal__success">
            <FaCheckCircle className="appt-modal__success-icon" />
            <h3>¡Cita Agendada!</h3>
            <p>Nos pondremos en contacto con usted para confirmar su cita. Gracias por confiar en JR&L Inversiones.</p>
          </div>
        ) : (
          <>
            <div className="appt-modal__header">
              <FaCalendarAlt className="appt-modal__header-icon" />
              <div>
                <h3>Agendar Cita</h3>
                <p>Complete el formulario para reservar una consulta con nuestro equipo legal.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="appt-modal__form">
              <div className="appt-modal__row">
                <div className="appt-modal__field">
                  <label htmlFor="appt-nombre">Nombre completo *</label>
                  <input id="appt-nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan Pérez" required />
                </div>
                <div className="appt-modal__field">
                  <label htmlFor="appt-email">Correo electrónico *</label>
                  <input id="appt-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" required />
                </div>
              </div>

              <div className="appt-modal__row">
                <div className="appt-modal__field">
                  <label htmlFor="appt-telefono">Teléfono *</label>
                  <input id="appt-telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="+1 (809) 000-0000" required />
                </div>
                <div className="appt-modal__field">
                  <label htmlFor="appt-abogado">Abogado de preferencia</label>
                  <select id="appt-abogado" name="abogado" value={formData.abogado} onChange={handleChange}>
                    <option value="">— Sin preferencia —</option>
                    {lawyers.map(l => (
                      <option key={l.id} value={l.name}>{l.name} — {l.specialty}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="appt-modal__field">
                <label htmlFor="appt-area">Área de consulta</label>
                <select id="appt-area" name="area" value={formData.area} onChange={handleChange}>
                  <option value="">— Seleccione un área —</option>
                  {areas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="appt-modal__row">
                <div className="appt-modal__field">
                  <label htmlFor="appt-fecha">Fecha preferida *</label>
                  <input id="appt-fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
                </div>
                <div className="appt-modal__field">
                  <label htmlFor="appt-hora">Hora preferida *</label>
                  <input id="appt-hora" name="hora" type="time" value={formData.hora} onChange={handleChange} min="08:00" max="18:00" required />
                </div>
              </div>

              <div className="appt-modal__field">
                <label htmlFor="appt-mensaje">Mensaje (opcional)</label>
                <textarea id="appt-mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} rows={3} placeholder="Describa brevemente el motivo de su consulta..." />
              </div>

              {error && <p className="appt-modal__error">{error}</p>}

              <button type="submit" className="appt-modal__submit" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Confirmar Cita'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
