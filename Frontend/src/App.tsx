import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { syncAdminWorkspaceSettingsFromAPI } from "./utils/adminWorkspace";
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
import LoginPage from "./admin/pages/login/LoginPage";
import RegisterPage from "./admin/pages/register/RegisterPage";
import DashboardPage from "./admin/pages/dashboard/DashboardPage";
import { AdminThemeProvider } from "./admin/theme/AdminThemeContext";
import AdminLayout from "./admin/layout/AdminLayout";
import DocumentsPage from "./admin/pages/documents/DocumentsPage";
import NotificationsPage from "./admin/pages/notifications/NotificationsPage";
import SettingsPage from "./admin/pages/settings/SettingsPage";
import ServicesPage from "./admin/pages/services/ServicesPage";
import TeamPage from "./admin/pages/team/TeamPage";
import ClientsPage from "./admin/pages/clients/ClientsPage";
import CasesPage from "./admin/pages/cases/CasesPage";
import AppointmentsPage from "./admin/pages/appointments/AppointmentsPage";
import InboxPage from "./admin/pages/inbox/InboxPage";
import ExpedientePage from "./admin/pages/expedientes/ExpedientePage";
import "./admin/styles/admin.scss";

const PublicLayout = () => (
  <>
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);

const PrivateAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("admin_auth") === "true";
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  useEffect(() => { syncAdminWorkspaceSettingsFromAPI(); }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AdminThemeProvider>
        <ScrollToTop />
        <Routes>
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

          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={(
              <PrivateAdminRoute>
                <AdminLayout />
              </PrivateAdminRoute>
            )}
          >
            <Route index element={<DashboardPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="expedientes" element={<ExpedientePage />} />
            <Route path="expedientes/:id" element={<ExpedientePage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AdminThemeProvider>
    </BrowserRouter>
  );
}

export default App;
