import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Instance, MinecraftAccount, GlobalSettings, View, NewsItem, MinecraftServer } from '../types';

interface AppState {
  // Navigation
  currentView: View;
  setView: (view: View) => void;

  // Instances
  instances: Instance[];
  selectedInstance: string | null;
  setInstances: (instances: Instance[]) => void;
  addInstance: (instance: Instance) => void;
  updateInstance: (id: string, updates: Partial<Instance>) => void;
  deleteInstance: (id: string) => void;
  selectInstance: (id: string | null) => void;
  getLastPlayedInstance: () => Instance | undefined;

  // Accounts
  accounts: MinecraftAccount[];
  activeAccount: string | null;
  setAccounts: (accounts: MinecraftAccount[]) => void;
  addAccount: (account: MinecraftAccount) => void;
  removeAccount: (id: string) => void;
  setActiveAccount: (id: string) => void;

  // Global Settings
  settings: GlobalSettings;
  updateSettings: (settings: Partial<GlobalSettings>) => void;

  // Servers
  servers: MinecraftServer[];
  addServer: (server: MinecraftServer) => void;
  removeServer: (id: string) => void;
  updateServer: (id: string, updates: Partial<MinecraftServer>) => void;

  // News
  news: NewsItem[];
  setNews: (news: NewsItem[]) => void;

  // UI State
  isLaunching: boolean;
  setIsLaunching: (launching: boolean) => void;
  downloadProgress: Record<string, number>;
  setDownloadProgress: (id: string, progress: number) => void;
}

const defaultSettings: GlobalSettings = {
  javaPath: '',
  jvmArgs: ['-XX:+UseG1GC', '-XX:+ParallelRefProcEnabled', '-XX:MaxGCPauseMillis=200'],
  memory: { min: 512, max: 4096 },
  resolution: { width: 1920, height: 1080, fullscreen: false },
  launchOnStartup: false,
  minimizeToTray: true,
  discordRPC: true,
  showPlaytime: true,
  showModCount: true,
  accentColor: '#10b981',
  theme: 'dark',
  glassmorphism: true,
  language: 'en',
  downloadThreads: 4,
  instancePath: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home',
      setView: (view) => set({ currentView: view }),

      // Instances
      instances: [],
      selectedInstance: null,
      setInstances: (instances) => set({ instances }),
      addInstance: (instance) =>
        set((state) => ({ instances: [...state.instances, instance] })),
      updateInstance: (id, updates) =>
        set((state) => ({
          instances: state.instances.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),
      deleteInstance: (id) =>
        set((state) => ({
          instances: state.instances.filter((i) => i.id !== id),
          selectedInstance: state.selectedInstance === id ? null : state.selectedInstance,
        })),
      selectInstance: (id) => set({ selectedInstance: id }),
      getLastPlayedInstance: () => {
        const { instances } = get();
        return instances
          .filter((i) => i.lastPlayed)
          .sort((a, b) => (b.lastPlayed?.getTime() || 0) - (a.lastPlayed?.getTime() || 0))[0];
      },

      // Accounts
      accounts: [],
      activeAccount: null,
      setAccounts: (accounts) => set({ accounts }),
      addAccount: (account) =>
        set((state) => ({ accounts: [...state.accounts, account] })),
      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          activeAccount: state.activeAccount === id ? null : state.activeAccount,
        })),
      setActiveAccount: (id) => set({ activeAccount: id }),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      // Servers
      servers: [],
      addServer: (server) =>
        set((state) => ({ servers: [...state.servers, server] })),
      removeServer: (id) =>
        set((state) => ({
          servers: state.servers.filter((s) => s.id !== id),
        })),
      updateServer: (id, updates) =>
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      // News
      news: [],
      setNews: (news) => set({ news }),

      // UI State
      isLaunching: false,
      setIsLaunching: (launching) => set({ isLaunching: launching }),
      downloadProgress: {},
      setDownloadProgress: (id, progress) =>
        set((state) => ({
          downloadProgress: { ...state.downloadProgress, [id]: progress },
        })),
    }),
    {
      name: 'velocity-launcher-storage',
      partialize: (state) => ({
        instances: state.instances,
        accounts: state.accounts,
        activeAccount: state.activeAccount,
        settings: state.settings,
        servers: state.servers,
      }),
    }
  )
);
