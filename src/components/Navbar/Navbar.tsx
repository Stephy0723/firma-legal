import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaPhoneAlt } from "react-icons/fa";
import "./Navbar.scss";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__logo">
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
  );
};

export default Navbar;
