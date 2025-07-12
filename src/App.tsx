import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import TVShows from './pages/TVShows';
import Search from './pages/Search';
import TVShowDetails from './pages/TVShowDetails';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-16"> {/* pt-16 to account for fixed Navbar height */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/tv/:id" element={<TVShowDetails />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;