-- Restore default values (rollback migration)

-- developers table
ALTER TABLE developers ALTER COLUMN status SET DEFAULT 'active';

-- areas table
ALTER TABLE areas ALTER COLUMN status SET DEFAULT 'active';

-- projects table
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'active';

-- lots table
ALTER TABLE lots ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE lots ALTER COLUMN price_currency SET DEFAULT 'AED';

-- leads table
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'new';

-- cities table
ALTER TABLE cities ALTER COLUMN status SET DEFAULT 'active';

-- badges table
ALTER TABLE badges ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE badges ALTER COLUMN background_color SET DEFAULT '#000000';
ALTER TABLE badges ALTER COLUMN text_color SET DEFAULT '#FFFFFF';
ALTER TABLE badges ALTER COLUMN sort_order SET DEFAULT 0;

-- project_badges table
ALTER TABLE project_badges ALTER COLUMN sort_order SET DEFAULT 0;

-- lot_badges table
ALTER TABLE lot_badges ALTER COLUMN sort_order SET DEFAULT 0;
