-- Remove projects inserted from mockProperties
DELETE FROM projects WHERE slug IN (
    'sea-legend-tower-one',
    'colibri-views',
    'luz-ora-residences',
    'palm-jumeirah-residence',
    'downtown-dubai-tower'
);

-- Remove areas inserted from mockProperties
DELETE FROM areas WHERE slug IN (
    'dubai-marina',
    'al-jazeera-al-hamra-industrial',
    'dubai-islands',
    'palm-jumeirah',
    'downtown-dubai'
);

-- Remove developers inserted from mockProperties
DELETE FROM developers WHERE slug IN (
    'segrex-development-llc',
    'major-developments',
    'dia-developments',
    'emaar-properties'
);
