import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  MetricCard,
  ExpenseItem,
  StockItem,
  Button,
  Modal,
  Input,
  Badge
} from '@/app/components/brownie-bee';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Plus, 
  ShoppingCart, 
  Package,
  DollarSign,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Dashboard() {
  const { 
    getTodayRevenue, 
    getTodayExpenses, 
    getTodayOrders,
    products,
    getProductSales,
    stock,
    expenses,
    addExpense,
    orders
  } = useApp();
  
  const navigate = useNavigate();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    value: '',
    category: 'mercado' as 'mercado' | 'insumos' | 'embalagens' | 'outros',
    observation: '',
    paymentMethod: ''
  });

  const todayRevenue = getTodayRevenue();
  const todayExpenses = getTodayExpenses();
  const todayResult = todayRevenue - todayExpenses;
  const todayOrders = getTodayOrders();
  const today = new Date().toISOString().split('T')[0];
  
  // Check if we have any data
  const hasData = orders.length > 0 || expenses.length > 0;
  
  // Get today's expenses
  const todayExpensesList = expenses.filter(e => e.date === today);
  
  // Calculate metrics
  const totalOrders = todayOrders.length;
  const estimatedCustomers = Math.round(totalOrders * 1.2); // Estimativa
  const avgTicket = totalOrders > 0 ? todayRevenue / totalOrders : 0;
  
  // Product sales today
  const productSales = products
    .filter(p => p.active)
    .map(p => ({
      ...p,
      sales: getProductSales(p.id, today)
    }))
    .filter(p => p.sales.quantity > 0)
    .sort((a, b) => b.sales.revenue - a.sales.revenue);
  
  // Stock alerts (only vitrine - priority)
  const fridgeStock = stock.filter(s => s.location === 'vitrine');
  const criticalStock = fridgeStock.filter(s => 
    s.minQuantity && s.quantity <= s.minQuantity
  );
  
  const handleAddExpense = () => {
    if (!expenseForm.value) return;
    
    addExpense({
      date: today,
      value: parseFloat(expenseForm.value),
      category: expenseForm.category,
      observation: expenseForm.observation || undefined,
      paymentMethod: expenseForm.paymentMethod || undefined
    });
    
    setExpenseForm({
      value: '',
      category: 'mercado',
      observation: '',
      paymentMethod: ''
    });
    setIsExpenseModalOpen(false);
  };

  // Empty state when no data
  if (!hasData) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1>Visão do Dia</h1>
            <p className="text-[var(--brand-text-secondary)] text-sm mt-1">
              Acompanhe a saúde da sua loja
            </p>
          </div>

          <Card className="border-2 border-dashed border-[var(--brand-secondary)]/30">
            <CardContent className="py-10 md:py-12">
              <div className="text-center max-w-md mx-auto">
                <div className="bg-[var(--brand-secondary)]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Database className="w-10 h-10 text-[var(--brand-secondary)]" />
                </div>

                <h2 className="text-2xl font-semibold text-[var(--brand-text-primary)] mb-3">
                  Bem-vindas ao nosso sistema!
                </h2>

                <p className="text-[var(--brand-text-secondary)] mb-4 leading-relaxed">
                  Que bom ter vocês por aqui 🐝 Vamos começar juntos: cadastrem os primeiros dados da loja e acompanhem tudo de forma simples e organizada.
                </p>

                <div className="bg-[var(--brand-bg)] rounded-[var(--radius-card)] p-4 text-left mb-6">
                  <p className="text-sm font-medium text-[var(--brand-text-primary)] mb-2">
                    Para começar agora:
                  </p>
                  <ul className="space-y-2 text-sm text-[var(--brand-text-secondary)]">
                    <li>• Cadastrem os primeiros produtos</li>
                    <li>• Registrem compras e gastos do dia a dia</li>
                    <li>• Acompanhem o resultado da loja no painel</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/produtos')}
                    className="w-full"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Cadastrar primeiros produtos
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/compras')}
                    className="w-full"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Registrar primeira compra
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="w-full"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Registrar primeiro gasto da loja
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          title="Registrar Gasto"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsExpenseModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleAddExpense}>
                Registrar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Valor *"
              type="number"
              placeholder="0,00"
              value={expenseForm.value}
              onChange={(e) => setExpenseForm({ ...expenseForm, value: e.target.value })}
            />

            <div>
              <label className="block mb-2 text-[var(--brand-text-primary)]">
                Categoria *
              </label>
              <select
                className="w-full px-4 py-2 bg-[var(--brand-surface)] border border-[var(--brand-text-secondary)]/20 rounded-[var(--radius-button)] text-[var(--brand-text-primary)]"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
              >
                <option value="mercado">Mercado</option>
                <option value="insumos">Insumos</option>
                <option value="embalagens">Embalagens</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <Input
              label="Observação"
              placeholder="Ex: Compra semanal..."
              value={expenseForm.observation}
              onChange={(e) => setExpenseForm({ ...expenseForm, observation: e.target.value })}
            />

            <Input
              label="Forma de pagamento"
              placeholder="Ex: Débito, Crédito..."
              value={expenseForm.paymentMethod}
              onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
            />
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Visão do Dia</h1>
          <p className="text-[var(--brand-text-secondary)] text-sm mt-1">
            Acompanhe a saúde da sua loja
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/compras')}
          >
            <Package className="w-4 h-4 mr-1" />
            Nova Compra
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Registrar Gasto
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Faturamento do dia"
          value={`R$ ${todayRevenue.toFixed(2)}`}
          subtitle={`${totalOrders} pedidos`}
          trend={todayRevenue > 0 ? 'positive' : 'neutral'}
        />
        <MetricCard
          title="Gastos do dia"
          value={`R$ ${todayExpenses.toFixed(2)}`}
          subtitle={`${todayExpensesList.length} lançamentos`}
          trend={todayExpenses > 0 ? 'negative' : 'neutral'}
        />
        <MetricCard
          title="Resultado parcial"
          value={`R$ ${todayResult.toFixed(2)}`}
          subtitle={todayResult >= 0 ? 'Situação saudável' : 'Atenção'}
          trend={todayResult > 0 ? 'positive' : todayResult < 0 ? 'negative' : 'neutral'}
        />
        <MetricCard
          title={criticalStock.length > 0 ? 'Requer atenção' : 'Estoque'}
          value={criticalStock.length > 0 ? `${criticalStock.length} itens` : 'Tudo OK'}
          subtitle={criticalStock.length > 0 ? 'Estoque baixo' : 'Situação normal'}
          trend={criticalStock.length > 0 ? 'negative' : 'neutral'}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Clientes estimados
            </div>
            <div className="text-2xl font-semibold text-[var(--brand-primary)]">
              {estimatedCustomers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Ticket médio
            </div>
            <div className="text-2xl font-semibold text-[var(--brand-primary)]">
              R$ {avgTicket.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Pedidos realizados
            </div>
            <div className="text-2xl font-semibold text-[var(--brand-primary)]">
              {totalOrders}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Performance */}
      {productSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos vendidos hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(showAllProducts ? productSales : productSales.slice(0, 5)).map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-[var(--brand-text-secondary)]/10 last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-[var(--brand-text-primary)]">
                      {product.name}
                    </div>
                    <div className="text-sm text-[var(--brand-text-secondary)]">
                      {product.sales.quantity} unidades
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[var(--brand-primary)]">
                      R$ {product.sales.revenue.toFixed(2)}
                    </div>
                    <Badge status="info" className="mt-1">
                      {((product.sales.revenue / todayRevenue) * 100).toFixed(0)}% do total
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {productSales.length > 5 && (
              <div className="mt-4 pt-3 border-t border-[var(--brand-text-secondary)]/10">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAllProducts(!showAllProducts)}
                >
                  {showAllProducts ? 'Ver menos' : `Ver mais (${productSales.length - 5} produtos)`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stock Alerts */}
      {criticalStock.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--status-critical)]" />
              <CardTitle>Situação do Estoque - Vitrine</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[var(--brand-text-secondary)]/10">
              {criticalStock.map((item) => (
                <StockItem
                  key={item.id}
                  name={item.name}
                  quantity={item.quantity}
                  unit={item.unit}
                  status={
                    item.minQuantity && item.quantity <= item.minQuantity / 2
                      ? 'critical'
                      : 'low'
                  }
                />
              ))}
            </div>
            <div className="mt-4">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate('/estoque')}
              >
                Gerenciar Estoque
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos de hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {todayExpensesList.length > 0 ? (
            <div className="divide-y divide-[var(--brand-text-secondary)]/10">
              {todayExpensesList.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  icon={
                    expense.category === 'mercado' ? <ShoppingCart className="w-5 h-5" /> :
                    expense.category === 'embalagens' ? <Package className="w-5 h-5" /> :
                    <DollarSign className="w-5 h-5" />
                  }
                  category={
                    expense.category === 'mercado' ? 'Mercado' :
                    expense.category === 'insumos' ? 'Insumos' :
                    expense.category === 'embalagens' ? 'Embalagens' :
                    'Outros'
                  }
                  amount={`R$ ${expense.value.toFixed(2)}`}
                  observation={expense.observation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--brand-text-secondary)]">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum gasto registrado hoje</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3"
                onClick={() => setIsExpenseModalOpen(true)}
              >
                Registrar primeiro gasto
              </Button>
            </div>
          )}
          {todayExpensesList.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--brand-text-secondary)]/10">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/gastos')}
              >
                Ver todos os gastos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Registrar Gasto"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsExpenseModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddExpense}>
              Registrar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Valor *"
            type="number"
            placeholder="0,00"
            value={expenseForm.value}
            onChange={(e) => setExpenseForm({ ...expenseForm, value: e.target.value })}
          />
          
          <div>
            <label className="block mb-2 text-[var(--brand-text-primary)]">
              Categoria *
            </label>
            <select
              className="w-full px-4 py-2 bg-[var(--brand-surface)] border border-[var(--brand-text-secondary)]/20 rounded-[var(--radius-button)] text-[var(--brand-text-primary)]"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
            >
              <option value="mercado">Mercado</option>
              <option value="insumos">Insumos</option>
              <option value="embalagens">Embalagens</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          
          <Input
            label="Observação"
            placeholder="Ex: Compra semanal..."
            value={expenseForm.observation}
            onChange={(e) => setExpenseForm({ ...expenseForm, observation: e.target.value })}
          />
          
          <Input
            label="Forma de pagamento"
            placeholder="Ex: Débito, Crédito..."
            value={expenseForm.paymentMethod}
            onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}