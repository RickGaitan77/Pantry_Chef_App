import React, { useState, useRef } from 'react';
import { Camera, ChevronDown, ChevronUp, Trash2, Edit3 } from 'lucide-react';
import { SavedRecipe } from '../lib/types';
import { resizeImage } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';

interface FavoritesTabProps {
  favorites: SavedRecipe[];
  onDelete: (id: string) => void;
  onUpdate: (recipe: SavedRecipe) => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({ favorites, onDelete, onUpdate }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (favorites.length === 0) {
    return (
      <div className="pt-10 text-center text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
        <p>No saved recipes yet.</p>
        <p className="text-sm mt-2">Recipes you save will appear here offline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 pb-20">
      <h2 className="text-2xl font-bold text-white mb-6">Saved Recipes</h2>
      
      {favorites.map(recipe => (
        <FavoriteCard 
          key={recipe.id} 
          recipe={recipe} 
          isExpanded={expandedId === recipe.id}
          onToggle={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
          onDelete={() => onDelete(recipe.id)}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

const FavoriteCard: React.FC<{ 
  recipe: SavedRecipe; 
  isExpanded: boolean; 
  onToggle: () => void; 
  onDelete: () => void; 
  onUpdate: (r: SavedRecipe) => void;
}> = ({ recipe, isExpanded, onToggle, onDelete, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImage(file);
      onUpdate({ ...recipe, photoBase64: base64 });
    } catch (err) {
      console.error(err);
      alert('Failed to process image');
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...recipe, notes: e.target.value });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
      <div 
        className="p-3 flex gap-4 items-center cursor-pointer active:bg-white/5"
        onClick={onToggle}
      >
        <div className="w-20 h-20 shrink-0 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden relative">
          {recipe.photoBase64 ? (
            <img src={recipe.photoBase64} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">{recipe.foodEmoji}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-bold text-white truncate mb-1">{recipe.title}</h3>
          <p className="text-xs text-gray-400 line-clamp-2 leading-snug">{recipe.description}</p>
          <div className="flex gap-3 mt-2 text-xs font-medium text-gray-500">
            <span>⏱️ {recipe.cookTime}</span>
            <span>👥 {recipe.servings}</span>
          </div>
        </div>
        
        <div className="text-gray-500 pr-2">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20 px-4 py-4 space-y-4"
          >
            {/* Photo Action */}
            <div className="flex justify-between items-center">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <Camera size={16} />
                {recipe.photoBase64 ? 'Change Photo' : 'Add Photo'}
              </button>
              
              <button 
                onClick={() => { if(confirm('Delete this recipe?')) onDelete(); }}
                className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-300">
                <Edit3 size={14} /> Personal Notes
              </div>
              <textarea 
                value={recipe.notes || ''}
                onChange={handleNotesChange}
                placeholder="Add your tweaks or ideas here..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-white/20 resize-none h-20 placeholder-gray-600"
              />
            </div>
            
            {/* Display Ingredients briefly */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Ingredients</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>• {ing}</li>
                ))}
              </ul>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
