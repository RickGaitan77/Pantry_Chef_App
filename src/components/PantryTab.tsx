import React, { useState } from 'react';
import { Mic, Search, X, Sparkles } from 'lucide-react';
import { PantryItem } from '../lib/types';
import { motion, AnimatePresence } from 'motion/react';

interface PantryTabProps {
  pantryItems: PantryItem[];
  onToggleExpiring: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (name: string, category: string) => void;
  onGenerate: () => void;
}

const CATEGORIES = [
  { id: 'Proteins', label: '🥩 Proteins' },
  { id: 'Produce', label: '🥦 Produce' },
  { id: 'Dairy & Cold', label: '🧀 Dairy & Cold' },
  { id: 'Pantry & Grains', label: '🥫 Pantry & Grains' },
  { id: 'Spices, Oils & Sauces', label: '🧂 Spices, Oils & Sauces' },
];

export function PantryTab({ pantryItems, onToggleExpiring, onDeleteItem, onAddItem, onGenerate }: PantryTabProps) {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Simple tokenizer
    const items = inputValue.split(/,|\band\b/i).map(i => i.trim()).filter(Boolean);
    items.forEach(item => {
      // Very basic auto-categorization
      let cat = 'Pantry & Grains';
      const lower = item.toLowerCase();
      if (lower.match(/chicken|beef|pork|fish|tofu|egg/)) cat = 'Proteins';
      else if (lower.match(/apple|banana|carrot|onion|garlic|lettuce|tomato/)) cat = 'Produce';
      else if (lower.match(/milk|cheese|yogurt|butter/)) cat = 'Dairy & Cold';
      else if (lower.match(/salt|pepper|oil|sauce|sugar/)) cat = 'Spices, Oils & Sauces';
      
      onAddItem(item, cat);
    });
    setInputValue('');
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInputValue(prev => prev ? prev + ', ' + text : text);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <div className="space-y-6 pt-4 h-full flex flex-col">
      <header>
        <h2 className="text-2xl font-bold text-white mb-4">Master Inventory</h2>
        <form onSubmit={handleInputSubmit} className="relative flex items-center">
          <div className="absolute left-4 text-gray-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add ingredients..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button 
            type="button"
            onClick={handleMicClick}
            className={`absolute right-2 p-2 rounded-full transition-colors ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-gray-400 hover:text-white'}`}
          >
            <Mic size={20} />
          </button>
        </form>
      </header>

      <div className="flex-1 overflow-y-auto pb-20 space-y-6 hide-scrollbar">
        {CATEGORIES.map(category => {
          const items = pantryItems.filter(i => i.category === category.id);
          if (items.length === 0) return null;
          
          return (
            <div key={category.id}>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">{category.label}</h3>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => onToggleExpiring(item.id)}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all
                        ${item.expiringSoon 
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                          : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'}
                      `}
                    >
                      {item.name}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                        className="ml-1 p-0.5 rounded-full hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
        {pantryItems.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Your pantry is empty.</p>
            <p className="text-sm mt-2">Add some items above to get started.</p>
          </div>
        )}
      </div>

      {pantryItems.length > 0 && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none">
          <button 
            onClick={onGenerate}
            className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-transform hover:bg-emerald-500"
          >
            <Sparkles size={20} />
            Generate Meals
          </button>
        </div>
      )}
    </div>
  );
}
