const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

// Register a new user
// POST /api/auth/register
router.post('/register', authController.register);

// Login user
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;