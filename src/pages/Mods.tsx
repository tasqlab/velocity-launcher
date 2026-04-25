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

export function Mods() {
  const { instances, selectedInstance } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mods, setMods] = useState<Mod[]>([]);
  const [installedMods, setInstalledMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('1.21');
  const [selectedLoader, setSelectedLoader] = useState('fabric');
  const [activeTab, setActiveTab] = useState<'browse' | 'installed'>('browse');
  const [compatibility, setCompatibility] = useState<Record<string, string>>({});

  const currentInstance = instances.find(i => i.id === selectedInstance);

  useEffect(() => {
    if (currentInstance) {
      setSelectedVersion(currentInstance.version.slice(0, 4));
      setSelectedLoader(currentInstance.modLoader);
      loadInstalledMods();
    }
  }, [selectedInstance, currentInstance]);

  const loadInstalledMods = async () => {
    if (!currentInstance) return;
    try {
      const mods = await invoke<Mod[]>('get_installed_mods', { instancePath: currentInstance.path });
      setInstalledMods(mods);
    } catch (e) {
      console.error('Failed to load installed mods:', e);
    }
  };

  const searchMods = async () => {
    setLoading(true);
    try {
      const result = await invoke<{ mods: Mod[] }>('search_mods', {
        query: searchQuery,
        gameVersion: selectedVersion,
        modLoader: selectedLoader
      });
      setMods(result.mods);
      
      // Check compatibility for each mod
      const compat: Record<string, string> = {};
      for (const mod of result.mods) {
        const result = await invoke<string>('check_mod_compatibility', {
          modId: mod.id,
          gameVersion: currentInstance?.version || '1.21.4',
          modLoader: currentInstance?.modLoader || 'fabric'
        });
        compat[mod.id] = result;
      }
      setCompatibility(compat);
    } catch (e) {
      console.error('Failed to search mods:', e);
    } finally {
      setLoading(false);
    }
  };

  const installMod = async (mod: Mod) => {
    if (!currentInstance) return;
    setInstalling(mod.id);
    try {
      await invoke('install_mod', {
        instancePath: currentInstance.path,
        modId: mod.id,
        modInfo: mod
      });
      await loadInstalledMods();
    } catch (e) {
      console.error('Failed to install mod:', e);
    } finally {
      setInstalling(null);
    }
  };

  const removeMod = async (modId: string) => {
    if (!currentInstance) return;
    try {
      await invoke('remove_mod', {
        instancePath: currentInstance.path,
        modId: modId
      });
      await loadInstalledMods();
    } catch (e) {
      console.error('Failed to remove mod:', e);
    }
  };

  const getCompatibilityBadge = (status: string) => {
    switch (status) {
      case 'compatible':
        return <span className="tag-release">✓ Compatible</span>;
      case 'incompatible':
        return <span className="tag-beta" style={{ background: '#dc2626' }}>✗ Incompatible</span>;
      case 'requires_sodium':
        return <span className="tag-beta">⚠ Needs Sodium</span>;
      default:
        return <span className="tag-beta">? Unknown</span>;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDownloads = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Mods</div>
          <div className="topbar-sub">
            {currentInstance ? `Managing mods for ${currentInstance.name}` : 'Select an instance first'}
          </div>
        </div>
        <div className="topbar-right">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('browse')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'browse' ? 'var(--accent)' : 'var(--glass-bg)',
                color: activeTab === 'browse' ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Browse
            </button>
            <button 
              onClick={() => setActiveTab('installed')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'installed' ? 'var(--accent)' : 'var(--glass-bg)',
                color: activeTab === 'installed' ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Installed ({installedMods.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        {activeTab === 'browse' && (
          <>
            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
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

            {/* Results */}
            {mods.length > 0 ? (
              <div className="versions-grid">
                {mods.map((mod, index) => (
                  <div 
                    key={mod.id} 
                    className="version-card"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="version-name">{mod.name}</div>
                      {compatibility[mod.id] && getCompatibilityBadge(compatibility[mod.id])}
                    </div>
                    <div className="version-num">v{mod.version} • {mod.mod_loader}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0', lineHeight: '1.5' }}>
                      {mod.description.slice(0, 100)}...
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <span>By {mod.author}</span>
                      <span>{formatDownloads(mod.downloads)} downloads</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-launch" 
                        style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                        onClick={() => installMod(mod)}
                        disabled={installing === mod.id || compatibility[mod.id] === 'incompatible'}
                      >
                        {installing === mod.id ? 'Installing...' : 'Install'}
                      </button>
                      <a 
                        href={mod.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon"
                        style={{ padding: '8px', textDecoration: 'none' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hero-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧩</div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Search for Mods</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Search for Fabric, Forge, or Quilt mods</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'installed' && (
          <>
            {installedMods.length > 0 ? (
              <div className="versions-grid">
                {installedMods.map((mod, index) => (
                  <div 
                    key={mod.id} 
                    className="version-card"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="version-name">{mod.name}</div>
                    <div className="version-num">v{mod.version}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      {formatSize(mod.file_size)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button 
                        className="btn-launch" 
                        style={{ flex: 1, padding: '8px', fontSize: '12px', background: '#dc2626' }}
                        onClick={() => removeMod(mod.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hero-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Mods Installed</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Browse and install mods to enhance your game</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
