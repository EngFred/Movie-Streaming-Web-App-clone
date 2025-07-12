import axios from 'axios';
import type { Movie, TVShow, PaginatedResponse, Genre } from '../types/tmdb';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

if (!API_KEY) {
  throw new Error('VITE_TMDB_API_KEY is not defined in .env');
}

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const getMovieGenres = async (): Promise<Genre[]> => {
  const response = await tmdbApi.get('/genre/movie/list');
  return response.data.genres;
};

export const getTVGenres = async (): Promise<Genre[]> => {
  const response = await tmdbApi.get('/genre/tv/list');
  return response.data.genres;
};

export const getPopularMovies = async (page = 1, genreId?: number): Promise<PaginatedResponse<Movie>> => {
  const response = await tmdbApi.get('/movie/popular', {
    params: { page, with_genres: genreId },
  });
  return response.data;
};

export const getTopRatedMovies = async (page = 1, genreId?: number): Promise<PaginatedResponse<Movie>> => {
  const response = await tmdbApi.get('/movie/top_rated', {
    params: { page, with_genres: genreId },
  });
  return response.data;
};

export const getTrendingMovies = async (page = 1): Promise<PaginatedResponse<Movie>> => {
  const response = await tmdbApi.get('/trending/movie/day', {
    params: { page },
  });
  return response.data;
};

export const getNewReleases = async (page = 1): Promise<PaginatedResponse<Movie>> => {
  const response = await tmdbApi.get('/movie/now_playing', {
    params: { page },
  });
  return response.data;
};

export const getActionMovies = async (page = 1): Promise<PaginatedResponse<Movie>> => {
  const response = await tmdbApi.get('/discover/movie', {
    params: { page, with_genres: 28 },
  });
  return response.data;
};

export const getFeaturedMovie = async (): Promise<Movie> => {
  const response = await tmdbApi.get('/movie/now_playing');
  return response.data.results[0];
};

export const getTVShows = async (page = 1, genreId?: number): Promise<PaginatedResponse<TVShow>> => {
  const response = await tmdbApi.get('/tv/popular', {
    params: { page, with_genres: genreId },
  });
  return response.data;
};

export const getTrendingTV = async (page = 1): Promise<PaginatedResponse<TVShow>> => {
  const response = await tmdbApi.get('/trending/tv/day', {
    params: { page },
  });
  return response.data;
};

export const getTopRatedTV = async (page = 1): Promise<PaginatedResponse<TVShow>> => {
  const response = await tmdbApi.get('/tv/top_rated', {
    params: { page },
  });
  return response.data;
};

export const getComedySeries = async (page = 1): Promise<PaginatedResponse<TVShow>> => {
  const response = await tmdbApi.get('/discover/tv', {
    params: { page, with_genres: 35 },
  });
  return response.data;
};

export const getMovieDetails = async (id: number): Promise<Movie> => {
  const response = await tmdbApi.get(`/movie/${id}`, {
    params: { append_to_response: 'credits' },
  });
  return response.data;
};

export const getTVShowDetails = async (id: number): Promise<TVShow> => {
  const response = await tmdbApi.get(`/tv/${id}`, {
    params: { append_to_response: 'credits' },
  });
  return response.data;
};

export const searchMovies = async (query: string, page = 1): Promise<PaginatedResponse<Movie>> => {
  const response = await tmdbApi.get('/search/movie', {
    params: { query, page },
  });
  return response.data;
};

export const searchTVShows = async (query: string, page = 1): Promise<PaginatedResponse<TVShow>> => {
  const response = await tmdbApi.get('/search/tv', {
    params: { query, page },
  });
  return response.data;
};

export const getMovieVideos = async (id: number): Promise<{ key: string; type: string }[]> => {
  const response = await tmdbApi.get(`/movie/${id}/videos`);
  return response.data.results;
};

export const getTVShowVideos = async (id: number): Promise<{ key: string; type: string }[]> => {
  const response = await tmdbApi.get(`/tv/${id}/videos`);
  return response.data.results;
};

export const getSimilarMovies = async (id: number, page = 1): Promise<PaginatedResponse<Movie>> => {
  const response = await tmdbApi.get(`/movie/${id}/similar`, {
    params: { page },
  });
  return response.data;
};

export const getSimilarTVShows = async (id: number, page = 1): Promise<PaginatedResponse<TVShow>> => {
  const response = await tmdbApi.get(`/tv/${id}/similar`, {
    params: { page },
  });
  return response.data;
};

export const getPersonImages = async (personId: number): Promise<{ profile_path: string | null }> => {
  try {
    const response = await tmdbApi.get(`/person/${personId}/images`);
    return response.data.profiles[0] || { profile_path: null };
  } catch (err) {
    console.error(`Error fetching person images for ID ${personId}:`, err);
    return { profile_path: null };
  }
};