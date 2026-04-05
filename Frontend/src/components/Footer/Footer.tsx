<<<<<<< HEAD
import { Link } from "react-router-dom";
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";
=======
﻿import { Link } from "react-router-dom";
import { FaLinkedinIn, FaFacebookF, FaInstagram } from "react-icons/fa";
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
import "./Footer.scss";

const Footer = () => {
  return (
<<<<<<< HEAD
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
=======
    <footer className="footer reveal">
      <div className="footer__main">
        <div className="footer__col">
          <Link to="/" className="footer__brand">
            JR&L<span> Asuntos Jurídicos</span>
          </Link>
          <p className="footer__tagline">
            Excelencia jurídica estratégica al servicio de su patrimonio y sus
            derechos desde 2004.
          </p>
          <div className="footer__social">
            <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Navegación</h4>
          <ul className="footer__links">
            <li><Link to="/">Inicio</Link></li>
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><Link to="/equipo">Equipo</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
<<<<<<< HEAD
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
=======
        </div>

        <div className="footer__col">
          <h4>Áreas de Práctica</h4>
          <ul className="footer__links">
            <li><Link to="/servicios">Derecho Civil</Link></li>
            <li><Link to="/servicios">Derecho Penal</Link></li>
            <li><Link to="/servicios">Derecho Corporativo</Link></li>
            <li><Link to="/servicios">Derecho Familiar</Link></li>
            <li><Link to="/servicios">Derecho Laboral</Link></li>
            <li><Link to="/servicios">Derecho Internacional</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Contacto</h4>
          <ul className="footer__links footer__links--contact">
            <li>+1 (809) 555-0123</li>
            <li>contacto@jrlasociados.com</li>
            <li>Av. Winston Churchill #725,<br />Torre Empresarial, Piso 12</li>
            <li>Santo Domingo, RD</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; 2026 JR&L Asuntos Jurídicos y Servicios Financieros. Todos los derechos reservados.</p>
        <div className="footer__legal">
          <Link to="/politica-privacidad">Política de Privacidad</Link>
          <Link to="/terminos-uso">Términos de Uso</Link>
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
        </div>
      </div>
    </footer>
  );
};

export default Footer;
