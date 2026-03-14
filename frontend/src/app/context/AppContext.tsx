import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

// Types
export interface Expense {
  id: string;
  date: string;
  value: number;
  category: 'mercado' | 'insumos' | 'embalagens' | 'outros';
  observation?: string;
  paymentMethod?: string;
}

export interface Purchase {
  id: string;
  date: string;
  store: string;
  totalValue?: number;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  cost?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  active: boolean;
  visibleInMenu: boolean;
  controlsStock: boolean;
  defaultStockLocation: 'vitrine' | 'geral';
}

export interface StockItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  location: 'geral' | 'armazenado' | 'vitrine';
  minQuantity?: number;
  recentlyAdded?: boolean;
}

export interface Order {
  id: string;
  date: string;
  time: string;
  items: OrderItem[];
  total: number;
  customer?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface PendingTransfer {
  id: string;
  stockItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  requestedAt: string;
  productId: string;
  minQuantity?: number;
}

interface AppContextType {
  expenses: Expense[];
  purchases: Purchase[];
  products: Product[];
  stock: StockItem[];
  orders: Order[];
  pendingTransfers: PendingTransfer[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => void;
  deleteExpense: (id: string) => void;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  deletePurchase: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  transferStock: (itemId: string, quantity: number) => void;
  createTransferRequest: (transfer: Omit<PendingTransfer, 'id' | 'requestedAt'>) => void;
  acceptTransferRequest: (transferId: string) => void;
  rejectTransferRequest: (transferId: string) => void;
  getTodayRevenue: () => number;
  getTodayExpenses: () => number;
  getTodayOrders: () => Order[];
  getProductSales: (productId: string, date?: string) => { quantity: number; revenue: number };
  generate90DaysData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

interface BootstrapData {
  expenses: Expense[];
  purchases: Purchase[];
  products: Product[];
  stock: StockItem[];
  orders: Order[];
  pendingTransfers: PendingTransfer[];
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Falha na comunicação com a API.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);

  const loadRemoteData = useCallback(async () => {
    try {
      const data = await apiRequest<BootstrapData>('/bootstrap');
      setExpenses(data.expenses || []);
      setPurchases(data.purchases || []);
      setProducts(data.products || []);
      setStock(data.stock || []);
      setOrders(data.orders || []);
      setPendingTransfers(data.pendingTransfers || []);
    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
    }
  }, []);

  useEffect(() => {
    void loadRemoteData();
  }, [loadRemoteData]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    void (async () => {
      try {
        const newExpense = await apiRequest<Expense>('/expenses', {
          method: 'POST',
          body: JSON.stringify(expense),
        });
        setExpenses(prev => [newExpense, ...prev]);
      } catch (error) {
        console.error('Erro ao criar gasto:', error);
      }
    })();
  };

  const updateExpense = (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    void (async () => {
      try {
        const updated = await apiRequest<Expense>(`/expenses/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });
        setExpenses(prev => prev.map(e => e.id === id ? updated : e));
      } catch (error) {
        console.error('Erro ao atualizar gasto:', error);
      }
    })();
  };

  const deleteExpense = (id: string) => {
    void (async () => {
      try {
        await apiRequest<void>(`/expenses/${id}`, { method: 'DELETE' });
        setExpenses(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        console.error('Erro ao excluir gasto:', error);
      }
    })();
  };

  const addPurchase = (purchase: Omit<Purchase, 'id'>) => {
    void (async () => {
      try {
        await apiRequest<Purchase>('/purchases', {
          method: 'POST',
          body: JSON.stringify(purchase),
        });
        await loadRemoteData();
      } catch (error) {
        console.error('Erro ao criar compra:', error);
      }
    })();
  };

  const deletePurchase = (id: string) => {
    void (async () => {
      try {
        await apiRequest<void>(`/purchases/${id}`, { method: 'DELETE' });
        setPurchases(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Erro ao excluir compra:', error);
      }
    })();
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    void (async () => {
      try {
        const newProduct = await apiRequest<Product>('/products', {
          method: 'POST',
          body: JSON.stringify(product),
        });
        setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Erro ao criar produto:', error);
      }
    })();
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    void (async () => {
      try {
        const updated = await apiRequest<Product>(`/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
      }
    })();
  };

  const deleteProduct = (id: string) => {
    void (async () => {
      try {
        await apiRequest<void>(`/products/${id}`, { method: 'DELETE' });
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    })();
  };

  const addStockItem = (item: Omit<StockItem, 'id'>) => {
    void (async () => {
      try {
        const newItem = await apiRequest<StockItem>('/stock-items', {
          method: 'POST',
          body: JSON.stringify(item),
        });
        setStock(prev => [...prev, newItem]);
      } catch (error) {
        console.error('Erro ao criar item de estoque:', error);
      }
    })();
  };

  const updateStockItem = (id: string, updates: Partial<StockItem>) => {
    void (async () => {
      try {
        const updated = await apiRequest<StockItem>(`/stock-items/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });
        setStock(prev => prev.map(item => item.id === id ? updated : item));
      } catch (error) {
        console.error('Erro ao atualizar item de estoque:', error);
      }
    })();
  };

  const deleteStockItem = (id: string) => {
    void (async () => {
      try {
        await apiRequest<void>(`/stock-items/${id}`, { method: 'DELETE' });
        setStock(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error('Erro ao excluir item de estoque:', error);
      }
    })();
  };

  const transferStock = (itemId: string, quantity: number) => {
    const item = stock.find(s => s.id === itemId);
    if (!item) return;

    void (async () => {
      try {
        await createTransferRequest({
          stockItemId: itemId,
          itemName: item.name,
          quantity,
          unit: item.unit,
          productId: item.productId,
          minQuantity: item.minQuantity,
        });
      } catch (error) {
        console.error('Erro ao transferir estoque:', error);
      }
    })();
  };

  const createTransferRequest = (transfer: Omit<PendingTransfer, 'id' | 'requestedAt'>) => {
    void (async () => {
      try {
        const newTransfer = await apiRequest<PendingTransfer>('/transfer-requests', {
          method: 'POST',
          body: JSON.stringify(transfer),
        });
        setPendingTransfers(prev => [newTransfer, ...prev]);
      } catch (error) {
        console.error('Erro ao criar solicitação de transferência:', error);
      }
    })();
  };

  const acceptTransferRequest = (transferId: string) => {
    void (async () => {
      try {
        await apiRequest<{ ok: boolean }>(`/transfer-requests/${transferId}/accept`, {
          method: 'POST',
        });
        await loadRemoteData();
      } catch (error) {
        console.error('Erro ao aceitar transferência:', error);
      }
    })();
  };

  const rejectTransferRequest = (transferId: string) => {
    void (async () => {
      try {
        await apiRequest<{ ok: boolean }>(`/transfer-requests/${transferId}/reject`, {
          method: 'POST',
        });
        setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
      } catch (error) {
        console.error('Erro ao rejeitar transferência:', error);
      }
    })();
  };

  const getTodayRevenue = () => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter(order => order.date === today)
      .reduce((sum, order) => sum + order.total, 0);
  };

  const getTodayExpenses = () => {
    const today = new Date().toISOString().split('T')[0];
    return expenses
      .filter(expense => expense.date === today)
      .reduce((sum, expense) => sum + expense.value, 0);
  };

  const getTodayOrders = () => {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(order => order.date === today);
  };

  const getProductSales = (productId: string, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const relevantOrders = orders.filter(order => order.date === targetDate);
    
    let quantity = 0;
    let revenue = 0;
    
    relevantOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId === productId) {
          quantity += item.quantity;
          revenue += item.quantity * item.price;
        }
      });
    });
    
    return { quantity, revenue };
  };

  const generate90DaysData = () => {
    // Feature removed - no longer generates mock data
  };

  const value = {
    expenses,
    purchases,
    products,
    stock,
    orders,
    pendingTransfers,
    addExpense,
    updateExpense,
    deleteExpense,
    addPurchase,
    deletePurchase,
    addProduct,
    updateProduct,
    deleteProduct,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    transferStock,
    createTransferRequest,
    acceptTransferRequest,
    rejectTransferRequest,
    getTodayRevenue,
    getTodayExpenses,
    getTodayOrders,
    getProductSales,
    generate90DaysData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}