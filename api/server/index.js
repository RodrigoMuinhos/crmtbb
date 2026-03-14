import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { randomUUID } from 'node:crypto';
import { initDatabase, query, testConnection, withTransaction } from './db.js';
import { swaggerSpec } from './swagger.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

const parseNumber = (value) => (value === undefined || value === null || value === '' ? null : Number(value));

const toProduct = (row) => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  category: row.category,
  image: row.image,
  active: row.active,
  visibleInMenu: row.visibleInMenu,
  controlsStock: row.controlsStock,
  defaultStockLocation: row.defaultStockLocation,
});

const toExpense = (row) => ({
  id: row.id,
  date: row.date,
  value: Number(row.value),
  category: row.category,
  observation: row.observation,
  paymentMethod: row.paymentMethod,
});

const toStockItem = (row) => ({
  id: row.id,
  productId: row.productId || '',
  name: row.name,
  quantity: Number(row.quantity),
  unit: row.unit,
  location: row.location,
  minQuantity: row.minQuantity === null ? undefined : Number(row.minQuantity),
  recentlyAdded: row.recentlyAdded,
});

const toTransferRequest = (row) => ({
  id: row.id,
  stockItemId: row.stockItemId,
  itemName: row.itemName,
  quantity: Number(row.quantity),
  unit: row.unit,
  requestedAt: row.requestedAt,
  productId: row.productId || '',
  minQuantity: row.minQuantity === null ? undefined : Number(row.minQuantity),
  status: row.status,
});

const toOrderItem = (row) => ({
  productId: row.productId || '',
  productName: row.productName,
  quantity: Number(row.quantity),
  price: Number(row.price),
});

async function listProducts() {
  const { rows } = await query(`
    SELECT
      id,
      name,
      price::float AS price,
      category,
      image,
      active,
      visible_in_menu AS "visibleInMenu",
      controls_stock AS "controlsStock",
      default_stock_location AS "defaultStockLocation"
    FROM products
    ORDER BY name ASC
  `);

  return rows.map(toProduct);
}

async function listExpenses(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.date) {
    values.push(filters.date);
    conditions.push(`expense_date = $${values.length}`);
  }

  if (filters.month) {
    values.push(`${filters.month}-01`);
    conditions.push(`date_trunc('month', expense_date) = date_trunc('month', $${values.length}::date)`);
  }

  if (filters.startDate) {
    values.push(filters.startDate);
    conditions.push(`expense_date >= $${values.length}`);
  }

  if (filters.endDate) {
    values.push(filters.endDate);
    conditions.push(`expense_date <= $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(`
    SELECT
      id,
      expense_date::text AS date,
      value::float AS value,
      category,
      observation,
      payment_method AS "paymentMethod"
    FROM expenses
    ${whereClause}
    ORDER BY expense_date DESC, created_at DESC
  `, values);

  return rows.map(toExpense);
}

async function listStockItems(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.location) {
    values.push(filters.location);
    conditions.push(`location = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(`
    SELECT
      id,
      product_id AS "productId",
      name,
      quantity::float AS quantity,
      unit,
      location,
      min_quantity::float AS "minQuantity",
      recently_added AS "recentlyAdded"
    FROM stock_items
    ${whereClause}
    ORDER BY location ASC, name ASC
  `, values);

  return rows.map(toStockItem);
}

async function listTransferRequests(status = 'pending') {
  const values = [];
  const whereClause = status ? `WHERE status = $1` : '';

  if (status) {
    values.push(status);
  }

  const { rows } = await query(`
    SELECT
      id,
      stock_item_id AS "stockItemId",
      item_name AS "itemName",
      quantity::float AS quantity,
      unit,
      requested_at AS "requestedAt",
      product_id AS "productId",
      min_quantity::float AS "minQuantity",
      status
    FROM transfer_requests
    ${whereClause}
    ORDER BY requested_at DESC
  `, values);

  return rows.map(toTransferRequest);
}

async function listPurchases() {
  const purchasesResult = await query(`
    SELECT
      id,
      purchase_date::text AS date,
      store,
      total_value::float AS "totalValue"
    FROM purchases
    ORDER BY purchase_date DESC, created_at DESC
  `);

  const itemsResult = await query(`
    SELECT
      id,
      purchase_id AS "purchaseId",
      name,
      quantity::float AS quantity,
      cost::float AS cost
    FROM purchase_items
    ORDER BY name ASC
  `);

  const itemsByPurchase = new Map();
  for (const item of itemsResult.rows) {
    if (!itemsByPurchase.has(item.purchaseId)) {
      itemsByPurchase.set(item.purchaseId, []);
    }

    itemsByPurchase.get(item.purchaseId).push({
      id: item.id,
      name: item.name,
      quantity: Number(item.quantity),
      cost: item.cost === null ? undefined : Number(item.cost),
    });
  }

  return purchasesResult.rows.map((row) => ({
    id: row.id,
    date: row.date,
    store: row.store,
    totalValue: row.totalValue === null ? undefined : Number(row.totalValue),
    items: itemsByPurchase.get(row.id) || [],
  }));
}

async function listOrders(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.date) {
    values.push(filters.date);
    conditions.push(`order_date = $${values.length}`);
  }

  if (filters.month) {
    values.push(`${filters.month}-01`);
    conditions.push(`date_trunc('month', order_date) = date_trunc('month', $${values.length}::date)`);
  }

  if (filters.startDate) {
    values.push(filters.startDate);
    conditions.push(`order_date >= $${values.length}`);
  }

  if (filters.endDate) {
    values.push(filters.endDate);
    conditions.push(`order_date <= $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const ordersResult = await query(`
    SELECT
      id,
      order_date::text AS date,
      order_time AS time,
      total::float AS total,
      customer
    FROM orders
    ${whereClause}
    ORDER BY order_date DESC, order_time DESC
  `, values);

  const itemsResult = await query(`
    SELECT
      order_id AS "orderId",
      product_id AS "productId",
      product_name AS "productName",
      quantity::float AS quantity,
      price::float AS price
    FROM order_items
  `);

  const itemsByOrder = new Map();
  for (const item of itemsResult.rows) {
    if (!itemsByOrder.has(item.orderId)) {
      itemsByOrder.set(item.orderId, []);
    }

    itemsByOrder.get(item.orderId).push(toOrderItem(item));
  }

  return ordersResult.rows.map((row) => ({
    id: row.id,
    date: row.date,
    time: row.time,
    total: Number(row.total),
    customer: row.customer,
    items: itemsByOrder.get(row.id) || [],
  }));
}

async function loadBootstrapData() {
  const [products, expenses, purchases, stock, orders, pendingTransfers] = await Promise.all([
    listProducts(),
    listExpenses(),
    listPurchases(),
    listStockItems(),
    listOrders(),
    listTransferRequests('pending'),
  ]);

  return { products, expenses, purchases, stock, orders, pendingTransfers };
}

app.get('/api/health', async (_req, res) => {
  try {
    await testConnection();
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(500).json({ ok: false, database: 'disconnected', message: error.message });
  }
});

app.get('/api/bootstrap', async (_req, res, next) => {
  try {
    res.json(await loadBootstrapData());
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (_req, res, next) => {
  try {
    res.json(await listProducts());
  } catch (error) {
    next(error);
  }
});

app.post('/api/products', async (req, res, next) => {
  try {
    const payload = req.body;
    const id = randomUUID();

    const { rows } = await query(`
      INSERT INTO products (
        id, name, price, category, image, active, visible_in_menu, controls_stock, default_stock_location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        name,
        price::float AS price,
        category,
        image,
        active,
        visible_in_menu AS "visibleInMenu",
        controls_stock AS "controlsStock",
        default_stock_location AS "defaultStockLocation"
    `, [
      id,
      payload.name,
      Number(payload.price),
      payload.category,
      payload.image || null,
      payload.active ?? true,
      payload.visibleInMenu ?? true,
      payload.controlsStock ?? false,
      payload.defaultStockLocation ?? 'geral',
    ]);

    res.status(201).json(toProduct(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.patch('/api/products/:id', async (req, res, next) => {
  try {
    const payload = req.body;
    const fieldMap = {
      name: 'name',
      price: 'price',
      category: 'category',
      image: 'image',
      active: 'active',
      visibleInMenu: 'visible_in_menu',
      controlsStock: 'controls_stock',
      defaultStockLocation: 'default_stock_location',
    };

    const updates = [];
    const values = [];

    for (const [key, column] of Object.entries(fieldMap)) {
      if (key in payload) {
        values.push(key === 'price' ? Number(payload[key]) : payload[key]);
        updates.push(`${column} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
    }

    values.push(req.params.id);
    const { rows } = await query(`
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING
        id,
        name,
        price::float AS price,
        category,
        image,
        active,
        visible_in_menu AS "visibleInMenu",
        controls_stock AS "controlsStock",
        default_stock_location AS "defaultStockLocation"
    `, values);

    if (!rows[0]) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.json(toProduct(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM products WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/expenses', async (req, res, next) => {
  try {
    res.json(await listExpenses(req.query));
  } catch (error) {
    next(error);
  }
});

app.post('/api/expenses', async (req, res, next) => {
  try {
    const payload = req.body;
    const id = randomUUID();
    const { rows } = await query(`
      INSERT INTO expenses (id, expense_date, value, category, observation, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        expense_date::text AS date,
        value::float AS value,
        category,
        observation,
        payment_method AS "paymentMethod"
    `, [
      id,
      payload.date,
      Number(payload.value),
      payload.category,
      payload.observation || null,
      payload.paymentMethod || null,
    ]);

    res.status(201).json(toExpense(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.patch('/api/expenses/:id', async (req, res, next) => {
  try {
    const payload = req.body;
    const fieldMap = {
      date: 'expense_date',
      value: 'value',
      category: 'category',
      observation: 'observation',
      paymentMethod: 'payment_method',
    };

    const updates = [];
    const values = [];

    for (const [key, column] of Object.entries(fieldMap)) {
      if (key in payload) {
        const rawValue = payload[key];
        const normalized = key === 'value' ? parseNumber(rawValue) : rawValue;
        values.push(normalized === '' ? null : normalized);
        updates.push(`${column} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
    }

    values.push(req.params.id);
    const { rows } = await query(`
      UPDATE expenses
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING
        id,
        expense_date::text AS date,
        value::float AS value,
        category,
        observation,
        payment_method AS "paymentMethod"
    `, values);

    if (!rows[0]) {
      return res.status(404).json({ message: 'Gasto não encontrado.' });
    }

    res.json(toExpense(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/expenses/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Gasto não encontrado.' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/purchases', async (_req, res, next) => {
  try {
    res.json(await listPurchases());
  } catch (error) {
    next(error);
  }
});

app.post('/api/purchases', async (req, res, next) => {
  try {
    const payload = req.body;
    const purchase = await withTransaction(async (client) => {
      const purchaseId = randomUUID();
      const totalValue = payload.totalValue ?? payload.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.cost || 0), 0);

      await client.query(`
        INSERT INTO purchases (id, purchase_date, store, total_value)
        VALUES ($1, $2, $3, $4)
      `, [purchaseId, payload.date, payload.store, Number(totalValue)]);

      const items = [];
      for (const item of payload.items) {
        const itemId = randomUUID();
        await client.query(`
          INSERT INTO purchase_items (id, purchase_id, name, quantity, cost)
          VALUES ($1, $2, $3, $4, $5)
        `, [itemId, purchaseId, item.name, Number(item.quantity), parseNumber(item.cost)]);

        const existingStock = await client.query(`
          SELECT id, quantity::float AS quantity
          FROM stock_items
          WHERE name = $1 AND location = 'geral'
          LIMIT 1
        `, [item.name]);

        if (existingStock.rows[0]) {
          await client.query(`
            UPDATE stock_items
            SET quantity = quantity + $1, recently_added = TRUE
            WHERE id = $2
          `, [Number(item.quantity), existingStock.rows[0].id]);
        } else {
          await client.query(`
            INSERT INTO stock_items (id, product_id, name, quantity, unit, location, min_quantity, recently_added)
            VALUES ($1, $2, $3, $4, $5, 'geral', $6, TRUE)
          `, [randomUUID(), item.productId || null, item.name, Number(item.quantity), item.unit || 'unidades', null]);
        }

        items.push({
          id: itemId,
          name: item.name,
          quantity: Number(item.quantity),
          cost: item.cost === undefined || item.cost === null || item.cost === '' ? undefined : Number(item.cost),
        });
      }

      return {
        id: purchaseId,
        date: payload.date,
        store: payload.store,
        totalValue: Number(totalValue),
        items,
      };
    });

    res.status(201).json(purchase);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/purchases/:id', async (req, res, next) => {
  try {
    await withTransaction(async (client) => {
      await client.query('DELETE FROM purchase_items WHERE purchase_id = $1', [req.params.id]);
      const result = await client.query('DELETE FROM purchases WHERE id = $1', [req.params.id]);
      if (result.rowCount === 0) {
        throw Object.assign(new Error('Compra não encontrada.'), { statusCode: 404 });
      }
    });
    res.status(204).end();
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

app.get('/api/stock-items', async (req, res, next) => {
  try {
    res.json(await listStockItems(req.query));
  } catch (error) {
    next(error);
  }
});

app.post('/api/stock-items', async (req, res, next) => {
  try {
    const payload = req.body;
    const id = randomUUID();

    const { rows } = await query(`
      INSERT INTO stock_items (id, product_id, name, quantity, unit, location, min_quantity, recently_added)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        product_id AS "productId",
        name,
        quantity::float AS quantity,
        unit,
        location,
        min_quantity::float AS "minQuantity",
        recently_added AS "recentlyAdded"
    `, [
      id,
      payload.productId || null,
      payload.name,
      Number(payload.quantity),
      payload.unit,
      payload.location,
      parseNumber(payload.minQuantity),
      payload.recentlyAdded ?? false,
    ]);

    res.status(201).json(toStockItem(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.patch('/api/stock-items/:id', async (req, res, next) => {
  try {
    const payload = req.body;
    const fieldMap = {
      productId: 'product_id',
      name: 'name',
      quantity: 'quantity',
      unit: 'unit',
      location: 'location',
      minQuantity: 'min_quantity',
      recentlyAdded: 'recently_added',
    };

    const updates = [];
    const values = [];

    for (const [key, column] of Object.entries(fieldMap)) {
      if (key in payload) {
        const rawValue = payload[key];
        const normalized = key === 'quantity' || key === 'minQuantity' ? parseNumber(rawValue) : rawValue;
        values.push(normalized === '' ? null : normalized);
        updates.push(`${column} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
    }

    values.push(req.params.id);
    const { rows } = await query(`
      UPDATE stock_items
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING
        id,
        product_id AS "productId",
        name,
        quantity::float AS quantity,
        unit,
        location,
        min_quantity::float AS "minQuantity",
        recently_added AS "recentlyAdded"
    `, values);

    if (!rows[0]) {
      return res.status(404).json({ message: 'Item de estoque não encontrado.' });
    }

    res.json(toStockItem(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/stock-items/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM stock_items WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Item de estoque não encontrado.' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/transfer-requests', async (req, res, next) => {
  try {
    res.json(await listTransferRequests(req.query.status || 'pending'));
  } catch (error) {
    next(error);
  }
});

app.post('/api/transfer-requests', async (req, res, next) => {
  try {
    const payload = req.body;
    const id = randomUUID();
    const { rows } = await query(`
      INSERT INTO transfer_requests (
        id, stock_item_id, item_name, quantity, unit, requested_at, product_id, min_quantity, status
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, 'pending')
      RETURNING
        id,
        stock_item_id AS "stockItemId",
        item_name AS "itemName",
        quantity::float AS quantity,
        unit,
        requested_at AS "requestedAt",
        product_id AS "productId",
        min_quantity::float AS "minQuantity",
        status
    `, [
      id,
      payload.stockItemId,
      payload.itemName,
      Number(payload.quantity),
      payload.unit,
      payload.productId || null,
      parseNumber(payload.minQuantity),
    ]);

    res.status(201).json(toTransferRequest(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.post('/api/transfer-requests/:id/accept', async (req, res, next) => {
  try {
    await withTransaction(async (client) => {
      const requestResult = await client.query(`
        SELECT
          id,
          stock_item_id AS "stockItemId",
          item_name AS "itemName",
          quantity::float AS quantity,
          unit,
          product_id AS "productId",
          min_quantity::float AS "minQuantity",
          status
        FROM transfer_requests
        WHERE id = $1
        LIMIT 1
      `, [req.params.id]);

      const transfer = requestResult.rows[0];
      if (!transfer) {
        throw new Error('Solicitação não encontrada.');
      }

      const sourceResult = await client.query(`
        SELECT id, quantity::float AS quantity
        FROM stock_items
        WHERE id = $1
        LIMIT 1
      `, [transfer.stockItemId]);

      const source = sourceResult.rows[0];
      if (!source) {
        throw new Error('Item de estoque de origem não encontrado.');
      }

      await client.query(`
        UPDATE stock_items
        SET quantity = GREATEST(quantity - $1, 0)
        WHERE id = $2
      `, [Number(transfer.quantity), transfer.stockItemId]);

      const existingTarget = await client.query(`
        SELECT id
        FROM stock_items
        WHERE name = $1 AND location = 'vitrine'
        LIMIT 1
      `, [transfer.itemName]);

      if (existingTarget.rows[0]) {
        await client.query(`
          UPDATE stock_items
          SET quantity = quantity + $1, recently_added = TRUE
          WHERE id = $2
        `, [Number(transfer.quantity), existingTarget.rows[0].id]);
      } else {
        await client.query(`
          INSERT INTO stock_items (id, product_id, name, quantity, unit, location, min_quantity, recently_added)
          VALUES ($1, $2, $3, $4, $5, 'vitrine', $6, TRUE)
        `, [randomUUID(), transfer.productId || null, transfer.itemName, Number(transfer.quantity), transfer.unit, parseNumber(transfer.minQuantity)]);
      }

      await client.query(`
        UPDATE transfer_requests
        SET status = 'accepted'
        WHERE id = $1
      `, [req.params.id]);
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/transfer-requests/:id/reject', async (req, res, next) => {
  try {
    const result = await query(`
      UPDATE transfer_requests
      SET status = 'rejected'
      WHERE id = $1
    `, [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Solicitação não encontrada.' });
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/orders', async (req, res, next) => {
  try {
    res.json(await listOrders(req.query));
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
});

async function start() {
  await initDatabase();
  await testConnection();

  app.listen(port, '0.0.0.0', () => {
    console.log(`Brownie Bee API rodando em http://localhost:${port}`);
    console.log(`Swagger disponível em http://localhost:${port}/api/docs`);
  });
}

start().catch((error) => {
  console.error('Falha ao iniciar a API:', error);
  process.exit(1);
});
