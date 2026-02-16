-- Seed developers
INSERT INTO developers (slug, name, status, logo_url) VALUES
('segrex-development-llc', 'Segrex Development L.L.C Агентство', 'active', 'https://avatars.mds.yandex.net/i?id=70d28def6aafbd8f46b5a6028a7218f0_l-5310919-images-thumbs&n=13'),
('major-developments', 'Major Developments', 'active', 'https://avatars.mds.yandex.net/i?id=c6a1772c7effeac59b29a17ea8103e7133ae2d79-9151820-images-thumbs&n=13'),
('dia-developments', 'DIA Developments', 'active', 'https://novostroyki.bazametrov.ru/storage/uploads/developers/2052/logo.jpg'),
('emaar-properties', 'Emaar Properties', 'active', 'https://avatars.mds.yandex.net/i?id=6106b51626c0974294528879d7d72c1d_l-5670589-images-thumbs&n=13')
ON CONFLICT (slug) DO NOTHING;
