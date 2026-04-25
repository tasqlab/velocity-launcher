import { useState } from 'react';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Shirt,
  ExternalLink,
  Check
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';

interface Skin {
  id: string;
  name: string;
  url: string;
  type: 'classic' | 'slim';
  isActive: boolean;
}

export function Skins() {
  const { activeAccount } = useAppStore();
  const [skins, setSkins] = useState<Skin[]>([
    {
      id: '1',
      name: 'Default Steve',
      url: 'https://textures.minecraft.net/texture/...',
      type: 'classic',
      isActive: true,
    },
    {
      id: '2',
      name: 'Custom Skin',
      url: 'https://textures.minecraft.net/texture/...',
      type: 'slim',
      isActive: false,
    },
  ]);
  const [selectedSkin, setSelectedSkin] = useState<string>(skins.find(s => s.isActive)?.id || skins[0]?.id);

  const handleSkinUpload = () => {
    // Would open file picker in production
    console.log('Upload skin');
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Skin Manager</h1>
        <p className="text-gray-400">Customize your Minecraft appearance</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Skin Preview */}
        <div className="col-span-1">
          <div className="glass-panel p-6 sticky top-0">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shirt size={20} className="text-emerald-400" />
              Preview
            </h3>
            
            {/* 3D Skin Preview Placeholder */}
            <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-4 border border-white/5">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Shirt size={48} className="text-emerald-400" />
                </div>
                <p className="text-gray-400 text-sm">3D Preview</p>
                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
              </div>
            </div>

            {/* Skin Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Name</span>
                <span className="text-white">{skins.find(s => s.id === selectedSkin)?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Model</span>
                <span className="text-white capitalize">{skins.find(s => s.id === selectedSkin)?.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  skins.find(s => s.id === selectedSkin)?.isActive 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {skins.find(s => s.id === selectedSkin)?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button className="w-full glass-button-primary py-2.5 flex items-center justify-center gap-2">
                <Check size={18} />
                Equip Skin
              </button>
              <button className="w-full glass-button py-2.5 flex items-center justify-center gap-2 text-gray-400">
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Skin Library */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Your Skins</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSkinUpload}
                className="glass-button-primary px-4 py-2 flex items-center gap-2"
              >
                <Upload size={18} />
                Upload Skin
              </button>
            </div>
          </div>

          {/* Skin Grid */}
          <div className="grid grid-cols-3 gap-4">
            {skins.map((skin) => (
              <div
                key={skin.id}
                onClick={() => setSelectedSkin(skin.id)}
                className={`glass-card p-4 cursor-pointer transition-all ${
                  selectedSkin === skin.id 
                    ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' 
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Skin Thumbnail */}
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center mb-3 border border-white/5">
                  <Shirt size={32} className={skin.isActive ? 'text-emerald-400' : 'text-gray-500'} />
                </div>
                
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white text-sm truncate">{skin.name}</h4>
                    <p className="text-xs text-gray-400 capitalize">{skin.type} model</p>
                  </div>
                  {skin.isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Skin Card */}
            <button
              onClick={handleSkinUpload}
              className="glass-card p-4 flex flex-col items-center justify-center gap-3 min-h-[160px] border-dashed border-2 border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Upload size={24} className="text-gray-400" />
              </div>
              <span className="text-sm text-gray-400">Upload New Skin</span>
            </button>
          </div>

          {/* External Links */}
          <div className="mt-8 glass-panel p-5">
            <h4 className="font-semibold text-white mb-3">Get More Skins</h4>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://namemc.com/minecraft-skins"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card-hover p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <ExternalLink size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">NameMC</p>
                  <p className="text-xs text-gray-400">Popular skins database</p>
                </div>
              </a>
              <a
                href="https://minecraft.novaskin.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card-hover p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <ExternalLink size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">NovaSkin</p>
                  <p className="text-xs text-gray-400">Skin editor & gallery</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
