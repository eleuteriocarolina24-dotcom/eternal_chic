import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Filter, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingBag,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

export const ReportsView: React.FC = () => {
  const { products, sales, metrics, settings, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'DISPONIVEL' | 'ESGOTADO'>('TODOS');
  const [sortField, setSortField] = useState<'name' | 'stock' | 'sold' | 'cost' | 'sale' | 'profit'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Compute sold quantities per product ID from sales history
  const soldMap = sales.reduce((acc, sale) => {
    acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity;
    return acc;
  }, {} as Record<string, number>);

  // Compute total realized revenue & profit per product ID
  const realizedProfitMap = sales.reduce((acc, sale) => {
    acc[sale.productId] = (acc[sale.productId] || 0) + sale.profitAmount;
    return acc;
  }, {} as Record<string, number>);

  // Filtered & Sorted items
  const tableData = products.map((p) => {
    const qtySold = soldMap[p.id] || 0;
    const unitProfit = p.salePrice - p.costPrice;
    const potentialStockProfit = unitProfit * p.stockQuantity;
    const totalRealizedProfit = realizedProfitMap[p.id] || 0;
    const isSoldOut = p.stockQuantity === 0;

    return {
      product: p,
      qtySold,
      unitProfit,
      potentialStockProfit,
      totalRealizedProfit,
      isSoldOut,
    };
  }).filter((item) => {
    const p = item.product;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'Todos' || p.category === categoryFilter;
    const matchesStatus = 
      statusFilter === 'TODOS' ||
      (statusFilter === 'DISPONIVEL' && p.stockQuantity > 0) ||
      (statusFilter === 'ESGOTADO' && p.stockQuantity === 0);

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Export to CSV / Excel
  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Nome da Peça',
      'Categoria',
      'Tamanho',
      'Cor',
      'Estoque Disponível',
      'Quantidade Vendida',
      'Custo Unitário (R$)',
      'Preço Venda (R$)',
      'Lucro Unitário (R$)',
      'Lucro Potencial Estoque (R$)',
      'Lucro Realizado (R$)',
      'Status'
    ];

    const rows = tableData.map((item) => [
      item.product.code,
      `"${item.product.name.replace(/"/g, '""')}"`,
      item.product.category || 'Geral',
      item.product.size || '',
      item.product.color || '',
      item.product.stockQuantity,
      item.qtySold,
      item.product.costPrice.toFixed(2),
      item.product.salePrice.toFixed(2),
      item.unitProfit.toFixed(2),
      item.potentialStockProfit.toFixed(2),
      item.totalRealizedProfit.toFixed(2),
      item.isSoldOut ? 'ESGOTADO' : 'DISPONÍVEL'
    ]);

    // Summary totals row
    rows.push([
      'TOTALIZADORES',
      'Resumo Geral da Loja',
      '',
      '',
      '',
      metrics.totalInStockUnits.toString(),
      metrics.totalSoldUnits.toString(),
      metrics.totalInvestedStock.toFixed(2),
      metrics.potentialSaleStock.toFixed(2),
      '',
      metrics.estimatedProfit.toFixed(2),
      metrics.totalRealizedProfit.toFixed(2),
      ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_eternal_chic_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Planilha CSV gerada e baixada com sucesso!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const categories = ['Todos', 'Vestidos', 'Casacos & Blazers', 'Calças', 'Conjuntos', 'Blusas & Camisas', 'Saias', 'Acessórios'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9C5B2] pb-5 print:hidden">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.3em] opacity-60 block mb-1">
            Inteligência Financeira & Inventário
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-[#3D2B1F]">
            Planilha de Relatórios
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Visão consolidada com custos, preços, estoques, lucros realizados e totais da loja.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-sm bg-white border border-[#D9C5B2] hover:bg-[#F0EBE6] text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#8C7A6B]" />
            <span>Imprimir</span>
          </button>

          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#D9C5B2]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 5 FINANCIAL SUMMARY TILES (Requested in Section 7 Totalizadores) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Total Investido */}
        <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[9px] uppercase tracking-widest font-medium text-[#8C7A6B] block">
            1. Total Investido
          </span>
          <span className="font-serif text-xl font-normal text-[#3D2B1F] block mt-1">
            R$ {metrics.totalInvestedStock.toFixed(2)}
          </span>
          <span className="text-[9px] text-[#8C7A6B]">em estoque atual</span>
        </div>

        {/* 2. Total a Receber */}
        <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[9px] uppercase tracking-widest font-medium text-[#8C7A6B] block">
            2. Total a Receber
          </span>
          <span className="font-serif text-xl font-normal text-[#3D2B1F] block mt-1">
            R$ {metrics.potentialSaleStock.toFixed(2)}
          </span>
          <span className="text-[9px] text-[#8C7A6B]">potencial de venda</span>
        </div>

        {/* 3. Lucro Estimado Total */}
        <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[9px] uppercase tracking-widest font-medium text-emerald-800 block">
            3. Lucro Estimado
          </span>
          <span className="font-serif text-xl font-normal text-emerald-800 block mt-1">
            + R$ {metrics.estimatedProfit.toFixed(2)}
          </span>
          <span className="text-[9px] text-emerald-700">margem projetada</span>
        </div>

        {/* 4. Total Já Faturado com Vendas */}
        <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[9px] uppercase tracking-widest font-medium text-[#8C7A6B] block">
            4. Faturamento Real
          </span>
          <span className="font-serif text-xl font-normal text-[#3D2B1F] block mt-1">
            R$ {metrics.totalRealizedRevenue.toFixed(2)}
          </span>
          <span className="text-[9px] text-[#8C7A6B]">{metrics.totalSoldUnits} peças vendidas</span>
        </div>

        {/* 5. Total de Lucro Real Já Obtido */}
        <div className="bg-[#3D2B1F] text-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs">
          <span className="text-[9px] uppercase tracking-widest font-medium text-[#D9C5B2] block">
            5. Lucro Real Obtido
          </span>
          <span className="font-serif text-xl font-normal text-emerald-300 block mt-1">
            + R$ {metrics.totalRealizedProfit.toFixed(2)}
          </span>
          <span className="text-[9px] text-[#D9C5B2]/80">lucro realizado</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-sm border border-[#D9C5B2] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            id="report-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nome ou código..."
            className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
          />
        </div>

        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          {/* Category Select */}
          <select
            id="report-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-[10px] uppercase tracking-wider font-medium text-[#3D2B1F]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Select */}
          <select
            id="report-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-[10px] uppercase tracking-wider font-medium text-[#3D2B1F]"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="DISPONIVEL">Apenas Disponíveis</option>
            <option value="ESGOTADO">Apenas Esgotados</option>
          </select>
        </div>
      </div>

      {/* SPREADSHEET TABLE */}
      <div className="bg-white rounded-sm border border-[#D9C5B2] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F9F7F5] text-[#8C7A6B] uppercase tracking-widest font-semibold border-b border-[#D9C5B2] text-[9px]">
              <tr>
                <th className="py-3 px-3">Foto</th>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-4">Nome da Peça</th>
                <th className="py-3 px-3 text-center">Qtd Estoque</th>
                <th className="py-3 px-3 text-center">Qtd Vendida</th>
                <th className="py-3 px-3 text-right">Custo (R$)</th>
                <th className="py-3 px-3 text-right">Venda (R$)</th>
                <th className="py-3 px-3 text-right">Lucro Unit.</th>
                <th className="py-3 px-3 text-right">Lucro Potencial</th>
                <th className="py-3 px-3 text-right">Lucro Realizado</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9C5B2]/60">
              {tableData.map((item) => (
                <tr key={item.product.id} className="hover:bg-[#F9F7F5]/80 transition-colors">
                  {/* Foto */}
                  <td className="py-2.5 px-3">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-sm object-cover border border-[#D9C5B2] bg-[#F9F7F5]"
                    />
                  </td>

                  {/* Código */}
                  <td className="py-2.5 px-3 font-mono text-xs text-[#3D2B1F]">
                    {item.product.code}
                  </td>

                  {/* Nome da Peça */}
                  <td className="py-2.5 px-4 font-serif text-sm text-[#3D2B1F]">
                    {item.product.name}
                    <span className="block text-[9px] font-sans uppercase tracking-wider text-[#8C7A6B]">
                      {item.product.category} {item.product.size ? `• Tam: ${item.product.size}` : ''}
                    </span>
                  </td>

                  {/* Quantidade em Estoque */}
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-xs ${
                        item.product.stockQuantity === 0
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : item.product.stockQuantity <= (settings.lowStockThreshold || 2)
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.product.stockQuantity} un
                    </span>
                  </td>

                  {/* Quantidade Vendida */}
                  <td className="py-2.5 px-3 text-center font-mono text-[#3D2B1F]">
                    {item.qtySold} un
                  </td>

                  {/* Valor Pago (Custo) */}
                  <td className="py-2.5 px-3 text-right font-serif text-[#8C7A6B]">
                    R$ {item.product.costPrice.toFixed(2)}
                  </td>

                  {/* Valor de Venda */}
                  <td className="py-2.5 px-3 text-right font-serif font-medium text-[#3D2B1F]">
                    R$ {item.product.salePrice.toFixed(2)}
                  </td>

                  {/* Lucro Unitário */}
                  <td className="py-2.5 px-3 text-right font-serif text-emerald-800 font-medium">
                    +R$ {item.unitProfit.toFixed(2)}
                  </td>

                  {/* Lucro Total no Estoque */}
                  <td className="py-2.5 px-3 text-right font-serif text-[#3D2B1F]">
                    R$ {item.potentialStockProfit.toFixed(2)}
                  </td>

                  {/* Lucro Real Já Obtido */}
                  <td className="py-2.5 px-3 text-right font-serif font-medium text-emerald-800">
                    +R$ {item.totalRealizedProfit.toFixed(2)}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-semibold ${
                        item.isSoldOut
                          ? 'bg-red-800 text-white'
                          : 'bg-emerald-800 text-white'
                      }`}
                    >
                      {item.isSoldOut ? 'ESGOTADO' : 'DISPONÍVEL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Totalizadores Footer Row */}
            <tfoot className="bg-[#3D2B1F] text-white font-medium text-xs border-t border-[#D9C5B2]">
              <tr>
                <td colSpan={3} className="py-3 px-4 uppercase tracking-widest text-[9px] text-[#D9C5B2]">
                  TOTAIS GERAIS ({tableData.length} itens listados)
                </td>
                <td className="py-3 px-3 text-center font-mono text-white">
                  {tableData.reduce((acc, i) => acc + i.product.stockQuantity, 0)} un
                </td>
                <td className="py-3 px-3 text-center font-mono text-white">
                  {tableData.reduce((acc, i) => acc + i.qtySold, 0)} un
                </td>
                <td className="py-3 px-3 text-right font-serif text-[#D9C5B2]">
                  R$ {tableData.reduce((acc, i) => acc + (i.product.costPrice * i.product.stockQuantity), 0).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-serif text-white">
                  R$ {tableData.reduce((acc, i) => acc + (i.product.salePrice * i.product.stockQuantity), 0).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-[#D9C5B2]">
                  —
                </td>
                <td className="py-3 px-3 text-right font-serif text-emerald-300">
                  +R$ {tableData.reduce((acc, i) => acc + i.potentialStockProfit, 0).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-serif text-emerald-300">
                  +R$ {tableData.reduce((acc, i) => acc + i.totalRealizedProfit, 0).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-center text-[#D9C5B2]">
                  ✓
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
