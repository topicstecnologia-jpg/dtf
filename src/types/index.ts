export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  description: string;
  posterUrl: string;
  platforms: string[];
  rating: number;
  moods: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  movieId?: string;
  type: 'image' | 'video' | 'repost';
  thumbnailUrl?: string;
  caption: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  emotionalProfile: string;
  likedMovies: string[];
  dislikedMovies: string[];
  favoriteMovies: string[];
  matches: string[];
  savedPosts: string[];
  stats: {
    following: number;
    followers: number;
    creations: number;
  };
  posts?: Post[];
}

export interface Match {
  id: string;
  userIds: [string, string];
  compatibility: {
    overall: number;
    emotional: number;
  };
  commonMovies: string[];
  timestamp: number;
}

export type EmotionalProfileType = 
  | 'Romântico Idealista'
  | 'Explorador Existencial'
  | 'Amante de Histórias Intensas'
  | 'Sonhador Nostálgico'
  | 'Coração Dramático';

export interface Question {
  id: string;
  text: string;
  options: {
    text: string;
    value: string; // Maps to profile traits
  }[];
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  timestamp: number;
}

export interface Chat {
  id: string;
  matchId: string;
  messages: Message[];
}
