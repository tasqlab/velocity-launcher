import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';
import type { Instance } from '../types';

interface MojangArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  category: string;
}

const BLOCK_GRID = [
  ['x', 'x', 'x', 'x', 'x', 'e', 'x', 'x'],
  ['x', 'x', 'x', 'w', 'w', 'x', 'x', 'x'],
  ['x', 'g', 'g', 'g', 'g', 'g', 'g', 'x'],
  ['d', 'd', 'd', 'd', 'd', 'd', 'd', 'd'],
  ['s', 's', 's', 's', 's', 's', 's', 's'],
];

export function Home() {
  const { instances, getLastPlayedInstance, selectedInstance, accounts, activeAccount } = useAppStore();
  const [news, setNews] = useState<MojangArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchStatus, setLaunchStatus] = useState('Preparing...');
  const [selectedVersion, setSelectedVersion] = useState<Instance | null>(null);
  const [ramAllocation, setRamAllocation] = useState(4);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineUsername, setOfflineUsername] = useState('Player');
  
  const activeAcc = accounts.find(a => a.id === activeAccount);
  const lastPlayed = getLastPlayedInstance();
  const currentInstance = selectedVersion || lastPlayed || instances[0];

  useEffect(() => {
    fetchMojangNews();
  }, []);

  const fetchMojangNews = async () => {
    try {
      const articles = await invoke<MojangArticle[]>('fetch_mojang_news');
      setNews(articles.slice(0, 3));
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async () => {
    if (!currentInstance) return;
    
    setLaunching(true);
    setLaunchProgress(0);
    
    const steps = [
      'Authenticating...',
      'Downloading assets...',
      'Verifying files...',
      'Loading Java...',
      'Starting Minecraft...',
    ];
    
    let progress = 0;
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 4;
      if (progress > 100) progress = 100;
      
      setLaunchProgress(progress);
      
      const newStep = Math.floor((progress / 100) * steps.length);
      if (newStep !== stepIndex && newStep < steps.length) {
        stepIndex = newStep;
        setLaunchStatus(steps[stepIndex]);
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLaunching(false);
          setLaunchProgress(0);
        }, 800);
      }
    }, 120);

    try {
      if (offlineMode) {
        // Offline mode - no authentication needed
        await invoke('launch_offline', {
          options: {
            instance_id: currentInstance.id,
            java_path: 'java',
            jvm_args: [`-Xmx${ramAllocation}G`, `-Xms${ramAllocation}G`],
            memory_min: ramAllocation * 1024,
            memory_max: ramAllocation * 1024,
            game_directory: currentInstance.path,
          },
          version: currentInstance.version,
          username: offlineUsername
        });
      } else {
        // Online mode - requires Microsoft authentication
        await invoke('launch_minecraft', {
          options: {
            instance_id: currentInstance.id,
            java_path: 'java',
            jvm_args: [`-Xmx${ramAllocation}G`, `-Xms${ramAllocation}G`],
            memory_min: ramAllocation * 1024,
            memory_max: ramAllocation * 1024,
            game_directory: currentInstance.path,
          },
          version: currentInstance.version
        });
      }
    } catch (error) {
      console.error('Launch failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const totalPlayTime = instances.reduce((acc, inst) => acc + inst.playTime, 0);
  const totalMods = instances.reduce((acc, inst) => acc + inst.mods.length, 0);

  const versionIcons: Record<string, string> = {
    vanilla: '🌿',
    fabric: '🧵',
    forge: '⚒️',
    quilt: '📦',
  };

  const versionTags: Record<string, { class: string; label: string }> = {
    vanilla: { class: 'tag-release', label: 'Release' },
    fabric: { class: 'tag-modded', label: 'Modded' },
    forge: { class: 'tag-modded', label: 'Modded' },
    quilt: { class: 'tag-beta', label: 'Beta' },
  };

  const getLastPlayedText = (lastPlayedAt: string | null) => {
    if (!lastPlayedAt) return 'Never';
    const date = new Date(lastPlayedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Launch Progress Overlay */}
      <div className={`launch-progress ${launching ? 'visible' : ''}`}>
        <div className="progress-modal">
          <div className="progress-icon">⛏️</div>
          <div className="progress-title">Launching Minecraft</div>
          <div className="progress-sub">{launchStatus}</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${launchProgress}%` }} />
          </div>
          <div className="progress-pct">{Math.floor(launchProgress)}%</div>
        </div>
      </div>

      <div className="topbar">
        <div>
          <div className="topbar-title">Good evening ✦</div>
          <div className="topbar-sub">Ready to mine some blocks?</div>
        </div>
        <div className="topbar-right">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,253,244,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search versions, mods..." />
          </div>
          <button className="btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="content-area">
        {/* Hero Card with 3D Pixel Scene */}
        {currentInstance ? (
          <div className="hero-card">
            <div className="hero-bg" />
            <div className="pixel-scene">
              <div className="block-grid">
                {BLOCK_GRID.flat().map((type, i) => (
                  <div key={i} className={`blk blk-${type}`} />
                ))}
              </div>
            </div>
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-dot" />
                Java Edition Active
              </div>
              <div>
                <div className="hero-title">
                  {currentInstance.name}<br />
                  <span>{currentInstance.version}</span>
                </div>
              </div>
              <div className="hero-bottom">
                <button className="btn-launch" onClick={handleLaunch} disabled={launching}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  PLAY NOW
                </button>
                <div className="hero-meta">
                  <div className="meta-item">
                    <div className="meta-label">Last Played</div>
                    <div className="meta-val">{getLastPlayedText(currentInstance.lastPlayed)}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-label">Loader</div>
                    <div className="meta-val capitalize">{currentInstance.modLoader}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-label">Mods</div>
                    <div className="meta-val">{currentInstance.mods.length} active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hero-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Instances Yet</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Create your first Minecraft instance to start playing</p>
            </div>
          </div>
        )}

        {/* Versions Grid */}
        <div>
          <div className="section-header">
            <div className="section-title">Your Instances</div>
            <div className="section-link">
              Manage all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div className="versions-grid">
            {instances.map((instance, index) => (
              <div
                key={instance.id}
                className={`version-card ${selectedVersion?.id === instance.id ? 'selected' : ''}`}
                onClick={() => setSelectedVersion(instance)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`version-icon vi-${instance.modLoader}`}>
                  {versionIcons[instance.modLoader] || '⚡'}
                </div>
                <div className="version-name">{instance.name}</div>
                <div className="version-num">{instance.version}</div>
                <div className={`version-tag ${versionTags[instance.modLoader]?.class || 'tag-release'}`}>
                  {versionTags[instance.modLoader]?.label || 'Release'}
                </div>
              </div>
            ))}
            {instances.length === 0 && (
              <div className="version-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>➕</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Create your first instance</div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row - News & Stats */}
        <div className="bottom-row">
          {/* News Feed */}
          <div>
            <div className="section-header">
              <div className="section-title">Latest News</div>
              <div className="section-link">
                View all
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
            <div className="news-list">
              {loading ? (
                <div className="news-item">
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading news...</div>
                </div>
              ) : (
                news.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-item"
                  >
                    <div className={`news-thumb nt-${(index % 3) + 1}`}>
                      {index === 0 ? '🌲' : index === 1 ? '🔮' : '🔥'}
                    </div>
                    <div className="news-content">
                      <div className="news-title">{item.title}</div>
                      <div className="news-date">{formatDate(item.publishedAt)}</div>
                    </div>
                    <div className="news-arrow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div>
            <div className="section-header">
              <div className="section-title">Your Stats</div>
            </div>
            <div className="stats-panel">
              <div className="playtime-display">
                <div className="playtime-num">{Math.floor(totalPlayTime / 60)}h</div>
                <div className="playtime-label">Total Playtime</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-row">
                <div className="stat-header">
                  <span className="stat-name">RAM Usage</span>
                  <span className="stat-value" style={{ color: 'var(--accent)' }}>{ramAllocation} GB / 16 GB</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill sf-green" style={{ width: `${(ramAllocation / 16) * 100}%` }} />
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-header">
                  <span className="stat-name">Storage</span>
                  <span className="stat-value" style={{ color: '#38bdf8' }}>2.4 GB</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill sf-sky" style={{ width: '15%' }} />
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-header">
                  <span className="stat-name">Mods Installed</span>
                  <span className="stat-value" style={{ color: '#fbbf24' }}>{totalMods}</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill sf-amber" style={{ width: `${Math.min(totalMods * 2, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Bar */}
      <div className="launch-bar">
        <div className="launch-version-select">
          <span className="lvs-icon">{currentInstance ? versionIcons[currentInstance.modLoader] || '⚡' : '📦'}</span>
          <div className="lvs-text">
            <span className="lvs-name">{currentInstance ? `${currentInstance.name} ${currentInstance.version}` : 'No Instance'}</span>
            <span className="lvs-num">{currentInstance ? 'Java Edition' : 'Select an instance'}</span>
          </div>
          <svg className="lvs-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        <div className="launch-spacer" />

        <div className="ram-control">
          <div className="ram-label">
            <span className="ram-val">{ramAllocation} GB</span>
            <span className="ram-sub">RAM Allocated</span>
          </div>
          <input
            type="range"
            className="ram-slider"
            min="2"
            max="16"
            value={ramAllocation}
            step="1"
            onChange={(e) => setRamAllocation(parseInt(e.target.value))}
          />
        </div>

        {/* Offline Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
          <button
            onClick={() => setOfflineMode(!offlineMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: offlineMode ? '1px solid #f59e0b' : '1px solid var(--glass-border)',
              background: offlineMode ? 'rgba(245, 158, 11, 0.15)' : 'var(--glass-bg)',
              color: offlineMode ? '#f59e0b' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Offline
          </button>
          {offlineMode && (
            <input
              type="text"
              value={offlineUsername}
              onChange={(e) => setOfflineUsername(e.target.value)}
              placeholder="Username"
              style={{
                width: '80px',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                fontSize: '12px'
              }}
            />
          )}
        </div>

        <button 
          className={`btn-launch-main ${launching ? 'launching' : ''}`}
          onClick={handleLaunch}
          disabled={launching || !currentInstance}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          {launching ? 'LAUNCHING...' : 'LAUNCH GAME'}
        </button>
      </div>
    </>
  );
}
