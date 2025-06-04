-- ============================================================================
-- Migration: Initial Booklo Database Schema
-- Created: 2024-12-20 18:00:00 UTC
-- Purpose: Create complete database schema for book tracking application
-- 
-- This migration creates:
-- - Core tables: books, book_statuses, ratings, notes, tags, tag_aliases, book_tags
-- - Full-text search indexes using GIN
-- - Row Level Security policies for all tables
-- - Materialized views for statistics
-- - Triggers for data integrity and timestamp management
-- 
-- Affected tables: All core application tables (new)
-- Special considerations: Enables RLS on all tables, creates comprehensive policies
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- books table: stores book information
-- note: users table is managed by supabase auth, so we reference auth.users()
create table books (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    author text not null,
    isbn text,
    cover_url text,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid not null references auth.users(id),
    constraint books_title_author_unique unique (title, author)
);

-- book_statuses table: tracks reading status for each user-book combination
create table book_statuses (
    id uuid primary key default gen_random_uuid(),
    book_id uuid not null references books(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    status text not null check (status in ('want_to_read', 'reading', 'finished')),
    started_at timestamptz,
    finished_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint book_statuses_unique unique (book_id, user_id)
);

-- ratings table: stores user ratings for books (1-5 scale)
create table ratings (
    id uuid primary key default gen_random_uuid(),
    book_id uuid not null references books(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ratings_unique unique (book_id, user_id)
);

-- notes table: stores user notes about books
create table notes (
    id uuid primary key default gen_random_uuid(),
    book_id uuid not null references books(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- tags table: stores unique tag names for categorizing books
create table tags (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- tag_aliases table: stores alternative names for tags to improve search
create table tag_aliases (
    id uuid primary key default gen_random_uuid(),
    tag_id uuid not null references tags(id) on delete cascade,
    alias text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- book_tags table: many-to-many relationship between books and tags
create table book_tags (
    book_id uuid not null references books(id) on delete cascade,
    tag_id uuid not null references tags(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (book_id, tag_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- full-text search indexes for books
create index idx_books_title_gin on books using gin (to_tsvector('english', title));
create index idx_books_author_gin on books using gin (to_tsvector('english', author));

-- book statuses optimization for user queries and status filtering
create index idx_book_statuses_user_status on book_statuses(user_id, status);
create index idx_book_statuses_book on book_statuses(book_id);

-- ratings optimization for book and user queries
create index idx_ratings_book on ratings(book_id);
create index idx_ratings_user on ratings(user_id);

-- notes optimization for book and user queries, plus full-text search
create index idx_notes_book on notes(book_id);
create index idx_notes_user on notes(user_id);
create index idx_notes_content_gin on notes using gin (to_tsvector('english', content));

-- tags optimization for search functionality
create index idx_tags_name_gin on tags using gin (to_tsvector('english', name));
create index idx_tag_aliases_alias_gin on tag_aliases using gin (to_tsvector('english', alias));

-- ============================================================================
-- ROW LEVEL SECURITY SETUP
-- ============================================================================

-- enable rls on all tables for security
alter table books enable row level security;
alter table book_statuses enable row level security;
alter table ratings enable row level security;
alter table notes enable row level security;
alter table tags enable row level security;
alter table tag_aliases enable row level security;
alter table book_tags enable row level security;

-- ============================================================================
-- RLS POLICIES FOR BOOKS TABLE
-- ============================================================================

-- books select policy: anyone can view all books (public catalog)
create policy books_select_anon on books
    for select
    to anon
    using (true);

create policy books_select_authenticated on books
    for select
    to authenticated
    using (true);

-- books insert policy: only authenticated users can add books
create policy books_insert_authenticated on books
    for insert
    to authenticated
    with check (auth.uid() = created_by);

-- books update policy: only book creator can update
create policy books_update_authenticated on books
    for update
    to authenticated
    using (auth.uid() = created_by);

-- books delete policy: only book creator can delete
create policy books_delete_authenticated on books
    for delete
    to authenticated
    using (auth.uid() = created_by);

-- ============================================================================
-- RLS POLICIES FOR BOOK_STATUSES TABLE
-- ============================================================================

-- book_statuses select policy: users can only see their own statuses
create policy book_statuses_select_authenticated on book_statuses
    for select
    to authenticated
    using (auth.uid() = user_id);

-- book_statuses insert policy: users can only create their own statuses
create policy book_statuses_insert_authenticated on book_statuses
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- book_statuses update policy: users can only update their own statuses
create policy book_statuses_update_authenticated on book_statuses
    for update
    to authenticated
    using (auth.uid() = user_id);

-- book_statuses delete policy: users can only delete their own statuses
create policy book_statuses_delete_authenticated on book_statuses
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR RATINGS TABLE
-- ============================================================================

-- ratings select policy: anyone can view all ratings (public ratings)
create policy ratings_select_anon on ratings
    for select
    to anon
    using (true);

create policy ratings_select_authenticated on ratings
    for select
    to authenticated
    using (true);

-- ratings insert policy: only authenticated users can rate books
create policy ratings_insert_authenticated on ratings
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- ratings update policy: users can only update their own ratings
create policy ratings_update_authenticated on ratings
    for update
    to authenticated
    using (auth.uid() = user_id);

-- ratings delete policy: users can only delete their own ratings
create policy ratings_delete_authenticated on ratings
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR NOTES TABLE
-- ============================================================================

-- notes select policy: users can only see their own notes (private)
create policy notes_select_authenticated on notes
    for select
    to authenticated
    using (auth.uid() = user_id);

-- notes insert policy: users can only create their own notes
create policy notes_insert_authenticated on notes
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- notes update policy: users can only update their own notes
create policy notes_update_authenticated on notes
    for update
    to authenticated
    using (auth.uid() = user_id);

-- notes delete policy: users can only delete their own notes
create policy notes_delete_authenticated on notes
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR TAGS TABLE
-- ============================================================================

-- tags select policy: anyone can view all tags (public taxonomy)
create policy tags_select_anon on tags
    for select
    to anon
    using (true);

create policy tags_select_authenticated on tags
    for select
    to authenticated
    using (true);

-- tags insert policy: any authenticated user can create tags (collaborative)
create policy tags_insert_authenticated on tags
    for insert
    to authenticated
    with check (true);

-- tags update policy: any authenticated user can update tags (collaborative)
create policy tags_update_authenticated on tags
    for update
    to authenticated
    using (true);

-- tags delete policy: any authenticated user can delete tags (collaborative)
create policy tags_delete_authenticated on tags
    for delete
    to authenticated
    using (true);

-- ============================================================================
-- RLS POLICIES FOR TAG_ALIASES TABLE
-- ============================================================================

-- tag_aliases select policy: anyone can view all aliases (public)
create policy tag_aliases_select_anon on tag_aliases
    for select
    to anon
    using (true);

create policy tag_aliases_select_authenticated on tag_aliases
    for select
    to authenticated
    using (true);

-- tag_aliases insert policy: any authenticated user can create aliases
create policy tag_aliases_insert_authenticated on tag_aliases
    for insert
    to authenticated
    with check (true);

-- tag_aliases update policy: any authenticated user can update aliases
create policy tag_aliases_update_authenticated on tag_aliases
    for update
    to authenticated
    using (true);

-- tag_aliases delete policy: any authenticated user can delete aliases
create policy tag_aliases_delete_authenticated on tag_aliases
    for delete
    to authenticated
    using (true);

-- ============================================================================
-- RLS POLICIES FOR BOOK_TAGS TABLE
-- ============================================================================

-- book_tags select policy: anyone can view book-tag relationships (public)
create policy book_tags_select_anon on book_tags
    for select
    to anon
    using (true);

create policy book_tags_select_authenticated on book_tags
    for select
    to authenticated
    using (true);

-- book_tags insert policy: only book creator can tag their books
create policy book_tags_insert_authenticated on book_tags
    for insert
    to authenticated
    with check (
        exists (select 1 from books where id = book_id and created_by = auth.uid())
    );

-- book_tags delete policy: only book creator can remove tags from their books
create policy book_tags_delete_authenticated on book_tags
    for delete
    to authenticated
    using (
        exists (select 1 from books where id = book_id and created_by = auth.uid())
    );

-- ============================================================================
-- TRIGGERS FOR DATA INTEGRITY AND AUTOMATION
-- ============================================================================

-- function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- create triggers for all tables with updated_at column
create trigger update_books_updated_at
    before update on books
    for each row
    execute function update_updated_at_column();

create trigger update_book_statuses_updated_at
    before update on book_statuses
    for each row
    execute function update_updated_at_column();

create trigger update_ratings_updated_at
    before update on ratings
    for each row
    execute function update_updated_at_column();

create trigger update_notes_updated_at
    before update on notes
    for each row
    execute function update_updated_at_column();

create trigger update_tags_updated_at
    before update on tags
    for each row
    execute function update_updated_at_column();

create trigger update_tag_aliases_updated_at
    before update on tag_aliases
    for each row
    execute function update_updated_at_column();

-- function to limit tags per book (business rule: max 3 tags per book)
create or replace function check_book_tags_limit()
returns trigger as $$
begin
    if (select count(*) from book_tags where book_id = new.book_id) >= 3 then
        raise exception 'maximum of 3 tags allowed per book';
    end if;
    return new;
end;
$$ language 'plpgsql';

-- trigger to enforce book tags limit
create trigger enforce_book_tags_limit
    before insert on book_tags
    for each row
    execute function check_book_tags_limit();

-- ============================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================================================

-- user reading statistics view for dashboard analytics
create materialized view user_reading_stats as
select 
    bs.user_id,
    count(*) filter (where bs.status = 'want_to_read') as want_to_read_count,
    count(*) filter (where bs.status = 'reading') as reading_count,
    count(*) filter (where bs.status = 'finished') as finished_count,
    avg(r.rating) filter (where r.rating is not null) as average_rating
from book_statuses bs
left join ratings r on bs.book_id = r.book_id and bs.user_id = r.user_id
group by bs.user_id;

-- book popularity statistics view for recommendations and trending
create materialized view book_popularity_stats as
select 
    b.id as book_id,
    b.title,
    b.author,
    count(distinct bs.user_id) filter (where bs.status = 'want_to_read') as want_to_read_count,
    count(distinct bs.user_id) filter (where bs.status = 'reading') as reading_count,
    count(distinct bs.user_id) filter (where bs.status = 'finished') as finished_count,
    avg(r.rating) as average_rating,
    count(distinct n.id) as notes_count
from books b
left join book_statuses bs on b.id = bs.book_id
left join ratings r on b.id = r.book_id
left join notes n on b.id = n.book_id
group by b.id, b.title, b.author;

-- ============================================================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- ============================================================================

-- function to refresh user reading stats (call periodically or on data changes)
create or replace function refresh_user_reading_stats()
returns void as $$
begin
    refresh materialized view user_reading_stats;
end;
$$ language 'plpgsql';

-- function to refresh book popularity stats (call periodically or on data changes)
create or replace function refresh_book_popularity_stats()
returns void as $$
begin
    refresh materialized view book_popularity_stats;
end;
$$ language 'plpgsql';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- this migration creates a complete, secure, and performant database schema
-- for the booklo book tracking application with:
-- - proper referential integrity
-- - comprehensive security policies
-- - optimized indexes for search and queries
-- - automated timestamp management
-- - business rule enforcement
-- - performance-optimized materialized views 