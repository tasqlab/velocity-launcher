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
    <div className="w-64 h-full glass-sidebar flex flex-col">
      {/* Account Section */}
      <div className="p-4 border-b border-white/5">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
            {activeAcc?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {activeAcc?.username || 'No Account'}
            </p>
            <p className="text-xs text-gray-400">
              {activeAcc ? 'Microsoft Account' : 'Click to sign in'}
            </p>
          </div>
          <button 
            onClick={() => setView('settings')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <User size={16} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === item.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* Quick Launch Section */}
        {selectedInst && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Quick Launch
            </p>
            <button className="w-full glass-button-primary py-3 flex items-center justify-center gap-2">
              <Play size={18} fill="currentColor" />
              <span>Play {selectedInst.name}</span>
            </button>
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button
          onClick={() => setView('instances')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <Plus size={18} />
          <span className="text-sm">Create Instance</span>
        </button>
        <button
          onClick={() => setView('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
            currentView === 'settings'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
}
