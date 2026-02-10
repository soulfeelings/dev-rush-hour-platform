-- Recreate lot_badges junction table
CREATE TABLE IF NOT EXISTS lot_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lot_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_lot_badges_lot_id ON lot_badges(lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_badges_badge_id ON lot_badges(badge_id);

-- Migrate data back from badge_ids column
INSERT INTO lot_badges (lot_id, badge_id, sort_order)
SELECT l.id, unnest(l.badge_ids), generate_series(1, array_length(l.badge_ids, 1))
FROM lots l
WHERE l.badge_ids IS NOT NULL AND array_length(l.badge_ids, 1) > 0
ON CONFLICT (lot_id, badge_id) DO NOTHING;

-- Drop badge_ids column
ALTER TABLE lots DROP COLUMN badge_ids;
