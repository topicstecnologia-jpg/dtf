import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, Movie, Match, EmotionalProfileType, Chat, Message, Post, Comment, Story, Community, CommunityPost } from '../types';
import { MOVIES } from '../data/mock';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { createDefaultProfile, mapProfileRowToUser, mapUserToProfileRow, normalizeHandle } from '../lib/profile';

interface AppContextType {
  user: User | null;
  profileUsers: User[];
  movies: Movie[];
  matches: Match[];
  chats: Chat[];
  posts: Post[];
  stories: Story[];
  communities: Community[];
  onlineUserIds: string[];
  unreadMessageCount: number;
  referralCount: number;
  directorCelebrationOpen: boolean;
  currentMovieIndex: number;
  isLoading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, handle?: string, referredBy?: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateHandle: (handle: string) => Promise<void>;
  updateProfile: (values: { name: string; handle: string; bio?: string; avatarFile?: File | null }) => Promise<void>;
  updateFavoriteMovies: (movieIds: string[]) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  dismissDirectorCelebration: () => Promise<void>;
  createCommunity: (values: {
    name: string;
    description: string;
    coverFile?: File | null;
    avatarFile?: File | null;
    features: Community['features'];
    groups: string[];
  }) => Promise<void>;
  joinCommunity: (communityId: string) => Promise<void>;
  createCommunityPost: (communityId: string, values: { text: string; imageFile?: File | null }) => Promise<void>;
  updateCommunityLiveUrl: (communityId: string, liveUrl: string) => Promise<void>;
  toggleFollowUser: (targetUserId: string) => Promise<void>;
  createPost: (values: { caption: string; imageFile?: File | null }) => Promise<void>;
  updatePost: (postId: string, values: { caption: string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  repostPost: (postId: string) => Promise<void>;
  createStory: (values: { text?: string; imageFile?: File | null }) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  addStoryComment: (storyId: string, text: string) => Promise<void>;
  toggleLikeStory: (storyId: string) => Promise<void>;
  recordStoryView: (storyId: string) => Promise<void>;
  recordPostView: (postId: string) => Promise<void>;
  getUserById: (userId?: string) => User | undefined;
  completeOnboarding: (answers: Record<string, string>) => Promise<void>;
  swipeMovie: (movieId: string, direction: 'left' | 'right') => Promise<void>;
  getRecommendedMovies: (mood: string) => Movie[];
  sendMessage: (matchId: string, text?: string, media?: { url: string, type: 'image' | 'video' | 'audio' }) => Promise<void>;
  sendMediaMessage: (matchId: string, file: File | Blob, type: 'image' | 'video' | 'audio') => Promise<void>;
  toggleMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  startChat: (targetUserId: string) => Promise<string>;
  addComment: (postId: string, text: string) => Promise<void>;
  toggleSavePost: (postId: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  markChatRead: (matchId: string) => void;
  getUnreadMessagesForMatch: (matchId: string) => number;
  isUserOnline: (userId?: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileUsers, setProfileUsers] = useState<User[]>([]);
  const [movies] = useState<Movie[]>(MOVIES);
  const [matches, setMatches] = useState<Match[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [directorCelebrationOpen, setDirectorCelebrationOpen] = useState(false);
  const [readMessagesByMatch, setReadMessagesByMatch] = useState<Record<string, number>>({});
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const getUserById = (userId?: string) => {
    if (!userId) return undefined;
    if (user?.id === userId) return user;
    return profileUsers.find(profile => profile.id === userId);
  };

  const getReadMessagesStorageKey = (userId: string) => `dtf:read-messages:${userId}`;

  const isUserOnline = (userId?: string) => Boolean(userId && onlineUserIds.includes(userId));

  const isDirectorTestHandle = (handle?: string) => {
    const normalized = (handle || '').replace(/^@/, '').toLowerCase();
    return normalized === 'omayconfreitas' || normalized === 'omaycondefreitas';
  };

  const markChatRead = (matchId: string) => {
    if (!user) return;
    const chat = chats.find(item => item.matchId === matchId);
    const lastMessageAt = chat?.messages[chat.messages.length - 1]?.timestamp || Date.now();

    setReadMessagesByMatch(prev => {
      const next = { ...prev, [matchId]: Math.max(prev[matchId] || 0, lastMessageAt) };
      localStorage.setItem(getReadMessagesStorageKey(user.id), JSON.stringify(next));
      return next;
    });
  };

  const unreadMessageCount = useMemo(() => {
    if (!user) return 0;
    return chats.reduce((count, chat) => {
      const lastReadAt = readMessagesByMatch[chat.matchId] || 0;
      return count + chat.messages.filter(message => (
        message.senderId !== user.id && message.timestamp > lastReadAt
      )).length;
    }, 0);
  }, [chats, readMessagesByMatch, user?.id]);

  const getUnreadMessagesForMatch = (matchId: string) => {
    if (!user) return 0;
    const chat = chats.find(item => item.matchId === matchId);
    const lastReadAt = readMessagesByMatch[matchId] || 0;
    return chat?.messages.filter(message => (
      message.senderId !== user.id && message.timestamp > lastReadAt
    )).length || 0;
  };

  const referralCount = useMemo(() => {
    if (!user) return 0;
    if (isDirectorTestHandle(user.handle)) return 5;
    const joinedUntil = (user.createdAt || Date.now()) + 1000 * 60 * 60 * 24 * 7;
    return profileUsers.filter(profile => (
      profile.referredBy === user.id &&
      (profile.createdAt || 0) <= joinedUntil
    )).length;
  }, [profileUsers, user?.id, user?.createdAt]);

  const cineClubCommunity: Community = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'CineClub',
    description: 'A comunidade principal do DTF para assistir, comentar e descobrir cinema junto.',
    coverUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://i.postimg.cc/GpHmXR5D/Design-sem-nome.png',
    features: {
      cineLive: true,
      groups: true,
      posts: true,
      cineLiveUrl: 'https://www.youtube.com/'
    },
    groups: [
      { id: 'cineclub-geral', name: 'Geral' },
      { id: 'cineclub-romance', name: 'Romances' },
      { id: 'cineclub-sessao', name: 'Sessão ao vivo' }
    ],
    memberIds: user ? [user.id] : [],
    posts: [],
    createdAt: Date.now()
  };

  const attachPostToProfile = (post: Post) => {
    const attach = (profile: User) => {
      const profilePosts = profile.posts || [];
      const alreadyAttached = profilePosts.some(item => item.id === post.id);
      const nextPosts = alreadyAttached ? profilePosts : [post, ...profilePosts];

      return {
        ...profile,
        posts: nextPosts,
        stats: {
          ...profile.stats,
          creations: Math.max(profile.stats.creations || 0, nextPosts.length)
        }
      };
    };

    setProfileUsers(prev => prev.map(profile => profile.id === post.userId ? attach(profile) : profile));
    setUser(prev => prev?.id === post.userId ? attach(prev) : prev);
  };

  const persistProfile = async (profile: User) => {
    if (!supabase) return;
    await supabase.from('profiles').upsert(mapUserToProfileRow(profile), { onConflict: 'id' });
  };

  const loadProfiles = async () => {
    if (!supabase) return [];
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const profiles = (data || []).map(mapProfileRowToUser);
    setProfileUsers(profiles);
    return profiles;
  };

  const loadMatches = async (currentUserId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('matches')
      .select('*')
      .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
      .order('created_at', { ascending: true });

    setMatches((data || []).map(row => ({
      id: row.id,
      userIds: [row.user_a, row.user_b],
      compatibility: row.compatibility || { overall: 80, emotional: 75 },
      commonMovies: row.common_movies || [],
      timestamp: new Date(row.created_at).getTime()
    })));
  };

  const loadMessages = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('messages').select('*, message_reactions(user_id, emoji)').order('created_at', { ascending: true });
    const grouped = new Map<string, Message[]>();

    (data || []).forEach(row => {
      const messagesForMatch = grouped.get(row.match_id) || [];
      messagesForMatch.push({
        id: row.id,
        senderId: row.sender_id,
        text: row.text || undefined,
        mediaUrl: row.media_url || undefined,
        mediaType: row.media_type || undefined,
        reactions: (row.message_reactions || []).map((reaction: any) => ({
          userId: reaction.user_id,
          emoji: reaction.emoji
        })),
        timestamp: new Date(row.created_at).getTime()
      });
      grouped.set(row.match_id, messagesForMatch);
    });

    setChats(Array.from(grouped.entries()).map(([matchId, messages]) => ({
      id: `chat-${matchId}`,
      matchId,
      messages
    })));
  };

  const mapPostRow = (row: any): Post => ({
    id: row.id,
    userId: row.user_id,
    repostOfId: row.repost_of || undefined,
    movieId: row.movie_id || undefined,
    type: row.type,
    thumbnailUrl: row.thumbnail_url || undefined,
    caption: row.caption || '',
    likes: row.post_likes?.length || 0,
    likedBy: (row.post_likes || []).map((like: any) => like.user_id),
    views: row.views || 0,
    viewedByCurrentUser: Boolean(row.viewed_by_current_user),
    comments: (row.comments || []).map((comment: any) => ({
      id: comment.id,
      userId: comment.user_id,
      userName: comment.user_name,
      userAvatar: comment.user_avatar,
      text: comment.text,
      timestamp: new Date(comment.created_at).getTime()
    })),
    timestamp: new Date(row.created_at).getTime()
  });

  const mapStoryRow = (row: any): Story => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    mediaUrl: row.media_url || undefined,
    text: row.text || undefined,
    likes: row.story_likes?.length || 0,
    likedBy: (row.story_likes || []).map((like: any) => like.user_id),
    comments: (row.story_comments || []).map((comment: any) => ({
      id: comment.id,
      userId: comment.user_id,
      userName: comment.user_name,
      userAvatar: comment.user_avatar,
      text: comment.text,
      timestamp: new Date(comment.created_at).getTime()
    })),
    views: row.story_views?.length || 0,
    viewedBy: (row.story_views || []).map((view: any) => view.user_id),
    viewedByCurrentUser: Boolean(user?.id && (row.story_views || []).some((view: any) => view.user_id === user.id)),
    timestamp: new Date(row.created_at).getTime(),
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : undefined
  });

  const mapCommunityPostRow = (row: any): CommunityPost => ({
    id: row.id,
    communityId: row.community_id,
    userId: row.user_id,
    type: row.type,
    imageUrl: row.image_url || undefined,
    text: row.text || '',
    timestamp: new Date(row.created_at).getTime()
  });

  const mapCommunityRow = (row: any): Community => ({
    id: row.id,
    ownerId: row.owner_id || undefined,
    name: row.name,
    description: row.description || '',
    coverUrl: row.cover_url || undefined,
    avatarUrl: row.avatar_url || undefined,
    features: {
      cineLive: Boolean(row.features?.cineLive),
      groups: Boolean(row.features?.groups),
      posts: row.features?.posts !== false,
      cineLiveUrl: row.features?.cineLiveUrl || ''
    },
    groups: row.groups || [],
    memberIds: (row.community_members || []).map((member: any) => member.user_id),
    posts: (row.community_posts || []).map(mapCommunityPostRow),
    createdAt: new Date(row.created_at).getTime()
  });

  const hydratePostViews = async (mappedPosts: Post[]) => {
    if (!supabase || mappedPosts.length === 0) return mappedPosts;

    const postIds = mappedPosts.map(post => post.id);
    const { data, error } = await supabase
      .from('post_views')
      .select('post_id, user_id')
      .in('post_id', postIds);

    if (error) return mappedPosts;

    const viewsByPost = new Map<string, string[]>();
    (data || []).forEach(view => {
      const viewers = viewsByPost.get(view.post_id) || [];
      viewers.push(view.user_id);
      viewsByPost.set(view.post_id, viewers);
    });

    return mappedPosts.map(post => {
      const viewers = viewsByPost.get(post.id) || [];
      return {
        ...post,
        views: viewers.length,
        viewedByCurrentUser: Boolean(user?.id && viewers.includes(user.id))
      };
    });
  };

  const loadPosts = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('posts')
      .select('*, comments(*), post_likes(user_id)')
      .order('created_at', { ascending: false });

    const mappedPosts = await hydratePostViews((data || []).map(mapPostRow));

    setPosts(mappedPosts);
    setProfileUsers(prev => prev.map(profile => ({
      ...profile,
      posts: mappedPosts.filter(post => post.userId === profile.id),
      stats: {
        ...profile.stats,
        creations: Math.max(profile.stats.creations || 0, mappedPosts.filter(post => post.userId === profile.id).length)
      }
    })));
    setUser(prev => {
      if (!prev) return prev;
      const userPosts = mappedPosts.filter(post => post.userId === prev.id);
      return {
        ...prev,
        posts: userPosts,
        stats: {
          ...prev.stats,
          creations: Math.max(prev.stats.creations || 0, userPosts.length)
        }
      };
    });
  };

  const loadStories = async () => {
    if (!supabase) return;
    const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    const { data, error } = await supabase
      .from('stories')
      .select('*, story_likes(user_id), story_comments(*), story_views(user_id)')
      .gt('expires_at', new Date().toISOString())
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false });

    if (error) {
      setStories([]);
      return;
    }

    setStories((data || []).map(mapStoryRow));
  };

  const loadCommunities = async () => {
    if (!supabase) {
      setCommunities([cineClubCommunity]);
      return;
    }

    const { data, error } = await supabase
      .from('communities')
      .select('*, community_members(user_id), community_posts(*)')
      .order('created_at', { ascending: false });

    if (error) {
      setCommunities([cineClubCommunity]);
      return;
    }

    const mapped = (data || []).map(mapCommunityRow);
    const hasCineClub = mapped.some(community => community.id === cineClubCommunity.id);
    setCommunities(hasCineClub ? mapped : [cineClubCommunity, ...mapped]);
  };

  const refreshAppData = async (currentUserId: string) => {
    await Promise.all([loadProfiles(), loadMatches(currentUserId), loadMessages(), loadPosts(), loadStories(), loadCommunities()]);
  };

  const syncSession = async () => {
    if (!supabase) {
      setAuthError('Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para ativar usuários reais.');
      setIsLoading(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;

    if (!sessionUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let profiles = await loadProfiles();
    let currentProfile = profiles.find(profile => profile.id === sessionUser.id);

    if (!currentProfile) {
      currentProfile = createDefaultProfile(
        sessionUser.id,
        sessionUser.email,
        sessionUser.user_metadata?.name
      );
      await persistProfile(currentProfile);
      profiles = await loadProfiles();
    }

    const referralWindowEndsAt = (currentProfile.createdAt || Date.now()) + 1000 * 60 * 60 * 24 * 7;
    const validReferralCount = profiles.filter(profile => (
      profile.referredBy === currentProfile?.id &&
      (profile.createdAt || 0) <= referralWindowEndsAt
    )).length;
    const shouldBecomeDirector = validReferralCount >= 5 || isDirectorTestHandle(currentProfile.handle);

    if (shouldBecomeDirector && !currentProfile.directorEligible) {
      currentProfile = { ...currentProfile, directorEligible: true };
      await supabase
        .from('profiles')
        .update({ director_eligible: true })
        .eq('id', currentProfile.id);
      profiles = profiles.map(profile => profile.id === currentProfile?.id ? currentProfile! : profile);
    }

    if (currentProfile.directorEligible && !currentProfile.directorCelebrationSeen) {
      setDirectorCelebrationOpen(true);
    }

    setUser(currentProfile);
    setProfileUsers(profiles);
    await refreshAppData(sessionUser.id);
    setIsLoading(false);
  };

  useEffect(() => {
    syncSession();

    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => {
      syncSession();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setReadMessagesByMatch({});
      setOnlineUserIds([]);
      return;
    }

    try {
      const stored = localStorage.getItem(getReadMessagesStorageKey(user.id));
      setReadMessagesByMatch(stored ? JSON.parse(stored) : {});
    } catch {
      setReadMessagesByMatch({});
    }
  }, [user?.id]);

  useEffect(() => {
    if (!supabase || !user) return;

    const realtimeClient = supabase;
    const presenceChannel = realtimeClient.channel('online-users', {
      config: { presence: { key: user.id } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        setOnlineUserIds(Object.keys(presenceState));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      realtimeClient.removeChannel(presenceChannel);
    };
  }, [user?.id]);

  const appendMessageToChat = (matchId: string, message: Message) => {
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(chat => chat.matchId === matchId);

      if (chatIndex >= 0) {
        const existingChat = prevChats[chatIndex];
        if (existingChat.messages.some(item => item.id === message.id)) return prevChats;

        const updatedChats = [...prevChats];
        updatedChats[chatIndex] = {
          ...existingChat,
          messages: [...existingChat.messages, message]
        };
        return updatedChats;
      }

      return [...prevChats, { id: `chat-${matchId}`, matchId, messages: [message] }];
    });
  };

  const patchMessageReaction = (messageId: string, userId: string, emoji?: string) => {
    setChats(prevChats => prevChats.map(chat => ({
      ...chat,
      messages: chat.messages.map(message => {
        if (message.id !== messageId) return message;
        const otherReactions = message.reactions.filter(reaction => reaction.userId !== userId);
        return {
          ...message,
          reactions: emoji ? [...otherReactions, { userId, emoji }] : otherReactions
        };
      })
    })));
  };

  const appendPost = (post: Post) => {
    setPosts(prevPosts => (
      prevPosts.some(item => item.id === post.id) ? prevPosts : [post, ...prevPosts]
    ));
    attachPostToProfile(post);
  };

  const appendCommentToPost = (postId: string, comment: Comment) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id !== postId || post.comments.some(item => item.id === comment.id)) return post;
      return { ...post, comments: [...post.comments, comment] };
    }));
  };

  const applyLikeToPost = (postId: string, userId: string, liked: boolean) => {
    const patchList = (items?: Post[]) => items?.map(post => {
      if (post.id !== postId) return post;
      const likedBy = liked
        ? Array.from(new Set([...post.likedBy, userId]))
        : post.likedBy.filter(id => id !== userId);
      return { ...post, likedBy, likes: likedBy.length };
    });

    setPosts(prevPosts => patchList(prevPosts) || prevPosts);
    setProfileUsers(prevProfiles => prevProfiles.map(profile => ({
      ...profile,
      posts: patchList(profile.posts)
    })));
    setUser(prevUser => prevUser ? { ...prevUser, posts: patchList(prevUser.posts) } : prevUser);
  };

  const appendStory = (story: Story) => {
    setStories(prevStories => {
      if (prevStories.some(item => item.id === story.id)) return prevStories;
      return [story, ...prevStories];
    });
  };

  const removeStory = (storyId: string) => {
    setStories(prevStories => prevStories.filter(story => story.id !== storyId));
  };

  const appendCommentToStory = (storyId: string, comment: Comment) => {
    setStories(prevStories => prevStories.map(story => {
      if (story.id !== storyId || story.comments.some(item => item.id === comment.id)) return story;
      return { ...story, comments: [...story.comments, comment] };
    }));
  };

  const applyLikeToStory = (storyId: string, userId: string, liked: boolean) => {
    setStories(prevStories => prevStories.map(story => {
      if (story.id !== storyId) return story;
      const likedBy = liked
        ? Array.from(new Set([...story.likedBy, userId]))
        : story.likedBy.filter(id => id !== userId);
      return { ...story, likedBy, likes: likedBy.length };
    }));
  };

  const applyViewToStory = (storyId: string, userId: string) => {
    setStories(prevStories => prevStories.map(story => {
      if (story.id !== storyId || story.viewedBy.includes(userId)) return story;
      const viewedBy = [...story.viewedBy, userId];
      return {
        ...story,
        viewedBy,
        views: viewedBy.length,
        viewedByCurrentUser: user?.id === userId ? true : story.viewedByCurrentUser
      };
    }));
  };

  const updatePostEverywhere = (updatedPost: Post) => {
    const updateList = (items?: Post[]) => items?.map(post => post.id === updatedPost.id ? { ...post, ...updatedPost } : post);

    setPosts(prevPosts => prevPosts.map(post => post.id === updatedPost.id ? { ...post, ...updatedPost } : post));
    setProfileUsers(prevProfiles => prevProfiles.map(profile => ({
      ...profile,
      posts: updateList(profile.posts)
    })));
    setUser(prevUser => prevUser ? { ...prevUser, posts: updateList(prevUser.posts) } : prevUser);
  };

  const patchPostEverywhere = (postId: string, patch: Partial<Post>) => {
    const updateList = (items?: Post[]) => items?.map(post => post.id === postId ? { ...post, ...patch } : post);

    setPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, ...patch } : post));
    setProfileUsers(prevProfiles => prevProfiles.map(profile => ({
      ...profile,
      posts: updateList(profile.posts)
    })));
    setUser(prevUser => prevUser ? { ...prevUser, posts: updateList(prevUser.posts) } : prevUser);
  };

  const removePostEverywhere = (postId: string) => {
    const removeFromList = (items?: Post[]) => items?.filter(post => post.id !== postId);

    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setProfileUsers(prevProfiles => prevProfiles.map(profile => {
      const nextPosts = removeFromList(profile.posts) || [];
      return {
        ...profile,
        posts: nextPosts,
        stats: {
          ...profile.stats,
          creations: Math.min(profile.stats.creations || 0, nextPosts.length)
        }
      };
    }));
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      const nextPosts = removeFromList(prevUser.posts) || [];
      return {
        ...prevUser,
        posts: nextPosts,
        stats: {
          ...prevUser.stats,
          creations: Math.min(prevUser.stats.creations || 0, nextPosts.length)
        }
      };
    });
  };

  useEffect(() => {
    if (!supabase || !user) return;
    const realtimeClient = supabase;

    const channel = realtimeClient
      .channel(`messages:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as any;
          appendMessageToChat(row.match_id, {
            id: row.id,
            senderId: row.sender_id,
            text: row.text || undefined,
            mediaUrl: row.media_url || undefined,
            mediaType: row.media_type || undefined,
            reactions: [],
            timestamp: new Date(row.created_at).getTime()
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const row = payload.new as any;
          patchMessageReaction(row.message_id, row.user_id, row.emoji);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const row = payload.new as any;
          patchMessageReaction(row.message_id, row.user_id, row.emoji);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const row = payload.old as any;
          patchMessageReaction(row.message_id, row.user_id);
        }
      )
      .subscribe();

    return () => {
      realtimeClient.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!supabase || !user) return;
    const realtimeClient = supabase;

    const channel = realtimeClient
      .channel(`feed:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const row = payload.new as any;
          appendPost({
            id: row.id,
            userId: row.user_id,
            repostOfId: row.repost_of || undefined,
            movieId: row.movie_id || undefined,
            type: row.type,
            thumbnailUrl: row.thumbnail_url || undefined,
            caption: row.caption || '',
            likes: 0,
            likedBy: [],
            views: 0,
            comments: [],
            timestamp: new Date(row.created_at).getTime()
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          const row = payload.new as any;
          patchPostEverywhere(row.id, {
            repostOfId: row.repost_of || undefined,
            movieId: row.movie_id || undefined,
            type: row.type,
            thumbnailUrl: row.thumbnail_url || undefined,
            caption: row.caption || '',
            timestamp: new Date(row.created_at).getTime()
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          removePostEverywhere((payload.old as any).id);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const row = payload.new as any;
          appendCommentToPost(row.post_id, {
            id: row.id,
            userId: row.user_id,
            userName: row.user_name,
            userAvatar: row.user_avatar,
            text: row.text,
            timestamp: new Date(row.created_at).getTime()
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_likes' },
        (payload) => {
          const row = payload.new as any;
          applyLikeToPost(row.post_id, row.user_id, true);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'post_likes' },
        (payload) => {
          const row = payload.old as any;
          applyLikeToPost(row.post_id, row.user_id, false);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => {
          loadProfiles();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        () => {
          loadProfiles();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stories' },
        (payload) => {
          appendStory(mapStoryRow(payload.new as any));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'stories' },
        (payload) => {
          removeStory((payload.old as any).id);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'story_comments' },
        (payload) => {
          const row = payload.new as any;
          appendCommentToStory(row.story_id, {
            id: row.id,
            userId: row.user_id,
            userName: row.user_name,
            userAvatar: row.user_avatar,
            text: row.text,
            timestamp: new Date(row.created_at).getTime()
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'story_likes' },
        (payload) => {
          const row = payload.new as any;
          applyLikeToStory(row.story_id, row.user_id, true);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'story_likes' },
        (payload) => {
          const row = payload.old as any;
          applyLikeToStory(row.story_id, row.user_id, false);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'story_views' },
        (payload) => {
          const row = payload.new as any;
          applyViewToStory(row.story_id, row.user_id);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'communities' },
        () => {
          loadCommunities();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_members' },
        () => {
          loadCommunities();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        () => {
          loadCommunities();
        }
      )
      .subscribe();

    return () => {
      realtimeClient.removeChannel(channel);
    };
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    await syncSession();
  };

  const getAuthRedirectUrl = (path: string) => {
    const appUrl = import.meta.env.VITE_APP_URL?.replace(/\/$/, '');
    if (appUrl) return `${appUrl}${path}`;
    if (typeof window === 'undefined') return undefined;
    return `${window.location.origin}${path}`;
  };

  const signUp = async (email: string, password: string, name?: string, handle?: string, referredBy?: string) => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    setAuthError('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split('@')[0], handle, referred_by: referredBy },
        emailRedirectTo: getAuthRedirectUrl('/home')
      }
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (!data.session) {
      const confirmationMessage = 'Cadastro criado. Confirme seu email antes de entrar.';
      setAuthError(confirmationMessage);
      throw new Error(confirmationMessage);
    }

    if (data.user) {
      const profile = createDefaultProfile(data.user.id, email, name, handle);
      profile.referredBy = referredBy && referredBy !== data.user.id ? referredBy : undefined;
      await persistProfile(profile);
      setUser(profile);
      await refreshAppData(data.user.id);
    }
  };

  const updateHandle = async (handle: string) => {
    if (!user || !supabase) return;

    const normalizedHandle = normalizeHandle(handle);
    if (!normalizedHandle || normalizedHandle.length < 4) {
      throw new Error('Escolha um @ com pelo menos 3 caracteres.');
    }

    const { data: existingProfile, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('handle', normalizedHandle)
      .neq('id', user.id)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existingProfile) throw new Error('Esse @ ja esta em uso.');

    const updatedUser = {
      ...user,
      handle: normalizedHandle,
      usernameConfigured: true
    };

    const { error } = await supabase
      .from('profiles')
      .update({ handle: normalizedHandle, username_configured: true })
      .eq('id', user.id);

    if (error) {
      if (error.code !== 'PGRST204') throw new Error(error.message);

      const { error: fallbackError } = await supabase
        .from('profiles')
        .update({ handle: normalizedHandle })
        .eq('id', user.id);

      if (fallbackError) throw new Error(fallbackError.message);
    }

    setUser(updatedUser);
    setProfileUsers(prev => prev.map(profile => profile.id === user.id ? updatedUser : profile));
  };

  const uploadAvatar = async (file: File) => {
    if (!user || !supabase) return user?.avatarUrl || '';

    const extension = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const updateProfile = async (values: { name: string; handle: string; bio?: string; avatarFile?: File | null }) => {
    if (!user || !supabase) return;

    const normalizedHandle = normalizeHandle(values.handle);
    if (!values.name.trim()) throw new Error('Informe seu nome.');
    if (!normalizedHandle || normalizedHandle.length < 4) {
      throw new Error('Escolha um @ com pelo menos 3 caracteres.');
    }

    const { data: existingProfile, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('handle', normalizedHandle)
      .neq('id', user.id)
      .maybeSingle();

    if (lookupError) throw new Error(lookupError.message);
    if (existingProfile) throw new Error('Esse @ ja esta em uso.');

    const avatarUrl = values.avatarFile ? await uploadAvatar(values.avatarFile) : user.avatarUrl;
    const updatedUser = {
      ...user,
      name: values.name.trim(),
      handle: normalizedHandle,
      bio: values.bio ?? user.bio,
      avatarUrl,
      usernameConfigured: true
    };

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedUser.name,
        handle: updatedUser.handle,
        bio: updatedUser.bio,
        avatar_url: updatedUser.avatarUrl,
        username_configured: true
      })
      .eq('id', user.id);

    if (error) {
      if (error.code !== 'PGRST204') throw new Error(error.message);

      const { error: fallbackError } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          handle: updatedUser.handle,
          bio: updatedUser.bio,
          avatar_url: updatedUser.avatarUrl
        })
        .eq('id', user.id);

      if (fallbackError) throw new Error(fallbackError.message);
    }

    setUser(updatedUser);
    setProfileUsers(prev => prev.map(profile => profile.id === user.id ? updatedUser : profile));
  };

  const updateEmail = async (email: string) => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: getAuthRedirectUrl('/home') }
    );

    if (error) throw new Error(error.message);
  };

  const deleteAccount = async () => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    const { error } = await supabase.rpc('delete_current_user');

    if (error) {
      throw new Error(error.message);
    }

    await logout();
  };

  const dismissDirectorCelebration = async () => {
    if (!user || !supabase) {
      setDirectorCelebrationOpen(false);
      return;
    }

    await supabase
      .from('profiles')
      .update({ director_celebration_seen: true })
      .eq('id', user.id);

    const updatedUser = { ...user, directorCelebrationSeen: true };
    setUser(updatedUser);
    setProfileUsers(prev => prev.map(profile => profile.id === user.id ? updatedUser : profile));
    setDirectorCelebrationOpen(false);
  };

  const uploadCommunityImage = async (file: File, folder: string) => {
    if (!user || !supabase) return '';
    const extension = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/${folder}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('community-media')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from('community-media').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const createCommunity = async (values: {
    name: string;
    description: string;
    coverFile?: File | null;
    avatarFile?: File | null;
    features: Community['features'];
    groups: string[];
  }) => {
    if (!user || !supabase) return;
    if (!user.directorEligible) throw new Error('Você precisa se tornar Diretor para criar uma comunidade.');

    const existingCommunity = communities.find(community => community.ownerId === user.id);
    if (existingCommunity) throw new Error('Cada Diretor pode criar apenas 1 comunidade.');
    if (!values.name.trim()) throw new Error('Informe o nome da comunidade.');

    const coverUrl = values.coverFile ? await uploadCommunityImage(values.coverFile, 'cover') : '';
    const avatarUrl = values.avatarFile ? await uploadCommunityImage(values.avatarFile, 'avatar') : '';
    const groups = values.features.groups
      ? values.groups.filter(Boolean).slice(0, 3).map((name, index) => ({ id: `group-${index + 1}`, name }))
      : [];

    const { data, error } = await supabase
      .from('communities')
      .insert({
        owner_id: user.id,
        name: values.name.trim(),
        description: values.description.trim(),
        cover_url: coverUrl,
        avatar_url: avatarUrl,
        features: values.features,
        groups
      })
      .select('*, community_members(user_id), community_posts(*)')
      .single();

    if (error) throw new Error(error.message);

    await joinCommunity(data.id);
    await loadCommunities();
  };

  const joinCommunity = async (communityId: string) => {
    if (!user || !supabase) return;

    const { error } = await supabase
      .from('community_members')
      .upsert({ community_id: communityId, user_id: user.id }, { onConflict: 'community_id,user_id' });

    if (error && communityId !== cineClubCommunity.id) throw new Error(error.message);

    setCommunities(prev => prev.map(community => (
      community.id === communityId
        ? { ...community, memberIds: Array.from(new Set([...community.memberIds, user.id])) }
        : community
    )));
  };

  const createCommunityPost = async (communityId: string, values: { text: string; imageFile?: File | null }) => {
    if (!user || !supabase) return;
    if (!values.text.trim() && !values.imageFile) throw new Error('Escreva algo ou selecione uma imagem.');

    const imageUrl = values.imageFile ? await uploadCommunityImage(values.imageFile, 'post') : '';
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        community_id: communityId,
        user_id: user.id,
        type: imageUrl ? 'image' : 'text',
        image_url: imageUrl,
        text: values.text.trim()
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    const mappedPost = mapCommunityPostRow(data);
    setCommunities(prev => prev.map(community => (
      community.id === communityId
        ? { ...community, posts: [mappedPost, ...community.posts] }
        : community
    )));
  };

  const updateCommunityLiveUrl = async (communityId: string, liveUrl: string) => {
    if (!user || !supabase) return;
    const community = communities.find(item => item.id === communityId);
    if (!community || community.ownerId !== user.id) {
      throw new Error('Apenas o host da comunidade pode alterar o Cine LIVE.');
    }

    const nextFeatures = {
      ...community.features,
      cineLive: true,
      cineLiveUrl: liveUrl.trim()
    };

    const { error } = await supabase
      .from('communities')
      .update({ features: nextFeatures })
      .eq('id', communityId)
      .eq('owner_id', user.id);

    if (error) throw new Error(error.message);

    setCommunities(prev => prev.map(item => (
      item.id === communityId ? { ...item, features: nextFeatures } : item
    )));
  };

  const updateFavoriteMovies = async (movieIds: string[]) => {
    if (!user || !supabase) return;
    const favoriteMovies = movieIds.slice(0, 5);
    const updatedUser = { ...user, favoriteMovies };

    const { error } = await supabase
      .from('profiles')
      .update({ favorite_movies: favoriteMovies })
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    setUser(updatedUser);
    setProfileUsers(prev => prev.map(profile => profile.id === user.id ? updatedUser : profile));
  };

  const resendConfirmation = async (email: string) => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    setAuthError('');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: getAuthRedirectUrl('/home') }
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    setAuthError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/reset-password')
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    setAuthError('');
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    await syncSession();
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setMatches([]);
    setChats([]);
    setPosts([]);
  };

  const completeOnboarding = async (answers: Record<string, string>) => {
    if (!user) return;

    const counts: Record<string, number> = {};
    Object.values(answers).forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topTrait = sorted[0]?.[0] || 'elegant_dreamer';
    const loveTypeByTrait: Record<string, EmotionalProfileType> = {
      elegant_dreamer: 'Sonhador Elegante',
      magnetic_intense: 'Intenso Magnético',
      loyal_guardian: 'Guardião Leal',
      free_soul: 'Alma Livre',
      nostalgic_heart: 'Coração Nostálgico',
      visionary_romantic: 'Romântico Visionário',
      mysterious_charm: 'Encanto Misterioso',
      romantic: 'Sonhador Elegante',
      intense: 'Intenso Magnético',
      dreamer: 'Coração Nostálgico',
      dramatic: 'Intenso Magnético',
      existential: 'Encanto Misterioso'
    };

    const profile = loveTypeByTrait[topTrait] || 'Sonhador Elegante';

    const updatedUser = { ...user, emotionalProfile: profile, onboardingCompleted: true };
    setUser(updatedUser);
    await persistProfile(updatedUser);
    await loadProfiles();
  };

  const checkMatches = async (currentUser: User, likedMovieId: string) => {
    if (!supabase) return;
    const profiles = await loadProfiles();
    const matchedProfiles = profiles.filter(profile =>
      profile.id !== currentUser.id && profile.likedMovies.includes(likedMovieId)
    );

    for (const profile of matchedProfiles) {
      const existingMatch = matches.find(match => match.userIds.includes(profile.id));
      if (existingMatch) continue;

      const userIds = [currentUser.id, profile.id].sort();
      const newMatch = {
        user_a: userIds[0],
        user_b: userIds[1],
        compatibility: {
          overall: Math.floor(Math.random() * 20) + 70,
          emotional: Math.floor(Math.random() * 20) + 60
        },
        common_movies: [likedMovieId]
      };

      await supabase.from('matches').upsert(newMatch, { onConflict: 'user_a,user_b' });
    }

    await loadMatches(currentUser.id);
  };

  const toggleFollowUser = async (targetUserId: string) => {
    if (!user || !supabase || user.id === targetUserId) return;

    const followingIds = user.followingIds || [];
    const isFollowing = followingIds.includes(targetUserId);
    const updatedFollowingIds = isFollowing
      ? followingIds.filter(id => id !== targetUserId)
      : [...followingIds, targetUserId];

    const updatedUser = {
      ...user,
      followingIds: updatedFollowingIds,
      stats: {
        ...user.stats,
        following: updatedFollowingIds.length
      }
    };

    const { error } = await supabase
      .from('profiles')
      .update({
        following_ids: updatedFollowingIds,
        stats: updatedUser.stats
      })
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    setUser(updatedUser);
    setProfileUsers(prev => prev.map(profile => profile.id === user.id ? updatedUser : profile));
  };

  const createPost = async (values: { caption: string; imageFile?: File | null }) => {
    if (!user || !supabase) return;

    const caption = values.caption.trim();
    if (!caption && !values.imageFile) {
      throw new Error('Adicione texto ou imagem para publicar.');
    }

    let thumbnailUrl = '';
    if (values.imageFile) {
      const extension = values.imageFile.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/post-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, values.imageFile, {
          contentType: values.imageFile.type || undefined,
          upsert: false
        });

      if (uploadError) throw new Error(uploadError.message);
      const { data } = supabase.storage.from('post-media').getPublicUrl(filePath);
      thumbnailUrl = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        type: thumbnailUrl ? 'image' : 'text',
        thumbnail_url: thumbnailUrl || null,
        caption
      })
      .select('*, comments(*), post_likes(user_id)')
      .single();

    if (error) throw new Error(error.message);
    if (data) appendPost(mapPostRow(data));
  };

  const updatePost = async (postId: string, values: { caption: string }) => {
    if (!user || !supabase) return;
    const post = posts.find(item => item.id === postId);
    if (!post || post.userId !== user.id) throw new Error('Você só pode editar suas próprias postagens.');

    const caption = values.caption.trim();
    const { data, error } = await supabase
      .from('posts')
      .update({ caption })
      .eq('id', postId)
      .eq('user_id', user.id)
      .select('*, comments(*), post_likes(user_id)')
      .single();

    if (error) throw new Error(error.message);
    if (data) updatePostEverywhere({ ...post, ...mapPostRow(data), views: post.views, viewedByCurrentUser: post.viewedByCurrentUser });
  };

  const deletePost = async (postId: string) => {
    if (!user || !supabase) return;
    const post = posts.find(item => item.id === postId);
    if (!post || post.userId !== user.id) throw new Error('Você só pode excluir suas próprias postagens.');

    const { error } = await supabase.rpc('delete_own_post', { post_id: postId });

    if (error) {
      const rpcMissing = error.message.toLowerCase().includes('function') || error.message.toLowerCase().includes('schema cache');
      if (!rpcMissing) throw new Error(error.message);

      const { data: deletedRows, error: fallbackError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id)
        .select('id');

      if (fallbackError) throw new Error(fallbackError.message);
      if (!deletedRows || deletedRows.length === 0) {
        throw new Error('O banco nao confirmou a exclusao. Rode o schema atualizado no Supabase e tente novamente.');
      }
    }

    removePostEverywhere(postId);
  };

  const repostPost = async (postId: string) => {
    if (!user || !supabase) return;
    const post = posts.find(item => item.id === postId);
    if (!post) throw new Error('Postagem nao encontrada.');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        repost_of: post.repostOfId || post.id,
        movie_id: post.movieId || null,
        type: 'repost',
        thumbnail_url: post.thumbnailUrl || null,
        caption: post.caption
      })
      .select('*, comments(*), post_likes(user_id)')
      .single();

    if (error) throw new Error(error.message);
    if (data) appendPost(mapPostRow(data));
  };

  const createStory = async (values: { text?: string; imageFile?: File | null }) => {
    if (!user || !supabase) return;

    const text = values.text?.trim() || '';
    if (!text && !values.imageFile) {
      throw new Error('Adicione texto ou imagem para publicar uma cena.');
    }

    let mediaUrl = '';
    if (values.imageFile) {
      const extension = values.imageFile.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/cena-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(filePath, values.imageFile, {
          contentType: values.imageFile.type || undefined,
          upsert: false
        });

      if (uploadError) throw new Error(uploadError.message);
      const { data } = supabase.storage.from('story-media').getPublicUrl(filePath);
      mediaUrl = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        type: mediaUrl ? 'image' : 'text',
        media_url: mediaUrl || null,
        text: text || null,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
      })
      .select('*, story_likes(user_id), story_comments(*)')
      .single();

    if (error) {
      const needsSchema = error.message.toLowerCase().includes('schema cache') || error.message.toLowerCase().includes('stories');
      throw new Error(needsSchema
        ? 'A tabela de Cenas ainda nao existe no Supabase. Rode o supabase/schema.sql atualizado e tente novamente.'
        : error.message
      );
    }
    if (data) appendStory(mapStoryRow(data));
  };

  const deleteStory = async (storyId: string) => {
    if (!user || !supabase) return;
    const story = stories.find(item => item.id === storyId);
    if (story?.userId !== user.id) throw new Error('Você só pode excluir suas próprias cenas.');

    const { error } = await supabase.from('stories').delete().eq('id', storyId).eq('user_id', user.id);
    if (error) throw new Error(error.message);

    removeStory(storyId);
  };

  const addStoryComment = async (storyId: string, text: string) => {
    if (!user || !supabase) return;
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      text: trimmedText,
      timestamp: Date.now()
    };

    const { error } = await supabase.from('story_comments').insert({
      id: newComment.id,
      story_id: storyId,
      user_id: user.id,
      user_name: user.name,
      user_avatar: user.avatarUrl,
      text: trimmedText
    });

    if (error) throw new Error(error.message);
    appendCommentToStory(storyId, newComment);
  };

  const toggleLikeStory = async (storyId: string) => {
    if (!user || !supabase) return;
    const story = stories.find(item => item.id === storyId);
    if (!story) return;

    const isLiked = story.likedBy.includes(user.id);
    const { error } = isLiked
      ? await supabase.from('story_likes').delete().eq('story_id', storyId).eq('user_id', user.id)
      : await supabase.from('story_likes').insert({ story_id: storyId, user_id: user.id });

    if (error) throw new Error(error.message);
    applyLikeToStory(storyId, user.id, !isLiked);
  };

  const recordStoryView = async (storyId: string) => {
    if (!user || !supabase) return;
    const story = stories.find(item => item.id === storyId);
    if (!story || story.userId === user.id || story.viewedBy.includes(user.id)) return;

    const { error } = await supabase
      .from('story_views')
      .upsert({ story_id: storyId, user_id: user.id }, { onConflict: 'story_id,user_id', ignoreDuplicates: true });

    if (error) return;
    applyViewToStory(storyId, user.id);
  };

  const recordPostView = async (postId: string) => {
    if (!user || !supabase) return;
    const post = posts.find(item => item.id === postId);
    if (!post || post.userId === user.id) return;

    const { error } = await supabase
      .from('post_views')
      .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id', ignoreDuplicates: true });

    if (error) return;

    setPosts(prevPosts => prevPosts.map(item => (
      item.id === postId && !item.viewedByCurrentUser
        ? { ...item, views: item.views + 1, viewedByCurrentUser: true }
        : item
    )));
    setProfileUsers(prevProfiles => prevProfiles.map(profile => ({
      ...profile,
      posts: profile.posts?.map(item => (
        item.id === postId && !item.viewedByCurrentUser
          ? { ...item, views: item.views + 1, viewedByCurrentUser: true }
          : item
      ))
    })));
    setUser(prevUser => prevUser ? ({
      ...prevUser,
      posts: prevUser.posts?.map(item => (
        item.id === postId && !item.viewedByCurrentUser
          ? { ...item, views: item.views + 1, viewedByCurrentUser: true }
          : item
      ))
    }) : prevUser);
  };

  const swipeMovie = async (movieId: string, direction: 'left' | 'right') => {
    if (!user) return;

    const updatedUser = direction === 'right'
      ? { ...user, likedMovies: Array.from(new Set([...user.likedMovies, movieId])) }
      : { ...user, dislikedMovies: Array.from(new Set([...user.dislikedMovies, movieId])) };

    setUser(updatedUser);
    await persistProfile(updatedUser);

    if (direction === 'right') {
      await checkMatches(updatedUser, movieId);
    }

    setCurrentMovieIndex(prev => prev + 1);
  };

  const getRecommendedMovies = (mood: string) => (
    movies.filter(movie => movie.moods.some(movieMood => mood.toLowerCase().includes(movieMood)))
  );

  const sendMessage = async (matchId: string, text?: string, media?: { url: string, type: 'image' | 'video' | 'audio' }) => {
    if (!user || !supabase) return;

    const { data } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        text,
        media_url: media?.url,
        media_type: media?.type
      })
      .select()
      .single();

    if (!data) return;

    const newMessage: Message = {
      id: data.id,
      senderId: user.id,
      text,
      mediaUrl: media?.url,
      mediaType: media?.type,
      reactions: [],
      timestamp: new Date(data.created_at).getTime()
    };

    appendMessageToChat(matchId, newMessage);
  };

  const toggleMessageReaction = async (messageId: string, emoji: string) => {
    if (!user || !supabase) return;

    const message = chats.flatMap(chat => chat.messages).find(item => item.id === messageId);
    if (!message) return;

    const currentReaction = message.reactions.find(reaction => reaction.userId === user.id);

    if (currentReaction?.emoji === emoji) {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);
      patchMessageReaction(messageId, user.id);
      return;
    }

    const { error } = await supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: user.id,
        emoji
      }, { onConflict: 'message_id,user_id' });

    if (error) throw new Error(error.message);
    patchMessageReaction(messageId, user.id, emoji);
  };

  const sendMediaMessage = async (matchId: string, file: File | Blob, type: 'image' | 'video' | 'audio') => {
    if (!user || !supabase) return;

    const extensionByType = {
      image: 'jpg',
      video: 'mp4',
      audio: 'webm'
    };
    const originalName = file instanceof File ? file.name : '';
    const extension = originalName.split('.').pop() || extensionByType[type];
    const filePath = `${matchId}/${user.id}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(filePath, file, {
        contentType: file.type || undefined,
        upsert: false
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from('chat-media').getPublicUrl(filePath);
    await sendMessage(matchId, undefined, { url: data.publicUrl, type });
  };

  const startChat = async (targetUserId: string): Promise<string> => {
    if (!user || !supabase) return '';

    const existingMatch = matches.find(match =>
      match.userIds.includes(user.id) && match.userIds.includes(targetUserId)
    );

    if (existingMatch) return existingMatch.id;

    const userIds = [user.id, targetUserId].sort();
    const { data } = await supabase
      .from('matches')
      .upsert({
        user_a: userIds[0],
        user_b: userIds[1],
        compatibility: { overall: 85, emotional: 80 },
        common_movies: []
      }, { onConflict: 'user_a,user_b' })
      .select()
      .single();

    if (!data) return '';
    await loadMatches(user.id);
    return data.id;
  };

  const addComment = async (postId: string, text: string) => {
    if (!user || !supabase) return;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      text,
      timestamp: Date.now()
    };

    await supabase.from('comments').insert({
      id: newComment.id,
      post_id: postId,
      user_id: user.id,
      user_name: user.name,
      user_avatar: user.avatarUrl,
      text
    });

    setPosts(prevPosts => prevPosts.map(post => (
      post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
    )));
  };

  const toggleSavePost = async (postId: string) => {
    if (!user || !supabase) return;

    const isSaved = user.savedPosts.includes(postId);
    const updatedUser = {
      ...user,
      savedPosts: isSaved
        ? user.savedPosts.filter(id => id !== postId)
        : [...user.savedPosts, postId]
    };

    setUser(updatedUser);
    await persistProfile(updatedUser);
  };

  const toggleLikePost = async (postId: string) => {
    if (!user || !supabase) return;
    const post = posts.find(item => item.id === postId);
    if (!post) return;

    const isLiked = post.likedBy.includes(user.id);

    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    }

    setPosts(prevPosts => prevPosts.map(item => {
      if (item.id !== postId) return item;
      const likedBy = isLiked ? item.likedBy.filter(id => id !== user.id) : [...item.likedBy, user.id];
      return { ...item, likedBy, likes: likedBy.length };
    }));
  };

  const value = useMemo(() => ({
    user,
    profileUsers,
    movies,
    matches,
    chats,
    posts,
    stories,
    communities,
    onlineUserIds,
    unreadMessageCount,
    referralCount,
    directorCelebrationOpen,
    currentMovieIndex,
    isLoading,
    authError,
    login,
    signUp,
    updateHandle,
    resendConfirmation,
    requestPasswordReset,
    updatePassword,
    logout,
    getUserById,
    updateProfile,
    updateFavoriteMovies,
    updateEmail,
    deleteAccount,
    dismissDirectorCelebration,
    createCommunity,
    joinCommunity,
    createCommunityPost,
    updateCommunityLiveUrl,
    toggleFollowUser,
    createPost,
    updatePost,
    deletePost,
    repostPost,
    createStory,
    deleteStory,
    addStoryComment,
    toggleLikeStory,
    recordStoryView,
    recordPostView,
    completeOnboarding,
    swipeMovie,
    getRecommendedMovies,
    sendMessage,
    sendMediaMessage,
    toggleMessageReaction,
    startChat,
    addComment,
    toggleSavePost,
    toggleLikePost,
    markChatRead,
    getUnreadMessagesForMatch,
    isUserOnline
  }), [user, profileUsers, movies, matches, chats, posts, stories, communities, onlineUserIds, unreadMessageCount, referralCount, directorCelebrationOpen, currentMovieIndex, isLoading, authError, readMessagesByMatch]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
