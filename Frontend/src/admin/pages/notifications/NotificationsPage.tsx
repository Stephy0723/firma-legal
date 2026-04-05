import { FaBell } from 'react-icons/fa';

const NotificationsPage = () => {
  return (
    <div className="a-page">
      <div className="a-page-header">
        <div className="a-page-header__title">
          <h2>Notificaciones</h2>
          <p>Centro de alertas y actividad del sistema</p>
        </div>
      </div>

      <div className="a-empty" style={{ background: 'var(--sb)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', padding: '4rem' }}>
        <FaBell />
        <h3>Sin notificaciones</h3>
        <p>Las notificaciones del sistema aparecerán aquí cuando haya actividad relevante.</p>
      </div>
    </div>
  );
};

export default NotificationsPage;
