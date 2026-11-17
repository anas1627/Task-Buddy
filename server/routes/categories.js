import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

export function createCategoriesRouter(io) {
  const router = express.Router();
  router.use(authMiddleware);

  // GET /api/categories
  router.get('/', (req, res) => {
    try {
      const categories = db.getCategories(req.user.id);
      return res.json({ categories });
    } catch (err) {
      console.error('Fetch categories error:', err);
      return res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  });

  // POST /api/categories
  router.post('/', (req, res) => {
    try {
      const { name, color, icon } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const newCategory = db.createCategory(req.user.id, { name, color, icon });

      if (io) {
        io.to(`user:${req.user.id}`).emit('category_created', newCategory);
      }

      return res.status(201).json({
        message: 'Category created successfully',
        category: newCategory
      });
    } catch (err) {
      console.error('Create category error:', err);
      return res.status(500).json({ error: 'Failed to create category' });
    }
  });

  // DELETE /api/categories/:id
  router.delete('/:id', (req, res) => {
    try {
      const success = db.deleteCategory(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ error: 'Category not found or cannot be deleted' });
      }

      if (io) {
        io.to(`user:${req.user.id}`).emit('category_deleted', { id: req.params.id });
      }

      return res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      console.error('Delete category error:', err);
      return res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  return router;
}
