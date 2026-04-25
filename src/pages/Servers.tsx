import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Heart, 
  Users, 
  Signal,
  Globe,
  MoreVertical,
  Trash2,
  Star
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { MinecraftServer } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function Servers() {
  const { servers, addServer, removeServer, updateServer } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', address: '', port: 25565 });

  const filteredServers = servers.filter(
    (s) => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteServers = filteredServers.filter((s) => s.isFavorite);
  const otherServers = filteredServers.filter((s) => !s.isFavorite);

  const handleAddServer = () => {
    if (!newServer.name.trim() || !newServer.address.trim()) return;

    const server: MinecraftServer = {
      id: uuidv4(),
      name: newServer.name,
      address: newServer.address,
      port: newServer.port,
      isFavorite: false,
    };

    addServer(server);
    setShowAddModal(false);
    setNewServer({ name: '', address: '', port: 25565 });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Server List</h1>
            <p className="text-gray-400">Manage your favorite Minecraft servers</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="glass-button-primary px-4 py-2.5 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Server
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search servers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Servers List */}
      <div className="flex-1 overflow-y-auto p-6">
        {servers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Globe size={40} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Servers</h3>
            <p className="text-gray-400 mb-4 max-w-sm">
              Add your favorite Minecraft servers to quickly join them
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="glass-button-primary px-6 py-3"
            >
              Add Server
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Favorites */}
            {favoriteServers.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Heart size={14} />
                  Favorites
                </h3>
                <div className="grid gap-2">
                  {favoriteServers.map((server) => (
                    <ServerCard
                      key={server.id}
                      server={server}
                      onToggleFavorite={() => updateServer(server.id, { isFavorite: !server.isFavorite })}
                      onDelete={() => removeServer(server.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Servers */}
            {otherServers.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  All Servers
                </h3>
                <div className="grid gap-2">
                  {otherServers.map((server) => (
                    <ServerCard
                      key={server.id}
                      server={server}
                      onToggleFavorite={() => updateServer(server.id, { isFavorite: !server.isFavorite })}
                      onDelete={() => removeServer(server.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Add Server Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Add Server</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Server Name
                </label>
                <input
                  type="text"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder="Hypixel"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Server Address
                </label>
                <input
                  type="text"
                  value={newServer.address}
                  onChange={(e) => setNewServer({ ...newServer, address: e.target.value })}
                  placeholder="mc.hypixel.net"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Port
                </label>
                <input
                  type="number"
                  value={newServer.port}
                  onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) || 25565 })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 glass-button py-2.5 text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddServer}
                disabled={!newServer.name.trim() || !newServer.address.trim()}
                className="flex-1 glass-button-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Server
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServerCard({
  server,
  onToggleFavorite,
  onDelete,
}: {
  server: MinecraftServer;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="glass-card p-4 flex items-center gap-4 group">
      <button
        onClick={onToggleFavorite}
        className={`p-2 rounded-lg transition-colors ${
          server.isFavorite ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'
        }`}
      >
        <Heart size={18} fill={server.isFavorite ? 'currentColor' : 'none'} />
      </button>

      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
        <Globe size={24} className="text-emerald-400" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{server.name}</h4>
        <p className="text-sm text-gray-400">
          {server.address}:{server.port}
        </p>
      </div>

      {server.playerCount && (
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Users size={14} />
          <span>{server.playerCount.online}/{server.playerCount.max}</span>
        </div>
      )}

      {server.ping && (
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Signal size={14} />
          <span>{server.ping}ms</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-sm hover:bg-emerald-500/30 transition-colors">
          Join
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg text-gray-400 hover:bg-white/10 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 glass-panel py-1 z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
