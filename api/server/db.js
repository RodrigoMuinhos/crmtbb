import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

dotenv.config();

function buildConnectionString(rawValue) {
  if (!rawValue) {
    throw new Error('DATABASE_URL ou JDBC_DATABASE_URL não foi configurada.');
  }

  if (!rawValue.startsWith('jdbc:postgresql://')) {
    return rawValue;
  }

  const jdbcUrl = new URL(rawValue.replace(/^jdbc:/, ''));
  const user = jdbcUrl.searchParams.get('user') ?? jdbcUrl.username;
  const password = jdbcUrl.searchParams.get('password') ?? jdbcUrl.password;
  const sslMode = jdbcUrl.searchParams.get('sslmode') ?? 'require';
  const channelBinding = jdbcUrl.searchParams.get('channelBinding') ?? jdbcUrl.searchParams.get('channel_binding');

  if (!user || !password) {
    throw new Error('A JDBC_DATABASE_URL precisa conter user e password.');
  }

  const connectionUrl = new URL(`postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${jdbcUrl.host}${jdbcUrl.pathname}`);
  connectionUrl.searchParams.set('sslmode', sslMode);

  if (channelBinding) {
    connectionUrl.searchParams.set('channel_binding', channelBinding);
  }

  return connectionUrl.toString();
}

const connectionString = buildConnectionString(process.env.DATABASE_URL || process.env.JDBC_DATABASE_URL);

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function testConnection() {
  await query('SELECT 1');
}

export async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      visible_in_menu BOOLEAN NOT NULL DEFAULT TRUE,
      controls_stock BOOLEAN NOT NULL DEFAULT FALSE,
      default_stock_location TEXT NOT NULL CHECK (default_stock_location IN ('vitrine', 'geral')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      expense_date DATE NOT NULL,
      value NUMERIC(10, 2) NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('mercado', 'insumos', 'embalagens', 'outros')),
      observation TEXT,
      payment_method TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      purchase_date DATE NOT NULL,
      store TEXT NOT NULL,
      total_value NUMERIC(10, 2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY,
      purchase_id TEXT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12, 2) NOT NULL,
      cost NUMERIC(10, 2)
    );

    CREATE TABLE IF NOT EXISTS stock_items (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      name TEXT NOT NULL,
      quantity NUMERIC(12, 2) NOT NULL,
      unit TEXT NOT NULL,
      location TEXT NOT NULL CHECK (location IN ('geral', 'armazenado', 'vitrine')),
      min_quantity NUMERIC(12, 2),
      recently_added BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transfer_requests (
      id TEXT PRIMARY KEY,
      stock_item_id TEXT NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      quantity NUMERIC(12, 2) NOT NULL,
      unit TEXT NOT NULL,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      product_id TEXT,
      min_quantity NUMERIC(12, 2),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_date DATE NOT NULL,
      order_time TEXT NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      customer TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT,
      product_name TEXT NOT NULL,
      quantity NUMERIC(12, 2) NOT NULL,
      price NUMERIC(10, 2) NOT NULL
    );
  `);
}
