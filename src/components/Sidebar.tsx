import { useAppStore } from '../stores/appStore';
import type { View } from '../types';

const navItems: { id: View; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z' },
  { id: 'instances', label: 'Instances', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'mods', label: 'Mods', icon: 'M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z' },
  { id: 'servers', label: 'Servers', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  { id: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.5-4.5a7.5 7.5 0 0 0-1-1.8l1.4-2.5-2.2-2.2-2.5 1.4a7.5 7.5 0 0 0-1.8-1L12 1.5h-3l-.9 2.7a7.5 7.5 0 0 0-1.8 1L3.8 4.8 1.6 7l1.4 2.5a7.5 7.5 0 0 0-1 1.8L.5 12v3l2.7.9a7.5 7.5 0 0 0 1 1.8l-1.4 2.5 2.2 2.2 2.5-1.4a7.5 7.5 0 0 0 1.8 1L9 22.5h3l.9-2.7a7.5 7.5 0 0 0 1.8-1l2.5 1.4 2.2-2.2-1.4-2.5a7.5 7.5 0 0 0 1-1.8l2.7-.9v-3l-2.7-.9z' },
];

export function Sidebar() {
  const { currentView, setView, accounts, activeAccount } = useAppStore();
  const activeAcc = accounts.find((a) => a.id === activeAccount);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-cube">
          <div className="cube-face cube-top" />
        </div>
        <div>
          <div className="logo-text">VELOCITY</div>
          <div className="logo-sub">Launcher</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-label">Navigation</div>
      
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`nav-item ${currentView === item.id ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
          </div>
          {item.label}
        </button>
      ))}

      {/* User Card */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">
            <div className="avatar-pixel px-a" />
            <div className="avatar-pixel px-b" />
            <div className="avatar-pixel px-c" />
            <div className="avatar-pixel px-d" />
          </div>
          <div className="user-info">
            <div className="user-name">{activeAcc?.username || 'Guest'}</div>
            <div className="user-status">
              <span className="status-dot" />
              {activeAcc ? 'Online' : 'Offline'}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,253,244,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
