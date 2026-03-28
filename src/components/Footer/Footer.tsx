import { Link } from "react-router-dom";
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="minimal-footer">
      <div className="minimal-footer__container">
        {/* Left: Brand */}
        <div className="minimal-footer__brand">
          <Link to="/">
            JR<span>&</span>L Asuntos Jurídicos
          </Link>
        </div>

        {/* Divider */}
        <div className="minimal-footer__divider"></div>

        {/* Center: Links & Copyright */}
        <div className="minimal-footer__center">
          <ul className="minimal-footer__links">
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><Link to="/equipo">Equipo</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
          <p className="minimal-footer__copy">
            &copy; {new Date().getFullYear()} JR&L Inversiones. Todos los derechos reservados.
          </p>
        </div>

        {/* Right: Social & Contact */}
        <div className="minimal-footer__right">
          <div className="minimal-footer__socials">
            <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="#" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </a>
          </div>
          <p className="minimal-footer__contact">
            Contacto: jrylinversiones@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
