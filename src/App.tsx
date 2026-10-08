import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LangProvider } from "./i18n";
import { TransitionProvider } from "./components/transition";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Firm from "./pages/Firm";
import Practice from "./pages/Practice";
import PracticeDetail from "./pages/PracticeDetail";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import { initGlobal } from "./motion";
import { runLoader } from "./loader";

function Pages() {
  const { pathname } = useLocation();
  return (
    <main id="top" key={pathname}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/firma" element={<Firm />} />
        <Route path="/practica" element={<Practice />} />
        <Route path="/practica/:slug" element={<PracticeDetail />} />
        <Route path="/equipo" element={<Team />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default function App() {
  useEffect(() => { initGlobal(); runLoader(); }, []);
  return (
    <HashRouter>
      <LangProvider>
        <TransitionProvider>
          <div id="loader" aria-hidden="true">
            <div className="ld-inner">
              <div className="ld-word"><span>Steliant</span></div>
              <div className="ld-bar"><i /></div>
              <div className="mono ld-count">000</div>
            </div>
          </div>
          <div className="cursor" aria-hidden="true" />
          <div className="cursor-dot" aria-hidden="true" />
          <Nav />
          <Pages />
          <Footer />
          <div className="toast" id="toast" role="status" />
        </TransitionProvider>
      </LangProvider>
    </HashRouter>
  );
}
