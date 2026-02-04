-- Create media table for file storage management
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_key TEXT NOT NULL UNIQUE,
    original_name TEXT,
    mime_type TEXT NOT NULL,
    ext TEXT NOT NULL,
    size_bytes BIGINT,
    storage_driver TEXT NOT NULL CHECK (storage_driver IN ('local', 's3')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for common queries
CREATE INDEX idx_media_status ON media(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_created_at ON media(created_at);
CREATE INDEX idx_media_deleted_at ON media(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_media_storage_driver ON media(storage_driver) WHERE deleted_at IS NULL;
