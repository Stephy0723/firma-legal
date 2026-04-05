import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
<<<<<<< HEAD
import { FaBars, FaTimes, FaCalendarAlt, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import AppointmentModal from "../AppointmentModal/AppointmentModal";
import logo from "../../assets/logo.jpeg";
=======
import { FaBars, FaTimes, FaPhoneAlt } from "react-icons/fa";
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
import "./Navbar.scss";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
<<<<<<< HEAD
  const [showBooking, setShowBooking] = useState(false);
  const { theme, toggleTheme } = useTheme();
=======
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
<<<<<<< HEAD
    <>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">
          <NavLink to="/" className="navbar__logo">
            <img src={logo} alt="JR&L Asuntos Jurídicos" className="navbar__logo-img" />
            JR<span className="navbar__ampersand">&</span>L<span> Asuntos Jurídicos</span>
          </NavLink>

          <button
            className="navbar__toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <ul className={`navbar__menu ${menuOpen ? "active" : ""}`}>
            <li><NavLink to="/" end>Inicio</NavLink></li>
            <li><NavLink to="/nosotros">Nosotros</NavLink></li>
            <li><NavLink to="/servicios">Servicios</NavLink></li>
            <li><NavLink to="/equipo">Equipo</NavLink></li>
            <li><NavLink to="/contacto">Contacto</NavLink></li>
            
            <li className="navbar__theme-toggle">
              <button onClick={toggleTheme} aria-label="Cambiar tema de la página" className="theme-btn">
                {theme === 'light' ? <FaMoon /> : <FaSun />}
              </button>
            </li>

            <li>
              <button className="navbar__cta" onClick={() => { setMenuOpen(false); setShowBooking(true); }}>
                <FaCalendarAlt style={{ fontSize: "0.65rem", marginRight: "0.4rem" }} />
                Agendar Cita
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <AppointmentModal isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </>
=======
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__logo">
          JR&L<span> Asuntos Jurídicos</span>
        </NavLink>

        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul className={`navbar__menu ${menuOpen ? "active" : ""}`}>
          <li><NavLink to="/" end>Inicio</NavLink></li>
          <li><NavLink to="/nosotros">Nosotros</NavLink></li>
          <li><NavLink to="/servicios">Servicios</NavLink></li>
          <li><NavLink to="/equipo">Equipo</NavLink></li>
          <li><NavLink to="/testimonios">Testimonios</NavLink></li>
          <li>
            <NavLink to="/contacto" className="navbar__cta">
              <FaPhoneAlt style={{ fontSize: "0.65rem", marginRight: "0.4rem" }} />
              Contacto
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
  );
};

export default Navbar;
