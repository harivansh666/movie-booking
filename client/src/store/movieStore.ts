import { create } from 'zustand';
import type { MovieStoreState } from '@/types';

const getFavorites = (): number[] => {
  try { return JSON.parse(localStorage.getItem('cinebook_favorites') || '[]'); } catch { return []; }
};

export const useMovieStore = create<MovieStoreState>((set, get) => ({
  favorites: getFavorites(),

  toggleFavorite: (movieId) => {
    const current = get().favorites;
    const next = current.includes(movieId)
      ? current.filter(id => id !== movieId)
      : [...current, movieId];
    localStorage.setItem('cinebook_favorites', JSON.stringify(next));
    set({ favorites: next });
  },

  isFavorite: (movieId) => get().favorites.includes(movieId),
}));
