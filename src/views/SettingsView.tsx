import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Phone, 
  Instagram, 
  QrCode, 
  MapPin, 
  Cloud, 
  RefreshCw, 
  Save, 
  Smartphone, 
  Laptop, 
  Tablet, 
  ShieldCheck, 
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ButterflyLogo } from '../components/ButterflyLogo';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isSyncing, syncData, lastSyncTime, showToast } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName || 'Eternal Chic');
  const [slogan, setSlogan] = useState(settings.slogan || 'Boutique de Moda Feminina');
  const [phone, setPhone] = useState(settings.phone || '(11) 98765-4321');
  const [instagram, setInstagram] = useState(settings.instagram || '@eternalchic');
  const [pixKey, setPixKey] = useState(settings.pixKey || 'contato@eternalchic.com.br');
  const [address, setAddress] = useState(settings.address || 'São Paulo - SP');
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold?.toString() || '2');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateSettings({
      storeName: storeName.trim(),
      slogan: slogan.trim(),
      phone: phone.trim(),
      instagram: instagram.trim(),
      pixKey: pixKey.trim(),
      address: address.trim(),
      lowStockThreshold: parseInt(lowStockThreshold) || 2,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9C5B2] pb-5">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.3em] opacity-60 block mb-1">
            Personalização & Conectividade
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-[#3D2B1F]">
            Configurações da Loja
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Defina dados de contato, redes sociais, avisos e status de sincronização multi-dispositivo em nuvem.
          </p>
        </div>

        <button
          onClick={() => syncData()}
          disabled={isSyncing}
          className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-[#F0EBE6] text-[#3D2B1F] border border-[#D9C5B2] rounded-sm text-[10px] uppercase tracking-widest font-medium flex items-center gap-2 shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SETTINGS FORM (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-sm p-6 md:p-8 border border-[#D9C5B2] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-[#D9C5B2]">
            <Store className="w-5 h-5 text-[#3D2B1F]" />
            <h3 className="font-serif text-lg font-normal text-[#3D2B1F]">
              Informações do Estabelecimento
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Nome da Loja & Slogan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Nome da Loja *
                </label>
                <input
                  id="settings-store-name"
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs md:text-sm text-[#3D2B1F] font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Slogan / Subtítulo
                </label>
                <input
                  id="settings-slogan"
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs md:text-sm text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>
            </div>

            {/* Telefone WhatsApp & Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  WhatsApp da Loja
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="settings-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="settings-instagram"
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@sualoja"
                    className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>
            </div>

            {/* Chave Pix & Endereço */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Chave Pix para Clientes
                </label>
                <div className="relative">
                  <QrCode className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="settings-pix"
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Chave Pix ou CNPJ/CPF"
                    className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Cidade / Estado
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="settings-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="São Paulo - SP"
                    className="w-full pl-8 pr-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>
            </div>

            {/* Limite de Baixo Estoque */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                Alerta de Baixo Estoque (Unidades Mínimas)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="settings-threshold"
                  type="number"
                  min="1"
                  max="20"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-24 px-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs font-bold text-center text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
                <span className="text-xs text-[#8C7A6B]">
                  Avisar no topo da tela quando o estoque de uma peça for menor ou igual a este valor.
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                id="submit-settings-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-xs font-medium uppercase tracking-widest shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#D9C5B2]" />
                <span>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* MULTI-DEVICE & CLOUD SYNC STATUS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Cloud Sync Status Card */}
          <div className="bg-[#FAF8F5] rounded-sm p-6 border border-[#D9C5B2] shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[#3D2B1F] text-[#D9C5B2] flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-normal text-[#3D2B1F]">
                  Sincronização 100% em Nuvem
                </h4>
                <p className="text-xs text-[#8C7A6B]">
                  Status do servidor: <strong className="text-emerald-800">Online & Ativo</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-[#3D2B1F] leading-relaxed font-light">
              O sistema sincroniza todas as peças, vendas e agendamentos automaticamente. Qualquer alteração feita no celular aparece instantaneamente no computador ou tablet.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#D9C5B2] text-center">
              <div className="p-2.5 bg-white rounded-sm border border-[#D9C5B2]">
                <Smartphone className="w-4 h-4 mx-auto text-[#3D2B1F] mb-1" />
                <span className="text-[10px] font-bold text-[#3D2B1F] block uppercase tracking-wider">Celular</span>
                <span className="text-[9px] text-emerald-800">Sincronizado</span>
              </div>
              <div className="p-2.5 bg-white rounded-sm border border-[#D9C5B2]">
                <Tablet className="w-4 h-4 mx-auto text-[#3D2B1F] mb-1" />
                <span className="text-[10px] font-bold text-[#3D2B1F] block uppercase tracking-wider">Tablet</span>
                <span className="text-[9px] text-emerald-800">Sincronizado</span>
              </div>
              <div className="p-2.5 bg-white rounded-sm border border-[#D9C5B2]">
                <Laptop className="w-4 h-4 mx-auto text-[#3D2B1F] mb-1" />
                <span className="text-[10px] font-bold text-[#3D2B1F] block uppercase tracking-wider">Notebook</span>
                <span className="text-[9px] text-emerald-800">Sincronizado</span>
              </div>
            </div>

            {lastSyncTime && (
              <div className="text-[11px] text-[#8C7A6B] text-center font-mono">
                Último heartbeat de sincronização: {lastSyncTime.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* App Install Card (Desktop, Android & iOS) */}
          <div className="bg-white rounded-sm p-6 border border-[#D9C5B2] shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-emerald-800 text-white flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-normal text-[#3D2B1F]">
                  Instalação do Aplicativo (Computador & Celular)
                </h4>
                <p className="text-xs text-[#8C7A6B]">
                  Instale o programa no Computador (Windows / Mac) ou no Celular (Android / iPhone)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Computador / Desktop */}
              <div className="p-3 bg-[#FAF8F5] rounded-sm border border-[#D9C5B2] space-y-2 text-xs text-[#3D2B1F]">
                <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                  <span>💻</span> No Computador (PC / Mac):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[#8C7A6B]">
                  <li>Abra no <strong>Google Chrome</strong> ou <strong>Edge</strong>.</li>
                  <li>Clique no ícone de <strong>Instalar</strong> na barra de links ou menu (⋮).</li>
                  <li>Clique em <strong>"Instalar aplicativo"</strong>.</li>
                  <li>O ícone aparecerá na sua <strong>Área de Trabalho</strong>!</li>
                </ol>
              </div>

              {/* iPhone iOS */}
              <div className="p-3 bg-[#FAF8F5] rounded-sm border border-[#D9C5B2] space-y-2 text-xs text-[#3D2B1F]">
                <p className="font-semibold text-[#3D2B1F] flex items-center gap-1.5">
                  <span>🍎</span> No iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[#8C7A6B]">
                  <li>Abra o link no navegador <strong>Safari</strong>.</li>
                  <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta ⎋).</li>
                  <li>Selecione <strong>"Adicionar à Tela de Início"</strong> (+).</li>
                  <li>Toque em <strong>"Adicionar"</strong> no topo direito.</li>
                </ol>
              </div>

              {/* Android */}
              <div className="p-3 bg-[#FAF8F5] rounded-sm border border-[#D9C5B2] space-y-2 text-xs text-[#3D2B1F]">
                <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <span>🤖</span> No Android (Chrome):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[#8C7A6B]">
                  <li>Abra o link no <strong>Google Chrome</strong>.</li>
                  <li>Toque no menu de <strong>3 pontinhos (⋮)</strong> no topo.</li>
                  <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela"</strong>.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Security & Access Info */}
          <div className="bg-white rounded-sm p-6 border border-[#D9C5B2] shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-[#3D2B1F]">
              <ShieldCheck className="w-4 h-4 text-[#8C7A6B]" />
              <h4 className="font-serif text-sm font-normal">
                Segurança & Integridade
              </h4>
            </div>
            <p className="text-xs text-[#8C7A6B] leading-relaxed font-light">
              Os dados da sua loja ficam protegidos por criptografia de sessão e backups em arquivo persistente na nuvem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
