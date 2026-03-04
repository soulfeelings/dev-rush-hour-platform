ALTER TABLE lots RENAME COLUMN area_sqm TO area_sqft;
UPDATE lots SET area_sqft = ROUND(area_sqft * 10.7639, 2);
