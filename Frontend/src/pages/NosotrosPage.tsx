import { useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import About from "../components/About/About";

const NosotrosPage = () => {
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
                variant="gold"
                eyebrow="Sobre Nosotros"
                title="Tradición jurídica con visión moderna"
                subtitle="Más de dos décadas combinando rigurosidad académica con un profundo conocimiento práctico del derecho nacional e internacional."
                backgroundImage="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80"
            />
            <About />
        </>
    );
};

export default NosotrosPage;
