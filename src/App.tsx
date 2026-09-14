import { useState, useEffect } from 'react';
import { Home, List, Sparkles, Heart, Settings, X, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PantryItem, SavedRecipe, Recipe } from './lib/types';
import { getFavorites, saveFavorite, deleteFavorite, resizeImage } from './lib/db';
import { usePWAInstall } from './lib/usePWAInstall';
import { HomeTab } from './components/HomeTab';
import { PantryTab } from './components/PantryTab';
import { SuggestionsTab } from './components/SuggestionsTab';
import { FavoritesTab } from './components/FavoritesTab';
import { RecipeSlideOver } from './components/RecipeSlideOver';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [favorites, setFavorites] = useState<SavedRecipe[]>([]);
  const [isRecipeSlideOverOpen, setIsRecipeSlideOverOpen] = useState(false);
  const [activeRecipes, setActiveRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  useEffect(() => {
    const stored = localStorage.getItem('pantryItems');
    if (stored) setPantryItems(JSON.parse(stored));
    
    getFavorites().then(setFavorites);
  }, []);

  useEffect(() => {
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
  }, [pantryItems]);

  const saveSettings = () => {
    localStorage.setItem('gemini_api_key', tempApiKey);
    setApiKey(tempApiKey);
    setIsSettingsOpen(false);
  };

  const toggleExpiring = (id: string) => {
    setPantryItems(items => items.map(i => i.id === id ? { ...i, expiringSoon: !i.expiringSoon } : i));
  };

  const deleteItem = (id: string) => {
    setPantryItems(items => items.filter(i => i.id !== id));
  };

  const addItem = (name: string, category: string) => {
    setPantryItems(items => [...items, { id: Date.now().toString() + Math.random(), name, category, expiringSoon: false }]);
  };

  const handleGenerateRecipes = async (type: string) => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsRecipeSlideOverOpen(true);
    setIsLoadingRecipes(true);
    setActiveRecipes([]);

    try {
      const prompt = `You are a master chef. Create 5 distinct recipes based on the user's pantry.
Pantry items: ${pantryItems.map(i => i.name).join(', ')}.
Request type: ${type} (e.g. 'random', 'use-it-up', 'speed-mood', 'generate', 'quick-meal').

Categorize the recipes into two tiers:
- Tier 1: "Ready Right Now" (Uses 100% pantry match, no missing items).
- Tier 2: "Missing 1 Minor Item" (Needs exactly 1 minor item not in pantry, provide a suggested swap if possible).

Return a JSON array of 5 objects exactly matching this schema, without markdown formatting:
[{"tier": "...", "title": "...", "foodEmoji": "...", "cookTime": "...", "difficulty": "...", "missingItem": "...", "suggestedSwap": "...", "ingredients": ["..."], "instructions": ["..."], "chefProTip": "...", "whyYoullLoveThis": "..."}]`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      const text = data.candidates[0].content.parts[0].text;
      setActiveRecipes(JSON.parse(text).map((r: any) => ({ ...r, id: Date.now().toString() + Math.random() })));
    } catch (e: any) {
      console.error(e);
      alert('Failed to generate recipes. Please check your API key.');
      setIsRecipeSlideOverOpen(false);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const handleSaveFavorite = async (recipe: Recipe) => {
    const saved: SavedRecipe = {
      ...recipe,
      servings: '1-2',
      description: recipe.whyYoullLoveThis || '',
      photoBase64: null,
      notes: ''
    };
    await saveFavorite(saved);
    setFavorites(await getFavorites());
  };

  const handleDeleteFavorite = async (id: string) => {
    await deleteFavorite(id);
    setFavorites(await getFavorites());
  };
  
  const handleUpdateFavorite = async (recipe: SavedRecipe) => {
    await saveFavorite(recipe);
    setFavorites(await getFavorites());
  };

  const tabs = [
    { id: 0, label: 'Home', icon: Home, color: 'text-blue-500' },
    { id: 1, label: 'Pantry', icon: List, color: 'text-emerald-500' },
    { id: 2, label: 'Suggest', icon: Sparkles, color: 'text-amber-500' },
    { id: 3, label: 'Saved', icon: Heart, color: 'text-rose-500' }
  ];

  return (
    <div className="h-[100dvh] w-full bg-[#0b0f17] flex flex-col relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/20 blur-[100px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+80px)] px-4">
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div key="home" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <HomeTab pantryItems={pantryItems} onNavigate={setActiveTab} onGenerate={handleGenerateRecipes} onOpenSettings={() => setIsSettingsOpen(true)} />
            </motion.div>
          )}
          {activeTab === 1 && (
            <motion.div key="pantry" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <PantryTab pantryItems={pantryItems} onToggleExpiring={toggleExpiring} onDeleteItem={deleteItem} onAddItem={addItem} onGenerate={() => handleGenerateRecipes('generate')} />
            </motion.div>
          )}
          {activeTab === 2 && (
            <motion.div key="suggest" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <SuggestionsTab favorites={favorites} pantryItems={pantryItems} onGenerate={() => handleGenerateRecipes('suggestions')} />
            </motion.div>
          )}
          {activeTab === 3 && (
            <motion.div key="favorites" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <FavoritesTab favorites={favorites} onDelete={handleDeleteFavorite} onUpdate={handleUpdateFavorite} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] bg-[#121826]/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-2 py-3 z-40">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-all duration-200 active:scale-90 ${isActive ? tab.color : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className="relative">
                <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_currentColor]' : ''} />
                {isActive && <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />}
              </div>
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <RecipeSlideOver 
        isOpen={isRecipeSlideOverOpen} 
        onClose={() => setIsRecipeSlideOverOpen(false)} 
        recipes={activeRecipes} 
        isLoading={isLoadingRecipes} 
        onSave={handleSaveFavorite} 
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setIsSettingsOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#121826] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-emerald-400" />
                    <h3 className="font-bold text-white">App Settings</h3>
                  </div>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-5 space-y-4">
                  {!apiKey && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm p-3 rounded-xl flex gap-3">
                      <Key size={20} className="shrink-0 text-amber-400 mt-0.5" />
                      <p>An API key is required to use the AI features. Your key is stored securely in your device's local storage.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Google AI Studio API Key</label>
                    <input 
                      type="password"
                      value={tempApiKey}
                      onChange={e => setTempApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600 font-mono text-sm"
                    />
                  </div>
                  <button 
                    onClick={saveSettings}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition-colors active:scale-[0.98]"
                  >
                    Save Key
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
