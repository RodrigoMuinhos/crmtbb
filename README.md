
# Brownie Bee CRM

Projeto separado em duas partes:

- `frontend/`: aplicação React + Vite
- `api/`: API Express + PostgreSQL

## Estrutura

```text
.
├── api/
│   ├── .env
│   ├── package.json
│   └── server/
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── index.html
│   ├── src/
│   └── vite.config.ts
├── guidelines/
├── package.json
└── README.md
```

## Como rodar

Instale as dependências de cada parte:

- `npm install`
- `npm run install:all`

Depois suba frontend e API juntos pela raiz:

- `npm run dev`

## Scripts úteis

- `npm run dev`: sobe frontend e API juntos
- `npm run dev:web`: sobe apenas o frontend
- `npm run dev:api`: sobe apenas a API
- `npm run build`: gera o build do frontend
- `npm run start`: inicia apenas a API

## Docker (build + deploy local)

Pela raiz do projeto:

- `npm run docker:build` → build das imagens
- `npm run docker:up` → sobe frontend + API em containers
- `npm run docker:logs` → acompanha logs
- `npm run docker:down` → derruba os containers

URLs após subir:

- Frontend: `http://localhost:18080`
- API: `http://localhost:3001`
- Swagger: `http://localhost:18080/api/docs` (via proxy do frontend) ou `http://localhost:3001/api/docs`

## Deploy no Railway (API)

Este repositório é monorepo (`frontend/` e `api/`). O Railway está configurado via `nixpacks.toml` para publicar **somente a API**.

Comportamento configurado:

- instala dependências de `api/`
- não executa `vite build`
- inicia com `npm run start --prefix api`

Variáveis obrigatórias no Railway:

- `JDBC_DATABASE_URL` (ou `DATABASE_URL`)
- `PORT` (opcional, Railway injeta automaticamente)

Endpoint de saúde após deploy:

- `/api/health`

## Variáveis de ambiente

- `frontend/.env`: configuração do endereço base da API para o Vite
- `api/.env`: conexão com PostgreSQL e porta da API

Preencha o arquivo `api/.env` com as credenciais reais do banco antes de rodar a API.
  