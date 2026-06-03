import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOVIES } from '../data/mock';
import { ArrowLeft, MessageCircle, Grid, Play, Repeat, Heart, Share2, Bell, UserPlus, ChevronDown, Camera, X, Image as ImageIcon, Trash2, MoreHorizontal, Star, Info, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Post } from '../types';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, posts: allPosts, startChat, matches, getUserById, profileUsers, updateProfile, updateFavoriteMovies, updateEmail, deleteAccount, toggleFollowUser, recordPostView, updatePost, deletePost } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'images' | 'reposts' | 'favorites'>('images');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostCaption, setEditPostCaption] = useState('');
  const [postActionError, setPostActionError] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [socialList, setSocialList] = useState<'following' | 'followers' | null>(null);
  const [isEditingFavorites, setIsEditingFavorites] = useState(false);
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState<string[]>([]);
  const [favoriteError, setFavoriteError] = useState('');
  const [isSavingFavorites, setIsSavingFavorites] = useState(false);
  const [isLoveTypeOpen, setIsLoveTypeOpen] = useState(false);
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [selectedMovieInfo, setSelectedMovieInfo] = useState<typeof MOVIES[number] | null>(null);

  const decodedParam = userId ? decodeURIComponent(userId) : '';
  const isCurrentUser = !userId || userId === currentUser?.id || decodedParam.toLowerCase() === currentUser?.handle?.toLowerCase();
  const profileUser = isCurrentUser
    ? currentUser
    : decodedParam.startsWith('@')
      ? profileUsers.find(profile => profile.handle.toLowerCase() === decodedParam.toLowerCase())
      : getUserById(userId);

  if (!profileUser) return <div className="p-8 text-center text-white bg-black min-h-screen">Usuário não encontrado</div>;

  const match = matches.find(m =>
    m.userIds.includes(currentUser?.id || '') &&
    m.userIds.includes(profileUser.id)
  );

  const compatibility = match?.compatibility.overall || (isCurrentUser ? null : Math.floor(Math.random() * 20) + 75);
  const isFollowing = Boolean(currentUser?.followingIds?.includes(profileUser.id));
  const posts = profileUser.posts || [];
  const followingProfiles = profileUsers.filter(profile => profileUser.followingIds?.includes(profile.id));
  const followerProfiles = profileUsers.filter(profile => profile.followingIds?.includes(profileUser.id));
  const stats = {
    following: followingProfiles.length,
    followers: followerProfiles.length,
    creations: posts.length
  };
  const liveSelectedPost = selectedPost ? posts.find(post => post.id === selectedPost.id) || selectedPost : null;
  const liveOriginalPost = liveSelectedPost?.repostOfId ? allPosts.find(post => post.id === liveSelectedPost.repostOfId) : null;
  const liveDisplayPost = liveOriginalPost || liveSelectedPost;
  const liveContentUser = liveOriginalPost ? getUserById(liveOriginalPost.userId) : profileUser;
  const favoriteMovies = (profileUser.favoriteMovies || []).map(id => MOVIES.find(m => m.id === id)).filter(Boolean);
  const topFavoriteMovie = favoriteMovies[0];
  const favoriteSearchTerm = favoriteSearch.trim().toLowerCase();
  const filteredFavoriteOptions = favoriteSearchTerm
    ? MOVIES.filter(movie => (
      movie.title.toLowerCase().includes(favoriteSearchTerm) ||
      movie.genres.some(genre => genre.toLowerCase().includes(favoriteSearchTerm))
    ))
    : MOVIES;
  const loveTypeDescriptions: Record<string, string> = {
    'Sonhador Elegante': 'Conexão bonita, profunda e cheia de significado.',
    'Intenso Magnetico': 'Paixão, presença, química e entrega.',
    'Intenso Magnético': 'Paixão, presença, química e entrega.',
    'Guardiao Leal': 'Cuidado, compromisso e segurança emocional.',
    'Guardião Leal': 'Cuidado, compromisso e segurança emocional.',
    'Alma Livre': 'Leveza, espontaneidade e liberdade.',
    'Coracao Nostalgico': 'Memória, detalhes e gestos simbólicos.',
    'Coração Nostálgico': 'Memória, detalhes e gestos simbólicos.',
    'Romantico Visionario': 'Parceria, futuro e sonhos compartilhados.',
    'Romântico Visionário': 'Parceria, futuro e sonhos compartilhados.',
    'Encanto Misterioso': 'Profundidade, seletividade e descoberta aos poucos.'
  };
  const loveTypeLabels: Record<string, string> = {
    'Intenso Magnetico': 'Intenso Magnético',
    'Guardiao Leal': 'Guardião Leal',
    'Coracao Nostalgico': 'Coração Nostálgico',
    'Romantico Visionario': 'Romântico Visionário'
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'images') return post.type === 'image' || post.type === 'video' || post.type === 'text';
    if (activeTab === 'reposts') return post.type === 'repost';
    return false;
  });
  const socialProfiles = socialList === 'following' ? followingProfiles : followerProfiles;

  useEffect(() => {
    if (!currentUser || isCurrentUser) return;
    filteredPosts.forEach(post => {
      recordPostView(post.id);
    });
  }, [currentUser?.id, isCurrentUser, filteredPosts.map(post => post.id).join('|')]);

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

  const openFavoriteEditor = () => {
    setSelectedFavoriteIds(profileUser.favoriteMovies || []);
    setFavoriteError('');
    setFavoriteSearch('');
    setIsEditingFavorites(true);
  };

  const toggleFavoriteSelection = (movieId: string) => {
    setSelectedFavoriteIds(prev => {
      if (prev.includes(movieId)) return prev.filter(id => id !== movieId);
      if (prev.length >= 5) return prev;
      return [...prev, movieId];
    });
  };

  const handleSaveFavorites = async () => {
    setFavoriteError('');
    setIsSavingFavorites(true);

    try {
      await updateFavoriteMovies(selectedFavoriteIds);
      setIsEditingFavorites(false);
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : 'Não foi possível salvar seus filmes favoritos.');
    } finally {
      setIsSavingFavorites(false);
    }
  };

  const openEditProfile = () => {
    setEditName(profileUser.name);
    setEditHandle(profileUser.handle.replace(/^@/, ''));
    setEditBio(profileUser.bio || '');
    setEditEmail('');
    setAvatarFile(null);
    setAvatarPreview(profileUser.avatarUrl);
    setEditError('');
    setEditSuccess('');
    setIsEditing(true);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setEditError('');
    setEditSuccess('');

    try {
      await updateProfile({ name: editName, handle: editHandle, bio: editBio, avatarFile });
      if (editEmail.trim()) {
        await updateEmail(editEmail.trim());
        setEditSuccess('Perfil salvo. Confirme o novo email na sua caixa de entrada.');
      } else {
        setEditSuccess('Perfil salvo.');
      }
      setAvatarFile(null);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.');
    if (!confirmed) return;

    setIsSaving(true);
    setEditError('');

    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Não foi possível excluir sua conta.');
      setIsSaving(false);
    }
  };

  const openPost = (post: Post) => {
    setSelectedPost(post);
    setEditPostCaption(post.caption);
    setIsPostMenuOpen(false);
    setIsEditingPost(false);
    setPostActionError('');
  };

  const handleSavePostCaption = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!liveSelectedPost) return;

    setIsSavingPost(true);
    setPostActionError('');

    try {
      await updatePost(liveSelectedPost.id, { caption: editPostCaption });
      setIsEditingPost(false);
      setIsPostMenuOpen(false);
    } catch (error) {
      setPostActionError(error instanceof Error ? error.message : 'Não foi possível editar a postagem.');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!liveSelectedPost) return;
    const confirmed = window.confirm('Excluir esta postagem? Essa ação não pode ser desfeita.');
    if (!confirmed) return;

    setIsSavingPost(true);
    setPostActionError('');

    try {
      await deletePost(liveSelectedPost.id);
      setSelectedPost(null);
      setIsPostMenuOpen(false);
      setIsEditingPost(false);
    } catch (error) {
      setPostActionError(error instanceof Error ? error.message : 'Não foi possível excluir a postagem.');
    } finally {
      setIsSavingPost(false);
    }
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
          {profileUser.avatarUrl ? (
            <img
              src={profileUser.avatarUrl}
              alt={profileUser.name}
              className="w-24 h-24 md:w-20 md:h-20 rounded-full object-cover border-2 border-black"
            />
          ) : (
            <div className="w-24 h-24 md:w-20 md:h-20 rounded-full bg-[#3F1521] border-2 border-black flex items-center justify-center text-3xl md:text-2xl font-bold">
              {profileUser.name.charAt(0).toUpperCase()}
            </div>
          )}
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
          <button type="button" onClick={() => setSocialList('following')} className="flex flex-col items-center">
            <span className="font-bold text-base">{stats.following}</span>
            <span className="text-xs text-gray-400">Seguindo</span>
          </button>
          <button type="button" onClick={() => setSocialList('followers')} className="flex flex-col items-center">
            <span className="font-bold text-base">{stats.followers}</span>
            <span className="text-xs text-gray-400">Seguidores</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="font-bold text-base">{stats.creations}</span>
            <span className="text-xs text-gray-400">Posts</span>
          </div>
        </div>

        {isCurrentUser ? (
          <div className="flex space-x-2 mb-5">
            <button
              onClick={openEditProfile}
              className="bg-zinc-800 text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Editar perfil
            </button>
          </div>
        ) : (
          <div className="flex space-x-2 mb-5">
            <button
              onClick={handleMessage}
              className="bg-zinc-800 text-white px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle size={17} />
              Mensagem
            </button>
            <button
              onClick={() => toggleFollowUser(profileUser.id)}
              className="bg-zinc-800 text-white px-3 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <UserPlus size={19} />
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
            <button className="bg-zinc-800 text-white p-2.5 rounded-lg hover:bg-zinc-700 transition-colors">
              <ChevronDown size={19} />
            </button>
          </div>
        )}

        <div className="text-center max-w-sm mb-3">
          <p className="text-sm leading-relaxed mb-2">
            {profileUser.bio || 'Sem bio disponível.'}
          </p>
          {topFavoriteMovie && (
            <p className="mb-3 text-sm text-zinc-300">
              <span className="text-zinc-500">Filme favorito:</span>{' '}
              <span className="font-bold text-white">{topFavoriteMovie.title}</span>
            </p>
          )}
          {profileUser.emotionalProfile && (
            <button
              type="button"
              onClick={() => setIsLoveTypeOpen(true)}
              className="mb-3 w-full rounded-3xl border border-[#E4B5C2]/25 bg-gradient-to-br from-[#3F1521]/45 to-white/[0.03] px-4 py-4 text-left shadow-[0_18px_45px_rgba(63,21,33,0.25)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E4B5C2]">Tipo de amor</p>
                  <p className="mt-1 text-base font-bold text-white">{loveTypeLabels[profileUser.emotionalProfile] || profileUser.emotionalProfile}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300 line-clamp-2">
                    {loveTypeDescriptions[profileUser.emotionalProfile] || 'Um jeito único de viver conexões.'}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 p-2 text-[#E4B5C2]">
                  <Info size={16} />
                </span>
              </div>
            </button>
          )}
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
            {isCurrentUser && (
              <div className="col-span-3 p-4">
                <button
                  type="button"
                  onClick={openFavoriteEditor}
                  className="w-full rounded-2xl border border-white/10 bg-[#17171B] px-4 py-3 text-sm font-bold text-white hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2"
                >
                  <Star size={17} fill="currentColor" />
                  Editar ranking de 5 filmes
                </button>
              </div>
            )}
            {favoriteMovies.length > 0 ? (
              favoriteMovies.map((movie, index) => (
                <button
                  key={movie?.id}
                  type="button"
                  onClick={() => movie && setSelectedMovieInfo(movie)}
                  className="aspect-[2/3] bg-zinc-900 relative overflow-hidden text-left"
                >
                  <img
                    src={movie?.posterUrl}
                    alt={movie?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-2 top-2 h-7 min-w-7 rounded-full bg-black/70 px-2 flex items-center justify-center text-xs font-bold text-white backdrop-blur-sm">
                    #{index + 1}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <span className="text-xs font-bold truncate">{movie?.title}</span>
                    <span className="text-[10px] text-gray-300">{movie?.year}</span>
                  </div>
                </button>
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
              const originalPost = post.repostOfId ? allPosts.find(item => item.id === post.repostOfId) : null;
              const displayPost = originalPost || post;
              const movie = displayPost.movieId ? MOVIES.find(m => m.id === displayPost.movieId) : null;
              const displayImage = displayPost.thumbnailUrl || movie?.posterUrl;

              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => openPost(post)}
                  className="aspect-[1080/1450] bg-zinc-900 relative overflow-hidden text-left"
                >
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#222226] p-3 flex items-center justify-center text-center">
                      <p className="text-xs font-semibold leading-snug line-clamp-6">{displayPost.caption}</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white text-xs drop-shadow-md">
                    <Play size={12} fill="currentColor" />
                    <span>{post.views}</span>
                  </div>
                  {post.type === 'repost' && (
                    <div className="absolute inset-x-2 bottom-2 flex items-center justify-end gap-1.5 rounded-full bg-black/45 px-2 py-1 text-[10px] text-white backdrop-blur-md">
                      <span>republicado por:</span>
                      {profileUser.avatarUrl ? (
                        <img src={profileUser.avatarUrl} alt={profileUser.name} className="h-4 w-4 rounded-full object-cover" />
                      ) : (
                        <span className="h-4 w-4 rounded-full bg-[#3F1521] flex items-center justify-center text-[8px]">
                          {profileUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
            {filteredPosts.length === 0 && (
              <div className="col-span-3 py-16 text-center text-zinc-500">
                <Grid size={42} className="mx-auto mb-4 opacity-20" />
                <p>Nenhuma publicação encontrada.</p>
              </div>
            )}
          </>
        )}
      </div>

      {liveSelectedPost && (
        <div className="fixed inset-0 z-[125] bg-black/85 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-5">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#17171B] shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#17171B]/95 backdrop-blur-md z-10">
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{profileUser.handle}</p>
                <p className="text-xs text-zinc-500">Postagem</p>
              </div>
              <div className="relative flex items-center gap-2">
                {isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => setIsPostMenuOpen(prev => !prev)}
                    className="p-2 rounded-full bg-white/5 text-zinc-300 hover:text-white"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPost(null);
                    setIsPostMenuOpen(false);
                    setIsEditingPost(false);
                    setPostActionError('');
                  }}
                  className="p-2 rounded-full bg-white/5 text-zinc-300 hover:text-white"
                >
                  <X size={20} />
                </button>

                {isPostMenuOpen && (
                  <div className="absolute right-11 top-11 w-44 rounded-2xl border border-white/10 bg-[#222226] p-2 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setEditPostCaption(liveSelectedPost.caption);
                        setIsEditingPost(true);
                        setIsPostMenuOpen(false);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                    >
                      Editar legenda
                    </button>
                    <button
                      type="button"
                      disabled={isSavingPost}
                      onClick={handleDeletePost}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                    >
                      Excluir post
                    </button>
                  </div>
                )}
              </div>
            </div>

            {(() => {
              const movie = liveDisplayPost?.movieId ? MOVIES.find(m => m.id === liveDisplayPost.movieId) : null;
              const displayImage = liveDisplayPost?.thumbnailUrl || movie?.posterUrl;

              return displayImage ? (
                <div className="aspect-[1080/1450] bg-zinc-900">
                  <img src={displayImage} alt="Post" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[1080/1450] bg-[#222226] p-8 flex items-center justify-center text-center">
                  <p className="text-2xl font-bold leading-tight">{liveDisplayPost?.caption}</p>
                </div>
              );
            })()}

            {liveSelectedPost.type === 'repost' && (
              <div className="mx-5 mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500">Perfil original</p>
                  <p className="truncate text-sm font-bold text-white">{liveContentUser?.handle || 'Publicação original'}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>republicado por:</span>
                  {profileUser.avatarUrl ? (
                    <img src={profileUser.avatarUrl} alt={profileUser.name} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="h-7 w-7 rounded-full bg-[#3F1521] flex items-center justify-center text-[10px] text-white">
                      {profileUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Play size={14} fill="currentColor" />
                  {liveSelectedPost.views} visualizacoes
                </span>
                <span>{new Date(liveSelectedPost.timestamp).toLocaleDateString('pt-BR')}</span>
              </div>

              {isEditingPost ? (
                <form onSubmit={handleSavePostCaption} className="space-y-3">
                  <textarea
                    value={editPostCaption}
                    onChange={(event) => setEditPostCaption(event.target.value)}
                    className="w-full min-h-28 rounded-3xl bg-[#222226] border border-white/10 py-4 px-5 text-white outline-none focus:border-white/25 resize-none"
                    placeholder="Editar legenda"
                  />
                  {postActionError && <p className="text-sm text-red-300">{postActionError}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingPost(false)}
                      className="flex-1 h-11 rounded-full bg-zinc-800 text-white font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPost}
                      className="flex-1 h-11 rounded-full bg-[#3F1521] hover:bg-[#5B343C] disabled:opacity-60 text-white font-bold"
                    >
                      {isSavingPost ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    <span className="font-bold text-white mr-2">{liveContentUser?.handle || profileUser.handle}</span>
                    {liveDisplayPost?.caption || 'Sem legenda.'}
                  </p>
                  {postActionError && <p className="text-sm text-red-300">{postActionError}</p>}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {socialList && (
        <div className="fixed inset-0 z-[128] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-5">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md max-h-[82vh] overflow-hidden rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#17171B] shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold">{socialList === 'following' ? 'Seguindo' : 'Seguidores'}</h2>
                <p className="text-xs text-zinc-500">{profileUser.handle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSocialList(null)}
                className="p-2 rounded-full bg-white/5 text-zinc-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-3">
              {socialProfiles.length === 0 ? (
                <p className="py-12 text-center text-sm text-zinc-500">
                  {socialList === 'following' ? 'Ainda não segue ninguém.' : 'Ainda não há seguidores.'}
                </p>
              ) : (
                socialProfiles.map(profile => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      setSocialList(null);
                      navigate(`/profile/${profile.handle}`);
                    }}
                    className="w-full flex items-center gap-3 rounded-2xl p-3 text-left hover:bg-white/5"
                  >
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[#3F1521] flex items-center justify-center font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{profile.name}</p>
                      <p className="truncate text-xs text-zinc-500">{profile.handle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {isLoveTypeOpen && profileUser.emotionalProfile && (
        <div className="fixed inset-0 z-[129] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-5">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#17171B] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E4B5C2]">Tipo de amor</p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {loveTypeLabels[profileUser.emotionalProfile] || profileUser.emotionalProfile}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsLoveTypeOpen(false)}
                className="p-2 rounded-full bg-white/5 text-zinc-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-zinc-300">
              {loveTypeDescriptions[profileUser.emotionalProfile] || 'Um jeito único de viver conexões.'}
            </p>
          </motion.div>
        </div>
      )}

      {isEditingFavorites && (
        <div className="fixed inset-0 z-[129] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-5">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md max-h-[90vh] overflow-hidden rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#17171B] shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold">Ranking de filmes favoritos</h2>
                <p className="text-xs text-zinc-500">{selectedFavoriteIds.length}/5 selecionados</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingFavorites(false)}
                className="p-2 rounded-full bg-white/5 text-zinc-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {selectedFavoriteIds.length > 0 && (
              <div className="border-b border-white/10 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Sua ordem</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedFavoriteIds.map((movieId, index) => {
                    const movie = MOVIES.find(item => item.id === movieId);
                    if (!movie) return null;
                    return (
                      <button
                        key={movie.id}
                        type="button"
                        onClick={() => toggleFavoriteSelection(movie.id)}
                        className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900"
                      >
                        <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                        <span className="absolute left-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">#{index + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-b border-white/10 p-4">
              <div className="relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={favoriteSearch}
                  onChange={(event) => setFavoriteSearch(event.target.value)}
                  className="w-full h-12 rounded-full bg-[#222226] border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
                  placeholder="Pesquisar filme pelo nome"
                />
              </div>
            </div>

            <div className="max-h-[48vh] overflow-y-auto p-3">
              {filteredFavoriteOptions.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-500">Nenhum filme encontrado.</p>
              ) : filteredFavoriteOptions.map(movie => {
                const selectedIndex = selectedFavoriteIds.indexOf(movie.id);
                const isSelected = selectedIndex >= 0;
                const isDisabled = !isSelected && selectedFavoriteIds.length >= 5;

                return (
                  <button
                    key={movie.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleFavoriteSelection(movie.id)}
                    className="w-full flex items-center gap-3 rounded-2xl p-3 text-left hover:bg-white/5 disabled:opacity-40"
                  >
                    <img src={movie.posterUrl} alt={movie.title} className="h-16 w-11 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{movie.title}</p>
                      <p className="text-xs text-zinc-500">{movie.year}</p>
                    </div>
                    <span className={`h-8 min-w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'
                    }`}>
                      {isSelected ? `#${selectedIndex + 1}` : '+'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 p-4">
              {favoriteError && <p className="mb-3 text-sm text-red-300">{favoriteError}</p>}
              <button
                type="button"
                disabled={isSavingFavorites}
                onClick={handleSaveFavorites}
                className="w-full h-12 rounded-full bg-[#3F1521] hover:bg-[#5B343C] disabled:opacity-60 text-white font-bold transition-colors"
              >
                {isSavingFavorites ? 'Salvando...' : 'Salvar ranking'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedMovieInfo && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-5">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md overflow-hidden rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#17171B] shadow-2xl"
          >
            <div className="relative aspect-[16/10] bg-zinc-900">
              <img
                src={selectedMovieInfo.posterUrl}
                alt={selectedMovieInfo.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17171B] via-black/35 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedMovieInfo(null)}
                className="absolute right-4 top-4 rounded-full bg-black/45 p-2 text-white backdrop-blur-md"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Filme favorito</p>
                <h2 className="mt-1 text-2xl font-bold text-white">{selectedMovieInfo.title}</h2>
                <p className="mt-1 text-sm text-white/70">{selectedMovieInfo.year} • {selectedMovieInfo.genres.join(', ')}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-zinc-300">{selectedMovieInfo.description}</p>
              {selectedMovieInfo.platforms.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedMovieInfo.platforms.map(platform => (
                    <span key={platform} className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                      {platform}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-5">
          <motion.form
            onSubmit={handleSaveProfile}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-[32px] md:rounded-[28px] border border-white/10 bg-[#1F1F24] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Editar perfil</h2>
              <button type="button" onClick={() => setIsEditing(false)} className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border border-white/10 mb-3"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#3F1521] border border-white/10 mb-3 flex items-center justify-center text-3xl font-bold">
                  {profileUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium cursor-pointer hover:bg-zinc-700">
                <ImageIcon size={16} />
                Alterar foto
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Nome</label>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full rounded-full bg-[#17171B] border border-white/10 py-4 px-5 text-white outline-none focus:border-white/25"
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Nome de usuário</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <input
                    value={editHandle}
                    onChange={(event) => setEditHandle(event.target.value)}
                    className="w-full rounded-full bg-[#17171B] border border-white/10 py-4 pl-10 pr-5 text-white outline-none focus:border-white/25"
                    placeholder="seunome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Novo email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  className="w-full rounded-full bg-[#17171B] border border-white/10 py-4 px-5 text-white outline-none focus:border-white/25"
                  placeholder="preencha apenas se quiser alterar"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(event) => setEditBio(event.target.value)}
                  className="w-full min-h-28 rounded-3xl bg-[#17171B] border border-white/10 py-4 px-5 text-white outline-none focus:border-white/25 resize-none"
                  placeholder="Conte um pouco sobre você"
                  maxLength={220}
                />
              </div>
            </div>

            {editError && <p className="mt-4 text-sm text-red-300">{editError}</p>}
            {editSuccess && <p className="mt-4 text-sm text-emerald-300">{editSuccess}</p>}

            <div className="mt-6 space-y-3">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-12 rounded-full bg-[#3F1521] hover:bg-[#5B343C] disabled:opacity-60 text-white font-bold transition-colors"
              >
                {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleDeleteAccount}
                className="w-full h-12 rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10 disabled:opacity-60 font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={17} />
                Excluir conta
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
