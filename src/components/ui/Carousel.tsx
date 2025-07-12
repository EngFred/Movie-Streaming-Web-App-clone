import React, { useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import type { Movie, TVShow } from '../../types/tmdb';
import MediaCard from './MediaCard';
import SkeletonCard from './SkeletonCard';
import { motion } from 'framer-motion'; // Import motion
import { Spin } from './Spin';

type Media = Movie | TVShow;

interface CarouselProps {
  items: Media[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  loadMore?: () => void;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  isLoading = false,
  hasNextPage = false,
  loadMore,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollAmount = 300; // Pixels to scroll

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      // Trigger loadMore if near end of scroll when scrolling right
      if (scrollRef.current.scrollWidth - scrollRef.current.scrollLeft - scrollRef.current.clientWidth < scrollAmount * 2 && hasNextPage && !isLoading) {
        loadMore?.();
      }
    }
  };

  return (
    <section className="relative group"> {/* Added group for button hover */}
      {/* Scroll Buttons */}
      <motion.button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 text-white rounded-full p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center" // Hidden on smaller screens by default
        disabled={isLoading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Scroll left"
      >
        <FaArrowLeft />
      </motion.button>
      <motion.button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 text-white rounded-full p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center" // Hidden on smaller screens by default
        disabled={isLoading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Scroll right"
      >
        <FaArrowRight />
      </motion.button>

      <div
        ref={scrollRef}
        className="flex overflow-x-scroll space-x-4 pb-4 scrollbar-hide snap-x snap-mandatory px-2" // Added snap-x and px-2
      >
        {isLoading && items.length === 0 ? ( // Only show skeletons if no items yet
          Array.from({ length: 6 }).map((_, index) => ( // Show more skeletons
            <div key={index} className="flex-none w-40 sm:w-48 md:w-56 lg:w-64 snap-center"> {/* Responsive widths */}
              <SkeletonCard />
            </div>
          ))
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex-none w-40 sm:w-48 md:w-56 lg:w-64 snap-center"> {/* Responsive widths */}
              <MediaCard media={item} />
            </div>
          ))
        )}
        {hasNextPage && (
          <div className="flex-none w-40 sm:w-48 md:w-56 lg:w-64 flex items-center justify-center p-4 snap-center">
            <motion.button
              onClick={loadMore}
              className="bg-netflix-red text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-lg"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <>
                  <Spin className="w-5 h-5" /> <span>Loading...</span>
                </>
              ) : (
                'Load More'
              )}
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Carousel;