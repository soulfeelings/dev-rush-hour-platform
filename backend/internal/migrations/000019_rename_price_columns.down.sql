-- Revert price column renames (idempotent)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'price_from_us'
    ) THEN
        ALTER TABLE projects RENAME COLUMN price_from_us TO our_price;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'price_from_developer'
    ) THEN
        ALTER TABLE projects RENAME COLUMN price_from_developer TO developer_price;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lots' AND column_name = 'price_from_us'
    ) THEN
        ALTER TABLE lots RENAME COLUMN price_from_us TO price_amount;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lots' AND column_name = 'price_from_developer'
    ) THEN
        ALTER TABLE lots RENAME COLUMN price_from_developer TO developer_price;
    END IF;
END $$;