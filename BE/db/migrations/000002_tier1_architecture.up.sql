-- Add Draft System features
ALTER TABLE article_models ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE article_models ADD COLUMN read_time INTEGER DEFAULT 0;

-- Add TSVector for Full Text Search
ALTER TABLE article_models ADD COLUMN search_vector tsvector;
UPDATE article_models SET search_vector = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''));
CREATE INDEX idx_article_search ON article_models USING GIN(search_vector);

-- Add Composite Index for trending/author pages
CREATE INDEX idx_author_created ON article_models (author_id, created_at);

-- Create table for article revisions
CREATE TABLE article_versions (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES article_models(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    body TEXT,
    snapshot TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for slug history to support 301 redirects
CREATE TABLE slug_history (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES article_models(id) ON DELETE CASCADE,
    previous_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
