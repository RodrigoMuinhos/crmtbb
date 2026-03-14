export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Brownie Bee API',
    version: '1.0.0',
    description: 'API MVP para gestão de produtos, compras, estoque, gastos e relatórios da Brownie Bee.',
  },
  servers: [
    { url: 'http://localhost:3001', description: 'API local' },
    { url: '/api', description: 'Proxy do frontend/Vite' },
  ],
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          image: { type: 'string', nullable: true },
          active: { type: 'boolean' },
          visibleInMenu: { type: 'boolean' },
          controlsStock: { type: 'boolean' },
          defaultStockLocation: { type: 'string', enum: ['vitrine', 'geral'] },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          date: { type: 'string', format: 'date' },
          value: { type: 'number' },
          category: { type: 'string', enum: ['mercado', 'insumos', 'embalagens', 'outros'] },
          observation: { type: 'string', nullable: true },
          paymentMethod: { type: 'string', nullable: true },
        },
      },
      PurchaseItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          quantity: { type: 'number' },
          cost: { type: 'number', nullable: true },
        },
      },
      Purchase: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          date: { type: 'string', format: 'date' },
          store: { type: 'string' },
          totalValue: { type: 'number', nullable: true },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/PurchaseItem' },
          },
        },
      },
      StockItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string', nullable: true },
          name: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string' },
          location: { type: 'string', enum: ['geral', 'armazenado', 'vitrine'] },
          minQuantity: { type: 'number', nullable: true },
          recentlyAdded: { type: 'boolean', nullable: true },
        },
      },
      TransferRequest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          stockItemId: { type: 'string' },
          itemName: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string' },
          requestedAt: { type: 'string', format: 'date-time' },
          productId: { type: 'string', nullable: true },
          minQuantity: { type: 'number', nullable: true },
          status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          productId: { type: 'string', nullable: true },
          productName: { type: 'string' },
          quantity: { type: 'number' },
          price: { type: 'number' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          date: { type: 'string', format: 'date' },
          time: { type: 'string' },
          total: { type: 'number' },
          customer: { type: 'string', nullable: true },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
        },
      },
    },
  },
  paths: {
    '/api/health': { get: { summary: 'Healthcheck da API' } },
    '/api/docs.json': { get: { summary: 'Spec OpenAPI em JSON' } },
    '/api/bootstrap': { get: { summary: 'Carrega dados iniciais do app' } },
    '/api/products': { get: { summary: 'Lista produtos' }, post: { summary: 'Cria produto' } },
    '/api/products/{id}': { patch: { summary: 'Atualiza produto' }, delete: { summary: 'Remove produto' } },
    '/api/expenses': { get: { summary: 'Lista gastos' }, post: { summary: 'Cria gasto' } },
    '/api/purchases': { get: { summary: 'Lista compras' }, post: { summary: 'Cria compra e atualiza estoque' } },
    '/api/stock-items': { get: { summary: 'Lista estoque' }, post: { summary: 'Cria item de estoque' } },
    '/api/stock-items/{id}': { patch: { summary: 'Atualiza item de estoque' } },
    '/api/transfer-requests': { get: { summary: 'Lista solicitações de transferência' }, post: { summary: 'Cria solicitação de transferência' } },
    '/api/transfer-requests/{id}/accept': { post: { summary: 'Aceita solicitação e move estoque' } },
    '/api/transfer-requests/{id}/reject': { post: { summary: 'Rejeita solicitação' } },
    '/api/orders': { get: { summary: 'Lista pedidos' } },
    '/api/reset': { delete: { summary: 'Limpa os dados do MVP local' } },
  },
};
