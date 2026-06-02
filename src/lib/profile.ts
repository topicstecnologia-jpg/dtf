import { User } from '../types';

const defaultAvatar =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

const defaultCover =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

export const createDefaultProfile = (id: string, email?: string, name?: string): User => {
  const displayName = name?.trim() || email?.split('@')[0] || 'Usuario';
  const normalizedHandle = displayName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return {
    id,
    name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    handle: `@${normalizedHandle || 'usuario'}`,
    avatarUrl: defaultAvatar,
    coverUrl: defaultCover,
    bio: 'Apaixonado por cinema.',
    emotionalProfile: '',
    likedMovies: [],
    dislikedMovies: [],
    favoriteMovies: [],
    matches: [],
    savedPosts: [],
    stats: {
      following: 0,
      followers: 0,
      creations: 0
    },
    posts: []
  };
};

export const mapProfileRowToUser = (row: any): User => ({
  id: row.id,
  name: row.name || 'Usuario',
  handle: row.handle || '@usuario',
  avatarUrl: row.avatar_url || defaultAvatar,
  coverUrl: row.cover_url || defaultCover,
  bio: row.bio || '',
  emotionalProfile: row.emotional_profile || '',
  likedMovies: row.liked_movies || [],
  dislikedMovies: row.disliked_movies || [],
  favoriteMovies: row.favorite_movies || [],
  matches: row.matches || [],
  savedPosts: row.saved_posts || [],
  stats: row.stats || { following: 0, followers: 0, creations: 0 },
  posts: []
});

export const mapUserToProfileRow = (user: User) => ({
  id: user.id,
  name: user.name,
  handle: user.handle,
  avatar_url: user.avatarUrl,
  cover_url: user.coverUrl,
  bio: user.bio,
  emotional_profile: user.emotionalProfile,
  liked_movies: user.likedMovies,
  disliked_movies: user.dislikedMovies,
  favorite_movies: user.favoriteMovies,
  matches: user.matches,
  saved_posts: user.savedPosts,
  stats: user.stats
});
