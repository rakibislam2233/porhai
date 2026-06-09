import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
const sql = neon(process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/dummy_db');
export const db = drizzle(sql, { schema });
