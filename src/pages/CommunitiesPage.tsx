import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Check,
  Clapperboard,
  Copy,
  Crown,
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageCircle,
  Plus,
  Send,
  ToggleLeft,
  ToggleRight,
  Users,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Community } from '../types';

const CINECLUB_ID = '00000000-0000-0000-0000-000000000001';

const toEmbedUrl = (url?: string) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }
    if (parsed.hostname.includes('vimeo.com')) {
      return `https://player.vimeo.com/video/${parsed.pathname.replace('/', '')}`;
    }
  } catch {
    return url;
  }
  return url;
};

export const CommunitiesPage: React.FC = () => {
  const {
    user,
    communities,
    referralCount,
    createCommunity,
    joinCommunity,
    createCommunityPost,
    updateCommunityLiveUrl,
    getUserById
  } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [features, setFeatures] = useState<Community['features']>({
    cineLive: true,
    groups: true,
    posts: true,
    cineLiveUrl: ''
  });
  const [groupNames, setGroupNames] = useState(['Geral', 'Sessões', 'Spoilers']);
  const [createError, setCreateError] = useState('');
  const [isSavingCommunity, setIsSavingCommunity] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postPreview, setPostPreview] = useState('');
  const [postError, setPostError] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [liveUrlInput, setLiveUrlInput] = useState('');
  const [liveUrlError, setLiveUrlError] = useState('');
  const [isSavingLiveUrl, setIsSavingLiveUrl] = useState(false);

  const directorCommunity = communities.find(community => community.ownerId === user?.id);
  const selectedCommunity = selectedCommunityId ? communities.find(community => community.id === selectedCommunityId) : undefined;
  const isMember = Boolean(user && selectedCommunity?.memberIds.includes(user.id));
  const isOwner = Boolean(user && selectedCommunity?.ownerId === user.id);
  const referralLink = user ? `${window.location.origin}/?ref=${user.id}` : '';
  const embedUrl = toEmbedUrl(selectedCommunity?.features.cineLiveUrl);
  const sortedCommunities = useMemo(() => {
    const cineClub = communities.find(community => community.id === CINECLUB_ID);
    const rest = communities.filter(community => community.id !== CINECLUB_ID);
    return cineClub ? [cineClub, ...rest] : rest;
  }, [communities]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const communityId = params.get('community');
    if (communityId) setSelectedCommunityId(communityId);
  }, []);

  useEffect(() => {
    setLiveUrlInput(selectedCommunity?.features.cineLiveUrl || '');
    setLiveUrlError('');
  }, [selectedCommunity?.id, selectedCommunity?.features.cineLiveUrl]);

  const copyReferralLink = async () => {
    await navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFilePreview = (
    file: File | undefined,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!file) return;
    setter(file);
    previewSetter(URL.createObjectURL(file));
  };

  const resetCreateForm = () => {
    setCommunityName('');
    setCommunityDescription('');
    setCoverFile(null);
    setAvatarFile(null);
    setCoverPreview('');
    setAvatarPreview('');
    setFeatures({ cineLive: true, groups: true, posts: true, cineLiveUrl: '' });
    setGroupNames(['Geral', 'Sessões', 'Spoilers']);
    setCreateError('');
  };

  const handleCreateCommunity = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError('');
    setIsSavingCommunity(true);

    try {
      await createCommunity({
        name: communityName,
        description: communityDescription,
        coverFile,
        avatarFile,
        features,
        groups: groupNames
      });
      resetCreateForm();
      setIsCreating(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Não foi possível criar a comunidade.');
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleJoin = async () => {
    if (!selectedCommunity) return;
    await joinCommunity(selectedCommunity.id);
  };

  const handlePostImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPostImage(file);
    setPostPreview(URL.createObjectURL(file));
  };

  const handleCommunityPost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCommunity) return;
    setPostError('');
    setIsPosting(true);

    try {
      await createCommunityPost(selectedCommunity.id, { text: postText, imageFile: postImage });
      setPostText('');
      setPostImage(null);
      setPostPreview('');
    } catch (error) {
      setPostError(error instanceof Error ? error.message : 'Não foi possível publicar na comunidade.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveLiveUrl = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCommunity) return;
    setLiveUrlError('');
    setIsSavingLiveUrl(true);

    try {
      await updateCommunityLiveUrl(selectedCommunity.id, liveUrlInput);
    } catch (error) {
      setLiveUrlError(error instanceof Error ? error.message : 'Não foi possível atualizar o Cine LIVE.');
    } finally {
      setIsSavingLiveUrl(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17171B] text-white pb-28">
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#17171B]/90 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {selectedCommunity ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedCommunityId('')}
                className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm font-bold text-zinc-200"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-bold">{selectedCommunity.name}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#E4B5C2]">Comunidade</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E4B5C2]">Diretor</p>
                <h1 className="text-2xl font-bold">Comunidades</h1>
              </div>
              <div className="rounded-full bg-[#3F1521] p-3">
                <Clapperboard size={22} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className={selectedCommunity ? 'space-y-0' : 'space-y-5 p-4'}>
        {!selectedCommunity && (
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#222226]">
          <div className="relative min-h-[220px] p-5">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#17171B]/30 via-[#17171B]/80 to-[#222226]" />
            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                <Crown size={14} className="text-[#E4B5C2]" />
                {user?.directorEligible ? 'Você é Diretor' : `${Math.min(referralCount, 5)}/5 indicações`}
              </div>
              <h2 className="max-w-xs text-3xl font-bold leading-tight">
                Convide amigos e desbloqueie sua comunidade de cinema.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-300">
                5 amigos precisam se cadastrar pelo seu link em até 7 dias após seu cadastro.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 p-4">
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#E4B5C2]"
                style={{ width: `${Math.min(referralCount / 5, 1) * 100}%` }}
              />
            </div>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1 rounded-full bg-black/25 px-4 py-3 text-xs text-zinc-300 truncate">
                {referralLink}
              </div>
              <button
                type="button"
                onClick={copyReferralLink}
                className="shrink-0 rounded-full bg-white px-4 py-3 text-sm font-bold text-black"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </section>
        )}

        {!selectedCommunity && user?.directorEligible && !directorCommunity && (
          <button
            type="button"
            onClick={() => {
              resetCreateForm();
              setIsCreating(true);
            }}
            className="w-full rounded-[24px] border border-[#E4B5C2]/25 bg-[#3F1521] px-5 py-4 text-left shadow-[0_18px_45px_rgba(63,21,33,0.28)]"
          >
            <div className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-bold text-white">Criar minha comunidade</span>
                <span className="mt-1 block text-xs text-[#E4B5C2]">Defina visual, Cine LIVE, grupos e posts.</span>
              </span>
              <Plus size={22} />
            </div>
          </button>
        )}

        {!selectedCommunity && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Comunidades</h2>
            <span className="text-xs text-zinc-500">{sortedCommunities.length} ativas</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {sortedCommunities.map(community => (
              <button
                key={community.id}
                type="button"
                onClick={() => setSelectedCommunityId(community.id)}
                className="w-40 shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#222226] text-left"
              >
                <div className="relative h-24 bg-zinc-900">
                  {community.coverUrl && <img src={community.coverUrl} alt={community.name} className="h-full w-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-2 h-10 w-10 overflow-hidden rounded-2xl border border-white/20 bg-[#3F1521]">
                    {community.avatarUrl ? (
                      <img src={community.avatarUrl} alt={community.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold">{community.name.charAt(0)}</div>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-bold">{community.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{community.memberIds.length} membros</p>
                </div>
              </button>
            ))}
          </div>
        </section>
        )}

        {selectedCommunity && (
          <section className="min-h-screen bg-[#17171B]">
            <div className="relative h-[310px] bg-zinc-900">
              {selectedCommunity.coverUrl && <img src={selectedCommunity.coverUrl} alt={selectedCommunity.name} className="h-full w-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#17171B] via-black/50 to-black/15" />
              <div className="absolute bottom-6 left-5 right-5 flex items-end justify-between gap-4">
                <div className="flex min-w-0 items-end gap-3">
                  <div className="h-20 w-20 overflow-hidden rounded-[28px] border border-white/15 bg-[#3F1521] shadow-2xl">
                    {selectedCommunity.avatarUrl ? (
                      <img src={selectedCommunity.avatarUrl} alt={selectedCommunity.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold">{selectedCommunity.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-3xl font-bold">{selectedCommunity.name}</h2>
                    <p className="text-xs text-zinc-400">{selectedCommunity.memberIds.length} membros</p>
                  </div>
                </div>
                {!isMember && (
                  <button type="button" onClick={handleJoin} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
                    Entrar
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-5 px-4 py-5">
              <p className="text-sm leading-relaxed text-zinc-300">{selectedCommunity.description}</p>

              {selectedCommunity.features.cineLive && (
                <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Cine LIVE</p>
                      <p className="text-xs text-zinc-500">Sessão compartilhada por link</p>
                    </div>
                    {selectedCommunity.features.cineLiveUrl && (
                      <a
                        href={selectedCommunity.features.cineLiveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white/10 p-2 text-white"
                      >
                        <ExternalLink size={17} />
                      </a>
                    )}
                  </div>
                  {embedUrl ? (
                    <div className="aspect-video overflow-hidden rounded-2xl bg-black">
                      <iframe src={embedUrl} title="Cine LIVE" className="h-full w-full" allowFullScreen />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-zinc-500">
                      O Diretor ainda não adicionou um link para assistir.
                    </div>
                  )}
                  {isOwner && (
                    <form onSubmit={handleSaveLiveUrl} className="mt-3 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                        Link da transmissão
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={liveUrlInput}
                          onChange={(event) => setLiveUrlInput(event.target.value)}
                          className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#17171B] px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                          placeholder="Cole um link do YouTube, Vimeo ou outro"
                        />
                        <button
                          type="submit"
                          disabled={isSavingLiveUrl}
                          className="rounded-full bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-60"
                        >
                          {isSavingLiveUrl ? '...' : 'Salvar'}
                        </button>
                      </div>
                      {liveUrlError && <p className="text-sm text-red-300">{liveUrlError}</p>}
                    </form>
                  )}
                </div>
              )}

              {selectedCommunity.features.groups && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <MessageCircle size={17} className="text-[#E4B5C2]" />
                    <h3 className="font-bold">Grupos</h3>
                  </div>
                  <div className="grid gap-2">
                    {selectedCommunity.groups.slice(0, 3).map(group => (
                      <div key={group.id} className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3">
                        <span className="text-sm font-bold">{group.name}</span>
                        <span className="text-xs text-zinc-500">em breve</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isOwner && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Users size={17} className="text-[#E4B5C2]" />
                    <h3 className="font-bold">Membros</h3>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedCommunity.memberIds.map(memberId => {
                      const member = getUserById(memberId);
                      if (!member) return null;
                      return (
                        <div key={member.id} className="w-20 shrink-0 text-center">
                          <div className="mx-auto h-12 w-12 overflow-hidden rounded-full bg-[#3F1521]">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold">{member.name.charAt(0)}</div>
                            )}
                          </div>
                          <p className="mt-2 truncate text-[11px] text-zinc-400">{member.handle}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedCommunity.features.posts && isMember && (
                <form onSubmit={handleCommunityPost} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                  {postPreview && (
                    <div className="mb-3 aspect-[1080/1450] overflow-hidden rounded-2xl bg-black">
                      <img src={postPreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <textarea
                    value={postText}
                    onChange={(event) => setPostText(event.target.value)}
                    className="min-h-24 w-full resize-none rounded-3xl border border-white/10 bg-[#17171B] px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                    placeholder="Publicar na comunidade..."
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <label className="rounded-full bg-white/10 p-3 text-white">
                      <ImageIcon size={18} />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePostImage} />
                    </label>
                    <button
                      type="submit"
                      disabled={isPosting}
                      className="flex-1 rounded-full bg-[#3F1521] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {isPosting ? 'Publicando...' : 'Publicar'}
                    </button>
                  </div>
                  {postError && <p className="mt-3 text-sm text-red-300">{postError}</p>}
                </form>
              )}

              {selectedCommunity.features.posts && (
                <div className="space-y-3">
                  {selectedCommunity.posts.length === 0 ? (
                    <p className="py-8 text-center text-sm text-zinc-500">Nenhuma publicação na comunidade ainda.</p>
                  ) : selectedCommunity.posts.map(post => {
                    const postUser = getUserById(post.userId);
                    return (
                      <article key={post.id} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-9 w-9 overflow-hidden rounded-full bg-[#3F1521]">
                            {postUser?.avatarUrl ? (
                              <img src={postUser.avatarUrl} alt={postUser.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                                {postUser?.name.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{postUser?.handle || '@usuario'}</p>
                            <p className="text-[11px] text-zinc-500">{new Date(post.timestamp).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        {post.imageUrl && (
                          <div className="mb-3 aspect-[1080/1450] overflow-hidden rounded-2xl bg-black">
                            <img src={post.imageUrl} alt="Post da comunidade" className="h-full w-full object-cover" />
                          </div>
                        )}
                        {post.text && <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{post.text}</p>}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[132] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm md:items-center md:p-5">
          <motion.form
            onSubmit={handleCreateCommunity}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-white/10 bg-[#1F1F24] shadow-2xl md:rounded-[28px]"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-xl font-bold">Criar comunidade</h2>
                <p className="text-xs text-zinc-500">1 comunidade por Diretor</p>
              </div>
              <button type="button" onClick={() => setIsCreating(false)} className="rounded-full bg-white/5 p-2 text-zinc-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Nome da comunidade</label>
                <input
                  value={communityName}
                  onChange={(event) => setCommunityName(event.target.value)}
                  className="w-full rounded-full border border-white/10 bg-[#17171B] px-5 py-4 text-white outline-none focus:border-white/25"
                  placeholder="Ex: Romance Club"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Descrição</label>
                <textarea
                  value={communityDescription}
                  onChange={(event) => setCommunityDescription(event.target.value)}
                  className="min-h-24 w-full resize-none rounded-3xl border border-white/10 bg-[#17171B] px-5 py-4 text-white outline-none focus:border-white/25"
                  placeholder="Conte o clima da sua comunidade..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#17171B] text-sm text-zinc-400">
                  {coverPreview ? <img src={coverPreview} alt="Capa" className="h-full w-full object-cover" /> : <><Camera size={22} /><span className="mt-2">Capa</span></>}
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFilePreview(event.target.files?.[0], setCoverFile, setCoverPreview)} />
                </label>
                <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#17171B] text-sm text-zinc-400">
                  {avatarPreview ? <img src={avatarPreview} alt="Foto" className="h-full w-full object-cover" /> : <><ImageIcon size={22} /><span className="mt-2">Foto</span></>}
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFilePreview(event.target.files?.[0], setAvatarFile, setAvatarPreview)} />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-white">Funcionalidades</p>
                {[
                  ['cineLive', 'Cine LIVE', 'Sessões por link externo'],
                  ['groups', 'Grupos', 'Até 3 grupos de bate-papo'],
                  ['posts', 'Posts', 'Imagem e texto na comunidade']
                ].map(([key, title, description]) => {
                  const typedKey = key as keyof Pick<Community['features'], 'cineLive' | 'groups' | 'posts'>;
                  const active = Boolean(features[typedKey]);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFeatures(prev => ({ ...prev, [typedKey]: !active }))}
                      className="flex w-full items-center justify-between rounded-2xl bg-[#17171B] p-4 text-left"
                    >
                      <span>
                        <span className="block text-sm font-bold">{title}</span>
                        <span className="block text-xs text-zinc-500">{description}</span>
                      </span>
                      {active ? <ToggleRight className="text-[#E4B5C2]" size={30} /> : <ToggleLeft className="text-zinc-600" size={30} />}
                    </button>
                  );
                })}
              </div>

              {features.cineLive && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Link do Cine LIVE</label>
                  <div className="relative">
                    <LinkIcon size={17} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={features.cineLiveUrl || ''}
                      onChange={(event) => setFeatures(prev => ({ ...prev, cineLiveUrl: event.target.value }))}
                      className="w-full rounded-full border border-white/10 bg-[#17171B] py-4 pl-12 pr-5 text-white outline-none focus:border-white/25"
                      placeholder="YouTube, Vimeo ou outro link"
                    />
                  </div>
                </div>
              )}

              {features.groups && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Grupos</label>
                  {groupNames.map((groupName, index) => (
                    <input
                      key={index}
                      value={groupName}
                      onChange={(event) => setGroupNames(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                      className="w-full rounded-full border border-white/10 bg-[#17171B] px-5 py-3 text-sm text-white outline-none focus:border-white/25"
                      placeholder={`Grupo ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-5">
              {createError && <p className="mb-3 text-sm text-red-300">{createError}</p>}
              <button
                type="submit"
                disabled={isSavingCommunity}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3F1521] font-bold text-white disabled:opacity-60"
              >
                <Send size={17} />
                {isSavingCommunity ? 'Criando...' : 'Criar comunidade'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
