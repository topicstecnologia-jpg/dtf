import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal, X, Send, Bookmark, Type, Search, Camera, Image as ImageIcon, Trash2, Bell, Repeat2, Clapperboard, Film } from 'lucide-react';
import { MOVIES } from '../data/mock';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, Story } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, posts, stories, matches, sendMessage, addComment, startChat, toggleLikeStory, recordStoryView, toggleSavePost, toggleLikePost, repostPost, profileUsers, getUserById, createStory, deleteStory, communities } = useApp();
  const [activeTab, setActiveTab] = useState('Feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isComposingScene, setIsComposingScene] = useState(false);
  const [sceneText, setSceneText] = useState('');
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [scenePreview, setScenePreview] = useState('');
  const [sceneError, setSceneError] = useState('');
  const [isPublishingScene, setIsPublishingScene] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [storyCommentText, setStoryCommentText] = useState('');
  const [isStoryViewersOpen, setIsStoryViewersOpen] = useState(false);
  const [profileSearch, setProfileSearch] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'likes' | 'comments' | 'follows' | 'profiles'>('all');
  const [readNotificationKeys, setReadNotificationKeys] = useState<string[]>([]);
  const [postToSend, setPostToSend] = useState<Post | null>(null);
  const [postActionMessage, setPostActionMessage] = useState('');
  const liveSelectedPost = selectedPost ? posts.find(post => post.id === selectedPost.id) || selectedPost : null;
  const liveSelectedStory = selectedStory ? stories.find(story => story.id === selectedStory.id) || selectedStory : null;

  const latestStoriesByUser = stories.reduce<Story[]>((latestStories, story) => {
    if (!latestStories.some(item => item.userId === story.userId)) latestStories.push(story);
    return latestStories;
  }, []);
  const currentUserScene = latestStoriesByUser.find(story => story.userId === user?.id);
  const otherUserScenes = latestStoriesByUser.filter(story => story.userId !== user?.id);
  const selectedStoryIndex = liveSelectedStory ? latestStoriesByUser.findIndex(story => story.id === liveSelectedStory.id) : -1;

  const tabs = ['Feed', 'Recomendações', 'Comunidades'];
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
  const notificationTabs = [
    { id: 'all', label: 'Tudo' },
    { id: 'likes', label: 'Curtidas' },
    { id: 'comments', label: 'Comentários' },
    { id: 'follows', label: 'Novos seguidores' },
    { id: 'profiles', label: 'Perfis' }
  ] as const;

  const getNotificationKey = (notification: any, index: number) => (
    `${notification.type}:${notification.profile?.id || 'profile'}:${notification.post?.id || notification.comment?.id || index}`
  );
  const notificationKeys = notifications.map(getNotificationKey);
  const notificationCount = notificationKeys.filter(key => !readNotificationKeys.includes(key)).length;

  useEffect(() => {
    if (!user?.id) {
      setReadNotificationKeys([]);
      return;
    }

    try {
      const stored = localStorage.getItem(`dtf:read-notifications:${user.id}`);
      setReadNotificationKeys(stored ? JSON.parse(stored) : []);
    } catch {
      setReadNotificationKeys([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !isNotificationsOpen || notificationKeys.length === 0) return;

    setReadNotificationKeys(prev => {
      const next = Array.from(new Set([...prev, ...notificationKeys]));
      localStorage.setItem(`dtf:read-notifications:${user.id}`, JSON.stringify(next));
      return next;
    });
  }, [isNotificationsOpen, user?.id, notificationKeys.join('|')]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveSelectedPost && commentText.trim()) {
      addComment(liveSelectedPost.id, commentText);
      setCommentText('');
    }
  };

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setStoryCommentText('');
    setIsStoryViewersOpen(false);
    setSceneError('');
    if (story.userId !== user?.id) {
      recordStoryView(story.id);
    }
  };

  const goToNextStory = () => {
    if (selectedStoryIndex < 0) return setSelectedStory(null);
    const nextStory = latestStoriesByUser[selectedStoryIndex + 1];
    if (nextStory) {
      openStory(nextStory);
    } else {
      setSelectedStory(null);
    }
  };

  const goToPreviousStory = () => {
    if (selectedStoryIndex <= 0) return;
    openStory(latestStoriesByUser[selectedStoryIndex - 1]);
  };

  const handleAddStoryComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!liveSelectedStory || !storyCommentText.trim()) return;
    if (liveSelectedStory.userId === user?.id) {
      setStoryCommentText('');
      return;
    }

    const storyOwner = getUserById(liveSelectedStory.userId);
    const matchId = await startChat(liveSelectedStory.userId);
    if (!matchId) return;

    await sendMessage(
      matchId,
      `Respondeu sua Cena${storyOwner?.handle ? ` (${storyOwner.handle})` : ''}: ${storyCommentText.trim()}`
    );
    setStoryCommentText('');
    setPostActionMessage('Resposta enviada no chat.');
    setTimeout(() => setPostActionMessage(''), 1800);
  };

  useEffect(() => {
    if (!liveSelectedStory) return;
    const timer = window.setTimeout(goToNextStory, 15000);
    return () => window.clearTimeout(timer);
  }, [liveSelectedStory?.id, selectedStoryIndex, latestStoriesByUser.length]);

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
      setSceneError(error instanceof Error ? error.message : 'Não foi possível publicar a cena.');
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
      setSceneError(error instanceof Error ? error.message : 'Não foi possível excluir a cena.');
    }
  };

  const renderNotificationPostPreview = (post?: Post) => {
    if (!post) return null;
    const movie = post.movieId ? MOVIES.find(item => item.id === post.movieId) : null;
    const previewImage = post.thumbnailUrl || movie?.posterUrl;

    return (
      <div className="ml-2 w-12 h-12 rounded-xl overflow-hidden bg-[#17171B] border border-white/10 shrink-0">
        {previewImage ? (
          <img src={previewImage} alt="Publicação" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full p-1.5 flex items-center justify-center text-[9px] font-bold text-center leading-tight text-white">
            {post.caption || 'Texto'}
          </div>
        )}
      </div>
    );
  };

  const getPostUrl = (postId: string) => `${window.location.origin}/post/${postId}`;

  const handleSharePost = async (post: Post) => {
    await navigator.clipboard?.writeText(getPostUrl(post.id));
    setPostActionMessage('Link copiado.');
    setTimeout(() => setPostActionMessage(''), 1800);
  };

  const handleRepost = async (post: Post) => {
    try {
      await repostPost(post.id);
      setPostActionMessage('Post republicado.');
      setTimeout(() => setPostActionMessage(''), 1800);
    } catch (error) {
      setPostActionMessage(error instanceof Error ? error.message : 'Não foi possível republicar.');
    }
  };

  const handleSendPostToChat = async (matchId: string) => {
    if (!postToSend) return;
    const author = getUserById(postToSend.userId);
    const movie = postToSend.movieId ? MOVIES.find(item => item.id === postToSend.movieId) : null;

    await sendMessage(matchId, JSON.stringify({
      kind: 'post_share',
      postId: postToSend.id,
      authorName: author?.name || 'Usuário',
      authorHandle: author?.handle || '',
      caption: postToSend.caption,
      type: postToSend.type,
      thumbnailUrl: postToSend.thumbnailUrl || movie?.posterUrl || ''
    }));
    setPostToSend(null);
    setPostActionMessage('Post enviado.');
    setTimeout(() => setPostActionMessage(''), 1800);
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
                    ? 'curtiu sua publicação'
                    : notification.type === 'comment'
                      ? `comentou: ${notification.comment.text}`
                      : notification.type === 'follow'
                        ? 'começou a seguir você'
                        : profile.emotionalProfile === user?.emotionalProfile
                          ? `combina com seu tipo ${user?.emotionalProfile}`
                          : 'perfil recomendado para você';

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
                            {notification.post.caption || 'Publicação sem legenda'}
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
                  openStory(currentUserScene);
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
              <div key={story.id} className="flex flex-col items-center space-y-2 min-w-[78px] cursor-pointer" onClick={() => openStory(story)}>
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
        {activeTab === 'Recomendações' ? (
          <div className="space-y-5 md:max-w-[390px] md:mx-auto">
            <motion.button
              type="button"
              onClick={() => navigate('/feed')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full aspect-[1080/1450] rounded-[28px] relative overflow-hidden p-6 text-left flex flex-col justify-between border border-white/10 bg-[#222226]"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#17171B]/55 to-[#17171B]" />
              <div className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                <Film size={24} />
              </div>
              <div className="relative z-10">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E4B5C2]">Recomendações</p>
                <h2 className="text-3xl font-bold leading-tight text-white">Descubra filmes de romance para o seu perfil.</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  Abra o fluxo de recomendações, curta filmes e alimente sua compatibilidade.
                </p>
                <span className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
                  Ver recomendações
                </span>
              </div>
            </motion.button>
          </div>
        ) : activeTab === 'Comunidades' ? (
          <div className="md:max-w-[390px] md:mx-auto space-y-4">
            {communities.map(community => (
              <motion.button
                key={community.id}
                type="button"
                onClick={() => navigate(`/communities?community=${community.id}`)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#222226] text-left"
              >
                <div className="relative h-44 bg-zinc-900">
                  {community.coverUrl && (
                    <img src={community.coverUrl} alt={community.name} className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222226] via-black/45 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-end gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/15 bg-[#3F1521]">
                      {community.avatarUrl ? (
                        <img src={community.avatarUrl} alt={community.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                          {community.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{community.name}</h2>
                      <p className="text-xs text-zinc-400">{community.memberIds.length} membros</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm leading-relaxed text-zinc-300">{community.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#E4B5C2]">
                      <Clapperboard size={14} />
                      Abrir comunidade
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black">Entrar</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          /* Feed Content */
          <div className="space-y-5 md:max-w-[390px] md:mx-auto">
            {posts.map((post) => {
              const postUser = getUserById(post.userId) || user;
              const originalPost = post.repostOfId ? posts.find(item => item.id === post.repostOfId) : null;
              const displayPost = originalPost || post;
              const contentUser = originalPost ? getUserById(originalPost.userId) || postUser : postUser;
              const postMovie = MOVIES.find(m => m.id === displayPost.movieId) || {
                id: post.id,
                title: displayPost.thumbnailUrl ? 'Publicação' : 'Texto',
                year: new Date(post.timestamp).getFullYear(),
                genres: displayPost.type === 'text' ? ['Texto'] : ['Feed'],
                description: displayPost.caption,
                posterUrl: displayPost.thumbnailUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='1450' viewBox='0 0 1080 1450'%3E%3Crect width='1080' height='1450' fill='%2317171B'/%3E%3C/svg%3E",
                platforms: [],
                rating: 0,
                moods: []
              };
              const isSaved = user?.savedPosts.includes(post.id);
              
              if (!postUser || !contentUser) return null;
              const hoursAgo = Math.max(0, Math.floor((Date.now() - post.timestamp) / (1000 * 60 * 60)));

              if (displayPost.type === 'text' && !displayPost.thumbnailUrl) {
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111113] border border-white/10 px-4 py-4 rounded-2xl"
                  >
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => navigate(`/profile/${contentUser.handle}`)} className="relative shrink-0">
                        {contentUser.avatarUrl ? (
                          <img src={contentUser.avatarUrl} alt={contentUser.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#3F1521] border border-white/10 flex items-center justify-center text-sm font-bold">
                            {contentUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <button type="button" onClick={() => navigate(`/profile/${contentUser.handle}`)} className="min-w-0 text-left">
                            <span className="font-bold text-white text-sm">{contentUser.handle}</span>
                            <span className="text-zinc-500 text-sm ml-2">{hoursAgo} h</span>
                          </button>
                          <button className="text-zinc-500 hover:text-white">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>

                        <p className="text-[15px] leading-relaxed text-zinc-100 whitespace-pre-line">
                          {displayPost.caption}
                        </p>

                        {post.type === 'repost' && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                            <Repeat2 size={14} />
                            <span>republicado por:</span>
                            {postUser.avatarUrl ? (
                              <img src={postUser.avatarUrl} alt={postUser.name} className="h-5 w-5 rounded-full object-cover" />
                            ) : (
                              <span className="h-5 w-5 rounded-full bg-[#3F1521] flex items-center justify-center text-[10px] text-white">
                                {postUser.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}

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
                          <button onClick={() => handleRepost(post)} className="hover:text-emerald-400" title="Republicar">
                            <Repeat2 size={20} strokeWidth={1.7} />
                          </button>
                          <button onClick={() => setPostToSend(post)} className="hover:text-white" title="Enviar">
                            <Send size={20} strokeWidth={1.7} />
                          </button>
                          <button onClick={() => handleSharePost(post)} className="hover:text-white" title="Copiar link">
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
                      onClick={() => navigate(`/profile/${contentUser.handle}`)}
                    >
                      {contentUser.avatarUrl ? (
                        <img
                          src={contentUser.avatarUrl}
                          alt={contentUser.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#3F1521] border border-white/10 flex items-center justify-center text-sm font-bold">
                          {contentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-white">{contentUser.name}</p>
                        <p className="text-xs text-gray-400">{contentUser.handle}</p>
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
                      {post.type === 'repost' && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                          <span>republicado por:</span>
                          {postUser.avatarUrl ? (
                            <img src={postUser.avatarUrl} alt={postUser.name} className="h-6 w-6 rounded-full object-cover border border-white/20" />
                          ) : (
                            <span className="h-6 w-6 rounded-full bg-[#3F1521] flex items-center justify-center text-[10px]">
                              {postUser.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
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
                        <button
                          onClick={() => handleRepost(post)}
                          className="text-white hover:text-green-500 transition-colors flex items-center space-x-1"
                          title="Republicar"
                        >
                          <Repeat2 size={26} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setPostToSend(post)}
                          className="text-white hover:text-purple-400 transition-colors flex items-center space-x-1"
                          title="Enviar"
                        >
                          <Send size={26} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleSharePost(post)}
                          className="text-white hover:text-green-500 transition-colors flex items-center space-x-1"
                          title="Copiar link"
                        >
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
                      <span className="font-bold text-white mr-2">{contentUser.handle}</span>
                      {displayPost.caption}
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

      {postActionMessage && (
        <div className="fixed top-20 left-1/2 z-[140] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black shadow-2xl">
          {postActionMessage}
        </div>
      )}

      <AnimatePresence>
        {postToSend && (
          <div className="fixed inset-0 z-[130] flex items-end md:items-center justify-center p-0 md:p-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPostToSend(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-md rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#1F1F24] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold">Enviar para</h2>
                <button type="button" onClick={() => setPostToSend(null)} className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                {matches.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-500">Nenhuma conversa disponível.</p>
                ) : matches.map(match => {
                  const otherUserId = match.userIds.find(id => id !== user?.id);
                  const otherUser = getUserById(otherUserId);
                  if (!otherUser) return null;

                  return (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => handleSendPostToChat(match.id)}
                      className="w-full flex items-center gap-3 rounded-2xl p-3 hover:bg-white/5 text-left"
                    >
                      {otherUser.avatarUrl ? (
                        <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-11 h-11 rounded-full object-cover" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#3F1521] flex items-center justify-center font-bold">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{otherUser.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{otherUser.handle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        {liveSelectedStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStory(null)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              key={liveSelectedStory.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) goToNextStory();
                if (info.offset.x > 70) goToPreviousStory();
              }}
              className="relative w-full h-[100dvh] max-w-md overflow-hidden bg-[#222226] md:h-[92dvh] md:rounded-[30px] md:border md:border-white/10"
            >
              {(() => {
                const storyUser = getUserById(liveSelectedStory.userId);
                const isLiked = liveSelectedStory.likedBy.includes(user?.id || '');
                const minutesAgo = Math.max(0, Math.floor((Date.now() - liveSelectedStory.timestamp) / 60000));

                return (
                  <>
                    <div className="absolute inset-x-0 top-0 z-20 p-4 pt-[max(1rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/65 to-transparent">
                      <div className="mb-3 flex gap-1">
                        {latestStoriesByUser.map((story, index) => (
                          <div key={story.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                            <div className={`h-full rounded-full bg-white ${index < selectedStoryIndex ? 'w-full' : index === selectedStoryIndex ? 'animate-[story-progress_15s_linear_forwards]' : 'w-0'}`} />
                          </div>
                        ))}
                      </div>
                      <style>{`
                        @keyframes story-progress {
                          from { width: 0%; }
                          to { width: 100%; }
                        }
                      `}</style>
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => storyUser && navigate(`/profile/${storyUser.handle}`)}
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          {storyUser?.avatarUrl ? (
                            <img src={storyUser.avatarUrl} alt={storyUser.name} className="h-10 w-10 rounded-full object-cover border border-white/20" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#3F1521] border border-white/20 flex items-center justify-center text-sm font-bold">
                              {storyUser?.name.charAt(0).toUpperCase() || '@'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">{storyUser?.handle || 'Cena'}</p>
                            <p className="text-xs text-white/70">{minutesAgo < 60 ? `${minutesAgo} min` : `${Math.floor(minutesAgo / 60)} h`}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
                          {liveSelectedStory.userId === user?.id && (
                            <button
                              type="button"
                              onClick={handleDeleteScene}
                              className="rounded-full bg-black/35 p-2 text-white hover:bg-red-500/80 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedStory(null)}
                            className="rounded-full bg-black/35 p-2 text-white"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button type="button" onClick={goToPreviousStory} className="absolute left-0 top-24 bottom-24 z-10 w-1/3" aria-label="Cena anterior" />
                    <button type="button" onClick={goToNextStory} className="absolute right-0 top-24 bottom-24 z-10 w-1/3" aria-label="Proxima cena" />

                    {liveSelectedStory.type === 'image' && liveSelectedStory.mediaUrl ? (
                      <img src={liveSelectedStory.mediaUrl} alt="Cena" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-[#3F1521] p-8 flex flex-col items-center justify-center text-center">
                        <Type size={30} className="mb-4 text-white/70" />
                        <p className="text-3xl font-bold leading-tight">{liveSelectedStory.text}</p>
                      </div>
                    )}

                    {liveSelectedStory.text && liveSelectedStory.type === 'image' && (
                      <div className="absolute left-5 right-5 bottom-32 z-20 text-center">
                        <p className="inline rounded-2xl bg-black/25 px-3 py-2 text-lg font-semibold text-white backdrop-blur-sm">
                          {liveSelectedStory.text}
                        </p>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/70 to-transparent">
                      <form onSubmit={handleAddStoryComment} className="flex items-center gap-3">
                        <input
                          value={storyCommentText}
                          onChange={(event) => setStoryCommentText(event.target.value)}
                          className="h-12 min-w-0 flex-1 rounded-full border border-white/80 bg-black/25 px-5 text-sm text-white outline-none placeholder:text-white/75 backdrop-blur-sm"
                          placeholder={liveSelectedStory.userId === user?.id ? 'Sua Cena' : `Responder a ${storyUser?.handle || 'esta cena'}...`}
                          disabled={liveSelectedStory.userId === user?.id}
                        />
                        <button
                          type="button"
                          onClick={() => toggleLikeStory(liveSelectedStory.id)}
                          className={`rounded-full p-2 ${isLiked ? 'text-red-500' : 'text-white'}`}
                        >
                          <Heart size={28} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button type="submit" disabled={!storyCommentText.trim()} className="rounded-full p-2 text-white disabled:opacity-40">
                          <Send size={26} />
                        </button>
                      </form>
                      <div className="mt-2 flex items-center gap-4 pl-2 text-xs text-white/75">
                        <span>{liveSelectedStory.likes} curtidas</span>
                        {liveSelectedStory.userId === user?.id && (
                          <button
                            type="button"
                            onClick={() => setIsStoryViewersOpen(true)}
                            className="font-semibold text-white underline-offset-4 hover:underline"
                          >
                            {liveSelectedStory.views} visualizações
                          </button>
                        )}
                        <span>respostas vão para o chat</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {liveSelectedStory && isStoryViewersOpen && (
          <div className="fixed inset-0 z-[130] flex items-end md:items-center justify-center p-0 md:p-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStoryViewersOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-md max-h-[72vh] overflow-hidden rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#17171B] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Visualizações</h2>
                  <p className="text-xs text-zinc-500">{liveSelectedStory.views} pessoas viram sua Cena</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStoryViewersOpen(false)}
                  className="rounded-full bg-white/5 p-2 text-zinc-300 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[56vh] overflow-y-auto p-3">
                {liveSelectedStory.viewedBy.length === 0 ? (
                  <p className="py-12 text-center text-sm text-zinc-500">Ninguém viu sua Cena ainda.</p>
                ) : (
                  liveSelectedStory.viewedBy.map(viewerId => {
                    const viewer = getUserById(viewerId);
                    if (!viewer) return null;

                    return (
                      <button
                        key={viewer.id}
                        type="button"
                        onClick={() => {
                          setIsStoryViewersOpen(false);
                          setSelectedStory(null);
                          navigate(`/profile/${viewer.handle}`);
                        }}
                        className="w-full flex items-center gap-3 rounded-2xl p-3 text-left hover:bg-white/5"
                      >
                        {viewer.avatarUrl ? (
                          <img src={viewer.avatarUrl} alt={viewer.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-[#3F1521] flex items-center justify-center font-bold">
                            {viewer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{viewer.name}</p>
                          <p className="truncate text-xs text-zinc-500">{viewer.handle}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
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
