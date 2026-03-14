import React, { useState, useRef } from 'react';
import { useApp } from '@/app/context/AppContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Modal,
  Input,
  ProductCard
} from '@/app/components/brownie-bee';
import { Plus, Package, Upload, X, Trash2, Grid3x3, List, Pencil } from 'lucide-react';

export default function Produtos() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    active: true,
    visibleInMenu: true,
    controlsStock: true,
    defaultStockLocation: 'vitrine'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setProductForm({
      name: '',
      price: '',
      category: '',
      image: '',
      active: true,
      visibleInMenu: true,
      controlsStock: true,
      defaultStockLocation: 'vitrine'
    });
    setSelectedProduct(null);
    setIsEditMode(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      active: product.active,
      visibleInMenu: product.visibleInMenu,
      controlsStock: product.controlsStock,
      defaultStockLocation: product.defaultStockLocation
    });
    setSelectedProduct(productId);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductForm({ ...productForm, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProductForm({ ...productForm, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) return;
    
    if (isEditMode && selectedProduct) {
      // Update existing product
      updateProduct(selectedProduct, {
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category || 'Geral',
        image: productForm.image || undefined,
        active: productForm.active,
        visibleInMenu: productForm.visibleInMenu,
        controlsStock: productForm.controlsStock,
        defaultStockLocation: productForm.defaultStockLocation
      });
    } else {
      // Add new product
      addProduct({
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category || 'Geral',
        image: productForm.image || undefined,
        active: productForm.active,
        visibleInMenu: productForm.visibleInMenu,
        controlsStock: productForm.controlsStock,
        defaultStockLocation: productForm.defaultStockLocation
      });
    }
    
    resetForm();
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(productId);
    }
  };

  const activeProducts = products.filter(p => p.active);
  const inactiveProducts = products.filter(p => !p.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Produtos</h1>
          <p className="text-[var(--brand-text-secondary)] text-sm mt-1">
            Gerencie os produtos da sua vitrine
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} data-tour="produtos-primary-action">
          <Plus className="w-4 h-4 mr-1" />
          Novo Produto
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Total de produtos
            </div>
            <div className="text-2xl font-semibold text-[var(--brand-primary)]">
              {products.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Produtos ativos
            </div>
            <div className="text-2xl font-semibold text-[var(--status-success)]">
              {activeProducts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-[var(--brand-text-secondary)] text-sm mb-1">
              Visíveis no cardápio
            </div>
            <div className="text-2xl font-semibold text-[var(--brand-primary)]">
              {products.filter(p => p.visibleInMenu).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Products */}
      {activeProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2>Produtos Ativos</h2>
            
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-[var(--brand-surface)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-primary)]'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-primary)]'
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  price={`R$ ${product.price.toFixed(2)}`}
                  image={product.image}
                  isActive={product.active}
                  isVisible={product.visibleInMenu}
                  onActiveChange={(active) => updateProduct(product.id, { active })}
                  onVisibleChange={(visible) => updateProduct(product.id, { visibleInMenu: visible })}
                  onEdit={() => handleOpenEdit(product.id)}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--brand-bg)] border-b border-[var(--brand-text-secondary)]/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--brand-text-secondary)]">
                          Produto
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--brand-text-secondary)]">
                          Categoria
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--brand-text-secondary)]">
                          Preço
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-[var(--brand-text-secondary)]">
                          Ativo
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-[var(--brand-text-secondary)]">
                          Visível
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-[var(--brand-text-secondary)]">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--brand-text-secondary)]/10">
                      {activeProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-[var(--brand-bg)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 flex-shrink-0 bg-[var(--status-info)] rounded-lg overflow-hidden">
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-[var(--brand-text-secondary)]" />
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-[var(--brand-text-primary)]">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--brand-text-secondary)]">
                            {product.category}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                            R$ {product.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={product.active}
                                  onChange={(e) => updateProduct(product.id, { active: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand-primary)]"></div>
                              </label>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={product.visibleInMenu}
                                  onChange={(e) => updateProduct(product.id, { visibleInMenu: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand-primary)]"></div>
                              </label>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(product.id)}
                                className="p-2 text-[var(--brand-primary)] hover:bg-[var(--brand-bg)] rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 text-[var(--status-danger)] hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Inactive Products */}
      {inactiveProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inactiveProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-[var(--status-info)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-[var(--brand-text-primary)]">
                        {product.name}
                      </div>
                      <div className="text-sm text-[var(--brand-text-secondary)]">
                        R$ {product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateProduct(product.id, { active: true })}
                    >
                      Reativar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-[var(--status-danger)]" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-[var(--brand-text-secondary)] opacity-30" />
              <h3 className="mb-2">Nenhum produto cadastrado</h3>
              <p className="text-[var(--brand-text-secondary)] mb-4">
                Adicione produtos para controlar sua vitrine
              </p>
              <Button variant="primary" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4 mr-1" />
                Cadastrar primeiro produto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? 'Editar Produto' : 'Novo Produto'}
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveProduct}>
              {isEditMode ? 'Salvar' : 'Adicionar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-[var(--brand-text-primary)]">
              Imagem do produto
            </label>
            
            {productForm.image ? (
              <div className="relative inline-block">
                <img 
                  src={productForm.image} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-lg object-cover border-2 border-[var(--brand-primary)]"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--status-danger)] text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--brand-text-secondary)]/30 rounded-lg cursor-pointer hover:border-[var(--brand-primary)] transition-colors"
                >
                  <Upload className="w-8 h-8 text-[var(--brand-text-secondary)] mb-2" />
                  <span className="text-sm text-[var(--brand-text-secondary)]">
                    Clique para adicionar imagem
                  </span>
                </label>
              </div>
            )}
          </div>

          <Input
            label="Nome do produto *"
            placeholder="Ex: Brownie Tradicional"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preço *"
              type="number"
              placeholder="0,00"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
            />
            <Input
              label="Categoria"
              placeholder="Ex: Brownies"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-[var(--brand-text-primary)]">
              Localização do estoque
            </label>
            <select
              className="w-full px-4 py-2 bg-[var(--brand-surface)] border border-[var(--brand-text-secondary)]/20 rounded-[var(--radius-button)] text-[var(--brand-text-primary)]"
              value={productForm.defaultStockLocation}
              onChange={(e) => setProductForm({ ...productForm, defaultStockLocation: e.target.value as any })}
            >
              <option value="geladeira">Geladeira (produtos prontos e bebidas)</option>
              <option value="geral">Estoque Geral (ingredientes e insumos)</option>
            </select>
            <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
              💡 Produtos prontos (brownies, bolos) e bebidas vão para Vitrine. Ingredientes (chocolate, farinha) vão para Estoque Geral.
            </p>
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.controlsStock}
                onChange={(e) => setProductForm({ ...productForm, controlsStock: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--brand-text-secondary)]/20"
              />
              <span className="text-sm text-[var(--brand-text-primary)]">
                Controla estoque
              </span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.visibleInMenu}
                onChange={(e) => setProductForm({ ...productForm, visibleInMenu: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--brand-text-secondary)]/20"
              />
              <span className="text-sm text-[var(--brand-text-primary)]">
                Visível no cardápio
              </span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.active}
                onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--brand-text-secondary)]/20"
              />
              <span className="text-sm text-[var(--brand-text-primary)]">
                Ativo
              </span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}