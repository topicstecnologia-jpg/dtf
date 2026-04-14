import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOCK_USERS } from '../data/mock';
import { MessageCircle, Search } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const { matches, user } = useApp();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-text-main">Conversas</h1>
        <button className="p-2 bg-white rounded-full shadow-sm text-gray-400">
          <Search size={20} />
        </button>
      </div>

      {/* Stories / New Matches Section */}
      <div className="space-y-2">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center space-y-1 min-w-[70px]">
              <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-400">Vazio</span>
              </div>
            </div>
          ) : (
            matches.map((match) => {
              const otherUserId = match.userIds.find(id => id !== user?.id);
              const otherUser = MOCK_USERS.find(u => u.id === otherUserId);
              if (!otherUser) return null;
              
              return (
                <div 
                  key={match.id} 
                  className="flex flex-col items-center space-y-1 min-w-[70px] cursor-pointer"
                  onClick={() => navigate(`/chat/${match.id}`)}
                >
                  <div className="relative">
                    <img 
                      src={otherUser.avatarUrl} 
                      alt={otherUser.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 p-0.5"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-xs font-medium text-text-main truncate w-full text-center">{otherUser.name}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mensagens</h2>
        
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <MessageCircle size={32} className="text-gray-300 mb-2" />
            <p className="text-gray-400 text-sm">Nenhuma conversa ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => {
              const otherUserId = match.userIds.find(id => id !== user?.id);
              const otherUser = MOCK_USERS.find(u => u.id === otherUserId);
              if (!otherUser) return null;

              return (
                <div 
                  key={match.id} 
                  className="bg-white rounded-2xl p-4 flex items-center space-x-4 shadow-sm border border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/chat/${match.id}`)}
                >
                  <div className="relative">
                    <img 
                      src={otherUser.avatarUrl} 
                      alt={otherUser.name} 
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-text-main truncate">{otherUser.name}</h3>
                      <span className="text-xs text-gray-400">Agora</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">Vocês deram match! Diga oi.</p>
                  </div>
                  
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    1
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
