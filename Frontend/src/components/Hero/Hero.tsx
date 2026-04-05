import "./Hero.scss";

const Hero = () => {
  return (
    <section id="inicio" className="hero">
      <div className="hero__overlay" />

      <div className="hero__content section">
        <p className="eyebrow hero__label">Firma legal internacional</p>
        <h1>Excelencia jurídica al servicio de su patrimonio</h1>
        <p className="hero__subtitle">
          Más de dos décadas defendiendo los intereses de personas, empresas y familias
          con compromiso, precisión y resultados medibles en cada jurisdicción.
        </p>

        <div className="hero__actions">
          <a href="#contacto" className="btn">Agendar Consulta Gratuita</a>
          <a href="#servicios" className="hero__secondary">
            Conocer Nuestros Servicios →
          </a>
        </div>

        <div className="hero__trust">
          <div className="hero__trust-item">
            <strong>+500</strong>
            <span>Casos resueltos</span>
          </div>
          <div className="hero__trust-divider" />
          <div className="hero__trust-item">
            <strong>98%</strong>
            <span>Satisfacción</span>
          </div>
          <div className="hero__trust-divider" />
          <div className="hero__trust-item">
            <strong>24/7</strong>
            <span>Disponibilidad</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
