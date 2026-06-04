import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MessageCircle, Search, X } from 'lucide-react';

const formatTime = (timestamp?: number) => (
  timestamp
    ? new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : ''
);

export const MatchesPage: React.FC = () => {
  const {
    matches,
    chats,
    user,
    getUserById,
    getUnreadMessagesForMatch,
    getChatReadAt,
    isUserOnline,
    markChatRead
  } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const conversationItems = useMemo(() => (
    matches
      .map(match => {
        const otherUserId = match.userIds.find(id => id !== user?.id);
        const otherUser = getUserById(otherUserId);
        const chat = chats.find(item => item.matchId === match.id);
        const lastMessage = chat?.messages[chat.messages.length - 1];
        const lastActivity = lastMessage?.timestamp || match.timestamp;
        return { match, otherUserId, otherUser, chat, lastMessage, lastActivity };
      })
      .filter(item => item.otherUser)
      .filter(item => {
        const query = searchTerm.trim().toLowerCase().replace(/^@/, '');
        if (!query) return true;
        const name = item.otherUser?.name.toLowerCase() || '';
        const handle = item.otherUser?.handle.toLowerCase().replace(/^@/, '') || '';
        return name.includes(query) || handle.includes(query);
      })
      .sort((a, b) => b.lastActivity - a.lastActivity)
  ), [matches, chats, profileKey(user?.id, searchTerm)]);

  const openChat = (matchId: string) => {
    markChatRead(matchId);
    navigate(`/chat/${matchId}`);
  };

  return (
    <div className="min-h-screen bg-[#17171B] px-4 pb-28 pt-4 text-white">
      <div className="sticky top-0 z-30 -mx-4 border-b border-white/5 bg-[#17171B]/95 px-4 pb-4 pt-2 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-white">Conversas</h1>
          <div className="rounded-full bg-[#222226] p-3 text-zinc-300">
            <MessageCircle size={21} />
          </div>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-12 w-full rounded-full border border-white/10 bg-[#222226] pl-11 pr-11 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/25"
            placeholder="Pesquisar conversas"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/5 p-1.5 text-zinc-400"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {conversationItems.length > 0 && (
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {conversationItems.map(({ match, otherUser, otherUserId }) => {
            const isOnline = isUserOnline(otherUserId);
            if (!otherUser) return null;

            return (
              <button
                key={match.id}
                type="button"
                className="flex min-w-[74px] flex-col items-center gap-2"
                onClick={() => openChat(match.id)}
              >
                <div className="relative">
                  {otherUser.avatarUrl ? (
                    <img src={otherUser.avatarUrl} alt={otherUser.name} className="h-16 w-16 rounded-full border border-white/10 object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#3F1521] text-lg font-bold text-white">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOnline && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#17171B] bg-green-500" />}
                </div>
                <span className="w-20 truncate text-center text-xs font-medium text-zinc-300">{otherUser.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {conversationItems.length === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center rounded-[26px] border border-white/10 bg-[#222226] p-6 text-center">
            <MessageCircle size={32} className="mb-3 text-zinc-500" />
            <p className="text-sm text-zinc-400">{searchTerm ? 'Nenhuma conversa encontrada.' : 'Nenhuma conversa ainda.'}</p>
          </div>
        ) : conversationItems.map(({ match, otherUser, otherUserId, lastMessage }) => {
          if (!otherUser) return null;
          const isOnline = isUserOnline(otherUserId);
          const unreadCount = getUnreadMessagesForMatch(match.id);
          const readAt = getChatReadAt(match.id, otherUserId);
          const lastMessageText = lastMessage?.text || (
            lastMessage?.mediaType === 'audio'
              ? 'Áudio'
              : lastMessage?.mediaType
                ? 'Mídia'
                : 'Vocês deram match! Diga oi.'
          );
          const statusText = isOnline
            ? 'online'
            : otherUser.lastSeenAt
              ? `visto por último às ${formatTime(otherUser.lastSeenAt)}`
              : 'offline';
          const readText = lastMessage && lastMessage.senderId === user?.id && readAt >= lastMessage.timestamp
            ? `lida às ${formatTime(readAt)}`
            : statusText;

          return (
            <button
              key={match.id}
              type="button"
              className="flex w-full items-center gap-3 rounded-[24px] border border-white/10 bg-[#222226] p-4 text-left transition-colors hover:bg-[#2A2A30]"
              onClick={() => openChat(match.id)}
            >
              <div className="relative shrink-0">
                {otherUser.avatarUrl ? (
                  <img src={otherUser.avatarUrl} alt={otherUser.name} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3F1521] font-bold text-white">
                    {otherUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isOnline && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#222226] bg-green-500" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-white">{otherUser.name}</h3>
                    <p className="truncate text-xs text-[#E4B5C2]">{readText}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">{formatTime(lastMessage?.timestamp)}</span>
                </div>
                <p className={`truncate text-sm ${unreadCount > 0 ? 'font-semibold text-white' : 'text-zinc-400'}`}>
                  {lastMessageText}
                </p>
              </div>

              {unreadCount > 0 && (
                <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const profileKey = (userId?: string, searchTerm = '') => `${userId || ''}:${searchTerm}`;
