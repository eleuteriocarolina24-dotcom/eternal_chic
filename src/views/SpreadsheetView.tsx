import React, { useState, useRef } from 'react';
import { 
  Table, 
  Plus, 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Sparkles, 
  Check, 
  TrendingUp, 
  RefreshCw, 
  Copy, 
  FileSpreadsheet, 
  X,
  PlusCircle,
  Eye,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { CameraModal } from '../components/CameraModal';
import { optimizeImage, DEFAULT_PIECE_IMAGE } from '../lib/firebase';

// Sample presets for quick fashion photos
const FASHION_PHOTO_PRESETS = [
  { label: 'Vestido Midi Terracota', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
  { label: 'Blazer Alfaiataria Areia', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' },
  { label: 'Calça Pantalona Linho', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Conjunto Tricot Off-White', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Camisa Seda Romântica', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vestido Noite Cetim', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Saia Plissada Nude', url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bolsa Estruturada Couro', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Acessório Dourado Chic', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cardigan Algodão Pima', url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80' }
];

export const SpreadsheetView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, showToast, triggerConfetti } = useStore();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'code' | 'name' | 'costPrice' | 'salePrice' | 'profit'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Quick Insert Bar State (Nova Peça no Topo)
  const [newCode, setNewCode] = useState(`ETC-${products.length + 101}`);
  const [newName, setNewName] = useState('');
  const [newCostPrice, setNewCostPrice] = useState('50.00');
  const [newSalePrice, setNewSalePrice] = useState('110.00');
  const [newStockQty, setNewStockQty] = useState('1');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80');
  const [isInserting, setIsInserting] = useState(false);

  // Photo modal selector target
  const [photoModalTarget, setPhotoModalTarget] = useState<'new_row' | string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [customPhotoUrlInput, setCustomPhotoUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto update default next code when product count changes
  React.useEffect(() => {
    if (!newCode || newCode.startsWith('ETC-')) {
      setNewCode(`ETC-${products.length + 101}`);
    }
  }, [products.length]);

  // Handle quick insert form submit
  const handleQuickInsert = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim()) {
      showToast('Digite o nome da peça para inserir na planilha.', 'warning');
      return;
    }

    const costNum = parseFloat(newCostPrice) || 0;
    const saleNum = parseFloat(newSalePrice) || 0;
    const qtyNum = parseInt(newStockQty) || 1;
    const profitMargin = costNum > 0 ? ((saleNum - costNum) / costNum) * 100 : 100;

    setIsInserting(true);
    try {
      const added = await addProduct({
        code: newCode.trim() || `ETC-${Date.now().toString().slice(-4)}`,
        name: newName.trim(),
        costPrice: costNum,
        salePrice: saleNum,
        profitMargin: parseFloat(profitMargin.toFixed(1)),
        stockQuantity: qtyNum,
        status: qtyNum > 0 ? 'DISPONIVEL' : 'ESGOTADO',
        imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        category: 'Geral',
      });

      if (added) {
        showToast(`Peça "${newName}" adicionada à planilha!`, 'success');
        triggerConfetti();
        // Reset top inputs for next fast row
        setNewName('');
        setNewCode(`ETC-${products.length + 102}`);
        setNewCostPrice('50.00');
        setNewSalePrice('110.00');
        setNewStockQty('1');
        // Pick next random elegant preset photo for convenience
        const randomPreset = FASHION_PHOTO_PRESETS[Math.floor(Math.random() * FASHION_PHOTO_PRESETS.length)];
        setNewImageUrl(randomPreset.url);
      }
    } catch {
      showToast('Erro ao inserir peça.', 'error');
    } finally {
      setIsInserting(false);
    }
  };

  // Inline cell updates directly to store
  const handleInlineChange = (id: string, field: 'name' | 'code' | 'costPrice' | 'salePrice' | 'stockQuantity' | 'imageUrl', value: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (field === 'name') {
      updateProduct(id, { name: value });
    } else if (field === 'code') {
      updateProduct(id, { code: value });
    } else if (field === 'costPrice') {
      const costNum = parseFloat(value) || 0;
      const profitMargin = costNum > 0 ? ((product.salePrice - costNum) / costNum) * 100 : 100;
      updateProduct(id, { costPrice: costNum, profitMargin: parseFloat(profitMargin.toFixed(1)) });
    } else if (field === 'salePrice') {
      const saleNum = parseFloat(value) || 0;
      const profitMargin = product.costPrice > 0 ? ((saleNum - product.costPrice) / product.costPrice) * 100 : 100;
      updateProduct(id, { salePrice: saleNum, profitMargin: parseFloat(profitMargin.toFixed(1)) });
    } else if (field === 'stockQuantity') {
      const qtyNum = parseInt(value) || 0;
      updateProduct(id, { 
        stockQuantity: qtyNum, 
        status: qtyNum <= 0 ? 'ESGOTADO' : qtyNum <= 2 ? 'BAIXO_ESTOQUE' : 'DISPONIVEL' 
      });
    } else if (field === 'imageUrl') {
      updateProduct(id, { imageUrl: value });
    }
  };

  // Duplicate a row
  const handleDuplicateRow = async (product: Product) => {
    await addProduct({
      code: `${product.code}-CÓPIA`,
      name: `${product.name} (Cópia)`,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      profitMargin: product.profitMargin,
      stockQuantity: product.stockQuantity,
      status: product.status,
      imageUrl: product.imageUrl,
      category: product.category,
      color: product.color,
      size: product.size,
    });
    showToast(`Peça "${product.name}" duplicada na planilha!`, 'success');
  };

  // Photo selection handling
  const handlePhotoSelect = (url: string) => {
    if (photoModalTarget === 'new_row') {
      setNewImageUrl(url);
    } else if (photoModalTarget) {
      handleInlineChange(photoModalTarget, 'imageUrl', url);
    }
    setPhotoModalTarget(null);
    showToast('Foto atualizada na peça!', 'success');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImage(file, 800, 800, 0.82);
        handlePhotoSelect(optimized);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handlePhotoSelect(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCameraCapture = async (photoDataUrl: string) => {
    try {
      const optimized = await optimizeImage(photoDataUrl, 800, 800, 0.82);
      handlePhotoSelect(optimized);
    } catch {
      handlePhotoSelect(photoDataUrl);
    }
    setIsCameraOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (products.length === 0) {
      showToast('Nenhuma peça na planilha para exportar.', 'warning');
      return;
    }

    const headers = ['Código', 'Nome da Peça', 'Valor Pago (Custo)', 'Valor Final (Venda)', 'Lucro Unitário', 'Margem (%)', 'Qtd Estoque', 'Foto URL'];
    const rows = products.map((p) => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      p.costPrice.toFixed(2),
      p.salePrice.toFixed(2),
      (p.salePrice - p.costPrice).toFixed(2),
      `${p.profitMargin.toFixed(1)}%`,
      p.stockQuantity,
      `"${p.imageUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `planilha_pecas_eternal_chic_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilha CSV exportada com sucesso!', 'success');
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length <= 1) {
          showToast('Arquivo CSV vazio ou sem dados.', 'warning');
          return;
        }

        let importedCount = 0;
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const separator = lines[i].includes(';') ? ';' : ',';
          const cols = lines[i].split(separator).map(c => c.replace(/^["']|["']$/g, '').trim());
          if (cols.length >= 2 && cols[1]) {
            const code = cols[0] || `ETC-${Date.now().toString().slice(-4)}`;
            const name = cols[1];
            const costPrice = parseFloat(cols[2]?.replace(',', '.')) || 0;
            const salePrice = parseFloat(cols[3]?.replace(',', '.')) || (costPrice * 2);
            const stockQty = parseInt(cols[6]) || 1;
            const photo = cols[7] || FASHION_PHOTO_PRESETS[i % FASHION_PHOTO_PRESETS.length].url;
            const margin = costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 100;

            await addProduct({
              code,
              name,
              costPrice,
              salePrice,
              profitMargin: parseFloat(margin.toFixed(1)),
              stockQuantity: stockQty,
              status: stockQty > 0 ? 'DISPONIVEL' : 'ESGOTADO',
              imageUrl: photo,
              category: 'Importados',
            });
            importedCount++;
          }
        }
        showToast(`${importedCount} peças importadas com sucesso para a planilha!`, 'success');
        triggerConfetti();
      } catch {
        showToast('Erro ao processar arquivo CSV.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Filter and Sort
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let factor = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'code') return a.code.localeCompare(b.code) * factor;
    if (sortField === 'name') return a.name.localeCompare(b.name) * factor;
    if (sortField === 'costPrice') return (a.costPrice - b.costPrice) * factor;
    if (sortField === 'salePrice') return (a.salePrice - b.salePrice) * factor;
    if (sortField === 'profit') {
      const profitA = a.salePrice - a.costPrice;
      const profitB = b.salePrice - b.costPrice;
      return (profitA - profitB) * factor;
    }
    return 0;
  });

  // Calculate totals
  const totalItemsCount = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalCostInvested = products.reduce((acc, p) => acc + (p.costPrice * (p.stockQuantity || 1)), 0);
  const totalPotentialSale = products.reduce((acc, p) => acc + (p.salePrice * (p.stockQuantity || 1)), 0);
  const totalPotentialProfit = totalPotentialSale - totalCostInvested;

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9C5B2] pb-5">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.3em] opacity-60 block mb-1">
            Controle & Cadastro em Grade
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-[#3D2B1F] flex items-center gap-3">
            Planilha de Peças
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Insira foto, código, nome da peça, valor que pagou e valor final de venda de forma rápida e intuitiva.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleImportCSV}
            accept=".csv,text/csv"
            className="hidden"
          />
          <button
            id="import-spreadsheet-btn"
            onClick={() => importFileInputRef.current?.click()}
            className="px-3.5 py-2 bg-white hover:bg-[#F0EBE6] text-[#3D2B1F] border border-[#D9C5B2] rounded-sm text-[10px] uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Importar dados de arquivo CSV"
          >
            <Upload className="w-3.5 h-3.5 text-[#8C7A6B]" />
            <span>Importar CSV</span>
          </button>

          <button
            id="export-spreadsheet-btn"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-[#F0EBE6] text-[#3D2B1F] border border-[#D9C5B2] rounded-sm text-[10px] uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Baixar planilha compatível com Excel / Google Planilhas"
          >
            <Download className="w-3.5 h-3.5 text-[#8C7A6B]" />
            <span>Exportar Planilha</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A6B] block mb-1">
            Peças Cadastradas
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-[#3D2B1F]">{totalItemsCount}</span>
            <span className="text-xs text-[#8C7A6B]">({totalStockUnits} un em estoque)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A6B] block mb-1">
            Total Valor Pago (Custo)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-xl font-bold text-[#3D2B1F]">
              R$ {totalCostInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A6B] block mb-1">
            Total Valor Final (Venda)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-xl font-bold text-emerald-800">
              R$ {totalPotentialSale.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 block mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Lucro Líquido Projetado
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-xl font-bold text-emerald-800">
              + R$ {totalPotentialProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">
              {totalCostInvested > 0 ? `(${((totalPotentialProfit / totalCostInvested) * 100).toFixed(0)}%)` : '100%'}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK ENTRY ROW (Inserção Rápida no Topo) */}
      <div className="bg-white rounded-sm border border-[#D9C5B2] shadow-xs p-4 md:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9C5B2]">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#3D2B1F]" />
            <h3 className="font-serif text-sm font-normal text-[#3D2B1F] uppercase tracking-wider">
              Inserção Rápida de Peça na Planilha
            </h3>
          </div>
          <span className="text-[10px] text-[#8C7A6B] hidden sm:inline">
            Preencha os campos e pressione <strong>Inserir</strong> ou <kbd className="px-1.5 py-0.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-xs font-mono text-[9px]">Enter</kbd>
          </span>
        </div>

        <form onSubmit={handleQuickInsert} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Foto Preview & Trigger */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold mb-1">
              Foto da Peça *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="quick-entry-photo-btn"
                onClick={() => setPhotoModalTarget('new_row')}
                className="relative w-11 h-11 shrink-0 rounded-sm border border-[#D9C5B2] bg-[#FAF8F5] overflow-hidden group hover:border-[#3D2B1F] transition-colors"
                title="Clique para trocar a foto"
              >
                <img
                  src={newImageUrl}
                  alt="Prévia da peça"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPhotoModalTarget('new_row')}
                className="text-[10px] text-[#3D2B1F] underline font-medium hover:opacity-75"
              >
                Trocar foto
              </button>
            </div>
          </div>

          {/* Código */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold mb-1">
              Código *
            </label>
            <input
              type="text"
              id="quick-entry-code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="ETC-101"
              required
              className="w-full px-2.5 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-mono font-bold text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
            />
          </div>

          {/* Nome da Peça */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold mb-1">
              Nome da Peça *
            </label>
            <input
              type="text"
              id="quick-entry-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Vestido Seda Terracota"
              required
              className="w-full px-2.5 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
            />
          </div>

          {/* Valor que Paguei (Custo) */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold mb-1">
              O Valor que Paguei (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8C7A6B] font-mono">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="quick-entry-cost"
                value={newCostPrice}
                onChange={(e) => setNewCostPrice(e.target.value)}
                placeholder="50.00"
                required
                className="w-full pl-7 pr-2 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-serif font-bold text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
              />
            </div>
          </div>

          {/* Valor Final (Venda) */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold mb-1">
              Valor Final (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8C7A6B] font-mono">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="quick-entry-sale"
                value={newSalePrice}
                onChange={(e) => setNewSalePrice(e.target.value)}
                placeholder="110.00"
                required
                className="w-full pl-7 pr-2 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-serif font-bold text-emerald-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
              />
            </div>
          </div>

          {/* Botão de Inserção */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              id="submit-quick-entry-btn"
              disabled={isInserting}
              className="w-full py-2 px-3 bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium rounded-sm shadow-2xs transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
              title="Inserir linha na planilha"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inserir</span>
            </button>
          </div>
        </form>

        {/* Real-time profit helper in the entry bar */}
        {parseFloat(newCostPrice) > 0 && parseFloat(newSalePrice) > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#D9C5B2]/60 flex items-center gap-4 text-xs text-[#8C7A6B]">
            <span>
              Lucro projetado desta peça:{' '}
              <strong className="text-emerald-800 font-serif">
                + R$ {(parseFloat(newSalePrice) - parseFloat(newCostPrice)).toFixed(2)}
              </strong>
            </span>
            <span>
              Margem:{' '}
              <strong className="text-[#3D2B1F]">
                {(((parseFloat(newSalePrice) - parseFloat(newCostPrice)) / parseFloat(newCostPrice)) * 100).toFixed(0)}%
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* SPREADSHEET TABLE CARD */}
      <div className="bg-white rounded-sm border border-[#D9C5B2] shadow-xs overflow-hidden">
        {/* Table Search & Toolbar */}
        <div className="p-4 border-b border-[#D9C5B2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código ou nome na planilha..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
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

          <div className="flex items-center gap-3 text-xs text-[#8C7A6B]">
            <span>Exibindo <strong>{sortedProducts.length}</strong> de {products.length} linhas</span>
            <span className="hidden md:inline">|</span>
            <span className="text-[10px] hidden md:inline text-emerald-800">
              * Edite qualquer valor diretamente nas células da tabela
            </span>
          </div>
        </div>

        {/* Interactive Spreadsheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0EBE6] text-[#3D2B1F] text-[10px] uppercase tracking-widest font-bold border-b border-[#D9C5B2]">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3 w-20 text-center">Foto da Peça</th>
                <th className="py-3 px-3 cursor-pointer select-none" onClick={() => toggleSort('code')}>
                  <div className="flex items-center gap-1">
                    <span>Código</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[200px] cursor-pointer select-none" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Nome da Peça</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[130px] cursor-pointer select-none" onClick={() => toggleSort('costPrice')}>
                  <div className="flex items-center gap-1">
                    <span>O Valor que Paguei</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[130px] cursor-pointer select-none" onClick={() => toggleSort('salePrice')}>
                  <div className="flex items-center gap-1">
                    <span>Valor Final (Venda)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[130px] cursor-pointer select-none" onClick={() => toggleSort('profit')}>
                  <div className="flex items-center gap-1">
                    <span>Lucro Unitário</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                  </div>
                </th>
                <th className="py-3 px-3 w-24 text-center">Estoque</th>
                <th className="py-3 px-3 w-20 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9C5B2]/60 text-xs">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8C7A6B]">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#3D2B1F]" />
                    <p className="font-serif text-base text-[#3D2B1F] mb-1">Nenhuma peça encontrada na planilha</p>
                    <p className="text-xs font-light">Use o formulário de inserção rápida acima para adicionar suas peças.</p>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product, idx) => {
                  const unitProfit = product.salePrice - product.costPrice;
                  const profitMargin = product.costPrice > 0 ? (unitProfit / product.costPrice) * 100 : 100;

                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-[#FAF8F5] transition-colors group"
                    >
                      {/* # Index */}
                      <td className="py-2.5 px-3 text-center text-[11px] font-mono text-[#8C7A6B]">
                        {idx + 1}
                      </td>

                      {/* Foto da Peça */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setPhotoModalTarget(product.id)}
                          className="relative w-12 h-12 mx-auto rounded-sm border border-[#D9C5B2] bg-[#FAF8F5] overflow-hidden group/btn hover:border-[#3D2B1F] transition-colors inline-block"
                          title="Clique para alterar a foto desta peça"
                        >
                          <img
                            src={product.imageUrl || DEFAULT_PIECE_IMAGE}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_PIECE_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover/btn:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Camera className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      </td>

                      {/* Código */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          defaultValue={product.code}
                          onBlur={(e) => handleInlineChange(product.id, 'code', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#D9C5B2] focus:border-[#3D2B1F] rounded-sm text-xs font-mono font-semibold text-[#3D2B1F] focus:outline-none transition-colors"
                          title="Clique para editar o código"
                        />
                      </td>

                      {/* Nome da Peça */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          defaultValue={product.name}
                          onBlur={(e) => handleInlineChange(product.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#D9C5B2] focus:border-[#3D2B1F] rounded-sm text-xs text-[#3D2B1F] font-medium focus:outline-none transition-colors"
                          title="Clique para editar o nome da peça"
                        />
                      </td>

                      {/* O Valor que Paguei */}
                      <td className="py-2 px-3">
                        <div className="relative flex items-center">
                          <span className="text-[10px] text-[#8C7A6B] mr-1 font-mono">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={product.costPrice.toFixed(2)}
                            onBlur={(e) => handleInlineChange(product.id, 'costPrice', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#D9C5B2] focus:border-[#3D2B1F] rounded-sm text-xs font-serif font-bold text-[#3D2B1F] focus:outline-none transition-colors"
                            title="Clique para editar o valor pago / custo"
                          />
                        </div>
                      </td>

                      {/* Valor Final (Venda) */}
                      <td className="py-2 px-3">
                        <div className="relative flex items-center">
                          <span className="text-[10px] text-[#8C7A6B] mr-1 font-mono">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={product.salePrice.toFixed(2)}
                            onBlur={(e) => handleInlineChange(product.id, 'salePrice', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#D9C5B2] focus:border-[#3D2B1F] rounded-sm text-xs font-serif font-bold text-emerald-800 focus:outline-none transition-colors"
                            title="Clique para editar o valor final de venda"
                          />
                        </div>
                      </td>

                      {/* Lucro Unitário & Margem Calculada */}
                      <td className="py-2 px-3">
                        <div className="font-serif text-xs font-bold text-emerald-800">
                          + R$ {unitProfit.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#8C7A6B]">
                          Margem: {profitMargin.toFixed(0)}%
                        </div>
                      </td>

                      {/* Estoque */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stockQuantity}
                          onBlur={(e) => handleInlineChange(product.id, 'stockQuantity', e.target.value)}
                          className="w-16 mx-auto px-1.5 py-1 text-center bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#D9C5B2] focus:border-[#3D2B1F] rounded-sm text-xs font-bold text-[#3D2B1F] focus:outline-none transition-colors"
                          title="Clique para ajustar o estoque"
                        />
                      </td>

                      {/* Ações */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleDuplicateRow(product)}
                            className="p-1 text-[#8C7A6B] hover:text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-sm transition-colors"
                            title="Duplicar esta linha"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Excluir "${product.name}" da planilha?`)) {
                                await deleteProduct(product.id);
                                showToast('Peça removida da planilha.', 'info');
                              }
                            }}
                            className="p-1 text-[#8C7A6B] hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
                            title="Excluir peça"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Spreadsheet Footer Totalizer Bar */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#D9C5B2] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#8C7A6B]">
            <Check className="w-4 h-4 text-emerald-800" />
            <span>
              Todas as alterações na planilha são sincronizadas automaticamente em nuvem.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#3D2B1F] font-medium">
              Investimento Total: <strong>R$ {totalCostInvested.toFixed(2)}</strong>
            </span>
            <span className="text-emerald-800 font-medium">
              Venda Total: <strong>R$ {totalPotentialSale.toFixed(2)}</strong>
            </span>
            <span className="text-emerald-800 font-bold font-serif">
              Lucro: + R$ {totalPotentialProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* PHOTO SELECTION MODAL */}
      {photoModalTarget && (
        <div
          id="photo-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2B1F]/80 backdrop-blur-xs p-4"
        >
          <div
            id="photo-modal-content"
            className="bg-[#FAF8F5] rounded-sm max-w-xl w-full overflow-hidden shadow-2xl border border-[#D9C5B2] my-8 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#3D2B1F] text-white">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#D9C5B2]" />
                <h3 className="font-serif text-base font-light tracking-wide">
                  Escolher Foto da Peça
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalTarget(null)}
                className="p-1 text-[#D9C5B2] hover:text-white rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Quick Actions (Câmera & Arquivo) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="take-photo-btn"
                  onClick={() => {
                    setIsCameraOpen(true);
                  }}
                  className="p-3.5 bg-white hover:bg-[#F0EBE6] border border-[#D9C5B2] rounded-sm flex flex-col items-center justify-center gap-1.5 transition-colors shadow-2xs text-[#3D2B1F]"
                >
                  <Camera className="w-5 h-5 text-[#3D2B1F]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Tirar Foto Agora</span>
                  <span className="text-[9px] text-[#8C7A6B]">Abrir Câmera</span>
                </button>

                <label
                  className="p-3.5 bg-white hover:bg-[#F0EBE6] border border-[#D9C5B2] rounded-sm flex flex-col items-center justify-center gap-1.5 transition-colors shadow-2xs text-[#3D2B1F] cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-[#3D2B1F]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Enviar da Galeria</span>
                  <span className="text-[9px] text-[#8C7A6B]">Celular ou Computador</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste Image URL */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#3D2B1F] font-bold mb-1">
                  Ou Cole o Link da Foto (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customPhotoUrlInput}
                    onChange={(e) => setCustomPhotoUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/foto-peca.jpg"
                    className="flex-1 px-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customPhotoUrlInput.trim()) {
                        handlePhotoSelect(customPhotoUrlInput.trim());
                        setCustomPhotoUrlInput('');
                      }
                    }}
                    className="px-4 py-2 bg-[#3D2B1F] text-white text-[10px] uppercase tracking-widest font-medium rounded-sm"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Elegant Fashion Photo Presets */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#3D2B1F] font-bold mb-2">
                  Fotos Pré-Configuradas de Moda (Alta Resolução)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {FASHION_PHOTO_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePhotoSelect(preset.url)}
                      className="group relative aspect-square rounded-sm border border-[#D9C5B2] overflow-hidden bg-white hover:border-[#3D2B1F] transition-all shadow-2xs flex flex-col"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center p-1 text-center transition-opacity">
                        <span className="text-[9px] text-white font-medium">{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      )}
    </div>
  );
};
