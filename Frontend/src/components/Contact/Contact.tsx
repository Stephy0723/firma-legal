<<<<<<< HEAD
import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./Contact.scss";
import { useData } from "../../context/DataContext";

const Contact = () => {
  const { addMessage } = useData();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage(formData);
    setSubmitted(true);
    setFormData({ name: "", phone: "", email: "", area: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

=======
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./Contact.scss";

const Contact = () => {
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
  return (
    <section id="contacto" className="contact reveal">
      <div className="section">
        <p className="eyebrow">Contacto</p>
        <h2>Hablemos sobre su caso</h2>
        <p className="contact__intro">
<<<<<<< HEAD
          Cada situacion legal es unica. Complete el formulario y un miembro de
          nuestro equipo le contactara en las proximas 24 horas para una evaluacion
=======
          Cada situación legal es única. Complete el formulario y un miembro de
          nuestro equipo le contactará en las próximas 24 horas para una evaluación
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
          inicial sin compromiso.
        </p>

        <div className="contact__layout">
          <div className="contact__left">
<<<<<<< HEAD
            {submitted ? (
              <div className="contact__success-message" style={{ background: 'rgba(74, 114, 96, 0.1)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <h3 style={{ color: '#3a5e4e', marginBottom: '1rem' }}>Mensaje Enviado</h3>
                <p>Gracias por contactarnos. Un miembro de nuestro equipo se pondrá en contacto pronto.</p>
              </div>
            ) : (
              <form className="contact__form" onSubmit={handleSubmit}>
                <div className="contact__row">
                  <input type="text" name="name" placeholder="Nombre completo" required value={formData.name} onChange={handleChange} />
                  <input type="tel" name="phone" placeholder="Telefono" value={formData.phone} onChange={handleChange} />
                </div>
                <input type="email" name="email" placeholder="Correo electronico" required value={formData.email} onChange={handleChange} />
                <select name="area" value={formData.area} onChange={handleChange} className="contact__select">
                  <option value="" disabled>Seleccione el area de interes</option>
                  <option value="civil">Derecho Civil</option>
                  <option value="penal">Derecho Penal</option>
                  <option value="corporativo">Derecho Corporativo</option>
                  <option value="familiar">Derecho Familiar</option>
                  <option value="laboral">Derecho Laboral</option>
                  <option value="internacional">Derecho Internacional</option>
                  <option value="otro">Otro</option>
                </select>
                <textarea name="message" placeholder="Describa brevemente su situacion..." rows={5} required value={formData.message} onChange={handleChange} />
                <button type="submit">Solicitar Consulta Gratuita</button>
              </form>
            )}
=======
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
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
          </div>

          <aside className="contact__right">
            <div className="contact__info">
<<<<<<< HEAD
              <h3>Informacion de contacto</h3>
=======
              <h3>Información de contacto</h3>
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db

              <div className="contact__info-item">
                <FaPhoneAlt className="contact__info-icon" />
                <div>
<<<<<<< HEAD
                  <strong>Telefonos</strong>
                  <p>+1 (849)-245-7806</p>
                  <p>+1 (829)-594-0564</p>
=======
                  <strong>Teléfono</strong>
                  <p>+1 (809) 555-0123</p>
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
                </div>
              </div>

              <div className="contact__info-item">
                <FaEnvelope className="contact__info-icon" />
                <div>
<<<<<<< HEAD
                  <strong>Correo electronico</strong>
                  <p>jrylinversiones@gmail.com</p>
=======
                  <strong>Correo electrónico</strong>
                  <p>contacto@jrlasociados.com</p>
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
                </div>
              </div>

              <div className="contact__info-item">
                <FaMapMarkerAlt className="contact__info-icon" />
                <div>
                  <strong>Oficina principal</strong>
                  <p>
<<<<<<< HEAD
                    Avenida Venezuela No. 113, Segundo Nivel, Ensanche Ozama,
                    Santo Domingo Este, Provincia Santo Domingo
=======
                    Av. Winston Churchill #725, Torre Empresarial, Piso 12,
                    Santo Domingo, RD
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
                  </p>
                </div>
              </div>

              <div className="contact__info-item">
                <FaClock className="contact__info-icon" />
                <div>
<<<<<<< HEAD
                  <strong>Horario de atencion</strong>
                  <p>Lunes - Viernes: 8:00 am - 6:00 pm</p>
                  <p>Sabados: 8:30 am - 1:00 pm</p>
=======
                  <strong>Horario de atención</strong>
                  <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  <p>Sábados: 9:00 AM - 1:00 PM</p>
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
                </div>
              </div>
            </div>
          </aside>
        </div>

<<<<<<< HEAD
        <div className="contact__map">
          <iframe
            title="Ubicacion de JR&L Asuntos Juridicos"
            src="https://www.google.com/maps?q=Avenida+Venezuela+113+Ensanche+Ozama+Santo+Domingo+Este&output=embed"
            width="100%"
            height="180"
            style={{ border: 0, borderRadius: "12px" }}
=======
        {/* Google Maps — full width, compact */}
        <div className="contact__map">
          <iframe
            title="Ubicación de JR&L Asuntos Jurídicos"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.3762844559936!2d-69.95243568509423!3d18.473199787432784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf89f1107ea5ab%3A0xd6c587b667e136c3!2sAv.%20Winston%20Churchill%2C%20Santo%20Domingo!5e0!3m2!1ses!2sdo!4v1709000000000!5m2!1ses!2sdo"
            width="100%"
            height="180"
            style={{ border: 0, borderRadius: '12px' }}
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db
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
