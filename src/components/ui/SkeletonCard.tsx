import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="flex-none w-full aspect-[2/3] rounded-lg overflow-hidden"> {/* Match MediaCard aspect ratio */}
      <div className="relative w-full h-full bg-gray-900 animate-pulse rounded-lg shadow-lg">
        {/* Placeholder for image */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-700">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
        {/* Placeholder for overlay/title area */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent">
          <div className="h-4 bg-gray-700 rounded w-5/6 mb-2" /> {/* Title placeholder */}
          <div className="h-3 bg-gray-700 rounded w-1/2" /> {/* Subtitle/detail placeholder */}
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;