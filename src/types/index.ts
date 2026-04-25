// Minecraft Instance Types
export type ModLoader = 'vanilla' | 'forge' | 'fabric' | 'quilt';

export interface Instance {
  id: string;
  name: string;
  version: string;
  modLoader: ModLoader;
  modLoaderVersion?: string;
  path: string;
  icon?: string;
  playTime: number; // in minutes
  lastPlayed: Date | null;
  created: Date;
  jvmArgs: string[];
  memory: {
    min: number;
    max: number;
  };
  resolution: {
    width: number;
    height: number;
    fullscreen: boolean;
  };
  mods: Mod[];
  resourcePacks: ResourcePack[];
  shaderPacks: ShaderPack[];
  dataPacks: DataPack[];
}

export interface Mod {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  filename: string;
  source: 'curseforge' | 'modrinth' | 'local';
  projectId?: string;
  fileId?: string;
  iconUrl?: string;
  description?: string;
  dependencies?: string[];
}

export interface ResourcePack {
  id: string;
  name: string;
  filename: string;
  enabled: boolean;
  iconUrl?: string;
  description?: string;
}

export interface ShaderPack {
  id: string;
  name: string;
  filename: string;
  enabled: boolean;
  description?: string;
}

export interface DataPack {
  id: string;
  name: string;
  filename: string;
  enabled: boolean;
  description?: string;
}

// Account Types
export interface MinecraftAccount {
  id: string;
  type: 'microsoft' | 'offline';
  username: string;
  uuid: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  avatarUrl?: string;
  isActive: boolean;
}

export interface MicrosoftAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Settings Types
export interface GlobalSettings {
  javaPath: string;
  jvmArgs: string[];
  memory: {
    min: number;
    max: number;
  };
  resolution: {
    width: number;
    height: number;
    fullscreen: boolean;
  };
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  discordRPC: boolean;
  showPlaytime: boolean;
  showModCount: boolean;
  accentColor: string;
  theme: 'dark' | 'light' | 'system';
  glassmorphism: boolean;
  language: string;
  downloadThreads: number;
  instancePath: string;
}

// API Types
export interface CurseForgeMod {
  id: number;
  name: string;
  summary: string;
  downloadCount: number;
  thumbnailUrl: string;
  authors: { name: string; url: string }[];
  categories: { name: string; slug: string }[];
  latestFiles: CurseForgeFile[];
}

export interface CurseForgeFile {
  id: number;
  displayName: string;
  fileName: string;
  downloadUrl: string;
  fileLength: number;
  gameVersions: string[];
  releaseType: number; // 1=release, 2=beta, 3=alpha
}

export interface ModrinthProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_url: string;
  downloads: number;
  followers: number;
  categories: string[];
  versions: string[];
}

export interface ModrinthVersion {
  id: string;
  project_id: string;
  name: string;
  version_number: string;
  game_versions: string[];
  files: ModrinthFile[];
}

export interface ModrinthFile {
  url: string;
  filename: string;
  primary: boolean;
  size: number;
}

// News Feed
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  link: string;
  publishedAt: Date;
  source: string;
}

// Server List
export interface MinecraftServer {
  id: string;
  name: string;
  address: string;
  port: number;
  icon?: string;
  description?: string;
  version?: string;
  playerCount?: { online: number; max: number };
  ping?: number;
  isFavorite: boolean;
  lastJoined?: Date;
}

// UI Types
export type View = 'home' | 'instances' | 'modpacks' | 'servers' | 'skins' | 'settings';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
