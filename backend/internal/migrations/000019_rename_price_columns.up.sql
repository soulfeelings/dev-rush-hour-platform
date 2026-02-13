-- Rename price columns for clarity
ALTER TABLE projects RENAME COLUMN our_price TO price_from_us;
ALTER TABLE projects RENAME COLUMN developer_price TO price_from_developer;
ALTER TABLE lots RENAME COLUMN price_amount TO price_from_us;
ALTER TABLE lots RENAME COLUMN developer_price TO price_from_developer;
