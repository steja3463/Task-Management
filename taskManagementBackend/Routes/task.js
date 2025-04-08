const express = require('express');
const router = express.Router();
const taskController = require('../Controllers/taskController');
const auth = require('../Middleware/auth');

// Apply authentication middleware to all task routes
router.use(auth);

// Create a new task
// POST /api/tasks
router.post('/', taskController.createTask);

// Get all tasks for the logged-in user
// GET /api/tasks
router.get('/', taskController.getAllTasks);

// Get a specific task
// GET /api/tasks/:id
router.get('/:id', taskController.getTaskById);

// Update a task
// PUT /api/tasks/:id
router.put('/:id', taskController.updateTask);

// Delete a task
// DELETE /api/tasks/:id
router.delete('/:id', taskController.deleteTask);

module.exports = router;