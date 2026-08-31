import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Persistence directory
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial demo data for Eternal Chic
const initialSampleProducts = [
  {
    id: 'prod-1',
    code: 'ETC-101',
    name: 'Vestido Midi Seda Floral Elegance',
    category: 'Vestidos',
    size: 'M',
    color: 'Terracota / Bege',
    costPrice: 65.00,
    profitMargin: 115.38,
    salePrice: 140.00,
    stockQuantity: 6,
    status: 'DISPONIVEL',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    description: 'Vestido midi em toque de seda, decote delicado e caimento fluido com estampa floral exclusiva.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prod-2',
    code: 'ETC-102',
    name: 'Blazer Alfaiataria Chic Crepe',
    category: 'Casacos & Blazers',
    size: 'G',
    color: 'Marrom Café',
    costPrice: 90.00,
    profitMargin: 122.22,
    salePrice: 200.00,
    stockQuantity: 4,
    status: 'DISPONIVEL',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    description: 'Blazer estruturado em alfaiataria premium com forro acetinado e botões delicados forrados.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'prod-3',
    code: 'ETC-103',
    name: 'Calça Wide Leg Linho Natural',
    category: 'Calças',
    size: '38',
    color: 'Off-White',
    costPrice: 55.00,
    profitMargin: 118.18,
    salePrice: 120.00,
    stockQuantity: 2,
    status: 'BAIXO_ESTOQUE',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    description: 'Calça wide leg cintura alta em linho misto, acompanha cinto fino encapado.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    code: 'ETC-104',
    name: 'Conjunto Tricot Modal Soft',
    category: 'Conjuntos',
    size: 'Único',
    color: 'Caramelo',
    costPrice: 70.00,
    profitMargin: 114.28,
    salePrice: 150.00,
    stockQuantity: 5,
    status: 'DISPONIVEL',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    description: 'Conjunto confortável de blusa gola alta e saia midi em tricot modal canelado.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    code: 'ETC-105',
    name: 'Camisa Pura Seda Laço Romântico',
    category: 'Blusas & Camisas',
    size: 'P',
    color: 'Branco Pérola',
    costPrice: 60.00,
    profitMargin: 116.66,
    salePrice: 130.00,
    stockQuantity: 0,
    status: 'ESGOTADO',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Camisa de seda pura com amarração de laço no pescoço e punhos alongados.',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const initialSampleSales = [
  {
    id: 'sale-1',
    productId: 'prod-1',
    productCode: 'ETC-101',
    productName: 'Vestido Midi Seda Floral Elegance',
    productImageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    quantity: 1,
    costPrice: 65.00,
    salePrice: 140.00,
    profitAmount: 75.00,
    totalAmount: 140.00,
    paymentMethod: 'pix',
    customerName: 'Mariana Silva',
    notes: 'Venda via direct Instagram',
    saleDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sale-2',
    productId: 'prod-5',
    productCode: 'ETC-105',
    productName: 'Camisa Pura Seda Laço Romântico',
    productImageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    quantity: 1,
    costPrice: 60.00,
    salePrice: 130.00,
    profitAmount: 70.00,
    totalAmount: 130.00,
    paymentMethod: 'cartao_credito',
    customerName: 'Camila Fernandes',
    notes: 'Retirada na loja',
    saleDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
];

const initialSampleSchedule = [
  {
    id: 'sched-1',
    title: 'Gravar Provador Fashion da Coleção Nova',
    category: 'video',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    description: 'Gravar reels com os looks vestidos e conjuntos para o Instagram.',
    completed: false,
    priority: 'alta',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sched-2',
    title: 'Separar e embalar pedidos do dia',
    category: 'pedidos',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    description: 'Colocar cheirinho personalizado e mimos nas sacolas.',
    completed: false,
    priority: 'alta',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sched-3',
    title: 'Live Shopping Especial Eternal Chic',
    category: 'live',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '19:30',
    description: 'Apresentar lançamentos exclusivos e promoções relâmpago.',
    completed: false,
    priority: 'media',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sched-4',
    title: 'Conferir estoque e repor embalagens',
    category: 'estoque',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    time: '10:00',
    description: 'Checar fitas personalizadas, etiquetas e sacolas kraft.',
    completed: false,
    priority: 'baixa',
    createdAt: new Date().toISOString(),
  }
];

const initialSampleSettings = {
  storeName: 'Eternal Chic',
  slogan: 'Elegância e Sofisticação em Cada Detalhe',
  ownerName: 'Carolina Eleutério',
  phone: '(11) 98765-4321',
  instagram: '@eternalchic.oficial',
  currency: 'R$',
  lowStockThreshold: 2,
  enablePublicCatalog: true,
};

// In-memory state with disk persistence
interface StoreData {
  users: Array<{
    id: string;
    email: string;
    password: string; // In production this would be hashed
    name: string;
    storeName: string;
    recoveryPin?: string;
    createdAt: string;
  }>;
  userStores: {
    [userId: string]: {
      products: any[];
      sales: any[];
      schedule: any[];
      settings: typeof initialSampleSettings;
    };
  };
}

let storeDb: StoreData = {
  users: [
    {
      id: 'user-demo-1',
      email: 'loja@eternalchic.com',
      password: '123',
      name: 'Carolina Eleutério',
      storeName: 'Eternal Chic',
      createdAt: new Date().toISOString(),
    }
  ],
  userStores: {
    'user-demo-1': {
      products: initialSampleProducts,
      sales: initialSampleSales,
      schedule: initialSampleSchedule,
      settings: initialSampleSettings,
    }
  }
};

// Load from file if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.users && parsed.userStores) {
      storeDb = parsed;
    }
  } catch (err) {
    console.error('Error loading data from disk, using fallback defaults:', err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(storeDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data to disk:', err);
  }
}

// Ensure default demo user store exists
if (!storeDb.userStores['user-demo-1']) {
  storeDb.userStores['user-demo-1'] = {
    products: initialSampleProducts,
    sales: initialSampleSales,
    schedule: initialSampleSchedule,
    settings: initialSampleSettings,
  };
  saveDb();
}

function getUserStore(userId: string) {
  if (!storeDb.userStores[userId]) {
    storeDb.userStores[userId] = {
      products: JSON.parse(JSON.stringify(initialSampleProducts)),
      sales: JSON.parse(JSON.stringify(initialSampleSales)),
      schedule: JSON.parse(JSON.stringify(initialSampleSchedule)),
      settings: JSON.parse(JSON.stringify(initialSampleSettings)),
    };
    saveDb();
  }
  return storeDb.userStores[userId];
}

// Authentication helper
function authenticate(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = storeDb.users.find(u => u.id === token || u.email.toLowerCase() === token.toLowerCase());
    if (user) {
      return user.id;
    }
  }
  // Default to demo user if not authenticated
  return 'user-demo-1';
}

function computeProductStatus(qty: number, threshold = 2): 'DISPONIVEL' | 'BAIXO_ESTOQUE' | 'ESGOTADO' {
  if (qty <= 0) return 'ESGOTADO';
  if (qty <= threshold) return 'BAIXO_ESTOQUE';
  return 'DISPONIVEL';
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha' });
  }

  const user = storeDb.users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  res.json({
    token: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      storeName: user.storeName,
      createdAt: user.createdAt,
    }
  });
});

// AUTH: Register
app.post('/api/auth/register', (req, res) => {
  const { name, storeName, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  const existing = storeDb.users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: 'Já existe uma conta cadastrada com este e-mail' });
  }

  const newId = 'user-' + Date.now();
  const newUser = {
    id: newId,
    email: email.trim().toLowerCase(),
    password,
    name: name.trim(),
    storeName: (storeName || 'Eternal Chic').trim(),
    createdAt: new Date().toISOString(),
  };

  storeDb.users.push(newUser);
  getUserStore(newId); // initializes data
  saveDb();

  res.status(201).json({
    token: newUser.id,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      storeName: newUser.storeName,
      createdAt: newUser.createdAt,
    }
  });
});

// AUTH: Forgot Password / Recovery
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Informe o e-mail cadastrado' });
  }

  const user = storeDb.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'E-mail não encontrado no sistema' });
  }

  // Generate 6-digit recovery PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  user.recoveryPin = pin;
  saveDb();

  res.json({
    message: 'Código de recuperação gerado com sucesso!',
    pin, // returned directly for easy in-app recovery
  });
});

// AUTH: Reset Password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, pin, newPassword } = req.body;
  if (!email || !pin || !newPassword) {
    return res.status(400).json({ error: 'Preencha todos os dados necessários' });
  }

  const user = storeDb.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.recoveryPin !== pin) {
    return res.status(400).json({ error: 'Código de recuperação inválido' });
  }

  user.password = newPassword;
  delete user.recoveryPin;
  saveDb();

  res.json({ message: 'Senha redefinida com sucesso! Você já pode entrar.' });
});

// AUTH: Get current user
app.get('/api/auth/me', (req, res) => {
  const userId = authenticate(req);
  const user = storeDb.users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'Sessão inválida' });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    storeName: user.storeName,
    createdAt: user.createdAt,
  });
});

// SYNC / FULL DATA
app.get('/api/data', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  res.json({
    products: userStore.products,
    sales: userStore.sales,
    schedule: userStore.schedule,
    settings: userStore.settings,
    lastSync: new Date().toISOString(),
  });
});

// PUBLIC CATALOG (For customers without auth)
app.get('/api/public-catalog', (req, res) => {
  const storeId = req.query.storeId as string || 'user-demo-1';
  const userStore = getUserStore(storeId);
  const user = storeDb.users.find(u => u.id === storeId);

  // Return only customer-facing safe fields
  const catalogProducts = userStore.products.map(p => ({
    id: p.id,
    code: p.code,
    name: p.name,
    category: p.category,
    size: p.size,
    color: p.color,
    salePrice: p.salePrice,
    stockQuantity: p.stockQuantity,
    status: p.status,
    imageUrl: p.imageUrl,
    description: p.description,
  }));

  res.json({
    storeName: userStore.settings.storeName || (user ? user.storeName : 'Eternal Chic'),
    slogan: userStore.settings.slogan,
    phone: userStore.settings.phone,
    instagram: userStore.settings.instagram,
    products: catalogProducts,
  });
});

// PRODUCTS: Create
app.post('/api/products', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  const body = req.body;

  if (!body.name || body.costPrice === undefined || body.salePrice === undefined) {
    return res.status(400).json({ error: 'Nome, valor pago e valor de venda são obrigatórios' });
  }

  const stockQty = Math.max(0, parseInt(body.stockQuantity) || 0);
  const cost = parseFloat(body.costPrice) || 0;
  const sale = parseFloat(body.salePrice) || 0;
  const profitMargin = cost > 0 ? parseFloat((((sale - cost) / cost) * 100).toFixed(2)) : 100;

  // Auto-generate code if empty
  let code = (body.code || '').trim().toUpperCase();
  if (!code) {
    const nextNum = userStore.products.length + 101;
    code = `ETC-${nextNum}`;
  }

  const newProduct = {
    id: 'prod-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    code,
    name: body.name.trim(),
    category: body.category || 'Geral',
    size: body.size || 'Único',
    color: body.color || '',
    costPrice: cost,
    profitMargin: profitMargin,
    salePrice: sale,
    stockQuantity: stockQty,
    status: computeProductStatus(stockQty, userStore.settings.lowStockThreshold || 2),
    imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    description: body.description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  userStore.products.unshift(newProduct);
  saveDb();

  res.status(201).json(newProduct);
});

// PRODUCTS: Update
app.put('/api/products/:id', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  const { id } = req.params;
  const body = req.body;

  const index = userStore.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const existing = userStore.products[index];
  const stockQty = body.stockQuantity !== undefined ? Math.max(0, parseInt(body.stockQuantity)) : existing.stockQuantity;
  const cost = body.costPrice !== undefined ? parseFloat(body.costPrice) : existing.costPrice;
  const sale = body.salePrice !== undefined ? parseFloat(body.salePrice) : existing.salePrice;
  const margin = cost > 0 ? parseFloat((((sale - cost) / cost) * 100).toFixed(2)) : existing.profitMargin;

  const updated = {
    ...existing,
    ...body,
    code: body.code ? body.code.trim().toUpperCase() : existing.code,
    name: body.name ? body.name.trim() : existing.name,
    costPrice: cost,
    salePrice: sale,
    profitMargin: body.profitMargin !== undefined ? parseFloat(body.profitMargin) : margin,
    stockQuantity: stockQty,
    status: computeProductStatus(stockQty, userStore.settings.lowStockThreshold || 2),
    updatedAt: new Date().toISOString(),
  };

  userStore.products[index] = updated;
  saveDb();

  res.json(updated);
});

// PRODUCTS: Delete
app.delete('/api/products/:id', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  const { id } = req.params;

  const index = userStore.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const removed = userStore.products.splice(index, 1)[0];
  saveDb();

  res.json({ message: 'Produto removido com sucesso', product: removed });
});

// PRODUCTS: Sell ("Vendeu? SIM")
app.post('/api/products/:id/sell', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  const { id } = req.params;
  const qtyToSell = Math.max(1, parseInt(req.body.quantity) || 1);
  const paymentMethod = req.body.paymentMethod || 'pix';
  const customerName = req.body.customerName || '';
  const notes = req.body.notes || '';
  const customSalePrice = req.body.customSalePrice !== undefined ? parseFloat(req.body.customSalePrice) : undefined;

  const product = userStore.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  if (product.stockQuantity < qtyToSell) {
    return res.status(400).json({ 
      error: `Estoque insuficiente! Disponível: ${product.stockQuantity} unidade(s).` 
    });
  }

  // Deduct stock
  product.stockQuantity -= qtyToSell;
  product.status = computeProductStatus(product.stockQuantity, userStore.settings.lowStockThreshold || 2);
  product.updatedAt = new Date().toISOString();

  // Price & profit calculations
  const unitSalePrice = customSalePrice !== undefined ? customSalePrice : product.salePrice;
  const unitCost = product.costPrice;
  const unitProfit = unitSalePrice - unitCost;
  const totalAmount = unitSalePrice * qtyToSell;
  const totalProfit = unitProfit * qtyToSell;

  // Record sale
  const newSale = {
    id: 'sale-' + Date.now(),
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    productImageUrl: product.imageUrl,
    quantity: qtyToSell,
    costPrice: unitCost,
    salePrice: unitSalePrice,
    profitAmount: totalProfit,
    totalAmount: totalAmount,
    paymentMethod,
    customerName,
    notes,
    saleDate: req.body.saleDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  userStore.sales.unshift(newSale);
  saveDb();

  res.json({
    message: 'Venda registrada com sucesso!',
    product,
    sale: newSale,
  });
});

// SALES: Cancel / Delete
app.delete('/api/sales/:id', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  const { id } = req.params;
  const restoreStock = req.query.restoreStock === 'true';

  const saleIndex = userStore.sales.findIndex(s => s.id === id);
  if (saleIndex === -1) {
    return res.status(404).json({ error: 'Venda não encontrada' });
  }

  const sale = userStore.sales[saleIndex];
  
  if (restoreStock && sale.productId) {
    const product = userStore.products.find(p => p.id === sale.productId);
    if (product) {
      product.stockQuantity += sale.quantity;
      product.status = computeProductStatus(product.stockQuantity, userStore.settings.lowStockThreshold || 2);
      product.updatedAt = new Date().toISOString();
    }
  }

  userStore.sales.splice(saleIndex, 1);
  saveDb();

  res.json({ message: 'Venda cancelada e removida do registro' });
});

// SCHEDULE: Create task
app.post('/api/schedule', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  const body = req.body;

  if (!body.title || !body.date) {
    return res.status(400).json({ error: 'Título e data são obrigatórios' });
  }

  const newItem = {
    id: 'sched-' + Date.now(),
    title: body.title.trim(),
    category: body.category || 'outro',
    date: body.date,
    time: body.time || '',
    description: body.description || '',
    completed: false,
    priority: body.priority || 'media',
    createdAt: new Date().toISOString(),
  };

  userStore.schedule.unshift(newItem);
  saveDb();

  res.status(201).json(newItem);
});

// SCHEDULE: Update task
app.put('/api/schedule/:id', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  const { id } = req.params;
  const body = req.body;

  const index = userStore.schedule.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Compromisso não encontrado' });
  }

  userStore.schedule[index] = {
    ...userStore.schedule[index],
    ...body,
  };
  saveDb();

  res.json(userStore.schedule[index]);
});

// SCHEDULE: Delete task
app.delete('/api/schedule/:id', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  const { id } = req.params;

  const index = userStore.schedule.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Compromisso não encontrado' });
  }

  userStore.schedule.splice(index, 1);
  saveDb();

  res.json({ message: 'Compromisso removido com sucesso' });
});

// SETTINGS: Update
app.put('/api/settings', (req, res) => {
  const userId = authenticate(req);
  const userStore = getUserStore(userId);
  userStore.settings = {
    ...userStore.settings,
    ...req.body,
  };
  saveDb();
  res.json(userStore.settings);
});

// RESET: Reset demo data
app.post('/api/reset-data', (req, res) => {
  const userId = authenticate(req);
  storeDb.userStores[userId] = {
    products: JSON.parse(JSON.stringify(initialSampleProducts)),
    sales: JSON.parse(JSON.stringify(initialSampleSales)),
    schedule: JSON.parse(JSON.stringify(initialSampleSchedule)),
    settings: JSON.parse(JSON.stringify(initialSampleSettings)),
  };
  saveDb();
  res.json({ message: 'Dados restaurados com sucesso!' });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / SPA FALLBACK
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eternal Chic backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
