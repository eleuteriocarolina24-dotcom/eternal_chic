import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanBarcode, 
  QrCode, 
  CheckCircle2, 
  PackageMinus, 
  Search, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  CreditCard, 
  Banknote, 
  Zap, 
  Camera, 
  X, 
  ArrowRight,
  TrendingUp,
  Clock,
  History,
  ShoppingBag,
  Volume2,
  VolumeX,
  Plus,
  Minus
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, PaymentMethod } from '../types';

// Web Audio API beep generator for barcode scanner sound
const playBeepSound = (type: 'success' | 'error' = 'success') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'success') {
      // Crisp high-pitch double beep like boutique barcode reader
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6
      osc.frequency.setValueAtTime(2637, ctx.currentTime + 0.08); // E7
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else {
      // Low double error buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // AudioContext blocked or not supported - silently ignore
  }
};

interface RecentCheckout {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  salePrice: number;
  paymentMethod: PaymentMethod;
  timestamp: Date;
  previousStock: number;
  newStock: number;
}

export const CheckoutView: React.FC = () => {
  const { products, sellProduct, updateProduct, showToast, triggerConfetti } = useStore();

  // Inputs
  const [codeInput, setCodeInput] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoDeductOnMatch, setAutoDeductOnMatch] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Camera Live Scanner
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Last successful checkout feedback card
  const [lastCheckout, setLastCheckout] = useState<RecentCheckout | null>(null);
  const [sessionHistory, setSessionHistory] = useState<RecentCheckout[]>([]);

  // Search filter for manual piece selection
  const [searchCatalogQuery, setSearchCatalogQuery] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus barcode input on mount and keep focused
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Process checkout for a found product
  const executeCheckout = async (product: Product, qtyToDeduct = quantity) => {
    if (product.stockQuantity < qtyToDeduct) {
      if (soundEnabled) playBeepSound('error');
      showToast(`Estoque esgotado para "${product.name}"! Disponível: ${product.stockQuantity} un.`, 'error');
      return false;
    }

    setIsProcessing(true);
    const prevStock = product.stockQuantity;

    try {
      const success = await sellProduct(
        product.id,
        qtyToDeduct,
        paymentMethod,
        customerName.trim() || undefined
      );

      if (success) {
        if (soundEnabled) playBeepSound('success');
        triggerConfetti();

        const record: RecentCheckout = {
          id: 'chk-' + Date.now(),
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          productImageUrl: product.imageUrl,
          quantity: qtyToDeduct,
          salePrice: product.salePrice,
          paymentMethod,
          timestamp: new Date(),
          previousStock: prevStock,
          newStock: prevStock - qtyToDeduct,
        };

        setLastCheckout(record);
        setSessionHistory((prev) => [record, ...prev]);
        showToast(`Baixa de ${qtyToDeduct}x "${product.name}" concluída!`, 'success');

        // Reset input for next scan
        setCodeInput('');
        setQuantity(1);
        setCustomerName('');
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        return true;
      }
    } catch {
      if (soundEnabled) playBeepSound('error');
      showToast('Erro ao realizar baixa.', 'error');
    } finally {
      setIsProcessing(false);
    }
    return false;
  };

  // Form submit by manual input / USB barcode gun (Enter key)
  const handleSubmitCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = codeInput.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Digite ou escaneie o código da peça.', 'warning');
      return;
    }

    // Look for exact code or partial match
    const matchedProduct = products.find(
      (p) => p.code.trim().toUpperCase() === cleanCode
    ) || products.find(
      (p) => p.code.toLowerCase().includes(cleanCode.toLowerCase()) || p.name.toLowerCase().includes(cleanCode.toLowerCase())
    );

    if (!matchedProduct) {
      if (soundEnabled) playBeepSound('error');
      showToast(`Código "${cleanCode}" não encontrado no cadastro de peças.`, 'error');
      return;
    }

    executeCheckout(matchedProduct, quantity);
  };

  // Auto-deduct on typing if exact code matches
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCodeInput(val);

    if (autoDeductOnMatch && val.trim().length >= 3) {
      const clean = val.trim().toUpperCase();
      const exactMatch = products.find((p) => p.code.trim().toUpperCase() === clean);
      if (exactMatch && !isProcessing) {
        executeCheckout(exactMatch, quantity);
      }
    }
  };

  // Undo a checkout (Estornar / Devolver ao Estoque)
  const handleUndoCheckout = async (checkout: RecentCheckout) => {
    const product = products.find((p) => p.id === checkout.productId);
    if (!product) {
      showToast('Produto original não encontrado.', 'error');
      return;
    }

    const restoredStock = product.stockQuantity + checkout.quantity;
    const ok = await updateProduct(product.id, {
      stockQuantity: restoredStock,
      status: restoredStock > 0 ? 'DISPONIVEL' : 'ESGOTADO',
    });

    if (ok) {
      setSessionHistory((prev) => prev.filter((item) => item.id !== checkout.id));
      if (lastCheckout?.id === checkout.id) {
        setLastCheckout(null);
      }
      showToast(`Baixa estornada! +${checkout.quantity} un devolvida ao estoque de "${product.name}".`, 'info');
    }
  };

  // Start Camera Barcode Scanner
  const startCameraScanner = async () => {
    setIsCameraScannerOpen(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check if BarcodeDetector API is supported natively
      if ('BarcodeDetector' in window) {
        const BarcodeDetectorAny = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
        const detector = new BarcodeDetectorAny({
          formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'],
        });

        const scanInterval = setInterval(async () => {
          if (!videoRef.current || !isCameraScannerOpen) {
            clearInterval(scanInterval);
            return;
          }
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const detectedValue = barcodes[0].rawValue.trim();
              if (detectedValue) {
                clearInterval(scanInterval);
                stopCameraScanner();
                setCodeInput(detectedValue);
                // Try to find and checkout
                const found = products.find(
                  (p) => p.code.trim().toUpperCase() === detectedValue.toUpperCase()
                );
                if (found) {
                  executeCheckout(found, quantity);
                } else {
                  showToast(`Código lido: "${detectedValue}"`, 'info');
                }
              }
            }
          } catch {
            // ignore frame read error
          }
        }, 400);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Permissão da câmera negada ou câmera não disponível.');
    }
  };

  const stopCameraScanner = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraScannerOpen(false);
  };

  // Filter products for the quick click list
  const filteredProducts = products.filter((p) => {
    const q = searchCatalogQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
  });

  // Calculate session summary
  const totalSessionItems = sessionHistory.reduce((acc, c) => acc + c.quantity, 0);
  const totalSessionAmount = sessionHistory.reduce((acc, c) => acc + (c.salePrice * c.quantity), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9C5B2] pb-5">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.3em] opacity-60 block mb-1">
            Frente de Caixa & Controle Instantâneo
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-[#3D2B1F] flex items-center gap-3">
            Dar Baixa na Peça Vendida
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Leia ou digite o código da peça para dar baixa no estoque em tempo real.
          </p>
        </div>

        {/* Top Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 border rounded-sm text-[10px] uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-white border-[#D9C5B2] text-[#3D2B1F]'
                : 'bg-[#F0EBE6] border-[#D9C5B2] text-[#8C7A6B]'
            }`}
            title="Ativar/Desativar som de bipe da baixa"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-800" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Som Beep: {soundEnabled ? 'Ligado' : 'Mudo'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoDeductOnMatch(!autoDeductOnMatch)}
            className={`px-3 py-1.5 border rounded-sm text-[10px] uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors ${
              autoDeductOnMatch
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                : 'bg-white border-[#D9C5B2] text-[#3D2B1F]'
            }`}
            title="Dá baixa imediata ao reconhecer o código sem precisar apertar Enter"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Baixa Automática: {autoDeductOnMatch ? 'Ativa' : 'Manual'}</span>
          </button>
        </div>
      </div>

      {/* MAIN SCANNER / INPUT CONTROL HERO CARD */}
      <div className="bg-white rounded-sm border-2 border-[#3D2B1F] shadow-md p-6 relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute right-4 -bottom-6 opacity-5 pointer-events-none select-none text-9xl font-mono text-[#3D2B1F]">
          ||| | ||
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ScanBarcode className="w-5 h-5 text-[#3D2B1F]" />
              <h2 className="font-serif text-lg font-normal text-[#3D2B1F] uppercase tracking-wider">
                Leitor de Código & Digitação Rápida
              </h2>
            </div>
            <span className="text-[10px] text-[#8C7A6B] uppercase tracking-widest">
              Compatível com leitor USB/Bluetooth e Câmera
            </span>
          </div>

          {/* Main Input Form */}
          <form onSubmit={handleSubmitCode} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              {/* Giant Code Input Field */}
              <div className="md:col-span-8 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#8C7A6B]">
                  <ScanBarcode className="w-6 h-6 text-[#3D2B1F]" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  id="barcode-input-field"
                  value={codeInput}
                  onChange={handleInputChange}
                  placeholder="DIGITE OU ESCANEIE O CÓDIGO (Ex: ETC-101)..."
                  autoFocus
                  className="w-full pl-14 pr-12 py-4 bg-[#FAF8F5] border-2 border-[#D9C5B2] focus:border-[#3D2B1F] rounded-sm text-base md:text-xl font-mono font-bold tracking-wider text-[#3D2B1F] placeholder:text-[#8C7A6B]/60 focus:bg-white focus:outline-none transition-all shadow-inner uppercase"
                />
                {codeInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setCodeInput('');
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8C7A6B] hover:text-[#3D2B1F]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="md:col-span-2 flex items-center border-2 border-[#D9C5B2] rounded-sm bg-[#FAF8F5] px-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-xs"
                  title="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center font-mono font-bold text-sm text-[#3D2B1F]">
                  {quantity} un
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-[#3D2B1F] hover:bg-[#F0EBE6] rounded-xs"
                  title="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Action Button: DAR BAIXA */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  id="execute-checkout-btn"
                  disabled={isProcessing || !codeInput.trim()}
                  className="w-full h-full py-4 px-4 bg-[#3D2B1F] hover:bg-[#2C1F16] disabled:opacity-40 text-white font-sans text-xs uppercase tracking-widest font-bold rounded-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <PackageMinus className="w-4 h-4 text-[#D9C5B2]" />
                  <span>Dar Baixa</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Optional Payment Method & Live Camera Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {/* Payment Methods */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A6B] mr-1">
                  Pagamento:
                </span>
                {[
                  { id: 'pix', label: 'Pix', icon: Zap },
                  { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
                  { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
                  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 transition-colors ${
                        isSelected
                          ? 'bg-[#3D2B1F] text-white shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#8C7A6B] border border-[#D9C5B2] hover:text-[#3D2B1F]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Camera Scanner Trigger */}
              <button
                type="button"
                id="open-camera-scanner-btn"
                onClick={startCameraScanner}
                className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F0EBE6] text-[#3D2B1F] border border-[#D9C5B2] rounded-sm text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#8C7A6B]" />
                <span>Abrir Câmera para Ler Código</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FEEDBACK: LAST DEDUCTED PIECE CONFIRMATION BANNER */}
      {lastCheckout && (
        <div className="bg-emerald-50 border-2 border-emerald-700/40 rounded-sm p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-sm border border-emerald-800/30 overflow-hidden shrink-0 bg-white shadow-2xs">
                <img
                  src={lastCheckout.productImageUrl}
                  alt={lastCheckout.productName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                    Baixa Realizada com Sucesso!
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#3D2B1F]">
                  {lastCheckout.productName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[#8C7A6B] mt-0.5">
                  <span className="font-mono font-bold text-[#3D2B1F]">{lastCheckout.productCode}</span>
                  <span>•</span>
                  <span>Valor: <strong className="text-emerald-800 font-serif">R$ {(lastCheckout.salePrice * lastCheckout.quantity).toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>
                    Estoque: {lastCheckout.previousStock} → <strong className="text-[#3D2B1F]">{lastCheckout.newStock} un</strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleUndoCheckout(lastCheckout)}
              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-800 border border-red-200 rounded-sm text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs self-end sm:self-center"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Desfazer / Estornar</span>
            </button>
          </div>
        </div>
      )}

      {/* TWO COLUMNS: SESSION RECENT CHECKOUTS + QUICK ONE-TOUCH PRODUCT CATALOG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: History of Session Deductions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-sm border border-[#D9C5B2] shadow-xs p-5">
            <div className="flex items-center justify-between border-b border-[#D9C5B2] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#3D2B1F]" />
                <h3 className="font-serif text-sm font-normal text-[#3D2B1F] uppercase tracking-wider">
                  Baixas Desta Sessão
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8C7A6B]">
                {totalSessionItems} un ({sessionHistory.length} baixas)
              </span>
            </div>

            {/* Totalizer bar */}
            {sessionHistory.length > 0 && (
              <div className="p-3 bg-[#FAF8F5] border border-[#D9C5B2] rounded-sm mb-4 flex items-center justify-between text-xs">
                <span className="text-[#8C7A6B]">Total Vendido/Baixado:</span>
                <span className="font-serif font-bold text-emerald-800 text-sm">
                  R$ {totalSessionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {sessionHistory.length === 0 ? (
              <div className="py-10 text-center text-[#8C7A6B]">
                <PackageMinus className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#3D2B1F]" />
                <p className="font-serif text-sm text-[#3D2B1F]">Nenhuma baixa dada ainda</p>
                <p className="text-[11px] text-[#8C7A6B] mt-1 font-light">
                  Digite ou escaneie o código de uma peça acima para registrar a saída da roupa.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#D9C5B2]/60 max-h-[380px] overflow-y-auto pr-1">
                {sessionHistory.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="w-10 h-10 rounded-sm object-cover border border-[#D9C5B2] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#3D2B1F] truncate">
                          {item.productName}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#8C7A6B]">
                          <span className="font-mono font-bold">{item.productCode}</span>
                          <span>•</span>
                          <span>{item.quantity}x (R$ {item.salePrice.toFixed(2)})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[#8C7A6B] font-mono">
                        {item.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUndoCheckout(item)}
                        className="p-1 text-[#8C7A6B] hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
                        title="Desfazer e repor estoque"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Quick One-Touch Catalog (Clique para Dar Baixa) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-sm border border-[#D9C5B2] shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9C5B2] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#3D2B1F]" />
                <h3 className="font-serif text-sm font-normal text-[#3D2B1F] uppercase tracking-wider">
                  Catálogo de Peças (Baixa em 1 Toque)
                </h3>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                <input
                  type="text"
                  value={searchCatalogQuery}
                  onChange={(e) => setSearchCatalogQuery(e.target.value)}
                  placeholder="Buscar peça ou código..."
                  className="w-full pl-7 pr-3 py-1.5 bg-[#FAF8F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>
            </div>

            {/* List of Products */}
            <div className="divide-y divide-[#D9C5B2]/60 max-h-[440px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-[#8C7A6B] text-xs">
                  Nenhuma peça encontrada com essa busca.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stockQuantity <= 0;
                  return (
                    <div
                      key={p.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-[#FAF8F5] px-2 rounded-sm transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-sm object-cover border border-[#D9C5B2] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-[#FAF8F5] border border-[#D9C5B2] rounded-xs text-[#3D2B1F]">
                              {p.code}
                            </span>
                            <span className="text-xs font-semibold text-[#3D2B1F] truncate">
                              {p.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#8C7A6B] mt-0.5">
                            <span>Venda: <strong className="text-emerald-800 font-serif font-bold">R$ {p.salePrice.toFixed(2)}</strong></span>
                            <span>•</span>
                            <span className={isOutOfStock ? 'text-red-700 font-bold' : p.stockQuantity <= 2 ? 'text-amber-800 font-bold' : 'text-[#3D2B1F]'}>
                              Estoque: {p.stockQuantity} un
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick 1-Touch Button */}
                      <button
                        type="button"
                        onClick={() => executeCheckout(p, 1)}
                        disabled={isOutOfStock || isProcessing}
                        className={`px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer ${
                          isOutOfStock
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : 'bg-[#3D2B1F] hover:bg-[#2C1F16] text-white active:scale-95'
                        }`}
                        title={isOutOfStock ? 'Sem estoque' : 'Dar baixa de 1 unidade'}
                      >
                        <PackageMinus className="w-3.5 h-3.5 text-[#D9C5B2]" />
                        <span>{isOutOfStock ? 'Esgotado' : 'Dar Baixa (-1)'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CAMERA BARCODE SCANNER MODAL */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2B1F]/80 backdrop-blur-xs p-4">
          <div className="bg-[#FAF8F5] rounded-sm max-w-md w-full overflow-hidden shadow-2xl border border-[#D9C5B2] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D9C5B2] bg-[#3D2B1F] text-white">
              <div className="flex items-center gap-2">
                <ScanBarcode className="w-4 h-4 text-[#D9C5B2]" />
                <h3 className="font-serif text-base font-light tracking-wide">
                  Leitor de Código de Barras / QR
                </h3>
              </div>
              <button
                type="button"
                onClick={stopCameraScanner}
                className="p-1 text-[#D9C5B2] hover:text-white rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-white">
                  <AlertCircle className="w-8 h-8 text-[#D9C5B2] mx-auto mb-2" />
                  <p className="text-xs">{cameraError}</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Chic Scanner Frame Overlay */}
                  <div className="absolute inset-12 border-2 border-emerald-500/70 rounded-sm pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-emerald-500/80 shadow-[0_0_8px_#10b981] animate-pulse" />
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-widest text-white/90 bg-black/50 py-1 font-mono">
                    Aponte para o código de barras ou etiqueta da roupa
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-white border-t border-[#D9C5B2] flex justify-end">
              <button
                type="button"
                onClick={stopCameraScanner}
                className="px-4 py-2 bg-[#3D2B1F] text-white text-[10px] uppercase tracking-widest font-medium rounded-sm"
              >
                Fechar Câmera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
