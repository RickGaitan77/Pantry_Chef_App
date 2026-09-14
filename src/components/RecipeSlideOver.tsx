import React, { useState } from 'react';
import { X, Heart, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe } from '../lib/types';

interface RecipeSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  isLoading: boolean;
  onSave: (recipe: Recipe) => void;
}

export const RecipeSlideOver: React.FC<RecipeSlideOverProps> = ({ isOpen, onClose, recipes, isLoading, onSave }) => {
  const [servings, setServings] = useState<'1-2' | '3-4'>('1-2');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSave = (recipe: Recipe) => {
    onSave(recipe);
    setSavedIds(prev => new Set(prev).add(recipe.id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 top-16 bg-[#0f172a] rounded-t-3xl shadow-2xl z-50 flex flex-col overflow-hidden border-t border-white/10"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-bold">Recipe Results</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 hide-scrollbar relative">
              
              {!isLoading && recipes.length > 0 && (
                <div className="flex justify-center mb-6">
                  <div className="flex bg-white/5 p-1 rounded-xl">
                    <button 
                      onClick={() => setServings('1-2')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${servings === '1-2' ? 'bg-white/10 text-white shadow' : 'text-gray-500'}`}
                    >
                      1–2 Servings
                    </button>
                    <button 
                      onClick={() => setServings('3-4')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${servings === '3-4' ? 'bg-white/10 text-white shadow' : 'text-gray-500'}`}
                    >
                      3–4 Servings
                    </button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-emerald-400">
                  <Loader2 size={40} className="animate-spin" />
                  <p className="text-sm font-medium animate-pulse">Chef AI is cooking...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Tier 1 */}
                  {recipes.filter(r => r.tier.includes('Ready')).length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 px-2">
                        ✨ Ready Right Now
                      </h3>
                      <div className="space-y-4">
                        {recipes.filter(r => r.tier.includes('Ready')).map(recipe => (
                          <RecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            isSaved={savedIds.has(recipe.id)}
                            onSave={() => handleSave(recipe)} 
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Tier 2 */}
                  {recipes.filter(r => r.tier.includes('Missing')).length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 px-2 mt-8">
                        🛒 Missing 1 Minor Item
                      </h3>
                      <div className="space-y-4">
                        {recipes.filter(r => r.tier.includes('Missing')).map(recipe => (
                          <RecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            isSaved={savedIds.has(recipe.id)}
                            onSave={() => handleSave(recipe)} 
                          />
                        ))}
                      </div>
                    </section>
                  )}

                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const RecipeCard: React.FC<{ recipe: Recipe; isSaved: boolean; onSave: () => void }> = ({ recipe, isSaved, onSave }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-transform" onClick={() => setExpanded(!expanded)}>
      <div className="p-4 relative">
        {recipe.missingItem && (
          <div className="mb-3 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <span className="font-bold">Missing:</span> {recipe.missingItem} 
              <br/>
              <span className="font-bold">Swap:</span> {recipe.suggestedSwap}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <div className="text-4xl bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            {recipe.foodEmoji}
          </div>
          <div className="flex-1 min-w-0 pr-10">
            <h4 className="font-bold text-white text-lg leading-tight mb-1">{recipe.title}</h4>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300">⏱️ {recipe.cookTime}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300">⚡ {recipe.difficulty}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); if(!isSaved) onSave(); }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md"
        >
          <Heart size={20} className={isSaved ? 'fill-rose-500 text-rose-500' : 'text-gray-400'} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-4 space-y-5">
              
              {recipe.whyYoullLoveThis && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Why You'll Love This</h5>
                  <p className="text-sm text-emerald-100">{recipe.whyYoullLoveThis}</p>
                </div>
              )}

              <div>
                <h5 className="text-sm font-bold text-gray-300 mb-2">Ingredients</h5>
                <ul className="space-y-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-1.5 shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-bold text-gray-300 mb-2">Instructions</h5>
                <div className="space-y-3">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-gray-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {recipe.chefProTip && (
                <div className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500">
                  <div className="text-lg">👨‍🍳</div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-500 uppercase">Chef's Pro Tip</h5>
                    <p className="text-sm text-amber-200/80 mt-0.5">{recipe.chefProTip}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
