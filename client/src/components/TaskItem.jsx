import React, { useState } from 'react';
import { Check, Trash2, Edit3, Calendar, CheckSquare, Square, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRIORITY_BADGES = {
  low: { label: 'Low', bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-800' },
  medium: { label: 'Medium', bg: 'bg-amber-950/70 text-amber-300 border-amber-800' },
  high: { label: 'High', bg: 'bg-orange-950/70 text-orange-300 border-orange-800' },
  urgent: { label: 'Urgent', bg: 'bg-rose-950/70 text-rose-300 border-rose-800' }
};

export function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onUpdateSubtask
}) {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const priorityStyle = PRIORITY_BADGES[task.priority?.toLowerCase()] || PRIORITY_BADGES.medium;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!task.completed) {
      // Fire confetti burst
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    onToggleComplete(task.id);
  };

  const completedSubtasksCount = (task.subtasks || []).filter(s => s.completed).length;
  const totalSubtasksCount = (task.subtasks || []).length;

  // Format due date
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().toDateString());
  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 overflow-hidden ${
        task.completed
          ? 'bg-[#151c2c]/60 border-slate-800/60 opacity-80'
          : 'bg-[#1e2638] hover:bg-[#232c40] border-slate-700/80 hover:border-slate-600 shadow-md'
      }`}
    >
      {/* Priority accent strip on left border */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          task.priority === 'urgent'
            ? 'bg-rose-500'
            : task.priority === 'high'
            ? 'bg-orange-500'
            : task.priority === 'medium'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />

      <div className="p-3.5 sm:p-4 pl-4 sm:pl-5 flex flex-col gap-2">
        {/* Main row: Task Title + Meta + Action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Checkmark + Title + Format matching Task 2(Medium, General) */}
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            {/* Custom rounded checkbox */}
            <button
              onClick={handleToggle}
              className={`mt-0.5 sm:mt-0 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                task.completed
                  ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold'
                  : 'border-slate-600 hover:border-amber-400 bg-slate-900/40 text-transparent'
              }`}
              title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Task Title & Tags */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-sm sm:text-base font-medium tracking-tight break-words ${
                    task.completed
                      ? 'line-through text-slate-400'
                      : 'text-slate-100 font-semibold'
                  }`}
                >
                  {task.title}
                </span>

                {/* Subtitle tag matching video format: (Medium, General) */}
                <span className="text-xs text-slate-400 font-normal">
                  ({priorityStyle.label}, {task.category || 'General'})
                </span>
              </div>

              {/* Description preview if available */}
              {task.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions matching the reference screenshot "Complete" and "Delete" */}
          <div className="flex items-center justify-end gap-3 self-end sm:self-center">
            {/* Due Date Badge */}
            {task.dueDate && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 border ${
                  isOverdue
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : isToday
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800'
                }`}
                title={isOverdue ? 'Overdue!' : isToday ? 'Due today!' : `Due ${task.dueDate}`}
              >
                <Calendar className="w-3 h-3" />
                <span>{isToday ? 'Today' : task.dueDate}</span>
              </span>
            )}

            {/* Subtasks Badge if any */}
            {totalSubtasksCount > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700/80 hover:border-amber-500/50 flex items-center gap-1 transition-colors"
              >
                <span>{completedSubtasksCount}/{totalSubtasksCount}</span>
                {showSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {/* Edit Button */}
            <button
              onClick={() => onEdit(task)}
              className="text-xs font-medium text-slate-400 hover:text-amber-300 transition-colors p-1"
              title="Edit Task Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Complete action matching reference screenshot */}
            <button
              onClick={handleToggle}
              className="text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-all cursor-pointer select-none"
            >
              {task.completed ? 'Reopen' : 'Complete'}
            </button>

            {/* Delete action matching reference screenshot */}
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs sm:text-sm font-semibold text-amber-400/90 hover:text-red-400 hover:underline transition-all cursor-pointer select-none"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Expandable Subtasks Checklist */}
        {showSubtasks && totalSubtasksCount > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 pl-8 space-y-1.5 animate-fadeIn">
            {task.subtasks.map((sub) => (
              <div
                key={sub.id}
                onClick={() => onUpdateSubtask(task.id, sub.id, !sub.completed)}
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none py-0.5"
              >
                {sub.completed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className={sub.completed ? 'line-through text-slate-500' : ''}>
                  {sub.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
