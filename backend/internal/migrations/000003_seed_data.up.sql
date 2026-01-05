-- Seed Developers
INSERT INTO developers (id, slug, name, status) VALUES
('d10-0001', 'segrex-development', 'Segrex Development L.L.C Агентство', 'active'),
('d10-0002', 'major-developments', 'Major Developments', 'active'),
('d10-0003', 'dia-developments', 'DIA Developments', 'active'),
('d10-0004', 'emaar-properties', 'Emaar Properties', 'active')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;

-- Seed Areas
INSERT INTO areas (id, slug, name, city, lat, lng, status) VALUES
('a10-0001', 'dubai-marina', 'Dubai Marina', 'Dubai', 25.0772, 55.1398, 'active'),
('a10-0002', 'al-jazeera-al-hamra-industrial', 'Al Jazeera Al Hamra Industrial', 'Ras Al Khaimah', 25.334, 55.307, 'active'),
('a10-0003', 'dubai-islands', 'Dubai Islands', 'Dubai', 25.3216, 55.2911, 'active'),
('a10-0004', 'palm-jumeirah', 'Palm Jumeirah', 'Dubai', 25.1154, 55.139, 'active'),
('a10-0005', 'downtown-dubai', 'Downtown Dubai', 'Dubai', 25.1972, 55.2744, 'active')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city, lat = EXCLUDED.lat, lng = EXCLUDED.lng, status = EXCLUDED.status;

-- Seed Projects
-- 1. Sea Legend Tower One
INSERT INTO projects (id, slug, name, status, developer_id, area_id, lat, lng, data) VALUES
('p10-0001', 'sea-legend-tower-one', 'Sea Legend Tower One', 'active', 'd10-0001', 'a10-0001', 25.0772, 55.1398, 
'{
  "description": "Полностью меблированная 3-комнатная квартира площадью 1,533.25 sq. ft. в Sea Legend Tower One",
  "media": {"cover": {"url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"}},
  "specs": {"priceFrom": 1200000, "currency": "AED", "bedrooms": ["3К"]},
  "tags": ["9 декабря", "Акция для клиентов"]
}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, developer_id = EXCLUDED.developer_id, area_id = EXCLUDED.area_id, lat = EXCLUDED.lat, lng = EXCLUDED.lng, data = EXCLUDED.data;

-- 2. Colibri Views
INSERT INTO projects (id, slug, name, status, developer_id, area_id, lat, lng, data) VALUES
('p10-0002', 'colibri-views', 'Colibri Views', 'active', 'd10-0002', 'a10-0002', 25.334, 55.307, 
'{
  "media": {"cover": {"url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}},
  "specs": {"priceFrom": 1100000, "currency": "AED", "bedrooms": ["Ст", "1К", "2К"]}
}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, developer_id = EXCLUDED.developer_id, area_id = EXCLUDED.area_id, lat = EXCLUDED.lat, lng = EXCLUDED.lng, data = EXCLUDED.data;

-- 3. Luz Ora Residences
INSERT INTO projects (id, slug, name, status, developer_id, area_id, lat, lng, data) VALUES
('p10-0003', 'luz-ora-residences', 'Luz Ora Residences', 'active', 'd10-0003', 'a10-0003', 25.3216, 55.2911, 
'{
  "media": {"cover": {"url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"}},
  "specs": {"priceFrom": 1600000, "currency": "AED", "bedrooms": ["1К", "2К", "4К"]}
}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, developer_id = EXCLUDED.developer_id, area_id = EXCLUDED.area_id, lat = EXCLUDED.lat, lng = EXCLUDED.lng, data = EXCLUDED.data;

-- 4. Palm Jumeirah Residence
INSERT INTO projects (id, slug, name, status, developer_id, area_id, lat, lng, data) VALUES
('p10-0004', 'palm-jumeirah-residence', 'Palm Jumeirah Residence', 'active', 'd10-0004', 'a10-0004', 25.1154, 55.139, 
'{
  "media": {"cover": {"url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"}},
  "specs": {"priceFrom": 2500000, "currency": "AED", "bedrooms": ["2К", "3К", "4К"]}
}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, developer_id = EXCLUDED.developer_id, area_id = EXCLUDED.area_id, lat = EXCLUDED.lat, lng = EXCLUDED.lng, data = EXCLUDED.data;

-- 5. Downtown Dubai Tower
INSERT INTO projects (id, slug, name, status, developer_id, area_id, lat, lng, data) VALUES
('p10-0005', 'downtown-dubai-tower', 'Downtown Dubai Tower', 'active', 'd10-0004', 'a10-0005', 25.1972, 55.2744, 
'{
  "media": {"cover": {"url": "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"}},
  "specs": {"priceFrom": 1800000, "currency": "AED", "bedrooms": ["1К", "2К", "3К"]}
}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, developer_id = EXCLUDED.developer_id, area_id = EXCLUDED.area_id, lat = EXCLUDED.lat, lng = EXCLUDED.lng, data = EXCLUDED.data;

