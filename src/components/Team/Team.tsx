import { useState } from "react";
import {
  FaLinkedinIn,
  FaEnvelope,
  FaArrowLeft,
  FaGraduationCap,
  FaTrophy,
  FaArrowRight,
  FaCalendarAlt,
} from "react-icons/fa";
import AppointmentModal from "../AppointmentModal/AppointmentModal";
import "./Team.scss";
import { useData } from "../../context/DataContext";

const Team = () => {
  const { team: teamMembers } = useData();
  const [activeMember, setActiveMember] = useState<number | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState('');

  const openProfile = (index: number) => {
    setActiveMember(index);
    document.getElementById("equipo")?.scrollIntoView({ behavior: "smooth" });
  };
  const closeProfile = () => setActiveMember(null);

  const handleBookWithLawyer = (name: string) => {
    setSelectedLawyer(name);
    setShowBooking(true);
  };

  return (
    <>
      <section id="equipo" className="team section reveal">
        <p className="eyebrow">Nuestro Equipo</p>
        <h2>Profesionales de excelencia</h2>
        <p className="team__intro">
          Cada miembro de nuestro equipo aporta una combinación única de experiencia
          académica, trayectoria profesional y dedicación al cliente. En JR&L
          Inversiones creemos que la calidad del servicio legal comienza con la
          calidad humana de quienes lo brindan. Conozca a nuestro equipo.
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
                  onClick={() => handleBookWithLawyer(teamMembers[activeMember].name)}
                >
                  <FaCalendarAlt style={{ marginRight: "0.5rem" }} />
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
                  className="team-member-card"
                  key={index}
                  onClick={() => openProfile(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openProfile(index)}
                >
                  <div className="team-member-card__photo">
                    <img src={member.image} alt={member.name} />
                  </div>
                  <div className="team-member-card__body">
                    <h3>{member.name}</h3>
                    <span className="team-member-card__role">{member.role}</span>
                    <span className="team-member-card__specialty">{member.specialty}</span>
                    <p className="team-member-card__bio">
                      {member.bio.length > 120 ? member.bio.slice(0, 120) + '...' : member.bio}
                    </p>
                    <div className="team-member-card__footer">
                      <span className="team-member-card__cta">
                        Ver perfil <FaArrowRight />
                      </span>
                      <div className="team-member-card__actions">
                        <button
                          className="team-member-card__book"
                          onClick={(e) => { e.stopPropagation(); handleBookWithLawyer(member.name); }}
                          title="Agendar cita"
                        >
                          <FaCalendarAlt />
                        </button>
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                          <FaLinkedinIn />
                        </a>
                        <a href={`mailto:${member.email}`} onClick={e => e.stopPropagation()}>
                          <FaEnvelope />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>

      <AppointmentModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        preselectedLawyer={selectedLawyer}
      />
    </>
  );
};

export default Team;
