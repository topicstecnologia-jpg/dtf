import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal, X, Send, Bookmark } from 'lucide-react';
import { MOCK_USERS, MOVIES } from '../data/mock';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, posts, addComment, toggleSavePost, toggleLikePost } = useApp();
  const [activeTab, setActiveTab] = useState('Community');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');

  const tabs = ['Feed', 'Community'];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPost && commentText.trim()) {
      addComment(selectedPost.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#17171B] text-white pb-32">
      {/* Stories Section */}
      <div className="pt-6 px-4 mb-8">
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Your Story */}
          <div className="flex flex-col items-center space-y-2 min-w-[72px]">
            <div className="relative w-[72px] h-[72px]">
              <div className="w-full h-full rounded-[24px] border-2 border-dashed border-gray-600 p-1 flex items-center justify-center">
                <img 
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                  alt="Your story" 
                  className="w-full h-full rounded-[20px] object-cover opacity-50"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-white text-black rounded-full p-1 translate-x-1 translate-y-1">
                <Plus size={14} strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">Your Story</span>
          </div>
          
          {/* Other Stories */}
          {MOCK_USERS.map((u, index) => (
            <div key={u.id} className="flex flex-col items-center space-y-2 min-w-[72px] cursor-pointer" onClick={() => navigate(`/profile/${u.id}`)}>
              <div className={`w-[72px] h-[72px] rounded-[24px] p-[2px] ${index % 2 === 0 ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-gradient-to-tr from-green-400 to-blue-500'}`}>
                <div className="w-full h-full rounded-[22px] bg-[#17171B] p-[2px]">
                  <img 
                    src={u.avatarUrl} 
                    alt={u.name} 
                    className="w-full h-full rounded-[20px] object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-300 font-medium">{u.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between space-x-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-[#2A2A30] text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 space-y-6">
        {activeTab === 'Community' ? (
          <>
            {/* Featured Card (NestCircle style) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full aspect-[4/5] rounded-[40px] relative overflow-hidden p-8 flex flex-col justify-between"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9A9E] via-[#FECFEF] to-[#A18CD1] opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
              
              {/* Content */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                 {/* Avatar Cluster */}
                 <div className="relative w-64 h-64">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-20">
                      <img src={MOCK_USERS[0 % MOCK_USERS.length].avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-12 left-4 w-20 h-20 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-10">
                      <img src={MOCK_USERS[1 % MOCK_USERS.length].avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-12 right-4 w-20 h-20 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-10">
                      <img src={MOCK_USERS[2 % MOCK_USERS.length].avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-4 left-10 w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-30">
                      <img src={MOCK_USERS[3 % MOCK_USERS.length].avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-4 right-10 w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-30">
                      <img src={MOCK_USERS[4 % MOCK_USERS.length].avatarUrl} className="w-full h-full object-cover" />
                    </div>
                 </div>
              </div>

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">CineClub</h2>
                  <p className="text-white/80 font-medium">Comunidade</p>
                </div>
                <button className="px-6 py-3 bg-[#17171B]/80 backdrop-blur-md text-white rounded-full font-semibold text-sm hover:bg-[#17171B] transition-colors shadow-lg">
                  Entrar agora
                </button>
              </div>
            </motion.div>

            {/* Secondary Card */}
            <div className="w-full aspect-square rounded-[40px] relative overflow-hidden p-8 bg-[#B4F8C8] text-[#17171B]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#A0E7E5] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold mb-2">Tendências</h3>
                 <p className="opacity-70 mb-6">Filmes em alta esta semana</p>
                 
                 <div className="flex -space-x-4">
                   {[1,2,3].map((i) => (
                     <div key={i} className="w-16 h-24 rounded-xl bg-gray-800 border-2 border-[#B4F8C8] overflow-hidden shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <img src={`https://picsum.photos/seed/movie${i}/200/300`} className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </>
        ) : (
          /* Feed Content */
          <div className="space-y-6">
            {posts.map((post) => {
              const postUser = MOCK_USERS.find(u => u.id === post.userId) || user;
              const postMovie = MOVIES.find(m => m.id === post.movieId);
              const isSaved = user?.savedPosts.includes(post.id);
              
              if (!postUser || !postMovie) return null;

              return (
                <motion.div 
                  key={post.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#222226] rounded-[32px] overflow-hidden border border-white/5"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => navigate(`/profile/${postUser.id}`)}
                    >
                      <img 
                        src={postUser.avatarUrl} 
                        alt={postUser.name} 
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <p className="font-bold text-sm text-white">{postUser.name}</p>
                        <p className="text-xs text-gray-400">{postUser.emotionalProfile}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Post Image */}
                  <div className="w-full aspect-[4/5] bg-gray-800 relative">
                    <img 
                      src={postMovie.posterUrl} 
                      alt={postMovie.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                      <h3 className="text-white font-bold text-xl">{postMovie.title}</h3>
                      <p className="text-white/70 text-xs mt-1">{postMovie.year} • {postMovie.genres.join(', ')}</p>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-5">
                        <button 
                          onClick={() => toggleLikePost(post.id)}
                          className={`transition-colors flex items-center space-x-1 ${
                            post.likedBy.includes(user?.id || '') ? 'text-red-500' : 'text-white hover:text-red-500'
                          }`}
                        >
                          <Heart 
                            size={26} 
                            strokeWidth={1.5} 
                            fill={post.likedBy.includes(user?.id || '') ? "currentColor" : "none"} 
                          />
                        </button>
                        <button 
                          onClick={() => setSelectedPost(post)}
                          className="text-white hover:text-blue-500 transition-colors flex items-center space-x-1"
                        >
                          <MessageCircle size={26} strokeWidth={1.5} />
                          {post.comments.length > 0 && (
                            <span className="text-xs font-bold">{post.comments.length}</span>
                          )}
                        </button>
                        <button className="text-white hover:text-green-500 transition-colors flex items-center space-x-1">
                          <Share2 size={26} strokeWidth={1.5} />
                        </button>
                      </div>
                      <button 
                        onClick={() => toggleSavePost(post.id)}
                        className={`${isSaved ? 'text-blue-500' : 'text-white'} hover:text-blue-500 transition-colors`}
                      >
                        <Bookmark size={26} strokeWidth={1.5} fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <p className="font-bold text-sm mb-2">{post.likes} curtidas</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <span className="font-bold text-white mr-2">{postUser.name}</span>
                      {post.caption}
                    </p>
                    <p className="text-xs text-gray-500 mt-3 uppercase tracking-wide font-medium">
                      {Math.floor((Date.now() - post.timestamp) / (1000 * 60 * 60))}h atrás
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-[#17171B] rounded-t-[40px] sm:rounded-[40px] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Comentários</h3>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {selectedPost.comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle size={48} className="text-gray-700 mb-4" />
                    <p className="text-gray-500">Nenhum comentário ainda.<br/>Seja o primeiro a comentar!</p>
                  </div>
                ) : (
                  selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      <img 
                        src={comment.userAvatar} 
                        alt={comment.userName} 
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{comment.userName}</span>
                          <span className="text-[10px] text-gray-500">
                            {Math.floor((Date.now() - comment.timestamp) / (1000 * 60))}m atrás
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="p-6 bg-[#222226] border-t border-white/5">
                <form onSubmit={handleAddComment} className="flex items-center space-x-3">
                  <img 
                    src={user?.avatarUrl} 
                    alt={user?.name} 
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="w-full bg-[#17171B] border border-white/10 rounded-full py-3 px-5 text-sm focus:outline-none focus:border-white/20 transition-all pr-12"
                    />
                    <button 
                      type="submit"
                      disabled={!commentText.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white disabled:text-gray-600 transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
