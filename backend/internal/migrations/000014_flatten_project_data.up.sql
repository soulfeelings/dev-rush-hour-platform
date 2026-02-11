-- Add structured columns to projects table
ALTER TABLE projects
  ADD COLUMN description JSONB,
  ADD COLUMN media JSONB,
  ADD COLUMN features_amenities TEXT[] DEFAULT '{}',
  ADD COLUMN tags TEXT[] DEFAULT '{}',
  ADD COLUMN is_featured BOOLEAN DEFAULT false,
  ADD COLUMN youtube_url TEXT,
  ADD COLUMN roi DECIMAL(10,2),
  ADD COLUMN our_price DECIMAL(15,2),
  ADD COLUMN developer_price DECIMAL(15,2),
  ADD COLUMN payment_plan VARCHAR(50),
  ADD COLUMN completion_date VARCHAR(20),
  ADD COLUMN price_from DECIMAL(15,2),
  ADD COLUMN currency VARCHAR(10) DEFAULT 'AED',
  ADD COLUMN property_types TEXT[] DEFAULT '{}',
  ADD COLUMN bedrooms TEXT[] DEFAULT '{}',
  ADD COLUMN area_size DECIMAL(10,2),
  ADD COLUMN area_unit VARCHAR(20),
  ADD COLUMN prices_by_type JSONB,
  ADD COLUMN timeline_announcement TIMESTAMPTZ,
  ADD COLUMN timeline_booking_started TIMESTAMPTZ,
  ADD COLUMN timeline_construction_started TIMESTAMPTZ,
  ADD COLUMN timeline_construction_progress TIMESTAMPTZ,
  ADD COLUMN timeline_construction_progress_pct INT,
  ADD COLUMN timeline_expected_completion TIMESTAMPTZ;

-- Copy data from JSONB to new columns
UPDATE projects SET
  description = data->'description',
  media = data->'media',
  features_amenities = COALESCE(
    (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(data->'featuresAmenities') AS elem),
    '{}'
  ),
  tags = COALESCE(
    (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(data->'tags') AS elem),
    '{}'
  ),
  is_featured = COALESCE((data->>'isFeatured')::boolean, false),
  youtube_url = data->>'youtubeUrl',
  roi = (data->>'roi')::decimal,
  our_price = (data->>'ourPrice')::decimal,
  developer_price = (data->>'developerPrice')::decimal,
  payment_plan = data->>'paymentPlan',
  completion_date = COALESCE(data->>'completionDate', data->'specs'->>'completionDate'),
  price_from = (data->'specs'->>'priceFrom')::decimal,
  currency = COALESCE(data->'specs'->>'currency', 'AED'),
  property_types = COALESCE(
    (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(data->'specs'->'types') AS elem),
    '{}'
  ),
  bedrooms = COALESCE(
    (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(data->'specs'->'bedrooms') AS elem),
    '{}'
  ),
  area_size = (data->'specs'->>'area')::decimal,
  area_unit = data->'specs'->>'areaUnit',
  prices_by_type = data->'specs'->'pricesByType',
  timeline_announcement = (data->'timeline'->>'projectAnnouncement')::timestamptz,
  timeline_booking_started = (data->'timeline'->>'bookingStarted')::timestamptz,
  timeline_construction_started = (data->'timeline'->>'constructionStarted')::timestamptz,
  timeline_construction_progress = (data->'timeline'->>'constructionProgress')::timestamptz,
  timeline_construction_progress_pct = (data->'timeline'->>'constructionProgressPercent')::int,
  timeline_expected_completion = (data->'timeline'->>'expectedCompletion')::timestamptz
WHERE data IS NOT NULL;

-- Drop the old JSONB column
ALTER TABLE projects DROP COLUMN data;
