import { useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import "./LegalPages.scss";

const TerminosUsoPage = () => {
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
        title="Términos de Uso"
        subtitle="Reglas y condiciones que regulan el acceso y uso de este sitio web."
        backgroundImage="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80"
      />

      <section className="legal-page section reveal">
        <div className="legal-page__card">
          <p className="legal-page__updated">Última actualización: 26 de febrero de 2026</p>

          <h2>1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar este sitio, usted acepta estos Términos de Uso. Si
            no está de acuerdo con alguna disposición, debe abstenerse de utilizarlo.
          </p>

          <h2>2. Uso permitido</h2>
          <p>
            Este sitio tiene fines informativos sobre nuestros servicios legales. El
            contenido no constituye asesoría jurídica personalizada ni crea una
            relación abogado-cliente por sí solo.
          </p>

          <h2>3. Propiedad intelectual</h2>
          <p>
            Los textos, diseños, marcas y demás elementos del sitio están protegidos
            por derechos de propiedad intelectual y no pueden reproducirse sin
            autorización previa.
          </p>

          <h2>4. Limitación de responsabilidad</h2>
          <p>
            Hacemos esfuerzos razonables para mantener la información actualizada,
            pero no garantizamos ausencia total de errores u omisiones. El uso del
            sitio es bajo su propia responsabilidad.
          </p>

          <h2>5. Enlaces a terceros</h2>
          <p>
            El sitio puede incluir enlaces externos para referencia. No controlamos ni
            asumimos responsabilidad por contenido, políticas o prácticas de sitios
            de terceros.
          </p>

          <h2>6. Modificaciones</h2>
          <p>
            Podemos actualizar estos términos en cualquier momento. Las modificaciones
            serán efectivas desde su publicación en esta página.
          </p>

          <h2>7. Contacto</h2>
          <p>
            Para preguntas sobre estos términos, contáctenos en
            <a href="mailto:contacto@jrlasociados.com"> contacto@jrlasociados.com</a>.
          </p>
        </div>
      </section>
    </>
  );
};

export default TerminosUsoPage;
