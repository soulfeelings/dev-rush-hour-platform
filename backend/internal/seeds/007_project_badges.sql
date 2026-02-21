-- Seed project badges
INSERT INTO project_badges (project_id, badge_id, sort_order) VALUES
-- Sea Legend Tower One badges
((SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'), (SELECT id FROM badges WHERE slug = '1-year-service-charge'), 1),
((SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'), (SELECT id FROM badges WHERE slug = 'fully-furniture'), 2),
((SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'), (SELECT id FROM badges WHERE slug = 'special-price'), 3),
-- Colibri Views badges
((SELECT id FROM projects WHERE slug = 'colibri-views'), (SELECT id FROM badges WHERE slug = 'new-project'), 1),
((SELECT id FROM projects WHERE slug = 'colibri-views'), (SELECT id FROM badges WHERE slug = 'pool-view'), 2),
-- Luz Ora Residences badges
((SELECT id FROM projects WHERE slug = 'luz-ora-residences'), (SELECT id FROM badges WHERE slug = 'sea-view'), 1),
((SELECT id FROM projects WHERE slug = 'luz-ora-residences'), (SELECT id FROM badges WHERE slug = 'golden-visa'), 2),
-- Palm Jumeirah Residence badges
((SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'), (SELECT id FROM badges WHERE slug = 'sea-view'), 1),
((SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'), (SELECT id FROM badges WHERE slug = 'special-price'), 2),
((SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'), (SELECT id FROM badges WHERE slug = 'golden-visa'), 3),
-- Downtown Dubai Tower badges
((SELECT id FROM projects WHERE slug = 'downtown-dubai-tower'), (SELECT id FROM badges WHERE slug = 'ready-to-move'), 1),
((SELECT id FROM projects WHERE slug = 'downtown-dubai-tower'), (SELECT id FROM badges WHERE slug = '1-year-service-charge'), 2),
-- Marina Studios badges
((SELECT id FROM projects WHERE slug = 'marina-studios'), (SELECT id FROM badges WHERE slug = 'special-price'), 1),
-- Palm Royal Villas badges (5 badges)
((SELECT id FROM projects WHERE slug = 'palm-royal-villas'), (SELECT id FROM badges WHERE slug = 'golden-visa'), 1),
((SELECT id FROM projects WHERE slug = 'palm-royal-villas'), (SELECT id FROM badges WHERE slug = 'sea-view'), 2),
((SELECT id FROM projects WHERE slug = 'palm-royal-villas'), (SELECT id FROM badges WHERE slug = 'fully-furniture'), 3),
((SELECT id FROM projects WHERE slug = 'palm-royal-villas'), (SELECT id FROM badges WHERE slug = 'special-price'), 4),
((SELECT id FROM projects WHERE slug = 'palm-royal-villas'), (SELECT id FROM badges WHERE slug = 'new-project'), 5),
-- Marina Gate Ready badges
((SELECT id FROM projects WHERE slug = 'marina-gate-ready'), (SELECT id FROM badges WHERE slug = 'ready-to-move'), 1),
((SELECT id FROM projects WHERE slug = 'marina-gate-ready'), (SELECT id FROM badges WHERE slug = 'special-price'), 2),
((SELECT id FROM projects WHERE slug = 'marina-gate-ready'), (SELECT id FROM badges WHERE slug = 'fully-furniture'), 3),
-- Dubai Creek Tower badges
((SELECT id FROM projects WHERE slug = 'dubai-creek-tower'), (SELECT id FROM badges WHERE slug = 'new-project'), 1),
((SELECT id FROM projects WHERE slug = 'dubai-creek-tower'), (SELECT id FROM badges WHERE slug = 'golden-visa'), 2),
-- Islands Family Homes badges
((SELECT id FROM projects WHERE slug = 'islands-family-homes'), (SELECT id FROM badges WHERE slug = 'pool-view'), 1),
((SELECT id FROM projects WHERE slug = 'islands-family-homes'), (SELECT id FROM badges WHERE slug = '1-year-service-charge'), 2),
-- Al Hamra Value Homes badges
((SELECT id FROM projects WHERE slug = 'al-hamra-value'), (SELECT id FROM badges WHERE slug = 'special-price'), 1),
-- Downtown Investment Suites badges
((SELECT id FROM projects WHERE slug = 'downtown-investment-suites'), (SELECT id FROM badges WHERE slug = 'golden-visa'), 1),
((SELECT id FROM projects WHERE slug = 'downtown-investment-suites'), (SELECT id FROM badges WHERE slug = '1-year-service-charge'), 2),
-- Marina Complete Living badges (4 badges)
((SELECT id FROM projects WHERE slug = 'marina-complete-living'), (SELECT id FROM badges WHERE slug = 'pool-view'), 1),
((SELECT id FROM projects WHERE slug = 'marina-complete-living'), (SELECT id FROM badges WHERE slug = 'sea-view'), 2),
((SELECT id FROM projects WHERE slug = 'marina-complete-living'), (SELECT id FROM badges WHERE slug = '1-year-service-charge'), 3),
((SELECT id FROM projects WHERE slug = 'marina-complete-living'), (SELECT id FROM badges WHERE slug = 'fully-furniture'), 4)
ON CONFLICT (project_id, badge_id) DO NOTHING;
