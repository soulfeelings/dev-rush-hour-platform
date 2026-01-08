-- Seed data for Rush Hour Platform
-- Run: make seed (local) or make seed-railway DATABASE_URL="..." (production)

-- Insert developers
INSERT INTO developers (slug, name, status, data) VALUES
('segrex-development-llc', 'Segrex Development L.L.C Агентство', 'active', '{"logoUrl": "https://avatars.mds.yandex.net/i?id=70d28def6aafbd8f46b5a6028a7218f0_l-5310919-images-thumbs&n=13"}'),
('major-developments', 'Major Developments', 'active', '{"logoUrl": "https://avatars.mds.yandex.net/i?id=c6a1772c7effeac59b29a17ea8103e7133ae2d79-9151820-images-thumbs&n=13"}'),
('dia-developments', 'DIA Developments', 'active', '{"logoUrl": "https://novostroyki.bazametrov.ru/storage/uploads/developers/2052/logo.jpg"}'),
('emaar-properties', 'Emaar Properties', 'active', '{"logoUrl": "https://avatars.mds.yandex.net/i?id=6106b51626c0974294528879d7d72c1d_l-5670589-images-thumbs&n=13"}')
ON CONFLICT (slug) DO NOTHING;

-- Insert areas
INSERT INTO areas (slug, name, city, lat, lng, status) VALUES
('dubai-marina', 'Dubai Marina', 'Dubai', 25.0772, 55.1398, 'active'),
('al-jazeera-al-hamra-industrial', 'Al Jazeera Al Hamra Industrial', 'Dubai', 25.3340, 55.3070, 'active'),
('dubai-islands', 'Dubai Islands', 'Dubai', 25.3216, 55.2911, 'active'),
('palm-jumeirah', 'Palm Jumeirah', 'Dubai', 25.1154, 55.1390, 'active'),
('downtown-dubai', 'Downtown Dubai', 'Dubai', 25.1972, 55.2744, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert projects
INSERT INTO projects (slug, name, status, sale, developer_id, area_id, lat, lng, data) VALUES
('sea-legend-tower-one', 'Sea Legend Tower One: Меблированная 3-комнатная квартира', 'active', 'start of sales',
 (SELECT id FROM developers WHERE slug = 'segrex-development-llc'),
 (SELECT id FROM areas WHERE slug = 'dubai-marina'),
 25.0772, 55.1398,
 '{"description": "Luxurious fully furnished 3-bedroom apartment spanning 1,533.25 sq. ft. in the prestigious Sea Legend Tower One at Dubai Marina, offering panoramic marina views, modern finishes, and access to world-class amenities in one of Dubai''s most sought-after waterfront districts.",
   "specs": {"priceFrom": 1200000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["3К"], "completionDate": "2025-12-31", "area": 1533.25, "areaUnit": "sq. ft."},
   "media": {
     "cover": {"id": "sea-legend-cover", "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"},
     "gallery": [
       {"id": "sea-legend-1", "url": "https://dda-realestate.com/storage/complex_medias/2383_464b6881-0667-45c0-afc4-c3e319c48078.webp"},
       {"id": "sea-legend-2", "url": "https://dda-realestate.com/storage/complex_medias/2383_58becc44-e6da-4f7c-a369-52e191330579.webp"},
       {"id": "sea-legend-3", "url": "https://dda-realestate.com/storage/complex_medias/2022_789c184c-8bb6-4f74-81dc-1ba712707f32.webp"},
       {"id": "sea-legend-4", "url": "https://img.prian.ru/2025_03/6/20250306070144977904250o.png"}
     ]
   },
   "featuresAmenities": ["Gym", "Swimming Pool", "Sea View", "Spa Center", "Children''s Playground", "Electric Vehicle Charging", "24/7 Security", "Underground Parking", "Concierge Service", "Private Beach"],
   "tags": ["9 декабря", "Акция для клиентов"], 
   "isRecommended": true, "isFeatured": true}'
),
('colibri-views', 'Colibri Views', 'active', 'sales announcement',
 (SELECT id FROM developers WHERE slug = 'major-developments'),
 (SELECT id FROM areas WHERE slug = 'al-jazeera-al-hamra-industrial'),
 25.3340, 55.3070,
 '{"description": "Modern residential complex offering flexible studio to 2-bedroom units in an emerging mixed-use community at Al Jazeera Al Hamra Industrial area, featuring contemporary design, green spaces, and community-focused amenities for comfortable urban living.",
   "specs": {"priceFrom": 1100000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["Ст", "1К", "2К"], "completionDate": "2029-Q1"},
   "media": {
     "cover": {"id": "colibri-views-cover", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"},
     "gallery": [
       {"id": "colibri-views-1", "url": "https://i.1.creatium.io/disk2/e7/d4/93/665abb73256b38e6185b4f0023ce485aec/colibri_views.jpg"},
       {"id": "colibri-views-2", "url": "https://topaddress.ae/wp-content/uploads/2025/09/1879b530c756f4888f1871387860b169.webp"}
     ]
   },
   "featuresAmenities": ["Gym", "Children''s Playground", "Landscaped Garden", "Barbecue Area", "Retail Space", "On-site Supermarket", "Picnic Area", "Sports Court", "Bicycle Paths", "Package Room"],
   "isRecommended": false}'
),
('luz-ora-residences', 'Luz Ora Residences', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'dia-developments'),
 (SELECT id FROM areas WHERE slug = 'dubai-islands'),
 25.3216, 55.2911,
 '{"description": "Premium waterfront residences on Dubai Islands featuring 1 to 4-bedroom apartments with modern architecture, private beach access, and luxury amenities in a serene island setting just minutes from the city center.",
   "specs": {"priceFrom": 1600000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["1К", "2К", "4К"], "completionDate": "2027-Q2"},
   "media": {
     "cover": {"id": "luz-ora-cover", "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"},
     "gallery": [
       {"id": "luz-ora-1", "url": "https://storage4.emirates.estate/static/p/4cvihjt3c/e7fd0e4qom3vr/luz-ora-00.jpg"},
       {"id": "luz-ora-2", "url": "https://dda-realestate.com/storage/complex_medias/2276_76ba2232-ae0e-41ec-a058-5b44de53686d.webp"}
     ]
   },
   "featuresAmenities": ["Gym", "Swimming Pool", "Sea View", "Private Beach", "Electric Vehicle Charging", "Yoga Studio", "Spa Center", "Kids Club", "Private Yacht Dock", "On-site Restaurant"],
   "isRecommended": true}'
),
('palm-jumeirah-residence', 'Palm Jumeirah Residence', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'palm-jumeirah'),
 25.1154, 55.1390,
 '{"description": "Ultra-luxury beachfront residences on the iconic Palm Jumeirah, offering 2 to 4-bedroom apartments and villas with direct private beach access, infinity pools, and 5-star hotel amenities in Dubai''s most exclusive address.",
   "specs": {"priceFrom": 2500000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["2К", "3К", "4К"], "completionDate": "2026-Q3"},
   "media": {
     "cover": {"id": "palm-jumeirah-cover", "url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"},
     "gallery": [
       {"id": "palm-jumeirah-1", "url": "https://avatars.mds.yandex.net/i?id=93f01f1b74f3ea661e373841e5a49b47_l-4903160-images-thumbs&n=13"},
       {"id": "palm-jumeirah-2", "url": "https://i.tez-tour.travel/img/hotels/21619/22.jpg"},
       {"id": "palm-jumeirah-3", "url": "https://maldives.ru/upload/resize_cache/iblock/cea/v5s5qyfyrww9txkqoxm7yp6p2zkzw8ge/1500_1000_2/5af3f33d71be_75209062_4K.jpeg"}
     ]
   },
   "featuresAmenities": ["Gym", "Swimming Pool", "Sea View", "Spa Center", "Private Beach", "Infrared Saunas", "Poolside Restaurant", "Kids Club with Nanny", "Concierge Service", "Helipad"],
   "isRecommended": false}'
),
('downtown-dubai-tower', 'Downtown Dubai Tower', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'downtown-dubai'),
 25.1972, 55.2744,
 '{"description": "Premium high-rise tower in the heart of Downtown Dubai featuring 1 to 3-bedroom apartments with direct views of Burj Khalifa, immediate access to Dubai Mall, and luxury urban living at the center of the city''s cultural and commercial hub.",
   "specs": {"priceFrom": 1800000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["1К", "2К", "3К"], "completionDate": "2028-Q1"},
   "media": {
     "cover": {"id": "downtown-dubai-cover", "url": "https://edge.travelatacdn.ru/thumbs/640x480/upload/2021_41/content_hotel_616721062c3ec6.34344983.jpeg"},
     "gallery": [
       {"id": "downtown-dubai-1", "url": "https://avatars.mds.yandex.net/i?id=b52cc6857909a23f5f489ca2af4bc630_l-8311154-images-thumbs&n=13"},
       {"id": "downtown-dubai-2", "url": "https://avatars.mds.yandex.net/get-altay/5482016/2a0000017f11fe72faf7762646a9fddcf1c0/XXL_height"},
       {"id": "downtown-dubai-3", "url": "https://avatars.mds.yandex.net/i?id=23ef5e3bfd1d152e1e3016478a10f0d1037c0196-5476568-images-thumbs&n=13"}
     ]
   },
   "featuresAmenities": ["Gym", "Swimming Pool", "Children''s Playground", "Yoga Studio", "Electric Vehicle Charging", "Indoor Tennis Court", "Library", "Cinema", "Conference Room", "Direct Access to Dubai Mall"],
   "isRecommended": false}'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert lots (квартиры/лоты) для каждого проекта
-- В каждом проекте по 3 квартиры с разными характеристиками

-- Sea Legend Tower One (3 квартиры)
INSERT INTO lots (status, project_id, developer_id, area_id, type, bedrooms, bathrooms, area_sqm, floor, price_amount, bonus_keys, data) VALUES
('active', 
 (SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'),
 (SELECT id FROM developers WHERE slug = 'segrex-development-llc'),
 (SELECT id FROM areas WHERE slug = 'dubai-marina'),
 'apartment', 3, 3, 142.5, 25, 1250000.00, 
 '{"free_parking", "furnished", "sea_view"}',
 '{"view": "Marina View", "furnishing": "Fully Furnished", "orientation": "South-West", "features": ["Walk-in Closet", "Smart Home System", "Balcony"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'),
 (SELECT id FROM developers WHERE slug = 'segrex-development-llc'),
 (SELECT id FROM areas WHERE slug = 'dubai-marina'),
 'apartment', 3, 2, 138.0, 18, 1200000.00, 
 '{"free_parking", "furnished"}',
 '{"view": "City View", "furnishing": "Semi-Furnished", "orientation": "North-East", "features": ["Built-in Wardrobes", "Ensuite Bathroom"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'),
 (SELECT id FROM developers WHERE slug = 'segrex-development-llc'),
 (SELECT id FROM areas WHERE slug = 'dubai-marina'),
 'apartment', 3, 3, 145.0, 32, 1350000.00, 
 '{"free_parking", "furnished", "sea_view", "private_beach_access"}',
 '{"view": "Panoramic Sea View", "furnishing": "Fully Furnished", "orientation": "South", "features": ["Jacuzzi", "Private Storage", "Maids Room"]}'
),

-- Colibri Views (3 квартиры)
('active', 
 (SELECT id FROM projects WHERE slug = 'colibri-views'),
 (SELECT id FROM developers WHERE slug = 'major-developments'),
 (SELECT id FROM areas WHERE slug = 'al-jazeera-al-hamra-industrial'),
 'apartment', 1, 1, 65.0, 5, 1100000.00, 
 '{"flexible_payment"}',
 '{"view": "Garden View", "furnishing": "Unfurnished", "orientation": "East", "features": ["Built-in Kitchen", "Balcony"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'colibri-views'),
 (SELECT id FROM developers WHERE slug = 'major-developments'),
 (SELECT id FROM areas WHERE slug = 'al-jazeera-al-hamra-industrial'),
 'studio', 0, 1, 45.0, 3, 750000.00, 
 '{"flexible_payment", "early_bird_discount"}',
 '{"view": "Street View", "furnishing": "Unfurnished", "orientation": "West", "features": ["Open Plan", "Study Corner"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'colibri-views'),
 (SELECT id FROM developers WHERE slug = 'major-developments'),
 (SELECT id FROM areas WHERE slug = 'al-jazeera-al-hamra-industrial'),
 'apartment', 2, 2, 95.0, 8, 1450000.00, 
 '{"flexible_payment", "free_maintenance_1year"}',
 '{"view": "Pool View", "furnishing": "Semi-Furnished", "orientation": "South", "features": ["Walk-in Closet", "Utility Room"]}'
),

-- Luz Ora Residences (3 квартиры)
('active', 
 (SELECT id FROM projects WHERE slug = 'luz-ora-residences'),
 (SELECT id FROM developers WHERE slug = 'dia-developments'),
 (SELECT id FROM areas WHERE slug = 'dubai-islands'),
 'apartment', 2, 2, 110.0, 12, 1650000.00, 
 '{"private_beach_access", "yacht_membership"}',
 '{"view": "Beach Front", "furnishing": "Fully Furnished", "orientation": "West", "features": ["Private Terrace", "Ensuite Bathrooms"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'luz-ora-residences'),
 (SELECT id FROM developers WHERE slug = 'dia-developments'),
 (SELECT id FROM areas WHERE slug = 'dubai-islands'),
 'apartment', 4, 4, 220.0, 20, 3200000.00, 
 '{"private_beach_access", "yacht_membership", "free_renovation"}',
 '{"view": "Sea View", "furnishing": "Fully Furnished", "orientation": "South-West", "features": ["Maid Room", "Study", "Walk-in Closets"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'luz-ora-residences'),
 (SELECT id FROM developers WHERE slug = 'dia-developments'),
 (SELECT id FROM areas WHERE slug = 'dubai-islands'),
 'apartment', 1, 1, 85.0, 7, 1400000.00, 
 '{"private_beach_access"}',
 '{"view": "Island View", "furnishing": "Semi-Furnished", "orientation": "North", "features": ["Balcony", "Storage"]}'
),

-- Palm Jumeirah Residence (3 квартиры)
('active', 
 (SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'),
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'palm-jumeirah'),
 'apartment', 3, 3, 180.0, 15, 2800000.00, 
 '{"beachfront", "infinity_pool_access", "concierge_service"}',
 '{"view": "Palm View", "furnishing": "Fully Furnished", "orientation": "South", "features": ["Private Jacuzzi", "Wine Cellar", "Home Cinema"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'),
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'palm-jumeirah'),
 'apartment', 2, 2, 130.0, 10, 2100000.00, 
 '{"beachfront", "concierge_service"}',
 '{"view": "Sea View", "furnishing": "Fully Furnished", "orientation": "West", "features": ["Balcony", "Walk-in Closet"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'),
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'palm-jumeirah'),
 'villa', 4, 5, 350.0, 1, 5500000.00, 
 '{"beachfront", "infinity_pool_access", "concierge_service", "private_pool"}',
 '{"view": "Direct Beach Access", "furnishing": "Fully Furnished", "orientation": "South-West", "features": ["Private Garden", "Barbecue Area", "4 Car Parking"]}'
),

-- Downtown Dubai Tower (3 квартиры)
('active', 
 (SELECT id FROM projects WHERE slug = 'downtown-dubai-tower'),
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'downtown-dubai'),
 'apartment', 1, 1, 75.0, 25, 1350000.00, 
 '{"burj_khalifa_view", "mall_access"}',
 '{"view": "Burj Khalifa View", "furnishing": "Semi-Furnished", "orientation": "South", "features": ["Balcony", "Smart Home Features"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'downtown-dubai-tower'),
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'downtown-dubai'),
 'apartment', 2, 2, 115.0, 35, 1950000.00, 
 '{"burj_khalifa_view", "mall_access", "free_valet_parking"}',
 '{"view": "Fountain View", "furnishing": "Fully Furnished", "orientation": "North", "features": ["Walk-in Closet", "Ensuite Bathroom"]}'
),
('active', 
 (SELECT id FROM projects WHERE slug = 'downtown-dubai-tower'),
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'downtown-dubai'),
 'apartment', 3, 3, 160.0, 42, 2600000.00, 
 '{"burj_khalifa_view", "mall_access", "free_valet_parking", "club_membership"}',
 '{"view": "Panoramic City View", "furnishing": "Fully Furnished", "orientation": "South-West", "features": ["Maid Room", "Library", "Wine Cooler"]}'
)
ON CONFLICT (project_id, type, bedrooms, bathrooms, area_sqm, floor, price_amount) DO NOTHING;