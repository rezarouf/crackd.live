-- ============================================================
-- Crackd.live Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  avatar_url    text,
  xp            integer not null default 0,
  level         integer not null default 1,
  streak_current  integer not null default 0,
  streak_longest  integer not null default 0,
  games_played    integer not null default 0,
  games_won       integer not null default 0,
  win_rate        numeric(5,2) not null default 0,
  country         text,
  role            text not null default 'user' check (role in ('user','admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- GAME RESULTS
-- ============================================================
create table public.game_results (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  game_type     text not null,
  difficulty    text not null default 'Medium',
  score         integer not null default 0,
  time_seconds  integer,
  xp_earned     integer not null default 0,
  completed     boolean not null default false,
  is_daily      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_game_results_user    on public.game_results(user_id);
create index idx_game_results_game    on public.game_results(game_type);
create index idx_game_results_created on public.game_results(created_at desc);

-- ============================================================
-- DAILY CHALLENGES
-- ============================================================
create table public.daily_challenges (
  id             uuid primary key default uuid_generate_v4(),
  game_type      text not null,
  challenge_date date not null,
  puzzle_data    jsonb not null default '{}',
  seed           text not null,
  unique(game_type, challenge_date)
);

create table public.daily_completions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  uuid not null references public.daily_challenges(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  time_seconds  integer,
  score         integer not null default 0,
  xp_earned     integer not null default 0,
  unique(user_id, challenge_id)
);

-- ============================================================
-- LEADERBOARD
-- ============================================================
create table public.leaderboard_entries (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  game_type  text not null default 'overall',
  period     text not null default 'today' check (period in ('today','week','month','all')),
  score      integer not null default 0,
  xp         integer not null default 0,
  win_rate   numeric(5,2) not null default 0,
  streak     integer not null default 0,
  avg_speed  integer,
  rank       integer,
  updated_at timestamptz not null default now(),
  unique(user_id, game_type, period)
);

create index idx_lb_period_score on public.leaderboard_entries(period, score desc);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
create table public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  key         text unique not null,
  name        text not null,
  description text not null,
  icon        text not null default '🏆',
  xp_reward   integer not null default 0,
  category    text not null default 'general'
);

create table public.user_achievements (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  unique(user_id, achievement_id)
);

-- ============================================================
-- CONNECTIONS PUZZLES
-- ============================================================
create table public.connections_puzzles (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  categories  jsonb not null, -- [{name, color, words:[]}]
  difficulty  text not null default 'Medium',
  created_at  timestamptz not null default now(),
  is_daily    boolean not null default false,
  daily_date  date
);

-- ============================================================
-- CRYPTOGRAM QUOTES
-- ============================================================
create table public.cryptogram_quotes (
  id              uuid primary key default uuid_generate_v4(),
  quote           text not null,
  author          text not null,
  category        text not null default 'general',
  difficulty      text not null default 'Medium',
  encoded_version text,
  created_at      timestamptz not null default now(),
  is_daily        boolean not null default false,
  daily_date      date
);

-- ============================================================
-- FRIENDS / FOLLOWS
-- ============================================================
create table public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.game_results     enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_completions enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.achievements     enable row level security;
alter table public.user_achievements enable row level security;
alter table public.connections_puzzles enable row level security;
alter table public.cryptogram_quotes   enable row level security;
alter table public.follows          enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Game results: read own only
create policy "game_results_select_own" on public.game_results for select using (auth.uid() = user_id);
create policy "game_results_insert_own" on public.game_results for insert with check (auth.uid() = user_id);

-- Daily challenges: anyone can read
create policy "daily_challenges_select_all" on public.daily_challenges for select using (true);

-- Daily completions: own only
create policy "daily_completions_select_own" on public.daily_completions for select using (auth.uid() = user_id);
create policy "daily_completions_insert_own" on public.daily_completions for insert with check (auth.uid() = user_id);

-- Leaderboard: anyone can read
create policy "leaderboard_select_all" on public.leaderboard_entries for select using (true);
create policy "leaderboard_upsert_own" on public.leaderboard_entries for all using (auth.uid() = user_id);

-- Achievements: anyone can read
create policy "achievements_select_all"     on public.achievements for select using (true);
create policy "user_achievements_select_all" on public.user_achievements for select using (true);
create policy "user_achievements_insert_own" on public.user_achievements for insert with check (auth.uid() = user_id);

-- Connections + Cryptogram: anyone can read
create policy "connections_select_all" on public.connections_puzzles for select using (true);
create policy "cryptogram_select_all"  on public.cryptogram_quotes   for select using (true);

-- Follows
create policy "follows_select_all"   on public.follows for select using (true);
create policy "follows_insert_own"   on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete_own"   on public.follows for delete using (auth.uid() = follower_id);

-- ============================================================
-- SEED: Default Achievements
-- ============================================================
insert into public.achievements (key, name, description, icon, xp_reward, category) values
  ('first_crack',      'First Crack',        'Complete your first puzzle',              '🔓', 10,  'general'),
  ('wordsmith',        'Wordsmith',           'Win Wordle in 2 guesses',                 '✍️', 50,  'wordle'),
  ('on_fire',          'On Fire',             'Reach a 7-day streak',                    '🔥', 50,  'streak'),
  ('daily_devotion',   'Daily Devotion',      '7-day overall streak',                    '📅', 50,  'streak'),
  ('speed_demon',      'Speed Demon',         'Solve Sudoku in under 2 minutes',         '⚡', 75,  'sudoku'),
  ('full_house',       'Full House',          'Complete all 10 daily challenges in one day', '🏠', 100, 'general'),
  ('no_hints',         'No Hints',            'Complete Cryptogram without hints',       '🧠', 50,  'cryptogram'),
  ('equation_machine', 'Equation Machine',    'Win 30 Nerdle games',                     '🔢', 100, 'nerdle'),
  ('untangler',        'Untangler',           'Complete 50 Rope Untangle puzzles',       '🪢', 100, 'ropeuntangle'),
  ('century',          'Century',             'Reach a 100-day streak',                  '💯', 500, 'streak'),
  ('unbreakable',      'Unbreakable',         '50 days no mistakes in Wordle',           '🛡️', 200, 'wordle'),
  ('crackd_elite',     'Crackd Elite',        'Reach top 10 global ranking',             '🏆', 250, 'general'),
  ('oracle',           'The Oracle',          'Guess Wordle on first try',               '🔮', 150, 'wordle'),
  ('polymath',         'Polymath',            'Win every game type in one day',          '🎓', 200, 'general'),
  ('grandmaster',      'Grandmaster',         'Reach 5,000 XP',                          '👑', 0,   'general'),
  ('legend',           'Legend',              'Reach 8,000 XP',                          '⚜️', 0,   'general'),
  ('connection_master','Connection Master',   'Win 20 Connections games without mistakes','🔗', 100, 'connections'),
  ('screw_loose',      'Screw Loose',         'Complete 100 Screw Puzzle levels',        '🔩', 100, 'screwpuzzle'),
  ('pin_master',       'Pin Master',          'Complete 50 Pin Pull levels',             '📌', 75,  'pinpull'),
  ('block_party',      'Block Party',         'Clear 100 lines in Wood Block',           '🟫', 75,  'woodblock')
on conflict (key) do nothing;
