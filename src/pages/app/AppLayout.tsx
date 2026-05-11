// Trader Mapp — App Layout with Bottom Tab Bar

import { NavLink, Outlet } from 'react-router-dom';
import { Map, Trophy, MessageCircle } from 'lucide-react';

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Page content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Bottom Tab Bar — Duolingo style */}
      <nav className="tab-bar">
        <NavLink
          to="/app"
          end
          className={({ isActive }) => `tab-bar-item ${isActive ? 'active' : ''}`}
        >
          <Map size={24} />
          <span>Camino</span>
        </NavLink>

        <NavLink
          to="/app/logros"
          className={({ isActive }) => `tab-bar-item ${isActive ? 'active' : ''}`}
        >
          <Trophy size={24} />
          <span>Logros</span>
        </NavLink>

        <a
          href="https://wa.me/5215512345678"
          target="_blank"
          rel="noopener noreferrer"
          className="tab-bar-item"
        >
          <MessageCircle size={24} />
          <span>Soporte</span>
        </a>
      </nav>
    </div>
  );
}
