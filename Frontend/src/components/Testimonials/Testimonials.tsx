import { FaQuoteLeft, FaStar } from "react-icons/fa";
import "./Testimonials.scss";

const testimonials = [
    {
        quote:
            "JR&L manejó nuestro caso corporativo con una precisión y profesionalismo excepcionales. Su equipo nos guió en cada paso del proceso, logrando un resultado que superó nuestras expectativas.",
        author: "María Elena Rodríguez",
        role: "CEO, Grupo Inversiones del Caribe",
        image:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
        rating: 5,
    },
    {
        quote:
            "Cuando enfrentamos una disputa legal compleja, el Dr. Méndez y su equipo demostraron una capacidad estratégica impresionante. Recomiendo esta firma sin reservas a cualquier persona que busque excelencia jurídica.",
        author: "Roberto Jiménez Alcántara",
        role: "Director Ejecutivo, Capital Holdings",
        image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        rating: 5,
    },
    {
        quote:
            "Durante un proceso familiar delicado, la Dra. Gómez trató nuestro caso con total sensibilidad y firmeza. Su asesoría fue determinante para alcanzar un acuerdo justo para todas las partes.",
        author: "Ana Gabriela Torres",
        role: "Arquitecta y Empresaria",
        image:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        rating: 5,
    },
];

const Testimonials = () => {
    return (
        <section id="testimonios" className="testimonials section reveal">
            <p className="eyebrow">Testimonios</p>
            <h2>Lo que dicen nuestros clientes</h2>
            <p className="testimonials__intro">
                La confianza de nuestros clientes es nuestro mayor reconocimiento. Estas son
                algunas de las experiencias de quienes han confiado en nosotros.
            </p>

            <div className="testimonials__grid">
                {testimonials.map((t, index) => (
                    <article className="testimonial-card" key={index}>
                        <FaQuoteLeft className="testimonial-card__quote-icon" />
                        <div className="testimonial-card__stars">
                            {Array.from({ length: t.rating }).map((_, i) => (
                                <FaStar key={i} />
                            ))}
                        </div>
                        <p className="testimonial-card__text">{t.quote}</p>
                        <div className="testimonial-card__author">
                            <img src={t.image} alt={t.author} />
                            <div>
                                <strong>{t.author}</strong>
                                <span>{t.role}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
