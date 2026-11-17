import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { CheckCircle2, Wifi, WifiOff, LogIn, LogOut, LayoutList, Columns, BarChart3, Sun, Moon, Sparkles } from 'lucide-react';

export function Navbar({ activeView, setActiveView, isDark, setIsDark, onOpenAuth }) {
  const { user, isAuthenticated, logout, loginDemo } = useAuth();
  const { isConnected } = useSocket();

  return (
    <header className="border-b border-slate-800 bg-[#0e131f]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top toolbar */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm">
        {/* Real-time sync badge */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
            }`}
            title={isConnected ? 'Connected to WebSocket server with instant real-time sync' : 'Reconnecting...'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {isConnected ? (
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Live Sync
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Connecting...
              </span>
            )}
          </div>
        </div>

        {/* View Switcher & Theme & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View tabs */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeView === 'list'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tasks</span>
            </button>
            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeView === 'board'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeView === 'analytics'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Analytics"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-amber-400 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-amber-500/50 bg-slate-800 object-cover"
                />
                <span className="text-xs font-medium text-slate-300 hidden md:inline max-w-[120px] truncate">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={loginDemo}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                <Sparkles className="w-3 h-3" /> Demo Mode
              </button>
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Brand Banner matching the reference video screenshot */}
      <div className="py-6 sm:py-8 text-center bg-gradient-to-b from-[#181f32] to-[#0e131f] border-t border-slate-800/80 shadow-inner">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Task<span className="text-amber-400 font-black">Buddy</span>
            </span>
          </div>
          <p className="text-slate-400 italic text-sm sm:text-base font-normal tracking-wide">
            Your friendly task manager
          </p>
        </div>
      </div>
    </header>
  );
}
