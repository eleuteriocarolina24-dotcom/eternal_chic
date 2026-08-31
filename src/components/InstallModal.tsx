import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor,
  X, 
  CheckCircle2, 
  Share2, 
  Share,
  PlusSquare,
  Apple,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Detect device type to select default tab
    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setActiveTab('ios');
    } else if (/android/i.test(ua)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2B1F]/80 backdrop-blur-xs p-4"
    >
      <div
        id="install-modal-card"
        className="bg-[#FAF8F5] rounded-sm max-w-xl w-full overflow-hidden shadow-2xl border border-[#D9C5B2] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#3D2B1F] text-white">
          <div className="flex items-center gap-2.5">
            <Laptop className="w-5 h-5 text-[#D9C5B2]" />
            <h3 className="font-serif text-lg font-light tracking-wide">
              Instalar o App (Computador & Celular)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#D9C5B2] hover:text-white rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* App Preview Card */}
          <div className="p-4 bg-white rounded-sm border border-[#D9C5B2] shadow-2xs flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md shrink-0 bg-[#3D2B1F] border border-[#D9C5B2]/60">
              <img
                src="/pwa-icon-192.png"
                alt="Eternal Chic App Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#8C7A6B]">
                Aplicativo Desktop & Mobile (PWA)
              </span>
              <h4 className="font-serif text-base font-bold text-[#3D2B1F] truncate">
                Eternal Chic - Sistema de Gestão
              </h4>
              <p className="text-[11px] text-[#8C7A6B] truncate">
                Estoque, Leitor de Baixa, Planilha de Grade e Catálogo
              </p>
            </div>
          </div>

          {/* OS Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F0EBE6] rounded-sm border border-[#D9C5B2]">
            <button
              type="button"
              onClick={() => setActiveTab('desktop')}
              className={`py-2 px-2 rounded-xs text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'desktop'
                  ? 'bg-[#3D2B1F] text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#3D2B1F]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Computador / PC</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`py-2 px-2 rounded-xs text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-[#3D2B1F] text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#3D2B1F]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`py-2 px-2 rounded-xs text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-[#3D2B1F] text-white shadow-2xs'
                  : 'text-[#8C7A6B] hover:text-[#3D2B1F]'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone (iOS)</span>
            </button>
          </div>

          {/* Direct Install Button (available in Chrome/Edge on Desktop and Android) */}
          {deferredPrompt && (
            <button
              type="button"
              id="pwa-direct-install-btn"
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-sm font-sans text-xs uppercase tracking-widest font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Aplicativo Agora no seu Sistema</span>
            </button>
          )}

          {/* DESKTOP / PC GUIDE */}
          {activeTab === 'desktop' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="space-y-3 text-xs text-[#3D2B1F] bg-white p-4 rounded-sm border border-[#D9C5B2]">
                <p className="font-semibold text-emerald-900 text-xs">
                  Como instalar o aplicativo no Windows ou Mac (Chrome / Edge):
                </p>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3D2B1F] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    1
                  </span>
                  <p>
                    No topo do seu navegador (na <strong>barra de endereço</strong> onde fica o link), clique no ícone de <strong>Instalar</strong> (símbolo de monitor com seta para baixo ou botão de instalar).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3D2B1F] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    2
                  </span>
                  <p>
                    Ou clique nos <strong>3 pontinhos (⋮)</strong> no canto superior direito do Chrome / Edge e selecione <strong>"Salvar e Compartilhar" &gt; "Instalar Eternal Chic..."</strong> (ou <strong>"Instalar aplicativo"</strong>).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    3
                  </span>
                  <p>
                    Clique em <strong>"Instalar"</strong>. Um ícone do programa será criado na sua <strong>Área de Trabalho (Desktop)</strong> e na barra de tarefas!
                  </p>
                </div>

                <div className="p-2.5 bg-[#FAF8F5] rounded-xs border border-[#D9C5B2] text-[11px] text-[#8C7A6B]">
                  💡 <strong>Vantagem no Computador:</strong> Abre em janela independente e limpa (sem abas do navegador), super rápido para usar leitor de código de barras USB e editar a planilha em tela cheia.
                </div>
              </div>
            </div>
          )}

          {/* ANDROID GUIDE */}
          {activeTab === 'android' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="space-y-3 text-xs text-[#3D2B1F] bg-white p-4 rounded-sm border border-[#D9C5B2]">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3D2B1F] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    1
                  </span>
                  <p>
                    Abra este link no navegador <strong>Google Chrome</strong> do seu celular Android.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3D2B1F] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    2
                  </span>
                  <p>
                    Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito do Chrome.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    3
                  </span>
                  <p>
                    Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3D2B1F] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    4
                  </span>
                  <p>
                    Pronto! O aplicativo abrirá em tela cheia direto pelo ícone na tela do celular.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* IOS GUIDE */}
          {activeTab === 'ios' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="space-y-3 text-xs text-[#3D2B1F] bg-white p-4 rounded-sm border border-[#D9C5B2]">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3D2B1F] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    1
                  </span>
                  <p>
                    Abra este link no navegador <strong>Safari</strong> do seu iPhone ou iPad.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3D2B1F] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    2
                  </span>
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 flex-wrap">
                      Toque no botão de <strong>Compartilhar</strong>
                      <span className="inline-flex items-center justify-center p-1 bg-[#FAF8F5] border border-[#D9C5B2] rounded-xs text-[#3D2B1F]">
                        <Share className="w-3.5 h-3.5" />
                      </span>
                      (na barra inferior do Safari).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3D2B1F] text-[#FAF8F5] text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    3
                  </span>
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 flex-wrap">
                      Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                      <span className="inline-flex items-center justify-center p-1 bg-[#FAF8F5] border border-[#D9C5B2] rounded-xs text-[#3D2B1F]">
                        <PlusSquare className="w-3.5 h-3.5" />
                      </span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center font-mono shrink-0 font-bold">
                    4
                  </span>
                  <p>
                    Toque em <strong>"Adicionar"</strong> no topo direito. O app da Eternal Chic será instalado na sua tela inicial!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Copy Link & Share section */}
          <div className="pt-2 border-t border-[#D9C5B2] space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A6B] block">
              Link de acesso direto da sua loja:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs font-mono text-[#3D2B1F] select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-[#3D2B1F] text-white text-[10px] uppercase tracking-widest font-medium rounded-sm flex items-center gap-1.5 shadow-2xs hover:bg-[#2C1F16] cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8C7A6B]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span>Janela de programa independente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span>Ícone na Área de Trabalho e Barra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span>Leitor de código de barras USB/Câmera</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span>Sincronização em Nuvem em tempo real</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#D9C5B2] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#3D2B1F] text-white text-[10px] uppercase tracking-widest font-medium rounded-sm cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
