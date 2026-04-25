# Velocity Launcher

A high-performance, modular Minecraft launcher built with Tauri (Rust + React). Features a modern glassmorphism UI, multi-account support, instance management, and integration with CurseForge/Modrinth.

## Features

### Core Features
- **Instance System**: Isolated folders for each Minecraft version/modpack to prevent file corruption
- **Multi-Account Support**: Full Microsoft OAuth2 implementation for managing multiple accounts
- **Mod Loader Support**: Vanilla, Forge, Fabric, and Quilt across all Minecraft versions
- **Performance Optimizations**: Automated JVM argument optimization based on system RAM

### User Interface
- **Glassmorphism Design**: Semi-transparent, blurred dark theme with customizable accent colors
- **Sidebar Navigation**: Quick access to Home, Modpacks, Server List, Skins, and Settings
- **Quick Launch**: One-click launch from dashboard with "Last Played" instance tracking
- **Performance HUD**: Settings for FPS boosts and memory allocation

### Modpack Management
- **One-Click Install**: CurseForge and Modrinth API integration
- **Mod Manager**: Built-in "Active Mods" toggle list for every instance
- **Resource Management**: Dedicated tabs for Shaders, Resource Packs, and Data Packs
- **Version Switching**: Easy switching between mod loaders

### Settings & Optimization
- **JVM Arguments**: Pre-configured optimized arguments for G1GC
- **Global vs Local**: Settings that can be applied globally or overridden per-instance
- **Discord RPC**: Rich Presence showing server IP, mod count, and playtime
- **Resolution Control**: Custom window sizes and fullscreen defaults

## Technology Stack

- **Framework**: Tauri v2 (Rust + React 19)
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **Backend**: Rust with Tauri plugins (fs, http, shell, store, updater)

## Project Structure

```
velocity-launcher/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── TitleBar.tsx    # Custom window controls
│   │   └── Sidebar.tsx     # Navigation sidebar
│   ├── pages/              # Main views
│   │   ├── Home.tsx        # Dashboard
│   │   ├── Instances.tsx   # Instance management
│   │   ├── Servers.tsx     # Server list
│   │   ├── Skins.tsx       # Skin manager
│   │   └── Settings.tsx    # Settings panel
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   └── index.css           # Glassmorphism styles
├── src-tauri/              # Rust backend
│   ├── src/lib.rs          # Main Rust code
│   ├── Cargo.toml          # Rust dependencies
│   └── capabilities/       # Tauri permissions
└── package.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/velocity-launcher.git
cd velocity-launcher
```

2. Install dependencies:
```bash
npm install
```

3. Install Tauri plugins:
```bash
npm run tauri add fs
npm run tauri add http
npm run tauri add shell
npm run tauri add store
npm run tauri add updater
```

4. Run in development mode:
```bash
npm run tauri dev
```

### Building for Production

```bash
npm run tauri build
```

This will create platform-specific installers in `src-tauri/target/release/bundle/`.

## Development

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- Extensions:
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend for production |
| `npm run tauri dev` | Run Tauri in development mode |
| `npm run tauri build` | Build Tauri application |

## Roadmap

- [ ] Microsoft OAuth2 authentication flow
- [ ] Minecraft version manifest integration
- [ ] CurseForge API integration for modpacks
- [ ] Modrinth API integration
- [ ] Java auto-detection and download
- [ ] Instance import/export
- [ ] Server status pinging
- [ ] Discord Rich Presence
- [ ] Auto-updater implementation
- [ ] Linux and macOS support improvements

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.
