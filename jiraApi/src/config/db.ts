import env from './environment';
//import { initSchema } from './schema';

import { drizzle } from 'drizzle-orm/node-postgres';

import pg from 'pg';
const { Pool } = pg;
// postgresql://postgres:1234@localhost:5432/jira_db
const dbUrl = `postgresql://${env.DB_USERNAME}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}`;
const pool = new Pool({
  connectionString: dbUrl,
});

export const db = drizzle(pool);

