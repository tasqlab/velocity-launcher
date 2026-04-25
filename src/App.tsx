import { useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Instances } from './pages/Instances';
import { Servers } from './pages/Servers';
import { Skins } from './pages/Skins';
import { Settings } from './pages/Settings';
import { useAppStore } from './stores/appStore';

function App() {
  const { currentView } = useAppStore();

  useEffect(() => {
    // Apply dark theme by default
    document.documentElement.classList.add('dark');
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'instances':
        return <Instances />;
      case 'servers':
        return <Servers />;
      case 'skins':
        return <Skins />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-container">
      <TitleBar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
