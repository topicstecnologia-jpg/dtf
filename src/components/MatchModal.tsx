import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match, User } from '../types';
import { X, MessageCircle, Heart } from 'lucide-react';
import { Button } from './Button';

interface MatchModalProps {
  match: Match | null;
  currentUser: User | null;
  onClose: () => void;
  onChat: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ match, currentUser, onClose, onChat }) => {
  if (!match || !currentUser) return null;

  const otherUserId = match.userIds.find(id => id !== currentUser.id);
  const otherUser = { 
    id: otherUserId, 
    name: 'Cinéfilo', 
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' 
  }; 

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-light-bg/90 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="w-full max-w-md relative flex flex-col items-center"
        >
          <button 
            onClick={onClose}
            className="absolute -top-12 left-0 p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-900 transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Tilted Cards Animation */}
          <div className="relative w-full h-80 flex justify-center items-center mb-8">
            <motion.div 
              initial={{ rotate: -15, x: -50, opacity: 0 }}
              animate={{ rotate: -10, x: -20, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="absolute w-48 h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white z-10"
            >
              <img src={currentUser.avatarUrl} alt="You" className="w-full h-full object-cover" />
            </motion.div>
            
            <motion.div 
              initial={{ rotate: 15, x: 50, opacity: 0 }}
              animate={{ rotate: 10, x: 20, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="absolute w-48 h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white z-0"
            >
              <img src={otherUser.avatarUrl} alt="Match" className="w-full h-full object-cover" />
            </motion.div>

            {/* Heart Icon in Center */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="absolute z-20 bg-white p-4 rounded-full shadow-lg"
            >
              <Heart size={32} className="text-blue-400 fill-current" />
            </motion.div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-display font-bold text-text-main mb-2">
              Deu Match!
            </h2>
            <p className="text-gray-500">
              Você e {otherUser.name} têm {match.compatibility.overall}% de compatibilidade.
            </p>
          </div>

          <div className="w-full space-y-4 px-8">
            <Button 
              onClick={onChat}
              className="w-full bg-text-main text-white hover:bg-gray-800 font-bold py-4 rounded-full shadow-lg flex items-center justify-center space-x-2 h-14"
            >
              <MessageCircle size={20} />
              <span>Enviar Mensagem</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
