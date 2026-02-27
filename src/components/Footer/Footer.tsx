import { Link } from "react-router-dom";
import { FaLinkedinIn, FaFacebookF, FaInstagram } from "react-icons/fa";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer reveal">
      <div className="footer__main">
        <div className="footer__col">
          <Link to="/" className="footer__brand">
            JR&L<span> Asuntos Juridicos</span>
          </Link>
          <p className="footer__tagline">
            Excelencia juridica estrategica al servicio de su patrimonio y sus
            derechos.
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
          <h4>Navegacion</h4>
          <ul className="footer__links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><Link to="/equipo">Equipo</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Areas de Practica</h4>
          <ul className="footer__links">
            <li><Link to="/servicios">Derecho Civil</Link></li>
            <li><Link to="/servicios">Derecho Penal</Link></li>
            <li><Link to="/servicios">Derecho Corporativo</Link></li>
            <li><Link to="/servicios">Derecho Familiar</Link></li>
            <li><Link to="/servicios">Derecho Laboral</Link></li>
            <li><Link to="/servicios">Derecho Migratorio</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Contacto</h4>
          <ul className="footer__links footer__links--contact">
            <li>+1 (849)-245-7806</li>
            <li>+1 (829)-594-0564</li>
            <li>jrylinversiones@gmail.com</li>
            <li>Avenida Venezuela No. 113, Segundo Nivel</li>
            <li>Ensanche Ozama, Santo Domingo Este</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; 2026 JR&L Asuntos Juridicos y Servicios Financieros. Todos los derechos reservados.</p>
        <div className="footer__legal">
          <Link to="/politica-privacidad">Politica de Privacidad</Link>
          <Link to="/terminos-uso">Terminos de Uso</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
