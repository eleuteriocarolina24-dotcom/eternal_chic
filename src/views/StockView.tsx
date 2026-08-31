import React, { useState } from 'react';
import { 
  Search, 
  Package, 
  ShoppingBag, 
  Check, 
  X, 
  Plus, 
  Minus, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles,
  Filter,
  DollarSign,
  Barcode
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { SellModal } from '../components/SellModal';

export const StockView: React.FC = () => {
  const { products, updateProduct, showToast, settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'DISPONIVEL' | 'BAIXO_ESTOQUE' | 'ESGOTADO'>('TODOS');
  
  // Sell Modal State
  const [selectedProductToSell, setSelectedProductToSell] = useState<Product | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Quick direct sell of 1 unit without modal or with modal
  const handleOpenSellModal = (product: Product) => {
    if (product.stockQuantity <= 0) {
      showToast(`A peça "${product.name}" está ESGOTADA! Não é possível vender.`, 'warning');
      return;
    }
    setSelectedProductToSell(product);
    setIsSellModalOpen(true);
  };

  // Quick Restock (+1 or custom)
  const handleAdjustStock = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.stockQuantity + delta);
    if (newQty === product.stockQuantity) return;

    await updateProduct(product.id, { stockQuantity: newQty });
    if (delta > 0) {
      showToast(`+${delta} unidade(s) adicionadas a "${product.name}"`, 'success');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = 
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query));

    const matchesStatus = 
      statusFilter === 'TODOS' ||
      (statusFilter === 'DISPONIVEL' && p.stockQuantity > (settings.lowStockThreshold || 2)) ||
      (statusFilter === 'BAIXO_ESTOQUE' && p.stockQuantity > 0 && p.stockQuantity <= (settings.lowStockThreshold || 2)) ||
      (statusFilter === 'ESGOTADO' && p.stockQuantity === 0);

    return matchesQuery && matchesStatus;
  });

  // Calculate stock summary
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (settings.lowStockThreshold || 2)).length;
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9C5B2] pb-5">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.3em] opacity-60 block mb-1">
            Gestão em Tempo Real
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-[#3D2B1F]">
            Controle de Estoque
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Localize peças por código ou nome, altere unidades e registre baixas imediatas.
          </p>
        </div>

        {/* Mini stats counters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="px-3 py-1.5 bg-white border border-[#D9C5B2] rounded-sm text-xs font-serif text-[#3D2B1F] shrink-0 shadow-2xs">
            Total: <strong className="font-bold">{totalStockUnits}</strong> un
          </div>
          {lowStockCount > 0 && (
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-300/80 rounded-sm text-xs text-amber-900 shrink-0">
              Baixo: <strong>{lowStockCount}</strong>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="px-3 py-1.5 bg-red-50 border border-red-300/80 rounded-sm text-xs text-red-900 shrink-0">
              Esgotados: <strong>{outOfStockCount}</strong>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input with Barcode & Code hint */}
        <div className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            id="stock-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digitar código da peça (ex: ETC-101) ou nome..."
            className="w-full pl-8 pr-8 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#3D2B1F]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'DISPONIVEL', label: 'Disponíveis' },
            { id: 'BAIXO_ESTOQUE', label: 'Baixo Estoque' },
            { id: 'ESGOTADO', label: 'Esgotados' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`filter-status-${tab.id}`}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-widest font-medium transition-all shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-[#3D2B1F] text-white shadow-2xs'
                  : 'bg-[#F9F7F5] text-[#3D2B1F] border border-[#D9C5B2] hover:bg-[#F0EBE6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS STOCK LIST */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const isSoldOut = product.stockQuantity === 0;
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (settings.lowStockThreshold || 2);
            const unitProfit = product.salePrice - product.costPrice;

            return (
              <div
                key={product.id}
                id={`stock-item-${product.id}`}
                className={`bg-white rounded-sm p-4 border shadow-2xs transition-all duration-200 ${
                  isSoldOut
                    ? 'border-red-300/80 bg-red-50/10'
                    : isLowStock
                    ? 'border-amber-300/80 bg-amber-50/10'
                    : 'border-[#D9C5B2] hover:border-[#3D2B1F]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Product Info with Photo & Code */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative aspect-square w-16 h-16 md:w-20 md:h-20 rounded-sm overflow-hidden shrink-0 border border-[#D9C5B2] bg-[#F9F7F5]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#3D2B1F]/90 text-white text-[8px] font-mono rounded-xs">
                        {product.code}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-[#F0EBE6] text-[#3D2B1F] text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                          {product.category || 'Peça'}
                        </span>
                        {product.size && (
                          <span className="px-2 py-0.5 bg-white border border-[#D9C5B2] text-[#3D2B1F] text-[9px] font-medium rounded-xs">
                            Tam: {product.size}
                          </span>
                        )}
                        {product.color && (
                          <span className="text-[10px] text-[#8C7A6B]">
                            • {product.color}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-base font-normal text-[#3D2B1F] truncate">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2.5 text-xs text-[#3D2B1F] flex-wrap">
                        <span>Custo: <strong className="font-serif">R$ {product.costPrice.toFixed(2)}</strong></span>
                        <span className="text-[#8C7A6B]">•</span>
                        <span>Venda: <strong className="font-serif text-emerald-800 font-bold">R$ {product.salePrice.toFixed(2)}</strong></span>
                        <span className="text-[#8C7A6B]">•</span>
                        <span className="text-[10px] text-[#8C7A6B]">
                          Lucro: <strong>R$ {unitProfit.toFixed(2)}</strong> (+{product.profitMargin}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Stock Counter & Status Badge */}
                  <div className="flex items-center justify-between sm:justify-start gap-4 p-2.5 rounded-sm bg-[#FAF8F5] border border-[#D9C5B2]">
                    <div className="text-center sm:text-left">
                      <span className="text-[9px] uppercase tracking-widest text-[#8C7A6B] font-medium block">
                        Disponível
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button
                          id={`stock-minus-${product.id}`}
                          onClick={() => handleAdjustStock(product, -1)}
                          disabled={product.stockQuantity <= 0}
                          className="w-6 h-6 rounded-sm bg-white border border-[#D9C5B2] text-[#3D2B1F] hover:bg-[#F0EBE6] disabled:opacity-30 transition-colors flex items-center justify-center shadow-2xs"
                          title="Diminuir 1 unidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span
                          className={`font-serif text-lg font-bold px-2 ${
                            isSoldOut
                              ? 'text-red-800'
                              : isLowStock
                              ? 'text-amber-800'
                              : 'text-[#3D2B1F]'
                          }`}
                        >
                          {product.stockQuantity}
                        </span>

                        <button
                          id={`stock-plus-${product.id}`}
                          onClick={() => handleAdjustStock(product, 1)}
                          className="w-6 h-6 rounded-sm bg-white border border-[#D9C5B2] text-[#3D2B1F] hover:bg-[#F0EBE6] transition-colors flex items-center justify-center shadow-2xs"
                          title="Adicionar 1 unidade"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      <span
                        id={`status-badge-${product.id}`}
                        className={`inline-block px-2.5 py-1 rounded-sm text-[9px] uppercase tracking-widest font-semibold ${
                          isSoldOut
                            ? 'bg-red-800 text-white'
                            : isLowStock
                            ? 'bg-amber-800 text-white'
                            : 'bg-[#3D2B1F] text-white'
                        }`}
                      >
                        {isSoldOut ? 'ESGOTADO' : isLowStock ? 'BAIXO ESTOQUE' : 'DISPONÍVEL'}
                      </span>
                      <span className="block text-[9px] text-[#8C7A6B] mt-0.5">
                        {isSoldOut ? 'Sem estoque' : 'Pronto p/ entrega'}
                      </span>
                    </div>
                  </div>

                  {/* Right: "Vendeu? SIM / NÃO" Action Section (Requested in Section 3) */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-center sm:text-right hidden sm:block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] block">
                        Vendeu?
                      </span>
                      <span className="text-[9px] text-[#8C7A6B]">Baixa imediata</span>
                    </div>

                    <div className="flex w-full sm:w-auto gap-2">
                      {/* Botão NÃO */}
                      <button
                        type="button"
                        onClick={() => showToast('Produto mantido em estoque', 'info')}
                        className="flex-1 sm:flex-initial py-2 px-3 rounded-sm border border-[#D9C5B2] bg-[#F9F7F5] hover:bg-[#F0EBE6] text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3 h-3 text-[#8C7A6B]" />
                        <span>NÃO</span>
                      </button>

                      {/* Botão SIM (Registra venda, decrementa 1 un, atualiza dashboard) */}
                      <button
                        id={`sell-yes-btn-${product.id}`}
                        type="button"
                        onClick={() => handleOpenSellModal(product)}
                        disabled={isSoldOut}
                        className={`flex-1 sm:flex-initial py-2 px-4 rounded-sm text-[10px] uppercase tracking-widest font-medium shadow-2xs transition-all flex items-center justify-center gap-1.5 ${
                          isSoldOut
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'bg-[#3D2B1F] hover:bg-[#2C1F16] text-white active:scale-95'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>SIM (Vendeu)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-sm border border-[#D9C5B2] text-[#8C7A6B] font-serif italic">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#3D2B1F]" />
          <h3 className="text-lg text-[#3D2B1F] mb-1">
            Nenhuma peça corresponde à busca
          </h3>
          <p className="text-xs max-w-sm mx-auto font-sans not-italic">
            Verifique o código ou termo digitado ou limpe os filtros.
          </p>
        </div>
      )}

      {/* Quick Sale Confirmation Modal */}
      <SellModal
        product={selectedProductToSell}
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(false);
          setSelectedProductToSell(null);
        }}
      />
    </div>
  );
};
