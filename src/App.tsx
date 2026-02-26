import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage";
import NosotrosPage from "./pages/NosotrosPage";
import ServiciosPage from "./pages/ServiciosPage";
import EquipoPage from "./pages/EquipoPage";
import TestimoniosPage from "./pages/TestimoniosPage";
import ContactoPage from "./pages/ContactoPage";
import PoliticaPrivacidadPage from "./pages/PoliticaPrivacidadPage";
import TerminosUsoPage from "./pages/TerminosUsoPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/equipo" element={<EquipoPage />} />
          <Route path="/testimonios" element={<TestimoniosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidadPage />} />
          <Route path="/terminos-uso" element={<TerminosUsoPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
