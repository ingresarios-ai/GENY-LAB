// Trader Mapp — Main App Entry
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Onboarding from './pages/Onboarding';
import AppLayout from './pages/app/AppLayout';
import PathMap from './pages/app/PathMap';
import LessonScreen from './pages/app/LessonScreen';
import Achievements from './pages/app/Achievements';

function App() {
  const isOnboarded = localStorage.getItem('trader_mapp_onboarded') === 'true';

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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
