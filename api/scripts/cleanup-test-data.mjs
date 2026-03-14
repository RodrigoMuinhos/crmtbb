import { pool, query, testConnection, withTransaction } from '../server/db.js';

async function deleteByPrefix(client, table, prefix = 'TESTE-%') {
  const result = await client.query(`DELETE FROM ${table} WHERE id LIKE $1`, [prefix]);
  return result.rowCount;
}

async function cleanupTestRows() {
  return withTransaction(async (client) => {
    const deleted = {};

    // Ordem respeitando FKs
    deleted.transfer_requests = await deleteByPrefix(client, 'transfer_requests');
    deleted.order_items = await deleteByPrefix(client, 'order_items');
    deleted.orders = await deleteByPrefix(client, 'orders');
    deleted.purchase_items = await deleteByPrefix(client, 'purchase_items');
    deleted.purchases = await deleteByPrefix(client, 'purchases');
    deleted.stock_items = await deleteByPrefix(client, 'stock_items');
    deleted.expenses = await deleteByPrefix(client, 'expenses');
    deleted.products = await deleteByPrefix(client, 'products');

    return deleted;
  });
}

async function countRemaining() {
  const tables = [
    'products',
    'expenses',
    'purchases',
    'purchase_items',
    'stock_items',
    'transfer_requests',
    'orders',
    'order_items',
  ];

  const remaining = {};

  for (const table of tables) {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM ${table} WHERE id LIKE 'TESTE-%'`);
    remaining[table] = rows[0].count;
  }

  return remaining;
}

async function main() {
  try {
    await testConnection();

    const deleted = await cleanupTestRows();
    const remaining = await countRemaining();

    console.log('🧹 Registros TESTE removidos por tabela:');
    console.table(deleted);

    console.log('🔎 Restante TESTE por tabela:');
    console.table(remaining);

    const hasRemaining = Object.values(remaining).some((count) => count > 0);
    if (hasRemaining) {
      throw new Error('Ainda existem registros TESTE em uma ou mais tabelas.');
    }

    console.log('✅ Limpeza concluída. Não há registros TESTE-* no banco.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('❌ Falha na limpeza de dados TESTE:', error.message);
  process.exit(1);
});
