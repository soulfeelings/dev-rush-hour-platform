-- Create cities table
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add city_id column to areas table
ALTER TABLE areas ADD COLUMN city_id UUID REFERENCES cities(id) ON DELETE SET NULL;

-- Create index for city_id
CREATE INDEX idx_areas_city_id ON areas(city_id);

-- Create index for deleted_at
CREATE INDEX idx_cities_deleted_at ON cities(deleted_at);

-- Migrate data: extract unique cities from areas.city and create city records
INSERT INTO cities (slug, name, status, created_at, updated_at)
SELECT DISTINCT
    LOWER(REPLACE(REPLACE(REPLACE(city, ' ', '-'), '''', ''), '.', '')) as slug,
    city as name,
    'active' as status,
    NOW() as created_at,
    NOW() as updated_at
FROM areas
WHERE city IS NOT NULL AND city != ''
ON CONFLICT (slug) DO NOTHING;

-- Update areas.city_id based on matching city names
UPDATE areas a
SET city_id = c.id
FROM cities c
WHERE LOWER(REPLACE(REPLACE(REPLACE(a.city, ' ', '-'), '''', ''), '.', '')) = c.slug;
