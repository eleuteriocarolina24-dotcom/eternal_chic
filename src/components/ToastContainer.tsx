import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-[#3D271D]/95 text-[#FAF7F2] border-[#C4A482]/40'
                : isError
                ? 'bg-red-900/95 text-white border-red-700'
                : isWarning
                ? 'bg-amber-900/95 text-amber-50 border-amber-700'
                : 'bg-[#5C3D2E]/95 text-white border-[#8D6E63]'
            }`}
          >
            <div className="flex items-center gap-3 pr-2">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#C4A482] shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#D7CCC8] shrink-0" />}
              <span className="text-xs md:text-sm font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
