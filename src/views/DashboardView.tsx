import React from 'react';
import { 
  Shirt, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  PieChart,
  PlusCircle,
  Grid,
  Calculator,
  Calendar,
  FileSpreadsheet,
  Table,
  ScanBarcode,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ButterflyLogo } from '../components/ButterflyLogo';

export const DashboardView: React.FC = () => {
  const { 
    metrics, 
    products, 
    sales, 
    schedule, 
    setActiveTab, 
    settings, 
    toggleScheduleItem,
    user 
  } = useStore();

  const lowStockItems = products.filter(
    (p) => p.stockQuantity <= (settings.lowStockThreshold || 2)
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = schedule.filter((s) => s.date === todayStr);
  const recentSales = sales.slice(0, 5);

  const todayDate = new Date();
  const dayOfWeek = todayDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dateFormatted = todayDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Editorial Welcome Header */}
      <div 
        id="dashboard-welcome-banner"
        className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D9C5B2] pb-6 gap-4"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60 mb-2">
            Visão Geral da Loja
          </p>
          <h1 className="text-3xl md:text-5xl font-serif font-light text-[#3D2B1F] tracking-tight">
            Bem-vinda, <span className="italic font-normal">{user ? user.name.split(' ')[0] : 'Carolina'}</span>
          </h1>
          <p className="text-xs md:text-sm text-[#8C7A6B] mt-1.5 font-light">
            Sistema de Gestão <strong className="font-medium text-[#3D2B1F]">Eternal Chic</strong> • Dados sincronizados em tempo real.
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-[10px] uppercase tracking-[0.25em] font-medium opacity-50 capitalize">
            {dayOfWeek}
          </p>
          <p className="text-base md:text-lg font-serif italic text-[#3D2B1F]">
            {dateFormatted}
          </p>
        </div>
      </div>

      {/* 6 MAIN METRIC CARDS (Editorial Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Total Peças Cadastradas */}
        <div 
          id="metric-total-registered"
          onClick={() => setActiveTab('products')}
          className="cursor-pointer bg-white p-5 border border-[#D9C5B2] shadow-xs hover:border-[#3D2B1F] hover:bg-[#FAF8F5] transition-all group rounded-sm"
        >
          <p className="text-[10px] uppercase tracking-widest font-medium opacity-50 mb-3">
            Peças Totais
          </p>
          <div className="text-2xl md:text-3xl font-serif font-normal text-[#3D2B1F]">
            {metrics.totalRegisteredProducts} <span className="text-xs italic opacity-50 font-sans">mod.</span>
          </div>
          <div className="h-[1px] w-full bg-[#D9C5B2] opacity-40 my-2.5" />
          <span className="text-[10px] text-[#8C7A6B] uppercase tracking-wider block">modelos cadastrados</span>
        </div>

        {/* 2. Peças Disponíveis em Estoque */}
        <div 
          id="metric-in-stock-units"
          onClick={() => setActiveTab('stock')}
          className="cursor-pointer bg-white p-5 border border-[#D9C5B2] shadow-xs hover:border-[#3D2B1F] hover:bg-[#FAF8F5] transition-all group rounded-sm"
        >
          <p className="text-[10px] uppercase tracking-widest font-medium opacity-50 mb-3">
            Em Estoque
          </p>
          <div className="text-2xl md:text-3xl font-serif font-normal text-[#3D2B1F]">
            {metrics.totalInStockUnits} <span className="text-xs italic opacity-50 font-sans">unid.</span>
          </div>
          <div className="h-[1px] w-full bg-[#D9C5B2] opacity-40 my-2.5" />
          <span className="text-[10px] text-[#8C7A6B] uppercase tracking-wider block">peças prontas</span>
        </div>

        {/* 3. Peças Vendidas */}
        <div 
          id="metric-sold-units"
          onClick={() => setActiveTab('sales')}
          className="cursor-pointer bg-white p-5 border border-[#D9C5B2] shadow-xs hover:border-[#3D2B1F] hover:bg-[#FAF8F5] transition-all group rounded-sm"
        >
          <p className="text-[10px] uppercase tracking-widest font-medium opacity-50 mb-3">
            Vendidas
          </p>
          <div className="text-2xl md:text-3xl font-serif font-normal text-[#3D2B1F]">
            {metrics.totalSoldUnits} <span className="text-xs italic opacity-50 font-sans">unid.</span>
          </div>
          <div className="h-[1px] w-full bg-[#D9C5B2] opacity-40 my-2.5" />
          <span className="text-[10px] text-[#8C7A6B] uppercase tracking-wider block">peças faturadas</span>
        </div>

        {/* 4. Valor Investido no Estoque */}
        <div 
          id="metric-invested-stock"
          onClick={() => setActiveTab('reports')}
          className="cursor-pointer bg-white p-5 border border-[#D9C5B2] shadow-xs hover:border-[#3D2B1F] hover:bg-[#FAF8F5] transition-all group rounded-sm"
        >
          <p className="text-[10px] uppercase tracking-widest font-medium opacity-50 mb-3">
            Investido
          </p>
          <div className="text-lg md:text-xl font-serif font-normal text-[#3D2B1F] truncate">
            R$ {metrics.totalInvestedStock.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="h-[1px] w-full bg-[#D9C5B2] opacity-40 my-2.5" />
          <span className="text-[10px] text-[#8C7A6B] uppercase tracking-wider block">custo de compra</span>
        </div>

        {/* 5. Valor Potencial de Venda */}
        <div 
          id="metric-potential-sale"
          onClick={() => setActiveTab('reports')}
          className="cursor-pointer bg-white p-5 border border-[#D9C5B2] shadow-xs hover:border-[#3D2B1F] hover:bg-[#FAF8F5] transition-all group rounded-sm"
        >
          <p className="text-[10px] uppercase tracking-widest font-medium opacity-50 mb-3">
            Potencial
          </p>
          <div className="text-lg md:text-xl font-serif font-normal text-[#3D2B1F] truncate">
            R$ {metrics.potentialSaleStock.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="h-[1px] w-full bg-[#D9C5B2] opacity-40 my-2.5" />
          <span className="text-[10px] text-[#8C7A6B] uppercase tracking-wider block">valor de vitrine</span>
        </div>

        {/* 6. Lucro Estimado (Editorial Deep Espresso Card) */}
        <div 
          id="metric-estimated-profit"
          onClick={() => setActiveTab('reports')}
          className="cursor-pointer bg-[#3D2B1F] text-white p-5 border border-[#D9C5B2] shadow-xs hover:bg-[#2C1F16] transition-all group rounded-sm"
        >
          <p className="text-[10px] uppercase tracking-widest font-medium opacity-70 mb-3 text-[#D9C5B2]">
            Lucro Estimado
          </p>
          <div className="text-lg md:text-xl font-serif font-normal text-white truncate">
            + R$ {metrics.estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="h-[1px] w-full bg-white/20 my-2.5" />
          <span className="text-[10px] text-[#D9C5B2] uppercase tracking-wider block">margem projetada</span>
        </div>
      </div>

      {/* 7 SHORTCUTS SECTION (Editorial Style) */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-[#3D2B1F]">
            Ações Rápidas & Módulos
          </h2>
          <div className="h-[1px] flex-1 mx-4 bg-[#D9C5B2] opacity-40"></div>
          <span className="text-[10px] text-[#8C7A6B] uppercase tracking-widest">Acesso direto</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { id: 'checkout', label: 'Dar Baixa', desc: 'Leitor / Vender', icon: ScanBarcode, isPrimary: true },
            { id: 'spreadsheet', label: 'Planilha', desc: 'Edição em Grade', icon: Table, isPrimary: false },
            { id: 'products', label: 'Nova Peça', desc: 'Cadastrar', icon: PlusCircle, isPrimary: false },
            { id: 'stock', label: 'Estoque', desc: 'Gerenciar', icon: Package, isPrimary: false },
            { id: 'catalog', label: 'Catálogo', desc: 'Vitrine', icon: Grid, isPrimary: false },
            { id: 'calculator', label: 'Precificar', desc: 'Calculadora', icon: Calculator, isPrimary: false },
            { id: 'schedule', label: 'Agenda', desc: 'Lembretes', icon: Calendar, isPrimary: false },
            { id: 'reports', label: 'Relatórios', desc: 'Exportação', icon: FileSpreadsheet, isPrimary: false },
          ].map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <button
                key={shortcut.id}
                id={`shortcut-${shortcut.id}-btn`}
                onClick={() => setActiveTab(shortcut.id as any)}
                className={`group cursor-pointer p-4 border transition-all text-left flex flex-col justify-between rounded-sm ${
                  shortcut.isPrimary
                    ? 'bg-[#3D2B1F] text-white border-[#3D2B1F] hover:bg-[#2C1F16]'
                    : 'bg-white border-[#D9C5B2] hover:bg-[#3D2B1F] hover:text-white hover:border-[#3D2B1F]'
                }`}
              >
                <div className="flex items-center justify-between mb-3 w-full">
                  <div
                    className={`w-8 h-8 rounded-sm flex items-center justify-center transition-colors ${
                      shortcut.isPrimary
                        ? 'bg-white/10 text-white'
                        : 'bg-[#F9F7F5] text-[#3D2B1F] group-hover:bg-white/10 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold leading-tight">
                    {shortcut.label}
                  </p>
                  <p className="text-[10px] opacity-60 group-hover:opacity-80 uppercase tracking-wider mt-0.5">
                    {shortcut.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LOWER SECTION: Two Columns (Alerts/Tasks + Recent Sales) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agenda Today & Low Stock Warnings (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Low Stock Warning Banner (Editorial) */}
          {lowStockItems.length > 0 && (
            <div
              id="dashboard-low-stock-alert"
              className="p-5 bg-white border border-amber-800/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-sm bg-[#FAF6F0] border border-amber-700/30 flex items-center justify-center text-amber-900 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-amber-950">
                    Atenção de Estoque ({lowStockItems.length} peça{lowStockItems.length > 1 ? 's' : ''})
                  </h4>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">
                    {lowStockItems.map((p) => `${p.name} (${p.stockQuantity} un)`).slice(0, 3).join(', ')}
                    {lowStockItems.length > 3 ? ` e mais ${lowStockItems.length - 3}...` : ''}
                  </p>
                </div>
              </div>

              <button
                id="alert-manage-stock-btn"
                onClick={() => setActiveTab('stock')}
                className="px-4 py-2 border border-[#3D2B1F] bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-semibold rounded-sm transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Conferir Estoque</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Agenda / Compromissos de Hoje */}
          <div className="bg-white p-6 border border-[#D9C5B2] shadow-xs rounded-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9C5B2] mb-4">
              <div>
                <h3 className="font-serif text-xl font-normal text-[#3D2B1F]">
                  Agenda & Tarefas
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B] mt-0.5">
                  Compromissos para hoje
                </p>
              </div>
              <button
                id="view-full-schedule-btn"
                onClick={() => setActiveTab('schedule')}
                className="text-[10px] uppercase tracking-widest text-[#3D2B1F] hover:opacity-70 font-semibold flex items-center gap-1 border-b border-[#3D2B1F] pb-0.5"
              >
                <span>Ver calendário</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 border transition-all rounded-sm ${
                      task.completed
                        ? 'bg-[#F9F7F5] border-[#D9C5B2]/60 opacity-60'
                        : 'bg-white border-[#D9C5B2] hover:border-[#3D2B1F]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => toggleScheduleItem(task.id)}
                        className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-[#3D2B1F] border-[#3D2B1F] text-white'
                            : 'border-[#D9C5B2] hover:border-[#3D2B1F] hover:bg-[#F0EBE6]'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <p
                          className={`text-xs font-semibold text-[#3D2B1F] ${
                            task.completed ? 'line-through opacity-50' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-[#8C7A6B] truncate max-w-sm">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {task.time && (
                      <span className="text-[10px] font-mono text-[#3D2B1F] bg-[#F0EBE6] px-2 py-0.5 rounded-sm">
                        {task.time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#8C7A6B] font-serif italic">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-40 text-[#3D2B1F]" />
                Nenhuma tarefa pendente agendada para hoje.
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="block mx-auto mt-2 text-[#3D2B1F] font-sans font-medium uppercase tracking-widest text-[10px] underline"
                >
                  + Adicionar tarefa na agenda
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Sales Feed (Editorial Layout) */}
        <div className="bg-white p-6 border border-[#D9C5B2] shadow-xs rounded-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#D9C5B2] mb-4">
            <div>
              <h3 className="font-serif text-xl font-normal text-[#3D2B1F]">
                Últimas Vendas
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B] mt-0.5">
                Movimentação recente
              </p>
            </div>
            <button
              id="view-all-sales-btn"
              onClick={() => setActiveTab('reports')}
              className="text-[10px] uppercase tracking-widest text-[#3D2B1F] hover:opacity-70 font-semibold border-b border-[#3D2B1F] pb-0.5"
            >
              Ver relatórios
            </button>
          </div>

          {recentSales.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 bg-[#FAF8F5] border border-[#D9C5B2] flex items-center justify-between gap-3 rounded-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {sale.productImageUrl ? (
                      <img
                        src={sale.productImageUrl}
                        alt={sale.productName}
                        className="w-10 h-10 rounded-sm object-cover border border-[#D9C5B2] shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-sm bg-[#F0EBE6] border border-[#D9C5B2] flex items-center justify-center text-[#3D2B1F] text-[10px] font-bold shrink-0">
                        {sale.productCode}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#3D2B1F] truncate">
                        {sale.productName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B]">
                        <span>{sale.quantity} un</span>
                        <span>•</span>
                        <span className="capitalize">{sale.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#3D2B1F]">
                      R$ {sale.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-medium text-emerald-800">
                      + R$ {sale.profitAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-[#8C7A6B] my-auto font-serif italic">
              <ShoppingBag className="w-7 h-7 mx-auto mb-2 opacity-40 text-[#3D2B1F]" />
              Nenhuma venda registrada ainda.
              <button
                onClick={() => setActiveTab('stock')}
                className="block mx-auto mt-2 text-[#3D2B1F] font-sans font-medium uppercase tracking-widest text-[10px] underline"
              >
                Ir para Estoque para Vender
              </button>
            </div>
          )}

          {/* Realized Sales Summary Box */}
          <div className="mt-5 pt-3.5 border-t border-[#D9C5B2] bg-[#F9F7F5] p-3.5 rounded-sm border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B]">Faturamento:</span>
              <strong className="text-xs font-serif text-[#3D2B1F]">R$ {metrics.totalRealizedRevenue.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between items-center text-xs mt-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B]">Lucro Líquido:</span>
              <strong className="text-xs font-serif text-emerald-800">+ R$ {metrics.totalRealizedProfit.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
