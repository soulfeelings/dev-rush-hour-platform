# Media Service Documentation

## Overview

The Media Service provides file storage and delivery with support for both local filesystem and AWS S3 (or compatible) storage backends.

**Key Features:**
- **Local mode** (dev): Traditional multipart upload to local filesystem
- **S3 mode** (production): Presigned PUT URLs for direct client upload to S3
- **Private bucket**: Files are stored in a private S3 bucket
- **Signed URLs**: Read access is provided via time-limited signed URLs
- **Future-ready**: Architecture supports adding CloudFront CDN delivery

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Media Service                            │
├─────────────────────────────────────────────────────────────────┤
│  MediaService (business logic)                                  │
│    ├── MediaRepo (database)                                     │
│    ├── MediaStorage (upload/delete objects)                     │
│    │     ├── LocalStorage                                       │
│    │     └── S3Storage                                          │
│    └── MediaDelivery (generate read URLs)                       │
│          ├── LocalDelivery                                      │
│          ├── S3PresignDelivery                                  │
│          └── CloudFrontDelivery (placeholder)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

```bash
# Storage driver: "local" or "s3"
MEDIA_DRIVER=local

# Local storage settings
MEDIA_UPLOAD_DIR=./uploads
MEDIA_PUBLIC_URL=http://localhost:8080/api/media

# Signed URL TTL in seconds (default 1 hour)
MEDIA_SIGNED_TTL_SECONDS=3600

# S3 settings (required when MEDIA_DRIVER=s3)
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ENDPOINT=                    # Optional: for S3-compatible services (MinIO, etc.)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_FORCE_PATH_STYLE=false       # Set true for S3-compatible services
```

### Example: Local Development

```bash
MEDIA_DRIVER=local
MEDIA_UPLOAD_DIR=./uploads
MEDIA_PUBLIC_URL=http://localhost:8080/api/media
```

### Example: Railway/Production with AWS S3

```bash
MEDIA_DRIVER=s3
MEDIA_SIGNED_TTL_SECONDS=3600
S3_BUCKET=rush-hour-media
S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

## Database Migration

Apply the migration to create the `media` table:

```bash
# Using golang-migrate
migrate -path internal/migrations -database "postgres://..." up
```

The migration creates:
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY,
    storage_key TEXT NOT NULL UNIQUE,
    original_name TEXT,
    mime_type TEXT NOT NULL,
    ext TEXT NOT NULL,
    size_bytes BIGINT,
    storage_driver TEXT NOT NULL,  -- "local" | "s3"
    status TEXT NOT NULL,          -- "pending" | "ready" | "deleted"
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
```

## API Endpoints

### Admin Endpoints (require `X-Admin-Key` header)

#### 1. Initialize Upload (S3 presigned)
```
POST /api/admin/media/init
Content-Type: application/json

{
  "mimeType": "image/jpeg",
  "originalName": "photo.jpg"
}

Response 200:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "550e8400-e29b-41d4-a716-446655440000.jpg",
  "upload": {
    "url": "https://bucket.s3.amazonaws.com/...",
    "fields": { "Content-Type": "image/jpeg" }
  }
}
```

#### 2. Complete Upload
```
POST /api/admin/media/complete
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}

Response 200:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ready"
}
```

#### 3. Delete Media
```
DELETE /api/admin/media/{id}

Response 200:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "deleted"
}
```

#### 4. List Media
```
GET /api/admin/media?status=ready&limit=20&offset=0

Response 200:
[
  {
    "id": "...",
    "mimeType": "image/jpeg",
    "ext": ".jpg",
    "sizeBytes": 123456,
    "status": "ready",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### 5. Legacy Multipart Upload (backward compatible)
```
POST /api/admin/media/upload
Content-Type: multipart/form-data

file: <binary>

Response 201:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "http://localhost:8080/api/media/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

### Public Endpoints

#### 1. Get Single URL
```
GET /api/media/{id}/url

Response 200:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://signed-url...",
  "expiresIn": 3600
}
```

#### 2. Get Batch URLs (max 50)
```
POST /api/media/urls
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}

Response 200:
{
  "items": [
    { "id": "uuid1", "url": "...", "expiresIn": 3600 },
    { "id": "uuid2", "url": "...", "expiresIn": 3600 }
  ],
  "notFound": ["uuid3"]
}
```

## Upload Flow

### S3 Mode (Production)

```
┌─────────┐     ┌─────────┐     ┌────────┐
│ Frontend│     │ Backend │     │   S3   │
└────┬────┘     └────┬────┘     └────┬───┘
     │               │               │
     │ 1. POST /init │               │
     │──────────────>│               │
     │               │               │
     │ 2. presigned  │               │
     │    URL + id   │               │
     │<──────────────│               │
     │               │               │
     │ 3. PUT file directly          │
     │───────────────────────────────>
     │               │               │
     │ 4. POST /complete             │
     │──────────────>│               │
     │               │ 5. HEAD       │
     │               │──────────────>│
     │               │<──────────────│
     │ 6. {status:   │               │
     │    "ready"}   │               │
     │<──────────────│               │
```

### Local Mode (Development)

```
┌─────────┐     ┌─────────┐
│ Frontend│     │ Backend │
└────┬────┘     └────┬────┘
     │               │
     │ 1. POST /upload (multipart)
     │──────────────>│
     │               │
     │ 2. {id, url}  │
     │<──────────────│
```

## Frontend Integration

### Storing Media References

**Old way (don't store URLs):**
```json
{
  "data": {
    "media": {
      "cover": { "url": "http://..." }
    }
  }
}
```

**New way (store mediaId):**
```json
{
  "data": {
    "media": {
      "coverId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### Getting URLs for Display

```typescript
// Single image
const response = await fetch(`/api/media/${coverId}/url`);
const { url, expiresIn } = await response.json();

// Batch (for catalog pages)
const response = await fetch('/api/media/urls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ids: mediaIds })
});
const { items, notFound } = await response.json();
```

### Upload Flow (S3)

```typescript
// 1. Initialize upload
const initRes = await fetch('/api/admin/media/init', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Key': adminKey
  },
  body: JSON.stringify({
    mimeType: file.type,
    originalName: file.name
  })
});
const { id, upload } = await initRes.json();

// 2. Upload directly to S3
await fetch(upload.url, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file
});

// 3. Complete upload
await fetch('/api/admin/media/complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Key': adminKey
  },
  body: JSON.stringify({ id })
});

// 4. Store the id in your form data
form.coverId = id;
```

## Allowed MIME Types

| MIME Type    | Extension |
|--------------|-----------|
| image/jpeg   | .jpg      |
| image/png    | .png      |
| image/webp   | .webp     |
| image/gif    | .gif      |

To add more types, modify `AllowedMimeTypes` in `internal/domain/media.go`.

## Limits

- **Max file size:** 10 MB
- **Upload policy TTL:** 5 minutes
- **Read URL TTL:** Configurable (default 1 hour)
- **Batch request max:** 50 IDs

## Security Notes

1. **S3 bucket is PRIVATE** - no public access
2. **Signed URLs** provide time-limited access
3. **Admin endpoints** require `X-Admin-Key` authentication
4. **Public URL endpoints** don't require auth (intentional for catalog display)
5. **Batch limit** prevents mass URL generation abuse

## Future Improvements

- **CloudFront integration:** Add `CloudFrontDelivery` for CDN-backed signed cookies/URLs
- **Image processing:** Resize, optimize on upload
- **Metadata extraction:** EXIF, dimensions
- **Rate limiting:** On public URL endpoints
