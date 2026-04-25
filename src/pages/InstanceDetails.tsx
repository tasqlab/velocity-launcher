import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';

interface Mod {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  download_url: string;
  minecraft_version: string;
  mod_loader: string;
  category: string;
  downloads: number;
  file_size: number;
}

interface InstanceStatus {
  instance_id: string;
  status: string;
  pid: number | null;
  start_time: number | null;
  play_time_seconds: number;
  last_crash_log: string | null;
}

interface InstanceInfo {
  mods_count: number;
  resourcepacks_count: number;
  saves_count: number;
  has_crash_reports: boolean;
}

export function InstanceDetails() {
  const { instances, selectedInstance, selectInstance, setView } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'mods' | 'settings' | 'logs'>('overview');
  const [status, setStatus] = useState<InstanceStatus | null>(null);
  const [info, setInfo] = useState<InstanceInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [installedMods, setInstalledMods] = useState<Mod[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [ramAllocation, setRamAllocation] = useState(4);
  const [javaPath, setJavaPath] = useState('java');
  const [jvmArgs, setJvmArgs] = useState('');
  const [resolution, setResolution] = useState('1920x1080');

  const instance = instances.find(i => i.id === selectedInstance);

  useEffect(() => {
    if (instance) {
      loadInstanceData();
    }
  }, [instance]);

  const loadInstanceData = async () => {
    if (!instance) return;
    
    // Load status
    try {
      const s = await invoke<InstanceStatus>('get_instance_status', { instanceId: instance.id });
      setStatus(s);
    } catch (e) {
      console.error('Failed to load status:', e);
    }

    // Load info
    try {
      const i = await invoke<InstanceInfo>('get_instance_info', { instancePath: instance.path });
      setInfo(i);
    } catch (e) {
      console.error('Failed to load info:', e);
    }

    // Load logs
    try {
      const l = await invoke<string[]>('get_instance_logs', { instancePath: instance.path, lines: 100 });
      setLogs(l);
    } catch (e) {
      console.error('Failed to load logs:', e);
    }

    // Load installed mods
    try {
      const m = await invoke<Mod[]>('get_installed_mods', { instancePath: instance.path });
      setInstalledMods(m);
    } catch (e) {
      console.error('Failed to load mods:', e);
    }

    // Load instance settings
    setRamAllocation(Math.round(instance.memory.max / 1024));
  };

  const searchMods = async () => {
    if (!instance) return;
    setLoading(true);
    try {
      const result = await invoke<{ mods: Mod[] }>('search_mods', {
        query: searchQuery,
        gameVersion: instance.version.slice(0, 4),
        modLoader: instance.modLoader
      });
      setMods(result.mods);
    } catch (e) {
      console.error('Failed to search mods:', e);
    } finally {
      setLoading(false);
    }
  };

  const installMod = async (mod: Mod) => {
    if (!instance) return;
    setInstalling(mod.id);
    try {
      await invoke('install_mod', {
        instancePath: instance.path,
        modId: mod.id,
        modInfo: mod
      });
      await loadInstanceData();
    } catch (e) {
      console.error('Failed to install mod:', e);
    } finally {
      setInstalling(null);
    }
  };

  const removeMod = async (modId: string) => {
    if (!instance) return;
    try {
      await invoke('remove_mod', {
        instancePath: instance.path,
        modId: modId
      });
      await loadInstanceData();
    } catch (e) {
      console.error('Failed to remove mod:', e);
    }
  };

  const openFolder = async () => {
    if (!instance) return;
    try {
      await invoke('open_instance_folder', { instancePath: instance.path });
    } catch (e) {
      console.error('Failed to open folder:', e);
    }
  };

  const getStatusColor = () => {
    if (!status) return 'var(--text-muted)';
    switch (status.status) {
      case 'playing': return '#22c55e';
      case 'launching': return '#f59e0b';
      case 'crashed': return '#ef4444';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusLabel = () => {
    if (!status) return 'Unknown';
    switch (status.status) {
      case 'playing': return 'Playing';
      case 'launching': return 'Launching';
      case 'crashed': return 'Crashed';
      default: return 'Idle';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!instance) {
    return (
      <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Instance Selected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Select an instance to view details</p>
          <button className="btn-launch" onClick={() => setView('instances')}>Go to Instances</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setView('instances')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <div className="topbar-title">{instance.name}</div>
            <div className="topbar-sub">{instance.version} • {instance.modLoader}</div>
          </div>
        </div>
        <div className="topbar-right">
          {/* Status Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--glass-bg)',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: getStatusColor() 
            }} />
            <span style={{ fontSize: '13px', color: getStatusColor() }}>{getStatusLabel()}</span>
          </div>
          <button className="btn-launch-main" onClick={openFolder}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Open Folder
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        padding: '0 24px', 
        borderBottom: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)'
      }}>
        {['overview', 'mods', 'settings', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '12px 20px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab}
            {tab === 'mods' && info && info.mods_count > 0 && (
              <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>({info.mods_count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="content-area">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div className="hero-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎮</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: getStatusColor() }}>{getStatusLabel()}</div>
              </div>
              <div className="hero-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏱️</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Play Time</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>
                  {instance.playTime > 0 ? `${Math.floor(instance.playTime / 60)}h ${instance.playTime % 60}m` : '0h'}
                </div>
              </div>
              <div className="hero-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mods</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{info?.mods_count || 0}</div>
              </div>
            </div>

            <div className="hero-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Instance Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Version:</span> {instance.version}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Mod Loader:</span> {instance.modLoader}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>RAM:</span> {Math.round(instance.memory.max / 1024)} GB
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Resolution:</span> {instance.resolution.width}x{instance.resolution.height}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Resource Packs:</span> {info?.resourcepacks_count || 0}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>World Saves:</span> {info?.saves_count || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mods Tab */}
        {activeTab === 'mods' && (
          <div style={{ padding: '24px' }}>
            {/* Installed Mods */}
            <div style={{ marginBottom: '24px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>Installed Mods ({installedMods.length})</div>
              {installedMods.length > 0 ? (
                <div className="versions-grid">
                  {installedMods.map(mod => (
                    <div key={mod.id} className="version-card">
                      <div className="version-name">{mod.name}</div>
                      <div className="version-num">v{mod.version}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        {formatSize(mod.file_size)}
                      </div>
                      <button 
                        className="btn-launch" 
                        style={{ marginTop: '12px', padding: '6px 12px', fontSize: '11px', background: '#dc2626' }}
                        onClick={() => removeMod(mod.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hero-card" style={{ padding: '30px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧩</div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No mods installed</div>
                </div>
              )}
            </div>

            {/* Browse Mods */}
            <div>
              <div className="section-title" style={{ marginBottom: '12px' }}>Browse Mods</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div className="search-box" style={{ flex: 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,253,244,0.3)" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search mods..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchMods()}
                  />
                </div>
                <button className="btn-launch-main" onClick={searchMods} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {mods.length > 0 && (
                <div className="versions-grid">
                  {mods.map(mod => (
                    <div key={mod.id} className="version-card">
                      <div className="version-name">{mod.name}</div>
                      <div className="version-num">v{mod.version} • {mod.mod_loader}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0' }}>
                        {mod.description.slice(0, 80)}...
                      </div>
                      <button 
                        className="btn-launch" 
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        onClick={() => installMod(mod)}
                        disabled={installing === mod.id}
                      >
                        {installing === mod.id ? 'Installing...' : 'Install'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ padding: '24px' }}>
            <div className="hero-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Memory</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', minWidth: '80px' }}>{ramAllocation} GB</span>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={ramAllocation}
                  onChange={(e) => setRamAllocation(parseInt(e.target.value))}
                  className="ram-slider"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="hero-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Java</div>
              <input
                type="text"
                value={javaPath}
                onChange={(e) => setJavaPath(e.target.value)}
                placeholder="java"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div className="hero-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>JVM Arguments</div>
              <textarea
                value={jvmArgs}
                onChange={(e) => setJvmArgs(e.target.value)}
                placeholder="-XX:+UseG1GC -XX:+ParallelRefProcEnabled"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className="hero-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Resolution</div>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              >
                <option value="1280x720">1280x720</option>
                <option value="1920x1080">1920x1080 (Full HD)</option>
                <option value="2560x1440">2560x1440 (2K)</option>
                <option value="3840x2160">3840x2160 (4K)</option>
                <option value="fullscreen">Fullscreen</option>
              </select>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="section-title">Game Logs</div>
              <button 
                className="btn-launch-main" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={loadInstanceData}
              >
                Refresh
              </button>
            </div>
            <div className="hero-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ 
                maxHeight: '500px', 
                overflow: 'auto', 
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.6',
                background: '#0a0a0a'
              }}>
                {logs.map((line, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      color: line.includes('[ERROR]') || line.includes('Exception') ? '#ef4444' :
                             line.includes('[WARN]') ? '#f59e0b' :
                             line.includes('[INFO]') ? '#22c55e' : 'var(--text-secondary)'
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
