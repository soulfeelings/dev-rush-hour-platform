import { createHmac } from 'node:crypto'
import { Client, type ClientConfig } from 'pg'
import type { BrowserContext } from '@playwright/test'

const ADMIN_COOKIE_NAME = 'rh_admin_jwt'
const DEFAULT_ADMIN_EMAIL = 'ui-tests@local'
const DEFAULT_ADMIN_ROLE = 'superadmin'
const DEFAULT_JWT_TTL_SECONDS = 60 * 60
const DEV_DEFAULT_JWT_SECRET = 'dev-secret-change-in-production'

function asPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function encodeBase64Url(input: string): string {
  return Buffer.from(input).toString('base64url')
}

function signHs256(headerPart: string, payloadPart: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${headerPart}.${payloadPart}`)
    .digest('base64url')
}

function getAdminEmail(): string {
  return process.env.API_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL
}

function getAdminRole(): string {
  return process.env.API_ADMIN_ROLE ?? DEFAULT_ADMIN_ROLE
}

function getAdminPermissions(): string[] {
  const raw = process.env.API_ADMIN_PERMISSIONS
  if (!raw) return []
  return raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function buildAdminJwt(): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const ttlSeconds = asPositiveInt(process.env.API_ADMIN_JWT_TTL_SECONDS, DEFAULT_JWT_TTL_SECONDS)
  const payload = {
    sub: getAdminEmail(),
    iat: now,
    exp: now + ttlSeconds,
    role: getAdminRole(),
    permissions: getAdminPermissions(),
  }

  const encodedHeader = encodeBase64Url(JSON.stringify(header))
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const secret = process.env.API_ADMIN_JWT_SECRET ?? process.env.JWT_SECRET ?? DEV_DEFAULT_JWT_SECRET
  const signature = signHs256(encodedHeader, encodedPayload, secret)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function getAdminJwtToken(): string {
  return process.env.API_ADMIN_JWT ?? buildAdminJwt()
}

export function buildAdminCookieHeader(): Record<string, string> {
  return { Cookie: `${ADMIN_COOKIE_NAME}=${getAdminJwtToken()}` }
}

function buildDbConfigCandidates(): ClientConfig[] {
  const explicitUrl = process.env.ADMIN_TEST_DATABASE_URL ?? process.env.DATABASE_URL
  if (explicitUrl) {
    return [{ connectionString: explicitUrl, connectionTimeoutMillis: 3000 }]
  }

  const port = asPositiveInt(process.env.ADMIN_DB_PORT ?? process.env.DB_PORT, 5432)
  const user = process.env.ADMIN_DB_USER ?? process.env.DB_USER ?? 'rushhour'
  const password = process.env.ADMIN_DB_PASSWORD ?? process.env.DB_PASSWORD ?? 'rushhour_dev'
  const database = process.env.ADMIN_DB_NAME ?? process.env.DB_NAME ?? 'rushhour_db'

  const hosts = Array.from(
    new Set([
      process.env.ADMIN_DB_HOST,
      process.env.DB_HOST,
      'localhost',
      '127.0.0.1',
      'postgres',
    ].filter(Boolean))
  ) as string[]

  return hosts.map(host => ({
    host,
    port,
    user,
    password,
    database,
    connectionTimeoutMillis: 3000,
  }))
}

async function connectToDb(): Promise<Client> {
  const candidates = buildDbConfigCandidates()
  const errors: string[] = []

  for (const config of candidates) {
    const client = new Client(config)
    try {
      await client.connect()
      return client
    } catch (error) {
      const hostLabel = config.connectionString ?? config.host ?? 'unknown'
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${hostLabel}: ${message}`)
      await client.end().catch(() => undefined)
    }
  }

  throw new Error(`Unable to connect to DB for admin test bootstrap. Tried: ${errors.join(' | ')}`)
}

export async function ensureAdminUser(): Promise<void> {
  const client = await connectToDb()
  try {
    await client.query(
      `
        INSERT INTO admin_users (email, role, permissions, created_by)
        VALUES ($1, $2, $3::text[], $4)
        ON CONFLICT (email) DO UPDATE
        SET
            role = EXCLUDED.role,
            permissions = EXCLUDED.permissions,
            created_by = EXCLUDED.created_by
      `,
      [getAdminEmail(), getAdminRole(), getAdminPermissions(), 'ui-tests-auth']
    )
  } finally {
    await client.end()
  }
}

export async function authenticateAdminContext(context: BrowserContext, baseURL: string): Promise<void> {
  await ensureAdminUser()
  await context.addCookies([
    {
      name: ADMIN_COOKIE_NAME,
      value: getAdminJwtToken(),
      url: baseURL,
    },
  ])
}
