import { create } from 'zustand';

type SearchType = 'movies' | 'tv' | 'all';

interface SearchState {
  query: string;
  searchType: SearchType;
  setQuery: (query: string) => void;
  setSearchType: (searchType: SearchType) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  searchType: 'all',
  setQuery: (query) => set({ query }),
  setSearchType: (searchType) => set({ searchType }),
}));