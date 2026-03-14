import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');

const TEST_PORT = Number(process.env.DB_TEST_PORT || 3021);
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startApiServer() {
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

  return child;
}

async function stopApiServer(child) {
  if (!child || child.killed) return;

  child.kill('SIGTERM');
  await wait(700);

  if (!child.killed) {
    child.kill('SIGKILL');
  }
}

async function waitForHealthyApi(timeoutMs = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        const json = await response.json();
        if (json?.ok && json?.database === 'connected') {
          return;
        }
      }
    } catch {
      // ainda subindo
    }

    await wait(500);
  }

  throw new Error(`Healthcheck não ficou pronto em ${timeoutMs}ms.`);
}

async function requestJson(method, route, init = {}) {
  const response = await fetch(`${BASE_URL}${route}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${route} falhou (${response.status}): ${text}`);
  }

  if (response.status === 204) return undefined;
  return response.json();
}

async function ensureProductExists(productId) {
  const products = await requestJson('GET', '/api/products');
  const found = products.find((p) => p.id === productId);
  if (!found) {
    throw new Error(`Produto ${productId} não encontrado no banco via /api/products.`);
  }
}

async function runTest() {
  const uniqueLabel = `DB-PERSIST-${Date.now()}`;
  let createdProductId = null;
  let server = null;

  try {
    server = startApiServer();
    await waitForHealthyApi();

    const created = await requestJson('POST', '/api/products', {
      body: JSON.stringify({
        name: uniqueLabel,
        price: 19.9,
        category: 'outros',
        active: true,
        visibleInMenu: true,
        controlsStock: false,
        defaultStockLocation: 'geral',
      }),
    });

    createdProductId = created.id;
    if (!createdProductId) {
      throw new Error('Produto foi criado sem ID.');
    }

    await ensureProductExists(createdProductId);
    console.log('✅ Salvamento confirmado com a API em execução.');

    await stopApiServer(server);
    server = null;

    server = startApiServer();
    await waitForHealthyApi();
    await ensureProductExists(createdProductId);
    console.log('✅ Persistência confirmada após reinício da API (dado veio do banco).');

    await requestJson('DELETE', `/api/products/${createdProductId}`);
    console.log('✅ Cleanup executado com sucesso.');
    createdProductId = null;

    console.log('🎉 Teste de conexão + persistência em banco concluído com sucesso.');
  } finally {
    if (server) {
      await stopApiServer(server);
    }

    if (createdProductId) {
      // melhor esforço de cleanup em caso de falha no meio do fluxo
      const fallbackServer = startApiServer();
      try {
        await waitForHealthyApi(15000);
        await fetch(`${BASE_URL}/api/products/${createdProductId}`, { method: 'DELETE' });
      } catch {
        // ignora cleanup best-effort
      } finally {
        await stopApiServer(fallbackServer);
      }
    }
  }
}

runTest().catch((error) => {
  console.error('❌ Falha no teste de persistência de banco:', error.message);
  process.exit(1);
});
