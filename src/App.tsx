// GENY LAB — Main App Entry
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Onboarding from './pages/Onboarding';
import AppLayout from './pages/app/AppLayout';
import PathMap from './pages/app/PathMap';
import LessonScreen from './pages/app/LessonScreen';
import Achievements from './pages/app/Achievements';

import { GastosHormiga } from './pages/app/GastosHormiga';
import RetoADN from './pages/app/RetoADN';
import TrampasDinero from './pages/app/TrampasDinero';
import RetoSombra from './pages/app/RetoSombra';
import RetoFlow from './pages/app/RetoFlow';
import GenyOpciones from './pages/app/GenyOpciones';
import MiPrimerPedem from './pages/app/pedem/MiPrimerPedem';
import TermostatoFinanciero from './pages/app/termostato-financiero/TermostatoFinanciero';

function App() {
  const isOnboarded = localStorage.getItem('geny_lab_onboarded') === 'true';

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
        {/* Onboarding — shown once */}
        <Route
          path="/"
          element={isOnboarded ? <Navigate to="/app" replace /> : <Onboarding />}
        />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Main App — gamified experience */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<PathMap />} />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
