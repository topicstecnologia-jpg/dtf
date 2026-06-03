import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOVIES } from '../data/mock';
import {
  ArrowLeft,
  Send,
  Mic,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video as VideoIcon,
  Paperclip,
  X,
  Download,
  Square,
  SmilePlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SharedPostPayload = {
  kind: 'post_share';
  postId: string;
  authorName?: string;
  authorHandle?: string;
  caption?: string;
  type?: string;
  thumbnailUrl?: string;
};

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];

export const ChatPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, chats, sendMessage, sendMediaMessage, toggleMessageReaction, matches, posts, getUserById, markChatRead, isUserOnline } = useApp();
  const [inputText, setInputText] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const match = matches.find(m => m.id === matchId);
  const otherUserId = match?.userIds.find(id => id !== user?.id);
  const otherUser = getUserById(otherUserId);
  const chat = chats.find(c => c.matchId === matchId);
  const messages = chat?.messages || [];
  const otherUserOnline = isUserOnline(otherUserId);

  const getReactionGroups = (reactions: { userId: string; emoji: string }[]) => (
    Object.entries(reactions.reduce<Record<string, string[]>>((groups, reaction) => {
      groups[reaction.emoji] = [...(groups[reaction.emoji] || []), reaction.userId];
      return groups;
    }, {}))
  );

  const handleReaction = async (messageId: string, emoji: string) => {
    await toggleMessageReaction(messageId, emoji);
    setReactionMessageId(null);
  };

  const getSharedPostFromText = (text?: string): SharedPostPayload | null => {
    if (!text) return null;

    try {
      const payload = JSON.parse(text) as Partial<SharedPostPayload>;
      if (payload.kind === 'post_share' && payload.postId) {
        return {
          kind: 'post_share',
          postId: payload.postId,
          authorName: payload.authorName,
          authorHandle: payload.authorHandle,
          caption: payload.caption,
          type: payload.type,
          thumbnailUrl: payload.thumbnailUrl
        };
      }
    } catch {
      // Older shared posts were sent as plain links. The regex below upgrades them visually.
    }

    const linkMatch = text.match(/\/post\/([a-zA-Z0-9-]+)/);
    if (!linkMatch?.[1]) return null;

    const post = posts.find(item => item.id === linkMatch[1]);
    const author = post ? getUserById(post.userId) : null;
    const movie = post?.movieId ? MOVIES.find(item => item.id === post.movieId) : null;

    return {
      kind: 'post_share',
      postId: linkMatch[1],
      authorName: author?.name || 'Publicacao',
      authorHandle: author?.handle || '',
      caption: post?.caption || 'Toque para ver o post',
      type: post?.type,
      thumbnailUrl: post?.thumbnailUrl || movie?.posterUrl || ''
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (matchId) markChatRead(matchId);
  }, [messages.length]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim() && matchId) {
      await sendMessage(matchId, inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !matchId) return;

    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio';
    setIsSendingMedia(true);

    try {
      await sendMediaMessage(matchId, file, type as 'image' | 'video' | 'audio');
    } finally {
      setIsSendingMedia(false);
      event.target.value = '';
    }
  };

  const startRecording = async () => {
    if (!matchId) return;
    setRecordingError('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError('Gravacao de audio nao esta disponivel neste navegador.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioBlob.size === 0 || !matchId) return;

        setIsSendingMedia(true);
        try {
          await sendMediaMessage(matchId, audioBlob, 'audio');
        } catch (error) {
          setRecordingError(error instanceof Error ? error.message : 'Nao foi possivel enviar o audio.');
        } finally {
          setIsSendingMedia(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setRecordingError(error instanceof Error ? error.message : 'Permita o acesso ao microfone para gravar audio.');
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  };

  if (!match || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-[#17171B] text-white">
        <p className="text-gray-400">Conversa nao encontrada.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-white underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-[#17171B] text-white overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#17171B]/95 backdrop-blur-xl px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 -ml-1 rounded-full hover:bg-white/5 text-white shrink-0">
            <ArrowLeft size={23} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/profile/${otherUser.handle}`)}
            className="relative shrink-0"
          >
            <img
              src={otherUser.avatarUrl}
              alt={otherUser.name}
              className="w-11 h-11 rounded-full object-cover border border-white/10"
            />
            {otherUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#17171B]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/profile/${otherUser.handle}`)}
            className="text-left min-w-0"
          >
            <h2 className="font-bold text-white text-base leading-tight truncate">{otherUser.name}</h2>
            <p className="text-xs text-gray-400 font-medium truncate">{otherUserOnline ? 'online' : otherUser.handle}</p>
          </button>
        </div>
        <div className="flex items-center space-x-3 text-gray-400 shrink-0">
          <button className="hover:text-white transition-colors">
            <Phone size={21} strokeWidth={1.5} />
          </button>
          <button className="hover:text-white transition-colors">
            <VideoIcon size={21} strokeWidth={1.5} />
          </button>
          <button className="hover:text-white transition-colors">
            <MoreVertical size={21} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="h-full overflow-y-auto px-4 pt-24 pb-28 space-y-7 bg-[#17171B] scrollbar-hide overscroll-none">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const sharedPost = getSharedPostFromText(msg.text);
          const reactionGroups = getReactionGroups(msg.reactions || []);
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                  isMe
                    ? 'bg-[#3F1521] text-white rounded-br-none'
                    : 'bg-[#2A2A30] text-gray-200 rounded-bl-none'
                }`}
                onDoubleClick={() => setReactionMessageId(msg.id)}
                style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
              >
                <button
                  type="button"
                  onClick={() => setReactionMessageId(prev => prev === msg.id ? null : msg.id)}
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-1.5 text-white/70 opacity-0 transition-opacity hover:text-white group-hover:opacity-100 ${
                    isMe ? '-left-10' : '-right-10'
                  }`}
                  aria-label="Reagir a mensagem"
                >
                  <SmilePlus size={16} />
                </button>

                {reactionMessageId === msg.id && (
                  <div
                    className={`absolute -top-12 z-30 flex items-center gap-1 rounded-full border border-white/10 bg-[#101014] px-2 py-1.5 shadow-2xl ${
                      isMe ? 'right-0' : 'left-0'
                    }`}
                  >
                    {REACTION_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleReaction(msg.id, emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-white/10"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {msg.mediaUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                    {msg.mediaType === 'image' && (
                      <img
                        src={msg.mediaUrl}
                        alt="Sent image"
                        className="w-full h-auto max-h-60 object-cover cursor-pointer"
                        onClick={() => setSelectedImageUrl(msg.mediaUrl!)}
                      />
                    )}
                    {msg.mediaType === 'video' && (
                      <video src={msg.mediaUrl} controls className="w-full h-auto max-h-60" />
                    )}
                    {msg.mediaType === 'audio' && (
                      <audio src={msg.mediaUrl} controls className="w-full min-w-[220px] max-w-full" />
                    )}
                  </div>
                )}
                {sharedPost ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/post/${sharedPost.postId}`)}
                    className="block w-full overflow-hidden rounded-2xl border border-white/10 bg-[#101014] text-left hover:border-white/25 transition-colors"
                  >
                    {sharedPost.thumbnailUrl ? (
                      <img
                        src={sharedPost.thumbnailUrl}
                        alt="Post compartilhado"
                        className="w-full max-h-64 object-cover bg-black"
                      />
                    ) : (
                      <div className="min-h-28 p-4 flex items-center justify-center bg-[#222226]">
                        <p
                          className="text-base font-bold text-white text-center leading-snug"
                          style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                        >
                          {sharedPost.caption || 'Post compartilhado'}
                        </p>
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="font-bold text-white truncate">
                          {sharedPost.authorHandle || sharedPost.authorName || 'Publicacao'}
                        </span>
                        <span>post</span>
                      </div>
                      {sharedPost.caption && sharedPost.thumbnailUrl && (
                        <p
                          className="mt-1 line-clamp-2 text-sm leading-snug text-zinc-200"
                          style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                        >
                          {sharedPost.caption}
                        </p>
                      )}
                    </div>
                  </button>
                ) : (
                  msg.text && (
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                    >
                      {msg.text}
                    </p>
                  )
                )}
                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/50' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {reactionGroups.length > 0 && (
                  <div className={`absolute -bottom-5 flex gap-1 ${isMe ? 'right-2' : 'left-2'}`}>
                    {reactionGroups.map(([emoji, userIds]) => {
                      const reactedByMe = userIds.includes(user?.id || '');
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={`rounded-full border px-1.5 py-0.5 text-xs shadow-sm ${
                            reactedByMe
                              ? 'border-white/40 bg-white text-black'
                              : 'border-white/10 bg-[#101014] text-white'
                          }`}
                        >
                          {emoji}{userIds.length > 1 ? ` ${userIds.length}` : ''}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#17171B]/95 backdrop-blur-xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-white/5">
        {(recordingError || isRecording || isSendingMedia) && (
          <div className="px-4 pb-2 text-xs">
            {recordingError && <p className="text-red-300">{recordingError}</p>}
            {isRecording && <p className="text-red-300 animate-pulse">Gravando audio... toque no quadrado para enviar.</p>}
            {isSendingMedia && <p className="text-gray-400">Enviando midia...</p>}
          </div>
        )}
        <div className="flex items-center space-x-2 bg-[#2A2A30] rounded-full px-4 py-2 border border-white/5">
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSendingMedia}
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
          />

          <input
            type="text"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder-gray-500 text-white outline-none min-w-0"
            disabled={isRecording}
          />

          {inputText ? (
            <button
              onClick={handleSend}
              className="p-2 bg-[#3F1521] rounded-full text-white hover:bg-[#5B343C] transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white transition-colors" disabled={isSendingMedia}>
                <ImageIcon size={20} onClick={() => fileInputRef.current?.click()} />
              </button>
              <button
                className={`transition-colors ${isRecording ? 'text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                onClick={toggleRecording}
                disabled={isSendingMedia}
              >
                {isRecording ? <Square size={19} fill="currentColor" /> : <Mic size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10">
              <button
                onClick={() => setSelectedImageUrl(null)}
                className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setSelectedImageUrl(null)}
                  className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full h-full flex items-center justify-center p-4"
              onClick={() => setSelectedImageUrl(null)}
            >
              <img
                src={selectedImageUrl}
                alt="Full screen view"
                className="max-w-full max-h-full object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
