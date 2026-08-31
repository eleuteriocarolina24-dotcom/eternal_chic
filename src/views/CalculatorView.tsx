import React, { useState } from 'react';
import { 
  Calculator, 
  Percent, 
  DollarSign, 
  TrendingUp, 
  Package, 
  CreditCard, 
  Truck, 
  PlusCircle, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CalculatorView: React.FC = () => {
  const { setActiveTab, showToast } = useStore();

  const [costPrice, setCostPrice] = useState<string>('60.00');
  const [profitMargin, setProfitMargin] = useState<string>('100');
  const [packagingCost, setPackagingCost] = useState<string>('4.00');
  const [cardFeePercent, setCardFeePercent] = useState<string>('3.5');
  const [shippingCost, setShippingCost] = useState<string>('0.00');
  const [otherCost, setOtherCost] = useState<string>('0.00');

  const quickPercentages = [20, 30, 40, 50, 60, 80, 100, 150, 200];

  // Parse numerical inputs
  const numCost = parseFloat(costPrice) || 0;
  const numMargin = parseFloat(profitMargin) || 0;
  const numPackaging = parseFloat(packagingCost) || 0;
  const numCardFee = parseFloat(cardFeePercent) || 0;
  const numShipping = parseFloat(shippingCost) || 0;
  const numOther = parseFloat(otherCost) || 0;

  // Base production cost
  const totalDirectCosts = numCost + numPackaging + numShipping + numOther;

  // Formula taking into account card fee:
  // Base markup on direct costs:
  const desiredProfit = totalDirectCosts * (numMargin / 100);
  const targetSubtotal = totalDirectCosts + desiredProfit;
  
  // Adjusted for card fee percentage: Sale Price = Subtotal / (1 - (CardFee / 100))
  const calculatedSalePrice = numCardFee < 100 
    ? targetSubtotal / (1 - (numCardFee / 100))
    : targetSubtotal;

  const cardFeeAmount = calculatedSalePrice * (numCardFee / 100);
  const realNetProfit = calculatedSalePrice - totalDirectCosts - cardFeeAmount;
  const realNetMarginPercent = totalDirectCosts > 0 ? (realNetProfit / totalDirectCosts) * 100 : 0;

  const handleReset = () => {
    setCostPrice('50.00');
    setProfitMargin('100');
    setPackagingCost('0.00');
    setCardFeePercent('0.0');
    setShippingCost('0.00');
    setOtherCost('0.00');
    showToast('Calculadora redefinida', 'info');
  };

  const handleSendToRegister = () => {
    setActiveTab('products');
    showToast('Preços calculados prontos para cadastro!', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9C5B2] pb-5">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.3em] opacity-60 block mb-1">
            Formação de Preço Inteligente
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-[#3D2B1F]">
            Calculadora de Preço de Venda
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Calcule o valor ideal considerando custo da peça, embalagem, taxa de cartão e margem líquida.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="self-start sm:self-auto px-3.5 py-2 rounded-sm border border-[#D9C5B2] text-[#3D2B1F] hover:bg-[#F0EBE6] text-[10px] uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar Campos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS COLUMN (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-sm p-6 border border-[#D9C5B2] shadow-2xs space-y-5">
          {/* 1. Custo da Peça */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1.5">
              1. Custo da Peça (Valor Pago) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C7A6B]">
                R$
              </span>
              <input
                id="calc-cost-input"
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-sm font-serif text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
              />
            </div>
          </div>

          {/* 2. Porcentagem de Lucro Desejada + Atalhos */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]">
                2. Porcentagem de Lucro Desejada (%) *
              </label>
              <span className="text-xs font-serif font-bold text-[#3D2B1F]">
                {profitMargin}%
              </span>
            </div>

            <div className="relative mb-3">
              <input
                id="calc-margin-input"
                type="number"
                step="1"
                min="0"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                placeholder="100"
                className="w-full pl-3.5 pr-8 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-sm font-serif text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C7A6B]">
                %
              </span>
            </div>

            {/* BOTOES RAPIDOS COM PORCENTAGENS PRONTAS (Requested in Section 5) */}
            <div>
              <span className="text-[9px] font-medium text-[#8C7A6B] uppercase tracking-widest block mb-1.5">
                Atalhos Rápidos de Margem:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {quickPercentages.map((pct) => (
                  <button
                    key={pct}
                    id={`quick-pct-${pct}-btn`}
                    type="button"
                    onClick={() => setProfitMargin(pct.toString())}
                    className={`py-1.5 px-2.5 rounded-sm text-[10px] uppercase tracking-widest font-medium transition-all ${
                      parseFloat(profitMargin) === pct
                        ? 'bg-[#3D2B1F] text-white shadow-2xs'
                        : 'bg-[#F9F7F5] text-[#3D2B1F] border border-[#D9C5B2] hover:bg-[#F0EBE6]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Outros Custos Adicionais (Embalagem, Maquininha, Frete) */}
          <div className="pt-4 border-t border-[#D9C5B2] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] block">
              3. Custos Adicionais & Taxas (Opcional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Embalagem / Sacola / Tag */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-medium text-[#8C7A6B] mb-1">
                  Embalagem / Sacola (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6B]">R$</span>
                  <input
                    id="calc-packaging-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              {/* Taxa da Maquininha (%) */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-medium text-[#8C7A6B] mb-1">
                  Taxa Cartão (%)
                </label>
                <div className="relative">
                  <input
                    id="calc-card-fee-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={cardFeePercent}
                    onChange={(e) => setCardFeePercent(e.target.value)}
                    placeholder="0.0"
                    className="w-full pl-3 pr-7 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6B]">%</span>
                </div>
              </div>

              {/* Frete / Entrega */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-medium text-[#8C7A6B] mb-1">
                  Frete / Logística (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6B]">R$</span>
                  <input
                    id="calc-shipping-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              {/* Outros custos */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-medium text-[#8C7A6B] mb-1">
                  Outras Despesas (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6B]">R$</span>
                  <input
                    id="calc-other-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={otherCost}
                    onChange={(e) => setOtherCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS COLUMN (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Price Card */}
          <div className="bg-[#3D2B1F] text-white p-6 md:p-8 rounded-sm shadow-sm border border-[#D9C5B2] space-y-5 relative overflow-hidden">
            <div>
              <span className="px-2.5 py-0.5 bg-white/10 rounded-sm text-[9px] font-medium uppercase tracking-[0.2em] text-[#D9C5B2]">
                Resultado em Tempo Real
              </span>
              <h3 className="font-serif text-lg font-light text-white mt-2">
                Preço Sugerido de Venda
              </h3>
            </div>

            {/* Giant Price */}
            <div className="py-1">
              <span className="text-[10px] uppercase tracking-widest text-[#D9C5B2] block">Etiqueta Final:</span>
              <div className="font-serif text-4xl md:text-5xl font-light tracking-tight text-white mt-0.5">
                R$ {calculatedSalePrice.toFixed(2)}
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
              <div className="flex justify-between text-[#D9C5B2]">
                <span className="text-[10px] uppercase tracking-wider">Custo Peça:</span>
                <span className="font-serif text-white">R$ {numCost.toFixed(2)}</span>
              </div>
              {numPackaging > 0 && (
                <div className="flex justify-between text-[#D9C5B2]">
                  <span className="text-[10px] uppercase tracking-wider">Embalagem:</span>
                  <span className="font-serif text-white">R$ {numPackaging.toFixed(2)}</span>
                </div>
              )}
              {cardFeeAmount > 0 && (
                <div className="flex justify-between text-[#D9C5B2]">
                  <span className="text-[10px] uppercase tracking-wider">Taxa Cartão ({numCardFee}%):</span>
                  <span className="font-serif text-white">R$ {cardFeeAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#D9C5B2]">
                <span className="text-[10px] uppercase tracking-wider">Total Custos:</span>
                <span className="font-serif text-white">R$ {(totalDirectCosts + cardFeeAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Real Profit Callout */}
            <div className="p-3.5 rounded-sm bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#D9C5B2] block">
                  Lucro Líquido Real
                </span>
                <span className="font-serif text-xl font-normal text-emerald-300">
                  + R$ {realNetProfit.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-[#D9C5B2] block">
                  Margem Real
                </span>
                <span className="font-serif text-lg font-normal text-white">
                  {realNetMarginPercent.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Action to Cadastrar */}
            <button
              id="calc-go-register-btn"
              type="button"
              onClick={handleSendToRegister}
              className="w-full py-3 px-4 rounded-sm bg-[#FAF8F5] hover:bg-white text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <span>Cadastrar Peça com este Valor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
