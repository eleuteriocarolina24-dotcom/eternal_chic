import React, { useState } from 'react';
import { 
  Search, 
  Share2, 
  Copy, 
  MessageCircle, 
  Check, 
  Grid, 
  Eye, 
  ExternalLink, 
  Sparkles, 
  Tag, 
  ShoppingBag,
  Filter
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ButterflyLogo } from '../components/ButterflyLogo';

export const CatalogView: React.FC = () => {
  const { products, settings, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCustomerPreview, setIsCustomerPreview] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  const categories = ['Todos', 'Vestidos', 'Casacos & Blazers', 'Calças', 'Conjuntos', 'Blusas & Camisas', 'Saias', 'Acessórios'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.color && p.color.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Share text on WhatsApp
  const handleShareWhatsApp = (product: Product) => {
    const text = `✨ *${settings.storeName || 'Eternal Chic'}* ✨\n\n👗 *${product.name}*\n🏷️ Código: ${product.code}\n📏 Tamanho: ${product.size || 'Único'}\n🎨 Cor: ${product.color || 'Conforme foto'}\n💰 *Valor: R$ ${product.salePrice.toFixed(2)}*\n\n${product.description ? `📝 ${product.description}\n\n` : ''}${product.stockQuantity > 0 ? '✅ Disponível a pronta entrega!' : '❌ Esgotado no momento'}\n\n📲 Peça o seu agora pelo direct ou WhatsApp!`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    showToast('Abrindo WhatsApp para divulgação...', 'success');
  };

  // Copy product details text to clipboard
  const handleCopyText = (product: Product) => {
    const text = `✨ ${settings.storeName || 'Eternal Chic'} ✨\n👗 ${product.name}\n🏷️ Código: ${product.code}\n📏 Tamanho: ${product.size || 'Único'}\n🎨 Cor: ${product.color || 'Conforme foto'}\n💰 Valor: R$ ${product.salePrice.toFixed(2)}\n${product.description ? `📝 ${product.description}\n` : ''}${product.stockQuantity > 0 ? '✅ Disponível' : '❌ Esgotado'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(product.id);
    showToast('Informações copiadas! Cole no WhatsApp ou Instagram.', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Vitrine Header */}
      <div className="bg-[#FAF8F5] p-6 md:p-8 rounded-sm border border-[#D9C5B2] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3 bg-[#3D2B1F] rounded-sm text-white shrink-0 shadow-2xs">
            <ButterflyLogo size={38} variant="gold" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8C7A6B]">
                Vitrine Digital
              </span>
              <span className="text-[10px] text-[#8C7A6B]">• Moda Feminina Autoral</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-light text-[#3D2B1F] mt-0.5">
              Catálogo de Peças {settings.storeName ? `— ${settings.storeName}` : 'Eternal Chic'}
            </h1>
            <p className="text-xs text-[#8C7A6B] mt-1 font-light">
              {isCustomerPreview 
                ? 'Modo Cliente ativo: Exibindo apenas preços de venda e disponibilidade.'
                : 'Compartilhe fotos e valores diretamente com clientes pelo WhatsApp.'}
            </p>
          </div>
        </div>

        {/* View as customer toggle */}
        <button
          id="toggle-customer-preview-btn"
          onClick={() => setIsCustomerPreview(!isCustomerPreview)}
          className={`px-4 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-medium transition-all flex items-center gap-2 shrink-0 shadow-2xs ${
            isCustomerPreview
              ? 'bg-[#3D2B1F] text-white'
              : 'bg-white text-[#3D2B1F] border border-[#D9C5B2] hover:bg-[#F0EBE6]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isCustomerPreview ? 'Visão da Loja' : 'Visualizar como Cliente'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            id="catalog-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar vestido, blazer, código..."
            className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-[#3D2B1F] text-white shadow-2xs'
                  : 'bg-[#F9F7F5] text-[#3D2B1F] border border-[#D9C5B2] hover:bg-[#F0EBE6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CATALOG CARDS GRID (Requested in Section 4) */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isSoldOut = product.stockQuantity === 0;

            return (
              <div
                key={product.id}
                id={`catalog-card-${product.id}`}
                className="bg-white rounded-sm border border-[#D9C5B2] overflow-hidden shadow-2xs hover:border-[#3D2B1F] transition-all duration-300 flex flex-col group"
              >
                {/* 1. Foto Grande da Peça */}
                <div className="relative aspect-3/4 bg-[#F9F7F5] overflow-hidden cursor-pointer">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onClick={() => setSelectedProductDetail(product)}
                  />

                  {/* Código da Peça */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#3D2B1F]/90 backdrop-blur-xs text-white text-[9px] font-mono rounded-sm">
                    {product.code}
                  </div>

                  {/* Status do Estoque / ESGOTADO */}
                  <div className="absolute top-2.5 right-2.5">
                    {isSoldOut ? (
                      <span className="px-2 py-0.5 bg-red-800 text-white text-[9px] uppercase tracking-wider font-semibold rounded-sm">
                        ESGOTADO
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-white/95 backdrop-blur-xs text-[#3D2B1F] text-[9px] uppercase tracking-wider font-semibold rounded-sm">
                        {product.stockQuantity} un
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-semibold text-[#8C7A6B]">
                      <span>{product.category}</span>
                      {product.size && <span>Tam: {product.size}</span>}
                    </div>

                    <h3 
                      onClick={() => setSelectedProductDetail(product)}
                      className="font-serif text-base font-normal text-[#3D2B1F] group-hover:text-[#8C7A6B] transition-colors cursor-pointer line-clamp-2 mt-0.5"
                    >
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-xs text-[#8C7A6B] line-clamp-2 font-light">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="pt-2 border-t border-[#D9C5B2] flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-semibold text-[#8C7A6B] block">
                        Valor
                      </span>
                      <span className="font-serif text-xl font-normal text-[#3D2B1F]">
                        R$ {product.salePrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Internal cost view if NOT in customer mode */}
                    {!isCustomerPreview && (
                      <div className="text-right text-[10px] text-[#8C7A6B]">
                        <span>Custo: R$ {product.costPrice.toFixed(2)}</span>
                        <span className="block text-emerald-800 font-semibold">
                          Lucro: +R$ {(product.salePrice - product.costPrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Share & Copy Buttons (Requested in Section 4) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      id={`copy-catalog-${product.id}-btn`}
                      onClick={() => handleCopyText(product)}
                      className="py-2 px-2.5 rounded-sm border border-[#D9C5B2] bg-[#F9F7F5] hover:bg-[#F0EBE6] text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      title="Copiar texto para colar em redes sociais"
                    >
                      {copiedId === product.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span className="text-emerald-800 font-semibold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#8C7A6B]" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      id={`whatsapp-catalog-${product.id}-btn`}
                      onClick={() => handleShareWhatsApp(product)}
                      className="py-2 px-2.5 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <MessageCircle className="w-3 h-3 text-[#D9C5B2]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-sm border border-[#D9C5B2] text-[#8C7A6B] font-serif italic">
          <Grid className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#3D2B1F]" />
          <h3 className="text-lg text-[#3D2B1F] mb-1">
            Nenhuma peça no catálogo
          </h3>
          <p className="text-xs max-w-sm mx-auto font-sans not-italic">
            Cadastre novas peças no menu "Produtos" para compor a sua vitrine.
          </p>
        </div>
      )}

      {/* Modal Detail Zoom */}
      {selectedProductDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1F16]/70 backdrop-blur-xs p-4"
          onClick={() => setSelectedProductDetail(null)}
        >
          <div
            className="bg-[#FAF8F5] rounded-sm max-w-2xl w-full overflow-hidden shadow-2xl border border-[#D9C5B2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="aspect-square bg-white">
                <img
                  src={selectedProductDetail.imageUrl}
                  alt={selectedProductDetail.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#3D2B1F] text-white text-[10px] font-mono rounded-sm">
                      {selectedProductDetail.code}
                    </span>
                    <span className="text-[10px] text-[#8C7A6B] font-semibold uppercase tracking-widest">
                      {selectedProductDetail.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-[#3D2B1F]">
                    {selectedProductDetail.name}
                  </h3>
                  <div className="mt-3 font-serif text-3xl font-normal text-[#3D2B1F]">
                    R$ {selectedProductDetail.salePrice.toFixed(2)}
                  </div>
                  {selectedProductDetail.description && (
                    <p className="text-xs text-[#3D2B1F] mt-3 leading-relaxed font-light">
                      {selectedProductDetail.description}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-[#D9C5B2] text-xs text-[#8C7A6B] space-y-1">
                    <p>📏 Tamanho: <strong className="text-[#3D2B1F]">{selectedProductDetail.size || 'Único'}</strong></p>
                    <p>🎨 Cor: <strong className="text-[#3D2B1F]">{selectedProductDetail.color || 'Padrão'}</strong></p>
                    <p>📦 Estoque: <strong className="text-[#3D2B1F]">{selectedProductDetail.stockQuantity} unidades</strong></p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleShareWhatsApp(selectedProductDetail)}
                    className="flex-1 py-2.5 px-4 rounded-sm bg-[#3D2B1F] text-white text-[10px] uppercase tracking-widest font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#D9C5B2]" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSelectedProductDetail(null)}
                    className="py-2.5 px-4 rounded-sm border border-[#D9C5B2] text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium hover:bg-[#F0EBE6]"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
