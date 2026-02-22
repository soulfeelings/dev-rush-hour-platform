# Прогноз расходов на инфраструктуру

Перспективы возможных трат — от запуска до 100K DAU.

**Источники тарифов (2025):** [AWS CloudFront](https://aws.amazon.com/cloudfront/pricing/), [AWS S3](https://aws.amazon.com/s3/pricing/), [Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/), [Railway](https://railway.com/pricing)

**Архитектура:** Cloudflare Pages (frontend) + Railway (backend + PostgreSQL) + AWS (S3 + CloudFront CDN для медиа).

**Допущения:**
- 100 просмотров картинок на DAU в день (типично для каталога недвижимости)
- 5 MB на картинку
- DAU ≈ 10% от MAU
- API: ~20 запросов на DAU/день, ~2 KB на ответ

---

## Тарифы (актуальны на 2025)

### AWS
| Сервис | Бесплатно | Платная зона | Цена |
|--------|-----------|--------------|------|
| CloudFront | 1 TB/мес, 10M HTTPS | свыше | $0.085/GB, $0.01/10K req |
| S3 Standard | — | всегда | $0.023/GB-мес |
| S3 GET | — | всегда | $0.0004/1K req |

### Cloudflare Pages
| Ресурс | Лимит | Цена |
|--------|-------|------|
| Bandwidth (статический трафик) | Unlimited | $0 |
| Builds | 500/мес | $0 |
| Pro (при >500 builds) | — | $20/мес |

### Railway
| Ресурс | Цена |
|--------|------|
| Hobby подписка | $5/мес (+ $5 usage credit) |
| Pro подписка | $20/мес (+ $20 usage credit) |
| RAM | $10/GB/мес |
| CPU | $20/vCPU/мес |
| Volume Storage | $0.15/GB/мес |
| Network Egress | $0.05/GB |

---

## Прогноз по этапам роста

| Целевой горизонт | DAU | Картинок | Просмотров/мес | Трафик CDN |
|------------------|-----|----------|----------------|------------|
| Запуск / MVP | 0 | 1K | 0 | 0 |
| Ранний рост | 100 | 1K | 300K | 1.5 TB |
| Рост | 1K | 3K | 3M | 15 TB |
| Масштабирование | 10K | 5K | 30M | 150 TB |
| Крупный игрок в регионе | 50K | 8K | 150M | 750 TB |
| Топ-площадка | 100K | 10K | 300M | 1.5 PB |

---

## Детализация расходов по этапам

### Запуск / MVP (0 DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| AWS CloudFront | нет трафика | $0 |
| AWS S3 | 5 GB × $0.023 | ~$0.12 |
| Railway (backend + Postgres) | Hobby: 0.5GB+1GB RAM, 0.5+0.25 vCPU, 5GB vol | ~$25–30 |
| **Итого** | | **~$25–30/мес** |

---

### Ранний рост (100 DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| AWS CloudFront | 500 GB сверх 1 TB × $0.085 | ~$43 |
| AWS S3 | 5 GB × $0.023 + GET | ~$0.15 |
| Railway | backend 0.5GB/0.5vCPU + postgres 1GB/0.5vCPU | ~$38 |
| **Итого** | | **~$81/мес** |

---

### Рост (1K DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| AWS CloudFront | 14 TB сверх 1 TB (tiered) | ~$1 165 |
| AWS S3 | 15 GB × $0.023 | ~$0.35 |
| Railway | 1GB/0.5vCPU backend + postgres, ~8 GB egress | ~$50 |
| **Итого** | | **~$1 215/мес** |

---

### Масштабирование (10K DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| AWS CloudFront | 149 TB (tiered) + 20M req | ~$10 005 |
| AWS S3 | 25 GB × $0.023 | ~$0.60 |
| Railway | 2 replicas backend, postgres 2GB/1vCPU, ~80 GB egress | ~$110 |
| **Итого** | | **~$10 116/мес** |

---

### Крупный игрок в регионе (50K DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| AWS CloudFront | 749 TB (tiered) + 140M req | ~$32 745 |
| AWS S3 | 40 GB × $0.023 | ~$0.90 |
| Railway | 4–6 replicas, postgres 4GB/2vCPU, ~600 GB egress | ~$250 |
| **Итого** | | **~$32 996/мес** |

---

### Топ-площадка (100K DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| AWS CloudFront | 1.5 PB (tiered) + 290M req | ~$53 875 |
| AWS S3 | 50 GB × $0.023 | ~$1.15 |
| Railway | 8–12 replicas, postgres 8GB/4vCPU, ~1.5 TB egress | ~$500 |
| **Итого** | | **~$54 376/мес** |

*С 10K DAU рекомендуются WebP/AVIF и responsive images — экономия трафика до 60–70%. CloudFront Savings Bundle при объёме от 10 TB — до 30% экономии.*

---

## Сводная таблица

| Целевой горизонт | DAU | AWS | Cloudflare | Railway | **Всего/мес** |
|------------------|-----|-----|------------|---------|---------------|
| Запуск / MVP | 0 | ~$0.12 | $0 | ~$28 | **~$28** |
| Ранний рост | 100 | ~$43 | $0 | ~$38 | **~$81** |
| Рост | 1K | ~$1 165 | $0 | ~$50 | **~$1 215** |
| Масштабирование | 10K | ~$10 006 | $0 | ~$110 | **~$10 116** |
| Крупный игрок в регионе | 50K | ~$32 746 | $0 | ~$250 | **~$32 996** |
| Топ-площадка | 100K | ~$53 876 | $0 | ~$500 | **~$54 376** |

---

## Рекомендации по оптимизации

1. **Картинки:** WebP/AVIF — ожидаемо −60–70% трафика, экономия на CloudFront порядка сотен долларов уже на 10K DAU.
2. **CloudFront:** CloudFront Savings Bundle (коммит от 10 TB) — до ~30% экономии.
3. **Responsive images:** Раздачи под размер экрана вместо одной большой картинки.
4. **Кеш:** Увеличение TTL там, где это допустимо, снижает запросы к origin.
5. **Порог платного трафика:** ≈70 DAU (при 100 картинок/день) до выхода за 1 TB CloudFront.
