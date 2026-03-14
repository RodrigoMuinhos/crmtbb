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
  StockItem,
  Badge
} from '@/app/components/brownie-bee';
import { Package, Plus, Pencil, MoveRight, Check, X } from 'lucide-react';

type TabType = 'producao' | 'armazenado' | 'vitrine';

export default function Estoque() {
  const { 
    stock, 
    updateStockItem, 
    addStockItem, 
    pendingTransfers,
    createTransferRequest,
    acceptTransferRequest,
    rejectTransferRequest
  } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('producao');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    location: 'geral' as 'geral' | 'armazenado' | 'vitrine',
    minQuantity: ''
  });

  const producaoStock = stock.filter(s => s.location === 'geral');
  const armazenadoStock = stock.filter(s => s.location === 'armazenado');
  const vitrineStock = stock.filter(s => s.location === 'vitrine');

  const getStockStatus = (item: any): 'ok' | 'low' | 'critical' => {
    if (!item.minQuantity) return 'ok';
    if (item.quantity <= item.minQuantity * 0.5) return 'critical';
    if (item.quantity <= item.minQuantity) return 'low';
    return 'ok';
  };

  // Check if item has pending transfer request
  const hasPendingTransfer = (itemId: string) => {
    return pendingTransfers.some(t => t.stockItemId === itemId);
  };

  const getPendingTransferQuantity = (itemId: string) => {
    const transfer = pendingTransfers.find(t => t.stockItemId === itemId);
    return transfer?.quantity || 0;
  };

  const handleAdjust = () => {
    if (!selectedItem || !adjustQuantity) return;
    const newQty = parseFloat(adjustQuantity);
    if (newQty >= 0) {
      updateStockItem(selectedItem.id, { quantity: newQty });
      setIsAdjustModalOpen(false);
      setSelectedItem(null);
      setAdjustQuantity('');
    }
  };

  const handleTransferToFridge = () => {
    if (!selectedItem || !transferQuantity) return;
    const qty = parseFloat(transferQuantity);
    
    if (qty <= 0 || qty > selectedItem.quantity) return;
    
    // Criar solicitação de transferência
    const cleanName = selectedItem.name
      .replace(' (recém-feito)', '')
      .replace(' (congelada)', '')
      .replace(' (congelado)', '')
      .replace(' (não gelada)', '')
      .replace(' (não gelado)', '');
    
    createTransferRequest({
      stockItemId: selectedItem.id,
      itemName: cleanName,
      quantity: qty,
      unit: selectedItem.unit,
      productId: selectedItem.productId,
      minQuantity: selectedItem.minQuantity
    });
    
    setIsTransferModalOpen(false);
    setSelectedItem(null);
    setTransferQuantity('');
  };

  const handleAddItem = () => {
    if (!newItemForm.name || !newItemForm.quantity) return;
    
    addStockItem({
      productId: '',
      name: newItemForm.name,
      quantity: parseFloat(newItemForm.quantity),
      unit: newItemForm.unit,
      location: newItemForm.location,
      minQuantity: newItemForm.minQuantity ? parseFloat(newItemForm.minQuantity) : undefined
    });
    
    setNewItemForm({
      name: '',
      quantity: '',
      unit: 'kg',
      location: 'geral',
      minQuantity: ''
    });
    setIsAddModalOpen(false);
  };

  const openAdjustModal = (item: any) => {
    setSelectedItem(item);
    setAdjustQuantity(item.quantity.toString());
    setIsAdjustModalOpen(true);
  };

  const openTransferModal = (item: any) => {
    setSelectedItem(item);
    setTransferQuantity(item.quantity.toString());
    setIsTransferModalOpen(true);
  };

  const openAddModal = (location: 'geral' | 'armazenado' | 'vitrine') => {
    setNewItemForm({
      ...newItemForm,
      location: location
    });
    setIsAddModalOpen(true);
  };

  const getLocationLabel = (location: 'geral' | 'armazenado' | 'vitrine'): string => {
    const labels = {
      geral: 'Estoque Produção',
      armazenado: 'Produtos Armazenados',
      vitrine: 'Vitrine'
    };
    return labels[location];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Estoque</h1>
        <p className="text-[var(--brand-text-secondary)] text-sm mt-1">
          Gerencie ingredientes de produção e produtos prontos
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[var(--brand-text-secondary)]/20">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('producao')}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'producao'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-primary)]'
            }`}
          >
            Estoque Produção
            <Badge status="info" className="ml-2">{producaoStock.length}</Badge>
          </button>
          <button
            onClick={() => setActiveTab('armazenado')}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'armazenado'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-primary)]'
            }`}
          >
            Produtos Armazenados
            <Badge status="info" className="ml-2">{armazenadoStock.length}</Badge>
          </button>
          <button
            onClick={() => setActiveTab('vitrine')}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'vitrine'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-primary)]'
            }`}
          >
            Vitrine
            <Badge status="info" className="ml-2">{vitrineStock.length}</Badge>
          </button>
        </div>
      </div>

      {/* Estoque Produção Tab */}
      {activeTab === 'producao' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Estoque Produção</CardTitle>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  Ingredientes crus comprados no mercado (chocolate, farinha, açúcar, etc)
                </p>
              </div>
              <Button variant="primary" onClick={() => openAddModal('geral')}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {producaoStock.length > 0 ? (
              <div className="space-y-3">
                {producaoStock.map((item) => (
                  <div key={item.id} className="border-b border-[var(--brand-text-secondary)]/10 last:border-0 pb-3 last:pb-0">
                    <StockItem
                      name={item.name}
                      quantity={item.quantity}
                      unit={item.unit}
                      status={getStockStatus(item)}
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAdjustModal(item)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Ajustar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--brand-text-secondary)]">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum item no estoque de produção</p>
                <p className="text-sm mt-1">Registre uma compra para adicionar ingredientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Produtos Armazenados Tab */}
      {activeTab === 'armazenado' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produtos Armazenados</CardTitle>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  Produtos prontos aguardando para ir à vitrine
                </p>
              </div>
              <Button variant="primary" onClick={() => openAddModal('armazenado')}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {armazenadoStock.length > 0 ? (
              <div className="space-y-3">
                {armazenadoStock.map((item) => (
                  <div key={item.id} className="border-b border-[var(--brand-text-secondary)]/10 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <StockItem
                          name={item.name}
                          quantity={item.quantity}
                          unit={item.unit}
                          status={getStockStatus(item)}
                        />
                      </div>
                      {hasPendingTransfer(item.id) && (
                        <Badge status="warning">
                          {getPendingTransferQuantity(item.id)} {item.unit} pendente
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openTransferModal(item)}
                        disabled={hasPendingTransfer(item.id)}
                      >
                        <MoveRight className="w-3 h-3 mr-1" />
                        Enviar para Vitrine
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAdjustModal(item)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Ajustar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--brand-text-secondary)]">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum produto armazenado</p>
                <p className="text-sm mt-1">Produtos prontos que ainda não foram para a geladeira</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vitrine Tab */}
      {activeTab === 'vitrine' && (
        <>
          {/* Pending Transfers Section */}
          {pendingTransfers.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge status="warning">Requer atenção</Badge>
                  <CardTitle>Solicitações Pendentes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTransfers.map((transfer) => (
                    <div 
                      key={transfer.id} 
                      className="flex items-center justify-between p-3 bg-[var(--brand-bg)] rounded-lg border border-[var(--brand-text-secondary)]/20"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-[var(--brand-text-primary)]">
                          {transfer.itemName}
                        </div>
                        <div className="text-sm text-[var(--brand-text-secondary)] mt-1">
                          {transfer.quantity} {transfer.unit} aguardando para entrar na vitrine
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => acceptTransferRequest(transfer.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rejectTransferRequest(transfer.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fridge Stock */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vitrine</CardTitle>
                  <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                    Produtos prontos em vitrine para venda (brownies, bolos, bebidas)
                  </p>
                </div>
                <Button variant="primary" onClick={() => openAddModal('vitrine')}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {vitrineStock.length > 0 ? (
                <div className="space-y-3">
                  {vitrineStock.map((item) => (
                    <div key={item.id} className="border-b border-[var(--brand-text-secondary)]/10 last:border-0 pb-3 last:pb-0">
                      <StockItem
                        name={item.name}
                        quantity={item.quantity}
                        unit={item.unit}
                        status={getStockStatus(item)}
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAdjustModal(item)}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Ajustar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--brand-text-secondary)]">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum produto na geladeira</p>
                  <p className="text-sm mt-1">Adicione brownies, bolos e bebidas prontos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Adjust Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedItem(null);
          setAdjustQuantity('');
        }}
        title="Ajustar Estoque"
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setIsAdjustModalOpen(false);
              setSelectedItem(null);
              setAdjustQuantity('');
            }}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAdjust}>
              Salvar
            </Button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--brand-text-secondary)] mb-1">Item</p>
              <p className="font-medium">{selectedItem.name}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--brand-text-secondary)] mb-1">Local</p>
              <p className="font-medium">{getLocationLabel(selectedItem.location)}</p>
            </div>
            <Input
              label="Nova quantidade *"
              type="number"
              placeholder="0"
              value={adjustQuantity}
              onChange={(e) => setAdjustQuantity(e.target.value)}
            />
            <p className="text-xs text-[var(--brand-text-secondary)]">
              Use para corrigir perdas, consumo ou erros de registro
            </p>
          </div>
        )}
      </Modal>

      {/* Transfer to Fridge Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedItem(null);
          setTransferQuantity('');
        }}
        title="Enviar para Vitrine"
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setIsTransferModalOpen(false);
              setSelectedItem(null);
              setTransferQuantity('');
            }}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleTransferToFridge}>
              Enviar
            </Button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--brand-text-secondary)] mb-1">Item</p>
              <p className="font-medium">{selectedItem.name}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--brand-text-secondary)] mb-1">Disponível</p>
              <p className="font-medium">{selectedItem.quantity} {selectedItem.unit}</p>
            </div>
            <Input
              label={`Quantidade a enviar (máx: ${selectedItem.quantity}) *`}
              type="number"
              placeholder="0"
              max={selectedItem.quantity}
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(e.target.value)}
            />
            <div className="p-3 bg-[var(--brand-bg)] rounded-lg">
              <p className="text-xs text-[var(--brand-text-secondary)]">
                🧊 Este produto será movido para a vitrine e ficará disponível para venda
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewItemForm({
            name: '',
            quantity: '',
            unit: 'kg',
            location: 'geral',
            minQuantity: ''
          });
        }}
        title={`Adicionar Item - ${getLocationLabel(newItemForm.location)}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setIsAddModalOpen(false);
              setNewItemForm({
                name: '',
                quantity: '',
                unit: 'kg',
                location: 'geral',
                minQuantity: ''
              });
            }}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddItem}>
              Adicionar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-[var(--brand-bg)] rounded-lg">
            <p className="text-xs text-[var(--brand-text-secondary)]">
              {newItemForm.location === 'geral' 
                ? '📦 Ingredientes crus: chocolate, farinha, ovos, açúcar, etc.'
                : newItemForm.location === 'armazenado'
                ? '📋 Produtos prontos: brownies recém-feitos, brigadeiros, salgados congelados, bebidas não geladas'
                : '🧊 Produtos em vitrine: brownies, bolos, bebidas expostas'}
            </p>
          </div>
          
          <Input
            label="Nome do item *"
            placeholder={
              newItemForm.location === 'geral' 
                ? 'Ex: Chocolate 70%' 
                : newItemForm.location === 'armazenado'
                ? 'Ex: Brownie Tradicional (recém-feito)'
                : 'Ex: Brownie Tradicional'
            }
            value={newItemForm.name}
            onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantidade *"
              type="number"
              placeholder="0"
              value={newItemForm.quantity}
              onChange={(e) => setNewItemForm({ ...newItemForm, quantity: e.target.value })}
            />
            <div>
              <label className="block mb-2 text-[var(--brand-text-primary)]">
                Unidade
              </label>
              <select
                className="w-full px-4 py-2 bg-[var(--brand-surface)] border border-[var(--brand-text-secondary)]/20 rounded-[var(--radius-button)] text-[var(--brand-text-primary)]"
                value={newItemForm.unit}
                onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
              >
                <option value="kg">kg</option>
                <option value="unidades">unidades</option>
                <option value="litros">litros</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Quantidade mínima (alerta)"
            type="number"
            placeholder="0"
            value={newItemForm.minQuantity}
            onChange={(e) => setNewItemForm({ ...newItemForm, minQuantity: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}