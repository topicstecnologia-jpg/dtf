import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOVIES } from '../data/mock';
import { ArrowLeft, MessageCircle, Grid, Play, Repeat, Heart, Share2, Bell, UserPlus, ChevronDown, Camera, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, startChat, matches, getUserById, profileUsers, updateProfile, updateEmail, deleteAccount, toggleFollowUser } = useApp();
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
  const isFollowing = Boolean(currentUser?.followingIds?.includes(profileUser.id));
  const posts = profileUser.posts || [];
  const favoriteMovies = (profileUser.favoriteMovies || []).map(id => MOVIES.find(m => m.id === id)).filter(Boolean);

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'images') return post.type === 'image' || post.type === 'video' || post.type === 'text';
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
      setEditError(error instanceof Error ? error.message : 'Nao foi possivel salvar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Tem certeza que deseja excluir sua conta? Essa acao nao pode ser desfeita.');
    if (!confirmed) return;

    setIsSaving(true);
    setEditError('');

    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Nao foi possivel excluir sua conta.');
      setIsSaving(false);
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
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#222226] p-3 flex items-center justify-center text-center">
                      <p className="text-xs font-semibold leading-snug line-clamp-6">{post.caption}</p>
                    </div>
                  )}
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
                <label className="text-sm font-medium text-gray-300 ml-1">Nome de usuario</label>
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
                  placeholder="Conte um pouco sobre voce"
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
