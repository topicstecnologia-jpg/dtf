import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOCK_USERS, MOVIES } from '../data/mock';
import { ArrowLeft, MoreHorizontal, MessageCircle, Grid, Play, Repeat, Heart, Share2, Bell, UserPlus, ChevronDown, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, startChat, matches } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'images' | 'reposts' | 'favorites'>('images');

  // Determine which user profile to show
  const isCurrentUser = !userId || userId === currentUser?.id;
  const profileUser = isCurrentUser ? currentUser : MOCK_USERS.find(u => u.id === userId);

  if (!profileUser) return <div className="p-8 text-center text-white bg-black min-h-screen">Usuário não encontrado</div>;

  const match = matches.find(m => 
    m.userIds.includes(currentUser?.id || '') && 
    m.userIds.includes(profileUser.id)
  );
  
  const compatibility = match?.compatibility.overall || (isCurrentUser ? null : Math.floor(Math.random() * 20) + 75);

  const handleMessage = () => {
    if (isCurrentUser) return;
    const matchId = startChat(profileUser.id);
    navigate(`/chat/${matchId}`);
  };

  const stats = profileUser.stats || { following: 0, followers: 0, creations: 0 };
  const posts = profileUser.posts || [];
  
  // Get favorite movies
  const favoriteMovies = (profileUser.favoriteMovies || []).map(id => MOVIES.find(m => m.id === id)).filter(Boolean);

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'images') return post.type === 'image' || post.type === 'video'; // Combining for demo
    if (activeTab === 'reposts') return post.type === 'repost';
    return false;
  });

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="flex justify-between items-center p-4 sticky top-0 bg-black z-50">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <div className="font-bold text-lg">{profileUser.name}</div>
        <div className="flex space-x-4">
          <Bell size={24} />
          <Share2 size={24} />
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center px-4 pt-2 pb-6">
        <div className="relative mb-4">
          <img 
            src={profileUser.avatarUrl} 
            alt={profileUser.name} 
            className="w-24 h-24 rounded-full object-cover border-2 border-black"
          />
        </div>
        
        <div className="flex items-center space-x-1 mb-2">
          <h1 className="text-xl font-bold">{profileUser.handle || `@${profileUser.name.toLowerCase()}`}</h1>
          <div className="bg-blue-500 rounded-full p-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {compatibility && !isCurrentUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center space-x-2 bg-[#3F1521]/10 border border-[#3F1521]/20 px-4 py-1.5 rounded-full shadow-sm"
          >
            <Heart size={14} className="text-[#3F1521] fill-[#3F1521]" />
            <span className="text-xs font-bold text-[#3F1521] uppercase tracking-[0.1em]">
              {compatibility}% Compatibilidade
            </span>
          </motion.div>
        )}

        {/* Stats */}
        <div className="flex justify-center space-x-12 mb-6 w-full">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{stats.following}</span>
            <span className="text-sm text-gray-400">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{stats.followers}K</span>
            <span className="text-sm text-gray-400">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{stats.creations}M</span>
            <span className="text-sm text-gray-400">Likes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={handleMessage}
            className="bg-zinc-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
          >
            Send a 👋
          </button>
          <button className="bg-zinc-800 text-white p-3 rounded-lg hover:bg-zinc-700 transition-colors">
            <UserPlus size={20} />
          </button>
          <button className="bg-zinc-800 text-white p-3 rounded-lg hover:bg-zinc-700 transition-colors">
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Bio */}
        <div className="text-center max-w-sm mb-4">
          <p className="text-sm leading-relaxed mb-2">
            {profileUser.bio || "Sem bio disponível."}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <Camera size={16} />
            <span>instagram @{profileUser.name.toLowerCase().replace(/\s+/g, '_')}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">all shot on iphone</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-zinc-800">
        <div className="flex justify-around">
          <button 
            onClick={() => setActiveTab('images')}
            className={`py-4 flex-1 flex justify-center relative ${activeTab === 'images' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Grid size={24} />
            {activeTab === 'images' && (
              <motion.div layoutId="active-tab" className="absolute bottom-0 w-12 h-0.5 bg-white" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('reposts')}
            className={`py-4 flex-1 flex justify-center relative ${activeTab === 'reposts' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Repeat size={24} />
            {activeTab === 'reposts' && (
              <motion.div layoutId="active-tab" className="absolute bottom-0 w-12 h-0.5 bg-white" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`py-4 flex-1 flex justify-center relative ${activeTab === 'favorites' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Heart size={24} />
            {activeTab === 'favorites' && (
              <motion.div layoutId="active-tab" className="absolute bottom-0 w-12 h-0.5 bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-0.5">
        {activeTab === 'favorites' ? (
          // Favorite Movies Grid
          <>
            {favoriteMovies.length > 0 ? (
              favoriteMovies.map((movie) => (
                <div key={movie?.id} className="aspect-[2/3] bg-zinc-900 relative overflow-hidden">
                  <img 
                    src={movie?.posterUrl} 
                    alt={movie?.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <span className="text-xs font-bold truncate">{movie?.title}</span>
                    <span className="text-[10px] text-gray-300">{movie?.year}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-20 text-center text-zinc-500">
                <Heart size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum filme favorito ainda.</p>
              </div>
            )}
          </>
        ) : (
          // Posts Grid
          <>
            {filteredPosts.map((post) => {
              const movie = post.movieId ? MOVIES.find(m => m.id === post.movieId) : null;
              const displayImage = post.thumbnailUrl || movie?.posterUrl;

              return (
                <div key={post.id} className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                  <img 
                    src={displayImage} 
                    alt="Post" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white text-xs drop-shadow-md">
                    <Play size={12} fill="currentColor" />
                    <span>{Math.floor(Math.random() * 50) + 1}K</span>
                  </div>
                  {post.type === 'repost' && (
                    <div className="absolute top-2 right-2 text-white drop-shadow-md">
                      <Repeat size={16} />
                    </div>
                  )}
                </div>
              );
            })}
            {filteredPosts.length === 0 && (
              <div className="col-span-3 py-20 text-center text-zinc-500">
                <Grid size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhuma publicação encontrada.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
