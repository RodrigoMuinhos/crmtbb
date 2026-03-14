import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Input
} from '@/app/components/brownie-bee';
import { Plus, Trash2, ShoppingBag, Calendar, Pencil } from 'lucide-react';

export default function Compras() {
  const { purchases, addPurchase, deletePurchase } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    store: '',
    items: [{ name: '', quantity: '', cost: '' }]
  });

  // Get unique item names from all previous purchases for autocomplete
  const previousItemNames = React.useMemo(() => {
    const names = new Set<string>();
    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        if (item.name) names.add(item.name);
      });
    });
    return Array.from(names).sort();
  }, [purchases]);

  // Calculate total value from items
  const calculatedTotal = React.useMemo(() => {
    return purchaseForm.items.reduce((sum, item) => {
      const itemCost = item.cost ? parseFloat(item.cost) : 0;
      const itemQty = item.quantity ? parseFloat(item.quantity) : 0;
      return sum + (itemCost * itemQty);
    }, 0);
  }, [purchaseForm.items]);

  const handleAddItem = () => {
    setPurchaseForm({
      ...purchaseForm,
      items: [...purchaseForm.items, { name: '', quantity: '', cost: '' }]
    });
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseForm({
      ...purchaseForm,
      items: purchaseForm.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...purchaseForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setPurchaseForm({ ...purchaseForm, items: newItems });
  };

  const handleSubmit = () => {
    if (!purchaseForm.store || purchaseForm.items.some(i => !i.name || !i.quantity)) {
      return;
    }

    addPurchase({
      date: purchaseForm.date,
      store: purchaseForm.store,
      totalValue: calculatedTotal,
      items: purchaseForm.items.map(item => ({
        id: Date.now().toString() + Math.random(),
        name: item.name,
        quantity: parseFloat(item.quantity),
        cost: item.cost ? parseFloat(item.cost) : undefined
      }))
    });

    setPurchaseForm({
      date: new Date().toISOString().split('T')[0],
      store: '',
      items: [{ name: '', quantity: '', cost: '' }]
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const sortedPurchases = [...purchases].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDeletePurchase = (id: string) => {
    if (confirm('Excluir esta compra?')) {
      deletePurchase(id);
    }
  };

  const handleOpenEdit = (id: string) => {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;
    setEditingId(id);
    setPurchaseForm({
      date: purchase.date,
      store: purchase.store,
      items: purchase.items.map(i => ({
        name: i.name,
        quantity: i.quantity.toString(),
        cost: i.cost !== undefined ? i.cost.toString() : ''
      }))
    });
    setIsAdding(true);
  };

  const handleSubmitEdit = () => {
    if (!editingId || !purchaseForm.store || purchaseForm.items.some(i => !i.name || !i.quantity)) return;
    deletePurchase(editingId);
    addPurchase({
      date: purchaseForm.date,
      store: purchaseForm.store,
      totalValue: calculatedTotal,
      items: purchaseForm.items.map(item => ({
        id: Date.now().toString() + Math.random(),
        name: item.name,
        quantity: parseFloat(item.quantity),
        cost: item.cost ? parseFloat(item.cost) : undefined
      }))
    });
    setPurchaseForm({
      date: new Date().toISOString().split('T')[0],
      store: '',
      items: [{ name: '', quantity: '', cost: '' }]
    });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Compras</h1>
          <p className="text-[var(--brand-text-secondary)] text-sm mt-1">
            Registre suas compras no atacado
          </p>
        </div>
        {!isAdding && (
          <Button variant="primary" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nova Compra
          </Button>
        )}
      </div>

      {/* New Purchase Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Compra' : 'Nova Compra'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Data *"
                  type="date"
                  value={purchaseForm.date}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                />
                <Input
                  label="Mercado *"
                  placeholder="Nome do mercado..."
                  value={purchaseForm.store}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, store: e.target.value })}
                />
                <Input
                  label="Valor total"
                  type="number"
                  placeholder="0,00"
                  value={calculatedTotal.toFixed(2)}
                  readOnly
                />
              </div>

              {/* Step 2: Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Itens da compra</h4>
                  <Button variant="ghost" size="sm" onClick={handleAddItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {purchaseForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          label="Nome *"
                          placeholder="Ex: Chocolate 70%"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          suggestions={previousItemNames}
                          onSuggestionSelect={(value) => handleItemChange(index, 'name', value)}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          label="Quantidade *"
                          type="number"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          label="Custo"
                          type="number"
                          placeholder="0,00"
                          value={item.cost}
                          onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                        />
                      </div>
                      {purchaseForm.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="mb-0.5"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--status-critical)]" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t border-[var(--brand-text-secondary)]/10">
                <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={editingId ? handleSubmitEdit : handleSubmit}>
                  Salvar Compra
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchases List */}
      {sortedPurchases.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg">Histórico de Compras</h2>
          {sortedPurchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-4 h-4 text-[var(--brand-primary)]" />
                      <h3 className="font-medium">{purchase.store}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
                      <Calendar className="w-3 h-3" />
                      {new Date(purchase.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {purchase.totalValue && (
                    <div className="text-right">
                      <div className="text-sm text-[var(--brand-text-secondary)]">Total</div>
                      <div className="text-lg font-semibold text-[var(--brand-primary)]">
                        R$ {purchase.totalValue.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--brand-text-secondary)]/10 pt-3">
                  <div className="text-sm text-[var(--brand-text-secondary)] mb-2">
                    Itens ({purchase.items.length})
                  </div>
                  <div className="space-y-2">
                    {purchase.items.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-[var(--brand-text-primary)]">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--brand-text-secondary)]">
                            {item.quantity} un
                          </span>
                          {item.cost && (
                            <span className="font-medium text-[var(--brand-primary)]">
                              R$ {item.cost.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--brand-text-secondary)]/10">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(purchase.id)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePurchase(purchase.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1 text-[var(--status-critical)]" />
                    <span className="text-[var(--status-critical)]">Excluir</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isAdding && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[var(--brand-text-secondary)] opacity-30" />
                <h3 className="mb-2">Nenhuma compra registrada</h3>
                <p className="text-[var(--brand-text-secondary)] mb-4">
                  Registre suas compras de mercado para manter o estoque atualizado
                </p>
                <Button variant="primary" onClick={() => setIsAdding(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Registrar primeira compra
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}