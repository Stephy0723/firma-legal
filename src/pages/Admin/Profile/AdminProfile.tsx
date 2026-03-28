import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useTheme } from '../../../context/ThemeContext';
import { FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCheckCircle, FaBell, FaShieldAlt } from 'react-icons/fa';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminProfile.scss';

const AdminProfile = () => {
  const { cases, appointments } = useData();
  const { theme, toggleTheme } = useTheme();

  // Mock Admin User Data
  const [adminUser] = useState({
    name: "Lic. Javier Ruiz",
    role: "Socio Fundador",
    email: "jrylinversiones@gmail.com",
    phone: "+1 829 344 7586",
    location: "Sede Principal, SD",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
  });

  const myCases = cases.length;
  const wonCases = cases.filter(c => c.status === 'Cerrado').length;
  const myAppointments = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="admin-profile-page">
      <PageHelp 
        title="Mi Perfil"
        description="Gestiona tu información personal, revisa tu rendimiento individual y ajusta las preferencias de tu cuenta."
        features={[
          "Tarjeta de Identificación: Edita tus datos de contacto públicos.",
          "Estadísticas Personales: Visualiza los casos que has gestionado y resuelto exitosamente.",
          "Ajustes Rápidos: Modifica el tema visual, notificaciones y seguridad de tu cuenta."
        ]}
      />

      <div className="profile-layout-exact">
        {/* LEFT COLUMN: Patient Card Clone for Admin */}
        <div className="profile-card-col">
          <div className="admin-patient-card">
            <div className="card-header-bg">
              <button className="btn-edit-profile"><FaEdit /> Editar</button>
            </div>
            <div className="profile-avatar-wrapper">
              <img src={adminUser.image} alt={adminUser.name} />
              <div className="status-indicator online"></div>
            </div>
            
            <div className="profile-info-dense">
              <h2>{adminUser.name}</h2>
              <span className="role-badge">{adminUser.role}</span>
              
              <div className="contact-grid-profile">
                <div className="c-item">
                  <FaEnvelope className="c-icon" />
                  <div className="c-text">
                    <span>Email</span>
                    <strong>{adminUser.email}</strong>
                  </div>
                </div>
                <div className="c-item">
                  <FaPhone className="c-icon" />
                  <div className="c-text">
                    <span>Teléfono</span>
                    <strong>{adminUser.phone}</strong>
                  </div>
                </div>
                <div className="c-item">
                  <FaMapMarkerAlt className="c-icon" />
                  <div className="c-text">
                    <span>Ubicación</span>
                    <strong>{adminUser.location}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-metrics-mini">
              <div className="m-box">
                <h4>{myCases}</h4>
                <span>Casos Totales</span>
              </div>
              <div className="m-box success">
                <h4>{wonCases}</h4>
                <span>Casos Ganados</span>
              </div>
              <div className="m-box">
                <h4>{myAppointments}</h4>
                <span>Citas Activas</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings and Recent Activity */}
        <div className="settings-activity-col">
          
          <div className="settings-panel">
            <h3>Ajustes de Plataforma</h3>
            <div className="settings-list">
              
              <div className="setting-item">
                <div className="s-info">
                  <div className="icon"><img src={theme === 'dark' ? "https://cdn-icons-png.flaticon.com/512/766/766031.png" : "https://cdn-icons-png.flaticon.com/512/3222/3222675.png"} width="24" style={{filter: theme === 'dark' ? 'invert(1)' : 'none'}} alt="Theme"/></div>
                  <div>
                    <h4>Modo Visual</h4>
                    <p>Cambiar entre Modo Claro y Oscuro para la interfaz.</p>
                  </div>
                </div>
                <button 
                  className={`toggle-switch ${theme === 'dark' ? 'on' : 'off'}`} 
                  onClick={toggleTheme}
                >
                  <div className="handle"></div>
                </button>
              </div>

              <div className="setting-item">
                <div className="s-info">
                  <div className="icon"><FaBell /></div>
                  <div>
                    <h4>Notificaciones por Email</h4>
                    <p>Recibir alertas cuando se asignen nuevos expedientes.</p>
                  </div>
                </div>
                <button className="toggle-switch on"><div className="handle"></div></button>
              </div>

              <div className="setting-item">
                <div className="s-info">
                  <div className="icon"><FaShieldAlt /></div>
                  <div>
                    <h4>Autenticación de Dos Pasos</h4>
                    <p>Capa extra de seguridad para tu inicio de sesión.</p>
                  </div>
                </div>
                <button className="toggle-switch off"><div className="handle"></div></button>
              </div>

            </div>
          </div>

          <div className="recent-activity-panel">
            <h3>Registro de Actividad</h3>
            <div className="activity-timeline">
              <div className="a-item">
                <div className="a-marker success"><FaCheckCircle /></div>
                <div className="a-content">
                  <span className="time">Hoy, 10:30 AM</span>
                  <p>Resolución favorable en el expediente <strong>#EXP-0042</strong></p>
                </div>
              </div>
              <div className="a-item">
                <div className="a-marker"><FaBriefcase /></div>
                <div className="a-content">
                  <span className="time">Ayer, 04:15 PM</span>
                  <p>Asignación estructurada del caso <strong>Guzmán Corporativo</strong></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
