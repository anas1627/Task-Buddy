import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'taskbuddy.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'General', color: '#6366f1', icon: 'Folder' },
  { id: 'cat-2', name: 'Work', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'cat-3', name: 'Coding', color: '#10b981', icon: 'Code' },
  { id: 'cat-4', name: 'Study', color: '#8b5cf6', icon: 'BookOpen' },
  { id: 'cat-5', name: 'Personal', color: '#ec4899', icon: 'User' },
  { id: 'cat-6', name: 'Health', color: '#14b8a6', icon: 'Heart' }
];

const DEMO_USER_ID = 'demo-user-1';

function getInitialDatabase() {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);

  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    users: [
      {
        id: DEMO_USER_ID,
        name: 'Alex Johnson',
        email: 'demo@taskbuddy.app',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: now
      }
    ],
    categories: DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      userId: DEMO_USER_ID
    })),
    tasks: [
      {
        id: 'task-1',
        userId: DEMO_USER_ID,
        title: 'Task 2',
        description: 'Complete initial setup and verify modules',
        priority: 'medium',
        category: 'General',
        completed: false,
        dueDate: tomorrow,
        order: 1,
        subtasks: [
          { id: 'sub-1', title: 'Check project dependencies', completed: true },
          { id: 'sub-2', title: 'Verify environment variables', completed: false }
        ],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'task-2',
        userId: DEMO_USER_ID,
        title: 'Task 3',
        description: 'Refactor components and optimize styling',
        priority: 'medium',
        category: 'General',
        completed: false,
        dueDate: tomorrow,
        order: 2,
        subtasks: [
          { id: 'sub-3', title: 'Review Tailwind tokens', completed: false }
        ],
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
      },
      {
        id: 'task-3',
        userId: DEMO_USER_ID,
        title: 'Java DSA',
        description: 'Solve binary trees and graph traversal problems on LeetCode',
        priority: 'medium',
        category: 'General',
        completed: false,
        dueDate: nextWeek,
        order: 3,
        subtasks: [
          { id: 'sub-4', title: 'Binary Tree Invert', completed: true },
          { id: 'sub-5', title: 'Lowest Common Ancestor', completed: true },
          { id: 'sub-6', title: 'Dijkstra shortest path algorithm', completed: false }
        ],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'task-4',
        userId: DEMO_USER_ID,
        title: 'Design real-time synchronization engine',
        description: 'Configure Socket.io rooms and dispatch events for multi-client collaboration',
        priority: 'high',
        category: 'Coding',
        completed: true,
        dueDate: now.split('T')[0],
        order: 4,
        subtasks: [
          { id: 'sub-7', title: 'Setup WebSocket handshake', completed: true },
          { id: 'sub-8', title: 'Add room broadcasting', completed: true }
        ],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: now
      }
    ],
    activityLogs: [
      {
        id: 'act-1',
        userId: DEMO_USER_ID,
        action: 'CREATED',
        taskTitle: 'Java DSA',
        timestamp: now
      },
      {
        id: 'act-2',
        userId: DEMO_USER_ID,
        action: 'COMPLETED',
        taskTitle: 'Design real-time synchronization engine',
        timestamp: now
      }
    ]
  };
}

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialDatabase();
      this.write(initialData);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading DB, re-initializing...', err);
      const initial = getInitialDatabase();
      this.write(initial);
      return initial;
    }
  }

  write(data) {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- Users ---
  findUserByEmail(email) {
    const db = this.read();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    const db = this.read();
    return db.users.find(u => u.id === id);
  }

  createUser({ name, email, password }) {
    const db = this.read();
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      id,
      name,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);

    // Give new user default categories
    const userCategories = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: id
    }));
    db.categories.push(...userCategories);

    // Give new user reference seed tasks matching the video
    const sampleTasks = [
      {
        id: `task-${Date.now()}-1`,
        userId: id,
        title: 'Task 2',
        description: 'Get started with TaskBuddy essentials',
        priority: 'medium',
        category: 'General',
        completed: false,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        order: 1,
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-${Date.now()}-2`,
        userId: id,
        title: 'Task 3',
        description: 'Explore priorities, categories, and real-time updates',
        priority: 'medium',
        category: 'General',
        completed: false,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        order: 2,
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-${Date.now()}-3`,
        userId: id,
        title: 'Java DSA',
        description: 'Practice algorithms and complete data structures tracking',
        priority: 'medium',
        category: 'General',
        completed: false,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        order: 3,
        subtasks: [
          { id: 'sub-1', title: 'Binary Trees', completed: false },
          { id: 'sub-2', title: 'Graphs and BFS/DFS', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    db.tasks.push(...sampleTasks);

    this.write(db);
    return newUser;
  }

  // --- Tasks ---
  getTasks(userId, filters = {}) {
    const db = this.read();
    let tasks = db.tasks.filter(t => t.userId === userId);

    if (filters.status === 'completed') {
      tasks = tasks.filter(t => t.completed);
    } else if (filters.status === 'active') {
      tasks = tasks.filter(t => !t.completed);
    }

    if (filters.priority && filters.priority !== 'all') {
      tasks = tasks.filter(t => t.priority.toLowerCase() === filters.priority.toLowerCase());
    }

    if (filters.category && filters.category !== 'all') {
      tasks = tasks.filter(t => t.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sort
    if (filters.sortBy === 'dueDate') {
      tasks.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    } else if (filters.sortBy === 'priority') {
      const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
      tasks.sort((a, b) => (weight[b.priority.toLowerCase()] || 0) - (weight[a.priority.toLowerCase()] || 0));
    } else if (filters.sortBy === 'alphabetical') {
      tasks.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // default: by order or newest
      tasks.sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt));
    }

    return tasks;
  }

  getTaskStats(userId) {
    const db = this.read();
    const tasks = db.tasks.filter(t => t.userId === userId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    const byCategory = {};
    tasks.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    return { total, completed, active, percentage, byPriority, byCategory };
  }

  findTaskById(id, userId) {
    const db = this.read();
    return db.tasks.find(t => t.id === id && t.userId === userId);
  }

  createTask(userId, taskData) {
    const db = this.read();
    const userTasks = db.tasks.filter(t => t.userId === userId);
    const maxOrder = userTasks.reduce((max, t) => Math.max(max, t.order || 0), 0);

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      title: taskData.title.trim(),
      description: taskData.description ? taskData.description.trim() : '',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'General',
      completed: false,
      dueDate: taskData.dueDate || null,
      order: maxOrder + 1,
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.tasks.unshift(newTask);
    this.logActivity(db, userId, 'CREATED', newTask.title);
    this.write(db);
    return newTask;
  }

  updateTask(id, userId, updates) {
    const db = this.read();
    const index = db.tasks.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const oldTask = db.tasks[index];
    const updated = {
      ...oldTask,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    db.tasks[index] = updated;

    if (updates.completed !== undefined && updates.completed !== oldTask.completed) {
      this.logActivity(db, userId, updates.completed ? 'COMPLETED' : 'REOPENED', updated.title);
    } else {
      this.logActivity(db, userId, 'UPDATED', updated.title);
    }

    this.write(db);
    return updated;
  }

  deleteTask(id, userId) {
    const db = this.read();
    const index = db.tasks.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const deleted = db.tasks.splice(index, 1)[0];
    this.logActivity(db, userId, 'DELETED', deleted.title);
    this.write(db);
    return deleted;
  }

  clearCompletedTasks(userId) {
    const db = this.read();
    const remaining = db.tasks.filter(t => !(t.userId === userId && t.completed));
    const clearedCount = db.tasks.length - remaining.length;
    db.tasks = remaining;
    if (clearedCount > 0) {
      this.logActivity(db, userId, 'CLEARED_COMPLETED', `${clearedCount} completed tasks`);
    }
    this.write(db);
    return clearedCount;
  }

  clearAllTasks(userId) {
    const db = this.read();
    const remaining = db.tasks.filter(t => t.userId !== userId);
    const count = db.tasks.length - remaining.length;
    db.tasks = remaining;
    if (count > 0) {
      this.logActivity(db, userId, 'CLEARED_ALL', `All ${count} tasks`);
    }
    this.write(db);
    return count;
  }

  reorderTasks(userId, taskIds) {
    const db = this.read();
    const idMap = new Map();
    taskIds.forEach((id, index) => {
      idMap.set(id, index + 1);
    });

    db.tasks.forEach(task => {
      if (task.userId === userId && idMap.has(task.id)) {
        task.order = idMap.get(task.id);
      }
    });

    this.write(db);
    return true;
  }

  // --- Categories ---
  getCategories(userId) {
    const db = this.read();
    return db.categories.filter(c => c.userId === userId || !c.userId);
  }

  createCategory(userId, { name, color, icon }) {
    const db = this.read();
    const newCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      name: name.trim(),
      color: color || '#f59e0b',
      icon: icon || 'Tag'
    };
    db.categories.push(newCategory);
    this.write(db);
    return newCategory;
  }

  deleteCategory(id, userId) {
    const db = this.read();
    const index = db.categories.findIndex(c => c.id === id && c.userId === userId);
    if (index === -1) return false;
    db.categories.splice(index, 1);
    this.write(db);
    return true;
  }

  // --- Activity Logs ---
  logActivity(db, userId, action, taskTitle) {
    if (!db.activityLogs) db.activityLogs = [];
    const log = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      action,
      taskTitle,
      timestamp: new Date().toISOString()
    };
    db.activityLogs.unshift(log);
    // Keep last 50 logs per user
    db.activityLogs = db.activityLogs.slice(0, 100);
  }

  getActivityLogs(userId) {
    const db = this.read();
    return (db.activityLogs || []).filter(l => l.userId === userId).slice(0, 20);
  }
}

export const db = new Database();
