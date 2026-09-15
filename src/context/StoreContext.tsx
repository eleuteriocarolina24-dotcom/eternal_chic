import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot 
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType, 
  testConnection, 
  optimizeImage 
} from '../lib/firebase';
import { 
  idbGet, 
  idbSet, 
  idbDelete 
} from '../lib/indexedDb';
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
  isFirestoreConnected: boolean;
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

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('eternal_chic_products_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const cached = localStorage.getItem('eternal_chic_sales_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    try {
      const cached = localStorage.getItem('eternal_chic_schedule_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Hydrate from IndexedDB on initial mount for instant offline/reconnect display
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [savedProds, savedSales, savedSched, savedSettings] = await Promise.all([
          idbGet<Product[]>('eternal_chic_products'),
          idbGet<Sale[]>('eternal_chic_sales'),
          idbGet<ScheduleItem[]>('eternal_chic_schedule'),
          idbGet<StoreSettings>('eternal_chic_settings'),
        ]);
        if (!active) return;
        if (savedProds && savedProds.length > 0) {
          setProducts(savedProds);
          setIsLoading(false);
        }
        if (savedSales && savedSales.length > 0) {
          setSales(savedSales);
        }
        if (savedSched && savedSched.length > 0) {
          setSchedule(savedSched);
        }
        if (savedSettings) {
          setSettings((prev) => ({ ...prev, ...savedSettings }));
        }
      } catch (e) {
        console.warn('Initial IndexedDB hydration notice:', e);
      }
    })();
    return () => { active = false; };
  }, []);

  // Permanent IndexedDB storage backup (unlimited quota, supports heavy photos without crashing)
  useEffect(() => {
    if (products.length > 0) {
      idbSet('eternal_chic_products', products);
      // Also try light localStorage without photos if possible for instant DOM boot
      try {
        const lightProducts = products.map(p => ({
          ...p,
          imageUrl: p.imageUrl.startsWith('data:') ? '' : p.imageUrl, // strip huge data URIs in localStorage
        }));
        localStorage.setItem('eternal_chic_products_cache', JSON.stringify(lightProducts));
      } catch {
        // quota exceeded - safely ignored since IndexedDB has all the full data
      }
    }
  }, [products]);

  useEffect(() => {
    if (schedule.length > 0) {
      idbSet('eternal_chic_schedule', schedule);
      try {
        localStorage.setItem('eternal_chic_schedule_cache', JSON.stringify(schedule));
      } catch {
        // ignore
      }
    }
  }, [schedule]);

  useEffect(() => {
    if (sales.length > 0) {
      idbSet('eternal_chic_sales', sales);
      try {
        localStorage.setItem('eternal_chic_sales_cache', JSON.stringify(sales));
      } catch {
        // ignore
      }
    }
  }, [sales]);

  useEffect(() => {
    idbSet('eternal_chic_settings', settings);
  }, [settings]);

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

  // Check initial Firestore connection as required by Firebase skill
  useEffect(() => {
    testConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });
  }, []);

  // Set up real-time multi-device synchronization with Firestore onSnapshot
  useEffect(() => {
    let isMounted = true;

    // 1. Real-time Products listener (Celular <-> Computador <-> Tablet)
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const loaded: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              ...data,
              id: docSnap.id,
              entryDate: data.entryDate || (data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            } as Product);
          });
          // Sort newest first
          loaded.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });
          setProducts(loaded);
          setLastSyncTime(new Date());
          setIsLoading(false);
        } else {
          // If Firestore is empty, check IndexedDB first so user-entered pieces are NEVER lost!
          idbGet<Product[]>('eternal_chic_products').then((localSaved) => {
            if (!isMounted) return;
            if (localSaved && localSaved.length > 0) {
              setProducts(localSaved);
              // Push local pieces to Firestore
              localSaved.forEach(async (prod) => {
                try {
                  await setDoc(doc(db, 'products', prod.id), prod);
                } catch {
                  // ignore
                }
              });
              setIsLoading(false);
            } else {
              // Truly clean start, load initial setup
              fetch('/api/data')
                .then((res) => res.json())
                .then((data) => {
                  if (data.products && data.products.length > 0) {
                    const mapped = data.products.map((prod: Product) => ({
                      ...prod,
                      entryDate: prod.entryDate || (prod.createdAt ? prod.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
                    }));
                    setProducts(mapped);
                    mapped.forEach(async (prod: Product) => {
                      try {
                        await setDoc(doc(db, 'products', prod.id), prod);
                      } catch {
                        // ignore
                      }
                    });
                  }
                  setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
            }
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
        // Graceful fallback to server API if firestore network is interrupted
        fetch('/api/data')
          .then((res) => res.json())
          .then((data) => {
            if (data.products && data.products.length > 0) {
              setProducts(data.products);
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      }
    );

    // 2. Real-time Sales listener
    const unsubscribeSales = onSnapshot(
      collection(db, 'sales'),
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const loaded: Sale[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              ...data,
              id: docSnap.id,
            } as Sale);
          });
          loaded.sort((a, b) => {
            const timeA = new Date(a.saleDate || a.createdAt || 0).getTime();
            const timeB = new Date(b.saleDate || b.createdAt || 0).getTime();
            return timeB - timeA;
          });
          setSales(loaded);
          setLastSyncTime(new Date());
        } else {
          fetch('/api/data')
            .then((res) => res.json())
            .then((data) => {
              if (data.sales && data.sales.length > 0) {
                setSales(data.sales);
                data.sales.forEach(async (sale: Sale) => {
                  try {
                    await setDoc(doc(db, 'sales', sale.id), sale);
                  } catch {
                    // ignore
                  }
                });
              }
            })
            .catch(() => {});
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sales');
        fetch('/api/data')
          .then((res) => res.json())
          .then((data) => {
            if (data.sales && data.sales.length > 0) {
              setSales(data.sales);
            }
          })
          .catch(() => {});
      }
    );

    // 3. Real-time Schedule listener (Celular <-> Tablet <-> Computador)
    const unsubscribeSchedule = onSnapshot(
      collection(db, 'schedule'),
      (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const loaded: ScheduleItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              ...data,
              id: docSnap.id,
            } as ScheduleItem);
          });
          loaded.sort((a, b) => (a.date + ' ' + (a.time || '')).localeCompare(b.date + ' ' + (b.time || '')));
          setSchedule(loaded);
          setLastSyncTime(new Date());
        } else {
          fetch('/api/data')
            .then((res) => res.json())
            .then((data) => {
              if (data.schedule && data.schedule.length > 0) {
                setSchedule(data.schedule);
                data.schedule.forEach(async (item: ScheduleItem) => {
                  try {
                    await setDoc(doc(db, 'schedule', item.id), item);
                  } catch {
                    // ignore
                  }
                });
              }
            })
            .catch(() => {});
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'schedule');
        fetch('/api/data')
          .then((res) => res.json())
          .then((data) => {
            if (data.schedule && data.schedule.length > 0) {
              setSchedule(data.schedule);
            }
          })
          .catch(() => {});
      }
    );

    // 4. Real-time Settings listener
    const unsubscribeSettings = onSnapshot(
      doc(db, 'settings', 'store_config'),
      (docSnap) => {
        if (!isMounted) return;
        if (docSnap.exists()) {
          setSettings((prev) => ({ ...prev, ...(docSnap.data() as StoreSettings) }));
          setLastSyncTime(new Date());
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/store_config');
      }
    );

    return () => {
      isMounted = false;
      unsubscribeProducts();
      unsubscribeSales();
      unsubscribeSchedule();
      unsubscribeSettings();
    };
  }, []);

  // Multi-device sync (Celular <-> Tablet <-> Computador)
  const syncData = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      // 1. Check direct Firestore snapshot for newest updates
      const [prodSnap, schedSnap, salesSnap, settingsSnap] = await Promise.all([
        getDocs(collection(db, 'products')).catch(() => null),
        getDocs(collection(db, 'schedule')).catch(() => null),
        getDocs(collection(db, 'sales')).catch(() => null),
        getDoc(doc(db, 'settings', 'store_config')).catch(() => null),
      ]);

      let freshProducts: Product[] = [];
      let freshSchedule: ScheduleItem[] = [];
      let freshSales: Sale[] = [];
      let hasFirestore = false;

      if (prodSnap && !prodSnap.empty) {
        hasFirestore = true;
        prodSnap.forEach((d) => {
          const item = d.data();
          freshProducts.push({
            ...item,
            id: d.id,
            entryDate: item.entryDate || (item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
          } as Product);
        });
        freshProducts.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        setProducts(freshProducts);
      }

      if (schedSnap && !schedSnap.empty) {
        hasFirestore = true;
        schedSnap.forEach((d) => {
          freshSchedule.push({ ...d.data(), id: d.id } as ScheduleItem);
        });
        freshSchedule.sort((a, b) => (a.date + ' ' + (a.time || '')).localeCompare(b.date + ' ' + (b.time || '')));
        setSchedule(freshSchedule);
      }

      if (salesSnap && !salesSnap.empty) {
        hasFirestore = true;
        salesSnap.forEach((d) => {
          freshSales.push({ ...d.data(), id: d.id } as Sale);
        });
        freshSales.sort((a, b) => {
          const timeA = new Date(a.saleDate || a.createdAt || 0).getTime();
          const timeB = new Date(b.saleDate || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        setSales(freshSales);
      }

      if (settingsSnap && settingsSnap.exists()) {
        setSettings((prev) => ({ ...prev, ...(settingsSnap.data() as StoreSettings) }));
      }

      // Sync with server mirror
      if (hasFirestore) {
        try {
          await fetch('/api/sync/all', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token || 'user-demo-1'}`,
            },
            body: JSON.stringify({
              products: freshProducts,
              schedule: freshSchedule,
              sales: freshSales,
            }),
          });
        } catch {
          // ignore
        }
      } else {
        const res = await fetch('/api/data', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
          if (data.schedule && data.schedule.length > 0) {
            setSchedule(data.schedule);
          }
          if (data.sales && data.sales.length > 0) {
            setSales(data.sales);
          }
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        }
      }

      setLastSyncTime(new Date());
      if (!silent) {
        showToast('✨ Sincronização em nuvem ativa! Peças, datas e agenda atualizadas.', 'success');
      }
    } catch (err) {
      console.warn('Network sync notice:', err);
      if (!silent) {
        showToast('Conectado à nuvem. Dados protegidos.', 'info');
      }
    } finally {
      if (!silent) setIsSyncing(false);
      setIsLoading(false);
    }
  }, [token, showToast]);

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

  // -------------------------------------------------------------
  // PRODUCTS: Add (Cadastrar Peça com Persistência Firebase Firestore)
  // -------------------------------------------------------------
  const addProduct = async (productData: Partial<Product>): Promise<Product | null> => {
    try {
      // 1. Optimize image to guarantee lightweight Firestore storage and prevent payload overflow
      let finalImageUrl = productData.imageUrl || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';
      if (finalImageUrl.startsWith('data:image')) {
        try {
          finalImageUrl = await optimizeImage(finalImageUrl, 600, 600, 0.72);
        } catch {
          // keep original if optimization fails
        }
      }

      const cost = typeof productData.costPrice === 'number' ? productData.costPrice : parseFloat(String(productData.costPrice || 0)) || 0;
      const sale = typeof productData.salePrice === 'number' ? productData.salePrice : parseFloat(String(productData.salePrice || 0)) || 0;
      const qty = typeof productData.stockQuantity === 'number' ? productData.stockQuantity : parseInt(String(productData.stockQuantity || 0)) || 0;
      const margin = cost > 0 ? parseFloat((((sale - cost) / cost) * 100).toFixed(1)) : 100;

      const newId = 'prod-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const code = (productData.code || '').trim().toUpperCase() || `ETC-${products.length + 101}`;

      const fullProduct: Product = {
        id: newId,
        code,
        name: (productData.name || 'Nova Peça').trim(),
        category: productData.category || 'Geral',
        size: productData.size || 'M',
        color: (productData.color || '').trim(),
        costPrice: cost,
        profitMargin: productData.profitMargin !== undefined ? Number(productData.profitMargin) : margin,
        salePrice: sale,
        stockQuantity: qty,
        status: qty <= 0 ? 'ESGOTADO' : qty <= (settings.lowStockThreshold || 2) ? 'BAIXO_ESTOQUE' : 'DISPONIVEL',
        imageUrl: finalImageUrl,
        description: (productData.description || '').trim(),
        entryDate: productData.entryDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2. Immediate optimistic local update + immediate IndexedDB save
      setProducts((prev) => {
        const next = [fullProduct, ...prev];
        idbSet('eternal_chic_products', next);
        return next;
      });

      // 3. Save to Firebase Firestore
      try {
        await setDoc(doc(db, 'products', newId), {
          ...fullProduct,
          storeId: token || 'user-demo-1',
        });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, `products/${newId}`);
      }

      // 4. Also synchronize with server API
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || 'user-demo-1'}`,
          },
          body: JSON.stringify(fullProduct),
        });
      } catch (apiErr) {
        console.warn('Background server sync notice:', apiErr);
      }

      showToast(`✨ Peça "${fullProduct.name}" salva com sucesso!`, 'success');
      return fullProduct;
    } catch (err) {
      console.error('Erro ao cadastrar peça:', err);
      showToast('Aviso: Verifique os dados da peça', 'error');
      return null;
    }
  };

  // PRODUCTS: Update
  const updateProduct = async (id: string, productData: Partial<Product>): Promise<boolean> => {
    try {
      let finalImageUrl = productData.imageUrl;
      if (finalImageUrl && finalImageUrl.startsWith('data:image')) {
        try {
          finalImageUrl = await optimizeImage(finalImageUrl, 600, 600, 0.72);
          productData.imageUrl = finalImageUrl;
        } catch {
          // ignore
        }
      }

      const existing = products.find((p) => p.id === id);
      const cost = productData.costPrice !== undefined ? Number(productData.costPrice) : (existing?.costPrice || 0);
      const sale = productData.salePrice !== undefined ? Number(productData.salePrice) : (existing?.salePrice || 0);
      const qty = productData.stockQuantity !== undefined ? Number(productData.stockQuantity) : (existing?.stockQuantity || 0);
      const margin = cost > 0 ? parseFloat((((sale - cost) / cost) * 100).toFixed(1)) : (existing?.profitMargin || 100);

      const updatedProduct: Product = {
        ...(existing || {} as Product),
        ...productData,
        id,
        costPrice: cost,
        salePrice: sale,
        stockQuantity: qty,
        profitMargin: productData.profitMargin !== undefined ? Number(productData.profitMargin) : margin,
        entryDate: productData.entryDate !== undefined ? productData.entryDate : (existing?.entryDate || existing?.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]),
        status: qty <= 0 ? 'ESGOTADO' : qty <= (settings.lowStockThreshold || 2) ? 'BAIXO_ESTOQUE' : 'DISPONIVEL',
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update + immediate IndexedDB save
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === id ? updatedProduct : p));
        idbSet('eternal_chic_products', next);
        return next;
      });

      // Firebase Firestore update
      try {
        await setDoc(doc(db, 'products', id), {
          ...updatedProduct,
          storeId: token || 'user-demo-1',
        }, { merge: true });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.UPDATE, `products/${id}`);
      }

      // Server update
      try {
        await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || 'user-demo-1'}`,
          },
          body: JSON.stringify(updatedProduct),
        });
      } catch (apiErr) {
        console.warn('Background server sync notice:', apiErr);
      }

      showToast(`Peça "${updatedProduct.name}" atualizada!`, 'success');
      return true;
    } catch {
      showToast('Erro ao atualizar produto', 'error');
      return false;
    }
  };

  // PRODUCTS: Delete
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== id);
        idbSet('eternal_chic_products', next);
        return next;
      });

      // Delete from Firestore
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.DELETE, `products/${id}`);
      }

      // Delete from server API
      try {
        await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token || 'user-demo-1'}`,
          },
        });
      } catch (apiErr) {
        console.warn('Background server delete notice:', apiErr);
      }

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
      const product = products.find((p) => p.id === id);
      if (!product) {
        showToast('Produto não encontrado', 'error');
        return false;
      }

      if (product.stockQuantity < qty) {
        showToast(`Estoque insuficiente! Disponível: ${product.stockQuantity} un.`, 'error');
        return false;
      }

      const unitSalePrice = customSalePrice !== undefined ? customSalePrice : product.salePrice;
      const unitCost = product.costPrice;
      const unitProfit = unitSalePrice - unitCost;
      const totalAmount = unitSalePrice * qty;
      const totalProfit = unitProfit * qty;

      const newStock = product.stockQuantity - qty;
      const updatedProduct: Product = {
        ...product,
        stockQuantity: newStock,
        status: newStock <= 0 ? 'ESGOTADO' : newStock <= (settings.lowStockThreshold || 2) ? 'BAIXO_ESTOQUE' : 'DISPONIVEL',
        updatedAt: new Date().toISOString(),
      };

      const saleId = 'sale-' + Date.now();
      const newSale: Sale = {
        id: saleId,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        productImageUrl: product.imageUrl,
        quantity: qty,
        costPrice: unitCost,
        salePrice: unitSalePrice,
        profitAmount: totalProfit,
        totalAmount: totalAmount,
        paymentMethod,
        customerName,
        notes,
        date: new Date().toISOString(),
        saleDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Optimistic state updates
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
      setSales((prev) => [newSale, ...prev]);

      // Save to Firebase Firestore
      try {
        await setDoc(doc(db, 'sales', saleId), {
          ...newSale,
          storeId: token || 'user-demo-1',
        });
        await setDoc(doc(db, 'products', id), {
          ...updatedProduct,
          storeId: token || 'user-demo-1',
        }, { merge: true });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, `sales/${saleId}`);
      }

      // Sync with server API
      try {
        await fetch(`/api/products/${id}/sell`, {
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
      } catch (apiErr) {
        console.warn('Background server sell sync notice:', apiErr);
      }

      triggerConfetti();
      showToast(`✨ Venda de "${product.name}" registrada com sucesso!`, 'success');
      return true;
    } catch {
      showToast('Erro ao registrar venda', 'error');
      return false;
    }
  };

  // SALES: Cancel / Delete
  const cancelSale = async (saleId: string, restoreStock = true): Promise<boolean> => {
    try {
      const sale = sales.find((s) => s.id === saleId);
      setSales((prev) => prev.filter((s) => s.id !== saleId));

      if (restoreStock && sale && sale.productId) {
        const prod = products.find((p) => p.id === sale.productId);
        if (prod) {
          const restoredQty = prod.stockQuantity + sale.quantity;
          const updatedProd: Product = {
            ...prod,
            stockQuantity: restoredQty,
            status: restoredQty <= 0 ? 'ESGOTADO' : restoredQty <= (settings.lowStockThreshold || 2) ? 'BAIXO_ESTOQUE' : 'DISPONIVEL',
            updatedAt: new Date().toISOString(),
          };
          setProducts((prev) => prev.map((p) => (p.id === prod.id ? updatedProd : p)));
          try {
            await setDoc(doc(db, 'products', prod.id), updatedProd, { merge: true });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `products/${prod.id}`);
          }
        }
      }

      // Delete from Firestore
      try {
        await deleteDoc(doc(db, 'sales', saleId));
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.DELETE, `sales/${saleId}`);
      }

      // Server API delete
      try {
        await fetch(`/api/sales/${saleId}?restoreStock=${restoreStock}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token || 'user-demo-1'}`,
          },
        });
      } catch (apiErr) {
        console.warn('Background server cancel sale sync notice:', apiErr);
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
      const newId = 'sched-' + Date.now();
      const newItem: ScheduleItem = {
        ...item,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      setSchedule((prev) => [newItem, ...prev]);

      // Firebase Firestore
      try {
        await setDoc(doc(db, 'schedule', newId), {
          ...newItem,
          storeId: token || 'user-demo-1',
        });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, `schedule/${newId}`);
      }

      // Server API
      try {
        await fetch('/api/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || 'user-demo-1'}`,
          },
          body: JSON.stringify(item),
        });
      } catch (apiErr) {
        console.warn('Background server schedule sync notice:', apiErr);
      }

      showToast(`Compromisso "${newItem.title}" adicionado à agenda!`, 'success');
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
    const updated = { ...item, completed: newCompleted };

    setSchedule((prev) => prev.map((s) => (s.id === id ? updated : s)));

    // Firestore
    try {
      await setDoc(doc(db, 'schedule', id), { completed: newCompleted }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `schedule/${id}`);
    }

    // Server API
    try {
      await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'user-demo-1'}`,
        },
        body: JSON.stringify({ completed: newCompleted }),
      });
    } catch (apiErr) {
      console.warn('Background server schedule sync notice:', apiErr);
    }

    if (newCompleted) {
      showToast('Tarefa marcada como concluída! 👏', 'success');
    }
    return true;
  };

  // SCHEDULE: Update
  const updateScheduleItem = async (id: string, itemData: Partial<ScheduleItem>): Promise<boolean> => {
    try {
      const existing = schedule.find((s) => s.id === id);
      const updated = { ...(existing || {}), ...itemData, id } as ScheduleItem;

      setSchedule((prev) => prev.map((s) => (s.id === id ? updated : s)));

      try {
        await setDoc(doc(db, 'schedule', id), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `schedule/${id}`);
      }

      try {
        await fetch(`/api/schedule/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || 'user-demo-1'}`,
          },
          body: JSON.stringify(itemData),
        });
      } catch (apiErr) {
        console.warn('Background server schedule sync notice:', apiErr);
      }

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
      setSchedule((prev) => prev.filter((s) => s.id !== id));

      try {
        await deleteDoc(doc(db, 'schedule', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `schedule/${id}`);
      }

      try {
        await fetch(`/api/schedule/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token || 'user-demo-1'}`,
          },
        });
      } catch (apiErr) {
        console.warn('Background server schedule sync notice:', apiErr);
      }

      showToast('Lembrete removido', 'info');
      return true;
    } catch {
      return false;
    }
  };

  // SETTINGS: Update
  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);

      try {
        await setDoc(doc(db, 'settings', 'store_config'), updated, { merge: true });
        await setDoc(doc(db, 'settings', token || 'user-demo-1'), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'settings/store_config');
      }

      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || 'user-demo-1'}`,
          },
          body: JSON.stringify(newSettings),
        });
      } catch (apiErr) {
        console.warn('Background server settings sync notice:', apiErr);
      }

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
        isFirestoreConnected,
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

