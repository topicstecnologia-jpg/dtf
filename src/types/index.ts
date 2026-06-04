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
  repostOfId?: string;
  movieId?: string;
  type: 'image' | 'video' | 'repost' | 'text';
  thumbnailUrl?: string;
  caption: string;
  likes: number;
  likedBy: string[];
  views: number;
  viewedByCurrentUser?: boolean;
  comments: Comment[];
  timestamp: number;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  userId: string;
  type: 'image' | 'text';
  imageUrl?: string;
  text: string;
  timestamp: number;
}

export interface CommunityMessage {
  id: string;
  communityId: string;
  roomId: string;
  userId?: string;
  text: string;
  type: 'message' | 'system';
  timestamp: number;
  expiresAt?: number;
}

export interface CommunityGroup {
  id: string;
  name: string;
  coverUrl?: string;
}

export interface CommunityFeatures {
  cineLive: boolean;
  groups: boolean;
  posts: boolean;
  cineLiveUrl?: string;
}

export interface Community {
  id: string;
  ownerId?: string;
  name: string;
  description: string;
  coverUrl?: string;
  avatarUrl?: string;
  features: CommunityFeatures;
  groups: CommunityGroup[];
  memberIds: string[];
  posts: CommunityPost[];
  messages: CommunityMessage[];
  createdAt: number;
}

export interface AnonymousScript {
  id: string;
  senderId?: string;
  recipientId: string;
  mode: 'instant' | '24h';
  title: string;
  sceneHeading: string;
  body: string;
  responseText?: string;
  responseAt?: number;
  readAt?: number;
  expiresAt: number;
  timestamp: number;
}

export interface Story {
  id: string;
  userId: string;
  type: 'image' | 'text';
  mediaUrl?: string;
  text?: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  views: number;
  viewedBy: string[];
  viewedByCurrentUser?: boolean;
  timestamp: number;
  expiresAt?: number;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  usernameConfigured?: boolean;
  onboardingCompleted?: boolean;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  emotionalProfile: string;
  likedMovies: string[];
  dislikedMovies: string[];
  favoriteMovies: string[];
  matches: string[];
  savedPosts: string[];
  followingIds?: string[];
  referredBy?: string;
  directorEligible?: boolean;
  directorCelebrationSeen?: boolean;
  createdAt?: number;
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
  | 'Sonhador Elegante'
  | 'Intenso Magnético'
  | 'Guardião Leal'
  | 'Alma Livre'
  | 'Coração Nostálgico'
  | 'Romântico Visionário'
  | 'Encanto Misterioso'
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
  reactions: {
    userId: string;
    emoji: string;
  }[];
  timestamp: number;
}

export interface Chat {
  id: string;
  matchId: string;
  messages: Message[];
}
