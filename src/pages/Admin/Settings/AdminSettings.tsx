import { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  FaBell,
  FaCalendarAlt,
  FaCog,
  FaDesktop,
  FaGlobe,
  FaInbox,
  FaMoon,
  FaSave,
  FaSyncAlt,
} from 'react-icons/fa';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import { useTheme } from '../../../context/ThemeContext';
import type { AdminWorkspaceSettings } from '../../../utils/adminWorkspace';
import {
  defaultAdminWorkspaceSettings,
  loadAdminProfileConfig,
  loadAdminWorkspaceSettings,
  saveAdminWorkspaceSettings,
} from '../../../utils/adminWorkspace';
import './AdminSettings.scss';

const AdminSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const profile = loadAdminProfileConfig();
  const [form, setForm] = useState<AdminWorkspaceSettings>(() => loadAdminWorkspaceSettings());
  const [saveMessage, setSaveMessage] = useState('');

  const handleFieldChange =
    (field: keyof AdminWorkspaceSettings) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setSaveMessage('');
    };

  const toggleBooleanField =
    (
      field:
        | 'websiteAppointmentsEnabled'
        | 'walkInAppointmentsEnabled'
        | 'automaticInboxOpening'
        | 'emailNotificationsEnabled'
        | 'desktopNotificationsEnabled',
    ) =>
    () => {
      setForm((current) => ({ ...current, [field]: !current[field] }));
      setSaveMessage('');
    };

  const handleReset = () => {
    setForm(defaultAdminWorkspaceSettings);
    saveAdminWorkspaceSettings(defaultAdminWorkspaceSettings);
    setSaveMessage('Configuracion restablecida a los valores base.');
  };

  const handleSave = async () => {
    let nextForm = { ...form };
    let nextMessage = 'Configuracion guardada correctamente.';

    if (nextForm.desktopNotificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await window.Notification.requestPermission();
      if (permission !== 'granted') {
        nextForm = { ...nextForm, desktopNotificationsEnabled: false };
        setForm(nextForm);
        nextMessage =
          'El navegador no concedio permisos para notificaciones de escritorio. Se mantuvieron desactivadas.';
      }
    }

    saveAdminWorkspaceSettings(nextForm);
    setSaveMessage(nextMessage);
  };

  return (
    <div className="settings-studio services-studio">
      <PageHelp
        title="Configuracion"
        description="Defina como opera el CRM: agenda web, defaults de citas, bandeja y canales del despacho."
        features={[
          'Configuracion real del intake web y los valores por defecto de citas.',
          'Control de apertura automatica del inbox.',
          'Persistencia local para mantener la operacion del despacho.',
        ]}
      />

      <section className="settings-hero">
        <div className="settings-hero__copy">
          <span className="settings-hero__eyebrow">Centro de control</span>
          <h2>Configuracion ejecutiva del CRM y de la agenda legal.</h2>
          <p>
            Defina como se reciben citas, como se confirma al cliente y que comportamiento debe
            tener el panel al operar diariamente.
          </p>
        </div>

        <div className="settings-hero__stats">
          <article className="settings-hero__stat">
            <span>Agenda web</span>
            <strong>{form.websiteAppointmentsEnabled ? 'Activa' : 'Pausada'}</strong>
            <small>impacta el formulario publico</small>
          </article>
          <article className="settings-hero__stat">
            <span>Confirmacion</span>
            <strong>{form.defaultConfirmationChannel}</strong>
            <small>canal por defecto del sistema</small>
          </article>
          <article className="settings-hero__stat">
            <span>Inbox</span>
            <strong>{form.automaticInboxOpening ? 'Auto' : 'Manual'}</strong>
            <small>seleccion inicial en mensajes</small>
          </article>
          <article className="settings-hero__stat settings-hero__stat--primary">
            <span>Responsable</span>
            <strong>{profile.name}</strong>
            <small>{profile.role}</small>
          </article>
        </div>
      </section>

      <div className="settings-grid">
        <section className="settings-card settings-card--form">
          <div className="settings-card__header">
            <div>
              <span>Operativo</span>
              <h3>Datos base del despacho</h3>
            </div>
            {saveMessage ? <small>{saveMessage}</small> : null}
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Nombre del despacho</label>
              <input type="text" value={form.firmName} onChange={handleFieldChange('firmName')} />
            </div>
            <div className="form-group">
              <label>Correo de intake</label>
              <input type="email" value={form.intakeEmail} onChange={handleFieldChange('intakeEmail')} />
            </div>
            <div className="form-group">
              <label>Telefono principal</label>
              <input type="text" value={form.intakePhone} onChange={handleFieldChange('intakePhone')} />
            </div>
            <div className="form-group">
              <label>WhatsApp operativo</label>
              <input type="text" value={form.intakeWhatsApp} onChange={handleFieldChange('intakeWhatsApp')} />
            </div>
            <div className="form-group">
              <label>Horario</label>
              <input type="text" value={form.officeHours} onChange={handleFieldChange('officeHours')} />
            </div>
            <div className="form-group">
              <label>Zona horaria</label>
              <input type="text" value={form.timezone} onChange={handleFieldChange('timezone')} />
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section__head">
              <h4>Agenda e intake</h4>
              <small>impacta la solicitud de citas y el comportamiento del inbox</small>
            </div>

            <div className="settings-toggles">
              <button
                type="button"
                className={`settings-toggle ${form.websiteAppointmentsEnabled ? 'is-active' : ''}`}
                onClick={toggleBooleanField('websiteAppointmentsEnabled')}
              >
                <FaGlobe />
                <div>
                  <strong>Citas desde la pagina web</strong>
                  <span>Abre o cierra el formulario publico de citas</span>
                </div>
              </button>

              <button
                type="button"
                className={`settings-toggle ${form.walkInAppointmentsEnabled ? 'is-active' : ''}`}
                onClick={toggleBooleanField('walkInAppointmentsEnabled')}
              >
                <FaCalendarAlt />
                <div>
                  <strong>Registro presencial</strong>
                  <span>Marca si el despacho acepta intake presencial</span>
                </div>
              </button>

              <button
                type="button"
                className={`settings-toggle ${form.automaticInboxOpening ? 'is-active' : ''}`}
                onClick={toggleBooleanField('automaticInboxOpening')}
              >
                <FaInbox />
                <div>
                  <strong>Abrir ultimo mensaje al entrar</strong>
                  <span>Controla la seleccion automatica en la bandeja</span>
                </div>
              </button>
            </div>

            <div className="settings-form settings-form--compact">
              <div className="form-group">
                <label>Formato por defecto</label>
                <select
                  value={form.defaultAppointmentFormat}
                  onChange={handleFieldChange('defaultAppointmentFormat')}
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="telefonica">Telefonica</option>
                </select>
              </div>
              <div className="form-group">
                <label>Confirmacion por defecto</label>
                <select
                  value={form.defaultConfirmationChannel}
                  onChange={handleFieldChange('defaultConfirmationChannel')}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Correo</option>
                  <option value="call">Llamada</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section__head">
              <h4>Alertas y escritorio</h4>
              <small>preferencias del panel interno</small>
            </div>

            <div className="settings-toggles">
              <button
                type="button"
                className={`settings-toggle ${form.emailNotificationsEnabled ? 'is-active' : ''}`}
                onClick={toggleBooleanField('emailNotificationsEnabled')}
              >
                <FaBell />
                <div>
                  <strong>Alertas por correo</strong>
                  <span>Notificaciones internas para seguimiento del despacho</span>
                </div>
              </button>

              <button
                type="button"
                className={`settings-toggle ${form.desktopNotificationsEnabled ? 'is-active' : ''}`}
                onClick={toggleBooleanField('desktopNotificationsEnabled')}
              >
                <FaDesktop />
                <div>
                  <strong>Notificaciones de escritorio</strong>
                  <span>Solicita permiso al navegador cuando se guarden cambios</span>
                </div>
              </button>

              <button type="button" className="settings-toggle" onClick={toggleTheme}>
                <FaMoon />
                <div>
                  <strong>Tema actual: {theme === 'dark' ? 'oscuro' : 'claro'}</strong>
                  <span>Cambio rapido del modo visual del panel</span>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-card__footer">
            <button type="button" className="admin-btn-outline" onClick={handleReset}>
              <FaSyncAlt />
              Restablecer base
            </button>
            <button type="button" className="admin-btn-primary" onClick={handleSave}>
              <FaSave />
              Guardar configuracion
            </button>
          </div>
        </section>

        <aside className="settings-card settings-card--sidebar">
          <div className="settings-card__header">
            <div>
              <span>Resumen</span>
              <h3>Estado del sistema</h3>
            </div>
            <FaCog />
          </div>

          <div className="settings-summary">
            <article className="settings-summary__item">
              <small>Despacho</small>
              <strong>{form.firmName}</strong>
              <span>{form.intakeEmail}</span>
            </article>
            <article className="settings-summary__item">
              <small>Horario visible</small>
              <strong>{form.officeHours}</strong>
              <span>{form.timezone}</span>
            </article>
            <article className="settings-summary__item">
              <small>Agenda publica</small>
              <strong>{form.websiteAppointmentsEnabled ? 'Disponible' : 'Cerrada'}</strong>
              <span>{form.defaultAppointmentFormat} y confirmacion por {form.defaultConfirmationChannel}</span>
            </article>
            <article className="settings-summary__item">
              <small>Mensajes</small>
              <strong>{form.automaticInboxOpening ? 'Apertura automatica' : 'Seleccion manual'}</strong>
              <span>flujo actual del modulo Mensajes</span>
            </article>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminSettings;
