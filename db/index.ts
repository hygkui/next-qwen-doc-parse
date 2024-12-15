import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL?.replace(/^'|'$/g, '');

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

// Global declarations
declare global {
  var pool: Pool | undefined;
}

// Singleton pattern for database pool
function getPool() {
  if (!global.pool) {
    global.pool = new Pool({
      connectionString,
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
    });

    // Handle pool errors
    global.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return global.pool;
}

// Get or create pool
const pool = getPool();

// Graceful shutdown handler
let isShuttingDown = false;

const shutdown = async () => {
  if (isShuttingDown || !global.pool) {
    return;
  }
  
  isShuttingDown = true;
  console.log('Closing database pool...');
  try {
    await global.pool.end();
    console.log('Database pool closed');
    global.pool = undefined;
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

// Handle process events for clean shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Create db instance with schema
export const db = drizzle(pool, { schema });

// Helper function to test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// For migrations
export { schema };
