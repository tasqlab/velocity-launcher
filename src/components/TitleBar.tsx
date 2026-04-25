import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div className="title-bar">
      <div className="title-bar-brand">
        <div className="title-bar-logo">V</div>
        <span className="title-bar-title">Velocity Launcher</span>
      </div>
      
      <div className="title-bar-controls">
        <button onClick={() => appWindow.minimize()} className="title-bar-btn">
          <Minus size={16} />
        </button>
        <button onClick={() => appWindow.toggleMaximize()} className="title-bar-btn">
          <Square size={14} />
        </button>
        <button onClick={() => appWindow.close()} className="title-bar-btn close">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
