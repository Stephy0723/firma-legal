import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import { loadAdminWorkspaceSettings } from '../../utils/adminWorkspace';
import './AppointmentModal.scss';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLawyer?: string;
  preselectedArea?: string;
}

const createInitialState = (
  lawyerId = '',
  area = '',
  settings = loadAdminWorkspaceSettings(),
) => ({
  nombre: '',
  email: '',
  telefono: '',
  abogado: lawyerId,
  area,
  fecha: new Date().toISOString().split('T')[0],
  hora: '',
  modalidad: settings.defaultAppointmentFormat,
  confirmacion: settings.defaultConfirmationChannel,
  mensaje: '',
});

const AppointmentModal = ({
  isOpen,
  onClose,
  preselectedLawyer,
  preselectedArea,
}: AppointmentModalProps) => {
  const { team, addAppointment } = useData();
  const lawyers = useMemo(
    () => team.filter((member) => ['Abogada', 'Abogado', 'Especialista', 'Perito Gráfico'].includes(member.role)),
    [team],
  );

  const resolveLawyerId = () => {
    if (!preselectedLawyer) return '';
    return lawyers.find((lawyer) => lawyer.id === preselectedLawyer || lawyer.name === preselectedLawyer)?.id || '';
  };

  const [workspaceSettings, setWorkspaceSettings] = useState(() => loadAdminWorkspaceSettings());
  const [formData, setFormData] = useState(() =>
    createInitialState(resolveLawyerId(), preselectedArea || '', workspaceSettings),
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const latestSettings = loadAdminWorkspaceSettings();
    setWorkspaceSettings(latestSettings);
    setFormData(createInitialState(resolveLawyerId(), preselectedArea || '', latestSettings));
    setSuccess(false);
    setError('');
  }, [isOpen, preselectedArea, preselectedLawyer, lawyers]);

  const areas = [
    'Asesoramiento en litis judiciales',
    'Procesos migratorios',
    'Derecho de familia',
    'Servicios inmobiliarios',
    'Traspaso de matricula de vehiculo',
    'Actos notariales y contratos',
    'Perito grafico',
    'Otro',
  ];

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!workspaceSettings.websiteAppointmentsEnabled) {
      setError('Las citas desde la pagina web estan deshabilitadas temporalmente.');
      return;
    }

    if (!formData.nombre || !formData.email || !formData.telefono || !formData.fecha || !formData.hora || !formData.area) {
      setError('Por favor complete los campos obligatorios.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      clientName: formData.nombre,
      email: formData.email,
      phone: formData.telefono,
      date: formData.fecha,
      time: formData.hora,
      purpose: formData.area,
      status: 'pending' as const,
      lawyerId: formData.abogado,
      notes: formData.mensaje,
      source: 'website' as const,
      format: formData.modalidad as 'presencial' | 'virtual' | 'telefonica',
      confirmationPreference: formData.confirmacion as 'whatsapp' | 'email' | 'call',
      createdAt: new Date().toISOString(),
    };

    await addAppointment(payload);

    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setFormData(createInitialState(resolveLawyerId(), preselectedArea || ''));
      onClose();
    }, 2500);
  };

  if (!isOpen) return null;

  const intakeEmailHref = workspaceSettings.intakeEmail
    ? `mailto:${workspaceSettings.intakeEmail}?subject=${encodeURIComponent('Solicitud de cita directa')}`
    : '';
  const intakeWhatsAppHref = workspaceSettings.intakeWhatsApp
    ? `https://wa.me/${workspaceSettings.intakeWhatsApp.replace(/\D/g, '')}`
    : '';

  return (
    <div className="appt-overlay" onClick={onClose}>
      <div className="appt-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="appt-modal__close" onClick={onClose} aria-label="Cerrar">
          <FaTimes />
        </button>

        {!workspaceSettings.websiteAppointmentsEnabled ? (
          <div className="appt-modal__disabled">
            <FaCalendarAlt className="appt-modal__disabled-icon" />
            <h3>Agenda web temporalmente cerrada</h3>
            <p>
              El despacho desactivo momentaneamente las solicitudes automaticas. Puede coordinar
              directamente por correo o WhatsApp durante el horario de oficina.
            </p>
            <div className="appt-modal__disabled-meta">
              <span>{workspaceSettings.officeHours}</span>
              <strong>{workspaceSettings.intakeEmail || 'Sin correo configurado'}</strong>
            </div>
            <div className="appt-modal__disabled-actions">
              {workspaceSettings.intakeEmail ? (
                <a href={intakeEmailHref} className="appt-modal__submit">
                  Escribir por correo
                </a>
              ) : null}
              {workspaceSettings.intakeWhatsApp ? (
                <a
                  href={intakeWhatsAppHref}
                  className="appt-modal__secondary-btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        ) : success ? (
          <div className="appt-modal__success">
            <FaCheckCircle className="appt-modal__success-icon" />
            <h3>Cita agendada</h3>
            <p>Recibimos su solicitud y la confirmaremos por {formData.confirmacion === 'call' ? 'llamada' : formData.confirmacion === 'email' ? 'correo' : 'WhatsApp'}.</p>
          </div>
        ) : (
          <>
            <div className="appt-modal__header">
              <FaCalendarAlt className="appt-modal__header-icon" />
              <div>
                <h3>Agendar cita</h3>
                <p>Reserve una consulta y elija como desea que confirmemos su cita.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="appt-modal__form">
              <div className="appt-modal__row">
                <div className="appt-modal__field">
                  <label htmlFor="appt-nombre">Nombre completo *</label>
                  <input id="appt-nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan Perez" required />
                </div>
                <div className="appt-modal__field">
                  <label htmlFor="appt-email">Correo electronico *</label>
                  <input id="appt-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" required />
                </div>
              </div>

              <div className="appt-modal__row">
                <div className="appt-modal__field">
                  <label htmlFor="appt-telefono">Telefono *</label>
                  <input id="appt-telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="+1 (809) 000-0000" required />
                </div>
                <div className="appt-modal__field">
                  <label htmlFor="appt-abogado">Abogado de preferencia</label>
                  <select id="appt-abogado" name="abogado" value={formData.abogado} onChange={handleChange}>
                    <option value="">Sin preferencia</option>
                    {lawyers.map((lawyer) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.name} - {lawyer.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="appt-modal__field">
                <label htmlFor="appt-area">Area de consulta *</label>
                <select id="appt-area" name="area" value={formData.area} onChange={handleChange} required>
                  <option value="">Seleccione un area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
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

              <div className="appt-modal__row">
                <div className="appt-modal__field">
                  <label htmlFor="appt-modalidad">Tipo de cita</label>
                  <select id="appt-modalidad" name="modalidad" value={formData.modalidad} onChange={handleChange}>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="telefonica">Telefonica</option>
                  </select>
                </div>
                <div className="appt-modal__field">
                  <label htmlFor="appt-confirmacion">Confirmacion preferida</label>
                  <select id="appt-confirmacion" name="confirmacion" value={formData.confirmacion} onChange={handleChange}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Correo</option>
                    <option value="call">Llamada</option>
                  </select>
                </div>
              </div>

              <div className="appt-modal__field">
                <label htmlFor="appt-mensaje">Mensaje</label>
                <textarea id="appt-mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} rows={3} placeholder="Describa brevemente el motivo de su consulta..." />
              </div>

              {error ? <p className="appt-modal__error">{error}</p> : null}

              <button type="submit" className="appt-modal__submit" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Solicitar cita'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
