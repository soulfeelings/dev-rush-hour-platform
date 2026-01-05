-- Insert developers from mockProperties
INSERT INTO developers (slug, name, status, data) VALUES
('segrex-development-llc', 'Segrex Development L.L.C Агентство', 'active', '{"logoUrl": "https://avatars.mds.yandex.net/i?id=70d28def6aafbd8f46b5a6028a7218f0_l-5310919-images-thumbs&n=13"}'),
('major-developments', 'Major Developments', 'active', '{"logoUrl": "https://avatars.mds.yandex.net/i?id=c6a1772c7effeac59b29a17ea8103e7133ae2d79-9151820-images-thumbs&n=13"}'),
('dia-developments', 'DIA Developments', 'active', '{"logoUrl": "https://novostroyki.bazametrov.ru/storage/uploads/developers/2052/logo.jpg"}'),
('emaar-properties', 'Emaar Properties', 'active', '{"logoUrl": "https://avatars.mds.yandex.net/i?id=6106b51626c0974294528879d7d72c1d_l-5670589-images-thumbs&n=13"}')
ON CONFLICT (slug) DO NOTHING;

-- Insert areas from mockProperties
INSERT INTO areas (slug, name, city, lat, lng, status) VALUES
('dubai-marina', 'Dubai Marina', 'Dubai', 25.0772, 55.1398, 'active'),
('al-jazeera-al-hamra-industrial', 'Al Jazeera Al Hamra Industrial', 'Dubai', 25.3340, 55.3070, 'active'),
('dubai-islands', 'Dubai Islands', 'Dubai', 25.3216, 55.2911, 'active'),
('palm-jumeirah', 'Palm Jumeirah', 'Dubai', 25.1154, 55.1390, 'active'),
('downtown-dubai', 'Downtown Dubai', 'Dubai', 25.1972, 55.2744, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert projects from mockProperties
INSERT INTO projects (slug, name, status, sale, developer_id, area_id, lat, lng, data) VALUES
('sea-legend-tower-one', 'Sea Legend Tower One: Меблированная 3-комнатная квартира', 'active', 'start of sales',
 (SELECT id FROM developers WHERE slug = 'segrex-development-llc'),
 (SELECT id FROM areas WHERE slug = 'dubai-marina'),
 25.0772, 55.1398,
 '{"description": "Полностью меблированная 3-комнатная квартира площадью 1,533.25 sq. ft. в Sea Legend Tower One",
   "specs": {"priceFrom": 1200000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["3К"], "completionDate": "2025-12-31", "area": 1533.25, "areaUnit": "sq. ft."},
   "media": {"cover": {"id": "sea-legend-cover", "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"}},
   "tags": ["9 декабря", "Акция для клиентов"], "isRecommended": true, "isFeatured": true}'
),
('colibri-views', 'Colibri Views', 'active', 'sales announcement',
 (SELECT id FROM developers WHERE slug = 'major-developments'),
 (SELECT id FROM areas WHERE slug = 'al-jazeera-al-hamra-industrial'),
 25.3340, 55.3070,
 '{"specs": {"priceFrom": 1100000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["Ст", "1К", "2К"], "completionDate": "2029-Q1"},
   "media": {"cover": {"id": "colibri-views-cover", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}},
   "isRecommended": false}'
),
('luz-ora-residences', 'Luz Ora Residences', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'dia-developments'),
 (SELECT id FROM areas WHERE slug = 'dubai-islands'),
 25.3216, 55.2911,
 '{"specs": {"priceFrom": 1600000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["1К", "2К", "4К"], "completionDate": "2027-Q2"},
   "media": {"cover": {"id": "luz-ora-cover", "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"}},
   "isRecommended": true}'
),
('palm-jumeirah-residence', 'Palm Jumeirah Residence', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'palm-jumeirah'),
 25.1154, 55.1390,
 '{"specs": {"priceFrom": 2500000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["2К", "3К", "4К"], "completionDate": "2026-Q3"},
   "media": {"cover": {"id": "palm-jumeirah-cover", "url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"}},
   "isRecommended": false}'
),
('downtown-dubai-tower', 'Downtown Dubai Tower', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'downtown-dubai'),
 25.1972, 55.2744,
 '{"specs": {"priceFrom": 1800000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["1К", "2К", "3К"], "completionDate": "2028-Q1"},
   "media": {"cover": {"id": "downtown-dubai-cover", "url": "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"}},
   "isRecommended": false}'
);
