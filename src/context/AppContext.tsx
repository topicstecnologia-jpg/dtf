import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, Movie, Match, EmotionalProfileType, Chat, Message, Post, Comment } from '../types';
import { MOVIES } from '../data/mock';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { createDefaultProfile, mapProfileRowToUser, mapUserToProfileRow } from '../lib/profile';

interface AppContextType {
  user: User | null;
  profileUsers: User[];
  movies: Movie[];
  matches: Match[];
  chats: Chat[];
  posts: Post[];
  currentMovieIndex: number;
  isLoading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserById: (userId?: string) => User | undefined;
  completeOnboarding: (answers: Record<string, string>) => Promise<void>;
  swipeMovie: (movieId: string, direction: 'left' | 'right') => Promise<void>;
  getRecommendedMovies: (mood: string) => Movie[];
  sendMessage: (matchId: string, text?: string, media?: { url: string, type: 'image' | 'video' | 'audio' }) => Promise<void>;
  startChat: (targetUserId: string) => Promise<string>;
  addComment: (postId: string, text: string) => Promise<void>;
  toggleSavePost: (postId: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileUsers, setProfileUsers] = useState<User[]>([]);
  const [movies] = useState<Movie[]>(MOVIES);
  const [matches, setMatches] = useState<Match[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const getUserById = (userId?: string) => {
    if (!userId) return undefined;
    if (user?.id === userId) return user;
    return profileUsers.find(profile => profile.id === userId);
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
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    const grouped = new Map<string, Message[]>();

    (data || []).forEach(row => {
      const messagesForMatch = grouped.get(row.match_id) || [];
      messagesForMatch.push({
        id: row.id,
        senderId: row.sender_id,
        text: row.text || undefined,
        mediaUrl: row.media_url || undefined,
        mediaType: row.media_type || undefined,
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

  const loadPosts = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('posts')
      .select('*, comments(*), post_likes(user_id)')
      .order('created_at', { ascending: false });

    const mappedPosts = (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      movieId: row.movie_id || undefined,
      type: row.type,
      thumbnailUrl: row.thumbnail_url || undefined,
      caption: row.caption || '',
      likes: row.post_likes?.length || 0,
      likedBy: (row.post_likes || []).map((like: any) => like.user_id),
      comments: (row.comments || []).map((comment: any) => ({
        id: comment.id,
        userId: comment.user_id,
        userName: comment.user_name,
        userAvatar: comment.user_avatar,
        text: comment.text,
        timestamp: new Date(comment.created_at).getTime()
      })),
      timestamp: new Date(row.created_at).getTime()
    }));

    setPosts(mappedPosts);
  };

  const refreshAppData = async (currentUserId: string) => {
    await Promise.all([loadProfiles(), loadMatches(currentUserId), loadMessages(), loadPosts()]);
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

  const signUp = async (email: string, password: string, name?: string) => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    setAuthError('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split('@')[0] },
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
      const profile = createDefaultProfile(data.user.id, email, name);
      await persistProfile(profile);
      setUser(profile);
      await refreshAppData(data.user.id);
    }
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
    const topTrait = sorted[0]?.[0] || 'romantic';

    let profile: EmotionalProfileType = 'Romantico Idealista';
    if (topTrait === 'existential') profile = 'Explorador Existencial';
    if (topTrait === 'intense') profile = 'Amante de Historias Intensas';
    if (topTrait === 'dreamer') profile = 'Sonhador Nostalgico';
    if (topTrait === 'dramatic') profile = 'Coracao Dramatico';

    const updatedUser = { ...user, emotionalProfile: profile };
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
      timestamp: new Date(data.created_at).getTime()
    };

    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(chat => chat.matchId === matchId);
      if (chatIndex >= 0) {
        const updatedChats = [...prevChats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          messages: [...updatedChats[chatIndex].messages, newMessage]
        };
        return updatedChats;
      }

      return [...prevChats, { id: `chat-${matchId}`, matchId, messages: [newMessage] }];
    });
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
    currentMovieIndex,
    isLoading,
    authError,
    login,
    signUp,
    resendConfirmation,
    requestPasswordReset,
    updatePassword,
    logout,
    getUserById,
    completeOnboarding,
    swipeMovie,
    getRecommendedMovies,
    sendMessage,
    startChat,
    addComment,
    toggleSavePost,
    toggleLikePost
  }), [user, profileUsers, movies, matches, chats, posts, currentMovieIndex, isLoading, authError]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
