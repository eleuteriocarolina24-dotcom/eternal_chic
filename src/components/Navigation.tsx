import React from 'react';
import { 
  Home, 
  Shirt, 
  Package, 
  ShoppingBag, 
  Grid, 
  Calculator, 
  Calendar, 
  FileSpreadsheet, 
  Table,
  ScanBarcode,
  Settings,
  PlusCircle
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useStore } from '../context/StoreContext';

interface NavigationProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isMobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const { activeTab, setActiveTab, products, schedule } = useStore();

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    emoji: string;
  }> = [
    { id: 'dashboard', label: 'Início', icon: Home, emoji: '🏠' },
    { id: 'checkout', label: 'Dar Baixa', icon: ScanBarcode, emoji: '⚡' },
    { id: 'spreadsheet', label: 'Planilha', icon: Table, emoji: '📋' },
    { id: 'products', label: 'Cadastro', icon: Shirt, badge: products.length, emoji: '👗' },
    { id: 'stock', label: 'Estoque', icon: Package, emoji: '📦' },
    { id: 'catalog', label: 'Catálogo', icon: Grid, emoji: '🛒' },
    { id: 'calculator', label: 'Calculadora', icon: Calculator, emoji: '💰' },
    { id: 'schedule', label: 'Agenda', badge: schedule.filter(s => !s.completed).length || undefined, icon: Calendar, emoji: '📅' },
    { id: 'reports', label: 'Relatórios', icon: FileSpreadsheet, emoji: '📊' },
    { id: 'settings', label: 'Configurações', icon: Settings, emoji: '⚙️' },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        id="desktop-sidebar"
        className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-[#D9C5B2] min-h-[calc(100vh-65px)] p-4 space-y-1"
      >
        <div className="px-3 pt-2 pb-3 flex items-center justify-between border-b border-[#D9C5B2]/60 mb-2">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] opacity-50">
            Navegação
          </span>
          <span className="text-[9px] uppercase tracking-widest opacity-40">
            Menu
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-sm text-xs transition-colors text-left ${
                  isActive
                    ? 'bg-[#3D2B1F] text-white font-medium shadow-xs'
                    : 'text-[#3D2B1F]/80 hover:bg-[#F0EBE6] hover:text-[#3D2B1F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm leading-none">{item.emoji}</span>
                  <span className="text-xs uppercase tracking-widest font-medium">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-sm text-[10px] font-medium tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F0EBE6] text-[#3D2B1F]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Cadastrar Button in Sidebar */}
        <div className="pt-4 mt-auto border-t border-[#D9C5B2]">
          <button
            id="sidebar-quick-add-product-btn"
            onClick={() => handleSelectTab('products')}
            className="w-full py-3 px-4 border border-[#3D2B1F] bg-white hover:bg-[#3D2B1F] text-[#3D2B1F] hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-sm shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Cadastrar Peça</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div
          id="mobile-drawer-backdrop"
          className="fixed inset-0 z-50 bg-[#3D2B1F]/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobileMenu}
        >
          <div
            id="mobile-drawer-content"
            className="absolute left-0 top-0 bottom-0 w-4/5 max-w-xs bg-white p-6 shadow-2xl flex flex-col space-y-2 border-r border-[#D9C5B2] animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-4 border-b border-[#D9C5B2] mb-2 flex items-center justify-between">
              <div>
                <span className="font-serif text-lg tracking-[0.2em] font-light uppercase text-[#3D2B1F]">
                  Eternal Chic
                </span>
                <span className="block text-[9px] uppercase tracking-widest opacity-50">
                  Gestão de Luxo
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#F0EBE6] text-[#3D2B1F] rounded-sm">
                Menu
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-drawer-nav-${item.id}`}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-sm text-xs transition-colors ${
                      isActive
                        ? 'bg-[#3D2B1F] text-white font-medium'
                        : 'text-[#3D2B1F]/80 hover:bg-[#F0EBE6]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm leading-none">{item.emoji}</span>
                      <span className="text-xs uppercase tracking-widest">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-sm text-[10px] ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F0EBE6] text-[#3D2B1F]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb Friendly on Phones) */}
      <nav
        id="mobile-bottom-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D9C5B2] px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {[
          { id: 'dashboard', label: 'Início', icon: Home, emoji: '🏠' },
          { id: 'checkout', label: 'Dar Baixa', icon: ScanBarcode, emoji: '⚡' },
          { id: 'spreadsheet', label: 'Planilha', icon: Table, emoji: '📋' },
          { id: 'stock', label: 'Estoque', icon: Package, emoji: '📦' },
          { id: 'catalog', label: 'Catálogo', icon: Grid, emoji: '🛒' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
                isActive ? 'text-[#3D2B1F] font-bold' : 'text-[#8C7A6B] hover:text-[#3D2B1F]'
              }`}
            >
              <div
                className={`p-1 rounded-sm transition-colors ${
                  isActive ? 'bg-[#3D2B1F] text-white' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] uppercase tracking-wider mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
