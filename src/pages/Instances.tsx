import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Settings, 
  Trash2, 
  MoreVertical,
  Download,
  Check,
  X
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { Instance, ModLoader } from '../types';
import { v4 as uuidv4 } from 'uuid';

const MINECRAFT_VERSIONS = ['1.21.4', '1.21.3', '1.21.1', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5'];
const MOD_LOADERS: { value: ModLoader; label: string }[] = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'forge', label: 'Forge' },
  { value: 'quilt', label: 'Quilt' },
];

export function Instances() {
  const { instances, addInstance, deleteInstance, selectInstance, selectedInstance, updateInstance } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInstance, setNewInstance] = useState({
    name: '',
    version: '1.21.4',
    modLoader: 'vanilla' as ModLoader,
  });

  const filteredInstances = instances.filter(
    (inst) => inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateInstance = () => {
    if (!newInstance.name.trim()) return;

    const instance: Instance = {
      id: uuidv4(),
      name: newInstance.name,
      version: newInstance.version,
      modLoader: newInstance.modLoader,
      path: `instances/${newInstance.name}`,
      playTime: 0,
      lastPlayed: null,
      created: new Date(),
      jvmArgs: [],
      memory: { min: 512, max: 4096 },
      resolution: { width: 1920, height: 1080, fullscreen: false },
      mods: [],
      resourcePacks: [],
      shaderPacks: [],
      dataPacks: [],
    };

    addInstance(instance);
    setShowCreateModal(false);
    setNewInstance({ name: '', version: '1.21.4', modLoader: 'vanilla' });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-8 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-small mb-1">Management</p>
            <h1 className="text-title">Instances</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create Instance
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search instances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-colors"
            />
          </div>
          <button className="glass-button px-4 py-2.5 flex items-center gap-2 text-gray-400">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {/* Instances Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredInstances.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Plus size={40} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {instances.length === 0 ? 'No Instances' : 'No Results'}
            </h3>
            <p className="text-gray-400 mb-4 max-w-sm">
              {instances.length === 0
                ? 'Create your first Minecraft instance to get started with Velocity Launcher'
                : 'No instances match your search. Try a different query.'}
            </p>
            {instances.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="glass-button-primary px-6 py-3"
              >
                Create Instance
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstances.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
                isSelected={selectedInstance === instance.id}
                onSelect={() => selectInstance(instance.id)}
                onDelete={() => deleteInstance(instance.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Instance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Create Instance</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Instance Name
                </label>
                <input
                  type="text"
                  value={newInstance.name}
                  onChange={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
                  placeholder="My Survival World"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Minecraft Version
                </label>
                <select
                  value={newInstance.version}
                  onChange={(e) => setNewInstance({ ...newInstance, version: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {MINECRAFT_VERSIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Mod Loader
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MOD_LOADERS.map((loader) => (
                    <button
                      key={loader.value}
                      onClick={() => setNewInstance({ ...newInstance, modLoader: loader.value })}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        newInstance.modLoader === loader.value
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {loader.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 glass-button py-2.5 text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInstance}
                disabled={!newInstance.name.trim()}
                className="flex-1 glass-button-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InstanceCard({
  instance,
  isSelected,
  onSelect,
  onDelete,
}: {
  instance: Instance;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`glass-card p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : 'hover:bg-white/10'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
          <span className="text-emerald-400 font-bold text-lg">
            {instance.name[0].toUpperCase()}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 glass-panel py-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-2"
              >
                <Settings size={14} />
                Settings
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-white mb-1 truncate">{instance.name}</h3>
      <p className="text-sm text-gray-400 mb-3">
        {instance.version} • {instance.modLoader}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{instance.mods.length} mods</span>
        <span>{Math.floor(instance.playTime / 60)}h played</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          // Launch instance
        }}
        className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium
                   hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
      >
        <Play size={16} fill="currentColor" />
        Play
      </button>
    </div>
  );
}
