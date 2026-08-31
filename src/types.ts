export type StockStatus = 'DISPONIVEL' | 'BAIXO_ESTOQUE' | 'ESGOTADO';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'outro';

export type ScheduleCategory = 
  | 'postagem' 
  | 'video' 
  | 'pedidos' 
  | 'live' 
  | 'embalagens' 
  | 'estoque' 
  | 'produtos' 
  | 'entregas' 
  | 'outro';

export interface Product {
  id: string;
  code: string;
  name: string;
  category?: string;
  size?: string;
  color?: string;
  costPrice: number; // Valor que paguei
  profitMargin: number; // Porcentagem de lucro (%)
  salePrice: number; // Valor final de venda
  stockQuantity: number;
  status: StockStatus;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  unitSalePrice?: number;
  profitAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  notes?: string;
  date: string;
  saleDate?: string;
  createdAt?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  type?: 'compras' | 'postagem' | 'entrega' | 'pagamento' | 'lembrete' | string;
  category?: ScheduleCategory | string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description?: string;
  completed: boolean;
  priority?: 'baixa' | 'media' | 'alta';
  createdAt?: string;
}

export interface StoreSettings {
  storeName: string;
  slogan?: string;
  ownerName?: string;
  phone?: string;
  instagram?: string;
  pixKey?: string;
  address?: string;
  currency?: string;
  lowStockThreshold: number;
  enablePublicCatalog?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  storeName: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalRegisteredProducts: number;
  totalInStockUnits: number;
  totalSoldUnits: number;
  totalInvestedStock: number; // Custo do que está parado no estoque
  potentialSaleStock: number; // Valor de venda potencial do estoque
  estimatedProfit: number; // Lucro potencial do estoque atual
  totalRealizedRevenue: number; // Total faturado em vendas já feitas
  totalRealizedProfit: number; // Lucro líquido real já obtido
}

export type ActiveTab = 
  | 'dashboard'
  | 'checkout'
  | 'spreadsheet'
  | 'products'
  | 'stock'
  | 'catalog'
  | 'calculator'
  | 'schedule'
  | 'reports'
  | 'settings';
