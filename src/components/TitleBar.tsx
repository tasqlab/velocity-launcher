import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div className="h-10 flex items-center justify-between px-4 drag-area bg-gray-900/50 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg velocity-gradient flex items-center justify-center">
          <span className="text-white text-xs font-bold">V</span>
        </div>
        <span className="text-sm font-medium text-gray-300">Velocity Launcher</span>
      </div>
      
      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={() => appWindow.minimize()}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Minimize"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Maximize"
        >
          <Square size={14} />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
