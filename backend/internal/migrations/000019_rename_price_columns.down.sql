-- Revert price column renames
ALTER TABLE projects RENAME COLUMN price_from_us TO our_price;
ALTER TABLE projects RENAME COLUMN price_from_developer TO developer_price;
ALTER TABLE lots RENAME COLUMN price_from_us TO price_amount;
ALTER TABLE lots RENAME COLUMN price_from_developer TO developer_price;
