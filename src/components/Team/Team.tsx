import { useState } from "react";
import {
  FaLinkedinIn,
  FaEnvelope,
  FaArrowLeft,
  FaGraduationCap,
  FaTrophy,
} from "react-icons/fa";
import "./Team.scss";
import eleineKarysRosaGilPhoto from "../../assets/FTS-JRLinversiones/eleine_karys_rosa_gil.jpg";
import juanFranciscoRosaCabralPhoto from "../../assets/FTS-JRLinversiones/lic._juan_francisco_rosa_cabral.jpg";
import juanCarlosPerezPhoto from "../../assets/FTS-JRLinversiones/juan_carlos_pérez.jpg";
import merlinFranciscaFamiliaPhoto from "../../assets/FTS-JRLinversiones/Merlín Francisca Familia.jpg";
import luzMilagrosRamirezPhoto from "../../assets/FTS-JRLinversiones/Luz Milagros Ramírez.jpeg";
import nelsonRafaelAcostaBritoPhoto from "../../assets/FTS-JRLinversiones/Nelson Rafael Acosta Brito.jpg";

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
    name: "Eleine Karys Rosa Gil",
    role: "Abogada",
    specialty: "Derecho",
    image:
      eleineKarysRosaGilPhoto,
    bio: "A lo largo de su formacion y experiencia, ha complementado su perfil profesional como Abogada JR con diversos cursos y diplomados que fortalecen sus conocimientos y le permiten tener una vision integral en diferentes areas.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: [
      "Negocios moviles",
      "Regulacion de la interaccion digital",
      "Dialogo",
      "Fideicomiso de planificacion sucesoral en la Republica Dominicana",
      "Alquileres inmobiliarios y administracion de propiedades",
      "Diplomado en bienes raices",
      "Asesor consular Estados Unidos",
    ],
    achievements: [
      "Vision integral para diferentes areas juridicas",
      "Competencias para el desarrollo de soluciones innovadoras",
      "Aporte de valor en el ambito juridico y profesional",
    ],
  },
  {
    name: "Lic. Juan Francisco Rosa Cabral",
    role: "Especialista",
    specialty: "Derecho Penal",
    image:
      juanFranciscoRosaCabralPhoto,
    bio: "Nacido en Constanza, Republica Dominicana, el 29 de junio de 1974. Egresado de la Universidad Autonoma de Santo Domingo en el ano 2000. Se ha especializado en Derecho Penal, logrando un alto porcentaje de casos resueltos dentro del buffet juridico.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: [
      "Egresado de la Universidad Autonoma de Santo Domingo (2000)",
      "Formacion especializada en Derecho Penal",
    ],
    achievements: [
      "Alto porcentaje de casos penales resueltos",
      "Experiencia consolidada en litigacion penal",
      "Trayectoria destacada en el buffet juridico",
    ],
  },
  {
    name: "Juan Carlos Perez",
    role: "Encargado",
    specialty: "Departamento de Correspondencia",
    image:
      juanCarlosPerezPhoto,
    bio: "Nacido en Santo Domingo el 22 de enero de 1982. Responsable de transportar, visitar, recibir y entregar documentos, paquetes y noticias en la institucion. Su compromiso con la puntualidad, la seguridad y la confidencialidad garantiza eficiencia en los procesos legales.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: [
      "Gestion de diligencias documentales",
      "Manejo de correspondencia institucional",
    ],
    achievements: [
      "Puntualidad y eficiencia en diligencias",
      "Seguridad y confidencialidad en entregas",
      "Apoyo clave para la operacion legal",
    ],
  },
  {
    name: "Merlin Francisca Familia",
    role: "Abogada",
    specialty: "Derecho Procesal Civil, Administrativo, Laboral y Ley 155-17",
    image:
      merlinFranciscaFamiliaPhoto,
    bio: "Abogada dominicana, egresada de UAPA (2020). Experta en Derecho Civil, contratos, embargos, divorcios, reconocimiento de paternidad y cobros judiciales. Ha coordinado departamentos legales en instituciones privadas y destaca en liderazgo, negociacion y manejo de procesos juridicos.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: [
      "Egresada de UAPA (2020)",
      "Formacion en Derecho Procesal Civil y Administrativo",
      "Formacion en Derecho Laboral y Ley 155-17",
    ],
    achievements: [
      "Coordinacion de departamentos legales en instituciones privadas",
      "Experiencia en cobros judiciales y procesos civiles",
      "Fortalezas en liderazgo y negociacion",
    ],
  },
  {
    name: "Lic. Luz Milagros Ramirez",
    role: "Abogada",
    specialty: "Derecho Civil, Migratorio, Laboral y de Familia",
    image:
      luzMilagrosRamirezPhoto,
    bio: "Abogada dominicana, egresada de UTESA (2018). Tambien es licenciada en Psicologia Laboral (UTESA, 2011) y cuenta con habilitacion docente (2018). Ha sido Gerente de Inversiones JR & L, S.R.L y laboro en una institucion financiera por mas de una decada, desarrollando experiencia en gestion humana, negociacion y procesos legales.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: [
      "Licenciatura en Derecho - UTESA (2018)",
      "Licenciatura en Psicologia Laboral - UTESA (2011)",
      "Habilitacion docente (2018)",
    ],
    achievements: [
      "Alto porcentaje de exito en cobros compulsivos",
      "Mas del 90% de casos migratorios resueltos",
      "Experiencia en gestion humana y negociacion",
    ],
  },
  {
    name: "Dr. Nelson Rafael Acosta Brito",
    role: "Abogado",
    specialty: "Derecho de Familia, Inmobiliario y Demandas Judiciales",
    image:
      nelsonRafaelAcostaBritoPhoto,
    bio: "Nacido el 1 de marzo de 1959 en Laguna Salada, Valverde. Inicio sus estudios en la Universidad Central del Este en 1979, obteniendo el titulo de Doctor en Derecho en 1986. Ha ejercido en derecho penal, transito, civil e inmobiliario y ha participado en casos de renombre con juristas como Carlos Balcacer. Logro sentencias favorables con empresas internacionales como Lloyds en Inglaterra entre 1996 y 2009.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: [
      "Doctor en Derecho - Universidad Central del Este (1986)",
      "Estudios iniciados en la UCE en 1979",
    ],
    achievements: [
      "Experiencia en derecho penal, transito, civil e inmobiliario",
      "Participacion en casos de alto perfil juridico",
      "Sentencias favorables en litigios internacionales (1996-2009)",
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
        Cada miembro de nuestro equipo aporta una combinacion unica de experiencia
        academica, trayectoria profesional y dedicacion al cliente. Seleccione un
        perfil para conocer mas.
      </p>

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
                  Formacion Academica
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

