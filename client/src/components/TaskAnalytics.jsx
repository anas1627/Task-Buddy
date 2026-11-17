import React from 'react';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Folder, PieChart, Sparkles } from 'lucide-react';

export function TaskAnalytics({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const priorities = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  const categories = {};
  tasks.forEach(t => {
    const cat = t.category || 'General';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <Folder className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{total}</div>
          <span className="text-[11px] text-slate-400">All registered items</span>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{completed}</div>
          <span className="text-[11px] text-slate-400">Tasks checked off</span>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pending}</div>
          <span className="text-[11px] text-slate-400">Action items waiting</span>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{rate}%</div>
          <span className="text-[11px] text-slate-400">Overall efficiency</span>
        </div>
      </div>

      {/* Progress & Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Distribution */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Priority Distribution
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Urgent', count: priorities.urgent, color: 'bg-rose-500', barBg: 'bg-rose-950/40' },
              { label: 'High', count: priorities.high, color: 'bg-orange-500', barBg: 'bg-orange-950/40' },
              { label: 'Medium', count: priorities.medium, color: 'bg-amber-500', barBg: 'bg-amber-950/40' },
              { label: 'Low', count: priorities.low, color: 'bg-emerald-500', barBg: 'bg-emerald-950/40' }
            ].map(item => {
              const pct = total === 0 ? 0 : Math.round((item.count / total) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-slate-400">{item.count} tasks ({pct}%)</span>
                  </div>
                  <div className={`w-full ${item.barBg} rounded-full h-2 overflow-hidden`}>
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            Category Distribution
          </h3>

          <div className="space-y-2.5">
            {Object.keys(categories).length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No categories recorded yet</div>
            ) : (
              Object.entries(categories).map(([cat, count]) => {
                const pct = total === 0 ? 0 : Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Motivational Productivity Tip */}
      <div className="bg-gradient-to-r from-amber-950/40 via-[#181f32] to-[#121824] border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Productivity Insight</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            {rate >= 80
              ? 'Incredible momentum! You have completed over 80% of your current goals.'
              : rate >= 50
              ? 'Great progress! You are more than halfway through your active workload.'
              : 'Focus on 1-2 urgent or high-priority tasks first to build solid daily momentum.'}
          </p>
        </div>
      </div>
    </div>
  );
}
