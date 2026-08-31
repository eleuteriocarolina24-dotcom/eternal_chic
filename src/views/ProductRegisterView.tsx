import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ArrowRight,
  TrendingUp,
  Percent,
  DollarSign,
  Package,
  Layers,
  Filter
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, StockStatus } from '../types';
import { CameraModal } from '../components/CameraModal';
import { optimizeImage } from '../lib/firebase';

export const ProductRegisterView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, showToast, settings } = useStore();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Vestidos');
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('');
  const [costPrice, setCostPrice] = useState<string>('50.00');
  const [profitMargin, setProfitMargin] = useState<string>('100');
  const [salePrice, setSalePrice] = useState<string>('100.00');
  const [stockQuantity, setStockQuantity] = useState<string>('5');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Filter & Search state for the list below
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Fashion presets for sample photos
  const sampleFashionPhotos = [
    { label: 'Vestido Floral', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
    { label: 'Blazer Alfaiataria', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' },
    { label: 'Calça Linho', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' },
    { label: 'Conjunto Tricot', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Camisa Romântica', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80' },
    { label: 'Vestido Noite', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80' },
    { label: 'Saia Plissada', url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80' },
    { label: 'Acessório Chic', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80' },
  ];

  // Auto-generate initial code
  useEffect(() => {
    if (!editingId && !code) {
      const nextCode = `ETC-${products.length + 101}`;
      setCode(nextCode);
    }
  }, [products.length, editingId]);

  // Recalculate Sale Price when Cost or Profit Margin changes
  const handleCostChange = (val: string) => {
    setCostPrice(val);
    const numCost = parseFloat(val) || 0;
    const numMargin = parseFloat(profitMargin) || 0;
    const calcSale = numCost + (numCost * (numMargin / 100));
    setSalePrice(calcSale.toFixed(2));
  };

  const handleMarginChange = (val: string) => {
    setProfitMargin(val);
    const numCost = parseFloat(costPrice) || 0;
    const numMargin = parseFloat(val) || 0;
    const calcSale = numCost + (numCost * (numMargin / 100));
    setSalePrice(calcSale.toFixed(2));
  };

  // Recalculate Profit Margin when Sale Price is manually modified
  const handleSalePriceChange = (val: string) => {
    setSalePrice(val);
    const numCost = parseFloat(costPrice) || 0;
    const numSale = parseFloat(val) || 0;
    if (numCost > 0) {
      const calcMargin = ((numSale - numCost) / numCost) * 100;
      setProfitMargin(calcMargin.toFixed(1));
    }
  };

  // Quick Margin Buttons
  const applyQuickMargin = (percent: number) => {
    setProfitMargin(percent.toString());
    const numCost = parseFloat(costPrice) || 0;
    const calcSale = numCost + (numCost * (percent / 100));
    setSalePrice(calcSale.toFixed(2));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImage(file, 800, 800, 0.82);
        setImageUrl(optimized);
        showToast('Foto da galeria selecionada e otimizada!', 'success');
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImageUrl(event.target.result as string);
            showToast('Foto da galeria selecionada!', 'success');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleStartEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCode(product.code);
    setCategory(product.category || 'Vestidos');
    setSize(product.size || 'M');
    setColor(product.color || '');
    setCostPrice(product.costPrice.toString());
    setProfitMargin(product.profitMargin.toString());
    setSalePrice(product.salePrice.toString());
    setStockQuantity(product.stockQuantity.toString());
    setImageUrl(product.imageUrl);
    setDescription(product.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setCode(`ETC-${products.length + 101}`);
    setCategory('Vestidos');
    setSize('M');
    setColor('');
    setCostPrice('50.00');
    setProfitMargin('100');
    setSalePrice('100.00');
    setStockQuantity('5');
    setImageUrl(sampleFashionPhotos[0].url);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Informe o nome da peça', 'warning');
      return;
    }

    setIsSubmitting(true);
    const productPayload = {
      name: name.trim(),
      code: code.trim().toUpperCase() || `ETC-${products.length + 101}`,
      category,
      size,
      color: color.trim(),
      costPrice: parseFloat(costPrice) || 0,
      profitMargin: parseFloat(profitMargin) || 100,
      salePrice: parseFloat(salePrice) || 0,
      stockQuantity: Math.max(0, parseInt(stockQuantity) || 0),
      imageUrl,
      description: description.trim(),
    };

    if (editingId) {
      const ok = await updateProduct(editingId, productPayload);
      if (ok) handleCancelEdit();
    } else {
      const created = await addProduct(productPayload);
      if (created) handleCancelEdit();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (window.confirm(`Deseja realmente excluir a peça "${prodName}"?`)) {
      await deleteProduct(id);
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.color && p.color.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['Todos', 'Vestidos', 'Casacos & Blazers', 'Calças', 'Conjuntos', 'Blusas & Camisas', 'Saias', 'Acessórios'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9C5B2] pb-5">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.3em] opacity-60 block mb-1">
            Catálogo & Acervo
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-[#3D2B1F]">
            {editingId ? 'Editar Peça' : 'Cadastro de Nova Peça'}
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Formação de preço inteligente com cálculo automático de margem e vitrine.
          </p>
        </div>

        {editingId && (
          <button
            onClick={handleCancelEdit}
            className="self-start sm:self-auto px-4 py-2 rounded-sm border border-[#D9C5B2] text-[#3D2B1F] hover:bg-[#F0EBE6] text-[10px] uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancelar Edição
          </button>
        )}
      </div>

      {/* REGISTRATION FORM CARD */}
      <div 
        id="product-register-form-card"
        className="bg-white rounded-sm p-6 md:p-8 border border-[#D9C5B2] shadow-xs relative overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PHOTO COLUMN (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]">
                1. Fotografia da Peça *
              </label>

              {/* Image Preview Box */}
              <div className="relative aspect-square rounded-sm bg-[#F9F7F5] border border-dashed border-[#D9C5B2] overflow-hidden group shadow-2xs flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview da peça"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center p-4 text-[#8C7A6B]">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#3D2B1F]" />
                    <span className="text-xs font-serif italic">Nenhuma foto selecionada</span>
                  </div>
                )}

                {/* Overlay with current code */}
                {code && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#3D2B1F]/90 backdrop-blur-xs text-[#F9F7F5] text-[10px] font-mono font-medium rounded-sm">
                    {code}
                  </div>
                )}
              </div>

              {/* Photo Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Tirar foto diretamente pela câmera */}
                <button
                  type="button"
                  id="open-camera-btn"
                  onClick={() => setIsCameraOpen(true)}
                  className="py-2.5 px-3 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium shadow-2xs transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tirar Foto</span>
                </button>

                {/* 2. Selecionar da galeria */}
                <label
                  id="upload-gallery-btn"
                  className="py-2.5 px-3 rounded-sm border border-[#D9C5B2] bg-[#F9F7F5] hover:bg-[#F0EBE6] text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>Galeria</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>

              {/* Quick sample photo selector presets */}
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] block mb-2 font-medium">
                  Ou selecione foto de referência:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sampleFashionPhotos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`w-11 h-11 rounded-sm overflow-hidden shrink-0 border transition-all ${
                        imageUrl === preset.url
                          ? 'border-[#3D2B1F] ring-1 ring-[#3D2B1F]'
                          : 'border-[#D9C5B2] opacity-70 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PRODUCT DETAILS COLUMN (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]">
                2. Informações Principais da Peça
              </label>

              {/* Nome & Código */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                    Nome da Peça *
                  </label>
                  <input
                    id="product-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Vestido Midi Seda Floral Elegance"
                    className="w-full px-3.5 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-medium text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                    Código Único
                  </label>
                  <input
                    id="product-code-input"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ETC-101"
                    className="w-full px-3.5 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-mono font-bold text-[#3D2B1F] uppercase focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              {/* Categoria, Tamanho, Cor, Estoque */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                    Categoria
                  </label>
                  <select
                    id="product-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-medium text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  >
                    {categories.filter(c => c !== 'Todos').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                    Tamanho
                  </label>
                  <select
                    id="product-size-select"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-medium text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  >
                    {['PP', 'P', 'M', 'G', 'GG', '36', '38', '40', '42', '44', 'Único'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                    Cor / Estampa
                  </label>
                  <input
                    id="product-color-input"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ex: Marrom Café"
                    className="w-full px-3 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-medium text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                    Qtd. Estoque *
                  </label>
                  <input
                    id="product-stock-input"
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-bold text-center text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              {/* 3. PRICING & PROFIT CALCULATOR BOX (Section 2 & 5) */}
              <div className="p-5 rounded-sm bg-[#FAF8F5] border border-[#D9C5B2] space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9C5B2]/60 pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#3D2B1F]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]">
                      3. Formação de Preço & Margem de Lucro
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B]">Cálculo instantâneo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Valor que paguei pela peça */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                      Custo Pago (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C7A6B]">
                        R$
                      </span>
                      <input
                        id="product-cost-input"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={costPrice}
                        onChange={(e) => handleCostChange(e.target.value)}
                        placeholder="50.00"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D9C5B2] rounded-sm text-xs font-bold text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                      />
                    </div>
                  </div>

                  {/* Porcentagem de lucro desejada */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                      Lucro Desejado (%) *
                    </label>
                    <div className="relative">
                      <input
                        id="product-margin-input"
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={profitMargin}
                        onChange={(e) => handleMarginChange(e.target.value)}
                        placeholder="100"
                        className="w-full pr-8 pl-3 py-2.5 bg-white border border-[#D9C5B2] rounded-sm text-xs font-bold text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C7A6B]">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Valor final de venda */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                      Preço de Venda (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-800">
                        R$
                      </span>
                      <input
                        id="product-sale-price-input"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={salePrice}
                        onChange={(e) => handleSalePriceChange(e.target.value)}
                        placeholder="100.00"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-700/60 rounded-sm text-xs font-bold text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick % buttons */}
                <div>
                  <span className="text-[9px] font-medium text-[#8C7A6B] uppercase tracking-widest block mb-1.5">
                    Atalhos Rápidos de Margem:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[20, 30, 40, 50, 60, 80, 100, 150, 200].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => applyQuickMargin(pct)}
                        className={`px-2.5 py-1 rounded-sm text-[10px] font-medium tracking-wider transition-all ${
                          parseFloat(profitMargin) === pct
                            ? 'bg-[#3D2B1F] text-white shadow-2xs'
                            : 'bg-white text-[#3D2B1F] border border-[#D9C5B2] hover:bg-[#F0EBE6]'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Result Breakdown */}
                <div className="pt-2 border-t border-[#D9C5B2] flex items-center justify-between text-xs text-[#3D2B1F]">
                  <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B]">
                    Lucro líquido projetado por unidade:
                  </span>
                  <strong className="text-emerald-800 font-serif text-base">
                    + R$ {((parseFloat(salePrice) || 0) - (parseFloat(costPrice) || 0)).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-medium text-[#3D2B1F] mb-1">
                  Descrição e Detalhes da Peça (Para o Catálogo Vitrine)
                </label>
                <textarea
                  id="product-description-input"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Tecido toque de seda suave, forro duplo, decote sofisticado..."
                  className="w-full px-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex gap-3">
                <button
                  id="submit-product-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-xs uppercase tracking-widest font-medium shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? 'Salvando na Nuvem...' 
                      : editingId 
                      ? 'Atualizar Peça' 
                      : 'Salvar e Cadastrar Peça'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* LIST OF REGISTERED PRODUCTS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-normal text-[#3D2B1F]">
              Peças Cadastradas ({filteredProducts.length})
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B] mt-0.5">
              Gerencie e edite os modelos do acervo
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
            <input
              id="product-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, código ou cor..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-[#3D2B1F] text-white shadow-2xs'
                  : 'bg-white text-[#3D2B1F] border border-[#D9C5B2] hover:bg-[#F0EBE6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                id={`product-card-${p.id}`}
                className="bg-white rounded-sm border border-[#D9C5B2] overflow-hidden shadow-2xs hover:border-[#3D2B1F] transition-all flex flex-col group"
              >
                {/* Photo with Code badge */}
                <div className="relative aspect-4/3 bg-[#F9F7F5] overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#3D2B1F]/90 text-white text-[9px] font-mono rounded-sm backdrop-blur-xs">
                    {p.code}
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-semibold ${
                        p.stockQuantity === 0
                          ? 'bg-red-800 text-white'
                          : p.stockQuantity <= 2
                          ? 'bg-amber-800 text-white'
                          : 'bg-[#3D2B1F] text-white'
                      }`}
                    >
                      {p.stockQuantity === 0 ? 'ESGOTADO' : `${p.stockQuantity} un`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest font-medium text-[#8C7A6B]">
                      {p.category} {p.size ? `• Tam: ${p.size}` : ''} {p.color ? `• ${p.color}` : ''}
                    </div>
                    <h3 className="font-serif text-base font-normal text-[#3D2B1F] line-clamp-1 mt-0.5">
                      {p.name}
                    </h3>
                  </div>

                  {/* Financials pill */}
                  <div className="p-2.5 rounded-sm bg-[#FAF8F5] border border-[#D9C5B2] space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B]">Custo:</span>
                      <span className="text-xs font-serif text-[#3D2B1F]">R$ {p.costPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B]">Venda:</span>
                      <span className="text-xs font-serif text-emerald-800 font-bold">R$ {p.salePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#8C7A6B] pt-1 border-t border-[#D9C5B2]">
                      <span className="uppercase tracking-wider">Margem:</span>
                      <span className="font-semibold text-[#3D2B1F]">+{p.profitMargin}% (+ R$ {(p.salePrice - p.costPrice).toFixed(2)})</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      id={`edit-product-${p.id}-btn`}
                      onClick={() => handleStartEdit(p)}
                      className="flex-1 py-1.5 px-3 rounded-sm border border-[#D9C5B2] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                    <button
                      id={`delete-product-${p.id}-btn`}
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 rounded-sm border border-red-200 text-red-700 hover:bg-red-50 text-xs transition-colors"
                      title="Excluir peça"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-sm border border-[#D9C5B2] text-[#8C7A6B] font-serif italic">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#3D2B1F]" />
            <h3 className="text-lg text-[#3D2B1F] mb-1">
              Nenhuma peça encontrada
            </h3>
            <p className="text-xs max-w-sm mx-auto font-sans not-italic">
              Utilize o formulário acima para cadastrar o seu primeiro modelo.
            </p>
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={async (img) => {
          try {
            const optimized = await optimizeImage(img, 800, 800, 0.82);
            setImageUrl(optimized);
          } catch {
            setImageUrl(img);
          }
          showToast('Foto capturada da câmera com sucesso!', 'success');
        }}
      />
    </div>
  );
};
