import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSearchStore } from '../../store/searchStore';
import { FiSearch, FiMenu, FiX, FiInfo } from 'react-icons/fi'; // Import FiInfo icon
import { motion, AnimatePresence } from 'framer-motion';
import { useBreakpoint } from '../../hooks/useBP';
import { Dialog, Transition } from '@headlessui/react'; // Import Dialog and Transition

const Navbar: React.FC = () => {
  const { query, setQuery, searchType, setSearchType } = useSearchStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false); // New state for About dialog

  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const isSmallScreen = isMobile || isTablet;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDesktop && isMenuOpen) {
      const timer = setTimeout(() => {
        setIsMenuOpen(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDesktop, isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}&type=${searchType}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black shadow-lg' : 'bg-transparent'} ${isMenuOpen ? 'bg-black' : 'backdrop-blur-md bg-black/70'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 md:px-8">
        {/* Logo */}
        <NavLink
          to="/"
          onClick={() => { setIsMenuOpen(false); setIsAboutOpen(false); }} // Close About dialog too
          className="text-netflix-red font-extrabold text-2xl tracking-wide drop-shadow-lg flex-shrink-0"
        >
          Netflix Clone
        </NavLink>

        {/* Desktop/Tablet Nav & Info Button */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-0"> {/* Adjusted gap for better spacing */}
          {isDesktop && (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors relative group ${
                    isActive ? 'text-netflix-red' : 'text-gray-200 hover:text-white'
                  }`
                }
              >
                Home
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-netflix-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </NavLink>
              <NavLink
                to="/tv"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors relative group ${
                    isActive ? 'text-netflix-red' : 'text-gray-200 hover:text-white'
                  }`
                }
              >
                TV Shows
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-netflix-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </NavLink>

              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="flex items-center bg-gray-800/80 rounded-full focus-within:ring-2 focus-within:ring-netflix-red transition-all duration-200 shadow-inner flex-grow max-w-sm">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'movies' | 'tv' | 'all')}
                  className="bg-transparent text-white text-sm pl-4 pr-1 py-2 focus:outline-none appearance-none cursor-pointer border-r border-gray-700"
                >
                  <option value="all">All</option>
                  <option value="movies">Movies</option>
                  <option value="tv">TV Shows</option>
                </select>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-white px-2 py-2 text-sm w-full focus:outline-none placeholder-gray-400 min-w-[80px]"
                />
                <motion.button
                  type="submit"
                  className="bg-netflix-red px-3 py-2 text-white hover:bg-red-700 h-full flex items-center justify-center rounded-r-full flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Perform search"
                >
                  <FiSearch />
                </motion.button>
              </form>
            </>
          )}

          {/* Info Icon Button (visible on all screen sizes in main nav for simplicity) */}
          <motion.button
            onClick={() => setIsAboutOpen(true)}
            className="text-gray-300 text-xl sm:text-2xl p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="About this website"
          >
            <FiInfo />
          </motion.button>

          {/* Mobile menu icon (only shown when not desktop) */}
          {isSmallScreen && (
            <button
              className="text-white text-3xl p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown: Show if it's a small screen (mobile OR tablet) AND the menu is open */}
      <AnimatePresence>
        {isSmallScreen && isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 w-full bg-black/90 shadow-xl overflow-hidden py-4 border-t border-gray-800"
          >
            <nav className="flex flex-col items-center justify-center space-y-3 px-4">
                <NavLink
                to="/"
                onClick={() => { setIsMenuOpen(false); setIsAboutOpen(false); }}
                className="block w-full max-w-xs text-center text-lg font-medium py-3 px-3 rounded-lg hover:bg-white/10 hover:text-netflix-red transition-all focus:outline-none focus:ring-2 focus:ring-netflix-red"
                >
                Home
                </NavLink>
                <NavLink
                to="/tv"
                onClick={() => { setIsMenuOpen(false); setIsAboutOpen(false); }}
                className="block w-full max-w-xs text-center text-lg font-medium py-3 px-3 rounded-lg hover:bg-white/10 hover:text-netflix-red transition-all focus:outline-none focus:ring-2 focus:ring-netflix-red"
                >
                TV Shows
                </NavLink>

                {/* Mobile search */}
                <form onSubmit={handleSearch} className="w-full max-w-xs space-y-4 pt-6 border-t border-gray-700 mt-4">
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'movies' | 'tv' | 'all')}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red appearance-none cursor-pointer text-base"
                >
                    <option value="all">All Categories</option>
                    <option value="movies">Movies</option>
                    <option value="tv">TV Shows</option>
                </select>
                <div className="relative">
                    <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search titles..."
                    className="w-full bg-gray-700 text-white px-4 py-3 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red placeholder-gray-400 text-base"
                    />
                    <FiSearch className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 text-lg" />
                </div>
                <motion.button
                    type="submit"
                    className="w-full bg-netflix-red text-white py-3 rounded-md hover:bg-red-700 transition-colors text-lg font-semibold shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Perform mobile search"
                >
                    Search
                </motion.button>
                </form>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NEW: About Engineer Fred Dialog --- */}
      <Transition show={isAboutOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={() => setIsAboutOpen(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-80" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-netflix-dark p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white text-center mb-4">
                  About This Project
                </Dialog.Title>
                <div className="mt-2 text-center">
                  <p className="text-lg text-gray-300 mb-4">
                    This Netflix Clone was passionately crafted by:
                  </p>
                  <p className="text-netflix-red text-3xl font-extrabold mb-6">
                    Enginner Fred
                  </p>
                  <p className="text-sm text-gray-400">
                    A demonstration of modern web development skills using React, TypeScript, Tailwind CSS, and TanStack Query.
                  </p>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-netflix-red px-6 py-2 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-netflix-red focus-visible:ring-offset-2 transition-colors"
                    onClick={() => setIsAboutOpen(false)}
                  >
                    Awesome!
                  </button>
                </div>
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  aria-label="Close about dialog"
                >
                  <FiX className="text-xl" />
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </nav>
  );
};

export default Navbar;