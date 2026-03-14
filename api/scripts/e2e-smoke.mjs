import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');

const TEST_PORT = Number(process.env.E2E_PORT || 3011);
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApi(timeoutMs = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // API ainda não subiu
    }

    await wait(500);
  }

  throw new Error(`API não respondeu no tempo limite de ${timeoutMs}ms.`);
}

async function assertStatus(method, route, expectedStatus, init = {}) {
  const response = await fetch(`${BASE_URL}${route}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  });

  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`${method} ${route} retornou ${response.status}. Esperado ${expectedStatus}. Body: ${body}`);
  }

  return response;
}

async function assertJsonArrayGet(route) {
  const response = await assertStatus('GET', route, 200);
  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(`GET ${route} não retornou array.`);
  }
}

async function runSmokeTests() {
  const health = await assertStatus('GET', '/api/health', 200);
  const healthJson = await health.json();
  if (!healthJson?.ok) {
    throw new Error('Healthcheck não retornou ok=true.');
  }

  const docs = await assertStatus('GET', '/api/docs', 200);
  const docsText = await docs.text();
  if (!/swagger|openapi/i.test(docsText)) {
    throw new Error('Swagger UI não parece carregado em /api/docs.');
  }

  const docsJson = await assertStatus('GET', '/api/docs.json', 200);
  const spec = await docsJson.json();
  if (!spec?.openapi || !spec?.paths) {
    throw new Error('Spec OpenAPI inválida em /api/docs.json.');
  }

  const bootstrap = await assertStatus('GET', '/api/bootstrap', 200);
  const bootstrapJson = await bootstrap.json();
  const bootstrapKeys = ['products', 'expenses', 'purchases', 'stock', 'orders', 'pendingTransfers'];
  for (const key of bootstrapKeys) {
    if (!(key in bootstrapJson)) {
      throw new Error(`Bootstrap sem a chave obrigatória: ${key}`);
    }
  }

  await assertJsonArrayGet('/api/products');
  await assertJsonArrayGet('/api/expenses');
  await assertJsonArrayGet('/api/purchases');
  await assertJsonArrayGet('/api/stock-items');
  await assertJsonArrayGet('/api/transfer-requests');
  await assertJsonArrayGet('/api/orders');

  const productPayload = {
    name: `E2E Produto ${Date.now()}`,
    price: 9.9,
    category: 'outros',
    active: true,
    visibleInMenu: true,
    controlsStock: false,
    defaultStockLocation: 'geral',
  };

  const createdProductResponse = await assertStatus('POST', '/api/products', 201, {
    body: JSON.stringify(productPayload),
  });
  const createdProduct = await createdProductResponse.json();

  await assertStatus('PATCH', `/api/products/${createdProduct.id}`, 200, {
    body: JSON.stringify({ price: 10.5 }),
  });

  await assertStatus('DELETE', `/api/products/${createdProduct.id}`, 204);

  await assertStatus('PATCH', '/api/products/id-inexistente', 404, {
    body: JSON.stringify({ name: 'x' }),
  });

  await assertStatus('POST', '/api/transfer-requests/id-inexistente/reject', 404);

  console.log('✅ E2E smoke concluído com sucesso.');
}

async function main() {
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: apiRoot,
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[api] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[api] ${chunk}`);
  });

  try {
    await waitForApi();
    await runSmokeTests();
  } finally {
    child.kill('SIGTERM');
    await wait(500);

    if (!child.killed) {
      child.kill('SIGKILL');
    }
  }
}

main().catch((error) => {
  console.error('❌ Falha no E2E smoke:', error.message);
  process.exit(1);
});
