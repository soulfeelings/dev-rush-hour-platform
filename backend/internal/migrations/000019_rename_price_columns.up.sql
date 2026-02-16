-- Rename price columns for clarity (idempotent)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'our_price'
    ) THEN
        ALTER TABLE projects RENAME COLUMN our_price TO price_from_us;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'developer_price'
    ) THEN
        ALTER TABLE projects RENAME COLUMN developer_price TO price_from_developer;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lots' AND column_name = 'price_amount'
    ) THEN
        ALTER TABLE lots RENAME COLUMN price_amount TO price_from_us;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lots' AND column_name = 'developer_price'
    ) THEN
        ALTER TABLE lots RENAME COLUMN developer_price TO price_from_developer;
    END IF;
END $$;