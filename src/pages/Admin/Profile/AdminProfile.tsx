import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBell,
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaCog,
  FaEnvelope,
  FaFolderOpen,
  FaHome,
  FaInbox,
  FaMapMarkerAlt,
  FaMoon,
  FaPhoneAlt,
  FaSave,
  FaShieldAlt,
  FaSyncAlt,
  FaUserTie,
  FaWhatsapp,
} from 'react-icons/fa';
import { useData } from '../../../context/DataContext';
import { useTheme } from '../../../context/ThemeContext';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import type {
  AdminProfileConfig,
  AdminWorkspaceSettings,
} from '../../../utils/adminWorkspace';
import {
  defaultAdminProfileConfig,
  loadAdminProfileConfig,
  loadAdminWorkspaceSettings,
  saveAdminProfileConfig,
  saveAdminWorkspaceSettings,
} from '../../../utils/adminWorkspace';
import './AdminProfile.scss';

type ActivityItem = {
  id: string;
  date: string;
  title: string;
  description: string;
};

const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const normalizeValue = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const isClosedCase = (status: string) => normalizeValue(status).includes('cerrado');

const AdminProfile = () => {
  const navigate = useNavigate();
  const { cases, appointments, messages, documents } = useData();
  const { theme, toggleTheme } = useTheme();
  const [profileForm, setProfileForm] = useState<AdminProfileConfig>(() => loadAdminProfileConfig());
  const [workspaceSettings, setWorkspaceSettings] = useState<AdminWorkspaceSettings>(() =>
    loadAdminWorkspaceSettings(),
  );
  const [saveMessage, setSaveMessage] = useState('');

  const metrics = useMemo(
    () => ({
      totalCases: cases.length,
      closedCases: cases.filter((caseItem) => isClosedCase(caseItem.status)).length,
      pendingAppointments: appointments.filter((appointment) => appointment.status === 'pending')
        .length,
      unreadMessages: messages.filter((message) => !message.read).length,
    }),
    [appointments, cases, messages],
  );

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [
      ...messages.map((message) => ({
        id: `message-${message.id}`,
        date: message.date,
        title: `Mensaje de ${message.name}`,
        description: message.area ? `Consulta recibida en ${message.area}.` : 'Consulta general desde el sitio web.',
      })),
      ...appointments.map((appointment) => ({
        id: `appointment-${appointment.id}`,
        date: appointment.updatedAt || appointment.createdAt || `${appointment.date}T${appointment.time || '00:00'}`,
        title: `Cita para ${appointment.clientName}`,
        description: `${appointment.purpose} con estado ${appointment.status}.`,
      })),
      ...cases.map((caseItem) => ({
        id: `case-${caseItem.id}`,
        date: caseItem.updatedAt || caseItem.created_at || new Date().toISOString(),
        title: `Expediente ${caseItem.title}`,
        description: `Movimiento registrado en estado ${caseItem.status}.`,
      })),
      ...documents.map((document) => ({
        id: `document-${document.id}`,
        date: document.updatedAt || document.uploadDate,
        title: `Documento ${document.title}`,
        description: document.note || 'Actualizacion documental registrada.',
      })),
    ];

    return items
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      .slice(0, 6);
  }, [appointments, cases, documents, messages]);

  const quickLinks = [
    {
      label: 'Dashboard',
      meta: 'panel principal',
      route: '/admin',
      icon: FaHome,
    },
    {
      label: 'Mensajes',
      meta: `${metrics.unreadMessages} nuevos`,
      route: '/admin/inbox',
      icon: FaInbox,
    },
    {
      label: 'Citas',
      meta: `${metrics.pendingAppointments} pendientes`,
      route: '/admin/appointments',
      icon: FaCalendarAlt,
    },
    {
      label: 'Expedientes',
      meta: `${metrics.totalCases} casos`,
      route: '/admin/cases',
      icon: FaBriefcase,
    },
    {
      label: 'Documentos',
      meta: `${documents.length} archivos`,
      route: '/admin/documents',
      icon: FaFolderOpen,
    },
    {
      label: 'Configuracion',
      meta: 'ajustes del sistema',
      route: '/admin/settings',
      icon: FaCog,
    },
  ];

  const handleFieldChange =
    (field: keyof AdminProfileConfig) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfileForm((current) => ({ ...current, [field]: event.target.value }));
      setSaveMessage('');
    };

  const handleSaveProfile = () => {
    saveAdminProfileConfig(profileForm);
    setSaveMessage('Perfil guardado correctamente.');
  };

  const handleResetProfile = () => {
    setProfileForm(defaultAdminProfileConfig);
    saveAdminProfileConfig(defaultAdminProfileConfig);
    setSaveMessage('Perfil restablecido al valor base.');
  };

  const handleSettingToggle = (
    field:
      | 'emailNotificationsEnabled'
      | 'desktopNotificationsEnabled'
      | 'automaticInboxOpening',
  ) => {
    const nextSettings = { ...workspaceSettings, [field]: !workspaceSettings[field] };
    setWorkspaceSettings(nextSettings);
    saveAdminWorkspaceSettings(nextSettings);
    setSaveMessage('Preferencias rapidas actualizadas.');
  };

  return (
    <div className="profile-studio services-studio">
      <PageHelp
        title="Mi Perfil"
        description="Gestione su identidad ejecutiva, firma institucional y preferencias rapidas del CRM."
        features={[
          'Edicion real del perfil con persistencia local.',
          'Preferencias rapidas conectadas a configuracion del sistema.',
          'Actividad reciente del despacho desde una sola ficha.',
        ]}
      />

      <section className="profile-header">
        <article className="profile-identity">
          <div className="profile-identity__top">
            <div className="profile-identity__media">
              <img src={profileForm.image} alt={profileForm.name} className="profile-identity__avatar" />
              <div className="profile-identity__copy">
                <span className="profile-identity__eyebrow">Perfil ejecutivo</span>
                <h2>{profileForm.name}</h2>
                <strong>{profileForm.role}</strong>
                <p>{profileForm.specialty}</p>
              </div>
            </div>

            <div className="profile-identity__actions">
              <a href={`mailto:${profileForm.email}`} className="admin-btn-outline">
                <FaEnvelope />
                Correo
              </a>
              <a
                href={`https://wa.me/${profileForm.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="admin-btn-primary"
              >
                <FaWhatsapp />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="profile-identity__details">
            <article className="profile-identity__detail">
              <FaEnvelope />
              <div>
                <span>Correo</span>
                <strong>{profileForm.email}</strong>
              </div>
            </article>
            <article className="profile-identity__detail">
              <FaPhoneAlt />
              <div>
                <span>Telefono</span>
                <strong>{profileForm.phone}</strong>
              </div>
            </article>
            <article className="profile-identity__detail">
              <FaMapMarkerAlt />
              <div>
                <span>Ubicacion</span>
                <strong>{profileForm.location}</strong>
              </div>
            </article>
            <article className="profile-identity__detail">
              <FaShieldAlt />
              <div>
                <span>Firma</span>
                <strong>{profileForm.signature}</strong>
              </div>
            </article>
          </div>

          <div className="profile-identity__bio">
            <span>Resumen</span>
            <p>{profileForm.bio}</p>
          </div>
        </article>

        <aside className="profile-overview">
          <div className="profile-metrics">
            <article className="profile-metric">
              <span>Expedientes</span>
              <strong>{metrics.totalCases}</strong>
              <small>en plataforma</small>
            </article>
            <article className="profile-metric">
              <span>Cerrados</span>
              <strong>{metrics.closedCases}</strong>
              <small>resueltos</small>
            </article>
            <article className="profile-metric">
              <span>Citas</span>
              <strong>{metrics.pendingAppointments}</strong>
              <small>pendientes</small>
            </article>
            <article className="profile-metric">
              <span>Inbox</span>
              <strong>{metrics.unreadMessages}</strong>
              <small>sin revisar</small>
            </article>
          </div>

          <article className="profile-overview__panel">
            <span>Operacion</span>
            <div className="profile-overview__rows">
              <div>
                <small>Tema</small>
                <strong>{theme === 'dark' ? 'Oscuro' : 'Claro'}</strong>
              </div>
              <div>
                <small>Inbox</small>
                <strong>{workspaceSettings.automaticInboxOpening ? 'Automatico' : 'Manual'}</strong>
              </div>
              <div>
                <small>Correo</small>
                <strong>{workspaceSettings.emailNotificationsEnabled ? 'Activo' : 'Pausado'}</strong>
              </div>
              <div>
                <small>Escritorio</small>
                <strong>{workspaceSettings.desktopNotificationsEnabled ? 'Activo' : 'Pausado'}</strong>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <div className="profile-grid">
        <section className="profile-card profile-card--editor">
          <div className="profile-card__header">
            <div>
              <span>Identidad</span>
              <h3>Ficha del administrador</h3>
            </div>
            {saveMessage ? <small>{saveMessage}</small> : null}
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" value={profileForm.name} onChange={handleFieldChange('name')} />
            </div>
            <div className="form-group">
              <label>Cargo</label>
              <input type="text" value={profileForm.role} onChange={handleFieldChange('role')} />
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input type="email" value={profileForm.email} onChange={handleFieldChange('email')} />
            </div>
            <div className="form-group">
              <label>Telefono</label>
              <input type="text" value={profileForm.phone} onChange={handleFieldChange('phone')} />
            </div>
            <div className="form-group">
              <label>Ubicacion</label>
              <input type="text" value={profileForm.location} onChange={handleFieldChange('location')} />
            </div>
            <div className="form-group">
              <label>Especialidad</label>
              <input
                type="text"
                value={profileForm.specialty}
                onChange={handleFieldChange('specialty')}
              />
            </div>
            <div className="form-group form-group--full">
              <label>Foto de perfil</label>
              <input type="url" value={profileForm.image} onChange={handleFieldChange('image')} />
            </div>
            <div className="form-group form-group--full">
              <label>Biografia ejecutiva</label>
              <textarea rows={5} value={profileForm.bio} onChange={handleFieldChange('bio')} />
            </div>
            <div className="form-group form-group--full">
              <label>Firma institucional</label>
              <input
                type="text"
                value={profileForm.signature}
                onChange={handleFieldChange('signature')}
              />
            </div>
          </div>

          <div className="profile-card__footer">
            <button type="button" className="admin-btn-outline" onClick={handleResetProfile}>
              <FaSyncAlt />
              Restablecer
            </button>
            <button type="button" className="admin-btn-primary" onClick={handleSaveProfile}>
              <FaSave />
              Guardar perfil
            </button>
          </div>
        </section>

        <section className="profile-card profile-card--preferences">
          <div className="profile-card__header">
            <div>
              <span>Preferencias</span>
              <h3>Ajustes rapidos</h3>
            </div>
          </div>

          <div className="profile-preferences">
            <button type="button" className="profile-preference" onClick={toggleTheme}>
              <div>
                <strong>Tema visual</strong>
                <span>{theme === 'dark' ? 'Oscuro activo' : 'Claro activo'}</span>
              </div>
              <b>
                <FaMoon />
              </b>
            </button>

            <button
              type="button"
              className={`profile-preference ${workspaceSettings.emailNotificationsEnabled ? 'is-active' : ''}`}
              onClick={() => handleSettingToggle('emailNotificationsEnabled')}
            >
              <div>
                <strong>Alertas por correo</strong>
                <span>seguimiento interno</span>
              </div>
              <b>
                <FaBell />
              </b>
            </button>

            <button
              type="button"
              className={`profile-preference ${workspaceSettings.desktopNotificationsEnabled ? 'is-active' : ''}`}
              onClick={() => handleSettingToggle('desktopNotificationsEnabled')}
            >
              <div>
                <strong>Notificaciones de escritorio</strong>
                <span>alertas del navegador</span>
              </div>
              <b>
                <FaCheckCircle />
              </b>
            </button>

            <button
              type="button"
              className={`profile-preference ${workspaceSettings.automaticInboxOpening ? 'is-active' : ''}`}
              onClick={() => handleSettingToggle('automaticInboxOpening')}
            >
              <div>
                <strong>Apertura automatica del inbox</strong>
                <span>seleccion inicial en mensajes</span>
              </div>
              <b>
                <FaUserTie />
              </b>
            </button>
          </div>

          <div className="profile-contact-actions">
            <a href={`mailto:${profileForm.email}`} className="admin-btn-outline">
              <FaEnvelope />
              Escribir correo
            </a>
            <a href={`tel:${profileForm.phone}`} className="admin-btn-outline">
              <FaPhoneAlt />
              Llamar
            </a>
            <a
              href={`https://wa.me/${profileForm.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-outline"
            >
              <FaWhatsapp />
              WhatsApp
            </a>
          </div>

          <div className="profile-shortcuts">
            <div className="profile-shortcuts__head">
              <h4>Links utiles</h4>
            </div>
            <div className="profile-shortcuts__grid">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  className="profile-shortcut"
                  onClick={() => navigate(link.route)}
                >
                  <link.icon />
                  <div>
                    <strong>{link.label}</strong>
                    <span>{link.meta}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-card profile-card--activity">
          <div className="profile-card__header">
            <div>
              <span>Movimiento</span>
              <h3>Actividad reciente</h3>
            </div>
            <FaShieldAlt />
          </div>

          <div className="profile-activity">
            {recentActivity.map((item) => (
              <article key={item.id} className="profile-activity__item">
                <div className="profile-activity__marker" />
                <div className="profile-activity__copy">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <small>{formatLongDate(item.date)}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminProfile;
