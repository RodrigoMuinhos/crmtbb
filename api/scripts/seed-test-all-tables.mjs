import { initDatabase, pool, query, testConnection, withTransaction } from '../server/db.js';

function buildIds() {
  const base = `TESTE-${Date.now()}`;

  return {
    base,
    productId: `${base}-PROD`,
    expenseId: `${base}-EXP`,
    purchaseId: `${base}-PUR`,
    purchaseItemId: `${base}-PIT`,
    stockItemId: `${base}-STK`,
    transferId: `${base}-TRF`,
    orderId: `${base}-ORD`,
    orderItemId: `${base}-OIT`,
  };
}

async function insertTestData(ids) {
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO products (
        id, name, price, category, image, active, visible_in_menu, controls_stock, default_stock_location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        ids.productId,
        `TESTE Produto ${ids.base}`,
        12.34,
        'outros',
        null,
        true,
        true,
        true,
        'geral',
      ],
    );

    await client.query(
      `INSERT INTO expenses (
        id, expense_date, value, category, observation, payment_method
      ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)`,
      [
        ids.expenseId,
        8.9,
        'outros',
        `TESTE Gasto ${ids.base}`,
        'PIX',
      ],
    );

    await client.query(
      `INSERT INTO purchases (
        id, purchase_date, store, total_value
      ) VALUES ($1, CURRENT_DATE, $2, $3)`,
      [
        ids.purchaseId,
        `TESTE Loja ${ids.base}`,
        20.5,
      ],
    );

    await client.query(
      `INSERT INTO purchase_items (
        id, purchase_id, name, quantity, cost
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        ids.purchaseItemId,
        ids.purchaseId,
        `TESTE Item Compra ${ids.base}`,
        2,
        10.25,
      ],
    );

    await client.query(
      `INSERT INTO stock_items (
        id, product_id, name, quantity, unit, location, min_quantity, recently_added
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        ids.stockItemId,
        ids.productId,
        `TESTE Estoque ${ids.base}`,
        5,
        'unidades',
        'geral',
        1,
        true,
      ],
    );

    await client.query(
      `INSERT INTO transfer_requests (
        id, stock_item_id, item_name, quantity, unit, requested_at, product_id, min_quantity, status
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)`,
      [
        ids.transferId,
        ids.stockItemId,
        `TESTE Transfer ${ids.base}`,
        1,
        'unidades',
        ids.productId,
        1,
        'pending',
      ],
    );

    await client.query(
      `INSERT INTO orders (
        id, order_date, order_time, total, customer
      ) VALUES ($1, CURRENT_DATE, $2, $3, $4)`,
      [
        ids.orderId,
        '10:10',
        15.75,
        `TESTE Cliente ${ids.base}`,
      ],
    );

    await client.query(
      `INSERT INTO order_items (
        id, order_id, product_id, product_name, quantity, price
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        ids.orderItemId,
        ids.orderId,
        ids.productId,
        `TESTE Item Pedido ${ids.base}`,
        1,
        15.75,
      ],
    );
  });
}

async function verifyInserted(ids) {
  const checks = [
    { table: 'products', id: ids.productId },
    { table: 'expenses', id: ids.expenseId },
    { table: 'purchases', id: ids.purchaseId },
    { table: 'purchase_items', id: ids.purchaseItemId },
    { table: 'stock_items', id: ids.stockItemId },
    { table: 'transfer_requests', id: ids.transferId },
    { table: 'orders', id: ids.orderId },
    { table: 'order_items', id: ids.orderItemId },
  ];

  const results = [];

  for (const check of checks) {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM ${check.table} WHERE id = $1`, [check.id]);
    results.push({
      tabela: check.table,
      id: check.id,
      encontrado: rows[0].count,
      status: rows[0].count === 1 ? 'OK' : 'FALHA',
    });
  }

  return results;
}

async function main() {
  const ids = buildIds();

  try {
    await testConnection();
    await initDatabase();

    await insertTestData(ids);
    const verification = await verifyInserted(ids);

    console.log('\n✅ Seed TESTE inserido em todas as tabelas.');
    console.table(verification);

    const hasFailure = verification.some((row) => row.status !== 'OK');
    if (hasFailure) {
      throw new Error('Uma ou mais tabelas não confirmaram inserção do registro TESTE.');
    }

    console.log(`\n🔎 Prefixo para buscar no Neon Studio: ${ids.base}`);
    console.log('Exemplo de filtro: id começa com TESTE-');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('❌ Falha ao inserir/validar dados TESTE:', error.message);
  process.exit(1);
});
