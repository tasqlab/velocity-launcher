import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import type { MinecraftServer } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function Servers() {
  const { servers, addServer, removeServer, updateServer } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', address: '', port: 25565 });

  const filteredServers = servers.filter(
    (s) => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteServers = filteredServers.filter((s) => s.isFavorite);
  const otherServers = filteredServers.filter((s) => !s.isFavorite);

  const handleAddServer = () => {
    if (!newServer.name.trim() || !newServer.address.trim()) return;

    const server: MinecraftServer = {
      id: uuidv4(),
      name: newServer.name,
      address: newServer.address,
      port: newServer.port,
      isFavorite: false,
    };

    addServer(server);
    setShowAddModal(false);
    setNewServer({ name: '', address: '', port: 25565 });
  };

  const toggleFavorite = (id: string) => {
    const server = servers.find(s => s.id === id);
    if (server) {
      updateServer(id, { isFavorite: !server.isFavorite });
    }
  };

  const ServerCard = ({ server }: { server: MinecraftServer }) => (
    <div className="version-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.1))',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            🌍
          </div>
          <div>
            <div className="version-name">{server.name}</div>
            <div className="version-num">{server.address}:{server.port}</div>
          </div>
        </div>
        <button 
          onClick={() => toggleFavorite(server.id)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '18px',
            opacity: server.isFavorite ? 1 : 0.4,
            transition: 'all 0.2s'
          }}
        >
          {server.isFavorite ? '⭐' : '☆'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-launch" style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Connect
        </button>
        <button 
          className="btn-icon" 
          style={{ padding: '8px' }}
          onClick={() => removeServer(server.id)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Server Browser</div>
          <div className="topbar-sub">{servers.length} servers saved</div>
        </div>
        <div className="topbar-right">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,253,244,0.3)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search servers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="btn-launch-main" 
            onClick={() => setShowAddModal(true)}
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Server
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        {filteredServers.length === 0 ? (
          <div className="hero-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Servers Yet</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Add your favorite Minecraft servers to quick connect</p>
              <button className="btn-launch" onClick={() => setShowAddModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Server
              </button>
            </div>
          </div>
        ) : (
          <>
            {favoriteServers.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div className="section-header">
                  <div className="section-title">⭐ Favorites</div>
                </div>
                <div className="versions-grid">
                  {favoriteServers.map(server => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              </div>
            )}

            {otherServers.length > 0 && (
              <div>
                <div className="section-header">
                  <div className="section-title">All Servers</div>
                </div>
                <div className="versions-grid">
                  {otherServers.map(server => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Server Modal */}
      {showAddModal && (
        <div className="launch-progress visible">
          <div className="progress-modal" style={{ maxWidth: '400px' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>🌍</div>
            <div className="progress-title" style={{ marginBottom: '24px' }}>Add Server</div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Server Name</label>
              <input
                type="text"
                placeholder="Hypixel"
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Server Address</label>
              <input
                type="text"
                placeholder="mc.hypixel.net"
                value={newServer.address}
                onChange={(e) => setNewServer({ ...newServer, address: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Port</label>
              <input
                type="number"
                placeholder="25565"
                value={newServer.port}
                onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) || 25565 })}
                style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn-launch-main"
                style={{ flex: 1, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddServer}
                disabled={!newServer.name.trim() || !newServer.address.trim()}
                className="btn-launch-main"
                style={{ flex: 1 }}
              >
                Add Server
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
