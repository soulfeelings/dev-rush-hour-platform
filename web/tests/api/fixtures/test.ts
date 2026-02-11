import { test as base, expect } from '@playwright/test';
import { Pool, type PoolConfig } from 'pg';
import { AdminClients } from '../clients/admin';

type DbFixture = {
  pool: Pool;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
};

type ApiClientsFixture = {
  admin: AdminClients;
};

type WorkerFixtures = {
  dbPool: Pool;
};

function getDbConfig(): PoolConfig {
  const databaseUrl = process.env.DATABASE_URL;
  const sslMode = process.env.DB_SSLMODE ?? 'disable';

  if (databaseUrl) {
    return {
      connectionString: databaseUrl,
      ssl: sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
    };
  }

  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '5432'),
    user: process.env.DB_USER ?? 'rushhour',
    password: process.env.DB_PASSWORD ?? 'rushhour_dev',
    database: process.env.DB_NAME ?? 'rushhour_db',
    ssl: sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
  };
}

const test = base.extend<
  { db: DbFixture; api: ApiClientsFixture },
  WorkerFixtures
>({
  dbPool: [
    async ({}, use) => {
      const pool = new Pool(getDbConfig());
      try {
        await use(pool);
      } finally {
        await pool.end();
      }
    },
    { scope: 'worker' },
  ],
  db: async ({ dbPool }, use) => {
    const query = async <T = any>(sql: string, params: any[] = []) => {
      const result = await dbPool.query(sql, params);
      return result.rows as T[];
    };

    await use({ pool: dbPool, query });
  },
  api: async ({ request }, use) => {
    await use({ admin: new AdminClients(request) });
  },
});

export { test, expect };
