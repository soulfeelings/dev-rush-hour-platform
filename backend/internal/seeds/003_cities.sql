-- Seed cities
INSERT INTO cities (slug, name) VALUES
('dubai', 'Dubai'),
('abu-dhabi', 'Abu Dhabi')
ON CONFLICT (slug) DO NOTHING;
