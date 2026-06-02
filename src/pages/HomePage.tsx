import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal, X, Send, Bookmark, Type, Search, Camera, Image as ImageIcon, Trash2, Bell, Repeat2 } from 'lucide-react';
import { MOVIES } from '../data/mock';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, Story } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, posts, stories, addComment, toggleSavePost, toggleLikePost, profileUsers, getUserById, createStory, deleteStory } = useApp();
  const [activeTab, setActiveTab] = useState('Community');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isComposingScene, setIsComposingScene] = useState(false);
  const [sceneText, setSceneText] = useState('');
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [scenePreview, setScenePreview] = useState('');
  const [sceneError, setSceneError] = useState('');
  const [isPublishingScene, setIsPublishingScene] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [profileSearch, setProfileSearch] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'likes' | 'comments' | 'follows' | 'profiles'>('all');
  const liveSelectedPost = selectedPost ? posts.find(post => post.id === selectedPost.id) || selectedPost : null;

  const latestStoriesByUser = stories.reduce<Story[]>((latestStories, story) => {
    if (!latestStories.some(item => item.userId === story.userId)) latestStories.push(story);
    return latestStories;
  }, []);
  const currentUserScene = latestStoriesByUser.find(story => story.userId === user?.id);
  const otherUserScenes = latestStoriesByUser.filter(story => story.userId !== user?.id);

  const tabs = ['Feed', 'Community'];
  const searchTerm = profileSearch.trim().toLowerCase();
  const searchedProfiles = searchTerm
    ? profileUsers
      .filter(profile => (
        profile.name.toLowerCase().includes(searchTerm) ||
        profile.handle.toLowerCase().includes(searchTerm.replace(/^@/, ''))
      ))
      .slice(0, 6)
    : [];
  const ownPosts = posts.filter(post => post.userId === user?.id);
  const likeNotifications = ownPosts.flatMap(post => (
    post.likedBy
      .filter(userId => userId !== user?.id)
      .map(userId => ({ type: 'like', post, profile: getUserById(userId) }))
  )).filter(item => item.profile).slice(0, 6);
  const commentNotifications = ownPosts.flatMap(post => (
    post.comments
      .filter(comment => comment.userId !== user?.id)
      .map(comment => ({ type: 'comment', post, comment, profile: getUserById(comment.userId) }))
  )).filter(item => item.profile).slice(0, 6);
  const followerNotifications = profileUsers
    .filter(profile => profile.id !== user?.id && profile.followingIds?.includes(user?.id || ''))
    .slice(0, 6)
    .map(profile => ({ type: 'follow', profile }));
  const recommendedProfiles = profileUsers
    .filter(profile => profile.id !== user?.id && !user?.followingIds?.includes(profile.id))
    .sort((a, b) => Number(b.emotionalProfile === user?.emotionalProfile) - Number(a.emotionalProfile === user?.emotionalProfile))
    .slice(0, 6)
    .map(profile => ({ type: 'recommendation', profile }));
  const notifications = [
    ...likeNotifications,
    ...commentNotifications,
    ...followerNotifications,
    ...recommendedProfiles
  ].slice(0, 16);
  const filteredNotifications = notifications.filter((notification: any) => {
    if (notificationFilter === 'all') return true;
    if (notificationFilter === 'likes') return notification.type === 'like';
    if (notificationFilter === 'comments') return notification.type === 'comment';
    if (notificationFilter === 'follows') return notification.type === 'follow';
    return notification.type === 'recommendation';
  });
  const notificationCount = notifications.length;
  const notificationTabs = [
    { id: 'all', label: 'Tudo' },
    { id: 'likes', label: 'Curtidas' },
    { id: 'comments', label: 'Comentarios' },
    { id: 'follows', label: 'Novos seguidores' },
    { id: 'profiles', label: 'Perfis' }
  ] as const;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveSelectedPost && commentText.trim()) {
      addComment(liveSelectedPost.id, commentText);
      setCommentText('');
    }
  };

  const handleSceneImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSceneImage(file);
    setScenePreview(URL.createObjectURL(file));
  };

  const resetSceneComposer = () => {
    setSceneText('');
    setSceneImage(null);
    setScenePreview('');
    setSceneError('');
  };

  const handlePublishScene = async (event: React.FormEvent) => {
    event.preventDefault();
    setSceneError('');
    setIsPublishingScene(true);

    try {
      await createStory({ text: sceneText, imageFile: sceneImage });
      resetSceneComposer();
      setIsComposingScene(false);
    } catch (error) {
      setSceneError(error instanceof Error ? error.message : 'Nao foi possivel publicar a cena.');
    } finally {
      setIsPublishingScene(false);
    }
  };

  const handleDeleteScene = async () => {
    if (!selectedStory) return;
    try {
      await deleteStory(selectedStory.id);
      setSelectedStory(null);
    } catch (error) {
      setSceneError(error instanceof Error ? error.message : 'Nao foi possivel excluir a cena.');
    }
  };

  const renderNotificationPostPreview = (post?: Post) => {
    if (!post) return null;
    const movie = post.movieId ? MOVIES.find(item => item.id === post.movieId) : null;
    const previewImage = post.thumbnailUrl || movie?.posterUrl;

    return (
      <div className="ml-2 w-12 h-12 rounded-xl overflow-hidden bg-[#17171B] border border-white/10 shrink-0">
        {previewImage ? (
          <img src={previewImage} alt="Publicacao" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full p-1.5 flex items-center justify-center text-[9px] font-bold text-center leading-tight text-white">
            {post.caption || 'Texto'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#17171B] text-white pb-24 md:pb-20">
      <div className="pt-5 md:pt-16 px-4 mb-5 md:mb-4">
        <div className="relative mb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={profileSearch}
                onChange={(event) => setProfileSearch(event.target.value)}
                className="w-full h-12 rounded-full bg-[#222226] border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
                placeholder="Pesquisar perfis"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(prev => !prev)}
              className="relative w-12 h-12 rounded-full bg-[#222226] border border-white/10 flex items-center justify-center text-white hover:bg-[#2A2A30]"
            >
              <Bell size={19} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-[#3F1521] px-1 text-[10px] font-bold flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

          {searchTerm && (
            <div className="absolute left-0 right-0 top-14 z-40 rounded-3xl border border-white/10 bg-[#222226] p-2 shadow-2xl">
              {searchedProfiles.length > 0 ? (
                searchedProfiles.map(profile => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      setProfileSearch('');
                      navigate(`/profile/${profile.handle}`);
                    }}
                    className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                  >
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#3F1521] border border-white/10 flex items-center justify-center text-sm font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{profile.handle}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-zinc-500">Nenhum perfil encontrado.</p>
              )}
            </div>
          )}

          {isNotificationsOpen && (
            <div className="absolute left-0 right-0 top-14 z-40 rounded-[28px] border border-white/10 bg-[#0F1012] p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-4">
                <h3 className="text-2xl font-bold text-white">Notificacoes</h3>
                <button type="button" onClick={() => setIsNotificationsOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
                {notificationTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setNotificationFilter(tab.id)}
                    className={`h-9 px-4 rounded-full border text-xs font-bold whitespace-nowrap ${
                      notificationFilter === tab.id
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-white border-white/20 hover:border-white/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <p className="px-1 pb-2 text-sm font-bold text-white">Esta semana</p>
              <div className="max-h-[65vh] md:max-h-[520px] overflow-y-auto scrollbar-hide space-y-1 pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {filteredNotifications.length === 0 ? (
                  <p className="px-3 py-8 text-sm text-zinc-500 text-center">Nada novo por enquanto.</p>
                ) : filteredNotifications.map((notification: any, index) => {
                  const profile = notification.profile;
                  const message = notification.type === 'like'
                    ? 'curtiu sua publicacao'
                    : notification.type === 'comment'
                      ? `comentou: ${notification.comment.text}`
                      : notification.type === 'follow'
                        ? 'comecou a seguir voce'
                        : profile.emotionalProfile === user?.emotionalProfile
                          ? `combina com seu tipo ${user?.emotionalProfile}`
                          : 'perfil recomendado para voce';

                  return (
                    <button
                      key={`${notification.type}-${profile.id}-${notification.post?.id || index}`}
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        if (notification.post) {
                          setActiveTab('Feed');
                          setSelectedPost(notification.post);
                        } else {
                          navigate(`/profile/${profile.handle}`);
                        }
                      }}
                      className="w-full flex items-center gap-3 rounded-2xl px-2 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#3F1521] border border-white/10 flex items-center justify-center text-sm font-bold">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white leading-snug line-clamp-2">
                          <span className="font-bold">{profile.handle}</span>
                          <span className="text-zinc-400"> {message}</span>
                        </p>
                        {notification.post && (
                          <p className="mt-1 text-xs text-zinc-500 line-clamp-1">
                            {notification.post.caption || 'Publicacao sem legenda'}
                          </p>
                        )}
                      </div>
                      {renderNotificationPostPreview(notification.post)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center space-y-2 min-w-[78px]">
            <button
              type="button"
              onClick={() => {
                if (currentUserScene) {
                  setSelectedStory(currentUserScene);
                } else {
                  resetSceneComposer();
                  setIsComposingScene(true);
                }
              }}
              className="relative w-[78px] h-[78px]"
            >
              <div className="w-full h-full rounded-full border-2 border-dashed border-zinc-500 p-[3px] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#222226] p-[2px] overflow-hidden">
                  {currentUserScene?.type === 'image' && currentUserScene.mediaUrl ? (
                    <img
                      src={currentUserScene.mediaUrl}
                      alt="Sua cena"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Sua cena"
                    className="w-full h-full rounded-full object-cover opacity-80"
                  />
                ) : (
                    <div className="w-full h-full rounded-full bg-[#222226] flex items-center justify-center text-zinc-500">
                    <Plus size={22} />
                  </div>
                )}
                </div>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  resetSceneComposer();
                  setIsComposingScene(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    resetSceneComposer();
                    setIsComposingScene(true);
                  }
                }}
                className="absolute bottom-1 right-0 bg-white text-black rounded-full p-1 shadow-lg"
              >
                <Plus size={16} strokeWidth={3} />
              </span>
            </button>
            <span className="text-xs text-gray-400 font-medium">Sua cena</span>
          </div>
          
          {otherUserScenes.map((story, index) => {
            const storyUser = getUserById(story.userId);
            if (!storyUser) return null;

            return (
              <div key={story.id} className="flex flex-col items-center space-y-2 min-w-[78px] cursor-pointer" onClick={() => setSelectedStory(story)}>
                <div className={`w-[78px] h-[78px] rounded-full p-[3px] ${index % 2 === 0 ? 'bg-gradient-to-tr from-[#F7A3C5] via-[#9FC4FF] to-[#8D4B5C]' : 'bg-gradient-to-tr from-[#B4F8C8] via-[#A0E7E5] to-[#A18CD1]'}`}>
                <div className="w-full h-full rounded-full bg-[#17171B] p-[3px]">
                  {story.type === 'image' && story.mediaUrl ? (
                    <img
                      src={story.mediaUrl}
                      alt={storyUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#3F1521] p-2 flex items-center justify-center text-[10px] font-bold text-center line-clamp-3">
                      {story.text || storyUser.name}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-300 font-medium">{storyUser.name.split(' ')[0]}</span>
            </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-5">
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
      <div className="px-4 space-y-5">
        {activeTab === 'Community' ? (
          <>
            {/* Featured Card (NestCircle style) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full md:max-w-[390px] md:mx-auto aspect-[1080/1450] rounded-[28px] relative overflow-hidden p-6 flex flex-col justify-between"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9A9E] via-[#FECFEF] to-[#A18CD1] opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
              
              {/* Content */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                 {/* Avatar Cluster */}
                 <div className="relative w-56 h-56">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-20">
                      <img src={(profileUsers[0] || user)?.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-12 left-4 w-20 h-20 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-10">
                      <img src={(profileUsers[1] || user)?.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-12 right-4 w-20 h-20 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-10">
                      <img src={(profileUsers[2] || user)?.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-4 left-10 w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-30">
                      <img src={(profileUsers[3] || user)?.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-4 right-10 w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden shadow-xl z-30">
                      <img src={(profileUsers[4] || user)?.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                 </div>
              </div>

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">CineClub</h2>
                  <p className="text-white/80 font-medium">Comunidade</p>
                </div>
                <button className="px-6 py-3 bg-[#17171B]/80 backdrop-blur-md text-white rounded-full font-semibold text-sm hover:bg-[#17171B] transition-colors shadow-lg">
                  Entrar agora
                </button>
              </div>
            </motion.div>

            {/* Secondary Card */}
            <div className="w-full md:max-w-[390px] md:mx-auto aspect-[1080/1450] rounded-[28px] relative overflow-hidden p-6 bg-[#B4F8C8] text-[#17171B]">
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
          <div className="space-y-5 md:max-w-[390px] md:mx-auto">
            {posts.map((post) => {
              const postUser = getUserById(post.userId) || user;
              const postMovie = MOVIES.find(m => m.id === post.movieId) || {
                id: post.id,
                title: post.thumbnailUrl ? 'Publicacao' : 'Texto',
                year: new Date(post.timestamp).getFullYear(),
                genres: post.type === 'text' ? ['Texto'] : ['Feed'],
                description: post.caption,
                posterUrl: post.thumbnailUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='1450' viewBox='0 0 1080 1450'%3E%3Crect width='1080' height='1450' fill='%2317171B'/%3E%3C/svg%3E",
                platforms: [],
                rating: 0,
                moods: []
              };
              const isSaved = user?.savedPosts.includes(post.id);
              
              if (!postUser) return null;
              const hoursAgo = Math.max(0, Math.floor((Date.now() - post.timestamp) / (1000 * 60 * 60)));

              if (post.type === 'text' && !post.thumbnailUrl) {
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111113] border border-white/10 px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => navigate(`/profile/${postUser.handle}`)} className="relative shrink-0">
                        {postUser.avatarUrl ? (
                          <img src={postUser.avatarUrl} alt={postUser.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#3F1521] border border-white/10 flex items-center justify-center text-sm font-bold">
                            {postUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <button type="button" onClick={() => navigate(`/profile/${postUser.handle}`)} className="min-w-0 text-left">
                            <span className="font-bold text-white text-sm">{postUser.handle}</span>
                            <span className="text-zinc-500 text-sm ml-2">{hoursAgo} h</span>
                          </button>
                          <button className="text-zinc-500 hover:text-white">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>

                        <p className="text-[15px] leading-relaxed text-zinc-100 whitespace-pre-line">
                          {post.caption}
                        </p>

                        <div className="mt-4 flex items-center gap-7 text-zinc-400">
                          <button
                            onClick={() => toggleLikePost(post.id)}
                            className={`flex items-center gap-1.5 text-sm ${post.likedBy.includes(user?.id || '') ? 'text-red-500' : 'hover:text-red-500'}`}
                          >
                            <Heart size={20} strokeWidth={1.7} fill={post.likedBy.includes(user?.id || '') ? 'currentColor' : 'none'} />
                            <span>{post.likes}</span>
                          </button>
                          <button onClick={() => setSelectedPost(post)} className="flex items-center gap-1.5 text-sm hover:text-blue-400">
                            <MessageCircle size={20} strokeWidth={1.7} />
                            <span>{post.comments.length}</span>
                          </button>
                          <button className="hover:text-emerald-400">
                            <Repeat2 size={20} strokeWidth={1.7} />
                          </button>
                          <button className="hover:text-white">
                            <Share2 size={20} strokeWidth={1.7} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              }

              return (
                <motion.div 
                  key={post.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#222226] rounded-[24px] overflow-hidden border border-white/5"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-3.5">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => navigate(`/profile/${postUser.handle}`)}
                    >
                      {postUser.avatarUrl ? (
                        <img
                          src={postUser.avatarUrl}
                          alt={postUser.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#3F1521] border border-white/10 flex items-center justify-center text-sm font-bold">
                          {postUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-white">{postUser.name}</p>
                        <p className="text-xs text-gray-400">{postUser.handle}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Post Image */}
                  <div className="w-full aspect-[1080/1450] bg-gray-800 relative">
                    <img 
                      src={postMovie.posterUrl} 
                      alt={postMovie.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-16">
                      <h3 className="text-white font-bold text-lg">{postMovie.title}</h3>
                      <p className="text-white/70 text-xs mt-1">{postMovie.year} • {postMovie.genres.join(', ')}</p>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
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
                      <span className="font-bold text-white mr-2">{postUser.handle}</span>
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

      <AnimatePresence>
        {isComposingScene && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center md:items-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComposingScene(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.form
              onSubmit={handlePublishScene}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-md rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#1F1F24] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold">Nova cena</h2>
                <button type="button" onClick={() => setIsComposingScene(false)} className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {scenePreview && (
                <div className="mb-4 aspect-[9/16] max-h-[420px] overflow-hidden rounded-[26px] bg-black">
                  <img src={scenePreview} alt="Preview da cena" className="w-full h-full object-cover" />
                </div>
              )}

              <textarea
                value={sceneText}
                onChange={(event) => setSceneText(event.target.value)}
                className="w-full min-h-28 rounded-3xl bg-[#17171B] border border-white/10 py-4 px-5 text-white outline-none focus:border-white/25 resize-none"
                placeholder="Texto da cena..."
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-3 text-sm font-medium cursor-pointer hover:bg-zinc-700">
                  <Camera size={17} />
                  Camera
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleSceneImageChange} />
                </label>
                <label className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-3 text-sm font-medium cursor-pointer hover:bg-zinc-700">
                  <ImageIcon size={17} />
                  Galeria
                  <input type="file" accept="image/*" className="hidden" onChange={handleSceneImageChange} />
                </label>
                <button
                  type="submit"
                  disabled={isPublishingScene}
                  className="flex-1 min-w-[150px] h-12 rounded-full bg-[#3F1521] hover:bg-[#5B343C] disabled:opacity-60 text-white font-bold transition-colors"
                >
                  {isPublishingScene ? 'Publicando...' : 'Publicar cena'}
                </button>
              </div>
              {sceneError && <p className="mt-3 text-sm text-red-300">{sceneError}</p>}
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStory(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-sm aspect-[9/16] rounded-[30px] overflow-hidden bg-[#222226] border border-white/10"
            >
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute right-4 top-4 z-10 p-2 rounded-full bg-black/35 text-white"
              >
                <X size={18} />
              </button>
              {selectedStory.userId === user?.id && (
                <button
                  onClick={handleDeleteScene}
                  className="absolute left-4 top-4 z-10 p-2 rounded-full bg-black/35 text-white hover:bg-red-500/80 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
              {selectedStory.type === 'image' && selectedStory.mediaUrl ? (
                <img src={selectedStory.mediaUrl} alt="Cena" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#3F1521] p-8 flex flex-col items-center justify-center text-center">
                  <Type size={30} className="mb-4 text-white/70" />
                  <p className="text-2xl font-bold leading-tight">{selectedStory.text}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {liveSelectedPost && (
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
                {liveSelectedPost.comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle size={48} className="text-gray-700 mb-4" />
                    <p className="text-gray-500">Nenhum comentário ainda.<br/>Seja o primeiro a comentar!</p>
                  </div>
                ) : (
                  liveSelectedPost.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#3F1521] border border-white/10 flex items-center justify-center text-sm font-bold">
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
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
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#3F1521] border border-white/10 flex items-center justify-center text-sm font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
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
