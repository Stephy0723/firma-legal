import { useState } from "react";
import {
  FaBalanceScale,
  FaBuilding,
  FaGavel,
  FaUsers,
  FaFileContract,
  FaGlobe,
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
    title: "Derecho Civil",
    description:
      "Contratos, obligaciones, responsabilidad civil y reclamaciones patrimoniales.",
    fullDescription:
      "Nuestro departamento de Derecho Civil cuenta con especialistas en la protección de los derechos patrimoniales y personales. Brindamos asesoría integral en la redacción, negociación e interpretación de contratos, así como en la resolución de conflictos civiles tanto por vía judicial como extrajudicial.",
    details: [
      "Redacción y revisión de contratos civiles y mercantiles",
      "Reclamaciones por daños y perjuicios",
      "Cobro judicial y extrajudicial de deudas",
      "Derecho inmobiliario y registral",
      "Disputas sobre propiedad y posesión",
      "Responsabilidad civil contractual y extracontractual",
    ],
  },
  {
    icon: FaGavel,
    title: "Derecho Penal",
    description:
      "Defensa técnica integral en todas las etapas del proceso penal.",
    fullDescription:
      "Contamos con un equipo de penalistas con amplia experiencia en la defensa y representación de personas físicas y jurídicas ante la jurisdicción penal. Intervenimos desde la fase de investigación hasta los recursos extraordinarios, garantizando una defensa técnica sólida y estratégica.",
    details: [
      "Defensa en fase de investigación y juicio oral",
      "Recursos de apelación y casación",
      "Delitos económicos y financieros",
      "Delitos contra la propiedad y patrimonio",
      "Asistencia en detenciones y medidas cautelares",
      "Querella y acusación particular",
    ],
  },
  {
    icon: FaBuilding,
    title: "Derecho Corporativo",
    description:
      "Estructuras societarias, fusiones, adquisiciones y gobierno corporativo.",
    fullDescription:
      "Asesoramos a empresas nacionales e internacionales en todas las fases de su ciclo de vida empresarial. Desde la constitución societaria hasta operaciones complejas de fusión y adquisición, nuestro equipo garantiza el cumplimiento normativo y la optimización de estructuras corporativas.",
    details: [
      "Constitución y disolución de sociedades",
      "Fusiones, adquisiciones y reestructuraciones",
      "Gobierno corporativo y compliance",
      "Contratos comerciales y joint ventures",
      "Due diligence legal",
      "Asesoría a juntas directivas y accionistas",
    ],
  },
  {
    icon: FaUsers,
    title: "Derecho Familiar",
    description:
      "Divorcios, custodia, pensiones alimenticias y sucesiones.",
    fullDescription:
      "Tratamos cada caso familiar con la mayor sensibilidad y determinación. Nuestros especialistas en derecho de familia comprenden la delicadeza de estas situaciones y trabajan para alcanzar soluciones que protejan los intereses de todas las partes involucradas, especialmente de los menores.",
    details: [
      "Divorcios contenciosos y de mutuo acuerdo",
      "Custodia y régimen de visitas",
      "Pensiones alimenticias y compensatorias",
      "Liquidación de bienes gananciales",
      "Adopciones y filiación",
      "Testamentos, herencias y sucesiones",
    ],
  },
  {
    icon: FaFileContract,
    title: "Derecho Laboral",
    description:
      "Asesoría en relaciones laborales, contratos y litigios sociales.",
    fullDescription:
      "Ofrecemos representación y asesoramiento integral en materia laboral tanto a empleadores como a trabajadores. Nuestro objetivo es prevenir conflictos laborales y, cuando estos surgen, resolverlos de la manera más eficiente y favorable para nuestros clientes.",
    details: [
      "Despidos improcedentes y nulos",
      "Negociación y redacción de contratos de trabajo",
      "Acoso laboral y discriminación",
      "Reclamaciones salariales y de prestaciones",
      "Seguridad social y accidentes laborales",
      "Mediación y conciliación laboral",
    ],
  },
  {
    icon: FaGlobe,
    title: "Derecho Internacional",
    description:
      "Arbitraje comercial, contratos internacionales y disputas transfronterizas.",
    fullDescription:
      "Nuestra práctica internacional se especializa en la resolución de disputas comerciales transfronterizas y el asesoramiento en operaciones de comercio internacional. Contamos con experiencia ante tribunales arbitrales internacionales y una red de corresponsales en diversas jurisdicciones.",
    details: [
      "Arbitraje comercial internacional",
      "Contratos de comercio exterior",
      "Inversión extranjera y regulación",
      "Tratados bilaterales de inversión",
      "Resolución de disputas transfronterizas",
      "Compliance y normativa internacional",
    ],
  },
];

const Services = () => {
  const [activeService, setActiveService] = useState<number | null>(null);

  const openDetail = (index: number) => {
    setActiveService(index);
    // scroll to top of section
    document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth" });
  };
  const closeDetail = () => setActiveService(null);

  return (
    <section id="servicios" className="services section reveal">
      <p className="eyebrow">Áreas de Práctica</p>
      <h2>Servicios legales integrales</h2>
      <p className="services__intro">
        Ofrecemos cobertura completa en las principales ramas del derecho, con un
        equipo de especialistas dedicados a cada área. Seleccione un servicio para
        conocer más detalles.
      </p>

      {/* Detail View */}
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
              <p>¿Necesita asesoría en {services[activeService].title.toLowerCase()}?</p>
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

      {/* Grid — shows all when no detail, or "others" when viewing a detail */}
      <div className="services__grid-wrapper">
        {activeService !== null && (
          <h4 className="services__other-title">Otras áreas de práctica</h4>
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
                <span className="service-card__more">Ver detalles →</span>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
