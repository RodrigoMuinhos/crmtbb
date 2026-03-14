import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Modal,
  Input,
  ExpenseItem,
  Badge
} from '@/app/components/brownie-bee';
import { Plus, ShoppingCart, Package, DollarSign, Calendar } from 'lucide-react';

export default function Gastos() {
  const { expenses, addExpense } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    value: '',
    category: 'mercado' as 'mercado' | 'insumos' | 'embalagens' | 'outros',
    observation: '',
    paymentMethod: ''
  });

  const today = new Date().toISOString().split('T')[0];
  
  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { total: 0, count: 0 };
    }
    acc[expense.category].total += expense.value;
    acc[expense.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Today's expenses
  const todayExpenses = expenses.filter(e => e.date === today);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.value, 0);

  // This month's expenses
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.value, 0);

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
    setIsModalOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mercado':
        return <ShoppingCart className="w-5 h-5" />;
      case 'embalagens':
        return <Package className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'mercado':
        return 'Mercado';
      case 'insumos':
        return 'Insumos';
      case 'embalagens':
        return 'Embalagens';
      default:
        return 'Outros';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gastos</h1>
          <p className="text-[var(--brand-text-secondary)] text-sm mt-1">
            Acompanhe para onde o dinheiro vai
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Novo Gasto
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Gastos de hoje
            </div>
            <div className="text-2xl font-semibold text-[var(--brand-primary)]">
              R$ {todayTotal.toFixed(2)}
            </div>
            <div className="text-xs text-[var(--brand-text-secondary)] mt-1">
              {todayExpenses.length} lançamentos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Gastos do mês
            </div>
            <div className="text-2xl font-semibold text-[var(--brand-primary)]">
              R$ {monthTotal.toFixed(2)}
            </div>
            <div className="text-xs text-[var(--brand-text-secondary)] mt-1">
              {monthExpenses.length} lançamentos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Total de gastos
            </div>
            <div className="text-2xl font-semibold text-[var(--brand-primary)]">
              R$ {expenses.reduce((sum, e) => sum + e.value, 0).toFixed(2)}
            </div>
            <div className="text-xs text-[var(--brand-text-secondary)] mt-1">
              {expenses.length} lançamentos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Category */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(expensesByCategory).map(([category, data]) => (
              <div 
                key={category}
                className="flex items-center justify-between py-2 border-b border-[var(--brand-text-secondary)]/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[var(--brand-text-secondary)]">
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--brand-text-primary)]">
                      {getCategoryName(category)}
                    </div>
                    <div className="text-sm text-[var(--brand-text-secondary)]">
                      {data.count} lançamentos
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[var(--brand-primary)]">
                    R$ {data.total.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos de hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {todayExpenses.length > 0 ? (
            <div className="divide-y divide-[var(--brand-text-secondary)]/10">
              {todayExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  icon={getCategoryIcon(expense.category)}
                  category={getCategoryName(expense.category)}
                  amount={`R$ ${expense.value.toFixed(2)}`}
                  observation={expense.observation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--brand-text-secondary)]">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum gasto registrado hoje</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Expenses */}
      {monthExpenses.length > todayExpenses.length && (
        <Card>
          <CardHeader>
            <CardTitle>Gastos do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[var(--brand-text-secondary)]/10">
              {monthExpenses
                .filter(e => e.date !== today)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => (
                  <div key={expense.id} className="py-3">
                    <div className="flex items-center gap-2 mb-2 text-xs text-[var(--brand-text-secondary)]">
                      <Calendar className="w-3 h-3" />
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </div>
                    <ExpenseItem
                      icon={getCategoryIcon(expense.category)}
                      category={getCategoryName(expense.category)}
                      amount={`R$ ${expense.value.toFixed(2)}`}
                      observation={expense.observation}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Gasto"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
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
