-- Create badges table for project/lot badges
CREATE TABLE badges (
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

-- Create junction table for project badges
CREATE TABLE project_badges (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, badge_id)
);

-- Create junction table for lot badges
CREATE TABLE lot_badges (
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (lot_id, badge_id)
);

-- Create indexes for performance
CREATE INDEX idx_badges_status ON badges(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_badges_sort_order ON badges(sort_order);
CREATE INDEX idx_project_badges_project_id ON project_badges(project_id);
CREATE INDEX idx_project_badges_badge_id ON project_badges(badge_id);
CREATE INDEX idx_lot_badges_lot_id ON lot_badges(lot_id);
CREATE INDEX idx_lot_badges_badge_id ON lot_badges(badge_id);
