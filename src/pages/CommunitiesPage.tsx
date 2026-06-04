import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Check,
  Clapperboard,
  Copy,
  Crown,
  ArrowLeft,
  Edit3,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageCircle,
  Plus,
  Trash2,
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

const getVideoPreviewUrl = (url?: string) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    if (parsed.hostname.includes('youtu.be')) {
      return `https://img.youtube.com/vi/${parsed.pathname.replace('/', '')}/hqdefault.jpg`;
    }
  } catch {
    return '';
  }
  return '';
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
    updateCommunity,
    deleteCommunity,
    sendCommunityMessage,
    enterCommunityRoom,
    anonymousScripts,
    sendAnonymousScript,
    markAnonymousScriptRead,
    deleteAnonymousScript,
    getUserById
  } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingCommunity, setIsEditingCommunity] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [roomMessage, setRoomMessage] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [groupCoverFiles, setGroupCoverFiles] = useState<(File | null)[]>([null, null, null]);
  const [groupCoverPreviews, setGroupCoverPreviews] = useState(['', '', '']);
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
  const [deleteError, setDeleteError] = useState('');
  const [scriptMode, setScriptMode] = useState<'instant' | '24h' | ''>('');
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptRecipient, setScriptRecipient] = useState('');
  const [scriptBody, setScriptBody] = useState('');
  const [scriptError, setScriptError] = useState('');
  const [isSendingScript, setIsSendingScript] = useState(false);
  const [openScriptId, setOpenScriptId] = useState('');

  const directorCommunity = communities.find(community => community.ownerId === user?.id);
  const selectedCommunity = selectedCommunityId ? communities.find(community => community.id === selectedCommunityId) : undefined;
  const isMember = Boolean(user && selectedCommunity?.memberIds.includes(user.id));
  const isOwner = Boolean(user && selectedCommunity?.ownerId === user.id);
  const referralLink = user ? `${window.location.origin}/?ref=${user.id}` : '';
  const embedUrl = toEmbedUrl(selectedCommunity?.features.cineLiveUrl);
  const videoPreviewUrl = getVideoPreviewUrl(selectedCommunity?.features.cineLiveUrl) || selectedCommunity?.coverUrl || '';
  const selectedRoomMessages = selectedCommunity?.messages.filter(message => message.roomId === selectedRoomId) || [];
  const selectedGroup = selectedCommunity?.groups.find(group => group.id === selectedRoomId);
  const selectedRoomTitle = selectedRoomId === 'cine-live' ? 'Cine LIVE' : selectedGroup?.name || '';
  const visibleAnonymousScripts = anonymousScripts.filter(script => script.mode === '24h');
  const openScript = anonymousScripts.find(script => script.id === openScriptId);
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

  useEffect(() => {
    if (!openScript || openScript.readAt) return;
    markAnonymousScriptRead(openScript.id).catch(() => undefined);
  }, [openScript?.id, openScript?.readAt]);

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
    setGroupCoverFiles([null, null, null]);
    setGroupCoverPreviews(['', '', '']);
    setFeatures({ cineLive: true, groups: true, posts: true, cineLiveUrl: '' });
    setGroupNames(['Geral', 'Sessões', 'Spoilers']);
    setCreateError('');
  };

  const openEditCommunity = () => {
    if (!selectedCommunity) return;
    setCommunityName(selectedCommunity.name);
    setCommunityDescription(selectedCommunity.description);
    setCoverFile(null);
    setAvatarFile(null);
    setCoverPreview(selectedCommunity.coverUrl || '');
    setAvatarPreview(selectedCommunity.avatarUrl || '');
    setGroupCoverFiles([null, null, null]);
    setGroupCoverPreviews([
      selectedCommunity.groups[0]?.coverUrl || '',
      selectedCommunity.groups[1]?.coverUrl || '',
      selectedCommunity.groups[2]?.coverUrl || ''
    ]);
    setFeatures(selectedCommunity.features);
    setGroupNames([
      selectedCommunity.groups[0]?.name || 'Geral',
      selectedCommunity.groups[1]?.name || 'Sessões',
      selectedCommunity.groups[2]?.name || 'Spoilers'
    ]);
    setCreateError('');
    setIsEditingCommunity(true);
  };

  const handleGroupCoverChange = (index: number, file?: File) => {
    if (!file) return;
    setGroupCoverFiles(prev => prev.map((item, itemIndex) => itemIndex === index ? file : item));
    setGroupCoverPreviews(prev => prev.map((item, itemIndex) => itemIndex === index ? URL.createObjectURL(file) : item));
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
        groups: groupNames,
        groupCoverFiles
      });
      resetCreateForm();
      setIsCreating(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Não foi possível criar a comunidade.');
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleUpdateCommunity = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCommunity) return;
    setCreateError('');
    setIsSavingCommunity(true);

    try {
      await updateCommunity(selectedCommunity.id, {
        name: communityName,
        description: communityDescription,
        coverFile,
        avatarFile,
        features,
        groups: groupNames,
        groupCoverFiles
      });
      setIsEditingCommunity(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Não foi possível editar a comunidade.');
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!selectedCommunity) return;
    setDeleteError('');
    setIsSavingCommunity(true);
    try {
      await deleteCommunity(selectedCommunity.id);
      setSelectedCommunityId('');
      setSelectedRoomId('');
      setIsEditingCommunity(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Não foi possível excluir a comunidade.');
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

  const openRoom = async (roomId: string) => {
    if (!selectedCommunity) return;
    setSelectedRoomId(roomId);
    setRoomMessage('');
    if (roomId === 'cine-live') {
      await enterCommunityRoom(selectedCommunity.id, roomId);
    }
  };

  const handleSendRoomMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCommunity || !selectedRoomId || !roomMessage.trim()) return;
    await sendCommunityMessage(selectedCommunity.id, selectedRoomId, roomMessage);
    setRoomMessage('');
  };

  const resetScriptForm = () => {
    setScriptMode('');
    setScriptTitle('');
    setScriptRecipient('');
    setScriptBody('');
    setScriptError('');
  };

  const handleSendAnonymousScript = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!scriptMode) return;
    setScriptError('');
    setIsSendingScript(true);

    try {
      await sendAnonymousScript({
        recipientHandle: scriptRecipient,
        mode: scriptMode,
        title: scriptTitle,
        body: scriptBody
      });
      resetScriptForm();
    } catch (error) {
      setScriptError(error instanceof Error ? error.message : 'Não foi possível enviar o roteiro.');
    } finally {
      setIsSendingScript(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#17171B] text-white ${selectedRoomId ? 'pb-0' : 'pb-28'}`}>
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#17171B]/90 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {selectedCommunity ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (selectedRoomId) {
                    setSelectedRoomId('');
                    return;
                  }
                  setSelectedCommunityId('');
                }}
                className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm font-bold text-zinc-200"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              <div className="flex min-w-0 items-center gap-2 text-right">
                {selectedRoomId && selectedRoomId !== 'cine-live' && (
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#3F1521]">
                    {selectedGroup?.coverUrl ? (
                      <img src={selectedGroup.coverUrl} alt={selectedGroup.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold">
                        {selectedRoomTitle.charAt(0) || 'G'}
                      </div>
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{selectedRoomTitle || selectedCommunity.name}</p>
                  {!selectedRoomId && <p className="text-[10px] uppercase tracking-[0.18em] text-[#E4B5C2]">Comunidade</p>}
                </div>
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
        {!selectedCommunity && user?.directorEligible && (
          <div className="px-1">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#E4B5C2]">
              <Crown size={16} />
              Você é um Diretor
            </div>
          </div>
        )}

        {!selectedCommunity && !user?.directorEligible && (
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
            <p className="text-xs text-zinc-400">{Math.min(referralCount, 5)} de 5 indicações concluídas.</p>
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

        {!selectedCommunity && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Roteiros Anônimos</h2>
              {visibleAnonymousScripts.length > 0 && (
                <span className="text-xs text-zinc-500">{visibleAnonymousScripts.length} recebidos</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  mode: 'instant' as const,
                  title: 'Roteiro Instante',
                  text: 'Desaparece após a leitura.'
                },
                {
                  mode: '24h' as const,
                  title: 'Roteiro 24 horas',
                  text: 'Fica disponível por 24 horas.'
                }
              ].map(card => (
                <button
                  key={card.mode}
                  type="button"
                  onClick={() => {
                    resetScriptForm();
                    setScriptMode(card.mode);
                  }}
                  className="rounded-[24px] border border-white/10 bg-[#222226] p-4 text-left"
                >
                  <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3F1521] text-[#E4B5C2]">
                    <FileText size={21} />
                  </div>
                  <p className="text-sm font-bold">{card.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{card.text}</p>
                </button>
              ))}
            </div>

            {visibleAnonymousScripts.length > 0 && (
              <div className="space-y-2">
                {visibleAnonymousScripts.map(script => (
                  <button
                    key={script.id}
                    type="button"
                    onClick={() => setOpenScriptId(script.id)}
                    className="flex w-full items-center justify-between rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{script.title}</span>
                      <span className="text-xs text-zinc-500">Disponível por 24 horas</span>
                    </span>
                    <FileText size={17} className="text-[#E4B5C2]" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {!selectedCommunity && user && (
          <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#E4B5C2]">Link de convite</p>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1 truncate rounded-full bg-white/5 px-4 py-3 text-xs text-zinc-300">
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
          </section>
        )}

        {selectedCommunity && (
          <section className="min-h-screen bg-[#17171B]">
            {!selectedRoomId && (
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
                <div className="flex items-center gap-2">
                  {!isMember && (
                    <button type="button" onClick={handleJoin} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
                      Entrar
                    </button>
                  )}
                  {isOwner && (
                    <button type="button" onClick={openEditCommunity} className="rounded-full bg-white/10 p-3 text-white backdrop-blur-md">
                      <Edit3 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            )}

            <div className={selectedRoomId ? "flex h-[calc(100dvh-10.75rem)] flex-col overflow-hidden px-0 py-0 md:h-[calc(100dvh-9.5rem)]" : "space-y-5 px-4 py-5"}>
              {selectedRoomId ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {selectedRoomId === 'cine-live' && selectedCommunity.features.cineLive && (
                    <div className="shrink-0 border-b border-white/10 bg-black">
                      {embedUrl ? (
                        <div className="aspect-video bg-black">
                          <iframe src={embedUrl} title="Cine LIVE" className="h-full w-full" allowFullScreen />
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-[#222226] p-6 text-sm text-zinc-500">
                          O Diretor ainda não adicionou um link.
                        </div>
                      )}
                      {isOwner && (
                        <form onSubmit={handleSaveLiveUrl} className="space-y-2 p-3">
                          <div className="flex gap-2">
                            <input
                              value={liveUrlInput}
                              onChange={(event) => setLiveUrlInput(event.target.value)}
                              className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#222226] px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                              placeholder="Cole o link da transmissão"
                            />
                            <button
                              type="submit"
                              disabled={isSavingLiveUrl}
                              className="rounded-full bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-60"
                            >
                              Salvar
                            </button>
                          </div>
                          {liveUrlError && <p className="text-sm text-red-300">{liveUrlError}</p>}
                        </form>
                      )}
                    </div>
                  )}

                  <div className="flex min-h-0 flex-1 flex-col bg-[#17171B]">
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                      {selectedRoomMessages.length === 0 ? (
                        <p className="py-12 text-center text-sm text-zinc-500">Nenhuma mensagem ainda.</p>
                      ) : selectedRoomMessages.map(message => {
                        const messageUser = message.userId ? getUserById(message.userId) : undefined;
                        if (message.type === 'system') {
                          return (
                            <div key={message.id} className="text-center text-xs font-bold text-[#E4B5C2]">
                              {message.text}
                            </div>
                          );
                        }
                        const isMine = message.userId === user?.id;
                        return (
                          <div key={message.id} className={`flex items-start gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                            {messageUser?.avatarUrl ? (
                              <img src={messageUser.avatarUrl} alt={messageUser.name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3F1521] text-xs font-bold">
                                {messageUser?.name.charAt(0) || 'U'}
                              </div>
                            )}
                            <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${isMine ? 'bg-[#3F1521] text-white' : 'bg-white/8 text-zinc-100'}`}>
                              <p className="mb-1 text-[11px] font-bold text-[#E4B5C2]">{messageUser?.handle || '@usuario'}</p>
                              <p className="break-words text-sm leading-relaxed">{message.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <form onSubmit={handleSendRoomMessage} className="shrink-0 flex gap-2 border-t border-white/10 bg-[#222226] p-3">
                      <input
                        value={roomMessage}
                        onChange={(event) => setRoomMessage(event.target.value)}
                        className="min-w-0 flex-1 rounded-full bg-[#17171B] px-4 py-3 text-sm text-white outline-none"
                        placeholder="Escreva uma mensagem"
                      />
                      <button type="submit" className="rounded-full bg-white p-3 text-black">
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-zinc-300">{selectedCommunity.description}</p>

                  {selectedCommunity.features.cineLive && (
                    <button
                      type="button"
                      onClick={() => openRoom('cine-live')}
                      className="w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#222226] text-left"
                    >
                      <div className="relative h-32 bg-black">
                        {videoPreviewUrl && <img src={videoPreviewUrl} alt="Cine LIVE" className="h-full w-full object-cover opacity-55" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <span className="text-lg font-bold">Cine LIVE</span>
                          <ExternalLink size={18} />
                        </div>
                      </div>
                    </button>
                  )}

                  {selectedCommunity.features.groups && (
                    <div className="grid gap-3">
                      {selectedCommunity.groups.slice(0, 3).map(group => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => openRoom(group.id)}
                        className="flex items-center justify-between rounded-[24px] border border-white/10 bg-[#222226] px-4 py-5 text-left"
                      >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="h-14 w-14 overflow-hidden rounded-2xl bg-[#3F1521] text-[#E4B5C2]">
                              {group.coverUrl ? (
                                <img src={group.coverUrl} alt={group.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center">
                                  <MessageCircle size={19} />
                                </span>
                              )}
                            </span>
                            <span className="truncate text-base font-bold">{group.name}</span>
                          </span>
                          <ExternalLink size={17} className="text-zinc-500" />
                        </button>
                      ))}
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
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {scriptMode && (
        <div className="fixed inset-0 z-[132] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm md:items-center md:p-5">
          <motion.form
            onSubmit={handleSendAnonymousScript}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-white/10 bg-[#1F1F24] shadow-2xl md:rounded-[28px]"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="text-xl font-bold">{scriptMode === 'instant' ? 'Roteiro Instante' : 'Roteiro 24 horas'}</h2>
              <button type="button" onClick={resetScriptForm} className="rounded-full bg-white/5 p-2 text-zinc-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <input
                value={scriptTitle}
                onChange={(event) => setScriptTitle(event.target.value)}
                className="w-full rounded-full border border-white/10 bg-[#17171B] px-5 py-4 text-white outline-none focus:border-white/25"
                placeholder="Título"
              />
              <input
                value={scriptRecipient}
                onChange={(event) => setScriptRecipient(event.target.value)}
                className="w-full rounded-full border border-white/10 bg-[#17171B] px-5 py-4 text-white outline-none focus:border-white/25"
                placeholder="@ de quem vai receber"
              />
              <div className="rounded-[24px] bg-[#F3E8D5] p-5 text-[#17110B] shadow-inner">
                <p className="mb-4 text-center font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#5C4B3A]">
                  Roteiro anônimo
                </p>
                <p className="mb-3 font-mono text-sm font-bold uppercase">SALA. INT. NOITE</p>
                <textarea
                  value={scriptBody}
                  onChange={(event) => setScriptBody(event.target.value)}
                  className="min-h-44 w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-[#17110B] outline-none placeholder:text-[#8B7762]"
                  placeholder="Escreva a cena, a fala, o sentimento..."
                />
              </div>
            </div>

            <div className="border-t border-white/10 p-5">
              {scriptError && <p className="mb-3 text-sm text-red-300">{scriptError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={resetScriptForm} className="h-12 flex-1 rounded-full border border-white/10 font-bold text-white">
                  Excluir
                </button>
                <button type="submit" disabled={isSendingScript} className="h-12 flex-1 rounded-full bg-[#3F1521] font-bold text-white disabled:opacity-60">
                  {isSendingScript ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      )}

      {openScript && (
        <div className="fixed inset-0 z-[133] flex items-center justify-center bg-black/85 p-5 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-h-[88vh] w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-[#1F1F24] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 className="truncate text-lg font-bold">{openScript.title}</h2>
              <button type="button" onClick={() => setOpenScriptId('')} className="rounded-full bg-white/5 p-2 text-zinc-300">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[68vh] overflow-y-auto p-4">
              <div className="rounded-[24px] bg-[#F3E8D5] p-6 text-[#17110B]">
                <p className="mb-5 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#5C4B3A]">
                  Roteiro anônimo
                </p>
                <p className="mb-5 font-mono text-sm font-bold uppercase">{openScript.sceneHeading}</p>
                <p className="whitespace-pre-wrap font-mono text-sm leading-7">{openScript.body}</p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-white/10 p-4">
              <button
                type="button"
                onClick={async () => {
                  await deleteAnonymousScript(openScript.id);
                  setOpenScriptId('');
                }}
                className="h-11 flex-1 rounded-full border border-red-500/30 text-sm font-bold text-red-300"
              >
                Excluir
              </button>
              <button type="button" onClick={() => setOpenScriptId('')} className="h-11 flex-1 rounded-full bg-white text-sm font-bold text-black">
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {(isCreating || isEditingCommunity) && (
        <div className="fixed inset-0 z-[132] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm md:items-center md:p-5">
          <motion.form
            onSubmit={isEditingCommunity ? handleUpdateCommunity : handleCreateCommunity}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-white/10 bg-[#1F1F24] shadow-2xl md:rounded-[28px]"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-xl font-bold">{isEditingCommunity ? 'Editar comunidade' : 'Criar comunidade'}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditingCommunity(false);
                }}
                className="rounded-full bg-white/5 p-2 text-zinc-300"
              >
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
                    <div key={index} className="flex gap-2">
                      <label className="h-12 w-14 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#17171B]">
                        {groupCoverPreviews[index] ? (
                          <img src={groupCoverPreviews[index]} alt={`Capa do grupo ${index + 1}`} className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-zinc-500">
                            <Camera size={16} />
                          </span>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => handleGroupCoverChange(index, event.target.files?.[0])} />
                      </label>
                      <input
                        value={groupName}
                        onChange={(event) => setGroupNames(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                        className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#17171B] px-5 py-3 text-sm text-white outline-none focus:border-white/25"
                        placeholder={`Grupo ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-5">
              {isEditingCommunity && selectedCommunity?.ownerId === user?.id && (
                <button
                  type="button"
                  disabled={isSavingCommunity}
                  onClick={handleDeleteCommunity}
                  className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-red-500/30 text-sm font-bold text-red-300 disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  Excluir comunidade
                </button>
              )}
              {deleteError && <p className="mb-3 text-sm text-red-300">{deleteError}</p>}
              {createError && <p className="mb-3 text-sm text-red-300">{createError}</p>}
              <button
                type="submit"
                disabled={isSavingCommunity}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3F1521] font-bold text-white disabled:opacity-60"
              >
                <Send size={17} />
                {isSavingCommunity ? 'Salvando...' : isEditingCommunity ? 'Salvar comunidade' : 'Criar comunidade'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
