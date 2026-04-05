import { FaBalanceScale, FaHandshake } from "react-icons/fa";
import "./About.scss";

const About = () => {
  return (
    <section id="nosotros" className="about reveal">
      <div className="about__container section">
        <div className="about__image">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
            alt="Equipo de abogados en reunión estratégica"
          />
        </div>

        <div className="about__content">
          <p className="eyebrow">Sobre Nosotros</p>
          <h2>Tradición jurídica con visión moderna</h2>
          <p>
            Fundada en 2004, JR&L Asuntos Jurídicos nació con la misión de brindar asesoría
            legal integral de primer nivel. Nuestro equipo combina la rigurosidad
            académica con un profundo conocimiento práctico del derecho nacional e
            internacional.
          </p>
          <p>
            Nos distinguimos por un enfoque personalizado: cada caso recibe la
            atención de un equipo multidisciplinario que diseña estrategias a la
            medida, garantizando soluciones efectivas y resultados tangibles para
            nuestros clientes.
          </p>

          <div className="about__values">
            <div className="about__value">
              <span className="about__value-icon">
                <FaBalanceScale />
              </span>
              <div>
                <h4>Integridad</h4>
                <p>Ética profesional como pilar fundamental de cada actuación.</p>
              </div>
            </div>
            <div className="about__value">
              <span className="about__value-icon">
                <FaHandshake />
              </span>
              <div>
                <h4>Compromiso</h4>
                <p>Dedicación absoluta hacia los intereses de nuestros clientes.</p>
              </div>
            </div>
          </div>

          <div className="about__stats">
            <div>
              <h3>+500</h3>
              <span>Casos exitosos</span>
            </div>
            <div>
              <h3>98%</h3>
              <span>Tasa de satisfacción</span>
            </div>
            <div>
              <h3>20+</h3>
              <span>Años de experiencia</span>
            </div>
            <div>
              <h3>15</h3>
              <span>Abogados especializados</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
