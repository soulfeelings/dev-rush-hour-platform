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
   "media": {
     "cover": {"id": "sea-legend-cover", "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"},
     "gallery": [
       {"id": "sea-legend-1", "url": "https://dda-realestate.com/storage/complex_medias/2383_464b6881-0667-45c0-afc4-c3e319c48078.webp"},
       {"id": "sea-legend-2", "url": "https://dda-realestate.com/storage/complex_medias/2383_58becc44-e6da-4f7c-a369-52e191330579.webp"},
       {"id": "sea-legend-3", "url": "https://dda-realestate.com/storage/complex_medias/2022_789c184c-8bb6-4f74-81dc-1ba712707f32.webp"},
       {"id": "sea-legend-4", "url": "https://img.prian.ru/2025_03/6/20250306070144977904250o.png"}
     ]
   },
   "tags": ["9 декабря", "Акция для клиентов"], "isRecommended": true, "isFeatured": true}'
),
('colibri-views', 'Colibri Views', 'active', 'sales announcement',
 (SELECT id FROM developers WHERE slug = 'major-developments'),
 (SELECT id FROM areas WHERE slug = 'al-jazeera-al-hamra-industrial'),
 25.3340, 55.3070,
 '{"specs": {"priceFrom": 1100000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["Ст", "1К", "2К"], "completionDate": "2029-Q1"},
   "media": {
     "cover": {"id": "colibri-views-cover", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"},
     "gallery": [
       {"id": "colibri-views-1", "url": "https://i.1.creatium.io/disk2/e7/d4/93/665abb73256b38e6185b4f0023ce485aec/colibri_views.jpg"},
       {"id": "colibri-views-2", "url": "https://topaddress.ae/wp-content/uploads/2025/09/1879b530c756f4888f1871387860b169.webp"}
     ]
   },
   "isRecommended": false}'
),
('luz-ora-residences', 'Luz Ora Residences', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'dia-developments'),
 (SELECT id FROM areas WHERE slug = 'dubai-islands'),
 25.3216, 55.2911,
 '{"specs": {"priceFrom": 1600000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["1К", "2К", "4К"], "completionDate": "2027-Q2"},
   "media": {
     "cover": {"id": "luz-ora-cover", "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"},
     "gallery": [
       {"id": "luz-ora-1", "url": "https://storage4.emirates.estate/static/p/4cvihjt3c/e7fd0e4qom3vr/luz-ora-00.jpg"},
       {"id": "luz-ora-2", "url": "https://dda-realestate.com/storage/complex_medias/2276_76ba2232-ae0e-41ec-a058-5b44de53686d.webp"}
     ]
   },
   "isRecommended": true}'
),
('palm-jumeirah-residence', 'Palm Jumeirah Residence', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'palm-jumeirah'),
 25.1154, 55.1390,
 '{"specs": {"priceFrom": 2500000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["2К", "3К", "4К"], "completionDate": "2026-Q3"},
   "media": {
     "cover": {"id": "palm-jumeirah-cover", "url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"},
     "gallery": [
       {"id": "palm-jumeirah-1", "url": "https://avatars.mds.yandex.net/i?id=93f01f1b74f3ea661e373841e5a49b47_l-4903160-images-thumbs&n=13"},
       {"id": "palm-jumeirah-2", "url": "https://i.tez-tour.travel/img/hotels/21619/22.jpg"},
       {"id": "palm-jumeirah-3", "url": "https://maldives.ru/upload/resize_cache/iblock/cea/v5s5qyfyrww9txkqoxm7yp6p2zkzw8ge/1500_1000_2/5af3f33d71be_75209062_4K.jpeg"}
     ]
   },
   "isRecommended": false}'
),
('downtown-dubai-tower', 'Downtown Dubai Tower', 'active', 'sale',
 (SELECT id FROM developers WHERE slug = 'emaar-properties'),
 (SELECT id FROM areas WHERE slug = 'downtown-dubai'),
 25.1972, 55.2744,
 '{"specs": {"priceFrom": 1800000, "currency": "AED", "types": ["Первичная"], "bedrooms": ["1К", "2К", "3К"], "completionDate": "2028-Q1"},
   "media": {
     "cover": {"id": "downtown-dubai-cover", "url": "https://edge.travelatacdn.ru/thumbs/640x480/upload/2021_41/content_hotel_616721062c3ec6.34344983.jpeg"},
     "gallery": [
       {"id": "downtown-dubai-1", "url": "https://avatars.mds.yandex.net/i?id=b52cc6857909a23f5f489ca2af4bc630_l-8311154-images-thumbs&n=13"},
       {"id": "downtown-dubai-2", "url": "https://avatars.mds.yandex.net/get-altay/5482016/2a0000017f11fe72faf7762646a9fddcf1c0/XXL_height"},
       {"id": "downtown-dubai-3", "url": "https://avatars.mds.yandex.net/i?id=23ef5e3bfd1d152e1e3016478a10f0d1037c0196-5476568-images-thumbs&n=13"}
     ]
   },
   "isRecommended": false}'
);
