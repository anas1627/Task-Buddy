import React, { useState } from 'react';
import { Plus, Calendar, Tag, ChevronDown, ChevronUp, Layers, ListPlus, X, Sparkles } from 'lucide-react';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400 bg-amber-950/60 border-amber-800/80' },
  { value: 'high', label: 'High', color: 'text-orange-400 bg-orange-950/60 border-orange-800/80' },
  { value: 'urgent', label: 'Urgent', color: 'text-rose-400 bg-rose-950/60 border-rose-800/80' }
];

export function TaskInput({ onAddTask, categories = [] }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General');
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [currentSubtask, setCurrentSubtask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!currentSubtask.trim()) return;
    setSubtasks([...subtasks, { id: `sub-${Date.now()}`, title: currentSubtask.trim(), completed: false }]);
    setCurrentSubtask('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate || null,
        subtasks
      });

      // Reset
      setTitle('');
      setDescription('');
      setDueDate('');
      setSubtasks([]);
      setIsExpanded(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#121824] border border-slate-800/90 rounded-xl p-3 sm:p-4 shadow-xl mb-6 transition-all hover:border-slate-700">
      <form onSubmit={handleSubmit}>
        {/* Main input bar matching reference screenshot */}
        <div className="flex flex-col md:flex-row items-stretch gap-2.5">
          {/* Text Input with Add button attached or beside */}
          <div className="flex-1 flex items-stretch relative rounded-lg overflow-hidden border border-slate-700/80 bg-[#1a2234] focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your task"
              required
              className="w-full bg-transparent px-4 py-2.5 text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-5 sm:px-6 text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 select-none"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-36">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full appearance-none bg-[#1a2234] border border-slate-700/80 text-slate-200 text-sm rounded-lg px-3.5 py-2.5 pr-8 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value} className="bg-slate-900 text-slate-200">
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Dropdown */}
            <div className="relative flex-1 md:w-40">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-[#1a2234] border border-slate-700/80 text-slate-200 text-sm rounded-lg px-3.5 py-2.5 pr-8 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name} className="bg-slate-900 text-slate-200">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Expand / Details toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2.5 rounded-lg border text-xs font-medium transition-colors flex items-center justify-center ${
                isExpanded
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-[#1a2234] text-slate-400 border-slate-700/80 hover:text-slate-200'
              }`}
              title={isExpanded ? 'Hide Extra Details' : 'Add Due Date, Notes & Subtasks'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible advanced details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {/* Description & Due Date */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description / Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, notes, links, or instructions..."
                  rows={2}
                  className="w-full bg-[#1a2234] border border-slate-700/80 text-slate-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-amber-500 placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#1a2234] border border-slate-700/80 text-slate-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Subtasks / Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Checklist / Subtasks</span>
                <span className="text-[10px] text-slate-500">({subtasks.length} items)</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSubtask}
                  onChange={(e) => setCurrentSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask(e);
                    }
                  }}
                  placeholder="e.g., Check test coverage"
                  className="flex-1 bg-[#1a2234] border border-slate-700/80 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1.5 mt-2 pr-1">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between text-xs bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300"
                    >
                      <span className="truncate">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="text-slate-500 hover:text-red-400 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
