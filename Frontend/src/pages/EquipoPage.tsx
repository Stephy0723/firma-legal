import { useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import Team from "../components/Team/Team";

const EquipoPage = () => {
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
                variant="elegant"
                eyebrow="Nuestro Equipo"
                title="Profesionales de excelencia"
                subtitle="Cada miembro aporta una combinación única de experiencia académica, trayectoria profesional y dedicación inquebrantable al cliente."
                backgroundImage="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80"
            />
            <Team />
        </>
    );
};

export default EquipoPage;
