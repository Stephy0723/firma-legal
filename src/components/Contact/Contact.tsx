import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./Contact.scss";

const Contact = () => {
  return (
    <section id="contacto" className="contact reveal">
      <div className="section">
        <p className="eyebrow">Contacto</p>
        <h2>Hablemos sobre su caso</h2>
        <p className="contact__intro">
          Cada situacion legal es unica. Complete el formulario y un miembro de
          nuestro equipo le contactara en las proximas 24 horas para una evaluacion
          inicial sin compromiso.
        </p>

        <div className="contact__layout">
          <div className="contact__left">
            <form className="contact__form">
              <div className="contact__row">
                <input type="text" placeholder="Nombre completo" required />
                <input type="tel" placeholder="Telefono" />
              </div>
              <input type="email" placeholder="Correo electronico" required />
              <select defaultValue="" className="contact__select">
                <option value="" disabled>
                  Seleccione el area de interes
                </option>
                <option value="civil">Derecho Civil</option>
                <option value="penal">Derecho Penal</option>
                <option value="corporativo">Derecho Corporativo</option>
                <option value="familiar">Derecho Familiar</option>
                <option value="laboral">Derecho Laboral</option>
                <option value="internacional">Derecho Internacional</option>
                <option value="otro">Otro</option>
              </select>
              <textarea placeholder="Describa brevemente su situacion..." rows={5} />
              <button type="submit">Solicitar Consulta Gratuita</button>
            </form>
          </div>

          <aside className="contact__right">
            <div className="contact__info">
              <h3>Informacion de contacto</h3>

              <div className="contact__info-item">
                <FaPhoneAlt className="contact__info-icon" />
                <div>
                  <strong>Telefonos</strong>
                  <p>+1 (849)-245-7806</p>
                  <p>+1 (829)-594-0564</p>
                </div>
              </div>

              <div className="contact__info-item">
                <FaEnvelope className="contact__info-icon" />
                <div>
                  <strong>Correo electronico</strong>
                  <p>jrylinversiones@gmail.com</p>
                </div>
              </div>

              <div className="contact__info-item">
                <FaMapMarkerAlt className="contact__info-icon" />
                <div>
                  <strong>Oficina principal</strong>
                  <p>
                    Avenida Venezuela No. 113, Segundo Nivel, Ensanche Ozama,
                    Santo Domingo Este, Provincia Santo Domingo
                  </p>
                </div>
              </div>

              <div className="contact__info-item">
                <FaClock className="contact__info-icon" />
                <div>
                  <strong>Horario de atencion</strong>
                  <p>Lunes - Viernes: 8:00 am - 6:00 pm</p>
                  <p>Sabados: 8:30 am - 1:00 pm</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="contact__map">
          <iframe
            title="Ubicacion de JR&L Asuntos Juridicos"
            src="https://www.google.com/maps?q=Avenida+Venezuela+113+Ensanche+Ozama+Santo+Domingo+Este&output=embed"
            width="100%"
            height="180"
            style={{ border: 0, borderRadius: "12px" }}
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
