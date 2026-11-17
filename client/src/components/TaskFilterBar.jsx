import React, { useRef } from 'react';
import { Search, Filter, ArrowUpDown, Download, Upload, X } from 'lucide-react';

export function TaskFilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  sortBy,
  setSortBy,
  categories = [],
  tasks = [],
  onImportTasks
}) {
  const fileInputRef = useRef(null);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taskbuddy_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Description', 'Priority', 'Category', 'Completed', 'DueDate', 'CreatedAt'];
    const rows = tasks.map(t => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.priority || 'medium',
      t.category || 'General',
      t.completed ? 'TRUE' : 'FALSE',
      t.dueDate || '',
      t.createdAt || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taskbuddy_tasks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          onImportTasks(imported);
        } else {
          alert('Invalid file format. Please upload a JSON array of tasks.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-[#121824]/80 border border-slate-800 rounded-xl p-3 mb-5 space-y-3 shadow-md">
      {/* Search Bar + Sort + Export/Import */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-[#1a2234] border border-slate-700/80 rounded-lg pl-9 pr-8 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Tools */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="flex items-center bg-[#1a2234] border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-slate-900">Sort: Default</option>
              <option value="dueDate" className="bg-slate-900">Sort: Due Date</option>
              <option value="priority" className="bg-slate-900">Sort: Priority</option>
              <option value="alphabetical" className="bg-slate-900">Sort: Name (A-Z)</option>
            </select>
          </div>

          {/* Export dropdown / buttons */}
          <button
            onClick={handleExportCSV}
            className="p-1.5 bg-[#1a2234] hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-amber-400 transition-colors"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 bg-[#1a2234] hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-amber-400 transition-colors"
            title="Import from JSON"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Filter tags (Categories & Priority) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-800/80">
        <span className="text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-amber-400" /> Filters:
        </span>

        {/* Category buttons */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-md transition-all font-medium ${
            selectedCategory === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          All
        </button>

        {categories.map((c) => (
          <button
            key={c.id || c.name}
            onClick={() => setSelectedCategory(c.name)}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedCategory === c.name
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {c.name}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Priority quick filters */}
        {['urgent', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPriority(selectedPriority === p ? 'all' : p)}
            className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-semibold transition-all ${
              selectedPriority === p
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
