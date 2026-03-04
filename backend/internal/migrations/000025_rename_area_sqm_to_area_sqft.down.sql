UPDATE lots SET area_sqft = ROUND(area_sqft / 10.7639, 2);
ALTER TABLE lots RENAME COLUMN area_sqft TO area_sqm;
