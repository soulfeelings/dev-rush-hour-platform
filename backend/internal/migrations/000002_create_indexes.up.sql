-- Indexes for lots table
CREATE INDEX idx_lots_project_id ON lots(project_id);
CREATE INDEX idx_lots_area_id ON lots(area_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_type ON lots(type);
CREATE INDEX idx_lots_bedrooms ON lots(bedrooms);
CREATE INDEX idx_lots_price_amount ON lots(price_amount);
CREATE INDEX idx_lots_area_sqm ON lots(area_sqm);
CREATE INDEX idx_lots_bonus_keys ON lots USING GIN(bonus_keys);
CREATE INDEX idx_lots_composite_list ON lots(status, area_id, type, bedrooms, price_amount);
CREATE INDEX idx_lots_data_gin ON lots USING GIN(data jsonb_path_ops);

-- Deduplicate lots by business key and prevent further duplicates
WITH ranked AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY project_id, type, bedrooms, bathrooms, area_sqm, floor, price_amount
            ORDER BY created_at ASC, id ASC
        ) AS rn
    FROM lots
)
DELETE FROM lots l
USING ranked r
WHERE l.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_lots_project_spec
ON lots (project_id, type, bedrooms, bathrooms, area_sqm, floor, price_amount);

-- Indexes for projects table
CREATE INDEX idx_projects_developer_id ON projects(developer_id);
CREATE INDEX idx_projects_area_id ON projects(area_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Indexes for areas table
CREATE INDEX idx_areas_city ON areas(city);

-- Indexes for leads table
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_project_id ON leads(project_id);
CREATE INDEX idx_leads_lot_id ON leads(lot_id);
CREATE INDEX idx_leads_created_at_desc ON leads(created_at DESC);

