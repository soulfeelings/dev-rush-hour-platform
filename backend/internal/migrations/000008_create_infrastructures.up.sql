-- Create infrastructures table
CREATE TABLE infrastructures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    background_color VARCHAR(50) NOT NULL DEFAULT '#000000',
    text_color VARCHAR(50) NOT NULL DEFAULT '#FFFFFF',
    icon VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_infrastructures_status ON infrastructures(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_infrastructures_sort_order ON infrastructures(sort_order);
