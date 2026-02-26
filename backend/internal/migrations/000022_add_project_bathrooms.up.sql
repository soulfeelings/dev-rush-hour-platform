ALTER TABLE projects ADD COLUMN IF NOT EXISTS bathrooms TEXT[] DEFAULT '{}';

UPDATE projects SET bathrooms = (
    SELECT COALESCE(ARRAY_AGG(DISTINCT l.bathrooms::text), '{}')
    FROM lots l
    WHERE l.project_id = projects.id
      AND l.deleted_at IS NULL
      AND l.bathrooms IS NOT NULL
);
