import { useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import About from "../components/About/About";
import Services from "../components/Services/Services";
import Testimonials from "../components/Testimonials/Testimonials";
import Team from "../components/Team/Team";
import Contact from "../components/Contact/Contact";
import Footer from "../components/Footer/Footer";

const Home = () => {
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Testimonials />
      <Team />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
