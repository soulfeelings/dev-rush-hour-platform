-- Seed badges
INSERT INTO badges (slug, name, background_color, text_color, icon, sort_order) VALUES
('1-year-service-charge', '1 year service charge', '#25D366', '#FFFFFF', 'gift', 1),
('fully-furniture', 'Fully furniture', '#F5A623', '#FFFFFF', 'sofa', 2),
('special-price', 'Special price', '#FF3B30', '#FFFFFF', 'tag', 3),
('golden-visa', 'Golden Visa', '#FFD700', '#000000', 'passport', 4),
('pool-view', 'Pool View', '#007AFF', '#FFFFFF', 'waves', 5),
('sea-view', 'Sea View', '#34C759', '#FFFFFF', 'anchor', 6),
('new-project', 'New Project', '#AF52DE', '#FFFFFF', 'sparkles', 7),
('ready-to-move', 'Ready to Move', '#5856D6', '#FFFFFF', 'key', 8)
ON CONFLICT (slug) DO NOTHING;
