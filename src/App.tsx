import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { InstallModal } from './components/InstallModal';

import { DashboardView } from './views/DashboardView';
import { CheckoutView } from './views/CheckoutView';
import { ProductRegisterView } from './views/ProductRegisterView';
import { SpreadsheetView } from './views/SpreadsheetView';
import { StockView } from './views/StockView';
import { CatalogView } from './views/CatalogView';
import { CalculatorView } from './views/CalculatorView';
import { ScheduleView } from './views/ScheduleView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'checkout':
        return <CheckoutView />;
      case 'spreadsheet':
        return <SpreadsheetView />;
      case 'products':
        return <ProductRegisterView />;
      case 'stock':
        return <StockView />;
      case 'catalog':
        return <CatalogView />;
      case 'calculator':
        return <CalculatorView />;
      case 'schedule':
        return <ScheduleView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F5] text-[#3D2B1F] font-sans antialiased selection:bg-[#3D2B1F] selection:text-[#F9F7F5]">
      {/* Top Header Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar & Mobile Drawer / Bottom Bar */}
        <Navigation
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto max-w-full">
          {renderCurrentView()}
        </main>
      </div>

      {/* Android / Mobile Install Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Auth & Password Recovery Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
