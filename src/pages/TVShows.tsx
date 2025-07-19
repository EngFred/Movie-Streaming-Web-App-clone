import React, { useRef, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getTVShows, getTrendingTV, getTopRatedTV, getComedySeries, getTVShowVideos } from '../services/tmdb';
import { FaPlay, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';
import Carousel from '../components/ui/Carousel';
import type { PaginatedResponse, TVShow } from '../types/tmdb';
import { Spin } from '../components/ui/Spin';

const TVShows: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [addedToList, setAddedToList] = useState(false); // New state for "My List" feedback
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 200], [0, 30]);

  // Query for the featured TV show (first result of general TV shows)
  const { data: featured, isLoading: isFeaturedLoading, error: featuredError } = useQuery({
    queryKey: ['featuredTVShow'],
    queryFn: async () => {
      // Fetching the first result as the featured TV show
      const response = await getTVShows(1);
      if (response.results.length === 0) {
        throw new Error("No featured TV show found.");
      }
      return response.results[0];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once
  });

  // Query for videos (trailers) of the featured TV show
  const { data: videos, isLoading: isVideosLoading } = useQuery({
    queryKey: ['featuredTVShowVideos', featured?.id],
    queryFn: () => getTVShowVideos(featured!.id),
    enabled: !!featured?.id, // Only enable if featured TV show ID is available
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Infinite query for Popular TV Shows
  const {
    data: popular,
    isLoading: isPopularLoading,
    error: popularError,
    fetchNextPage: fetchNextPopular,
    hasNextPage: hasNextPopular,
  } = useInfiniteQuery({
    queryKey: ['tvShows'],
    queryFn: ({ pageParam }) => getTVShows(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<TVShow>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Infinite query for Trending TV Shows
  const {
    data: trending,
    isLoading: isTrendingLoading,
    error: trendingError,
    fetchNextPage: fetchNextTrending,
    hasNextPage: hasNextTrending,
  } = useInfiniteQuery({
    queryKey: ['trendingTV'],
    queryFn: ({ pageParam }) => getTrendingTV(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<TVShow>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Infinite query for Top Rated TV Shows
  const {
    data: topRated,
    isLoading: isTopRatedLoading,
    error: topRatedError,
    fetchNextPage: fetchNextTopRated,
    hasNextPage: hasNextTopRated,
  } = useInfiniteQuery({
    queryKey: ['topRatedTV'],
    queryFn: ({ pageParam }) => getTopRatedTV(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<TVShow>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Infinite query for Comedy Series
  const {
    data: comedySeries,
    isLoading: isComedySeriesLoading,
    error: comedySeriesError,
    fetchNextPage: fetchNextComedySeries,
    hasNextPage: hasNextComedySeries,
  } = useInfiniteQuery({
    queryKey: ['comedySeries'],
    queryFn: ({ pageParam }) => getComedySeries(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<TVShow>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Flatten the paginated results into single arrays for carousels
  const popularItems = popular?.pages.flatMap((page) => page.results) || [];
  const trendingItems = trending?.pages.flatMap((page) => page.results) || [];
  const topRatedItems = topRated?.pages.flatMap((page) => page.results) || [];
  const comedySeriesItems = comedySeries?.pages.flatMap((page) => page.results) || [];
  
  // Find the trailer from the fetched videos
  const trailer = videos?.find((v) => v.type === 'Trailer' && v.key);

  // YouTube player options
  const playerOpts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0, // Prevent related videos
    },
  };

  const handleAddToList = () => {
    setAddedToList(true);
    // In a real app, you'd trigger a backend action here to add to a user's list
    setTimeout(() => setAddedToList(false), 2000); // Reset icon after 2 seconds
  };

  // --- Initial Loading State for the entire page (before any data loads) ---
  if (isFeaturedLoading && !featuredError) { // Check featured loading, as it drives the hero
    return (
      <div className="min-h-screen bg-netflix-dark text-white flex items-center justify-center">
        <Spin className="w-12 h-12 text-netflix-red mr-4" />
        <p className="text-xl">Loading TV show categories...</p>
      </div>
    );
  }

  // --- Error State for the featured section ---
  // If featured movie fails to load, display an error for the hero, but allow other sections to load
  const showHeroError = featuredError && !featured;

  return (
    <div className="min-h-screen bg-netflix-dark text-white overflow-hidden">
      {/* --- Hero Section --- */}
      <motion.div
        ref={heroRef}
        className="relative bg-cover bg-center h-[50vh] md:h-[80vh] flex items-end pb-16" // Adjusted height and padding
        style={{ backgroundImage: featured?.backdrop_path ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, transparent 100%), url(https://image.tmdb.org/t/p/w1920${featured.backdrop_path})` : 'none', y }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-black/70 to-transparent z-0" />
        <div className="container mx-auto h-full flex items-end px-4 sm:px-6 md:px-8 relative z-10">
          {isFeaturedLoading && ( // Show skeleton while featured is loading
            <div className="w-full h-1/2 bg-gray-700 animate-pulse rounded-lg flex items-center justify-center p-4">
               <Spin className="w-8 h-8 text-gray-400" />
            </div>
          )}
          {showHeroError && ( // Show error if featured failed
            <p className="text-red-500 text-center w-full text-lg mb-8">
              Error loading featured TV show: {(featuredError as Error).message}
            </p>
          )}
          {featured && !isFeaturedLoading && !showHeroError && ( // Show featured content when loaded and no error
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="max-w-4xl pb-8 sm:pb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                {featured.name} {/* Use 'name' for TVShow */}
              </h1>
              <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-6 line-clamp-3 drop-shadow">
                {featured.overview}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <motion.button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center space-x-2 px-7 py-3 sm:px-9 sm:py-4 rounded-full text-base sm:text-lg font-semibold bg-white text-black hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  disabled={isVideosLoading || !trailer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isVideosLoading ? <Spin className="w-5 h-5 text-gray-800" /> : <FaPlay />}
                  <span>Play Trailer</span> {/* Changed to Play Trailer for TV shows */}
                </motion.button>
                <motion.button
                  onClick={handleAddToList}
                  className="flex items-center space-x-2 px-7 py-3 sm:px-9 sm:py-4 rounded-full text-base sm:text-lg font-semibold bg-gray-800/70 text-white hover:bg-gray-700/80 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {addedToList ? <FaCheck className="text-green-400" /> : <FaPlus />}
                  <span>{addedToList ? 'Added!' : 'My List'}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* --- Trailer Dialog --- */}
      <Transition show={isTrailerOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={() => setIsTrailerOpen(false)}>
          {/* First Transition.Child for the overlay */}
          <Transition.Child
            as="div" // Explicitly render a div for the overlay
            className="fixed inset-0 bg-black bg-opacity-90"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            {/* Second Transition.Child for the Dialog.Panel wrapper */}
            <Transition.Child
              as="div" // Explicitly render a div to wrap the Dialog.Panel
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl bg-netflix-dark rounded-xl overflow-hidden shadow-2xl relative">
                <button
                  onClick={() => setIsTrailerOpen(false)}
                  className="absolute top-4 right-4 text-white bg-gray-900/70 rounded-full p-3 hover:bg-gray-700/80 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  aria-label="Close trailer"
                >
                  <FaTimes className="text-xl" />
                </button>
                {trailer ? (
                  isVideosLoading ? (
                    <div className="w-full aspect-video flex items-center justify-center bg-gray-900">
                      <Spin className="w-12 h-12 text-netflix-red" />
                      <p className="text-gray-400 ml-4">Loading trailer...</p>
                    </div>
                  ) : (
                    <YouTube
                      videoId={trailer.key}
                      opts={playerOpts}
                      className="w-full aspect-video"
                    />
                  )
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center bg-gray-900 p-8">
                    <p className="text-gray-400 text-lg text-center">No trailer available for this title.</p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* --- Carousels Section --- */}
      <div className="container mx-auto py-8 px-4 sm:px-6 md:px-8">
        {/* Trending TV */}
        {trendingError && (
          <p className="text-red-500 text-center my-8">Error loading trending TV shows: {(trendingError as Error).message}</p>
        )}
        {trendingItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Trending TV</h2>
            <Carousel
              items={trendingItems}
              isLoading={isTrendingLoading}
              hasNextPage={hasNextTrending}
              loadMore={fetchNextTrending}
            />
          </motion.section>
        )}
        {!isTrendingLoading && trendingItems.length === 0 && !trendingError && (
          <p className="text-gray-400 text-center my-8">No trending TV shows found.</p>
        )}

        {/* Popular TV Shows */}
        {popularError && (
          <p className="text-red-500 text-center my-8">Error loading popular TV shows: {(popularError as Error).message}</p>
        )}
        {popularItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Popular TV Shows</h2>
            <Carousel
              items={popularItems}
              isLoading={isPopularLoading}
              hasNextPage={hasNextPopular}
              loadMore={fetchNextPopular}
            />
          </motion.section>
        )}
        {!isPopularLoading && popularItems.length === 0 && !popularError && (
          <p className="text-gray-400 text-center my-8">No popular TV shows found.</p>
        )}

        {/* Top Rated TV */}
        {topRatedError && (
          <p className="text-red-500 text-center my-8">Error loading top-rated TV shows: {(topRatedError as Error).message}</p>
        )}
        {topRatedItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Top Rated TV</h2>
            <Carousel
              items={topRatedItems}
              isLoading={isTopRatedLoading}
              hasNextPage={hasNextTopRated}
              loadMore={fetchNextTopRated}
            />
          </motion.section>
        )}
        {!isTopRatedLoading && topRatedItems.length === 0 && !topRatedError && (
          <p className="text-gray-400 text-center my-8">No top-rated TV shows found.</p>
        )}

        {/* Comedy Series */}
        {comedySeriesError && (
          <p className="text-red-500 text-center my-8">Error loading comedy series: {(comedySeriesError as Error).message}</p>
        )}
        {comedySeriesItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Comedy Series</h2>
            <Carousel
              items={comedySeriesItems}
              isLoading={isComedySeriesLoading}
              hasNextPage={hasNextComedySeries}
              loadMore={fetchNextComedySeries}
            />
          </motion.section>
        )}
        {!isComedySeriesLoading && comedySeriesItems.length === 0 && !comedySeriesError && (
          <p className="text-gray-400 text-center my-8">No comedy series found.</p>
        )}
      </div>
    </div>
  );
};

export default TVShows;