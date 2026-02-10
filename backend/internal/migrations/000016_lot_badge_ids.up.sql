-- Add badge_ids column to lots table
ALTER TABLE lots ADD COLUMN badge_ids UUID[] DEFAULT '{}';

-- Migrate data from lot_badges junction table
UPDATE lots SET badge_ids = (
    SELECT COALESCE(array_agg(lb.badge_id ORDER BY lb.sort_order), '{}')
    FROM lot_badges lb
    WHERE lb.lot_id = lots.id
);

-- Drop lot_badges junction table
DROP TABLE IF EXISTS lot_badges;
