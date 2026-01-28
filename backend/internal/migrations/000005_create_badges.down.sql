-- Drop indexes
DROP INDEX IF EXISTS idx_lot_badges_badge_id;
DROP INDEX IF EXISTS idx_lot_badges_lot_id;
DROP INDEX IF EXISTS idx_project_badges_badge_id;
DROP INDEX IF EXISTS idx_project_badges_project_id;
DROP INDEX IF EXISTS idx_badges_sort_order;
DROP INDEX IF EXISTS idx_badges_status;

-- Drop junction tables
DROP TABLE IF EXISTS lot_badges;
DROP TABLE IF EXISTS project_badges;

-- Drop badges table
DROP TABLE IF EXISTS badges;
