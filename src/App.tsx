// GENY LAB — Main App Entry
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import AppLayout from './pages/app/AppLayout';
import PathMap from './pages/app/PathMap';
import LessonScreen from './pages/app/LessonScreen';
import Achievements from './pages/app/Achievements';
import AuthGuard from './components/AuthGuard';
import SharedResult from './pages/public/SharedResult';
import InlineResult from './pages/public/InlineResult';
import PublicResultsView from './pages/public/PublicResultsView';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWebhooks from './pages/admin/AdminWebhooks';
import AdminSettings from './pages/admin/AdminSettings';

import { GastosHormiga } from './pages/app/GastosHormiga';
import RetoADN from './pages/app/RetoADN';
import TrampasDinero from './pages/app/TrampasDinero';
import RetoSombra from './pages/app/RetoSombra';
import RetoFlow from './pages/app/RetoFlow';
import GenyOpciones from './pages/app/GenyOpciones';
import DiagnosticoBooking from './pages/app/DiagnosticoBooking';
import MiPrimerPedem from './pages/app/pedem/MiPrimerPedem';
import TermostatoFinanciero from './pages/app/termostato-financiero/TermostatoFinanciero';
import AccountPage from './pages/app/AccountPage';
import AutoLogin from './pages/AutoLogin';
import ResetPassword from './pages/ResetPassword';
import InscripcionExitosa from './pages/public/InscripcionExitosa';
import EstablecerContrasena from './pages/public/EstablecerContrasena';
import SalesLanding from './pages/public/SalesLanding';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-body)',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/compartir/:shareCode" element={<SharedResult />} />
        <Route path="/resultado/:data" element={<InlineResult />} />
        <Route path="/acceso/:code" element={<AutoLogin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/inscripcion-exitosa" element={<InscripcionExitosa />} />
        <Route path="/establecer-contrasena" element={<EstablecerContrasena />} />
        <Route path="/resultados/:userId" element={<PublicResultsView />} />

        {/* App Routes */}
        <Route path="/app" element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<PathMap />} />
          <Route path="cuenta" element={<AccountPage />} />
          <Route path="leccion/:lessonId" element={<LessonScreen />} />
          <Route path="logros" element={<Achievements />} />
          
          {/* Micro-apps */}
          <Route path="gastos" element={<GastosHormiga />} />
          <Route path="adn" element={<RetoADN />} />
          <Route path="trampas" element={<TrampasDinero />} />
          <Route path="sombra" element={<RetoSombra />} />
          <Route path="flow" element={<RetoFlow />} />
          <Route path="termostato" element={<TermostatoFinanciero />} />
          <Route path="pedem" element={<MiPrimerPedem />} />
          <Route path="geny-opciones" element={<GenyOpciones />} />
        </Route>

        {/* Standalone authenticated pages (no tab bar) */}
        <Route path="/app/diagnostico" element={<AuthGuard><DiagnosticoBooking /></AuthGuard>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="webhooks" element={<AdminWebhooks />} />
          <Route path="configuracion" element={<AdminSettings />} />
        </Route>

        {/* Root — Sales Landing Page */}
        <Route path="/" element={<SalesLanding />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
