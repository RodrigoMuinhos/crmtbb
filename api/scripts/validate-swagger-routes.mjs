import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { swaggerSpec } from '../server/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeExpressPath(expressPath) {
  return expressPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function toMethodSetMap(entries) {
  const map = new Map();

  for (const { method, path } of entries) {
    if (!map.has(path)) {
      map.set(path, new Set());
    }

    map.get(path).add(method.toLowerCase());
  }

  return map;
}

async function collectExpressRoutes() {
  const indexPath = path.resolve(__dirname, '../server/index.js');
  const content = await readFile(indexPath, 'utf8');

  const routeRegex = /app\.(get|post|patch|delete)\(\s*['"]([^'"]+)['"]/g;
  const routes = [];
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({
      method: match[1].toLowerCase(),
      path: normalizeExpressPath(match[2]),
    });
  }

  return routes;
}

function collectSwaggerRoutes() {
  const routes = [];

  for (const [routePath, routeConfig] of Object.entries(swaggerSpec.paths || {})) {
    for (const method of Object.keys(routeConfig || {})) {
      routes.push({ method: method.toLowerCase(), path: routePath });
    }
  }

  return routes;
}

function diffRoutes(sourceMap, targetMap) {
  const missing = [];

  for (const [routePath, methods] of sourceMap.entries()) {
    const targetMethods = targetMap.get(routePath) ?? new Set();

    for (const method of methods) {
      if (!targetMethods.has(method)) {
        missing.push(`${method.toUpperCase()} ${routePath}`);
      }
    }
  }

  return missing.sort();
}

async function main() {
  const expressRoutes = await collectExpressRoutes();
  const swaggerRoutes = collectSwaggerRoutes();

  const expressMap = toMethodSetMap(expressRoutes);
  const swaggerMap = toMethodSetMap(swaggerRoutes);

  const missingInSwagger = diffRoutes(expressMap, swaggerMap);
  const missingInExpress = diffRoutes(swaggerMap, expressMap);

  console.log(`Rotas Express encontradas: ${expressRoutes.length}`);
  console.log(`Rotas Swagger encontradas: ${swaggerRoutes.length}`);

  if (missingInSwagger.length > 0) {
    console.error('\n❌ Rotas implementadas mas ausentes no Swagger:');
    for (const route of missingInSwagger) {
      console.error(`- ${route}`);
    }
  }

  if (missingInExpress.length > 0) {
    console.error('\n❌ Rotas documentadas no Swagger mas ausentes no Express:');
    for (const route of missingInExpress) {
      console.error(`- ${route}`);
    }
  }

  if (missingInSwagger.length > 0 || missingInExpress.length > 0) {
    process.exit(1);
  }

  console.log('\n✅ Swagger e Express estão alinhados para todos os endpoints documentados.');
}

main().catch((error) => {
  console.error('Erro ao validar rotas Swagger x Express:', error);
  process.exit(1);
});
