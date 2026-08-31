import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  ShoppingBag, 
  Bell, 
  ExternalLink,
  Menu,
  X,
  AlertTriangle,
  Calendar,
  Smartphone,
  Download
} from 'lucide-react';
import { ButterflyLogo } from './ButterflyLogo';
import { useStore } from '../context/StoreContext';
import { ActiveTab } from '../types';

interface NavbarProps {
  onOpenAuth: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onOpenInstall?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onToggleMobileMenu,
  isMobileMenuOpen,
  onOpenInstall,
}) => {
  const { 
    user, 
    logout, 
    isSyncing, 
    syncData, 
    lastSyncTime, 
    settings, 
    activeTab, 
    setActiveTab, 
    products, 
    schedule 
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Compute pending notifications
  const lowStockCount = products.filter((p) => p.stockQuantity <= (settings.lowStockThreshold || 2)).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = schedule.filter((s) => s.date === todayStr && !s.completed);
  const totalAlerts = lowStockCount + todayTasks.length;

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D9C5B2] px-4 md:px-8 py-3.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle-btn"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-sm transition-colors"
            aria-label="Abrir menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="cursor-pointer flex items-center gap-3 group select-none"
          >
            <div className="text-2xl leading-none">🦋</div>
            <div className="flex flex-col">
              <span className="font-serif text-lg md:text-xl font-light tracking-[0.2em] text-[#3D2B1F] leading-tight group-hover:opacity-80 transition-opacity uppercase">
                {settings.storeName || 'Eternal Chic'}
              </span>
              <span className="text-[9px] md:text-[10px] tracking-[0.25em] opacity-50 font-medium uppercase mt-0.5">
                Gestão de Luxo
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Cloud Sync Indicator */}
          <div
            id="cloud-sync-status-badge"
            onClick={() => syncData()}
            title={
              lastSyncTime
                ? `Última sincronização: ${lastSyncTime.toLocaleTimeString()}`
                : 'Sincronizado na Nuvem'
            }
            className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#F9F7F5] hover:bg-[#F0EBE6] text-[#3D2B1F] text-xs font-medium border border-[#D9C5B2] transition-colors shadow-2xs"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSyncing ? 'bg-amber-600 animate-spin' : 'bg-emerald-600'
              }`}
            />
            <span className="hidden md:inline text-[10px] uppercase tracking-widest font-medium opacity-80">
              {isSyncing ? 'Sincronizando...' : 'Cloud Sync Ativo'}
            </span>
            <RefreshCw
              className={`w-3 h-3 opacity-60 ${isSyncing ? 'animate-spin' : ''}`}
            />
          </div>

          {/* Quick Vitrine / Catalog button */}
          <button
            id="header-catalog-view-btn"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
              activeTab === 'catalog'
                ? 'bg-[#3D2B1F] text-white shadow-2xs'
                : 'bg-white text-[#3D2B1F] border border-[#D9C5B2] hover:bg-[#F0EBE6]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 opacity-80" />
            <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-medium">Catálogo Vitrine</span>
            <span className="sm:hidden text-[10px] uppercase tracking-wider">Catálogo</span>
          </button>

          {/* Instalar App (Computador & Celular) */}
          {onOpenInstall && (
            <button
              id="header-install-app-btn"
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium bg-[#FAF8F5] hover:bg-[#F0EBE6] text-[#3D2B1F] border border-[#D9C5B2] transition-colors shadow-2xs cursor-pointer"
              title="Instalar aplicativo no Computador (Windows/Mac) ou Celular (Android/iOS)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-semibold">Instalar App</span>
              <span className="sm:hidden text-[10px] uppercase tracking-wider font-semibold">Instalar</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-sm transition-colors border border-transparent hover:border-[#D9C5B2]"
              title="Notificações e Avisos"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#3D2B1F] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                id="notifications-popover"
                className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-sm shadow-xl border border-[#D9C5B2] p-5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#D9C5B2] mb-3">
                  <h4 className="font-serif text-base font-normal tracking-wide text-[#3D2B1F]">
                    Avisos & Lembretes
                  </h4>
                  <span className="text-[9px] uppercase tracking-widest text-[#3D2B1F] bg-[#F0EBE6] px-2 py-0.5 rounded-sm font-medium">
                    {totalAlerts} pendente(s)
                  </span>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {lowStockCount > 0 && (
                    <div 
                      onClick={() => { setActiveTab('stock'); setShowNotifications(false); }}
                      className="cursor-pointer p-3 rounded-sm bg-[#FAF6F0] border border-[#D9C5B2] hover:bg-[#F0EBE6] transition-colors flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#3D2B1F]">
                          {lowStockCount} produto(s) com baixo estoque
                        </p>
                        <p className="text-[10px] text-[#8C7A6B]">
                          Clique para repor unidades no estoque
                        </p>
                      </div>
                    </div>
                  )}

                  {todayTasks.length > 0 && (
                    <div 
                      onClick={() => { setActiveTab('schedule'); setShowNotifications(false); }}
                      className="cursor-pointer p-3 rounded-sm bg-[#F9F7F5] border border-[#D9C5B2] hover:bg-[#F0EBE6] transition-colors flex items-start gap-2.5"
                    >
                      <Calendar className="w-4 h-4 text-[#3D2B1F] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#3D2B1F]">
                          {todayTasks.length} tarefa(s) para hoje
                        </p>
                        <p className="text-[10px] text-[#8C7A6B]">
                          {todayTasks[0].title}
                        </p>
                      </div>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="text-center py-4 text-xs text-[#8C7A6B] italic font-serif">
                      Tudo em dia! Nenhum alerta pendente.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            {user ? (
              <button
                id="header-user-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white hover:bg-[#F0EBE6] border border-[#D9C5B2] transition-colors shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#D9C5B2] text-white flex items-center justify-center text-[10px] font-serif">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="hidden md:inline text-xs font-medium text-[#3D2B1F] max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3D2B1F] hover:bg-[#2C1F16] text-white rounded-sm text-[10px] uppercase tracking-widest font-medium shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {showUserDropdown && user && (
              <div
                id="user-dropdown-menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-sm shadow-xl border border-[#D9C5B2] p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="p-3 border-b border-[#D9C5B2]">
                  <p className="text-xs font-semibold text-[#3D2B1F] truncate">{user.name}</p>
                  <p className="text-[10px] text-[#8C7A6B] truncate">{user.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#F0EBE6] text-[#3D2B1F] text-[9px] font-medium rounded-sm uppercase tracking-widest">
                    {user.storeName || 'Eternal Chic'}
                  </span>
                </div>
                <button
                  id="dropdown-settings-btn"
                  onClick={() => { setActiveTab('settings'); setShowUserDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-sm transition-colors"
                >
                  Configurações da Loja
                </button>
                <button
                  id="dropdown-logout-btn"
                  onClick={() => { logout(); setShowUserDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 rounded-sm transition-colors flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair da Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
