-- Run this in your Supabase SQL editor
-- https://supabase.com → your project → SQL Editor → New query

create table if not exists profiles (
  handle        text primary key,
  bio           text default '',
  avatar_initials text default '',
  avatar_color  text default '#111110',
  links         jsonb default '[]'::jsonb,
  layout        text default 'rows' check (layout in ('rows', 'bubbles', 'grid', 'icons')),
  theme         text default 'light' check (theme in ('light', 'dark', 'purple', 'teal', 'coral')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Allow anyone to read public profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by anyone"
  on profiles for select
  using (true);

create policy "Anyone can insert a new profile"
  on profiles for insert
  with check (true);

create policy "Anyone can update their profile"
  on profiles for update
  using (true);
