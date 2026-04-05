import { useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import Services from "../components/Services/Services";

const ServiciosPage = () => {
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
                variant="dark"
                eyebrow="Áreas de Práctica"
                title="Servicios legales integrales"
                subtitle="Cobertura completa en las principales ramas del derecho, con un equipo de especialistas dedicados a cada área."
                backgroundImage="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80"
            />
            <Services />
        </>
    );
};

export default ServiciosPage;
