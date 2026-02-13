CREATE TABLE IF NOT EXISTS schema_migrations (version bigint primary key, dirty boolean);
-- No-op migration for fixing state
