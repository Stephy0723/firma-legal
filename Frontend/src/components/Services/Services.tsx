import { useState, useRef, useEffect } from "react";
import {
  FaBalanceScale,
  FaPassport,
  FaUsers,
  FaBuilding,
  FaCar,
  FaFileSignature,
  FaSearch,
  FaArrowLeft,
  FaCheckCircle,
  FaSuitcase,
  FaCalendarAlt,
} from "react-icons/fa";
import AppointmentModal from "../AppointmentModal/AppointmentModal";
import "./Services.scss";
import { useData } from "../../context/DataContext";

const iconMap: Record<string, React.ElementType> = {
  FaBalanceScale,
  FaPassport,
  FaUsers,
  FaBuilding,
  FaCar,
  FaFileSignature,
  FaSearch,
};



const getServiceColorClass = (index: number) => {
  const colors = ['purple', 'violet', 'sky', 'emerald', 'amber'];
  return colors[index % colors.length];
};

const Services = () => {
  const { services } = useData();
  const [activeService, setActiveService] = useState<number | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeService !== null && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeService]);

  const openDetail = (index: number) => {
    setActiveService(index);
  };

  const closeDetail = () => setActiveService(null);

  const handleBookForArea = (area: string) => {
    setSelectedArea(area);
    setShowBooking(true);
  };

  return (
    <>
      <section id="servicios" className="services section reveal">
        <p className="eyebrow">Áreas de Práctica</p>
        <h2>Servicios legales integrales</h2>
        <p className="services__intro">
          Ofrecemos asesoría y representación en las áreas legales más solicitadas,
          con acompañamiento profesional y enfoque práctico en cada gestión.
        </p>
        <div className="services__offer">
          <div className="services__offer-head">
            <p className="services__offer-eyebrow">Servicios Legales e Integrales</p>
            <h3>¿Qué podemos ofrecer?</h3>
          </div>
          <div className="services__offer-layout">
            <ul className="services__offer-list">
              <li>
                <FaCheckCircle />
                Asesoramiento en litis judiciales
              </li>
              <li>
                <FaCheckCircle />
                Procesos migratorios, visados y permisos para menor
              </li>
              <li>
                <FaCheckCircle />
                Divorcios, manutención y custodia
              </li>
              <li>
                <FaCheckCircle />
                Servicios inmobiliarios, tasación y transferencia de inmuebles
              </li>
              <li>
                <FaCheckCircle />
                Traspaso de matrícula de vehículo
              </li>
              <li>
                <FaCheckCircle />
                Elaboración de actos notariales y contratos
              </li>
              <li>
                <FaCheckCircle />
                Perito gráfico y análisis forense documental
              </li>
            </ul>
            <div className="services__offer-copy-wrap">
              <p className="services__offer-copy">
                JR&L es una firma de abogados que proporciona asesoramiento legal
                experto, representación en procedimientos legales y gestión del
                cumplimiento de las leyes en diversas áreas. Nuestro trabajo
                contribuye al funcionamiento efectivo del sistema legal en favor de
                los intereses y valores de nuestros clientes.
              </p>
              <button className="services__offer-cta" onClick={() => setShowBooking(true)}>
                <FaCalendarAlt style={{ marginRight: '0.4rem' }} />
                Agendar Consulta
              </button>
            </div>
          </div>
        </div>

        {activeService !== null && (
          <div className="service-detail" ref={detailRef}>
            <button className="service-detail__back" onClick={closeDetail}>
              <FaArrowLeft /> Volver a todos los servicios
            </button>

            <div className="service-detail__header">
              <div className="service-detail__icon">
                {(() => {
                  const Icon = iconMap[services[activeService].icon] || FaSuitcase;
                  return <Icon />;
                })()}
              </div>
              <div>
                <h3>{services[activeService].title}</h3>
                <p className="service-detail__desc">
                  {services[activeService].fullDescription}
                </p>
              </div>
            </div>

            <div className="service-detail__content">
              <h4>Servicios que incluye esta área</h4>
              <ul className="service-detail__list">
                {services[activeService].details.map((detail, i) => (
                  <li key={i}>
                    <FaCheckCircle className="service-detail__check" />
                    {detail}
                  </li>
                ))}
              </ul>

              <div className="service-detail__cta-area">
                <p>
                  ¿Necesita asesoría en {services[activeService].title.toLowerCase()}?
                </p>
                <button
                  onClick={() => handleBookForArea(services[activeService].title)}
                >
                  <FaCalendarAlt style={{ marginRight: '0.4rem' }} />
                  Solicitar Consulta Gratuita
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="services__grid-wrapper">
          {activeService !== null && (
            <h4 className="services__other-title">Otros servicios</h4>
          )}
          <div className="services__grid">
            {services
              .map((service, index) => ({ service, index }))
              .filter(({ index }) => activeService === null || index !== activeService)
              .map(({ service, index }) => {
                const Icon = iconMap[service.icon] || FaSuitcase;
                return (
                  <article
                    className={`service-card service-color-${getServiceColorClass(index)}`}
                    key={index}
                    onClick={() => openDetail(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openDetail(index)}
                  >
                    <Icon className="icon" />
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div className="service-card__actions">
                      <span className="service-card__more">Ver detalles {"→"}</span>
                      <button
                        className="service-card__book"
                        onClick={(e) => { e.stopPropagation(); handleBookForArea(service.title); }}
                        title="Agendar cita para este servicio"
                      >
                        <FaCalendarAlt />
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </section>

      <AppointmentModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        preselectedArea={selectedArea}
      />
    </>
  );
};

export default Services;
