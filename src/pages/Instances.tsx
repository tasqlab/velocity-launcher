import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';
import type { Instance, ModLoader } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface MinecraftVersion {
  id: string;
  release_type: string;
  release_time: string;
}

const MOD_LOADERS: { value: ModLoader; label: string; icon: string }[] = [
  { value: 'vanilla', label: 'Vanilla', icon: '🌿' },
  { value: 'fabric', label: 'Fabric', icon: '🧵' },
  { value: 'forge', label: 'Forge', icon: '⚒️' },
  { value: 'quilt', label: 'Quilt', icon: '📦' },
];

export function Instances() {
  const { instances, addInstance, deleteInstance, selectInstance, selectedInstance, setView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [versions, setVersions] = useState<MinecraftVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [creating, setCreating] = useState(false);
  const [installProgress, setInstallProgress] = useState('');
  
  const [newInstance, setNewInstance] = useState({
    name: '',
    version: '1.21.4',
    modLoader: 'vanilla' as ModLoader,
  });

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const vers = await invoke<MinecraftVersion[]>('get_minecraft_versions');
      setVersions(vers);
    } catch (e) {
      console.error('Failed to load versions:', e);
    } finally {
      setLoadingVersions(false);
    }
  };

  const filteredInstances = instances.filter(
    (inst) => inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateInstance = async () => {
    if (!newInstance.name.trim()) return;

    setCreating(true);
    setInstallProgress('Creating instance...');

    try {
      // Create the instance
      const instance: Instance = {
        id: uuidv4(),
        name: newInstance.name,
        version: newInstance.version,
        modLoader: newInstance.modLoader,
        path: `instances/${newInstance.name}`,
        playTime: 0,
        lastPlayed: null,
        created: new Date(),
        jvmArgs: [],
        memory: { min: 2048, max: 4096 },
        resolution: { width: 1920, height: 1080, fullscreen: false },
        mods: [],
        resourcePacks: [],
        shaderPacks: [],
        dataPacks: [],
      };

      // Install mod loader if needed
      if (newInstance.modLoader !== 'vanilla') {
        setInstallProgress(`Installing ${newInstance.modLoader}...`);
        await invoke('install_mod_loader', {
          version: newInstance.version,
          loader: newInstance.modLoader,
          instancePath: instance.path,
        });
      }

      addInstance(instance);
      setShowCreateModal(false);
      setNewInstance({ name: '', version: '1.21.4', modLoader: 'vanilla' });
    } catch (error) {
      console.error('Failed to create instance:', error);
    } finally {
      setCreating(false);
      setInstallProgress('');
    }
  };

  const handleDeleteInstance = (id: string) => {
    deleteInstance(id);
    setShowDeleteConfirm(null);
  };

  const handleLaunchInstance = async (instance: Instance) => {
    selectInstance(instance.id);
    setView('home');
  };

  const versionIcons: Record<string, string> = {
    vanilla: '🌿',
    fabric: '🧵',
    forge: '⚒️',
    quilt: '📦',
  };

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Instance Manager</div>
          <div className="topbar-sub">{instances.length} instances installed</div>
        </div>
        <div className="topbar-right">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,253,244,0.3)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search instances..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="btn-launch-main" 
            onClick={() => setShowCreateModal(true)}
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Instance
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        {filteredInstances.length === 0 ? (
          <div className="hero-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Instances Yet</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Create your first Minecraft instance to start playing</p>
              <button className="btn-launch" onClick={() => setShowCreateModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Instance
              </button>
            </div>
          </div>
        ) : (
          <div className="versions-grid">
            {filteredInstances.map((instance, index) => (
              <div
                key={instance.id}
                className={`version-card ${selectedInstance === instance.id ? 'selected' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`version-icon vi-${instance.modLoader}`}>
                  {versionIcons[instance.modLoader] || '⚡'}
                </div>
                <div className="version-name">{instance.name}</div>
                <div className="version-num">{instance.version} • {instance.modLoader}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button 
                    className="btn-launch" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                    onClick={() => handleLaunchInstance(instance)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Play
                  </button>
                  <button 
                    className="btn-icon" 
                    style={{ padding: '8px' }}
                    onClick={() => setShowDeleteConfirm(instance.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {instance.mods.length} mods • {instance.playTime > 0 ? `${Math.floor(instance.playTime / 60)}h playtime` : 'Never played'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="launch-progress visible">
          <div className="progress-modal" style={{ maxWidth: '420px' }}>
            {creating ? (
              <>
                <div className="progress-icon">⛏️</div>
                <div className="progress-title">Creating Instance</div>
                <div className="progress-sub">{installProgress}</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '60%', animation: 'pulse 1s infinite' }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>➕</div>
                <div className="progress-title" style={{ marginBottom: '24px' }}>New Instance</div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Instance Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="My Minecraft World"
                    value={newInstance.name}
                    onChange={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Minecraft Version</label>
                  <select
                    value={newInstance.version}
                    onChange={(e) => setNewInstance({ ...newInstance, version: e.target.value })}
                    className="select"
                    style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px', appearance: 'none' }}
                  >
                    {loadingVersions ? (
                      <option>Loading versions...</option>
                    ) : (
                      versions.map(v => (
                        <option key={v.id} value={v.id}>{v.id} ({v.release_type})</option>
                      ))
                    )}
                  </select>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Mod Loader</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {MOD_LOADERS.map(loader => (
                      <button
                        key={loader.value}
                        onClick={() => setNewInstance({ ...newInstance, modLoader: loader.value })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: newInstance.modLoader === loader.value ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                          background: newInstance.modLoader === loader.value ? 'rgba(74, 222, 128, 0.1)' : 'var(--glass-bg)',
                          color: newInstance.modLoader === loader.value ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{loader.icon}</span>
                        <span style={{ fontSize: '11px' }}>{loader.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="btn-launch-main"
                    style={{ flex: 1, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateInstance}
                    disabled={!newInstance.name.trim()}
                    className="btn-launch-main"
                    style={{ flex: 1 }}
                  >
                    Create
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="launch-progress visible">
          <div className="progress-modal" style={{ maxWidth: '360px' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚠️</div>
            <div className="progress-title" style={{ marginBottom: '8px' }}>Delete Instance?</div>
            <div className="progress-sub" style={{ marginBottom: '24px' }}>
              This will permanently delete this instance and all its files. This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-launch-main"
                style={{ flex: 1, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteInstance(showDeleteConfirm)}
                className="btn-launch-main"
                style={{ flex: 1, background: '#ef4444' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
