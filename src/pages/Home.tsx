import { Play, Clock, Package, TrendingUp, ExternalLink } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useEffect } from 'react';

export function Home() {
  const { instances, getLastPlayedInstance, news, setNews, setView } = useAppStore();
  const lastPlayed = getLastPlayedInstance();

  // Mock news data - would be fetched from API in production
  useEffect(() => {
    if (news.length === 0) {
      setNews([
        {
          id: '1',
          title: 'Minecraft 1.21 Update: The Tricky Trials',
          summary: 'Explore new trial chambers, meet the breeze, and craft with the mace!',
          link: 'https://www.minecraft.net',
          publishedAt: new Date(),
          source: 'Minecraft.net',
        },
        {
          id: '2',
          title: 'New Fabric API Release',
          summary: 'Performance improvements and new rendering features for modders.',
          link: 'https://fabricmc.net',
          publishedAt: new Date(Date.now() - 86400000),
          source: 'FabricMC',
        },
        {
          id: '3',
          title: 'CurseForge Mod of the Month',
          summary: 'Discover the most popular mods this month on CurseForge.',
          link: 'https://curseforge.com',
          publishedAt: new Date(Date.now() - 172800000),
          source: 'CurseForge',
        },
      ]);
    }
  }, [news.length, setNews]);

  const totalPlayTime = instances.reduce((acc, inst) => acc + inst.playTime, 0);
  const totalMods = instances.reduce((acc, inst) => acc + inst.mods.length, 0);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back!
          </h1>
          <p className="text-gray-400">
            You have {instances.length} instance{instances.length !== 1 ? 's' : ''} ready to play
          </p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{Math.floor(totalPlayTime / 60)}h</p>
            <p className="text-xs text-gray-400">Total Playtime</p>
          </div>
          <div className="glass-card px-4 py-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalMods}</p>
            <p className="text-xs text-gray-400">Mods Installed</p>
          </div>
        </div>
      </div>

      {/* Quick Launch Card */}
      {lastPlayed ? (
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 velocity-gradient opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center glow-emerald">
                <Package size={32} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-400 font-medium mb-1">Continue Playing</p>
                <h2 className="text-2xl font-bold text-white">{lastPlayed.name}</h2>
                <p className="text-gray-400 text-sm">
                  {lastPlayed.version} • {lastPlayed.modLoader} • {lastPlayed.mods.length} mods
                </p>
              </div>
            </div>
            
            <button className="quick-launch-btn px-8 py-4 velocity-gradient rounded-xl flex items-center gap-3 text-white font-semibold text-lg transition-transform hover:scale-105 active:scale-95">
              <Play size={24} fill="currentColor" />
              <span>Quick Launch</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Instances Yet</h2>
          <p className="text-gray-400 mb-4">Create your first Minecraft instance to get started</p>
          <button 
            onClick={() => setView('instances')}
            className="glass-button-primary px-6 py-3"
          >
            Create Instance
          </button>
        </div>
      )}

      {/* News Feed */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-400" />
          Latest News
        </h3>
        <div className="grid gap-4">
          {news.map((item, index) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover p-4 flex items-start gap-4 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 font-bold text-lg">
                  {item.source[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-400 line-clamp-2">{item.summary}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <ExternalLink size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Recent Instances */}
      {instances.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-emerald-400" />
            Recent Instances
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {instances
              .sort((a, b) => (b.lastPlayed?.getTime() || 0) - (a.lastPlayed?.getTime() || 0))
              .slice(0, 4)
              .map((instance) => (
                <div
                  key={instance.id}
                  className="glass-card-hover p-4 cursor-pointer"
                  onClick={() => setView('instances')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{instance.name}</h4>
                      <p className="text-sm text-gray-400">
                        {instance.version} • {instance.modLoader}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{instance.mods.length} mods</span>
                    <span>
                      {instance.lastPlayed
                        ? `Last played ${new Date(instance.lastPlayed).toLocaleDateString()}`
                        : 'Never played'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
