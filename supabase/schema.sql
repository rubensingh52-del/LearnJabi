-- LearnJabi Supabase Schema
-- Run this once in your Supabase SQL Editor to create all tables
-- Dashboard: https://supabase.com/dashboard/project/ujqlpkngsgchjbikkhiv/sql

-- Enable UUID extension (needed for Supabase auth integration later)
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id bigint primary key generated always as identity,
  username text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

-- Units table
create table if not exists units (
  id bigint primary key generated always as identity,
  title text not null,
  title_punjabi text not null,
  description text not null,
  icon text not null,
  "order" integer not null,
  color text not null
);

-- Lessons table
create table if not exists lessons (
  id bigint primary key generated always as identity,
  unit_id bigint not null references units(id) on delete cascade,
  title text not null,
  title_punjabi text not null,
  description text not null,
  "order" integer not null,
  type text not null check (type in ('vocabulary','phrases','grammar','practice','culture')),
  content text not null  -- JSON string
);

-- User progress table
create table if not exists user_progress (
  id bigint primary key generated always as identity,
  lesson_id bigint not null references lessons(id) on delete cascade,
  completed boolean not null default false,
  score integer not null default 0,
  last_accessed text not null
);

-- Chat messages table
create table if not exists chat_messages (
  id bigint primary key generated always as identity,
  role text not null check (role in ('user','assistant')),
  content text not null,
  timestamp text not null
);

-- Indexes for common queries
create index if not exists idx_lessons_unit_id on lessons(unit_id);
create index if not exists idx_user_progress_lesson_id on user_progress(lesson_id);
create index if not exists idx_units_order on units("order");
create index if not exists idx_lessons_order on lessons("order");

-- Row Level Security (RLS) - disable for now, enable later when adding auth
-- alter table users enable row level security;
-- alter table units enable row level security;
-- alter table lessons enable row level security;
-- alter table user_progress enable row level security;
-- alter table chat_messages enable row level security;
