import { Mic, Zap, Clock, Flame, AlertCircle, Download, Settings } from 'lucide-react';
import { PantryItem } from '../lib/types';
import { usePWAInstall } from '../lib/usePWAInstall';
import { motion } from 'motion/react';

interface HomeTabProps {
  pantryItems: PantryItem[];
  onNavigate: (tab: number) => void;
  onGenerate: (type: string) => void;
  onOpenSettings: () => void;
}

const PHRASES = [
  "What's on the menu today?",
  "What are we cooking?",
  "What's the vibe tonight?",
  "Raid the fridge.",
  "Let's make something great.",
  "Chef mode: activated.",
  "Fuel up."
];

export function HomeTab({ pantryItems, onNavigate, onGenerate, onOpenSettings }: HomeTabProps) {
  const expiringCount = pantryItems.filter(i => i.expiringSoon).length;
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Deterministic daily phrase
  const dateStr = new Date().toISOString().slice(0, 10);
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dailyPhrase = PHRASES[hash % PHRASES.length];

  return (
    <div className="space-y-6 pt-4">
      <header className="flex justify-between items-center overflow-hidden">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight text-white neon-text animate-flicker shrink-0">
            Pantry Chef
          </h1>
          
          <div className="overflow-hidden relative ml-3 h-7 flex items-center">
            <motion.div
              initial={{ y: '100%', filter: 'blur(4px)', opacity: 0, boxShadow: '0 0 0px rgba(16,185,129,0)' }}
              animate={{ 
                y: 0, 
                filter: 'blur(0px)', 
                opacity: 1, 
                boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 15px rgba(16,185,129,0.5)', '0 0 5px rgba(16,185,129,0.1)'] 
              }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
            >
              {dailyPhrase}
            </motion.div>
          </div>
        </div>
        
        <div className="flex gap-2 shrink-0 ml-2">
          {!isInstalled && (isInstallable || isIOS) && (
            <button 
              onClick={() => isInstallable ? install() : alert('To install: tap the Share button below, then "Add to Home Screen".')}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white"
            >
              <Download size={20} />
            </button>
          )}
          <button 
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Master Inventory Quick-Link */}
      <button 
        onClick={() => onNavigate(1)}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-[0.98] active:translate-y-0 active:border-blue-500 active:shadow-[0_0_20px_rgba(37,99,235,0.5)] cursor-pointer"
      >
        <div>
          <p className="text-sm text-gray-400">Master Inventory</p>
          <p className="text-xl font-semibold">{pantryItems.length} Items Logged</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          <ListIcon />
        </div>
      </button>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onGenerate('quick-meal')}
          className="col-span-2 relative overflow-hidden flex items-center p-6 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 shadow-lg active:scale-[0.98] transition-transform"
        >
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 hover:opacity-100 transition-opacity" />
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-white mb-1">Quick Meal</h3>
            <p className="text-sm text-gray-400">Dictate what's in front of you</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse">
            <Mic size={24} className="text-white" />
          </div>
        </button>

        <button 
          onClick={() => onGenerate('surprise-me')}
          className="col-span-2 flex items-center p-6 rounded-2xl bg-white/5 border border-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-[0.98] active:translate-y-0 active:border-amber-500 active:shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
        >
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-white mb-1">Surprise Me!</h3>
            <p className="text-sm text-gray-400">Random meal from your pantry</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            <Zap size={24} />
          </div>
        </button>
      </div>

      {/* Smart Actions Bar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 px-1 uppercase tracking-wider">Smart Actions</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
          
          <button onClick={() => onGenerate('use-it-up')} className="snap-start shrink-0 w-32 h-32 rounded-2xl bg-white/5 border border-rose-500/30 flex flex-col items-center justify-center p-4 relative overflow-hidden group transition-all duration-200 hover:scale-[1.02] hover:border-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-[0.96] active:border-rose-500 active:shadow-[0_0_20px_rgba(244,63,94,0.6)] cursor-pointer">
            <div className="absolute inset-0 bg-rose-500/10" />
            <AlertCircle size={28} className="text-rose-400 mb-2 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] group-hover:scale-110 transition-transform duration-300" />
            <span className="font-semibold text-sm">Use It Up</span>
            <span className="text-xs text-gray-400 mt-1">{expiringCount} Expiring</span>
          </button>

          <button onClick={() => onGenerate('speed-mood')} className="snap-start shrink-0 w-32 h-32 rounded-2xl bg-white/5 border border-blue-500/30 flex flex-col items-center justify-center p-4 relative overflow-hidden group transition-all duration-200 hover:scale-[1.02] hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-[0.96] active:border-blue-500 active:shadow-[0_0_20px_rgba(59,130,246,0.6)] cursor-pointer">
            <div className="absolute inset-0 bg-blue-500/10" />
            <Clock size={28} className="text-blue-400 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform duration-300" />
            <span className="font-semibold text-sm">Under 15m</span>
            <span className="text-xs text-gray-400 mt-1">Speed & Mood</span>
          </button>

          <button onClick={() => onGenerate('chef-secret')} className="snap-start shrink-0 w-32 h-32 rounded-2xl bg-white/5 border border-amber-500/30 flex flex-col items-center justify-center p-4 relative overflow-hidden group transition-all duration-200 hover:scale-[1.02] hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-[0.96] active:border-amber-500 active:shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer">
            <div className="absolute inset-0 bg-amber-500/10" />
            <Flame size={28} className="text-amber-400 mb-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-300" />
            <span className="font-semibold text-sm text-center leading-tight">Chef's Secret</span>
            <span className="text-xs text-gray-400 mt-1">Flavor Pairings</span>
          </button>

        </div>
      </div>
    </div>
  );
}

function ListIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}
