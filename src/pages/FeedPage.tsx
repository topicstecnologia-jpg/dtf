import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { VerticalSwipeCard } from '../components/VerticalSwipeCard';
import { MatchModal } from '../components/MatchModal';
import { Button } from '../components/Button';
import { RefreshCw } from 'lucide-react';

export const FeedPage: React.FC = () => {
  const { movies, currentMovieIndex, swipeMovie, matches, user } = useApp();
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState<any>(null);

  // We show a stack of 3 movies
  const visibleMovies = movies.slice(currentMovieIndex, currentMovieIndex + 3);

  const handleSwipe = (direction: 'up' | 'down') => {
    // Map vertical swipe to left/right logic for now (or just next)
    // User said "drag down to show recommendations". 
    // Let's treat "drag down" as "Next" (Pass or Like, let's say Like for now as it's a discovery feed)
    // Or maybe Drag Down = Like, Drag Up = Pass?
    // Let's default to "Like" (Swipe Right equivalent) for Drag Down based on "show recommendations" context implying positive action?
    // Actually, usually pulling down is "refresh" or "discard".
    // Let's treat Drag Down as "Next" (Pass).
    swipeMovie(movies[currentMovieIndex].id, 'right'); 
  };

  React.useEffect(() => {
    if (matches.length > 0) {
      const newestMatch = matches[matches.length - 1];
      if (Date.now() - newestMatch.timestamp < 1000) {
        setLastMatch(newestMatch);
        setShowMatch(true);
      }
    }
  }, [matches]);

  if (visibleMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-white p-6 rounded-full mb-6 shadow-soft">
          <RefreshCw size={48} className="text-blue-500 animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-text-main">Isso é tudo por agora!</h2>
        <p className="text-gray-500 mb-8">Volte mais tarde para mais filmes.</p>
        <Button onClick={() => window.location.reload()} className="bg-text-main text-white rounded-full px-8">Atualizar Feed</Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-start pt-10 p-4 overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Header for Recommendations */}
      <div className="absolute top-6 left-0 right-0 text-center z-10">
        <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest">Recomendações</h2>
      </div>

      <AnimatePresence>
        {showMatch && (
          <MatchModal 
            match={lastMatch} 
            currentUser={user} 
            onClose={() => setShowMatch(false)}
            onChat={() => {
              setShowMatch(false);
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-sm h-[70vh] mt-8">
        {visibleMovies.map((movie, index) => (
          <VerticalSwipeCard 
            key={movie.id} 
            movie={movie} 
            index={index}
            onSwipe={handleSwipe} 
          />
        )).reverse()} 
        {/* Reverse so the first item (index 0) is rendered last (on top) */}
      </div>

      <div className="absolute bottom-8 text-white/30 text-xs animate-bounce">
        Arraste para cima
      </div>
    </div>
  );
};
