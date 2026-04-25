import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Instances } from './pages/Instances';
import { Servers } from './pages/Servers';
import { Settings } from './pages/Settings';
import { Mods } from './pages/Mods';
import { InstanceDetails } from './pages/InstanceDetails';
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
      case 'mods':
        return <Mods />;
      case 'instanceDetails':
        return <InstanceDetails />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      {/* Background Effects */}
      <div className="bg-layer" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      
      <div className="app-container">
        <TitleBar />
        <Sidebar />
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </>
  );
}

export default App;
