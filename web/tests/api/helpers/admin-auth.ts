import { createHmac } from 'node:crypto';

const ADMIN_COOKIE_NAME = 'rh_admin_jwt';
const DEFAULT_ADMIN_EMAIL = 'api-tests@local';
const DEFAULT_ADMIN_ROLE = 'superadmin';
const DEFAULT_JWT_TTL_SECONDS = 15 * 60;
const DEV_DEFAULT_JWT_SECRET = 'dev-secret-change-in-production';

function asPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function encodeBase64Url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function signHs256(headerPart: string, payloadPart: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${headerPart}.${payloadPart}`)
    .digest('base64url');
}

function buildAdminJwt(): string {
  const header = { alg: 'HS256', typ: 'JWT' };

  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = asPositiveInt(process.env.API_ADMIN_JWT_TTL_SECONDS, DEFAULT_JWT_TTL_SECONDS);
  const payload = {
    sub: process.env.API_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL,
    iat: now,
    exp: now + ttlSeconds,
    role: process.env.API_ADMIN_ROLE ?? DEFAULT_ADMIN_ROLE,
    permissions: [] as string[],
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const secret =
    process.env.API_ADMIN_JWT_SECRET ??
    process.env.JWT_SECRET ??
    DEV_DEFAULT_JWT_SECRET;
  const signature = signHs256(encodedHeader, encodedPayload, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function buildAdminCookieHeader(path: string): Record<string, string> | undefined {
  if (!path.startsWith('/api/admin/')) return undefined;
  if (process.env.API_TEST_ADMIN_AUTH === '0') return undefined;

  const token = process.env.API_ADMIN_JWT ?? buildAdminJwt();
  return { Cookie: `${ADMIN_COOKIE_NAME}=${token}` };
}
