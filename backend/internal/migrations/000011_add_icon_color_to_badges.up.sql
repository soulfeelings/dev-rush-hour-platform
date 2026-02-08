-- Add icon_color column to badges table
ALTER TABLE badges ADD COLUMN icon_color VARCHAR(50) DEFAULT '#FFD400';
