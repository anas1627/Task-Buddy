import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { ProgressBar } from './components/ProgressBar';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskBoard } from './components/TaskBoard';
import { TaskAnalytics } from './components/TaskAnalytics';
import { EditTaskModal } from './components/EditTaskModal';
import { ClearAllModal } from './components/ClearAllModal';
import { AuthModal } from './components/AuthModal';
import { NotificationToast } from './components/NotificationToast';
import { Sparkles, CheckCircle2, ListOrdered } from 'lucide-react';

export function App() {
  const { user, token, isAuthenticated, loginDemo } = useAuth();
  const { socket, isConnected } = useSocket();

  // Navigation & View
  const [activeView, setActiveView] = useState('list');
  const [isDark, setIsDark] = useState(true);

  // Tasks & Categories State
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Modals & Toasts
  const [editingTask, setEditingTask] = useState(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastDeletedTask, setLastDeletedTask] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync theme class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auto login to demo if no session exists so the user immediately gets a live, working experience
  useEffect(() => {
    if (!token && !isAuthenticated) {
      loginDemo().catch(err => console.log('Demo auto-init note:', err.message));
    }
  }, [token, isAuthenticated]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchCategories();
    }
  }, [token, fetchTasks, fetchCategories]);

  // WebSocket real-time event listeners
  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => {
        if (prev.some(t => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
      setToast({
        title: 'Task Created',
        message: `"${newTask.title}" was added in real-time.`
      });
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleTaskDeleted = ({ id, task }) => {
      setTasks((prev) => prev.filter(t => t.id !== id));
    };

    const handleTasksCleared = ({ type, count }) => {
      if (type === 'completed') {
        setTasks((prev) => prev.filter(t => !t.completed));
        setToast({ title: 'Tasks Cleared', message: `Cleared ${count} completed tasks.` });
      } else {
        setTasks([]);
        setToast({ title: 'All Tasks Cleared', message: 'All tasks have been removed.' });
      }
    };

    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);
    socket.on('tasks_cleared', handleTasksCleared);

    return () => {
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
      socket.off('tasks_cleared', handleTasksCleared);
    };
  }, [socket]);

  // --- CRUD Handlers ---

  const handleAddTask = async (taskData) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }

    const data = await res.json();
    setTasks(prev => {
      if (prev.some(t => t.id === data.task.id)) return prev;
      return [data.task, ...prev];
    });
  };

  const handleToggleComplete = async (taskId) => {
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        // Rollback on failure
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setLastDeletedTask(taskToDelete);

    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== taskId));

    setToast({
      title: 'Task Deleted',
      message: `"${taskToDelete?.title || 'Task'}" deleted.`,
      canUndo: true
    });

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchTasks();
    }
  };

  const handleUndoDelete = async () => {
    if (!lastDeletedTask) return;
    const restored = { ...lastDeletedTask };
    delete restored.id;
    setLastDeletedTask(null);
    setToast(null);

    await handleAddTask(restored);
  };

  const handleSaveEdit = async (taskId, updates) => {
    // Optimistic update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updates } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      fetchTasks();
    }
  };

  const handleUpdateSubtask = async (taskId, subtaskId, completed) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = (targetTask.subtasks || []).map(s =>
      s.id === subtaskId ? { ...s, completed } : s
    );

    handleSaveEdit(taskId, { subtasks: updatedSubtasks });
  };

  const handleClearCompleted = async () => {
    setTasks(prev => prev.filter(t => !t.completed));
    try {
      await fetch('/api/tasks/clear-completed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to clear completed tasks:', err);
      fetchTasks();
    }
  };

  const handleClearAll = async () => {
    setTasks([]);
    try {
      await fetch('/api/tasks/clear-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to clear all tasks:', err);
      fetchTasks();
    }
  };

  const handleImportTasks = async (importedTasks) => {
    try {
      const res = await fetch('/api/tasks/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tasks: importedTasks })
      });
      if (res.ok) {
        fetchTasks();
        setToast({
          title: 'Import Successful',
          message: `Imported ${importedTasks.length} tasks.`
        });
      }
    } catch (err) {
      console.error('Failed to import tasks:', err);
    }
  };

  // Filter & Search computation
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (activeFilter === 'completed' && !task.completed) return false;
    if (activeFilter === 'active' && task.completed) return false;

    // Category filter
    if (selectedCategory !== 'all' && (task.category || 'General').toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Priority filter
    if (selectedPriority !== 'all' && (task.priority || 'medium').toLowerCase() !== selectedPriority.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = task.title.toLowerCase().includes(q);
      const inDesc = task.description && task.description.toLowerCase().includes(q);
      if (!inTitle && !inDesc) return false;
    }

    return true;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    }
    if (sortBy === 'priority') {
      const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (weights[b.priority] || 0) - (weights[a.priority] || 0);
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return (a.order || 0) - (b.order || 0);
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Header & Hero */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container matching TaskBuddy layout */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Main Task Creator Bar */}
        <TaskInput
          onAddTask={handleAddTask}
          categories={categories}
        />

        {/* View Switch Rendering */}
        {activeView === 'list' && (
          <div>
            {/* Filter & Search Bar */}
            <TaskFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={categories}
              tasks={tasks}
              onImportTasks={handleImportTasks}
            />

            {/* Task Item List */}
            <div className="space-y-2.5">
              {loading && tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-2" />
                  <span>Loading tasks...</span>
                </div>
              ) : sortedTasks.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-[#121824]/50">
                  <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-300 font-semibold text-sm">No tasks found</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                      ? 'Try resetting the filters or search keywords above.'
                      : 'Type a task in the box above and click "Add Task" to get started!'}
                  </p>
                </div>
              ) : (
                sortedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onEdit={(t) => setEditingTask(t)}
                    onUpdateSubtask={handleUpdateSubtask}
                  />
                ))
              )}
            </div>

            {/* Progress summary & Clear All Tasks button */}
            <ProgressBar
              total={totalTasks}
              completed={completedTasks}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              onClearAllClick={() => setIsClearAllModalOpen(true)}
              onClearCompleted={handleClearCompleted}
            />
          </div>
        )}

        {activeView === 'board' && (
          <TaskBoard
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onEdit={(t) => setEditingTask(t)}
          />
        )}

        {activeView === 'analytics' && (
          <TaskAnalytics tasks={tasks} />
        )}
      </main>

      {/* Modals & Notifications */}
      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
        categories={categories}
      />

      <ClearAllModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleClearAll}
        totalTasks={totalTasks}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <NotificationToast
        toast={toast}
        onUndo={handleUndoDelete}
        onClose={() => setToast(null)}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>TaskBuddy • Full-Stack Task Management System with Real-Time WebSockets</p>
      </footer>
    </div>
  );
}

export default App;
