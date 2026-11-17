import React from 'react';
import { Trash2, CheckCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function ProgressBar({
  total = 0,
  completed = 0,
  activeFilter = 'all',
  setActiveFilter,
  onClearAllClick,
  onClearCompleted
}) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Trigger celebration if all tasks are completed
  const handleCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="mt-8 pt-4 border-t border-slate-800/80">
      {/* Progress Counter matching reference screenshot */}
      <div className="text-center mb-2.5">
        <div className="inline-flex items-center gap-2">
          <span className="text-slate-300 font-semibold text-sm sm:text-base">
            {completed} of {total} tasks completed
          </span>
          {percentage === 100 && total > 0 && (
            <button
              onClick={handleCelebration}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce"
              title="Click for celebration!"
            >
              <Sparkles className="w-3 h-3" /> All Done!
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden mb-6 p-0.5 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Bottom Action Area with Clear All Tasks matching the reference button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center bg-[#121824] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'active'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({total - completed})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'completed'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({completed})
          </button>
        </div>

        {/* Buttons: Clear Completed & Clear All Tasks */}
        <div className="flex items-center gap-2">
          {completed > 0 && (
            <button
              onClick={onClearCompleted}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Clear Completed</span>
            </button>
          )}

          {/* The signature orange "Clear All Tasks" button */}
          <button
            onClick={onClearAllClick}
            disabled={total === 0}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md hover:shadow-orange-900/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Tasks</span>
          </button>
        </div>
      </div>
    </div>
  );
}
