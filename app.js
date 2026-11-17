/**
 * TaskBuddy — Interactive JavaScript Engine
 * "Your friendly task manager"
 */

(function () {
  'use strict';

  // --- Initial Default Tasks (Matching user reference video) ---
  const DEFAULT_TASKS = [
    {
      id: 'task-1',
      title: 'Task 2',
      priority: 'Medium',
      category: 'General',
      completed: false,
      createdAt: Date.now() - 3600000 * 2
    },
    {
      id: 'task-2',
      title: 'Task 3',
      priority: 'Medium',
      category: 'General',
      completed: false,
      createdAt: Date.now() - 3600000 * 1
    },
    {
      id: 'task-3',
      title: 'Java DSA',
      priority: 'Medium',
      category: 'General',
      completed: false,
      createdAt: Date.now()
    }
  ];

  // --- State ---
  let tasks = loadTasks();
  let currentFilter = 'all';
  let searchQuery = '';
  let taskToEdit = null;

  // --- DOM Elements ---
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const categorySelect = document.getElementById('categorySelect');
  const tasksList = document.getElementById('tasksList');
  const emptyState = document.getElementById('emptyState');
  const progressCounter = document.getElementById('progressCounter');
  const progressBarFill = document.getElementById('progressBarFill');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.querySelectorAll('.pill-btn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Modals
  const editModal = document.getElementById('editModal');
  const editTaskForm = document.getElementById('editTaskForm');
  const editTaskInput = document.getElementById('editTaskInput');
  const editPrioritySelect = document.getElementById('editPrioritySelect');
  const editCategorySelect = document.getElementById('editCategorySelect');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  const confirmModal = document.getElementById('confirmModal');
  const confirmClearBtn = document.getElementById('confirmClearBtn');
  const cancelClearBtn = document.getElementById('cancelClearBtn');
  const closeConfirmModalBtn = document.getElementById('closeConfirmModalBtn');

  // --- Initialization ---
  initTheme();
  renderTasks();

  // --- Event Listeners ---
  taskForm.addEventListener('submit', handleAddTask);
  clearAllBtn.addEventListener('click', () => openModal(confirmModal));
  confirmClearBtn.addEventListener('click', handleClearAll);
  cancelClearBtn.addEventListener('click', () => closeModal(confirmModal));
  closeConfirmModalBtn.addEventListener('click', () => closeModal(confirmModal));

  // Edit Modal events
  editTaskForm.addEventListener('submit', handleSaveEdit);
  closeEditModalBtn.addEventListener('click', () => closeModal(editModal));
  cancelEditBtn.addEventListener('click', () => closeModal(editModal));

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderTasks();
  });

  // Filter Pills
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderTasks();
    });
  });

  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Close modals on clicking backdrop or Esc
  window.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal(editModal);
    if (e.target === confirmModal) closeModal(confirmModal);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(editModal);
      closeModal(confirmModal);
    }
  });

  // --- Handlers ---

  function handleAddTask(e) {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    const newTask = {
      id: 'task-' + Date.now(),
      title: title,
      priority: prioritySelect.value,
      category: categorySelect.value,
      completed: false,
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();

    // Reset input
    taskInput.value = '';
    taskInput.focus();
  }

  function handleToggleComplete(id) {
    tasks = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) triggerConfetti();
        return { ...t, completed: nextState };
      }
      return t;
    });

    saveTasks();
    renderTasks();
  }

  function handleDeleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
  }

  function handleOpenEdit(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    taskToEdit = task;
    editTaskInput.value = task.title;
    editPrioritySelect.value = task.priority;
    editCategorySelect.value = task.category;

    openModal(editModal);
    editTaskInput.focus();
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!taskToEdit) return;

    const updatedTitle = editTaskInput.value.trim();
    if (!updatedTitle) return;

    tasks = tasks.map((t) => {
      if (t.id === taskToEdit.id) {
        return {
          ...t,
          title: updatedTitle,
          priority: editPrioritySelect.value,
          category: editCategorySelect.value
        };
      }
      return t;
    });

    saveTasks();
    renderTasks();
    closeModal(editModal);
  }

  function handleClearAll() {
    tasks = [];
    saveTasks();
    renderTasks();
    closeModal(confirmModal);
  }

  // --- Rendering ---

  function renderTasks() {
    // Filter
    let filtered = tasks.filter((t) => {
      if (currentFilter === 'active' && t.completed) return false;
      if (currentFilter === 'completed' && !t.completed) return false;
      if (searchQuery) {
        const matchTitle = t.title.toLowerCase().includes(searchQuery);
        const matchCat = t.category.toLowerCase().includes(searchQuery);
        const matchPri = t.priority.toLowerCase().includes(searchQuery);
        if (!matchTitle && !matchCat && !matchPri) return false;
      }
      return true;
    });

    // Update Progress
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressCounter.textContent = `${completed} of ${total} tasks completed`;
    progressBarFill.style.width = `${pct}%`;
    clearAllBtn.disabled = total === 0;

    // Render list items
    tasksList.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';

      filtered.forEach((task) => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.dataset.id = task.id;

        item.innerHTML = `
          <div class="task-info">
            <button class="task-checkbox ${task.completed ? 'checked' : ''}" aria-label="Toggle completed">
              ${task.completed ? '✓' : ''}
            </button>
            <div class="task-content">
              <div class="task-title-row">
                <span class="task-text">${escapeHtml(task.title)}</span>
                <span class="task-meta-tag">(${escapeHtml(task.priority)}, ${escapeHtml(task.category)})</span>
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-action btn-action-edit" title="Edit Task">Edit</button>
            <button class="btn-action btn-action-complete">${task.completed ? 'Reopen' : 'Complete'}</button>
            <button class="btn-action btn-action-delete">Delete</button>
          </div>
        `;

        // Action attachments
        const checkbox = item.querySelector('.task-checkbox');
        const completeBtn = item.querySelector('.btn-action-complete');
        const deleteBtn = item.querySelector('.btn-action-delete');
        const editBtn = item.querySelector('.btn-action-edit');

        checkbox.addEventListener('click', () => handleToggleComplete(task.id));
        completeBtn.addEventListener('click', () => handleToggleComplete(task.id));
        deleteBtn.addEventListener('click', () => handleDeleteTask(task.id));
        editBtn.addEventListener('click', () => handleOpenEdit(task.id));

        tasksList.appendChild(item);
      });
    }
  }

  // --- Modals Helper ---
  function openModal(modal) {
    modal.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
  }

  // --- LocalStorage ---
  function loadTasks() {
    try {
      const saved = localStorage.getItem('taskbuddy_html_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load tasks from localStorage:', e);
    }
    return DEFAULT_TASKS;
  }

  function saveTasks() {
    try {
      localStorage.setItem('taskbuddy_html_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('Could not save tasks to localStorage:', e);
    }
  }

  // --- Theme ---
  function initTheme() {
    const savedTheme = localStorage.getItem('taskbuddy_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('taskbuddy_theme', next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    if (themeToggleBtn) {
      themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }

  // --- Confetti Celebration ---
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }

  // Helper
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
