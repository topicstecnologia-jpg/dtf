import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Movie, Match, EmotionalProfileType, Chat, Message, Post, Comment } from '../types';
import { MOVIES, MOCK_USERS, MOCK_CHATS, MOCK_MATCHES } from '../data/mock';

interface AppContextType {
  user: User | null;
  movies: Movie[];
  matches: Match[];
  chats: Chat[];
  posts: Post[];
  currentMovieIndex: number;
  login: (name: string) => void;
  completeOnboarding: (answers: Record<string, string>) => void;
  swipeMovie: (movieId: string, direction: 'left' | 'right') => void;
  getRecommendedMovies: (mood: string) => Movie[];
  sendMessage: (matchId: string, text?: string, media?: { url: string, type: 'image' | 'video' | 'audio' }) => void;
  startChat: (targetUserId: string) => string;
  addComment: (postId: string, text: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>(MOVIES);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      userId: MOCK_USERS[0].id,
      movieId: MOVIES[0].id,
      type: 'image',
      caption: "Acabei de assistir Her e estou sem palavras. A fotografia é incrível! 🥺❤️",
      likes: 124,
      likedBy: [],
      comments: [
        {
          id: 'c1',
          userId: MOCK_USERS[1].id,
          userName: MOCK_USERS[1].name,
          userAvatar: MOCK_USERS[1].avatarUrl,
          text: "Filme sensacional! Uma das melhores atuações do Joaquin Phoenix.",
          timestamp: Date.now() - 1000 * 60 * 30
        }
      ],
      timestamp: Date.now() - 1000 * 60 * 60 * 2
    },
    {
      id: 'p2',
      userId: MOCK_USERS[1].id,
      movieId: MOVIES[1].id,
      type: 'image',
      caption: "Multiverso da loucura real. Melhor filme do ano? Sim ou com certeza?",
      likes: 89,
      likedBy: [],
      comments: [],
      timestamp: Date.now() - 1000 * 60 * 60 * 4
    },
    {
      id: 'p3',
      userId: MOCK_USERS[2].id,
      movieId: MOVIES[3].id,
      type: 'image',
      caption: "Interestelar me faz chorar toda vez. A trilha sonora do Hans Zimmer é de outro mundo.",
      likes: 256,
      likedBy: [],
      comments: [],
      timestamp: Date.now() - 1000 * 60 * 60 * 6
    }
  ]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

  const login = (name: string) => {
    // Simulate login
    setUser({
      id: 'u1',
      name,
      handle: `@${name.toLowerCase().replace(/\s+/g, '_')}`,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      bio: 'Apaixonado por cinema e tecnologia. Sempre em busca da próxima obra-prima.',
      emotionalProfile: '',
      likedMovies: [],
      dislikedMovies: [],
      favoriteMovies: ['1', '2'],
      matches: [],
      savedPosts: [],
      stats: {
        following: 120,
        followers: 45,
        creations: 10
      },
      posts: [
        { 
          id: 'p_me_1', 
          userId: 'me',
          type: 'image', 
          thumbnailUrl: 'https://images.unsplash.com/photo-1517604931442-71053644388d?auto=format&fit=crop&w=300&q=80',
          caption: 'Meu primeiro post!',
          likes: 0,
          likedBy: [],
          comments: [],
          timestamp: Date.now()
        }
      ]
    });
  };

  const completeOnboarding = (answers: Record<string, string>) => {
    if (!user) return;

    // Simple logic to determine profile based on answers
    const counts: Record<string, number> = {};
    Object.values(answers).forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topTrait = sorted[0]?.[0] || 'romantic';

    let profile: EmotionalProfileType = 'Romântico Idealista';
    if (topTrait === 'existential') profile = 'Explorador Existencial';
    if (topTrait === 'intense') profile = 'Amante de Histórias Intensas';
    if (topTrait === 'dreamer') profile = 'Sonhador Nostálgico';
    if (topTrait === 'dramatic') profile = 'Coração Dramático';

    setUser({ ...user, emotionalProfile: profile });
  };

  const checkMatches = (currentUser: User, likedMovieId: string) => {
    // Check if any mock user also liked this movie
    MOCK_USERS.forEach(mockUser => {
      // Logic: if they liked the same movie, it's a match for this demo
      if (mockUser.likedMovies.includes(likedMovieId)) {
        const newMatch: Match = {
          id: `m-${Date.now()}-${mockUser.id}`,
          userIds: [currentUser.id, mockUser.id],
          compatibility: {
            overall: Math.floor(Math.random() * 20) + 70,
            emotional: Math.floor(Math.random() * 20) + 60
          },
          commonMovies: [likedMovieId],
          timestamp: Date.now()
        };
        
        setMatches(prev => {
           if (prev.some(m => m.userIds.includes(mockUser.id))) return prev;
           return [...prev, newMatch];
        });
      }
    });
  };

  const swipeMovie = (movieId: string, direction: 'left' | 'right') => {
    if (!user) return;

    if (direction === 'right') {
      // Create a new user object with the liked movie
      const updatedUser = { ...user, likedMovies: [...user.likedMovies, movieId] };
      setUser(updatedUser);
      // Check for matches with this new state
      checkMatches(updatedUser, movieId);
    } else {
      setUser({ ...user, dislikedMovies: [...user.dislikedMovies, movieId] });
    }
    
    setCurrentMovieIndex(prev => prev + 1);
  };

  const getRecommendedMovies = (mood: string) => {
    // Simple filter for now
    return movies.filter(m => m.moods.some(mm => mood.toLowerCase().includes(mm)));
  };

  const sendMessage = (matchId: string, text?: string, media?: { url: string, type: 'image' | 'video' | 'audio' }) => {
    if (!user) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      text,
      mediaUrl: media?.url,
      mediaType: media?.type,
      timestamp: Date.now()
    };

    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(c => c.matchId === matchId);
      if (chatIndex >= 0) {
        const updatedChats = [...prevChats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          messages: [...updatedChats[chatIndex].messages, newMessage]
        };
        return updatedChats;
      } else {
        // Create new chat if it doesn't exist
        return [...prevChats, {
          id: `c-${Date.now()}`,
          matchId,
          messages: [newMessage]
        }];
      }
    });
  };

  const startChat = (targetUserId: string): string => {
    if (!user) return '';

    // Check if match exists
    const existingMatch = matches.find(m => m.userIds.includes(user.id) && m.userIds.includes(targetUserId));
    
    if (existingMatch) {
      return existingMatch.id;
    }

    // Create new match for chat
    const newMatchId = `m-${Date.now()}-${targetUserId}`;
    const newMatch: Match = {
      id: newMatchId,
      userIds: [user.id, targetUserId],
      compatibility: {
        overall: 85,
        emotional: 80
      },
      commonMovies: [],
      timestamp: Date.now()
    };

    setMatches(prev => [...prev, newMatch]);
    return newMatchId;
  };

  const addComment = (postId: string, text: string) => {
    if (!user) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      text,
      timestamp: Date.now()
    };

    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      });
      return updatedPosts;
    });
  };

  const toggleSavePost = (postId: string) => {
    if (!user) return;

    const isSaved = user.savedPosts.includes(postId);
    const updatedSavedPosts = isSaved 
      ? user.savedPosts.filter(id => id !== postId)
      : [...user.savedPosts, postId];

    setUser({ ...user, savedPosts: updatedSavedPosts });
  };

  const toggleLikePost = (postId: string) => {
    if (!user) return;

    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(user.id);
        const updatedLikedBy = isLiked 
          ? post.likedBy.filter(id => id !== user.id)
          : [...post.likedBy, user.id];
        
        return {
          ...post,
          likedBy: updatedLikedBy,
          likes: isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      movies, 
      matches, 
      chats,
      posts,
      currentMovieIndex, 
      login, 
      completeOnboarding, 
      swipeMovie,
      getRecommendedMovies,
      sendMessage,
      startChat,
      addComment,
      toggleSavePost,
      toggleLikePost
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
