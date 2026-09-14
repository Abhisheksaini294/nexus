"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  createdAt: number;
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; type?: ToastType }) => void;
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

const TOAST_DURATION = 4000;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const isSuccess = item.type === "success";
  const isError = item.type === "error";

  useEffect(() => {
    const startTime = item.createdAt;
    const endTime = startTime + TOAST_DURATION;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const pct = Math.max(0, (remaining / TOAST_DURATION) * 100);
      setProgress(pct);

      if (pct <= 0) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [item.createdAt]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(item.id), 200);
  };

  const accentColor = isSuccess ? "#10b981" : isError ? "#ef4444" : "#6366f1";
  const accentBg = isSuccess ? "bg-emerald-500" : isError ? "bg-red-500" : "bg-indigo-500";

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl relative overflow-hidden transition-all duration-200 ${
        isExiting ? "opacity-0 translate-x-8 scale-95" : "animate-slide-in-right"
      } ${
        isSuccess
          ? "bg-white/95 dark:bg-slate-900/95 border-emerald-500/25"
          : isError
          ? "bg-white/95 dark:bg-slate-900/95 border-red-500/25"
          : "bg-white/95 dark:bg-slate-900/95 border-indigo-500/25"
      }`}
      style={{ boxShadow: `0 8px 32px -8px ${accentColor}22, 0 4px 16px -4px rgba(0,0,0,0.08)` }}
    >
      {/* Left accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentBg} rounded-l-2xl`} />

      <div className="mt-0.5 shrink-0 ml-1">
        {isSuccess && <CheckCircle2 className="text-emerald-500" size={18} />}
        {isError && <AlertCircle className="text-red-500" size={18} />}
        {!isSuccess && !isError && <Info className="text-indigo-500" size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
        {item.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 btn-press"
      >
        <X size={14} />
      </button>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full ${accentBg} transition-[width] duration-75 ease-linear rounded-full opacity-60`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, type = "success" }: { title: string; description?: string; type?: ToastType }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { id, title, description, type, createdAt: Date.now() };
      
      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 toasts

      setTimeout(() => {
        dismiss(id);
      }, TOAST_DURATION);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none max-w-[380px] w-full">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: () => {},
      dismiss: () => {},
      toasts: [],
    };
  }
  return context;
}
