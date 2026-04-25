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
    <div className="h-screen w-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Custom Title Bar */}
      <TitleBar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main View */}
        <main className="flex-1 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
