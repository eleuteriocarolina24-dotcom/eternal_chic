import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Check, 
  CreditCard, 
  Banknote, 
  QrCode, 
  DollarSign, 
  User as UserIcon,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Product, PaymentMethod } from '../types';
import { useStore } from '../context/StoreContext';

interface SellModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SellModal: React.FC<SellModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { sellProduct } = useStore();
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setCustomPrice(product.salePrice.toString());
      setCustomerName('');
      setNotes('');
      setPaymentMethod('pix');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentSalePrice = parseFloat(customPrice) || product.salePrice;
  const unitProfit = currentSalePrice - product.costPrice;
  const totalAmount = currentSalePrice * quantity;
  const totalProfit = unitProfit * quantity;
  const maxStock = product.stockQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > maxStock) return;

    setIsSubmitting(true);
    const success = await sellProduct(
      product.id,
      quantity,
      paymentMethod,
      customerName.trim(),
      notes.trim(),
      currentSalePrice !== product.salePrice ? currentSalePrice : undefined
    );
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div
      id="sell-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1810]/75 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="sell-modal-container"
        className="bg-[#FAF8F5] rounded-sm max-w-lg w-full overflow-hidden shadow-2xl border border-[#D9C5B2] my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#3D2B1F] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center text-[#D9C5B2]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-light tracking-wide">
                Registrar Venda
              </h3>
              <p className="text-[10px] text-[#D9C5B2] font-sans">
                Atualização imediata de estoque e faturamento
              </p>
            </div>
          </div>
          <button
            id="close-sell-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#D9C5B2] hover:text-white hover:bg-white/10 rounded-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Preview Banner */}
        <div className="p-4 bg-white border-b border-[#D9C5B2] flex items-center gap-3.5">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-14 h-14 rounded-sm object-cover border border-[#D9C5B2] shadow-2xs shrink-0 bg-white"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#3D2B1F] text-white text-[9px] font-mono font-medium rounded-sm">
                {product.code}
              </span>
              <span className="text-[10px] text-[#8C7A6B]">
                Estoque atual: <strong className="text-[#3D2B1F]">{product.stockQuantity} un</strong>
              </span>
            </div>
            <h4 className="font-serif text-base font-normal text-[#3D2B1F] truncate mt-0.5">
              {product.name}
            </h4>
            <div className="text-xs text-[#3D2B1F] flex items-center gap-3">
              <span>Custo: <strong>R$ {product.costPrice.toFixed(2)}</strong></span>
              <span>Preço tabela: <strong className="text-emerald-800">R$ {product.salePrice.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quantity selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1.5">
              Quantidade Vendida (Unidades)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-sm bg-white border border-[#D9C5B2] text-[#3D2B1F] font-bold text-base hover:bg-[#F0EBE6] transition-colors shadow-2xs flex items-center justify-center active:scale-95"
              >
                -
              </button>
              <input
                id="sell-quantity-input"
                type="number"
                min="1"
                max={maxStock}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(maxStock, Math.max(1, val)));
                }}
                className="flex-1 text-center font-serif font-bold text-lg py-2 bg-white border border-[#D9C5B2] rounded-sm text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                disabled={quantity >= maxStock}
                className="w-10 h-10 rounded-sm bg-white border border-[#D9C5B2] text-[#3D2B1F] font-bold text-base hover:bg-[#F0EBE6] disabled:opacity-40 transition-colors shadow-2xs flex items-center justify-center active:scale-95"
              >
                +
              </button>
            </div>
            {product.stockQuantity <= 1 && (
              <p className="text-[10px] text-amber-800 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Atenção: Esta é a última unidade disponível em estoque.
              </p>
            )}
          </div>

          {/* Unit Sale Price (Allow manual adjustment) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]">
                Valor Unitário de Venda (R$)
              </label>
              {parseFloat(customPrice) !== product.salePrice && (
                <button
                  type="button"
                  onClick={() => setCustomPrice(product.salePrice.toString())}
                  className="text-[10px] text-[#8C7A6B] underline hover:text-[#3D2B1F]"
                >
                  Restaurar original (R$ {product.salePrice.toFixed(2)})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-serif text-[#8C7A6B]">
                R$
              </span>
              <input
                id="sell-custom-price-input"
                type="number"
                step="0.01"
                min="0"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder={product.salePrice.toFixed(2)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs font-serif font-bold text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1.5">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'pix', label: 'Pix', icon: QrCode },
                { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
                { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
                { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    id={`payment-${method.id}-btn`}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`py-2 px-2.5 rounded-sm border text-[10px] uppercase tracking-wider font-medium flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-2xs'
                        : 'bg-white text-[#3D2B1F] border-[#D9C5B2] hover:bg-[#F0EBE6]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D9C5B2]' : 'text-[#8C7A6B]'}`} />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Name & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                Nome da Cliente (Opcional)
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                <input
                  id="sell-customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Luiza Albuquerque"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                Observações / Canal
              </label>
              <div className="relative">
                <FileText className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                <input
                  id="sell-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Instagram / WhatsApp"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="p-3.5 rounded-sm bg-white border border-[#D9C5B2] shadow-2xs space-y-1.5">
            <div className="flex justify-between items-center text-xs text-[#8C7A6B] pb-1 border-b border-[#D9C5B2]">
              <span className="text-[10px] uppercase tracking-wider">Subtotal ({quantity} un × R$ {currentSalePrice.toFixed(2)})</span>
              <span className="font-serif text-[#3D2B1F]">R$ {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#8C7A6B] py-1 border-b border-[#D9C5B2]">
              <span className="text-[10px] uppercase tracking-wider">Custo Total ({quantity} un × R$ {product.costPrice.toFixed(2)})</span>
              <span className="font-serif text-[#3D2B1F]">R$ {(product.costPrice * quantity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5">
              <div className="flex items-center gap-1 text-emerald-800">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Lucro Real</span>
              </div>
              <div className="text-right">
                <span className="text-base font-serif font-bold text-emerald-800">
                  + R$ {totalProfit.toFixed(2)}
                </span>
                <span className="block text-[9px] text-[#8C7A6B]">
                  ({product.costPrice > 0 ? (((currentSalePrice - product.costPrice) / product.costPrice) * 100).toFixed(0) : 100}% margem)
                </span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-sm border border-[#D9C5B2] text-[#3D2B1F] hover:bg-[#F0EBE6] text-[10px] uppercase tracking-widest font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              id="confirm-sell-submit-btn"
              type="submit"
              disabled={isSubmitting || quantity > maxStock || quantity <= 0}
              className="flex-1 py-2.5 px-4 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 text-[#D9C5B2]" />
              {isSubmitting ? 'Registrando...' : 'Confirmar Venda (SIM)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
