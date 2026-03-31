import { useEffect, useMemo, useState } from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaEnvelopeOpen,
  FaFilter,
  FaInbox,
  FaPhoneAlt,
  FaReply,
  FaSearch,
  FaWhatsapp,
} from 'react-icons/fa';
import { useData } from '../../../context/DataContext';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import { loadAdminWorkspaceSettings } from '../../../utils/adminWorkspace';
import './AdminInbox.scss';

const normalizeValue = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const buildWhatsAppPhone = (phone?: string) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `1${digits}`;
  return digits;
};

const AdminInbox = () => {
  const { messages, markMessageRead } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArea, setActiveArea] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const automaticInboxOpening = useMemo(
    () => loadAdminWorkspaceSettings().automaticInboxOpening,
    [],
  );

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
      ),
    [messages],
  );

  const areaOptions = useMemo(() => {
    const uniqueAreas = Array.from(
      new Set(sortedMessages.map((message) => message.area).filter(Boolean)),
    );
    return uniqueAreas.sort((left, right) => left.localeCompare(right));
  }, [sortedMessages]);

  const filteredMessages = useMemo(() => {
    const query = normalizeValue(searchQuery.trim());

    return sortedMessages.filter((message) => {
      const matchesQuery =
        !query ||
        normalizeValue(
          [
            message.name,
            message.email,
            message.phone || '',
            message.area || '',
            message.message,
          ].join(' '),
        ).includes(query);

      const matchesArea = activeArea === 'all' ? true : message.area === activeArea;
      const matchesReadState = unreadOnly ? !message.read : true;
      return matchesQuery && matchesArea && matchesReadState;
    });
  }, [activeArea, searchQuery, sortedMessages, unreadOnly]);

  useEffect(() => {
    if (!filteredMessages.length) {
      setSelectedId(null);
      return;
    }

    if (!automaticInboxOpening) {
      if (selectedId && !filteredMessages.some((message) => message.id === selectedId)) {
        setSelectedId(null);
      }
      return;
    }

    if (!selectedId || !filteredMessages.some((message) => message.id === selectedId)) {
      setSelectedId(filteredMessages[0].id);
    }
  }, [automaticInboxOpening, filteredMessages, selectedId]);

  const selectedMessage =
    filteredMessages.find((message) => message.id === selectedId) || null;

  useEffect(() => {
    if (selectedMessage && !selectedMessage.read) {
      markMessageRead(selectedMessage.id);
    }
  }, [markMessageRead, selectedMessage]);

  const metrics = useMemo(() => {
    const todayLabel = new Date().toDateString();

    return {
      total: messages.length,
      unread: messages.filter((message) => !message.read).length,
      today: messages.filter((message) => new Date(message.date).toDateString() === todayLabel)
        .length,
      withPhone: messages.filter((message) => Boolean(message.phone)).length,
    };
  }, [messages]);

  const areaCounts = useMemo(
    () =>
      areaOptions.map((area) => ({
        area,
        count: messages.filter((message) => message.area === area).length,
      })),
    [areaOptions, messages],
  );

  const resetFilters = () => {
    setSearchQuery('');
    setActiveArea('all');
    setUnreadOnly(false);
  };

  const emailHref = selectedMessage?.email
    ? `mailto:${selectedMessage.email}?subject=${encodeURIComponent(
        `Seguimiento de consulta - ${selectedMessage.area || 'JR&L Inversiones'}`,
      )}`
    : '';
  const whatsappHref = selectedMessage?.phone
    ? `https://wa.me/${buildWhatsAppPhone(selectedMessage.phone)}?text=${encodeURIComponent(
        `Hola ${selectedMessage.name}, le escribe JR&L Inversiones para dar seguimiento a su consulta${selectedMessage.area ? ` sobre ${selectedMessage.area}` : ''}.`,
      )}`
    : '';
  const callHref = selectedMessage?.phone ? `tel:${selectedMessage.phone}` : '';

  return (
    <div className="messages-studio services-studio">
      <PageHelp
        title="Mensajes"
        description="Bandeja central para revisar consultas entrantes, priorizar seguimiento y responder por el canal correcto."
        features={[
          'Busqueda por nombre, correo, telefono, area o contenido del mensaje.',
          'Filtros por area legal y por mensajes nuevos.',
          'Ficha completa con contacto rapido por correo, WhatsApp o llamada.',
        ]}
      />

      <section className="messages-hero">
        <div className="messages-hero__copy">
          <span className="messages-hero__eyebrow">Centro de mensajes</span>
          <h2>Una bandeja mas clara, elegante y util para atender consultas del despacho.</h2>
          <p>
            Ahora el equipo puede filtrar, leer y responder con mejor contexto sin perder de
            vista prioridad, area y canal disponible.
          </p>
        </div>

        <div className="messages-hero__stats">
          <article className="messages-hero__stat messages-hero__stat--primary">
            <span>Total</span>
            <strong>{metrics.total}</strong>
            <small>mensajes registrados</small>
          </article>
          <article className="messages-hero__stat">
            <span>Nuevos</span>
            <strong>{metrics.unread}</strong>
            <small>pendientes por abrir</small>
          </article>
          <article className="messages-hero__stat">
            <span>Hoy</span>
            <strong>{metrics.today}</strong>
            <small>entradas del dia</small>
          </article>
          <article className="messages-hero__stat">
            <span>Con telefono</span>
            <strong>{metrics.withPhone}</strong>
            <small>contactables por llamada</small>
          </article>
        </div>
      </section>

      <section className="messages-toolbar">
        <label className="messages-search services-search" aria-label="Buscar mensajes">
          <FaSearch />
          <input
            type="search"
            placeholder="Buscar por cliente, correo, telefono, area o mensaje"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <div className="messages-toolbar__actions">
          <button
            type="button"
            className={`messages-filter ${unreadOnly ? 'is-active' : ''}`}
            onClick={() => setUnreadOnly((current) => !current)}
          >
            <FaFilter />
            Solo nuevos
          </button>

          {(searchQuery || activeArea !== 'all' || unreadOnly) && (
            <button type="button" className="messages-clear" onClick={resetFilters}>
              Limpiar vista
            </button>
          )}
        </div>

        <div className="messages-filters">
          <button
            type="button"
            className={`messages-filter ${activeArea === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveArea('all')}
          >
            Todas las areas
          </button>

          {areaOptions.map((area) => (
            <button
              key={area}
              type="button"
              className={`messages-filter ${activeArea === area ? 'is-active' : ''}`}
              onClick={() => setActiveArea(area)}
            >
              {area}
            </button>
          ))}
        </div>
      </section>

      <div className="messages-workspace">
        <section className="messages-panel messages-list-panel">
          <div className="messages-panel__header">
            <div>
              <span>Bandeja</span>
              <h3>Consultas recibidas</h3>
            </div>
            <small>{filteredMessages.length} visible(s)</small>
          </div>

          <div className="messages-list">
            {filteredMessages.length ? (
              filteredMessages.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  className={`message-list-item ${selectedId === message.id ? 'is-active' : ''} ${!message.read ? 'is-unread' : ''}`}
                  onClick={() => setSelectedId(message.id)}
                >
                  <div className="message-list-item__top">
                    <div className="message-list-item__identity">
                      <span className={`message-list-item__dot ${!message.read ? 'is-unread' : ''}`} />
                      <strong>{message.name}</strong>
                    </div>
                    <small>{formatShortDate(message.date)}</small>
                  </div>

                  <div className="message-list-item__tags">
                    <span className="message-chip">{message.area || 'Consulta general'}</span>
                    {message.phone ? (
                      <span className="message-chip message-chip--soft">
                        <FaPhoneAlt />
                        Telefono
                      </span>
                    ) : null}
                  </div>

                  <p className="message-list-item__preview">{message.message}</p>

                  <div className="message-list-item__footer">
                    <span>{message.email}</span>
                    <b>{message.read ? 'Leido' : 'Nuevo'}</b>
                  </div>
                </button>
              ))
            ) : (
              <div className="messages-empty">
                <FaInbox />
                <h4>No hay mensajes en esta vista.</h4>
                <p>Ajuste los filtros o espere nuevas consultas desde la web.</p>
              </div>
            )}
          </div>
        </section>

        <section className="messages-panel messages-detail-panel">
          <div className="messages-panel__header">
            <div>
              <span>Detalle</span>
              <h3>Ficha del mensaje</h3>
            </div>
            {selectedMessage ? (
              <small>{selectedMessage.read ? 'Seguimiento abierto' : 'Pendiente de revision'}</small>
            ) : null}
          </div>

          {selectedMessage ? (
            <div className="message-detail">
              <div className="message-detail__hero">
                <div>
                  <span className="message-detail__eyebrow">Mensaje desde formulario web</span>
                  <h3>{selectedMessage.name}</h3>
                  <p>
                    {selectedMessage.area
                      ? `Consulta relacionada con ${selectedMessage.area}.`
                      : 'Consulta general recibida desde el sitio.'}
                  </p>
                </div>
                <span
                  className={`message-status-pill ${selectedMessage.read ? 'is-read' : 'is-unread'}`}
                >
                  {selectedMessage.read ? <FaCheckCircle /> : <FaClock />}
                  {selectedMessage.read ? 'Leido' : 'Nuevo'}
                </span>
              </div>

              <div className="message-detail__meta">
                <article>
                  <small>Correo</small>
                  <strong>{selectedMessage.email}</strong>
                </article>
                <article>
                  <small>Telefono</small>
                  <strong>{selectedMessage.phone || 'No registrado'}</strong>
                </article>
                <article>
                  <small>Fecha de entrada</small>
                  <strong>{formatLongDate(selectedMessage.date)}</strong>
                </article>
                <article>
                  <small>Area legal</small>
                  <strong>{selectedMessage.area || 'Sin clasificar'}</strong>
                </article>
              </div>

              <div className="message-detail__body">
                <section className="message-detail__section">
                  <span>Mensaje recibido</span>
                  <p>{selectedMessage.message}</p>
                </section>

                <section className="message-detail__section message-detail__section--note">
                  <span>Siguiente accion sugerida</span>
                  <p>
                    {selectedMessage.phone
                      ? 'Responder por correo y confirmar por WhatsApp o llamada para acelerar el seguimiento.'
                      : 'Responder por correo con propuesta de orientacion y solicitar un telefono de contacto.'}
                  </p>
                </section>
              </div>

              <div className="message-detail__actions">
                {selectedMessage.email ? (
                  <a href={emailHref} className="admin-btn-primary">
                    <FaReply />
                    Responder por correo
                  </a>
                ) : (
                  <span className="message-action is-disabled">
                    <FaReply />
                    Sin correo
                  </span>
                )}

                {selectedMessage.phone ? (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="admin-btn-outline">
                    <FaWhatsapp />
                    WhatsApp
                  </a>
                ) : (
                  <span className="message-action is-disabled">
                    <FaWhatsapp />
                    Sin WhatsApp
                  </span>
                )}

                {selectedMessage.phone ? (
                  <a href={callHref} className="admin-btn-outline">
                    <FaPhoneAlt />
                    Llamar
                  </a>
                ) : (
                  <span className="message-action is-disabled">
                    <FaPhoneAlt />
                    Sin telefono
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="messages-empty messages-empty--detail">
              <FaEnvelopeOpen />
              <h4>Seleccione un mensaje.</h4>
              <p>Abra una consulta de la bandeja para ver los datos completos y responder.</p>
            </div>
          )}
        </section>

        <aside className="messages-panel messages-sidebar-panel">
          <div className="messages-panel__header">
            <div>
              <span>Resumen</span>
              <h3>Cobertura del inbox</h3>
            </div>
          </div>

          <div className="messages-sidebar__stats">
            <article className="messages-side-stat">
              <small>Canales activos</small>
              <strong>{metrics.withPhone}</strong>
              <span>mensajes con telefono disponible</span>
            </article>
            <article className="messages-side-stat">
              <small>Areas</small>
              <strong>{areaCounts.length}</strong>
              <span>frentes legales con demanda reciente</span>
            </article>
          </div>

          <div className="messages-areas">
            <div className="messages-areas__head">
              <h4>Distribucion por area</h4>
              <small>{messages.length} total</small>
            </div>

            <div className="messages-areas__list">
              {areaCounts.length ? (
                areaCounts.map((item) => (
                  <article key={item.area} className="messages-area-row">
                    <div>
                      <strong>{item.area}</strong>
                      <span>consultas registradas</span>
                    </div>
                    <b>{item.count}</b>
                  </article>
                ))
              ) : (
                <div className="messages-empty messages-empty--compact">
                  <h4>Sin areas registradas.</h4>
                  <p>Las nuevas consultas apareceran aqui automaticamente.</p>
                </div>
              )}
            </div>
          </div>

          <div className="messages-guidance">
            <h4>Operacion recomendada</h4>
            <p>Revise primero los mensajes nuevos con telefono, luego responda los correos y derive a cita cuando la consulta ya este calificada.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminInbox;
