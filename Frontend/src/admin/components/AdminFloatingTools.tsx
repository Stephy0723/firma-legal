import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaInfoCircle, FaRobot, FaTimes } from 'react-icons/fa';

interface PageHelpInfo {
  title: string;
  description: string;
  steps: string[];
}

const pageHelp: Record<string, PageHelpInfo> = {
  '/admin': {
    title: 'Dashboard',
    description: 'Vista general del despacho con indicadores clave: citas pendientes, consultas sin leer, casos activos y documentos recientes.',
    steps: [
      'Revisa los contadores de resumen para ver el estado actual del despacho.',
      'Haz clic en cualquier tarjeta para ir directamente al módulo correspondiente.',
      'Los gráficos muestran tendencias de actividad reciente.',
    ],
  },
  '/admin/documents': {
    title: 'Documentos',
    description: 'Gestor de archivos legales organizados por carpetas. Sube, clasifica y busca documentos asociados a clientes y abogados.',
    steps: [
      'Crea carpetas con el botón "Nueva carpeta" para organizar tus archivos.',
      'Haz clic en una carpeta para ver sus documentos.',
      'Usa "Subir documento" para agregar archivos, asignando carpeta, abogado y cliente.',
      'Puedes editar o eliminar carpetas y documentos con los iconos de acción.',
    ],
  },
  '/admin/services': {
    title: 'Servicios',
    description: 'Administra las áreas de práctica y servicios legales que ofrece tu despacho. Estos se muestran en el sitio web público.',
    steps: [
      'Haz clic en "Nuevo servicio" para agregar un área de práctica.',
      'Completa el formulario con título, descripción, icono y detalles.',
      'Edita o elimina servicios existentes con los botones de acción en cada tarjeta.',
    ],
  },
  '/admin/team': {
    title: 'Equipo',
    description: 'Gestiona los perfiles del equipo legal: abogados, asistentes y personal del despacho.',
    steps: [
      'Agrega miembros con "Nuevo miembro" completando nombre, cargo, especialidad y foto.',
      'Los miembros aparecen como opciones al asignar abogados en casos y citas.',
      'Edita perfiles existentes para mantener la información actualizada.',
    ],
  },
  '/admin/clients': {
    title: 'Clientes',
    description: 'Base de datos de clientes con información de contacto, casos asociados y notas internas.',
    steps: [
      'Registra un nuevo cliente con "Nuevo cliente".',
      'Haz clic en el ojo (👁) de un cliente para ver su expediente completo en el panel lateral.',
      'Usa la barra de búsqueda para encontrar clientes por nombre, correo o teléfono.',
      'Alterna entre vista de tarjetas y lista con los botones de la barra.',
    ],
  },
  '/admin/cases': {
    title: 'Casos',
    description: 'Control de expedientes legales con estados procesales, asignación de abogados y clientes.',
    steps: [
      'Crea un caso con "Nuevo caso" indicando título, cliente, abogado y estado.',
      'Filtra por estado: Evaluación, En Proceso, En Corte o Cerrado.',
      'Usa las vistas de tarjeta o tabla según tu preferencia.',
      'El estado se puede cambiar directamente desde la tarjeta del caso.',
    ],
  },
  '/admin/appointments': {
    title: 'Citas',
    description: 'Agenda de citas con clientes. Controla fechas, horarios, estados y modalidad de cada cita.',
    steps: [
      'Programa una cita con "Nueva cita" indicando cliente, fecha, hora y motivo.',
      'Haz clic en el ojo (👁) para ver el detalle completo en el panel lateral.',
      'Cambia el estado rápidamente desde el panel: Pendiente, Confirmada o Cancelada.',
      'Contacta al cliente directamente por correo o WhatsApp desde el panel de detalle.',
    ],
  },
  '/admin/inbox': {
    title: 'Consultas',
    description: 'Consultas y mensajes recibidos desde el formulario de contacto del sitio web.',
    steps: [
      'Las nuevas consultas aparecen con estado "Sin leer" resaltado.',
      'Haz clic en el ojo (👁) para ver el detalle completo del mensaje.',
      'Responde por correo electrónico o escribe por WhatsApp desde el panel lateral.',
      'Marca todos como leídos con el botón en la cabecera.',
      'Filtra por estado: Todos, Sin leer o Leídos.',
    ],
  },
  '/admin/expedientes': {
    title: 'Expedientes',
    description: 'Vista detallada de cada expediente legal con toda la información recopilada: cliente, abogado, tribunal, testigos, evidencia y documentos.',
    steps: [
      'Busca expedientes por nombre, número, cédula, cliente o abogado.',
      'Haz clic en un expediente para ver su ficha completa.',
      'En la ficha verás: datos del caso, tribunal (si aplica), testigos, evidencia, abogado asignado y datos del cliente.',
      'Los documentos del cliente y la evidencia tienen enlaces para descargar o ver.',
    ],
  },
  '/admin/notifications': {
    title: 'Notificaciones',
    description: 'Centro de actividad y alertas del sistema: citas programadas, nuevos mensajes y cambios recientes.',
    steps: [
      'Revisa las alertas ordenadas por fecha más reciente.',
      'Las notificaciones no leídas aparecen resaltadas.',
      'Haz clic en una notificación para ir al módulo relacionado.',
    ],
  },
  '/admin/settings': {
    title: 'Configuración',
    description: 'Ajustes generales del panel administrativo: tema visual, datos del despacho y preferencias.',
    steps: [
      'Cambia entre tema claro y oscuro.',
      'Actualiza la información general del despacho.',
      'Configura preferencias de notificaciones y correo.',
    ],
  },
};

const AdminFloatingTools = () => {
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const currentHelp = useMemo(() => pageHelp[location.pathname] || {
    title: 'Módulo',
    description: 'Módulo administrativo del panel.',
    steps: [],
  }, [location.pathname]);

  const handleAsk = async () => {
    const question = aiQuestion.trim();
    if (!question) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/legal-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: [] }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setAiAnswer(data.error || 'No se pudo consultar al asistente.');
      } else {
        setAiAnswer(data.answer || 'Sin respuesta del asistente.');
      }
    } catch {
      setAiAnswer('No hay conexión con el backend para IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="admin-floating-tools" role="group" aria-label="Herramientas flotantes">
        <button type="button" className="admin-floating-tools__btn" onClick={() => { setAiOpen((v) => !v); setHelpOpen(false); }} title="Asistente IA">
          <FaRobot />
        </button>
        <button type="button" className="admin-floating-tools__btn" onClick={() => { setHelpOpen((v) => !v); setAiOpen(false); }} title="Ayuda de esta página">
          <FaInfoCircle />
        </button>
      </div>

      {/* ── Page Help Panel ── */}
      {helpOpen && (
        <div className="admin-help-panel" role="dialog" aria-label="Ayuda de página">
          <div className="admin-help-panel__header">
            <h3><FaInfoCircle /> {currentHelp.title}</h3>
            <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => setHelpOpen(false)}><FaTimes /></button>
          </div>
          <p className="admin-help-panel__desc">{currentHelp.description}</p>
          {currentHelp.steps.length > 0 && (
            <div className="admin-help-panel__steps">
              <small>Cómo usarlo</small>
              <ol>
                {currentHelp.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ── AI Assistant Panel ── */}
      {aiOpen && (
        <div className="admin-ai-panel" role="dialog" aria-label="Asistente IA">
          <div className="admin-ai-panel__header">
            <h3><FaRobot /> Alaya</h3>
            <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={() => setAiOpen(false)}><FaTimes /></button>
          </div>
          <p className="admin-ai-panel__intro">
            Hola, soy <strong>Alaya</strong>, tu asistente legal. <strong>Únicamente</strong> puedo ayudarte en temas legales: orientación jurídica, contratos, procesos, derechos y asesorías generales.
          </p>
          <textarea
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Escribe tu pregunta legal..."
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
          />
          <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={handleAsk} disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? 'Consultando...' : 'Preguntar'}
          </button>
          {aiAnswer && (
            <div className="admin-ai-panel__answer">
              <p>{aiAnswer}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminFloatingTools;
