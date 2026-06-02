import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, Movie, Match, EmotionalProfileType, Chat, Message, Post, Comment, Story } from '../types';
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
  currentMovieIndex: number;
  isLoading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, handle?: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateHandle: (handle: string) => Promise<void>;
  updateProfile: (values: { name: string; handle: string; bio?: string; avatarFile?: File | null }) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  toggleFollowUser: (targetUserId: string) => Promise<void>;
  createPost: (values: { caption: string; imageFile?: File | null }) => Promise<void>;
  updatePost: (postId: string, values: { caption: string }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  repostPost: (postId: string) => Promise<void>;
  createStory: (values: { text?: string; imageFile?: File | null }) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  recordPostView: (postId: string) => Promise<void>;
  getUserById: (userId?: string) => User | undefined;
  completeOnboarding: (answers: Record<string, string>) => Promise<void>;
  swipeMovie: (movieId: string, direction: 'left' | 'right') => Promise<void>;
  getRecommendedMovies: (mood: string) => Movie[];
  sendMessage: (matchId: string, text?: string, media?: { url: string, type: 'image' | 'video' | 'audio' }) => Promise<void>;
  sendMediaMessage: (matchId: string, file: File | Blob, type: 'image' | 'video' | 'audio') => Promise<void>;
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
  const [stories, setStories] = useState<Story[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const getUserById = (userId?: string) => {
    if (!userId) return undefined;
    if (user?.id === userId) return user;
    return profileUsers.find(profile => profile.id === userId);
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

  const mapPostRow = (row: any): Post => ({
    id: row.id,
    userId: row.user_id,
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
    timestamp: new Date(row.created_at).getTime(),
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : undefined
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
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false });

    if (error) {
      setStories([]);
      return;
    }

    setStories((data || []).map(mapStoryRow));
  };

  const refreshAppData = async (currentUserId: string) => {
    await Promise.all([loadProfiles(), loadMatches(currentUserId), loadMessages(), loadPosts(), loadStories()]);
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
            timestamp: new Date(row.created_at).getTime()
          });
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

  const signUp = async (email: string, password: string, name?: string, handle?: string) => {
    if (!supabase) throw new Error('Supabase nao esta configurado.');
    setAuthError('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split('@')[0], handle },
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
      magnetic_intense: 'Intenso Magnetico',
      loyal_guardian: 'Guardiao Leal',
      free_soul: 'Alma Livre',
      nostalgic_heart: 'Coracao Nostalgico',
      visionary_romantic: 'Romantico Visionario',
      mysterious_charm: 'Encanto Misterioso',
      romantic: 'Sonhador Elegante',
      intense: 'Intenso Magnetico',
      dreamer: 'Coracao Nostalgico',
      dramatic: 'Intenso Magnetico',
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
    if (!post || post.userId !== user.id) throw new Error('Voce so pode editar suas proprias postagens.');

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
    if (!post || post.userId !== user.id) throw new Error('Voce so pode excluir suas proprias postagens.');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
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
      .select()
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
    if (story?.userId !== user.id) throw new Error('Voce so pode excluir suas proprias cenas.');

    const { error } = await supabase.from('stories').delete().eq('id', storyId).eq('user_id', user.id);
    if (error) throw new Error(error.message);

    removeStory(storyId);
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
      timestamp: new Date(data.created_at).getTime()
    };

    appendMessageToChat(matchId, newMessage);
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
    updateEmail,
    deleteAccount,
    toggleFollowUser,
    createPost,
    updatePost,
    deletePost,
    repostPost,
    createStory,
    deleteStory,
    recordPostView,
    completeOnboarding,
    swipeMovie,
    getRecommendedMovies,
    sendMessage,
    sendMediaMessage,
    startChat,
    addComment,
    toggleSavePost,
    toggleLikePost
  }), [user, profileUsers, movies, matches, chats, posts, stories, currentMovieIndex, isLoading, authError]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
