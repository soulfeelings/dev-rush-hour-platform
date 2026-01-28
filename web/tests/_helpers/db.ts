import { Pool, type PoolConfig } from 'pg'

function getDbConfig(): PoolConfig {
  const databaseUrl = process.env.DATABASE_URL
  const sslMode = process.env.DB_SSLMODE ?? 'disable'

  if (databaseUrl) {
    return {
      connectionString: databaseUrl,
      ssl: sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
    }
  }

  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '5432'),
    user: process.env.DB_USER ?? 'rushhour',
    password: process.env.DB_PASSWORD ?? 'rushhour_dev',
    database: process.env.DB_NAME ?? 'rushhour_db',
    ssl: sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
  }
}

export function createDbPool(): Pool {
  return new Pool(getDbConfig())
}
