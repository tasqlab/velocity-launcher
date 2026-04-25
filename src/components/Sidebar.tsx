import { 
  Home, 
  Package, 
  Server, 
  Shirt, 
  Settings,
  User,
  Play,
  Plus
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { View } from '../types';

interface NavItem {
  id: View;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: <Home size={20} />, label: 'Home' },
  { id: 'instances', icon: <Package size={20} />, label: 'Modpacks' },
  { id: 'servers', icon: <Server size={20} />, label: 'Servers' },
  { id: 'skins', icon: <Shirt size={20} />, label: 'Skins' },
];

export function Sidebar() {
  const { currentView, setView, accounts, activeAccount, instances, selectedInstance } = useAppStore();
  const activeAcc = accounts.find((a) => a.id === activeAccount);
  const selectedInst = instances.find((i) => i.id === selectedInstance);

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">V</div>
          <div className="sidebar-brand-text">
            <h2>Velocity</h2>
            <p>Launcher</p>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="card p-3 flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
            {activeAcc?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {activeAcc?.username || 'No Account'}
            </p>
            <p className="text-small">
              {activeAcc ? 'Microsoft Account' : 'Click to sign in'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-title">Menu</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        {/* Quick Launch Section */}
        {selectedInst && (
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="sidebar-section-title">Quick Launch</p>
            <button className="btn btn-primary w-full mt-2">
              <Play size={18} fill="currentColor" />
              <span>Play {selectedInst.name}</span>
            </button>
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <button onClick={() => setView('instances')} className="nav-item">
          <Plus size={18} />
          <span>Create Instance</span>
        </button>
        <button 
          onClick={() => setView('settings')} 
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
