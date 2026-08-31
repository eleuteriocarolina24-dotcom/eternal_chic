import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Product, 
  Sale, 
  ScheduleItem, 
  StoreSettings, 
  User, 
  DashboardMetrics, 
  ActiveTab,
  PaymentMethod 
} from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface StoreContextType {
  user: User | null;
  token: string | null;
  products: Product[];
  sales: Sale[];
  schedule: ScheduleItem[];
  settings: StoreSettings;
  metrics: DashboardMetrics;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  
  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, storeName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ pin?: string; message: string }>;
  resetPassword: (email: string, pin: string, newPass: string) => Promise<boolean>;
  loginDemo: () => Promise<void>;

  // Products
  addProduct: (product: Partial<Product>) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  sellProduct: (
    id: string, 
    qty: number, 
    paymentMethod: PaymentMethod, 
    customerName?: string, 
    notes?: string,
    customSalePrice?: number
  ) => Promise<boolean>;

  // Sales
  cancelSale: (saleId: string, restoreStock?: boolean) => Promise<boolean>;

  // Schedule
  addScheduleItem: (item: Omit<ScheduleItem, 'id' | 'createdAt'>) => Promise<boolean>;
  toggleScheduleItem: (id: string) => Promise<boolean>;
  updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => Promise<boolean>;
  deleteScheduleItem: (id: string) => Promise<boolean>;

  // Settings
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;

  // Sync
  syncData: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  triggerConfetti: () => void;
}

const defaultSettings: StoreSettings = {
  storeName: 'Eternal Chic',
  slogan: 'Elegância e Sofisticação em Cada Detalhe',
  ownerName: 'Carolina Eleutério',
  phone: '(11) 98765-4321',
  instagram: '@eternalchic.oficial',
  currency: 'R$',
  lowStockThreshold: 2,
  enablePublicCatalog: true,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eternal_chic_user');
    return saved ? JSON.parse(saved) : {
      id: 'user-demo-1',
      email: 'loja@eternalchic.com',
      name: 'Carolina Eleutério',
      storeName: 'Eternal Chic',
      createdAt: new Date().toISOString(),
    };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('eternal_chic_token') || 'user-demo-1';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C4A482', '#3D271D', '#D7CCC8', '#BCAAA4', '#E8D8C8'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Fetch all data from server API
  const syncData = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/data', { headers });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setSales(data.sales || []);
        setSchedule(data.schedule || []);
        if (data.settings) {
          setSettings(data.settings);
        }
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Error syncing data with cloud:', err);
    } finally {
      if (!silent) setIsSyncing(false);
      setIsLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    syncData();
  }, [syncData]);

  // Periodic automatic sync every 12 seconds for seamless multi-device real-time consistency
  useEffect(() => {
    const interval = setInterval(() => {
      syncData(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [syncData]);

  // Compute metrics dynamically
  const metrics: DashboardMetrics = useMemo(() => {
    let totalInStockUnits = 0;
    let totalInvestedStock = 0;
    let potentialSaleStock = 0;

    products.forEach((p) => {
      const qty = Math.max(0, p.stockQuantity || 0);
      const cost = Number(p.costPrice) || 0;
      const sale = Number(p.salePrice) || 0;

      totalInStockUnits += qty;
      totalInvestedStock += cost * qty;
      potentialSaleStock += sale * qty;
    });

    const estimatedProfit = potentialSaleStock - totalInvestedStock;

    let totalSoldUnits = 0;
    let totalRealizedRevenue = 0;
    let totalRealizedProfit = 0;

    sales.forEach((s) => {
      const qty = Number(s.quantity) || 1;
      const revenue = Number(s.totalAmount) || 0;
      const profit = Number(s.profitAmount) || 0;

      totalSoldUnits += qty;
      totalRealizedRevenue += revenue;
      totalRealizedProfit += profit;
    });

    return {
      totalRegisteredProducts: products.length,
      totalInStockUnits,
      totalSoldUnits,
      totalInvestedStock,
      potentialSaleStock,
      estimatedProfit,
      totalRealizedRevenue,
      totalRealizedProfit,
    };
  }, [products, sales]);

  // Auth: Login
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Falha ao entrar', 'error');
        return false;
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('eternal_chic_user', JSON.stringify(data.user));
      localStorage.setItem('eternal_chic_token', data.token);
      showToast(`Bem-vinda de volta, ${data.user.name}!`, 'success');
      syncData();
      return true;
    } catch {
      showToast('Erro de conexão ao autenticar', 'error');
      return false;
    }
  };

  // Auth: Register
  const register = async (name: string, storeName: string, email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, storeName, email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao criar conta', 'error');
        return false;
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('eternal_chic_user', JSON.stringify(data.user));
      localStorage.setItem('eternal_chic_token', data.token);
      showToast('Conta criada com sucesso! Bem-vinda à Eternal Chic.', 'success');
      syncData();
      return true;
    } catch {
      showToast('Erro ao cadastrar usuário', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eternal_chic_user');
    localStorage.removeItem('eternal_chic_token');
    showToast('Sessão encerrada com segurança', 'info');
  };

  const loginDemo = async () => {
    const demoUser = {
      id: 'user-demo-1',
      email: 'loja@eternalchic.com',
      name: 'Carolina Eleutério',
      storeName: 'Eternal Chic',
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
    setToken('user-demo-1');
    localStorage.setItem('eternal_chic_user', JSON.stringify(demoUser));
    localStorage.setItem('eternal_chic_token', 'user-demo-1');
    showToast('Conectada na loja Eternal Chic (Demo)', 'success');
    syncData();
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'E-mail não localizado', 'error');
        return { message: data.error };
      }
      showToast('Código gerado! Utilize o PIN exibido na tela.', 'info');
      return { pin: data.pin, message: data.message };
    } catch {
      showToast('Erro ao solicitar recuperação', 'error');
      return { message: 'Erro de conexão' };
    }
  };

  const resetPassword = async (email: string, pin: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Código incorreto', 'error');
        return false;
      }
      showToast('Senha atualizada com sucesso! Faça seu login.', 'success');
      return true;
    } catch {
      showToast('Erro ao redefinir senha', 'error');
      return false;
    }
  };

  // PRODUCTS: Add
  const addProduct = async (productData: Partial<Product>): Promise<Product | null> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
        body: JSON.stringify(productData),
      });
      const created = await res.json();
      if (!res.ok) {
        showToast(created.error || 'Erro ao cadastrar produto', 'error');
        return null;
      }
      setProducts((prev) => [created, ...prev]);
      showToast(`Peça "${created.name}" cadastrada com sucesso!`, 'success');
      return created;
    } catch {
      showToast('Erro de rede ao salvar produto', 'error');
      return null;
    }
  };

  // PRODUCTS: Update
  const updateProduct = async (id: string, productData: Partial<Product>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
        body: JSON.stringify(productData),
      });
      const updated = await res.json();
      if (!res.ok) {
        showToast(updated.error || 'Erro ao atualizar produto', 'error');
        return false;
      }
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast(`Peça "${updated.name}" atualizada!`, 'success');
      return true;
    } catch {
      showToast('Erro ao atualizar produto', 'error');
      return false;
    }
  };

  // PRODUCTS: Delete
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
      });
      if (!res.ok) {
        showToast('Erro ao excluir produto', 'error');
        return false;
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Peça removida com sucesso', 'info');
      return true;
    } catch {
      showToast('Erro ao excluir peça', 'error');
      return false;
    }
  };

  // PRODUCTS: Sell ("Vendeu? SIM")
  const sellProduct = async (
    id: string,
    qty = 1,
    paymentMethod: PaymentMethod = 'pix',
    customerName = '',
    notes = '',
    customSalePrice?: number
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
        body: JSON.stringify({
          quantity: qty,
          paymentMethod,
          customerName,
          notes,
          customSalePrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao registrar venda', 'error');
        return false;
      }

      // Update product in state
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? data.product : p))
      );
      // Append sale to state
      setSales((prev) => [data.sale, ...prev]);

      triggerConfetti();
      showToast(`✨ Venda de "${data.product.name}" registrada com sucesso!`, 'success');
      return true;
    } catch {
      showToast('Erro de comunicação ao registrar venda', 'error');
      return false;
    }
  };

  // SALES: Cancel / Delete
  const cancelSale = async (saleId: string, restoreStock = true): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sales/${saleId}?restoreStock=${restoreStock}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
      });
      if (!res.ok) {
        showToast('Erro ao cancelar venda', 'error');
        return false;
      }
      setSales((prev) => prev.filter((s) => s.id !== saleId));
      if (restoreStock) {
        syncData(true);
      }
      showToast('Venda cancelada e registro atualizado', 'info');
      return true;
    } catch {
      showToast('Erro ao cancelar venda', 'error');
      return false;
    }
  };

  // SCHEDULE: Add
  const addScheduleItem = async (item: Omit<ScheduleItem, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
        body: JSON.stringify(item),
      });
      const created = await res.json();
      if (!res.ok) {
        showToast(created.error || 'Erro ao agendar compromisso', 'error');
        return false;
      }
      setSchedule((prev) => [created, ...prev]);
      showToast(`Compromisso "${created.title}" adicionado à agenda!`, 'success');
      return true;
    } catch {
      showToast('Erro ao adicionar compromisso', 'error');
      return false;
    }
  };

  // SCHEDULE: Toggle completed
  const toggleScheduleItem = async (id: string): Promise<boolean> => {
    const item = schedule.find((s) => s.id === id);
    if (!item) return false;

    const newCompleted = !item.completed;
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
        body: JSON.stringify({ completed: newCompleted }),
      });
      if (!res.ok) return false;
      setSchedule((prev) =>
        prev.map((s) => (s.id === id ? { ...s, completed: newCompleted } : s))
      );
      if (newCompleted) {
        showToast('Tarefa marcada como concluída! 👏', 'success');
      }
      return true;
    } catch {
      return false;
    }
  };

  // SCHEDULE: Update
  const updateScheduleItem = async (id: string, itemData: Partial<ScheduleItem>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
        body: JSON.stringify(itemData),
      });
      const updated = await res.json();
      if (!res.ok) return false;
      setSchedule((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showToast('Compromisso atualizado', 'success');
      return true;
    } catch {
      showToast('Erro ao atualizar compromisso', 'error');
      return false;
    }
  };

  // SCHEDULE: Delete
  const deleteScheduleItem = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
      });
      if (!res.ok) return false;
      setSchedule((prev) => prev.filter((s) => s.id !== id));
      showToast('Lembrete removido', 'info');
      return true;
    } catch {
      return false;
    }
  };

  // SETTINGS: Update
  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
        body: JSON.stringify(newSettings),
      });
      const updated = await res.json();
      if (!res.ok) return false;
      setSettings(updated);
      showToast('Configurações da loja salvas com sucesso!', 'success');
      return true;
    } catch {
      showToast('Erro ao salvar configurações', 'error');
      return false;
    }
  };

  // RESET DEMO DATA
  const resetDemoData = async () => {
    try {
      const res = await fetch('/api/reset-data', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
      });
      if (res.ok) {
        await syncData();
        showToast('Dados de demonstração restaurados!', 'success');
      }
    } catch {
      showToast('Erro ao restaurar dados', 'error');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        token,
        products,
        sales,
        schedule,
        settings,
        metrics,
        isLoading,
        isSyncing,
        lastSyncTime,
        activeTab,
        setActiveTab,
        toasts,
        dismissToast,
        showToast,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        loginDemo,
        addProduct,
        updateProduct,
        deleteProduct,
        sellProduct,
        cancelSale,
        addScheduleItem,
        toggleScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        updateSettings,
        syncData,
        resetDemoData,
        triggerConfetti,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
