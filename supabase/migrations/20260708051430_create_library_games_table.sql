create table public.library_games (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id bigint not null,
  status text not null check (status in ('favorites', 'wishlist', 'playing', 'completed')),
  title text not null,
  image text,
  rating numeric,
  release_year integer,
  platforms text[] not null default '{}',
  genres text[] not null default '{}',
  added_at timestamptz not null default now(),
  unique (user_id, game_id)
);

alter table public.library_games enable row level security;

create index library_games_user_id_idx on public.library_games (user_id);

create policy "Library games are viewable by owner"
  on public.library_games for select
  using (auth.uid() = user_id);

create policy "Library games are insertable by owner"
  on public.library_games for insert
  with check (auth.uid() = user_id);

create policy "Library games are updatable by owner"
  on public.library_games for update
  using (auth.uid() = user_id);

create policy "Library games are deletable by owner"
  on public.library_games for delete
  using (auth.uid() = user_id);
