-- Remove discount field from data.specs in projects table
-- Discount is now calculated dynamically from ourPrice and developerPrice
UPDATE projects
SET data = jsonb_set(
    data,
    '{specs}',
    (data->'specs') - 'discount'
)
WHERE data->'specs' IS NOT NULL 
  AND data->'specs' ? 'discount';
