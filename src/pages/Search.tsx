import React, { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { searchMovies, searchTVShows } from '../services/tmdb';
import { motion } from 'framer-motion';
import Carousel from '../components/ui/Carousel';
import { Spin } from '../components/ui/Spin'; // Ensure Spin component is imported
import { FaExclamationCircle } from 'react-icons/fa'; // For error icons
import type { PaginatedResponse, Movie, TVShow } from '../types/tmdb';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const searchType = searchParams.get('type') || 'all'; // Default to 'all' if no type is specified

  // Reset scroll to top when query or type changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query, searchType]);

  const movieQuery = useInfiniteQuery({
    queryKey: ['searchMovies', query],
    queryFn: ({ pageParam }) => searchMovies(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !!query && (searchType === 'movies' || searchType === 'all'),
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    retry: 1, // Only retry once on failure
  });

  const tvQuery = useInfiniteQuery({
    queryKey: ['searchTVShows', query],
    queryFn: ({ pageParam }) => searchTVShows(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<TVShow>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !!query && (searchType === 'tv' || searchType === 'all'),
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    retry: 1, // Only retry once on failure
  });

  const movieItems = movieQuery.data?.pages.flatMap((page) => page.results) || [];
  const tvItems = tvQuery.data?.pages.flatMap((page) => page.results) || [];

  const handleSearchTypeChange = (newType: string) => {
    // Only update if the type is different to avoid unnecessary re-renders/fetches
    if (searchType !== newType) {
      setSearchParams({ query, type: newType });
    }
  };

  const isInitialLoading = (searchType === 'all' && (movieQuery.isLoading || tvQuery.isLoading) && (!movieItems.length && !tvItems.length)) ||
                         (searchType === 'movies' && movieQuery.isLoading && !movieItems.length) ||
                         (searchType === 'tv' && tvQuery.isLoading && !tvItems.length);

  // --- Initial Page Loading State ---
  if (!query) {
    return (
      <div className="min-h-screen bg-netflix-dark text-white flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          What are you looking for?
        </h2>
        <p className="text-lg text-gray-400">
          Enter a search term in the navigation bar to find movies or TV shows.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-dark text-white">
      <div className="container mx-auto pt-20 pb-16 px-4 sm:px-6 md:px-8"> {/* Added padding for consistency */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg" // Added drop-shadow
        >
          Search Results for <span className="text-netflix-red">"{query}"</span>
        </motion.h2>

        {/* Search Type Buttons */}
        <div className="flex space-x-3 sm:space-x-4 mb-10"> {/* Adjusted spacing and increased margin-bottom */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-full text-base font-semibold transition-colors shadow-md ${searchType === 'all' ? 'bg-netflix-red text-white' : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm'}`}
            onClick={() => handleSearchTypeChange('all')}
          >
            All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-full text-base font-semibold transition-colors shadow-md ${searchType === 'movies' ? 'bg-netflix-red text-white' : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm'}`}
            onClick={() => handleSearchTypeChange('movies')}
          >
            Movies
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-full text-base font-semibold transition-colors shadow-md ${searchType === 'tv' ? 'bg-netflix-red text-white' : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm'}`}
            onClick={() => handleSearchTypeChange('tv')}
          >
            TV Shows
          </motion.button>
        </div>

        {isInitialLoading && (
          <div className="flex items-center justify-center py-16">
            <Spin className="w-12 h-12 text-netflix-red mr-4" />
            <p className="text-xl text-gray-300">Searching for results...</p>
          </div>
        )}

        {/* Movies Section */}
        {((searchType === 'movies' || searchType === 'all') && !isInitialLoading) && (
          <motion.section
            initial={{ opacity: 0, y: 50 }} // Consistent animation with other carousels
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800" // Consistent styling
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Movies</h3> {/* Consistent heading size */}
            {movieQuery.error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-red-500">
                <FaExclamationCircle className="text-5xl mb-4" />
                <p className="text-lg font-semibold">Error fetching movies:</p>
                <p className="text-sm">{(movieQuery.error as Error).message}</p>
              </div>
            ) : movieItems.length === 0 && !movieQuery.isLoading ? ( // Only show "no results" if not loading and no items
              <p className="text-gray-400 text-center text-lg py-8">
                No movies found for "<span className="font-semibold">{query}</span>".
              </p>
            ) : (
              <Carousel
                items={movieItems}
                isLoading={movieQuery.isFetchingNextPage || movieQuery.isLoading} // Indicate loading for initial and next pages
                hasNextPage={movieQuery.hasNextPage}
                loadMore={movieQuery.fetchNextPage}
              />
            )}
          </motion.section>
        )}

        {/* TV Shows Section */}
        {((searchType === 'tv' || searchType === 'all') && !isInitialLoading) && (
          <motion.section
            initial={{ opacity: 0, y: 50 }} // Consistent animation
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800" // Consistent styling
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-white">TV Shows</h3> {/* Consistent heading size */}
            {tvQuery.error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-red-500">
                <FaExclamationCircle className="text-5xl mb-4" />
                <p className="text-lg font-semibold">Error fetching TV shows:</p>
                <p className="text-sm">{(tvQuery.error as Error).message}</p>
              </div>
            ) : tvItems.length === 0 && !tvQuery.isLoading ? ( // Only show "no results" if not loading and no items
              <p className="text-gray-400 text-center text-lg py-8">
                No TV shows found for "<span className="font-semibold">{query}</span>".
              </p>
            ) : (
              <Carousel
                items={tvItems}
                isLoading={tvQuery.isFetchingNextPage || tvQuery.isLoading} // Indicate loading for initial and next pages
                hasNextPage={tvQuery.hasNextPage}
                loadMore={tvQuery.fetchNextPage}
              />
            )}
          </motion.section>
        )}

        {/* No results for the given query in either category (if 'all' is selected) */}
        {!isInitialLoading && query && searchType === 'all' && movieItems.length === 0 && tvItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <FaExclamationCircle className="text-netflix-red text-6xl mb-6" />
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">No Results Found</h3>
            <p className="text-lg text-gray-400 max-w-lg">
              We couldn't find any movies or TV shows matching "<span className="font-semibold">{query}</span>".
              Please try a different search term.
            </p>
          </motion.div>
        )}

        {/* Fallback for when there's an error on both movie and TV searches and 'all' is selected */}
        {!isInitialLoading && query && searchType === 'all' && movieQuery.error && tvQuery.error && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-red-500">
                <FaExclamationCircle className="text-6xl mb-4" />
                <p className="text-xl font-semibold mb-2">Failed to load search results.</p>
                <p className="text-sm">Please check your internet connection or try again later.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Search;