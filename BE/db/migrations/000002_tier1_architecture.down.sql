DROP TABLE IF EXISTS slug_history;
DROP TABLE IF EXISTS article_versions;

DROP INDEX IF EXISTS idx_author_created;
DROP INDEX IF EXISTS idx_article_search;

ALTER TABLE article_models DROP COLUMN search_vector;
ALTER TABLE article_models DROP COLUMN read_time;
ALTER TABLE article_models DROP COLUMN status;
