import { Sparkles, ArrowRight } from 'lucide-react';
import { SavedRecipe, PantryItem } from '../lib/types';

interface SuggestionsTabProps {
  favorites: SavedRecipe[];
  pantryItems: PantryItem[];
  onGenerate: () => void;
}

export function SuggestionsTab({ favorites, pantryItems, onGenerate }: SuggestionsTabProps) {
  const hasFavorites = favorites.length > 0;

  return (
    <div className="space-y-6 pt-4 h-full flex flex-col">
      <header>
        <h2 className="text-2xl font-bold text-white mb-2">Taste Profile</h2>
        <p className="text-sm text-gray-400">
          {hasFavorites 
            ? 'Based on your saved dishes, we found these matches in your pantry.' 
            : 'Save some recipes to help us learn your taste profile!'}
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border border-amber-500/50 animate-ping opacity-20" />
          <Sparkles size={40} className="text-amber-400" />
        </div>
        
        <div className="text-center max-w-xs">
          <h3 className="text-lg font-bold text-white mb-2">
            {hasFavorites ? 'Ready for tailored suggestions?' : 'Try popular chef-curated meals'}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            We will analyze your {pantryItems.length} pantry items to generate 3 custom recommendations.
          </p>
          
          <button 
            onClick={onGenerate}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 text-amber-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-transform"
          >
            Generate Now <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
