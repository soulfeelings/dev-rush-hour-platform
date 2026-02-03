-- Remove default values from business fields
-- Admin must explicitly provide these values in the admin panel

-- developers table
ALTER TABLE developers ALTER COLUMN status DROP DEFAULT;

-- areas table
ALTER TABLE areas ALTER COLUMN status DROP DEFAULT;

-- projects table
ALTER TABLE projects ALTER COLUMN status DROP DEFAULT;

-- lots table
ALTER TABLE lots ALTER COLUMN status DROP DEFAULT;
ALTER TABLE lots ALTER COLUMN price_currency DROP DEFAULT;

-- leads table
ALTER TABLE leads ALTER COLUMN status DROP DEFAULT;

-- cities table
ALTER TABLE cities ALTER COLUMN status DROP DEFAULT;

-- badges table
ALTER TABLE badges ALTER COLUMN status DROP DEFAULT;
ALTER TABLE badges ALTER COLUMN background_color DROP DEFAULT;
ALTER TABLE badges ALTER COLUMN text_color DROP DEFAULT;
ALTER TABLE badges ALTER COLUMN sort_order DROP DEFAULT;

-- project_badges table
ALTER TABLE project_badges ALTER COLUMN sort_order DROP DEFAULT;

-- lot_badges table
ALTER TABLE lot_badges ALTER COLUMN sort_order DROP DEFAULT;
