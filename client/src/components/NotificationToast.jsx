import React from 'react';
import { Wifi, Undo2, X, Bell } from 'lucide-react';

export function NotificationToast({ toast, onUndo, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#181f32] border border-amber-500/40 text-slate-100 p-3.5 rounded-xl shadow-2xl animate-slideUp flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
          <Bell className="w-4 h-4" />
        </span>
        <div className="text-xs truncate">
          <p className="font-semibold text-slate-200">{toast.title || 'Notification'}</p>
          <p className="text-slate-400 truncate">{toast.message}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {toast.canUndo && (
          <button
            onClick={onUndo}
            className="px-2 py-1 bg-amber-500 text-slate-950 font-bold text-[11px] rounded hover:bg-amber-400 transition-colors flex items-center gap-1"
          >
            <Undo2 className="w-3 h-3" /> Undo
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
