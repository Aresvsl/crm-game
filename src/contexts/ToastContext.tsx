"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`
              glass-card p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full duration-300
              ${toast.type === 'success' ? 'border-[#22c55e]/20 bg-[#22c55e]/5' : 
                toast.type === 'error' ? 'border-[#ef4444]/20 bg-[#ef4444]/5' : 
                'border-[#3b82f6]/20 bg-[#3b82f6]/5'}
            `}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${toast.type === 'success' ? 'text-[#22c55e] bg-[#22c55e]/10' : 
                toast.type === 'error' ? 'text-[#ef4444] bg-[#ef4444]/10' : 
                'text-[#3b82f6] bg-[#3b82f6]/10'}
            `}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1a3a70]">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-[#1a3a70] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
