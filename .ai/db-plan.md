# Database Schema Design

## Tables


### users
# This users table is managed by Supabase Auth.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    preferences JSONB DEFAULT '{}'::jsonb
);
```

### books
```sql
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    cover_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    CONSTRAINT books_title_author_unique UNIQUE (title, author)
);
```

### book_statuses
```sql
CREATE TABLE book_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('want_to_read', 'reading', 'finished')),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT book_statuses_unique UNIQUE (book_id, user_id)
);
```

### ratings
```sql
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ratings_unique UNIQUE (book_id, user_id)
);
```

### notes
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### tags
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### tag_aliases
```sql
CREATE TABLE tag_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    alias TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### book_tags
```sql
CREATE TABLE book_tags (
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (book_id, tag_id)
);
```

## Indexes

```sql
-- Books search optimization
CREATE INDEX idx_books_title_gin ON books USING GIN (to_tsvector('english', title));
CREATE INDEX idx_books_author_gin ON books USING GIN (to_tsvector('english', author));

-- Book statuses optimization
CREATE INDEX idx_book_statuses_user_status ON book_statuses(user_id, status);
CREATE INDEX idx_book_statuses_book ON book_statuses(book_id);

-- Ratings optimization
CREATE INDEX idx_ratings_book ON ratings(book_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);

-- Notes optimization
CREATE INDEX idx_notes_book ON notes(book_id);
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_content_gin ON notes USING GIN (to_tsvector('english', content));

-- Tags optimization
CREATE INDEX idx_tags_name_gin ON tags USING GIN (to_tsvector('english', name));
CREATE INDEX idx_tag_aliases_alias_gin ON tag_aliases USING GIN (to_tsvector('english', alias));
```

## Materialized Views

```sql
-- User reading statistics
CREATE MATERIALIZED VIEW user_reading_stats AS
SELECT 
    user_id,
    COUNT(*) FILTER (WHERE status = 'want_to_read') as want_to_read_count,
    COUNT(*) FILTER (WHERE status = 'reading') as reading_count,
    COUNT(*) FILTER (WHERE status = 'finished') as finished_count,
    AVG(r.rating) FILTER (WHERE r.rating IS NOT NULL) as average_rating
FROM book_statuses bs
LEFT JOIN ratings r ON bs.book_id = r.book_id AND bs.user_id = r.user_id
GROUP BY user_id;

-- Book popularity statistics
CREATE MATERIALIZED VIEW book_popularity_stats AS
SELECT 
    b.id as book_id,
    b.title,
    b.author,
    COUNT(DISTINCT bs.user_id) FILTER (WHERE bs.status = 'want_to_read') as want_to_read_count,
    COUNT(DISTINCT bs.user_id) FILTER (WHERE bs.status = 'reading') as reading_count,
    COUNT(DISTINCT bs.user_id) FILTER (WHERE bs.status = 'finished') as finished_count,
    AVG(r.rating) as average_rating,
    COUNT(DISTINCT n.id) as notes_count
FROM books b
LEFT JOIN book_statuses bs ON b.id = bs.book_id
LEFT JOIN ratings r ON b.id = r.book_id
LEFT JOIN notes n ON b.id = n.book_id
GROUP BY b.id, b.title, b.author;
```

## Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select ON users FOR SELECT USING (true);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (true);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

-- Books policies
CREATE POLICY books_select ON books FOR SELECT USING (true);
CREATE POLICY books_insert ON books FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY books_update ON books FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY books_delete ON books FOR DELETE USING (auth.uid() = created_by);

-- Book statuses policies
CREATE POLICY book_statuses_select ON book_statuses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY book_statuses_insert ON book_statuses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY book_statuses_update ON book_statuses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY book_statuses_delete ON book_statuses FOR DELETE USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY ratings_select ON ratings FOR SELECT USING (true);
CREATE POLICY ratings_insert ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY ratings_update ON ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY ratings_delete ON ratings FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY notes_select ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notes_insert ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY notes_update ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY notes_delete ON notes FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY tags_select ON tags FOR SELECT USING (true);
CREATE POLICY tags_insert ON tags FOR INSERT WITH CHECK (true);
CREATE POLICY tags_update ON tags FOR UPDATE USING (true);
CREATE POLICY tags_delete ON tags FOR DELETE USING (true);

-- Tag aliases policies
CREATE POLICY tag_aliases_select ON tag_aliases FOR SELECT USING (true);
CREATE POLICY tag_aliases_insert ON tag_aliases FOR INSERT WITH CHECK (true);
CREATE POLICY tag_aliases_update ON tag_aliases FOR UPDATE USING (true);
CREATE POLICY tag_aliases_delete ON tag_aliases FOR DELETE USING (true);

-- Book tags policies
CREATE POLICY book_tags_select ON book_tags FOR SELECT USING (true);
CREATE POLICY book_tags_insert ON book_tags FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE id = book_id AND created_by = auth.uid())
);
CREATE POLICY book_tags_delete ON book_tags FOR DELETE USING (
    EXISTS (SELECT 1 FROM books WHERE id = book_id AND created_by = auth.uid())
);
```

## Triggers

```sql
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_statuses_updated_at
    BEFORE UPDATE ON book_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tag_aliases_updated_at
    BEFORE UPDATE ON tag_aliases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Limit tags per book
CREATE OR REPLACE FUNCTION check_book_tags_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM book_tags WHERE book_id = NEW.book_id) >= 3 THEN
        RAISE EXCEPTION 'Maximum of 3 tags allowed per book';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER enforce_book_tags_limit
    BEFORE INSERT ON book_tags
    FOR EACH ROW
    EXECUTE FUNCTION check_book_tags_limit();
```

## Additional Notes

1. The schema uses UUID as primary keys for better distribution and security
2. All tables include created_at and updated_at timestamps for tracking
3. GIN indexes are used for full-text search capabilities
4. Materialized views are used for statistics to improve query performance
5. RLS policies ensure data security at the row level
6. Triggers maintain data integrity and enforce business rules
7. The tag system supports aliases and limits books to 3 tags
8. User preferences are stored in JSONB format for flexibility
9. All tables have appropriate foreign key constraints
10. The schema supports all MVP requirements while maintaining scalability 