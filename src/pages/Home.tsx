import { Play, Clock, Package, Newspaper, ExternalLink, Zap, Gamepad2 } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface MojangArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  category: string;
}

export function Home() {
  const { instances, getLastPlayedInstance, setView } = useAppStore();
  const [news, setNews] = useState<MojangArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const lastPlayed = getLastPlayedInstance();

  useEffect(() => {
    fetchMojangNews();
  }, []);

  const fetchMojangNews = async () => {
    try {
      // Try to fetch from Mojang's RSS feed via backend
      const articles = await invoke<MojangArticle[]>('fetch_mojang_news');
      setNews(articles.slice(0, 5));
    } catch (error) {
      // Fallback to mock data if fetch fails
      setNews([
        {
          title: 'Minecraft 1.21 Update: The Tricky Trials',
          description: 'Explore new trial chambers, meet the breeze, and craft with the mace!',
          url: 'https://www.minecraft.net/article/tricky-trials-update',
          publishedAt: new Date().toISOString(),
          category: 'Update',
        },
        {
          title: 'New Realms Subscription Tiers',
          description: 'More options for your Minecraft Realms subscription.',
          url: 'https://www.minecraft.net/article/realms-plus',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          category: 'News',
        },
        {
          title: 'Minecraft Marketplace Highlights',
          description: 'Check out the latest community creations.',
          url: 'https://www.minecraft.net/marketplace',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          category: 'Marketplace',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalPlayTime = instances.reduce((acc, inst) => acc + inst.playTime, 0);
  const totalMods = instances.reduce((acc, inst) => acc + inst.mods.length, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="content-area animate-fade-in">
      {/* Header */}
      <div className="flex-between mb-8">
        <div>
          <p className="text-small mb-1">Dashboard</p>
          <h1 className="text-display">Welcome back!</h1>
        </div>
        <div className="flex gap-3">
          <div className="card px-5 py-4 text-center min-w-[120px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock size={18} className="text-accent" />
              <span className="text-2xl font-bold text-[var(--text-primary)]">{Math.floor(totalPlayTime / 60)}h</span>
            </div>
            <p className="text-small uppercase font-semibold tracking-wide">Playtime</p>
          </div>
          <div className="card px-5 py-4 text-center min-w-[120px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap size={18} className="text-accent" />
              <span className="text-2xl font-bold text-[var(--text-primary)]">{totalMods}</span>
            </div>
            <p className="text-small uppercase font-semibold tracking-wide">Mods</p>
          </div>
        </div>
      </div>

      {/* Quick Launch */}
      {lastPlayed ? (
        <div className="panel p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg">
                <Gamepad2 size={32} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="status-dot status-online" />
                  <p className="text-accent text-sm font-semibold">Ready to play</p>
                </div>
                <h2 className="text-subtitle">{lastPlayed.name}</h2>
                <div className="flex items-center gap-2 text-body mt-1">
                  <span className="badge badge-accent">{lastPlayed.version}</span>
                  <span>•</span>
                  <span className="capitalize">{lastPlayed.modLoader}</span>
                  <span>•</span>
                  <span>{lastPlayed.mods.length} mods</span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-lg">
              <Play size={20} fill="currentColor" />
              <span>Launch</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="panel p-8 text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-[var(--text-muted)]" />
          </div>
          <h2 className="text-subtitle mb-2">No Instances Yet</h2>
          <p className="text-body mb-6">Create your first Minecraft instance to get started</p>
          <button onClick={() => setView('instances')} className="btn btn-primary">
            Create Instance
          </button>
        </div>
      )}

      {/* News Feed */}
      <div>
        <div className="flex-between mb-5">
          <h3 className="text-subtitle flex items-center gap-2">
            <Newspaper size={22} className="text-accent" />
            Mojang News
          </h3>
          {loading && <span className="text-small animate-pulse-soft">Loading...</span>}
        </div>
        
        <div className="grid gap-3">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 flex items-start gap-4 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                <Newspaper size={22} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-[var(--text-primary)] group-hover:text-accent transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                </div>
                <p className="text-body text-sm line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="badge badge-accent">{item.category}</span>
                  <span className="text-small">{formatDate(item.publishedAt)}</span>
                </div>
              </div>
              <ExternalLink size={18} className="text-[var(--text-muted)] group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
