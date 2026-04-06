import { useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import Testimonials from "../components/Testimonials/Testimonials";

const TestimoniosPage = () => {
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
                variant="gradient"
                eyebrow="Testimonios"
                title="Lo que dicen nuestros clientes"
                subtitle="La confianza de nuestros clientes es nuestro mayor reconocimiento y nuestra motivación constante."
                backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80"
            />
            <Testimonials />
        </>
    );
};

export default TestimoniosPage;
