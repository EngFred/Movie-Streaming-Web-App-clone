import React, { useRef, useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getFeaturedMovie,
  getPopularMovies,
  getTopRatedMovies,
  getNewReleases,
  getActionMovies,
  getTrendingMovies,
  getMovieVideos,
} from '../services/tmdb';
import { FaPlay, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';
import Carousel from '../components/ui/Carousel';
import { Spin } from '../components/ui/Spin';
import type { PaginatedResponse, Movie } from '../types/tmdb';

const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [addedToList, setAddedToList] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 200], [0, 30]);

  // --- Featured Movie Data ---
  const { data: featured, isLoading: isFeaturedLoading, error: featuredError } = useQuery({
    queryKey: ['featuredMovie'],
    queryFn: getFeaturedMovie,
    staleTime: 1000 * 60 * 60, // Cache featured movie for 1 hour
    retry: 1,
  });

  // --- Featured Movie Videos (for trailer) ---
  const { data: videos, isLoading: isVideosLoading } = useQuery({
    queryKey: ['featuredMovieVideos', featured?.id],
    queryFn: () => getMovieVideos(featured!.id),
    enabled: !!featured?.id,
    staleTime: 1000 * 60 * 30,
  });

  // --- NEW: Trending Movies Carousel ---
  const {
    data: trending,
    isLoading: isTrendingLoading,
    error: trendingError,
    fetchNextPage: fetchNextTrending,
    hasNextPage: hasNextTrending,
  } = useInfiniteQuery({
    queryKey: ['trendingMovies'],
    queryFn: ({ pageParam }) => getTrendingMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // Trending data changes more frequently
  });

  // --- Popular Movies Carousel ---
  const {
    data: popular,
    isLoading: isPopularLoading,
    error: popularError,
    fetchNextPage: fetchNextPopular,
    hasNextPage: hasNextPopular,
  } = useInfiniteQuery({
    queryKey: ['popularMovies'],
    queryFn: ({ pageParam }) => getPopularMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 10,
  });

  // --- Top Rated Movies Carousel ---
  const {
    data: topRated,
    isLoading: isTopRatedLoading,
    error: topRatedError,
    fetchNextPage: fetchNextTopRated,
    hasNextPage: hasNextTopRated,
  } = useInfiniteQuery({
    queryKey: ['topRatedMovies'],
    queryFn: ({ pageParam }) => getTopRatedMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 10,
  });

  // --- New Releases Movies Carousel ---
  const {
    data: newReleases,
    isLoading: isNewReleasesLoading,
    error: newReleasesError,
    fetchNextPage: fetchNextNewReleases,
    hasNextPage: hasNextNewReleases,
  } = useInfiniteQuery({
    queryKey: ['newReleases'],
    queryFn: ({ pageParam }) => getNewReleases(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 10,
  });

  // --- Action Movies Carousel ---
  const {
    data: actionMovies,
    isLoading: isActionMoviesLoading,
    error: actionMoviesError,
    fetchNextPage: fetchNextActionMovies,
    hasNextPage: hasNextActionMovies,
  } = useInfiniteQuery({
    queryKey: ['actionMovies'],
    queryFn: ({ pageParam }) => getActionMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 10,
  });

  // --- Derived Data for Carousels ---
  const trendingItems = trending?.pages.flatMap((page) => page.results) || [];
  const popularItems = popular?.pages.flatMap((page) => page.results) || [];
  const topRatedItems = topRated?.pages.flatMap((page) => page.results) || [];
  const newReleasesItems = newReleases?.pages.flatMap((page) => page.results) || [];
  const actionMoviesItems = actionMovies?.pages.flatMap((page) => page.results) || [];

  const trailer = videos?.find((v) => v.type === 'Trailer' && v.key);

  // YouTube player options
  const playerOpts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const handleAddToList = () => {
    setAddedToList(true);
    setTimeout(() => setAddedToList(false), 2000);
  };

  return (
    <div className="min-h-screen bg-netflix-dark text-white overflow-hidden">
      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        className="relative bg-cover bg-center h-[50vh] md:h-[80vh] flex items-end pb-16"
        style={{
          backgroundImage: featured?.backdrop_path
            ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, transparent 100%), url(https://image.tmdb.org/t/p/w1920${featured.backdrop_path})`
            : 'none',
          y,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-black/70 to-transparent z-0" />
        <div className="container mx-auto h-full flex items-end px-4 sm:px-6 md:px-8 relative z-10">
          {isFeaturedLoading ? (
            <div className="w-full h-1/2 bg-gray-700 animate-pulse rounded-lg" />
          ) : featuredError ? (
            <p className="text-red-500 text-center w-full text-lg">
              Error loading featured movie: {(featuredError as Error).message}
            </p>
          ) : (
            featured && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="max-w-4xl pb-8 sm:pb-12"
              >
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                  {featured.title}
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
                    <span>Play</span>
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
            )
          )}
        </div>
      </motion.div>

      {/* Trailer Dialog */}
      <Transition show={isTrailerOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={() => setIsTrailerOpen(false)}>
          <Transition.Child
            as="div"
            className="fixed inset-0 bg-black bg-opacity-90"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full max-w-7xl bg-netflix-dark rounded-xl overflow-hidden shadow-2xl relative"
              >
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
                    <YouTube videoId={trailer.key} opts={playerOpts} className="w-full aspect-video" />
                  )
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center bg-gray-900 p-8">
                    <p className="text-gray-400 text-lg text-center">
                      No trailer available for this title.
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Movie Carousels */}
      <div className="container mx-auto py-8 px-4 sm:px-6 md:px-8">
        {/* NEW: Trending Movies Section - Positioned first after hero */}
        {trendingError && (
          <p className="text-red-500 text-center my-8">
            Error loading trending movies: {(trendingError as Error).message}
          </p>
        )}
        {trendingItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Trending Now</h2>
            <Carousel
              items={trendingItems}
              isLoading={isTrendingLoading}
              hasNextPage={hasNextTrending}
              loadMore={fetchNextTrending}
            />
          </motion.section>
        )}
        {!isTrendingLoading && trendingItems.length === 0 && (
          <p className="text-gray-400 text-center my-8">No trending movies found.</p>
        )}

        {/* Popular Movies Section - Positioned second */}
        {popularError && (
          <p className="text-red-500 text-center my-8">
            Error loading popular movies: {(popularError as Error).message}
          </p>
        )}
        {popularItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Popular Movies</h2>
            <Carousel
              items={popularItems}
              isLoading={isPopularLoading}
              hasNextPage={hasNextPopular}
              loadMore={fetchNextPopular}
            />
          </motion.section>
        )}
        {!isPopularLoading && popularItems.length === 0 && (
          <p className="text-gray-400 text-center my-8">No popular movies found.</p>
        )}

        {/* Top Rated Movies Section - Positioned third */}
        {topRatedError && (
          <p className="text-red-500 text-center my-8">
            Error loading top-rated movies: {(topRatedError as Error).message}
          </p>
        )}
        {topRatedItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Top Rated</h2>
            <Carousel
              items={topRatedItems}
              isLoading={isTopRatedLoading}
              hasNextPage={hasNextTopRated}
              loadMore={fetchNextTopRated}
            />
          </motion.section>
        )}
        {!isTopRatedLoading && topRatedItems.length === 0 && (
          <p className="text-gray-400 text-center my-8">No top-rated movies found.</p>
        )}

        {/* New Releases Section - Positioned fourth */}
        {newReleasesError && (
          <p className="text-red-500 text-center my-8">
            Error loading new releases: {(newReleasesError as Error).message}
          </p>
        )}
        {newReleasesItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">New Releases</h2>
            <Carousel
              items={newReleasesItems}
              isLoading={isNewReleasesLoading}
              hasNextPage={hasNextNewReleases}
              loadMore={fetchNextNewReleases}
            />
          </motion.section>
        )}
        {!isNewReleasesLoading && newReleasesItems.length === 0 && (
          <p className="text-gray-400 text-center my-8">No new releases found.</p>
        )}

        {/* Action Movies Section - Positioned fifth */}
        {actionMoviesError && (
          <p className="text-red-500 text-center my-8">
            Error loading action movies: {(actionMoviesError as Error).message}
          </p>
        )}
        {actionMoviesItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mb-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Action Movies</h2>
            <Carousel
              items={actionMoviesItems}
              isLoading={isActionMoviesLoading}
              hasNextPage={hasNextActionMovies}
              loadMore={fetchNextActionMovies}
            />
          </motion.section>
        )}
        {!isActionMoviesLoading && actionMoviesItems.length === 0 && (
          <p className="text-gray-400 text-center my-8">No action movies found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;