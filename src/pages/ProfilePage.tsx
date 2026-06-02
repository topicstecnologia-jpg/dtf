import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOVIES } from '../data/mock';
import { ArrowLeft, MessageCircle, Grid, Play, Repeat, Heart, Share2, Bell, UserPlus, ChevronDown, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, startChat, matches, getUserById, profileUsers } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'images' | 'reposts' | 'favorites'>('images');
  const [copied, setCopied] = useState(false);

  const decodedParam = userId ? decodeURIComponent(userId) : '';
  const isCurrentUser = !userId || userId === currentUser?.id || decodedParam.toLowerCase() === currentUser?.handle?.toLowerCase();
  const profileUser = isCurrentUser
    ? currentUser
    : decodedParam.startsWith('@')
      ? profileUsers.find(profile => profile.handle.toLowerCase() === decodedParam.toLowerCase())
      : getUserById(userId);

  if (!profileUser) return <div className="p-8 text-center text-white bg-black min-h-screen">Usuario nao encontrado</div>;

  const match = matches.find(m =>
    m.userIds.includes(currentUser?.id || '') &&
    m.userIds.includes(profileUser.id)
  );

  const compatibility = match?.compatibility.overall || (isCurrentUser ? null : Math.floor(Math.random() * 20) + 75);
  const stats = profileUser.stats || { following: 0, followers: 0, creations: 0 };
  const posts = profileUser.posts || [];
  const favoriteMovies = (profileUser.favoriteMovies || []).map(id => MOVIES.find(m => m.id === id)).filter(Boolean);

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'images') return post.type === 'image' || post.type === 'video';
    if (activeTab === 'reposts') return post.type === 'repost';
    return false;
  });

  const handleMessage = async () => {
    if (isCurrentUser) return;
    const matchId = await startChat(profileUser.id);
    if (matchId) navigate(`/chat/${matchId}`);
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileUser.handle}`;
    await navigator.clipboard?.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pb-20 md:pt-12">
      <div className="flex justify-between items-center p-4 sticky top-0 bg-black/95 backdrop-blur-md z-50">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={22} />
        </button>
        <div className="font-bold text-base">{profileUser.handle}</div>
        <div className="flex space-x-4">
          <Bell size={22} />
          <button onClick={handleShare} className="relative">
            <Share2 size={22} />
            {copied && (
              <span className="absolute right-0 top-8 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-black">
                Copiado
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center px-4 pt-2 pb-5">
        <div className="relative mb-3">
          <img
            src={profileUser.avatarUrl}
            alt={profileUser.name}
            className="w-24 h-24 md:w-20 md:h-20 rounded-full object-cover border-2 border-black"
          />
        </div>

        <div className="flex items-center space-x-1 mb-1">
          <h1 className="text-xl font-bold">{profileUser.handle}</h1>
          <div className="bg-blue-500 rounded-full p-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-3">{profileUser.name}</p>

        {compatibility && !isCurrentUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 flex items-center space-x-2 bg-[#3F1521]/15 border border-[#3F1521]/30 px-4 py-1.5 rounded-full shadow-sm"
          >
            <Heart size={14} className="text-[#8D4B5C] fill-[#8D4B5C]" />
            <span className="text-xs font-bold text-[#E4B5C2] uppercase tracking-[0.1em]">
              {compatibility}% Compatibilidade
            </span>
          </motion.div>
        )}

        <div className="flex justify-center space-x-10 mb-5 w-full">
          <div className="flex flex-col items-center">
            <span className="font-bold text-base">{stats.following}</span>
            <span className="text-xs text-gray-400">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-base">{stats.followers}</span>
            <span className="text-xs text-gray-400">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-base">{stats.creations}</span>
            <span className="text-xs text-gray-400">Likes</span>
          </div>
        </div>

        {!isCurrentUser && (
          <div className="flex space-x-2 mb-5">
            <button
              onClick={handleMessage}
              className="bg-zinc-800 text-white px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle size={17} />
              Mensagem
            </button>
            <button className="bg-zinc-800 text-white p-2.5 rounded-lg hover:bg-zinc-700 transition-colors">
              <UserPlus size={19} />
            </button>
            <button className="bg-zinc-800 text-white p-2.5 rounded-lg hover:bg-zinc-700 transition-colors">
              <ChevronDown size={19} />
            </button>
          </div>
        )}

        <div className="text-center max-w-sm mb-3">
          <p className="text-sm leading-relaxed mb-2">
            {profileUser.bio || 'Sem bio disponivel.'}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm font-medium text-zinc-300">
            <Camera size={15} />
            <span>{profileUser.handle}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('images')}
            className={`py-3.5 flex-1 flex justify-center relative ${activeTab === 'images' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Grid size={22} />
            {activeTab === 'images' && (
              <motion.div layoutId="active-tab" className="absolute bottom-0 w-12 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reposts')}
            className={`py-3.5 flex-1 flex justify-center relative ${activeTab === 'reposts' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Repeat size={22} />
            {activeTab === 'reposts' && (
              <motion.div layoutId="active-tab" className="absolute bottom-0 w-12 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3.5 flex-1 flex justify-center relative ${activeTab === 'favorites' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Heart size={22} />
            {activeTab === 'favorites' && (
              <motion.div layoutId="active-tab" className="absolute bottom-0 w-12 h-0.5 bg-white" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0.5">
        {activeTab === 'favorites' ? (
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
              <div className="col-span-3 py-16 text-center text-zinc-500">
                <Heart size={42} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum filme favorito ainda.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {filteredPosts.map((post) => {
              const movie = post.movieId ? MOVIES.find(m => m.id === post.movieId) : null;
              const displayImage = post.thumbnailUrl || movie?.posterUrl;

              return (
                <div key={post.id} className="aspect-[1080/1450] bg-zinc-900 relative overflow-hidden">
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
              <div className="col-span-3 py-16 text-center text-zinc-500">
                <Grid size={42} className="mx-auto mb-4 opacity-20" />
                <p>Nenhuma publicacao encontrada.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
