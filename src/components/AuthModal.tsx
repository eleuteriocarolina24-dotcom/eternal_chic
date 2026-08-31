import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Store, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { ButterflyLogo } from './ButterflyLogo';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, forgotPassword, resetPassword, loginDemo, user } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('Eternal Chic');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await register(name, storeName, email, password);
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await forgotPassword(email);
    setIsSubmitting(false);
    if (res.pin) {
      setGeneratedPin(res.pin);
      setRecoveryPin(res.pin);
      setMode('reset');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await resetPassword(email, recoveryPin, newPassword);
    setIsSubmitting(false);
    if (success) {
      setMode('login');
      setPassword(newPassword);
    }
  };

  const handleDemo = async () => {
    setIsSubmitting(true);
    await loginDemo();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1810]/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="auth-modal-container"
        className="bg-[#FAF8F5] rounded-sm max-w-md w-full overflow-hidden shadow-2xl border border-[#D9C5B2] my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Banner */}
        <div className="bg-[#3D2B1F] p-6 text-center text-white relative">
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#D9C5B2] hover:text-white hover:bg-white/10 rounded-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-3xl mb-1">🦋</div>
          <h2 className="font-serif text-2xl font-light tracking-[0.2em] uppercase text-[#FAF8F5]">
            ETERNAL CHIC
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-[#D9C5B2] mt-1 font-sans">
            Acesso Seguro & Sincronização em Nuvem
          </p>
        </div>

        {/* Tabs for Login / Register */}
        {mode !== 'forgot' && mode !== 'reset' && (
          <div className="flex border-b border-[#D9C5B2] bg-white">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                mode === 'login'
                  ? 'text-[#3D2B1F] border-b-2 border-[#3D2B1F] bg-[#FAF8F5]'
                  : 'text-[#8C7A6B] hover:text-[#3D2B1F]'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              id="tab-auth-register"
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                mode === 'register'
                  ? 'text-[#3D2B1F] border-b-2 border-[#3D2B1F] bg-[#FAF8F5]'
                  : 'text-[#8C7A6B] hover:text-[#3D2B1F]'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Quick Demo Access Badge */}
          <div className="mb-5 p-3 rounded-sm bg-white border border-[#D9C5B2] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#3D2B1F]" />
              <span className="text-xs text-[#3D2B1F]">
                Demonstração Imediata
              </span>
            </div>
            <button
              id="demo-login-btn"
              type="button"
              onClick={handleDemo}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium rounded-sm shadow-2xs transition-all"
            >
              Entrar Direto
            </button>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="loja@eternalchic.com"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-[#8C7A6B] hover:text-[#3D2B1F] underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              <button
                id="submit-login-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-xs uppercase tracking-widest font-medium shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? 'Acessando...' : 'Entrar no Sistema'}
                <ArrowRight className="w-3.5 h-3.5 text-[#D9C5B2]" />
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Seu Nome
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Carolina Eleutério"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Nome da Loja
                </label>
                <div className="relative">
                  <Store className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="register-store-input"
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Eternal Chic Boutique"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carolina@eternalchic.com"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Criar Senha
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                  />
                </div>
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-xs uppercase tracking-widest font-medium shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? 'Criando Conta...' : 'Cadastrar Loja'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="text-center mb-3">
                <KeyRound className="w-6 h-6 text-[#3D2B1F] mx-auto mb-2" />
                <h3 className="font-serif text-lg font-normal text-[#3D2B1F]">
                  Recuperação de Senha
                </h3>
                <p className="text-xs text-[#8C7A6B] font-light">
                  Informe seu e-mail para receber o código PIN de redefinição.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  E-mail Cadastrado
                </label>
                <input
                  id="forgot-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="loja@eternalchic.com"
                  className="w-full px-3.5 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="py-2.5 px-4 rounded-sm border border-[#D9C5B2] text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium"
                >
                  Voltar
                </button>
                <button
                  id="submit-forgot-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium shadow-2xs"
                >
                  {isSubmitting ? 'Gerando código...' : 'Gerar Código PIN'}
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="text-center mb-2">
                <CheckCircle className="w-6 h-6 text-emerald-800 mx-auto mb-1" />
                <h3 className="font-serif text-lg font-normal text-[#3D2B1F]">
                  Redefinir Senha
                </h3>
                {generatedPin && (
                  <div className="mt-2 p-2 bg-[#FAF8F5] border border-[#D9C5B2] rounded-sm">
                    <p className="text-xs text-[#3D2B1F]">
                      Seu PIN gerado: <strong className="font-mono text-sm tracking-widest">{generatedPin}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Código PIN (6 Dígitos)
                </label>
                <input
                  id="reset-pin-input"
                  type="text"
                  required
                  value={recoveryPin}
                  onChange={(e) => setRecoveryPin(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center font-mono tracking-widest font-bold py-2 bg-white border border-[#D9C5B2] rounded-sm text-base text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Nova Senha
                </label>
                <input
                  id="reset-new-password"
                  type="password"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha segura"
                  className="w-full px-3.5 py-2 bg-white border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>

              <button
                id="submit-reset-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-xs uppercase tracking-widest font-medium shadow-2xs"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </form>
          )}

          {/* Cloud Synchronization Assurance */}
          <div className="mt-6 pt-4 border-t border-[#D9C5B2] text-center">
            <p className="text-[10px] text-[#8C7A6B] flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Sincronização 100% online em nuvem
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
