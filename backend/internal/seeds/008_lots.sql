-- Seed lots

-- Sea Legend Tower One (3 lots)
INSERT INTO lots (status, project_id, type, bedrooms, bathrooms, area_sqft, floor, price_from_us, price_from_developer, roi, bonus_keys, badge_ids, data) VALUES
('active',
 (SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'),
 'apartment', 3, 3, 1533.86, 25, 1250000.00, 1500000.00, 7.0,
 '{"free_parking", "furnished", "sea_view"}',
 ARRAY(SELECT id FROM badges WHERE slug IN ('sea-view', 'fully-furniture')),
 '{"view": "Marina View", "furnishing": "Fully Furnished", "orientation": "South-West",
   "features": ["Walk-in Closet", "Smart Home System", "Balcony"],
   "media": {
     "cover": {"id": "sea-legend-lot1-cover", "url": "https://nestin-property.ru/storage/89665/b671ab0fe52829d8e644e91dc699c681.jpeg"},
     "gallery": [
       {"id": "sea-legend-lot1-1", "url": "https://img.prian.ru/2024_04/18/202404181622231076311836o.jpg"},
       {"id": "sea-legend-lot1-2", "url": "https://i.ytimg.com/vi/_JuqQnF5IcI/maxresdefault.jpg"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'),
 'apartment', 3, 2, 1485.42, 18, 1200000.00, 1440000.00, 6.5,
 '{"free_parking", "furnished"}',
 '{}',
 '{"view": "City View", "furnishing": "Semi-Furnished", "orientation": "North-East",
   "features": ["Built-in Wardrobes", "Ensuite Bathroom"], "media": {
     "cover": {"id": "sea-legend-lot2-cover", "url": "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIzODI5NjI3NDE0NzgwNjgyOA==/original/81119dba-028e-4350-af43-44c7bbf52d67.jpeg"},
     "gallery": [
       {"id": "sea-legend-lot2-1", "url": "https://a0.muscache.com/im/pictures/hosting/Hosting-1375514800263502129/original/e65c0a06-b28c-4beb-8e6c-7da397c7ee2b.jpeg"},
       {"id": "sea-legend-lot2-2", "url": "https://a0.muscache.com/im/pictures/prohost-api/Hosting-36259671/original/7571b5f9-cf79-4f2f-90ed-f0d24a87dac8.jpeg?im_w=720&width=720&quality=70&auto=webp"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'sea-legend-tower-one'),
 'apartment', 3, 3, 1560.77, 32, 1350000.00, 1620000.00, 7.5,
 '{"free_parking", "furnished", "sea_view", "private_beach_access"}',
 '{}',
 '{"view": "Panoramic Sea View", "furnishing": "Fully Furnished", "orientation": "South",
   "features": ["Jacuzzi", "Private Storage", "Maids Room"],
   "media": {
     "cover": {"id": "sea-legend-lot3-cover", "url": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/584325924.jpg?k=532a1b300a62f0d9e7706ae5c9125aac9e8a45846e7a5dab9d81831ad3046789&o=&hp=1"},
     "gallery": [
       {"id": "sea-legend-lot3-1", "url": "https://dbz-images.dubizzle.com/images/2025/05/07/1ebad940-bbdb-4969-8c54-a71b4a02fe90/0d4a03271fd74e7ab0adfe911464f078-.jpg?impolicy=dpv"},
       {"id": "sea-legend-lot3-2", "url": "https://img.hostify.com/515/property/99971323272c126cd2c148508eccef56-full.jpg"}
     ]
   }}'
),

-- Colibri Views (3 lots)
('active',
 (SELECT id FROM projects WHERE slug = 'colibri-views'),
 'apartment', 1, 1, 699.65, 5, 1100000.00, 1320000.00, 6.0,
 '{"flexible_payment"}',
 '{}',
 '{"view": "Garden View", "furnishing": "Unfurnished", "orientation": "East",
   "features": ["Built-in Kitchen", "Balcony"],
   "media": {
     "cover": {"id": "colibri-lot1-cover", "url": "https://static.tildacdn.com/tild3765-6638-4338-b336-623733343134/01.jpg"},
     "gallery": [
       {"id": "colibri-lot1-1", "url": "https://dda-realestate.com/storage/property_medias/7686_24d1e1ad-9f7b-4f32-85b8-5f6b04473548.webp"},
       {"id": "colibri-lot1-2", "url": "https://dda-realestate.com/storage/complex_medias/2445_c3c36baa-a831-48a2-878c-926b748b490d.webp"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'colibri-views'),
 'studio', 0, 1, 484.38, 3, 750000.00, 900000.00, 5.5,
 '{"flexible_payment", "early_bird_discount"}',
 '{}',
 '{"view": "Street View", "furnishing": "Unfurnished", "orientation": "West",
   "features": ["Open Plan", "Study Corner"],
   "media": {
     "cover": {"id": "colibri-lot2-cover", "url": "https://avatars.mds.yandex.net/i?id=cff9d520726a5fc38a4e39b0868bc168_l-10533596-images-thumbs&n=13"},
     "gallery": [
       {"id": "colibri-lot2-1", "url": "https://storage4.emirates.estate/static/p/3ixax2ydj/gdo2085vt7zbo7c67dm6/colibri-apartment-04.jpg"},
       {"id": "colibri-lot2-2", "url": "https://www.loft2rent.ru/upload_data/2025/8108/upld1YxETF.jpg"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'colibri-views'),
 'apartment', 2, 2, 1022.57, 8, 1450000.00, 1740000.00, 6.5,
 '{"flexible_payment", "free_maintenance_1year"}',
 '{}',
 '{"view": "Pool View", "furnishing": "Semi-Furnished", "orientation": "South",
   "features": ["Walk-in Closet", "Utility Room"],
   "media": {
     "cover": {"id": "colibri-lot3-cover", "url": "https://uralto.ru/upload/iblock/966/698l4h23garyrw7wo4a8rfderlitagtz/5-_7_.jpg"},
     "gallery": [
       {"id": "colibri-lot3-1", "url": "https://krd.aqremont.ru/view/images/projects/545/dizayn-dvuhkomnatnoy-kvartiry-63-m2-gostinaya-krasnodar-51052.jpg"},
       {"id": "colibri-lot3-2", "url": "https://content.onliner.by/news/1100x5616/73670334f5fbe0b4e31ff9d44dbdc66a.jpeg"}
     ]
   }}'
),

-- Luz Ora Residences (3 lots)
('active',
 (SELECT id FROM projects WHERE slug = 'luz-ora-residences'),
 'apartment', 2, 2, 1184.03, 12, 1650000.00, 1980000.00, 8.0,
 '{"private_beach_access", "yacht_membership"}',
 '{}',
 '{"view": "Beach Front", "furnishing": "Fully Furnished", "orientation": "West",
   "features": ["Private Terrace", "Ensuite Bathrooms"],
   "media": {
     "cover": {"id": "luz-ora-lot1-cover", "url": "https://cdn.worldota.net/t/640x400/extranet/9e/3f/9e3f88325ab612035b50839ea064df85515b77eb.JPEG"},
     "gallery": [
       {"id": "luz-ora-lot1-1", "url": "https://images.cdn-cian.ru/images/6/803/537/kvartira-moskva-4y-vyatskiy-pereulok-735308622-1.jpg"},
       {"id": "luz-ora-lot1-2", "url": "https://images.cdn-cian.ru/images/kvartira-moskva-ozerkovskaya-naberezhnaya-2523243412-1.jpg"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'luz-ora-residences'),
 'apartment', 4, 4, 2368.06, 20, 3200000.00, 3840000.00, 8.5,
 '{"private_beach_access", "yacht_membership", "free_renovation"}',
 '{}',
 '{"view": "Sea View", "furnishing": "Fully Furnished", "orientation": "South-West",
   "features": ["Maid Room", "Study", "Walk-in Closets"],
   "media": {
     "cover": {"id": "luz-ora-lot2-cover", "url": "https://a0.muscache.com/im/pictures/hosting/Hosting-41548090/original/3ae33bef-7ca0-4d35-94be-37967d9d6982.jpeg"},
     "gallery": [
       {"id": "luz-ora-lot2-1", "url": "https://dda-realestate.com/storage/complex_medias/2503_38f9b157-68be-4eb5-a1c0-c494918d9420.webp"},
       {"id": "luz-ora-lot2-2", "url": "https://dda-realestate.com/storage/complex_medias/2503_5abe9b26-48f5-4d95-a12a-a14b114386e2b.webp"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'luz-ora-residences'),
 'apartment', 1, 1, 914.93, 7, 1400000.00, 1680000.00, 7.5,
 '{"private_beach_access"}',
 '{}',
 '{"view": "Island View", "furnishing": "Semi-Furnished", "orientation": "North",
   "features": ["Balcony", "Storage"],
   "media": {
     "cover": {"id": "luz-ora-lot3-cover", "url": "https://dda-realestate.com/storage/property_medias/910_4dfb18f6-17ec-435e-b120-31a2596cca4e.webp"},
     "gallery": [
       {"id": "luz-ora-lot3-1", "url": "https://dda-realestate.com/storage/property_medias/6645_876e49eb-29a0-4a51-992c-43c119d4a020.webp"},
       {"id": "luz-ora-lot3-2", "url": "https://s3.amazonaws.com/propertybase-clients/00D5I000002FLdJUAW/a0OTx000001ihWv/t9998yhir/midres/ORA%20Residences%2011_3x2.jpg"}
     ]
   }}'
),

-- Palm Jumeirah Residence (3 lots)
('active',
 (SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'),
 'apartment', 3, 3, 1937.5, 15, 2800000.00, 3360000.00, 9.0,
 '{"beachfront", "infinity_pool_access", "concierge_service"}',
 ARRAY(SELECT id FROM badges WHERE slug IN ('sea-view', 'golden-visa')),
 '{"view": "Palm View", "furnishing": "Fully Furnished", "orientation": "South",
   "features": ["Private Jacuzzi", "Wine Cellar", "Home Cinema"],
   "media": {
     "cover": {"id": "palm-lot1-cover", "url": "https://a0.muscache.com/im/pictures/miso/Hosting-1372375706687751053/original/e5a8c0c9-2ec2-469c-8856-db49aa1a7919.jpeg"},
     "gallery": [
       {"id": "palm-lot1-1", "url": "https://i.ytimg.com/vi/ymhTpiCvqJw/maxresdefault.jpg"},
       {"id": "palm-lot1-2", "url": "https://a0.muscache.com/im/pictures/miso/Hosting-944857093302783064/original/1da3c532-e140-43d1-a7d8-29009b0e6b06.jpeg"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'),
 'apartment', 2, 2, 1399.31, 10, 2100000.00, 2520000.00, 8.5,
 '{"beachfront", "concierge_service"}',
 ARRAY(SELECT id FROM badges WHERE slug IN ('sea-view', 'golden-visa')),
 '{"view": "Sea View", "furnishing": "Fully Furnished", "orientation": "West",
   "features": ["Balcony", "Walk-in Closet"],
   "media": {
     "cover": {"id": "palm-lot2-cover", "url": "https://cdn.fazwaz.com/wbr/0kZNg9UrxQTft8p9IE9aMoixL0E/0x0/unit/2013784/atlantis-the-royal-1405-11_1.jpg"},
     "gallery": [
       {"id": "palm-lot2-1", "url": "https://cdn.fazwaz.com/wbr/YhCmEQN-Un-8ruY8EQO1VAqZAWo/0x0/unit/2013779/living-room1.jpg"},
       {"id": "palm-lot2-2", "url": "https://pix10.agoda.net/hotelImages/400/400414/400414_13020804110010322613.jpg?ca=0&ce=1&s=1024x"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'palm-jumeirah-residence'),
 'villa', 4, 5, 3767.37, 1, 5500000.00, 6600000.00, 9.5,
 '{"beachfront", "infinity_pool_access", "concierge_service", "private_pool"}',
 ARRAY(SELECT id FROM badges WHERE slug IN ('sea-view', 'golden-visa')),
 '{"view": "Direct Beach Access", "furnishing": "Fully Furnished", "orientation": "South-West",
   "features": ["Private Garden", "Barbecue Area", "4 Car Parking"],
   "media": {
     "cover": {"id": "palm-lot3-cover", "url": "https://i.ytimg.com/vi/RatV6RNNqWU/maxresdefault.jpg"},
     "gallery": [
       {"id": "palm-lot3-1", "url": "https://i.ytimg.com/vi/ezgl330Aubs/maxresdefault.jpg"},
       {"id": "palm-lot3-2", "url": "https://a0.muscache.com/im/pictures/miso/Hosting-876337588431507308/original/e1f244b1-6b7d-46fb-bcd6-7643bc57eeb2.jpeg"}
     ]
   }}'
),

-- Downtown Dubai Tower (3 lots)
('active',
 (SELECT id FROM projects WHERE slug = 'downtown-dubai-tower'),
 'apartment', 1, 1, 807.29, 25, 1350000.00, 1620000.00, 7.0,
 '{"burj_khalifa_view", "mall_access"}',
 '{}',
 '{"view": "Burj Khalifa View", "furnishing": "Semi-Furnished", "orientation": "South",
   "features": ["Balcony", "Smart Home Features"],
   "media": {
     "cover": {"id": "downtown-lot1-cover", "url": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/649227972.jpg?k=10de4f2f057d059244fde3452a62e46a887bc223c3d28346e9aedad3f7bce62e&o=&hp=1"},
     "gallery": [
       {"id": "downtown-lot1-1", "url": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/629645404.jpg?k=2e288b36e34824942237fe1f43eb62ba8b0aa67862be2822eecaf381281a228d&o=&hp=1"},
       {"id": "downtown-lot1-2", "url": "https://cloud.famproperties.com/project/large/dt-1-220390-093148.jpg"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'downtown-dubai-tower'),
 'apartment', 2, 2, 1237.85, 35, 1950000.00, 2340000.00, 7.5,
 '{"burj_khalifa_view", "mall_access", "free_valet_parking"}',
 '{}',
 '{"view": "Fountain View", "furnishing": "Fully Furnished", "orientation": "North",
   "features": ["Walk-in Closet", "Ensuite Bathroom"],
   "media": {
     "cover": {"id": "downtown-lot2-cover", "url": "https://img.prian.ru/2024_10/19/20241019071331258106935o.jpg"},
     "gallery": [
       {"id": "downtown-lot2-1", "url": "https://emirates.estate/sv/uploads/images/2021-12/fortegallery16.jpg"},
       {"id": "downtown-lot2-2", "url": "https://elegance.emirates-development.com/ru/imgs/gallery-7.jpg"}
     ]
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'downtown-dubai-tower'),
 'apartment', 3, 3, 1722.22, 42, 2600000.00, 3120000.00, 7.0,
 '{"burj_khalifa_view", "mall_access", "free_valet_parking", "club_membership"}',
 '{}',
 '{"view": "Panoramic City View", "furnishing": "Fully Furnished", "orientation": "South-West",
   "features": ["Maid Room", "Library", "Wine Cooler"],
   "media": {
     "cover": {"id": "downtown-lot3-cover", "url": "https://avatars.mds.yandex.net/i?id=fde6db65b93314b4dbb06b9753ffee1f_l-8497237-images-thumbs&n=13"},
     "gallery": [
       {"id": "downtown-lot3-1", "url": "https://www.deluxehomes.com/wp-content/uploads/2025/02/16-16-scaled.jpg"},
       {"id": "downtown-lot3-2", "url": "https://le-chateau.ae/wp-content/uploads/2025/01/IMG-20250128-WA0057.jpg"}
     ]
   }}'
),

-- Marina Studios lots
('active',
 (SELECT id FROM projects WHERE slug = 'marina-studios'),
 'studio', 0, 1, 376.74, 8, 450000.00, 540000.00, 8.0,
 '{"compact_living"}',
 '{}',
 '{"view": "City View", "furnishing": "Unfurnished", "orientation": "East",
   "features": ["Built-in Kitchen", "Balcony"],
   "media": {
     "cover": {"id": "marina-studio-lot1-cover", "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'marina-studios'),
 'studio', 0, 1, 452.08, 15, 520000.00, 624000.00, 8.5,
 '{"compact_living", "marina_view"}',
 '{}',
 '{"view": "Marina View", "furnishing": "Semi-Furnished", "orientation": "West",
   "features": ["Built-in Kitchen", "Balcony", "Walk-in Closet"],
   "media": {
     "cover": {"id": "marina-studio-lot2-cover", "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"},
     "gallery": []
   }}'
),

-- Palm Royal Villas lots
('active',
 (SELECT id FROM projects WHERE slug = 'palm-royal-villas'),
 'villa', 5, 6, 6996.54, 1, 15000000.00, 18000000.00, 5.0,
 '{"private_beach", "yacht_berth", "private_pool"}',
 '{}',
 '{"view": "Direct Beach Access", "furnishing": "Fully Furnished", "orientation": "South",
   "features": ["Private Pool", "Cinema Room", "Gym", "Wine Cellar", "Staff Quarters"],
   "media": {
     "cover": {"id": "palm-royal-lot1-cover", "url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'palm-royal-villas'),
 'villa', 7, 8, 10225.71, 1, 35000000.00, 42000000.00, 5.0,
 '{"private_beach", "yacht_berth", "private_pool", "helipad"}',
 '{}',
 '{"view": "Panoramic Sea View", "furnishing": "Fully Furnished", "orientation": "South-West",
   "features": ["Private Pool", "Cinema Room", "Gym", "Wine Cellar", "Staff Quarters", "Helipad", "Guest House"],
   "media": {
     "cover": {"id": "palm-royal-lot2-cover", "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"},
     "gallery": []
   }}'
),

-- Marina Gate Ready lots
('active',
 (SELECT id FROM projects WHERE slug = 'marina-gate-ready'),
 'apartment', 1, 1, 753.47, 12, 950000.00, 1140000.00, 7.0,
 '{"ready_to_move", "furnished"}',
 '{}',
 '{"view": "Marina View", "furnishing": "Fully Furnished", "orientation": "South",
   "features": ["Balcony", "Built-in Wardrobes"],
   "media": {
     "cover": {"id": "marina-gate-lot1-cover", "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'marina-gate-ready'),
 'apartment', 2, 2, 1130.21, 20, 1500000.00, 1800000.00, 7.5,
 '{"ready_to_move", "furnished", "sea_view"}',
 '{}',
 '{"view": "Sea View", "furnishing": "Fully Furnished", "orientation": "West",
   "features": ["Balcony", "Walk-in Closet", "Maids Room"],
   "media": {
     "cover": {"id": "marina-gate-lot2-cover", "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"},
     "gallery": []
   }}'
),

-- Dubai Creek Tower lots
('active',
 (SELECT id FROM projects WHERE slug = 'dubai-creek-tower'),
 'apartment', 2, 2, 1291.67, 45, 1800000.00, 2160000.00, 12.0,
 '{"creek_view", "high_floor"}',
 '{}',
 '{"view": "Creek View", "furnishing": "Unfurnished", "orientation": "North",
   "features": ["Balcony", "Smart Home System"],
   "media": {
     "cover": {"id": "creek-lot1-cover", "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'dubai-creek-tower'),
 'apartment', 4, 4, 2368.06, 60, 3800000.00, 4560000.00, 12.5,
 '{"creek_view", "high_floor", "premium_unit"}',
 '{}',
 '{"view": "Panoramic Creek View", "furnishing": "Semi-Furnished", "orientation": "South",
   "features": ["Private Terrace", "Study", "Maids Room", "Smart Home System"],
   "media": {
     "cover": {"id": "creek-lot2-cover", "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"},
     "gallery": []
   }}'
),

-- Islands Family Homes lots
('active',
 (SELECT id FROM projects WHERE slug = 'islands-family-homes'),
 'apartment', 3, 3, 1614.59, 5, 2200000.00, 2640000.00, 6.0,
 '{"family_friendly", "pool_access"}',
 '{}',
 '{"view": "Garden View", "furnishing": "Semi-Furnished", "orientation": "East",
   "features": ["Balcony", "Utility Room", "Storage"],
   "media": {
     "cover": {"id": "islands-family-lot1-cover", "url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'islands-family-homes'),
 'townhouse', 4, 4, 3013.89, 1, 3500000.00, 4200000.00, 6.5,
 '{"family_friendly", "pool_access", "private_garden"}',
 '{}',
 '{"view": "Community View", "furnishing": "Unfurnished", "orientation": "South",
   "features": ["Private Garden", "Maids Room", "Garage", "Utility Room"],
   "media": {
     "cover": {"id": "islands-family-lot2-cover", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"},
     "gallery": []
   }}'
),

-- Al Hamra Value Homes lots
('active',
 (SELECT id FROM projects WHERE slug = 'al-hamra-value'),
 'studio', 0, 1, 409.03, 3, 550000.00, 660000.00, 4.0,
 '{"value_deal"}',
 '{}',
 '{"view": "Street View", "furnishing": "Unfurnished", "orientation": "North",
   "features": ["Kitchenette"],
   "media": {
     "cover": {"id": "al-hamra-lot1-cover", "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'al-hamra-value'),
 'apartment', 2, 2, 968.75, 6, 950000.00, 1140000.00, 4.5,
 '{"value_deal", "family_friendly"}',
 '{}',
 '{"view": "Garden View", "furnishing": "Unfurnished", "orientation": "South",
   "features": ["Balcony", "Storage"],
   "media": {
     "cover": {"id": "al-hamra-lot2-cover", "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"},
     "gallery": []
   }}'
),

-- Downtown Investment Suites lots
('active',
 (SELECT id FROM projects WHERE slug = 'downtown-investment-suites'),
 'studio', 0, 1, 592.01, 30, 1100000.00, 1320000.00, 15.0,
 '{"hotel_managed", "guaranteed_roi"}',
 ARRAY(SELECT id FROM badges WHERE slug IN ('golden-visa', '1-year-service-charge')),
 '{"view": "City View", "furnishing": "Fully Furnished", "orientation": "East",
   "features": ["Hotel Service", "Room Service", "Concierge"],
   "media": {
     "cover": {"id": "investment-lot1-cover", "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'downtown-investment-suites'),
 'apartment', 1, 1, 807.29, 35, 1600000.00, 1920000.00, 14.5,
 '{"hotel_managed", "guaranteed_roi", "burj_view"}',
 ARRAY(SELECT id FROM badges WHERE slug IN ('golden-visa', '1-year-service-charge')),
 '{"view": "Burj Khalifa View", "furnishing": "Fully Furnished", "orientation": "South",
   "features": ["Hotel Service", "Room Service", "Concierge", "Balcony"],
   "media": {
     "cover": {"id": "investment-lot2-cover", "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"},
     "gallery": []
   }}'
),

-- Marina Complete Living lots
('active',
 (SELECT id FROM projects WHERE slug = 'marina-complete-living'),
 'studio', 0, 1, 430.56, 5, 600000.00, 720000.00, 7.0,
 '{"marina_view"}',
 '{}',
 '{"view": "Marina View", "furnishing": "Unfurnished", "orientation": "West",
   "features": ["Balcony"],
   "media": {
     "cover": {"id": "complete-lot1-cover", "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'marina-complete-living'),
 'apartment', 2, 2, 1184.03, 15, 1400000.00, 1680000.00, 7.5,
 '{"marina_view", "sea_view"}',
 '{}',
 '{"view": "Sea View", "furnishing": "Semi-Furnished", "orientation": "South",
   "features": ["Balcony", "Walk-in Closet"],
   "media": {
     "cover": {"id": "complete-lot2-cover", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"},
     "gallery": []
   }}'
),
('active',
 (SELECT id FROM projects WHERE slug = 'marina-complete-living'),
 'penthouse', 5, 5, 4305.56, 50, 5500000.00, 6600000.00, 8.0,
 '{"marina_view", "sea_view", "premium_unit", "private_pool"}',
 '{}',
 '{"view": "Panoramic View", "furnishing": "Fully Furnished", "orientation": "South-West",
   "features": ["Private Pool", "Terrace", "Maids Room", "Study", "Home Cinema"],
   "media": {
     "cover": {"id": "complete-lot3-cover", "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"},
     "gallery": []
   }}'
)
ON CONFLICT (project_id, type, bedrooms, bathrooms, area_sqft, floor, price_from_us) DO NOTHING;
