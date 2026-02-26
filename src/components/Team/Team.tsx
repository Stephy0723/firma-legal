import { useState } from "react";
import {
  FaLinkedinIn,
  FaEnvelope,
  FaArrowLeft,
  FaGraduationCap,
  FaTrophy,
} from "react-icons/fa";
import "./Team.scss";

interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  image: string;
  bio: string;
  linkedin: string;
  email: string;
  education: string[];
  achievements: string[];
}

const teamMembers: TeamMember[] = [
  {
    name: "Dr. Carlos Méndez",
    role: "Socio Fundador",
    specialty: "Derecho Penal & Litigación",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
    bio: "Más de 25 años liderando casos de alto perfil en tribunales nacionales e internacionales. Reconocido por su capacidad estratégica y determinación en la defensa de sus clientes. Su enfoque combina rigor académico con una profunda comprensión práctica del sistema judicial.",
    linkedin: "#",
    email: "cmendez@jrlasociados.com",
    education: [
      "Doctor en Derecho — Universidad Autónoma de Santo Domingo",
      "Máster en Derecho Penal Internacional — Universidad de Salamanca",
    ],
    achievements: [
      "Más de 200 casos penales ganados",
      "Miembro del Colegio de Abogados de la RD",
      "Conferencista internacional en derecho penal",
    ],
  },
  {
    name: "Dra. Laura Gómez",
    role: "Socia Directora",
    specialty: "Derecho Civil & Patrimonial",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    bio: "Especialista en contratos complejos y protección patrimonial para personas de alto perfil. Su enfoque meticuloso y su capacidad negociadora la convierten en una aliada invaluable para nuestros clientes en disputas civiles de gran envergadura.",
    linkedin: "#",
    email: "lgomez@jrlasociados.com",
    education: [
      "Doctora en Derecho Civil — PUCMM",
      "Especialización en Derecho Inmobiliario — UNIBE",
    ],
    achievements: [
      "Referente en litigios patrimoniales de gran cuantía",
      "Publicaciones en revistas jurídicas nacionales",
      "Mediadora certificada por la Cámara de Comercio",
    ],
  },
  {
    name: "Dr. Andrés Castillo",
    role: "Socio Senior",
    specialty: "Derecho Corporativo & M&A",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80",
    bio: "Experto en fusiones, adquisiciones y reestructuración empresarial con proyección internacional. Ha asesorado a más de 50 empresas en procesos de transformación corporativa, acumulando experiencia en transacciones multimillonarias.",
    linkedin: "#",
    email: "acastillo@jrlasociados.com",
    education: [
      "Doctor en Derecho Empresarial — Universidad Iberoamericana",
      "MBA — BARNA Business School",
    ],
    achievements: [
      "Asesor legal de más de 50 empresas en RD",
      "Experiencia en transacciones superiores a USD 100M",
      "Miembro de la Asociación de Derecho Corporativo",
    ],
  },
  {
    name: "Dra. Valentina Herrera",
    role: "Directora de Área",
    specialty: "Derecho Internacional & Arbitraje",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
    bio: "Formada en La Haya, lidera nuestra práctica de arbitraje y resolución de controversias internacionales. Su experiencia multicultural y dominio de tres idiomas la hacen clave para disputas transfronterizas complejas.",
    linkedin: "#",
    email: "vherrera@jrlasociados.com",
    education: [
      "Máster en Derecho Internacional — Universidad de La Haya",
      "Licenciada en Derecho — UASD",
    ],
    achievements: [
      "Participación en arbitrajes ante la CCI y CIADI",
      "Especialista en tratados bilaterales de inversión",
      "Bilingüe: Español, Inglés, Francés",
    ],
  },
];

const Team = () => {
  const [activeMember, setActiveMember] = useState<number | null>(null);

  const openProfile = (index: number) => {
    setActiveMember(index);
    document.getElementById("equipo")?.scrollIntoView({ behavior: "smooth" });
  };
  const closeProfile = () => setActiveMember(null);

  return (
    <section id="equipo" className="team section reveal">
      <p className="eyebrow">Nuestro Equipo</p>
      <h2>Profesionales de excelencia</h2>
      <p className="team__intro">
        Cada miembro de nuestro equipo aporta una combinación única de experiencia
        académica, trayectoria profesional y dedicación al cliente. Seleccione un
        perfil para conocer más.
      </p>

      {/* Profile Detail View */}
      {activeMember !== null && (
        <div className="member-detail">
          <button className="member-detail__back" onClick={closeProfile}>
            <FaArrowLeft /> Volver al equipo
          </button>

          <div className="member-detail__header">
            <img
              src={teamMembers[activeMember].image}
              alt={teamMembers[activeMember].name}
              className="member-detail__photo"
            />
            <div className="member-detail__header-text">
              <h3>{teamMembers[activeMember].name}</h3>
              <span className="member-detail__role">
                {teamMembers[activeMember].role}
              </span>
              <span className="member-detail__specialty">
                {teamMembers[activeMember].specialty}
              </span>
              <div className="member-detail__links">
                <a
                  href={teamMembers[activeMember].linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedinIn /> LinkedIn
                </a>
                <a href={`mailto:${teamMembers[activeMember].email}`}>
                  <FaEnvelope /> {teamMembers[activeMember].email}
                </a>
              </div>
            </div>
          </div>

          <div className="member-detail__body">
            <p className="member-detail__bio">
              {teamMembers[activeMember].bio}
            </p>

            <div className="member-detail__sections">
              <div className="member-detail__section">
                <h4>
                  <FaGraduationCap className="member-detail__section-icon" />
                  Formación Académica
                </h4>
                <ul>
                  {teamMembers[activeMember].education.map((edu, i) => (
                    <li key={i}>{edu}</li>
                  ))}
                </ul>
              </div>

              <div className="member-detail__section">
                <h4>
                  <FaTrophy className="member-detail__section-icon" />
                  Logros Destacados
                </h4>
                <ul>
                  {teamMembers[activeMember].achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="member-detail__cta-area">
              <button
                onClick={() =>
                  document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Agendar Cita con{" "}
                {teamMembers[activeMember].name.split(" ").slice(0, 2).join(" ")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid — all when no detail, others when viewing a profile */}
      <div className="team__grid-wrapper">
        {activeMember !== null && (
          <h4 className="team__other-title">Otros miembros del equipo</h4>
        )}
        <div className="team__grid">
          {teamMembers
            .map((member, index) => ({ member, index }))
            .filter(({ index }) => activeMember === null || index !== activeMember)
            .map(({ member, index }) => (
              <article
                className="member"
                key={index}
                onClick={() => openProfile(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openProfile(index)}
              >
                <div className="member__photo">
                  <img src={member.image} alt={member.name} />
                  <div className="member__photo-overlay">
                    <span>Ver perfil</span>
                  </div>
                </div>
                <div className="member__info">
                  <h3>{member.name}</h3>
                  <span className="member__role">{member.role}</span>
                  <span className="member__specialty">{member.specialty}</span>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
