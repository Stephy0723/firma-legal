import { useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import "./LegalPages.scss";

const PoliticaPrivacidadPage = () => {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".reveal");
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <PageHeader
        variant="minimal"
        eyebrow="Legal"
        title="Política de Privacidad"
        subtitle="Conozca cómo recopilamos, utilizamos y protegemos su información personal en nuestra firma."
        backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="legal-page section reveal">
        <div className="legal-page__card">
          <p className="legal-page__updated">Última actualización: 26 de febrero de 2026</p>

          <h2>1. Información que recopilamos</h2>
          <p>
            Recopilamos los datos que usted nos facilita de forma voluntaria al
            contactarnos, solicitar asesoría o contratar nuestros servicios,
            incluyendo nombre, correo electrónico, teléfono y datos necesarios para
            la gestión de su caso.
          </p>

          <h2>2. Finalidad del tratamiento</h2>
          <p>
            Utilizamos la información para responder consultas, prestar servicios
            legales, cumplir obligaciones contractuales y legales, mejorar la
            experiencia del sitio y mantener comunicaciones relacionadas con su caso.
          </p>

          <h2>3. Base legal y conservación</h2>
          <p>
            Tratamos sus datos en cumplimiento de obligaciones legales, ejecución de
            contratos y, cuando aplique, sobre la base de su consentimiento. Los
            datos se conservan durante el tiempo estrictamente necesario para cumplir
            dichas finalidades o por los plazos exigidos por la normativa aplicable.
          </p>

          <h2>4. Compartición de datos</h2>
          <p>
            No vendemos su información personal. Solo compartimos datos con terceros
            cuando sea indispensable para la prestación del servicio, por mandato
            legal o con su autorización expresa.
          </p>

          <h2>5. Seguridad de la información</h2>
          <p>
            Aplicamos medidas técnicas y organizativas razonables para proteger su
            información frente a acceso no autorizado, alteración, divulgación o
            pérdida.
          </p>

          <h2>6. Sus derechos</h2>
          <p>
            Usted puede solicitar acceso, actualización, corrección o eliminación de
            sus datos personales, así como limitar u oponerse a determinados
            tratamientos cuando la ley lo permita.
          </p>

          <h2>7. Contacto</h2>
          <p>
            Para consultas relacionadas con privacidad, puede escribirnos a
            <a href="mailto:contacto@jrlasociados.com"> contacto@jrlasociados.com</a>.
          </p>
        </div>
      </section>
    </>
  );
};

export default PoliticaPrivacidadPage;
