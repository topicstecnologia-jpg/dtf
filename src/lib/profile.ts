import { User } from '../types';

const defaultAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='80' fill='%23222226'/%3E%3Ccircle cx='80' cy='64' r='26' fill='%2352515a'/%3E%3Cpath d='M38 132c7-25 25-38 42-38s35 13 42 38' fill='%2352515a'/%3E%3C/svg%3E";

const defaultCover =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

export const normalizeHandle = (value: string) => {
  const normalized = value
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);

  return normalized ? `@${normalized}` : '';
};

export const createDefaultProfile = (id: string, email?: string, name?: string, handle?: string): User => {
  const displayName = name?.trim() || email?.split('@')[0] || 'Usuário';
  const normalizedHandle = normalizeHandle(handle || displayName);

  return {
    id,
    name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    handle: normalizedHandle || '@usuario',
    usernameConfigured: Boolean(handle),
    onboardingCompleted: false,
    avatarUrl: defaultAvatar,
    coverUrl: defaultCover,
    bio: 'Apaixonado por cinema.',
    emotionalProfile: '',
    likedMovies: [],
    dislikedMovies: [],
    favoriteMovies: [],
    matches: [],
    savedPosts: [],
    followingIds: [],
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
  name: row.name || 'Usuário',
  handle: row.handle || '@usuario',
  usernameConfigured: row.username_configured ?? Boolean(row.handle && row.handle !== '@usuario'),
  onboardingCompleted: Boolean(row.onboarding_completed || row.emotional_profile),
  avatarUrl: row.avatar_url || defaultAvatar,
  coverUrl: row.cover_url || defaultCover,
  bio: row.bio || '',
  emotionalProfile: row.emotional_profile || '',
  likedMovies: row.liked_movies || [],
  dislikedMovies: row.disliked_movies || [],
  favoriteMovies: row.favorite_movies || [],
  matches: row.matches || [],
  savedPosts: row.saved_posts || [],
  followingIds: row.following_ids || [],
  stats: row.stats || { following: 0, followers: 0, creations: 0 },
  posts: []
});

export const mapUserToProfileRow = (user: User) => ({
  id: user.id,
  name: user.name,
  handle: user.handle,
  username_configured: user.usernameConfigured || false,
  onboarding_completed: user.onboardingCompleted || false,
  avatar_url: user.avatarUrl,
  cover_url: user.coverUrl,
  bio: user.bio,
  emotional_profile: user.emotionalProfile,
  liked_movies: user.likedMovies,
  disliked_movies: user.dislikedMovies,
  favorite_movies: user.favoriteMovies,
  matches: user.matches,
  saved_posts: user.savedPosts,
  following_ids: user.followingIds || [],
  stats: user.stats
});
