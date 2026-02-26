import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./Contact.scss";

const Contact = () => {
  return (
    <section id="contacto" className="contact reveal">
      <div className="section">
        <p className="eyebrow">Contacto</p>
        <h2>Hablemos sobre su caso</h2>
        <p className="contact__intro">
          Cada situación legal es única. Complete el formulario y un miembro de
          nuestro equipo le contactará en las próximas 24 horas para una evaluación
          inicial sin compromiso.
        </p>

        <div className="contact__layout">
          <div className="contact__left">
            <form className="contact__form">
              <div className="contact__row">
                <input type="text" placeholder="Nombre completo" required />
                <input type="tel" placeholder="Teléfono" />
              </div>
              <input type="email" placeholder="Correo electrónico" required />
              <select defaultValue="" className="contact__select">
                <option value="" disabled>
                  Seleccione el área de interés
                </option>
                <option value="civil">Derecho Civil</option>
                <option value="penal">Derecho Penal</option>
                <option value="corporativo">Derecho Corporativo</option>
                <option value="familiar">Derecho Familiar</option>
                <option value="laboral">Derecho Laboral</option>
                <option value="internacional">Derecho Internacional</option>
                <option value="otro">Otro</option>
              </select>
              <textarea placeholder="Describa brevemente su situación..." rows={5} />
              <button type="submit">Solicitar Consulta Gratuita</button>
            </form>
          </div>

          <aside className="contact__right">
            <div className="contact__info">
              <h3>Información de contacto</h3>

              <div className="contact__info-item">
                <FaPhoneAlt className="contact__info-icon" />
                <div>
                  <strong>Teléfono</strong>
                  <p>+1 (809) 555-0123</p>
                </div>
              </div>

              <div className="contact__info-item">
                <FaEnvelope className="contact__info-icon" />
                <div>
                  <strong>Correo electrónico</strong>
                  <p>contacto@jrlasociados.com</p>
                </div>
              </div>

              <div className="contact__info-item">
                <FaMapMarkerAlt className="contact__info-icon" />
                <div>
                  <strong>Oficina principal</strong>
                  <p>
                    Av. Winston Churchill #725, Torre Empresarial, Piso 12,
                    Santo Domingo, RD
                  </p>
                </div>
              </div>

              <div className="contact__info-item">
                <FaClock className="contact__info-icon" />
                <div>
                  <strong>Horario de atención</strong>
                  <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  <p>Sábados: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Google Maps — full width, compact */}
        <div className="contact__map">
          <iframe
            title="Ubicación de JR&L Asuntos Jurídicos"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.3762844559936!2d-69.95243568509423!3d18.473199787432784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf89f1107ea5ab%3A0xd6c587b667e136c3!2sAv.%20Winston%20Churchill%2C%20Santo%20Domingo!5e0!3m2!1ses!2sdo!4v1709000000000!5m2!1ses!2sdo"
            width="100%"
            height="180"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

export default Contact;
