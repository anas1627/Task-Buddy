import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

export function createTasksRouter(io) {
  const router = express.Router();
  router.use(authMiddleware);

  // Helper to broadcast to user's private socket room
  const broadcastUserEvent = (userId, event, payload) => {
    if (io) {
      io.to(`user:${userId}`).emit(event, payload);
      // also send updated stats
      const stats = db.getTaskStats(userId);
      io.to(`user:${userId}`).emit('stats_updated', stats);
    }
  };

  // GET /api/tasks - List tasks with filters & search
  router.get('/', (req, res) => {
    try {
      const { status, priority, category, search, sortBy } = req.query;
      const tasks = db.getTasks(req.user.id, { status, priority, category, search, sortBy });
      return res.json({ tasks });
    } catch (err) {
      console.error('Fetch tasks error:', err);
      return res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
  });

  // GET /api/tasks/stats - Get summary numbers and completion percentage
  router.get('/stats', (req, res) => {
    try {
      const stats = db.getTaskStats(req.user.id);
      return res.json({ stats });
    } catch (err) {
      console.error('Stats error:', err);
      return res.status(500).json({ error: 'Failed to compute task statistics' });
    }
  });

  // GET /api/tasks/activity - Get recent real-time activity stream
  router.get('/activity', (req, res) => {
    try {
      const activity = db.getActivityLogs(req.user.id);
      return res.json({ activity });
    } catch (err) {
      console.error('Activity logs error:', err);
      return res.status(500).json({ error: 'Failed to retrieve activity history' });
    }
  });

  // POST /api/tasks - Create task
  router.post('/', (req, res) => {
    try {
      const { title, description, priority, category, dueDate, subtasks } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      const newTask = db.createTask(req.user.id, {
        title,
        description,
        priority,
        category,
        dueDate,
        subtasks
      });

      broadcastUserEvent(req.user.id, 'task_created', newTask);

      return res.status(201).json({
        message: 'Task created successfully',
        task: newTask
      });
    } catch (err) {
      console.error('Create task error:', err);
      return res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // GET /api/tasks/:id - Single task
  router.get('/:id', (req, res) => {
    try {
      const task = db.findTaskById(req.params.id, req.user.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.json({ task });
    } catch (err) {
      console.error('Get task error:', err);
      return res.status(500).json({ error: 'Failed to get task' });
    }
  });

  // PUT /api/tasks/:id - Update full task or fields
  router.put('/:id', (req, res) => {
    try {
      const { title, description, priority, category, completed, dueDate, subtasks, order } = req.body;

      const updates = {};
      if (title !== undefined) updates.title = title.trim();
      if (description !== undefined) updates.description = description;
      if (priority !== undefined) updates.priority = priority;
      if (category !== undefined) updates.category = category;
      if (completed !== undefined) updates.completed = Boolean(completed);
      if (dueDate !== undefined) updates.dueDate = dueDate;
      if (subtasks !== undefined) updates.subtasks = subtasks;
      if (order !== undefined) updates.order = order;

      const updatedTask = db.updateTask(req.params.id, req.user.id, updates);
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      broadcastUserEvent(req.user.id, 'task_updated', updatedTask);

      return res.json({
        message: 'Task updated successfully',
        task: updatedTask
      });
    } catch (err) {
      console.error('Update task error:', err);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  });

  // PATCH /api/tasks/:id/toggle - Toggle completed state
  router.patch('/:id/toggle', (req, res) => {
    try {
      const task = db.findTaskById(req.params.id, req.user.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updatedTask = db.updateTask(req.params.id, req.user.id, {
        completed: !task.completed
      });

      broadcastUserEvent(req.user.id, 'task_updated', updatedTask);

      return res.json({
        message: updatedTask.completed ? 'Task marked as completed' : 'Task reopened',
        task: updatedTask
      });
    } catch (err) {
      console.error('Toggle task error:', err);
      return res.status(500).json({ error: 'Failed to toggle task' });
    }
  });

  // DELETE /api/tasks/:id - Delete single task
  router.delete('/:id', (req, res) => {
    try {
      const deleted = db.deleteTask(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
      }

      broadcastUserEvent(req.user.id, 'task_deleted', { id: req.params.id, task: deleted });

      return res.json({
        message: 'Task deleted successfully',
        task: deleted
      });
    } catch (err) {
      console.error('Delete task error:', err);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // POST /api/tasks/clear-completed - Clear all completed tasks
  router.post('/clear-completed', (req, res) => {
    try {
      const count = db.clearCompletedTasks(req.user.id);
      broadcastUserEvent(req.user.id, 'tasks_cleared', { type: 'completed', count });
      return res.json({
        message: `Cleared ${count} completed tasks`,
        count
      });
    } catch (err) {
      console.error('Clear completed error:', err);
      return res.status(500).json({ error: 'Failed to clear completed tasks' });
    }
  });

  // POST /api/tasks/clear-all - The iconic "Clear All Tasks" button from TaskBuddy reference
  router.post('/clear-all', (req, res) => {
    try {
      const count = db.clearAllTasks(req.user.id);
      broadcastUserEvent(req.user.id, 'tasks_cleared', { type: 'all', count });
      return res.json({
        message: 'All tasks have been cleared',
        count
      });
    } catch (err) {
      console.error('Clear all error:', err);
      return res.status(500).json({ error: 'Failed to clear all tasks' });
    }
  });

  // POST /api/tasks/reorder - Drag & drop or custom sorting order
  router.post('/reorder', (req, res) => {
    try {
      const { taskIds } = req.body;
      if (!Array.isArray(taskIds)) {
        return res.status(400).json({ error: 'taskIds array is required' });
      }

      db.reorderTasks(req.user.id, taskIds);
      broadcastUserEvent(req.user.id, 'tasks_reordered', { taskIds });

      return res.json({ message: 'Tasks reordered successfully' });
    } catch (err) {
      console.error('Reorder tasks error:', err);
      return res.status(500).json({ error: 'Failed to reorder tasks' });
    }
  });

  // POST /api/tasks/import - Import list of tasks (e.g. from backup JSON)
  router.post('/import', (req, res) => {
    try {
      const { tasks } = req.body;
      if (!Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Tasks array is required' });
      }

      const imported = [];
      for (const t of tasks) {
        if (t.title) {
          const newTask = db.createTask(req.user.id, {
            title: t.title,
            description: t.description || '',
            priority: t.priority || 'medium',
            category: t.category || 'General',
            dueDate: t.dueDate || null,
            subtasks: t.subtasks || []
          });
          imported.push(newTask);
        }
      }

      broadcastUserEvent(req.user.id, 'tasks_imported', { count: imported.length });

      return res.json({
        message: `Successfully imported ${imported.length} tasks`,
        count: imported.length
      });
    } catch (err) {
      console.error('Import error:', err);
      return res.status(500).json({ error: 'Failed to import tasks' });
    }
  });

  return router;
}
