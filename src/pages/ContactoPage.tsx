import { useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import Contact from "../components/Contact/Contact";

const ContactoPage = () => {
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
                eyebrow="Contacto"
                title="Estamos para ayudarle"
                subtitle="Agende una consulta gratuita y permítanos analizar su caso con la discreción y profesionalismo que usted merece."
                backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
            />
            <Contact />
        </>
    );
};

export default ContactoPage;
