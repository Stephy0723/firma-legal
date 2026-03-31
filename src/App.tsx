import React from 'react';
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
import { Outlet } from "react-router-dom";

// Admin Imports
import AdminLayoutV2 from "./components/Admin/AdminLayoutV2/AdminLayoutV2";
import AdminDashboardV2 from "./pages/Admin/Dashboard/AdminDashboardV2";
import AdminInbox from "./pages/Admin/Inbox/AdminInbox";
import AdminAppointments from "./pages/Admin/Appointments/AdminAppointments";
import AdminDocuments from "./pages/Admin/Documents/AdminDocuments";
import AdminServices from "./pages/Admin/CMS/AdminServices";
import AdminTeam from "./pages/Admin/CMS/AdminTeam";
import AdminLogin from "./pages/Admin/Login/AdminLogin";
import AdminClients from "./pages/Admin/Clients/AdminClients";
import AdminCases from "./pages/Admin/Cases/AdminCases";
import AdminProfile from "./pages/Admin/Profile/AdminProfile";
import AdminSettings from "./pages/Admin/Settings/AdminSettings";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem('crm_auth') === 'true';
  const loginTime = localStorage.getItem('crm_auth_time');
  
  // 2 hours in milliseconds: 2 * 60 * 60 * 1000 = 7200000
  const isExpired = loginTime ? (Date.now() - parseInt(loginTime)) > 7200000 : true;

  if (!isAuth || isExpired) {
    if (isExpired) {
      localStorage.removeItem('crm_auth');
      localStorage.removeItem('crm_auth_time');
    }
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const PublicLayout = () => (
  <>
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/equipo" element={<EquipoPage />} />
          <Route path="/testimonios" element={<TestimoniosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidadPage />} />
          <Route path="/terminos-uso" element={<TerminosUsoPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="login" element={<AdminLogin />} />
          
          <Route element={<RequireAuth><AdminLayoutV2 /></RequireAuth>}>
            <Route index element={<AdminDashboardV2 />} />
            <Route path="inbox" element={<AdminInbox />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="cases" element={<AdminCases />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
