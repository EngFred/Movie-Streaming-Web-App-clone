import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getTVShowDetails, getTVShowVideos, getSimilarTVShows, getPersonImages } from '../services/tmdb';
import { FaPlay, FaPlus, FaFilm, FaStar, FaTimes, FaCalendarAlt, FaUserTie, FaCheck } from 'react-icons/fa';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';
import { Dialog, Transition } from '@headlessui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Carousel from '../components/ui/Carousel';
import { Spin } from '../components/ui/Spin'; 
import type { TVShow, PaginatedResponse } from '../types/tmdb';

const TVShowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tvShowId = Number(id);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [addedToList, setAddedToList] = useState(false); // State for "My List" feedback
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 200], [0, 30]);

  // Query for TV show details
  const { data: tvShow, isLoading, error } = useQuery({
    queryKey: ['tvShowDetails', tvShowId],
    queryFn: () => getTVShowDetails(tvShowId),
    enabled: !!tvShowId,
  });

  // Query for TV show videos (trailers)
  const { data: videos, isLoading: isVideosLoading } = useQuery({
    queryKey: ['tvShowVideos', tvShowId],
    queryFn: () => getTVShowVideos(tvShowId),
    enabled: !!tvShowId,
  });

  // Infinite query for similar TV shows
  const {
    data: similarTVShows,
    isLoading: isSimilarLoading,
    fetchNextPage: fetchNextSimilar,
    hasNextPage: hasNextSimilar,
  } = useInfiniteQuery({
    queryKey: ['similarTVShows', tvShowId],
    queryFn: ({ pageParam }) => getSimilarTVShows(tvShowId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<TVShow>) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !!tvShowId,
  });

  // Query for cast member images
  const castQueries = useQuery({
    queryKey: ['castImages', tvShowId],
    queryFn: async () => {
      // Ensure tvShow and its credits.cast are available before proceeding
      if (!tvShow?.credits?.cast) {
        return [];
      }
      // Only take the top 8 cast members for display to limit API calls
      const topCast = tvShow.credits.cast.slice(0, 8);
      const imagePromises = topCast.map(async (actor) => {
        try {
          const img = await getPersonImages(actor.id);
          return {
            name: actor.name,
            id: actor.id,
            profile_path: img.profile_path,
            // Removed 'character' as it's not in your TVShow.credits.cast interface
          };
        } catch (err) {
          console.error(`Error fetching image for actor ${actor.name} (${actor.id}):`, err);
          return { name: actor.name, id: actor.id, profile_path: null };
        }
      });
      return Promise.all(imagePromises);
    },
    // Only enable this query if tvShowId exists and tvShow data has loaded with cast credits
    enabled: !!tvShowId && !!tvShow?.credits?.cast?.length,
    staleTime: Infinity, // Cast images don't change often
  });

  // Derived data based ONLY on provided TVShow interface
  const trailer = videos?.find((v) => v.type === 'Trailer' && v.key);
  const matchPercentage = Math.round((tvShow?.vote_average ?? 0) * 10);
  const similarItems = similarTVShows?.pages.flatMap((page) => page.results) || [];

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
    setTimeout(() => setAddedToList(false), 2000); // Reset icon after 2 seconds
  };

  // --- Loading States ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-dark text-white flex items-center justify-center">
        <Spin className="w-12 h-12 text-netflix-red mr-4" />
        <p className="text-xl">Loading TV show details...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error || !tvShow) {
    return (
      <div className="min-h-screen bg-netflix-dark text-white flex flex-col items-center justify-center p-8 text-center">
        <FaTimes className="text-red-500 text-6xl mb-4" />
        <p className="text-red-500 text-2xl font-bold mb-2">Oops! Something went wrong.</p>
        <p className="text-gray-400 text-lg">{(error as Error)?.message || 'The TV show you are looking for could not be found.'}</p>
        <button onClick={() => window.history.back()} className="mt-6 bg-netflix-red text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors">Go Back</button>
      </div>
    );
  }

  const posterUrl = tvShow.poster_path
    ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
    : null;
  const backdropUrl = tvShow.backdrop_path
    ? `https://image.tmdb.org/t/p/w1920${tvShow.backdrop_path}`
    : null;

  return (
    <div className="min-h-screen bg-netflix-dark text-white">
      {/* --- Hero Section --- */}
      <motion.div
        ref={heroRef}
        className="relative bg-cover bg-center h-[50vh] md:h-[80vh] flex items-end pb-16"
        style={{ backgroundImage: backdropUrl ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, transparent 100%), url(${backdropUrl})` : 'none', y }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-black/70 to-transparent z-0" />
        <div className="container mx-auto h-full flex items-end px-4 sm:px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-4xl pb-8 sm:pb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg">{tvShow.name}</h1>
            <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-6 line-clamp-3 drop-shadow">{tvShow.overview}</p>
            <div className="flex flex-wrap items-center gap-4">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="bg-green-600/90 text-white px-5 py-2.5 rounded-full text-base font-semibold shadow-md"
              >
                {matchPercentage}% Match
              </motion.span>
              <motion.button
                onClick={() => setIsTrailerOpen(true)}
                className="flex items-center space-x-2 px-7 py-3 sm:px-9 sm:py-4 rounded-full text-base sm:text-lg font-semibold bg-white text-black hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                disabled={isVideosLoading || !trailer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isVideosLoading ? <Spin className="w-5 h-5 text-gray-800" /> : <FaPlay />}
                <span>Play Trailer</span>
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
        </div>
      </motion.div>

      {/* --- Trailer Dialog --- */}
      <Transition show={isTrailerOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={() => setIsTrailerOpen(false)}>
          {/* First Transition.Child for the overlay */}
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
            {/* Second Transition.Child for the Dialog.Panel wrapper */}
            <Transition.Child
              as="div" 
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

      {/* --- Details Section --- */}
      <div className="container mx-auto pt-8 pb-16 px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-6 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={tvShow.name}
              className="w-full md:w-1/4 rounded-lg shadow-lg object-cover aspect-[2/3]"
              loading="lazy"
            />
          ) : (
            <div className="w-full md:w-1/4 bg-gray-800 flex items-center justify-center rounded-lg shadow-lg aspect-[2/3]">
              <FaFilm className="text-gray-500 text-4xl" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-xl sm:text-2xl ${
                      i < Math.round(tvShow.vote_average / 2) ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-3 text-lg sm:text-xl font-semibold">
                {tvShow.vote_average.toFixed(1)}/10
              </span>
            </div>
            <p className="text-sm sm:text-lg mb-8 leading-relaxed text-gray-300">{tvShow.overview}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-8">
              {/* First Air Date */}
              <div className="flex items-center text-gray-300">
                <FaCalendarAlt className="text-netflix-red text-xl mr-3 flex-shrink-0" />
                <div>
                  <span className="block text-sm font-semibold text-gray-400">First Aired</span>
                  <span className="text-base font-bold">
                    {tvShow.first_air_date || 'N/A'}
                  </span>
                </div>
              </div>
              {/* Seasons and Episodes */}
              <div className="flex items-center text-gray-300">
                <FaPlay className="text-netflix-red text-xl mr-3 flex-shrink-0" />
                <div>
                  <span className="block text-sm font-semibold text-gray-400">Total Seasons & Episodes</span>
                  <span className="text-base font-bold">
                    {tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}, {tvShow.number_of_episodes} Episode{tvShow.number_of_episodes !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              {/* Creator */}
              <div className="flex items-center text-gray-300">
                <FaUserTie className="text-netflix-red text-xl mr-3 flex-shrink-0" />
                <div>
                  <span className="block text-sm font-semibold text-gray-400">Creator</span>
                  <span className="text-base font-bold">
                    {tvShow.created_by?.[0]?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div> {/* End of grid for info */}

            {/* Genres */}
            <div className="mb-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white">Genres</h3>
                <div className="flex flex-wrap gap-2">
                    {Array.isArray(tvShow.genres) && tvShow.genres.length > 0 ? tvShow.genres.map((g) => (
                    <motion.button
                        key={g.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-700 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors"
                    >
                        {g.name}
                    </motion.button>
                    )) : <span className="text-gray-400 text-sm">No genres available.</span>}
                </div>
            </div>

            {/* Cast */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white">Top Cast</h3>
              {castQueries.isLoading ? (
                <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-none w-24 text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-2 animate-pulse">
                        <FaUserTie className="text-gray-500 text-3xl" />
                      </div>
                      <div className="h-3 bg-gray-700 rounded w-3/4 mx-auto mb-1"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/2 mx-auto"></div>
                    </div>
                  ))}
                </div>
              ) : castQueries.error ? (
                <p className="text-red-500 text-sm">Error loading cast: {(castQueries.error as Error).message}</p>
              ) : (
                <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                  {Array.isArray(castQueries.data) && castQueries.data.length > 0 ? castQueries.data.map((actor) => (
                    <motion.div
                      key={actor.id}
                      whileHover={{ scale: 1.05 }}
                      className="flex-none w-24 text-center cursor-pointer"
                    >
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-gray-700 hover:border-netflix-red transition-colors"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '';
                            e.currentTarget.classList.add('hidden');
                            const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallbackDiv) fallbackDiv.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-2">
                          <FaUserTie className="text-gray-500 text-3xl" />
                        </div>
                      )}
                      <p className="text-sm font-semibold truncate text-white">{actor.name}</p>
                      {/* Removed character display as it's not in your TVShow.credits.cast interface */}
                    </motion.div>
                  )) : <span className="text-gray-400 text-sm">No cast information available.</span>}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* --- More Like This Carousel --- */}
        {similarItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 bg-gray-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">More Like This</h2>
            <Carousel
              items={similarItems}
              isLoading={isSimilarLoading}
              hasNextPage={hasNextSimilar}
              loadMore={fetchNextSimilar}
            />
          </motion.section>
        )}
        {!isSimilarLoading && similarItems.length === 0 && (
            <p className="text-gray-400 text-center my-8">No similar TV shows found.</p>
        )}
      </div>
    </div>
  );
};

export default TVShowDetails;