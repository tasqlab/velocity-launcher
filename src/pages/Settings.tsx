import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';

type SettingsTab = 'general' | 'java' | 'appearance' | 'accounts' | 'downloads';

interface JavaInfo {
  version: string;
  path: string;
  is_valid: boolean;
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { settings, updateSettings, accounts, activeAccount, setActiveAccount } = useAppStore();
  const [javaInstalls, setJavaInstalls] = useState<JavaInfo[]>([]);
  const [loadingJava, setLoadingJava] = useState(true);

  useEffect(() => {
    loadJavaInstalls();
  }, []);

  const loadJavaInstalls = async () => {
    try {
      const installs = await invoke<JavaInfo[]>('detect_java_installations');
      setJavaInstalls(installs);
    } catch (e) {
      console.error('Failed to detect Java:', e);
    } finally {
      setLoadingJava(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'java', label: 'Java & Performance', icon: '☕' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'accounts', label: 'Accounts', icon: '👤' },
    { id: 'downloads', label: 'Downloads', icon: '📥' },
  ];

  const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</div>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: checked ? 'var(--accent)' : 'var(--glass-border)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s'
      }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: '3px',
        left: checked ? '23px' : '3px',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  );

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Settings</div>
          <div className="topbar-sub">Configure your launcher</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '240px', 
          padding: '20px', 
          borderRight: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 500 : 400,
                textAlign: 'left',
                width: '100%'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="content-area" style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'general' && (
            <div>
              <div className="section-title" style={{ marginBottom: '20px' }}>General Settings</div>
              
              <SettingRow label="Close to Tray" description="Keep launcher running when closed">
                <Toggle checked={settings.closeToTray} onChange={(v) => updateSettings({ closeToTray: v })} />
              </SettingRow>
              
              <SettingRow label="Start Minimized" description="Start launcher minimized to system tray">
                <Toggle checked={settings.startMinimized} onChange={(v) => updateSettings({ startMinimized: v })} />
              </SettingRow>
              
              <SettingRow label="Check for Updates" description="Automatically check for launcher updates">
                <Toggle checked={settings.checkUpdates} onChange={(v) => updateSettings({ checkUpdates: v })} />
              </SettingRow>
              
              <SettingRow label="Discord Rich Presence" description="Show current game status in Discord">
                <Toggle checked={settings.discordRpc} onChange={(v) => updateSettings({ discordRpc: v })} />
              </SettingRow>
              
              <SettingRow label="Allow Beta Versions" description="Show experimental Minecraft versions">
                <Toggle checked={settings.allowBeta} onChange={(v) => updateSettings({ allowBeta: v })} />
              </SettingRow>
            </div>
          )}

          {activeTab === 'java' && (
            <div>
              <div className="section-title" style={{ marginBottom: '20px' }}>Java & Performance</div>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  RAM Allocation
                </div>
                <div style={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px', 
                  padding: '20px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Maximum Memory</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>
                      {Math.round(settings.memory.max / 1024)} GB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={Math.round(settings.memory.max / 1024)}
                    onChange={(e) => updateSettings({ memory: { ...settings.memory, max: parseInt(e.target.value) * 1024 } })}
                    className="ram-slider"
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>2 GB</span>
                    <span>16 GB</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Java Installation
                </div>
                <div style={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px', 
                  padding: '16px' 
                }}>
                  {loadingJava ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Detecting Java...</div>
                  ) : javaInstalls.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                      No Java installations found
                    </div>
                  ) : (
                    javaInstalls.map((java, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderRadius: '8px',
                        background: i === 0 ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                        border: i === 0 ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid transparent',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500 }}>Java {java.version}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{java.path}</div>
                        </div>
                        {i === 0 && <span className="tag-release" style={{ fontSize: '10px' }}>Recommended</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <SettingRow label="JVM Arguments" description="Custom Java arguments">
                <button className="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </SettingRow>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <div className="section-title" style={{ marginBottom: '20px' }}>Appearance</div>
              
              <SettingRow label="Theme" description="Choose your preferred look">
                <select
                  value={settings.theme}
                  onChange={(e) => updateSettings({ theme: e.target.value as 'dark' | 'light' })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </SettingRow>
              
              <SettingRow label="Accent Color" description="Choose accent color">
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'].map(color => (
                    <button
                      key={color}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: color,
                        border: settings.accentColor === color ? '2px solid white' : '2px solid transparent',
                        cursor: 'pointer',
                        boxShadow: settings.accentColor === color ? `0 0 10px ${color}` : 'none'
                      }}
                      onClick={() => updateSettings({ accentColor: color })}
                    />
                  ))}
                </div>
              </SettingRow>
              
              <SettingRow label="Animations" description="Enable UI animations">
                <Toggle checked={settings.animations} onChange={(v) => updateSettings({ animations: v })} />
              </SettingRow>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div>
              <div className="section-title" style={{ marginBottom: '20px' }}>Accounts</div>
              
              <div style={{ marginBottom: '20px' }}>
                <button className="btn-launch-main" style={{ width: '100%', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Add Microsoft Account
                </button>
              </div>

              {accounts.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  background: 'var(--glass-bg)', 
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>👤</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No accounts added yet</div>
                </div>
              ) : (
                accounts.map(account => (
                  <div key={account.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--glass-bg)',
                    borderRadius: '12px',
                    border: activeAccount === account.id ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #064e3b, #065f46)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {account.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{account.username}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Microsoft Account</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {activeAccount === account.id && (
                        <span className="tag-release">Active</span>
                      )}
                      <button 
                        className="btn-icon"
                        onClick={() => setActiveAccount(account.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'downloads' && (
            <div>
              <div className="section-title" style={{ marginBottom: '20px' }}>Downloads</div>
              
              <SettingRow label="Download Location" description="Where game files are stored">
                <button className="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </SettingRow>
              
              <SettingRow label="Download Speed" description="Limit download speed">
                <select
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                >
                  <option>Unlimited</option>
                  <option>10 MB/s</option>
                  <option>5 MB/s</option>
                  <option>2 MB/s</option>
                </select>
              </SettingRow>
              
              <SettingRow label="Auto-update Mods" description="Automatically update mods when new versions are available">
                <Toggle checked={true} onChange={() => {}} />
              </SettingRow>
              
              <SettingRow label="Clear Cache" description="Clear downloaded assets cache">
                <button 
                  className="btn-launch-main" 
                  style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                >
                  Clear
                </button>
              </SettingRow>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
