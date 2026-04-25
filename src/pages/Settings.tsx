import { useState } from 'react';
import { 
  Monitor, 
  Cpu, 
  Palette, 
  Bell, 
  Download, 
  User, 
  Shield,
  ChevronRight,
  FolderOpen,
  Globe
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';

type SettingsTab = 'general' | 'java' | 'appearance' | 'accounts' | 'downloads';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { settings, updateSettings, accounts, activeAccount, setActiveAccount } = useAppStore();

  const tabs = [
    { id: 'general', icon: <Monitor size={18} />, label: 'General' },
    { id: 'java', icon: <Cpu size={18} />, label: 'Java & Performance' },
    { id: 'appearance', icon: <Palette size={18} />, label: 'Appearance' },
    { id: 'accounts', icon: <User size={18} />, label: 'Accounts' },
    { id: 'downloads', icon: <Download size={18} />, label: 'Downloads' },
  ];

  const handleMemoryChange = (type: 'min' | 'max', value: number) => {
    updateSettings({
      memory: { ...settings.memory, [type]: value }
    });
  };

  return (
    <div className="h-full flex animate-fade-in">
      {/* Sidebar */}
      <div className="w-56 border-r border-white/5 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Settings
        </h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">General Settings</h3>
              <p className="text-gray-400">Configure launcher behavior and preferences</p>
            </div>

            {/* Launch Settings */}
            <section className="glass-panel p-5">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Monitor size={18} className="text-emerald-400" />
                Launch Settings
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Keep launcher open</p>
                    <p className="text-sm text-gray-400">Don&apos;t close launcher when starting game</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Minimize to tray</p>
                    <p className="text-sm text-gray-400">Minimize to system tray when closing</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.minimizeToTray}
                      onChange={(e) => updateSettings({ minimizeToTray: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Discord Rich Presence</p>
                    <p className="text-sm text-gray-400">Show game status in Discord</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.discordRPC}
                      onChange={(e) => updateSettings({ discordRPC: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Resolution Settings */}
            <section className="glass-panel p-5">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Monitor size={18} className="text-emerald-400" />
                Default Resolution
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Width</label>
                  <input
                    type="number"
                    value={settings.resolution.width}
                    onChange={(e) => updateSettings({ 
                      resolution: { ...settings.resolution, width: parseInt(e.target.value) || 1920 }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Height</label>
                  <input
                    type="number"
                    value={settings.resolution.height}
                    onChange={(e) => updateSettings({ 
                      resolution: { ...settings.resolution, height: parseInt(e.target.value) || 1080 }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.resolution.fullscreen}
                  onChange={(e) => updateSettings({ 
                    resolution: { ...settings.resolution, fullscreen: e.target.checked }
                  })}
                  className="checkbox-velocity"
                />
                <span className="text-white">Launch in fullscreen</span>
              </label>
            </section>
          </div>
        )}

        {activeTab === 'java' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Java & Performance</h3>
              <p className="text-gray-400">Configure JVM arguments and memory allocation</p>
            </div>

            {/* Memory Settings */}
            <section className="glass-panel p-5">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Cpu size={18} className="text-emerald-400" />
                Memory Allocation
              </h4>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">Minimum Memory (MB)</label>
                    <span className="text-sm font-medium text-emerald-400">{settings.memory.min} MB</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="4096"
                    step="128"
                    value={settings.memory.min}
                    onChange={(e) => handleMemoryChange('min', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">Maximum Memory (MB)</label>
                    <span className="text-sm font-medium text-emerald-400">{settings.memory.max} MB</span>
                  </div>
                  <input
                    type="range"
                    min="1024"
                    max="32768"
                    step="512"
                    value={settings.memory.max}
                    onChange={(e) => handleMemoryChange('max', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <p className="text-sm text-emerald-400">
                  💡 Tip: Allocate 4-8GB for modded instances, 2-4GB for vanilla
                </p>
              </div>
            </section>

            {/* JVM Arguments */}
            <section className="glass-panel p-5">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Cpu size={18} className="text-emerald-400" />
                JVM Arguments
              </h4>
              
              <div className="space-y-3">
                {settings.jvmArgs.map((arg, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={arg}
                      onChange={(e) => {
                        const newArgs = [...settings.jvmArgs];
                        newArgs[index] = e.target.value;
                        updateSettings({ jvmArgs: newArgs });
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      onClick={() => {
                        const newArgs = settings.jvmArgs.filter((_, i) => i !== index);
                        updateSettings({ jvmArgs: newArgs });
                      }}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateSettings({ jvmArgs: [...settings.jvmArgs, ''] })}
                  className="w-full py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors text-sm"
                >
                  + Add JVM Argument
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Appearance</h3>
              <p className="text-gray-400">Customize the look and feel of the launcher</p>
            </div>

            <section className="glass-panel p-5">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Palette size={18} className="text-emerald-400" />
                Theme Settings
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Glassmorphism Effects</p>
                    <p className="text-sm text-gray-400">Enable blur and transparency effects</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.glassmorphism}
                      onChange={(e) => updateSettings({ glassmorphism: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Accent Color</label>
                  <div className="flex gap-3">
                    {['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSettings({ accentColor: color })}
                        className={`w-10 h-10 rounded-xl transition-all ${
                          settings.accentColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Accounts</h3>
              <p className="text-gray-400">Manage your Minecraft accounts</p>
            </div>

            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`glass-card p-4 flex items-center gap-4 ${
                    activeAccount === account.id ? 'ring-1 ring-emerald-500/50' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {account.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{account.username}</p>
                    <p className="text-sm text-gray-400">
                      {account.type === 'microsoft' ? 'Microsoft Account' : 'Offline Account'}
                    </p>
                  </div>
                  {activeAccount === account.id ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveAccount(account.id)}
                      className="glass-button px-4 py-2 text-sm"
                    >
                      Switch
                    </button>
                  )}
                </div>
              ))}

              <button className="w-full glass-card p-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <User size={18} />
                Add Microsoft Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'downloads' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Downloads</h3>
              <p className="text-gray-400">Configure download settings</p>
            </div>

            <section className="glass-panel p-5">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Download size={18} className="text-emerald-400" />
                Download Settings
              </h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">Concurrent Downloads</label>
                    <span className="text-sm font-medium text-emerald-400">{settings.downloadThreads}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={settings.downloadThreads}
                    onChange={(e) => updateSettings({ downloadThreads: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Instance Path</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.instancePath || 'Default'}
                      readOnly
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm"
                    />
                    <button className="glass-button px-4 py-2.5">
                      <FolderOpen size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
