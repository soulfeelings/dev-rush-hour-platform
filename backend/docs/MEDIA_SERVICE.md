# Media Service Documentation

## Overview

The Media Service provides file storage and delivery with support for local filesystem and Cloudflare Images.

**Key Features:**
- **Local mode** (dev): Multipart upload to local filesystem
- **Cloudflare Images** (production): Proxy upload to CF, delivery via imagedelivery.net
- **Responsive variants:** thumbnail, card, medium, hero, full (OpenAPI ImageVariant)
- **expiresIn** is always 0 (URLs don't expire for either driver)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Media Service                            │
├─────────────────────────────────────────────────────────────────┤
│  MediaService (business logic)                                  │
│    ├── MediaRepo (database)                                     │
│    ├── MediaStorage                                             │
│    │     ├── LocalStorage                                       │
│    │     └── CFImagesStorage                                    │
│    └── MediaDelivery                                            │
│          ├── LocalDelivery                                       │
│          └── CFImagesDelivery                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

```bash
# Storage driver: "local" or "cloudflare_images"
MEDIA_DRIVER=local

# Local storage settings
MEDIA_UPLOAD_DIR=./uploads
MEDIA_PUBLIC_URL=http://localhost:8080/api/media

# Cloudflare Images (required when MEDIA_DRIVER=cloudflare_images)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_IMAGES_ACCOUNT_HASH=hash-from-imagedelivery-url
```

### Example: Local Development

```bash
MEDIA_DRIVER=local
MEDIA_UPLOAD_DIR=./uploads
MEDIA_PUBLIC_URL=http://localhost:8080/api/media
```

### Example: Production with Cloudflare Images

```bash
MEDIA_DRIVER=cloudflare_images
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_IMAGES_ACCOUNT_HASH=Vi7wi5KSItxGFsWRG2Us6Q
```

## Database

storage_driver: `local` | `cloudflare_images` (migration 000021)

## API Endpoints

### Admin

- **POST /api/admin/media/upload** — Multipart upload (local saves to disk, CF proxies to direct_upload)
- **POST /api/admin/media/init** — Init flow (returns upload URL; for CF = backend proxy URL)
- **POST /api/admin/media/complete** — Mark ready (for presigned flow; CF uses proxy, no complete)
- **DELETE /api/admin/media/:id** — Soft delete
- **GET /api/admin/media** — List media

### Public

- **GET /api/media/:id/url** — Single URL
- **POST /api/media/urls** — Batch URLs (max 50)

For CF: URL is base `https://imagedelivery.net/{hash}/{id}`, frontend appends `/{variant}`.

## Image Variants (Cloudflare Images)

| Variant   | Usage                 |
|----------|------------------------|
| thumbnail| Миниатюры, списки      |
| card     | ProjectCard, LotCard   |
| medium   | Модалки                |
| hero     | Hero, галерея          |
| full     | Lightbox, полный размер|

## Frontend: getImageUrl

```typescript
import { getImageUrl } from '../utils/imageUrl'

// CF: baseUrl + /card; local: url as-is
<img src={getImageUrl(url, 'card')} alt="..." />
```

## Limits

- Max file size: 10 MB
- Batch max: 50 IDs
