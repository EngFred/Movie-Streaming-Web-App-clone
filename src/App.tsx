import React, { Suspense } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';

const Home = React.lazy(() => import('./pages/Home'));
const MovieDetails = React.lazy(() => import('./pages/MovieDetails'));
const TVShows = React.lazy(() => import('./pages/TVShows'));
const Search = React.lazy(() => import('./pages/Search'));
const TVShowDetails = React.lazy(() => import('./pages/TVShowDetails'));


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-16"> {/* pt-16 to account for fixed Navbar height */}
          {/* Wrapping Routes with Suspense */}
          <Suspense fallback={<div className="text-white text-center p-8 text-xl">Loading content...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/tv" element={<TVShows />} />
              <Route path="/tv/:id" element={<TVShowDetails />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;