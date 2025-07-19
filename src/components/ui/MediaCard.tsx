import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaFilm } from 'react-icons/fa';
import { motion } from 'framer-motion';
import type { Movie, TVShow } from '../../types/tmdb';

type Media = Movie | TVShow;

interface MediaCardProps {
  media: Media;
}

const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  const title = 'title' in media ? media.title : media.name;
  const path = 'title' in media ? `/movie/${media.id}` : `/tv/${media.id}`;

  return (
    <Link to={path} className="block relative group w-full aspect-[2/3] rounded-lg overflow-hidden">
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 0, 0, 0.4)' }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full transform-gpu"
      >
        {media.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
            alt={title}
            className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center rounded-lg shadow-md p-4 text-center">
            <FaFilm className="text-gray-600 text-5xl mb-2" />
            <p className="text-gray-500 text-sm font-medium">No Poster Available</p>
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 transition-opacity duration-300 opacity-0 group-hover:opacity-100 rounded-lg p-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="flex items-center justify-center w-12 h-12 bg-netflix-red rounded-full text-white text-xl shadow-lg mb-2" // Bigger play button
          >
            <FaPlay />
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="text-white text-sm font-semibold text-center mt-2 max-w-[90%] truncate px-1" // Centered and wider text
          >
            {title}
          </motion.p>
        </div>
      </motion.div>
    </Link>
  );
};

export default MediaCard;