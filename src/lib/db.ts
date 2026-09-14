import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PantryChefDB extends DBSchema {
  favorites: {
    key: string;
    value: {
      id: string;
      title: string;
      description: string;
      cookTime: string;
      servings: string;
      photoBase64: string | null;
      notes: string;
      ingredients: string[];
      instructions: string[];
      foodEmoji: string;
      chefProTip: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<PantryChefDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<PantryChefDB>('pantry_chef_db', 1, {
      upgrade(db) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function getFavorites() {
  const db = await initDB();
  return db.getAll('favorites');
}

export async function saveFavorite(recipe: PantryChefDB['favorites']['value']) {
  const db = await initDB();
  await db.put('favorites', recipe);
}

export async function deleteFavorite(id: string) {
  const db = await initDB();
  await db.delete('favorites', id);
}

export function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas ctx not found'));
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
