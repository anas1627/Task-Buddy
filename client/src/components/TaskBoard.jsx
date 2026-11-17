import React from 'react';
import { CheckCircle2, Clock, Circle, ArrowRight, ArrowLeft, Trash2, Edit3, Calendar } from 'lucide-react';

export function TaskBoard({
  tasks = [],
  onToggleComplete,
  onDelete,
  onEdit,
  onMoveStage
}) {
  const todoTasks = tasks.filter(t => !t.completed && (t.subtasks?.length === 0 || t.subtasks?.every(s => !s.completed)));
  const inProgressTasks = tasks.filter(t => !t.completed && t.subtasks?.some(s => s.completed));
  const doneTasks = tasks.filter(t => t.completed);

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: todoTasks,
      color: 'border-blue-500/30 bg-blue-950/10 text-blue-400',
      icon: Circle
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      tasks: inProgressTasks,
      color: 'border-amber-500/30 bg-amber-950/10 text-amber-400',
      icon: Clock
    },
    {
      id: 'done',
      title: 'Completed',
      tasks: doneTasks,
      color: 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const Icon = col.icon;
        return (
          <div
            key={col.id}
            className="bg-[#121824] border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg border ${col.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-200">{col.title}</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">
                {col.tasks.length}
              </span>
            </div>

            {/* Column Task Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {col.tasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-slate-800/80 rounded-lg">
                  <span>No tasks here</span>
                </div>
              ) : (
                col.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#1a2234] border border-slate-700/80 hover:border-slate-600 rounded-lg p-3 text-left shadow-sm group transition-all"
                  >
                    {/* Priority and category */}
                    <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
                      <span className="uppercase font-semibold tracking-wider text-amber-400">
                        {task.priority}
                      </span>
                      <span className="bg-slate-800/90 px-1.5 py-0.5 rounded text-slate-300">
                        {task.category || 'General'}
                      </span>
                    </div>

                    <h4 className={`text-sm font-semibold mb-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}

                    {/* Subtasks summary */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="text-[11px] text-slate-400 mb-2">
                        Subtasks: {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length}
                      </div>
                    )}

                    {/* Card footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      {task.dueDate ? (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {task.dueDate}
                        </span>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1 text-slate-400 hover:text-amber-400"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleComplete(task.id)}
                          className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-medium text-[11px]"
                        >
                          {task.completed ? 'Reopen' : 'Done'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
