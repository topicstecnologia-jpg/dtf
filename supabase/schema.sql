create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  handle text not null,
  username_configured boolean not null default false,
  onboarding_completed boolean not null default false,
  avatar_url text,
  cover_url text,
  bio text,
  emotional_profile text default '',
  liked_movies jsonb not null default '[]'::jsonb,
  disliked_movies jsonb not null default '[]'::jsonb,
  favorite_movies jsonb not null default '[]'::jsonb,
  matches jsonb not null default '[]'::jsonb,
  saved_posts jsonb not null default '[]'::jsonb,
  following_ids jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{"following":0,"followers":0,"creations":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  compatibility jsonb not null default '{"overall":80,"emotional":75}'::jsonb,
  common_movies jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint matches_unique_pair unique (user_a, user_b),
  constraint matches_distinct_users check (user_a <> user_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text,
  media_url text,
  media_type text check (media_type in ('image', 'video', 'audio') or media_type is null),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  movie_id text,
  type text not null default 'image' check (type in ('image', 'video', 'repost', 'text')),
  thumbnail_url text,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  user_avatar text,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.profiles
  add column if not exists username_configured boolean not null default false;

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

alter table public.profiles
  add column if not exists following_ids jsonb not null default '[]'::jsonb;

alter table public.posts
  drop constraint if exists posts_type_check;

alter table public.posts
  add constraint posts_type_check check (type in ('image', 'video', 'repost', 'text'));

create unique index if not exists profiles_handle_unique_idx
  on public.profiles (lower(handle))
  where username_configured = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Avatar files are public" on storage.objects;
create policy "Avatar files are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their avatar" on storage.objects;
create policy "Users can upload their avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their avatar" on storage.objects;
create policy "Users can update their avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can remove their avatar" on storage.objects;
create policy "Users can remove their avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Chat media files are public" on storage.objects;
create policy "Chat media files are public"
  on storage.objects for select
  using (bucket_id = 'chat-media');

drop policy if exists "Users can upload chat media for their matches" on storage.objects;
create policy "Users can upload chat media for their matches"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.matches
      where matches.id::text = (storage.foldername(name))[1]
      and (matches.user_a = auth.uid() or matches.user_b = auth.uid())
    )
  );

drop policy if exists "Users can update chat media for their matches" on storage.objects;
create policy "Users can update chat media for their matches"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.matches
      where matches.id::text = (storage.foldername(name))[1]
      and (matches.user_a = auth.uid() or matches.user_b = auth.uid())
    )
  )
  with check (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.matches
      where matches.id::text = (storage.foldername(name))[1]
      and (matches.user_a = auth.uid() or matches.user_b = auth.uid())
    )
  );

drop policy if exists "Post media files are public" on storage.objects;
create policy "Post media files are public"
  on storage.objects for select
  using (bucket_id = 'post-media');

drop policy if exists "Users can upload their post media" on storage.objects;
create policy "Users can upload their post media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their post media" on storage.objects;
create policy "Users can update their post media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
    )
  then
    alter publication supabase_realtime add table public.messages;
  end if;

  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'posts'
    )
  then
    alter publication supabase_realtime add table public.posts;
  end if;
end;
$$;

create or replace function public.delete_current_user()
returns void
language plpgsql
security definer set search_path = auth, public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_current_user() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  display_name text;
  normalized_handle text;
  requested_handle text;
begin
  display_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Usuario');
  requested_handle := nullif(trim(both '@' from coalesce(new.raw_user_meta_data->>'handle', '')), '');
  normalized_handle := lower(regexp_replace(coalesce(requested_handle, display_name), '[^a-zA-Z0-9_]+', '_', 'g'));
  normalized_handle := trim(both '_' from normalized_handle);

  insert into public.profiles (id, name, handle, username_configured, avatar_url, cover_url, bio)
  values (
    new.id,
    display_name,
    '@' || coalesce(nullif(normalized_handle, ''), 'usuario'),
    requested_handle is not null,
    '',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    'Apaixonado por cinema.'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;

drop policy if exists "Profiles are visible to authenticated users" on public.profiles;
create policy "Profiles are visible to authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can read their matches" on public.matches;
create policy "Users can read their matches"
  on public.matches for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can create matches involving themselves" on public.matches;
create policy "Users can create matches involving themselves"
  on public.matches for insert
  to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can update matches involving themselves" on public.matches;
create policy "Users can update matches involving themselves"
  on public.matches for update
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b)
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can read messages in their matches" on public.messages;
create policy "Users can read messages in their matches"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = messages.match_id
      and (matches.user_a = auth.uid() or matches.user_b = auth.uid())
    )
  );

drop policy if exists "Users can send messages in their matches" on public.messages;
create policy "Users can send messages in their matches"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id and exists (
      select 1 from public.matches
      where matches.id = messages.match_id
      and (matches.user_a = auth.uid() or matches.user_b = auth.uid())
    )
  );

drop policy if exists "Posts are visible to authenticated users" on public.posts;
create policy "Posts are visible to authenticated users"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "Users can create their own posts" on public.posts;
create policy "Users can create their own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Comments are visible to authenticated users" on public.comments;
create policy "Comments are visible to authenticated users"
  on public.comments for select
  to authenticated
  using (true);

drop policy if exists "Users can create their own comments" on public.comments;
create policy "Users can create their own comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Likes are visible to authenticated users" on public.post_likes;
create policy "Likes are visible to authenticated users"
  on public.post_likes for select
  to authenticated
  using (true);

drop policy if exists "Users can like as themselves" on public.post_likes;
create policy "Users can like as themselves"
  on public.post_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own likes" on public.post_likes;
create policy "Users can remove their own likes"
  on public.post_likes for delete
  to authenticated
  using (auth.uid() = user_id);
