-- Recreate the JSONB data column
ALTER TABLE projects ADD COLUMN data JSONB DEFAULT '{}';

-- Rebuild JSONB from structured columns
UPDATE projects SET data = jsonb_build_object(
  'description', description,
  'media', media,
  'featuresAmenities', COALESCE(to_jsonb(features_amenities), '[]'::jsonb),
  'tags', COALESCE(to_jsonb(tags), '[]'::jsonb),
  'isFeatured', COALESCE(is_featured, false),
  'youtubeUrl', youtube_url,
  'roi', roi,
  'ourPrice', our_price,
  'developerPrice', developer_price,
  'paymentPlan', payment_plan,
  'completionDate', completion_date,
  'specs', jsonb_build_object(
    'priceFrom', price_from,
    'currency', COALESCE(currency, 'AED'),
    'types', COALESCE(to_jsonb(property_types), '[]'::jsonb),
    'bedrooms', COALESCE(to_jsonb(bedrooms), '[]'::jsonb),
    'area', area_size,
    'areaUnit', area_unit,
    'pricesByType', COALESCE(prices_by_type, '[]'::jsonb)
  ),
  'timeline', CASE WHEN timeline_announcement IS NOT NULL OR timeline_booking_started IS NOT NULL
    OR timeline_construction_started IS NOT NULL OR timeline_construction_progress IS NOT NULL
    OR timeline_expected_completion IS NOT NULL THEN
    jsonb_build_object(
      'projectAnnouncement', timeline_announcement,
      'bookingStarted', timeline_booking_started,
      'constructionStarted', timeline_construction_started,
      'constructionProgress', timeline_construction_progress,
      'constructionProgressPercent', timeline_construction_progress_pct,
      'expectedCompletion', timeline_expected_completion
    )
  ELSE NULL END
);

-- Drop all new columns
ALTER TABLE projects
  DROP COLUMN description,
  DROP COLUMN media,
  DROP COLUMN features_amenities,
  DROP COLUMN tags,
  DROP COLUMN is_featured,
  DROP COLUMN youtube_url,
  DROP COLUMN roi,
  DROP COLUMN our_price,
  DROP COLUMN developer_price,
  DROP COLUMN payment_plan,
  DROP COLUMN completion_date,
  DROP COLUMN price_from,
  DROP COLUMN currency,
  DROP COLUMN property_types,
  DROP COLUMN bedrooms,
  DROP COLUMN area_size,
  DROP COLUMN area_unit,
  DROP COLUMN prices_by_type,
  DROP COLUMN timeline_announcement,
  DROP COLUMN timeline_booking_started,
  DROP COLUMN timeline_construction_started,
  DROP COLUMN timeline_construction_progress,
  DROP COLUMN timeline_construction_progress_pct,
  DROP COLUMN timeline_expected_completion;
