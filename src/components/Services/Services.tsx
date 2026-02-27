import { useState } from "react";
import {
  FaBalanceScale,
  FaPassport,
  FaUsers,
  FaBuilding,
  FaCar,
  FaFileSignature,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import "./Services.scss";

interface ServiceData {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  fullDescription: string;
  details: string[];
}

const services: ServiceData[] = [
  {
    icon: FaBalanceScale,
    title: "Asesoramiento en Litis Judiciales",
    description: "Representacion y estrategia legal en procesos judiciales.",
    fullDescription:
      "Brindamos asesoria legal integral para litis judiciales, acompanando cada etapa del proceso con enfoque tecnico, estrategia procesal y defensa de sus derechos.",
    details: [
      "Evaluacion y estrategia del caso",
      "Representacion en audiencias y tribunales",
      "Preparacion de escritos judiciales",
      "Seguimiento completo del proceso",
    ],
  },
  {
    icon: FaPassport,
    title: "Procesos Migratorios",
    description: "Visados, permisos para menor y tramites migratorios.",
    fullDescription:
      "Gestionamos procesos migratorios con acompanamiento personalizado, asegurando cumplimiento legal y agilidad en tramites para personas y familias.",
    details: [
      "Solicitud y renovacion de visados",
      "Permisos de viaje para menor",
      "Regularizacion y documentacion migratoria",
      "Asesoria en requisitos y expedientes",
    ],
  },
  {
    icon: FaUsers,
    title: "Derecho de Familia",
    description: "Divorcios, manutencion y custodia.",
    fullDescription:
      "Atendemos asuntos familiares con sensibilidad y firmeza juridica, buscando soluciones claras para proteger sus intereses y los de sus hijos.",
    details: [
      "Divorcios de mutuo acuerdo y contenciosos",
      "Manutencion y pension alimentaria",
      "Custodia y regimen de visitas",
      "Acuerdos familiares y ejecucion judicial",
    ],
  },
  {
    icon: FaBuilding,
    title: "Servicios Inmobiliarios",
    description: "Tasacion y transferencia de inmuebles.",
    fullDescription:
      "Ofrecemos asesoria y gestion en operaciones inmobiliarias para garantizar transacciones seguras, documentadas y conforme a derecho.",
    details: [
      "Tasacion de inmuebles",
      "Transferencia y registro de propiedad",
      "Revision de titulos y cargas",
      "Acompanamiento legal en compraventas",
    ],
  },
  {
    icon: FaCar,
    title: "Traspaso de Matricula de Vehiculo",
    description: "Gestion legal para traspasos vehiculares.",
    fullDescription:
      "Realizamos el proceso de traspaso de matricula de vehiculo de forma segura y ordenada, verificando requisitos y documentacion para evitar contingencias.",
    details: [
      "Revision de documentacion del vehiculo",
      "Preparacion de expediente de traspaso",
      "Gestion de firmas y legalizaciones",
      "Seguimiento del tramite hasta su cierre",
    ],
  },
  {
    icon: FaFileSignature,
    title: "Actos Notariales y Contratos",
    description: "Elaboracion de todo tipo de actos notariales y contratos.",
    fullDescription:
      "Redactamos y formalizamos actos notariales y contratos con precision juridica, adaptados a sus necesidades personales, familiares, comerciales e inmobiliarias.",
    details: [
      "Contratos civiles y comerciales",
      "Poderes, declaraciones y autenticas",
      "Actos notariales diversos",
      "Revision legal y formalizacion documental",
    ],
  },
];

const Services = () => {
  const [activeService, setActiveService] = useState<number | null>(null);

  const openDetail = (index: number) => {
    setActiveService(index);
    document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth" });
  };

  const closeDetail = () => setActiveService(null);

  return (
    <section id="servicios" className="services section reveal">
      <p className="eyebrow">Areas de Practica</p>
      <h2>Servicios legales integrales</h2>
      <p className="services__intro">
        Ofrecemos asesoria y representacion en las areas legales mas solicitadas,
        con acompanamiento profesional y enfoque practico en cada gestion.
      </p>
      <div className="services__offer">
        <div className="services__offer-head">
          <p className="services__offer-eyebrow">Servicios Legales e Integrales</p>
          <h3>Que podemos ofrecer?</h3>
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
              Divorcios, manutencion y custodia
            </li>
            <li>
              <FaCheckCircle />
              Servicios inmobiliarios, tasacion y transferencia de inmuebles
            </li>
            <li>
              <FaCheckCircle />
              Traspaso de matricula de vehiculo
            </li>
            <li>
              <FaCheckCircle />
              Elaboracion de actos notariales y contratos
            </li>
          </ul>
          <p className="services__offer-copy">
            JR&L es una firma de abogados que proporciona asesoramiento legal
            experto, representacion en procedimientos legales y gestion del
            cumplimiento de las leyes en diversas areas. Nuestro trabajo
            contribuye al funcionamiento efectivo del sistema legal en favor de
            los intereses y valores de nuestros clientes.
          </p>
        </div>
      </div>

      {activeService !== null && (
        <div className="service-detail">
          <button className="service-detail__back" onClick={closeDetail}>
            <FaArrowLeft /> Volver a todos los servicios
          </button>

          <div className="service-detail__header">
            <div className="service-detail__icon">
              {(() => {
                const Icon = services[activeService].icon;
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
            <h4>Servicios que incluye esta area</h4>
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
                Necesita asesoria en {services[activeService].title.toLowerCase()}?
              </p>
              <button
                onClick={() =>
                  document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
                }
              >
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
            .map(({ service, index }) => (
              <article
                className="service-card"
                key={index}
                onClick={() => openDetail(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openDetail(index)}
              >
                <service.icon className="icon" />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="service-card__more">Ver detalles {"->"}</span>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
