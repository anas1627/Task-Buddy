import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export function ClearAllModal({ isOpen, onClose, onConfirm, totalTasks = 0 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121824] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-5 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-1">
          Clear All Tasks?
        </h3>

        <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">
          Are you sure you want to remove all <span className="text-amber-400 font-semibold">{totalTasks} tasks</span>? This action cannot be undone.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Yes, Clear All</span>
          </button>
        </div>
      </div>
    </div>
  );
}
