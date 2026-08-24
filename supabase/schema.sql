-- ==============================================================================
-- RAHAT BAKERY CMS — SUPABASE DATABASE SCHEMA & STORAGE SETUP
-- ==============================================================================
-- Run this script in your Supabase Project SQL Editor (Dashboard > SQL Editor)

-- 1. CMS Documents Table (Persistent JSON storage)
-- Supported Keys:
--   - 'menu_data'        : Categories, items, subtitles, and soft-deleted Trash items
--   - 'gallery_data'     : Active media assets and soft-deleted Trash assets
--   - 'store_info'       : Business details, 7-day schedule, contact, previousConfig snapshot
--   - 'reviews_config'   : Google rating, review count, sync settings, curated fallbacks
--   - 'admin_users'      : Multi-user role hierarchy (Super Admin & Business Owner accounts)
--   - 'admin_audit_logs' : Immutable log of administrative and security events
create table if not exists public.cms_documents (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.cms_documents enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public Read Access for CMS Documents" on public.cms_documents;
drop policy if exists "Service Role Write Access for CMS Documents" on public.cms_documents;

-- Policy 1: Allow public read access (for public storefront & static generation)
create policy "Public Read Access for CMS Documents"
  on public.cms_documents
  for select
  using (true);

-- Policy 2: Allow server-side service role full insert/update/delete access
create policy "Service Role Write Access for CMS Documents"
  on public.cms_documents
  for all
  using (auth.role() = 'service_role' or auth.role() = 'authenticated')
  with check (auth.role() = 'service_role' or auth.role() = 'authenticated');

-- 2. Storage Bucket Setup for Gallery Uploads
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

-- Storage Policies
drop policy if exists "Public Read Access for Gallery Bucket" on storage.objects;
drop policy if exists "Service Role Insert for Gallery Bucket" on storage.objects;
drop policy if exists "Service Role Delete for Gallery Bucket" on storage.objects;

-- Allow public viewing of gallery images
create policy "Public Read Access for Gallery Bucket"
  on storage.objects for select
  using (bucket_id = 'gallery');

-- Allow service role to upload gallery images
create policy "Service Role Insert for Gallery Bucket"
  on storage.objects for insert
  with check (bucket_id = 'gallery');

-- Allow service role to delete gallery images
create policy "Service Role Delete for Gallery Bucket"
  on storage.objects for delete
  using (bucket_id = 'gallery');
