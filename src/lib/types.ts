export interface PantryItem {
  id: string;
  name: string;
  category: string;
  expiringSoon: boolean;
}

export interface Recipe {
  id: string;
  tier: string;
  title: string;
  foodEmoji: string;
  cookTime: string;
  difficulty: string;
  missingItem?: string;
  suggestedSwap?: string;
  ingredients: string[];
  instructions: string[];
  chefProTip: string;
  whyYoullLoveThis: string;
}

export interface SavedRecipe extends Recipe {
  servings: string;
  description: string;
  photoBase64: string | null;
  notes: string;
}
