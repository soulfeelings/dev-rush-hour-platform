# Прогноз расходов на инфраструктуру

Перспективы возможных трат — от запуска до 100K DAU.

**Источники тарифов (2025):** [Cloudflare Images](https://developers.cloudflare.com/images/pricing), [Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/), [Railway](https://railway.com/pricing)

**Архитектура:** Cloudflare Pages (frontend) + Railway (backend + PostgreSQL) + Cloudflare Images (медиа).

**Допущения:**
- 100 просмотров картинок на DAU в день (типично для каталога недвижимости)
- 5 размеров на картинку (thumbnail, card, medium, hero, full) — ~2× доставок из‑за разных размеров в UI
- 5 MB на картинку
- DAU ≈ 10% от MAU
- API: ~20 запросов на DAU/день, ~2 KB на ответ

---

## Тарифы (актуальны на 2025)

### Cloudflare Pages
| Ресурс | Лимит | Цена |
|--------|-------|------|
| Bandwidth (статический трафик) | Unlimited | $0 |
| Builds | 500/мес | $0 |
| Pro (при >500 builds) | — | $20/мес |

### Cloudflare Images
| Метрика | Цена |
|---------|------|
| Images Stored | $5 / 100K картинок/мес |
| Images Delivered | $1 / 100K доставок/мес |

При 5 размерах (thumbnail, card, medium, hero, full) каждая доставка — отдельный запрос; за счёт разных размеров в UI доставок ~2× (напр., миниатюра в списке + крупная в детали).

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

| Целевой горизонт | DAU | Картинок | Просмотров/мес | Доставок/мес (×2, 5 размеров) |
|------------------|-----|----------|----------------|-------------------------------|
| Запуск / MVP | 0 | 1K | 0 | 0 |
| Ранний рост | 100 | 1K | 300K | 600K |
| Рост | 1K | 3K | 3M | 6M |
| Масштабирование | 10K | 5K | 30M | 60M |
| Крупный игрок в регионе | 50K | 8K | 150M | 300M |
| Топ-площадка | 100K | 10K | 300M | 600M |

---

## Детализация расходов по этапам

### Запуск / MVP (0 DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| Cloudflare Images | Storage пакет $5 (≤100K изображений), без delivery | ~$5 |
| Railway (backend + Postgres) | Hobby: 0.5GB+1GB RAM, 0.5+0.25 vCPU, 5GB vol | ~$25–30 |
| **Итого** | | **~$25–30/мес** |

---

### Ранний рост (100 DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| Cloudflare Images | 1K stored (storage $5) + 600K delivered ($6) | ~$11 |
| Railway | backend 0.5GB/0.5vCPU + postgres 1GB/0.5vCPU | ~$38 |
| **Итого** | | **~$44/мес** |

---

### Рост (1K DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| Cloudflare Images | 3K stored (storage $5) + 6M delivered ($60) | ~$65 |
| Railway | 1GB/0.5vCPU backend + postgres, ~8 GB egress | ~$50 |
| **Итого** | | **~$110/мес** |

---

### Масштабирование (10K DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| Cloudflare Images | 5K stored (storage $5) + 60M delivered ($600) | ~$605 |
| Railway | 2 replicas backend, postgres 2GB/1vCPU, ~80 GB egress | ~$110 |
| **Итого** | | **~$710/мес** |

---

### Крупный игрок в регионе (50K DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| Cloudflare Images | 8K stored (storage $5) + 300M delivered ($3 000) | ~$3 005 |
| Railway | 4–6 replicas, postgres 4GB/2vCPU, ~600 GB egress | ~$250 |
| **Итого** | | **~$3 251/мес** |

---

### Топ-площадка (100K DAU)
| Сервис | Расчёт | Стоимость |
|--------|--------|-----------|
| Cloudflare Pages | Unlimited static | $0 |
| Cloudflare Images | 10K stored (storage $5) + 600M delivered ($6 000) | ~$6 005 |
| Railway | 8–12 replicas, postgres 8GB/4vCPU, ~1.5 TB egress | ~$500 |
| **Итого** | | **~$6 501/мес** |

---

## Сводная таблица

| Целевой горизонт | DAU | CF Images | CF Pages | Railway | **Всего/мес** |
|------------------|-----|------------|----------|---------|---------------|
| Запуск / MVP | 0 | ~$5 | $0 | ~$28 | **~$33** |
| Ранний рост | 100 | ~$11 | $0 | ~$38 | **~$49** |
| Рост | 1K | ~$65 | $0 | ~$50 | **~$115** |
| Масштабирование | 10K | ~$605 | $0 | ~$110 | **~$715** |
| Крупный игрок в регионе | 50K | ~$3 005 | $0 | ~$250 | **~$3 255** |
| Топ-площадка | 100K | ~$6 005 | $0 | ~$500 | **~$6 505** |

---

## Рекомендации по оптимизации

1. **Размеры:** 3 размера вместо 5 — меньше доставок при сопоставимом UX.
2. **Кеш:** Cloudflare кеширует доставки — повторные просмотры не всегда считаются как новые.
3. **Format auto:** Cloudflare Images автоматически отдаёт WebP/AVIF — экономия трафика встроена.
4. **Builds:** При >500 builds/мес — Cloudflare Pages Pro $20/мес.