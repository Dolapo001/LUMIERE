"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center min-w-[300px] w-full max-w-sm overflow-hidden rounded border bg-white p-4 shadow-sm animate-in slide-in-from-bottom-5 fade-in duration-300 ${
              t.type === "success" ? "border-black" : t.type === "error" ? "border-red-500" : "border-gray-200"
            }`}
          >
            <div className="shrink-0 mr-3">
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-black" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
              {t.type === "info" && <Info className="h-5 w-5 text-gray-500" />}
            </div>
            <p className="flex-1 text-sm font-medium text-black">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 ml-4 text-gray-400 hover:text-black transition-colors focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
