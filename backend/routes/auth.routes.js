import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
router.post('/register', register);

// @desc    Login user
// @route   POST /auth/login
// @access  Public
router.post('/login', login);

// @desc    Get user profile
// @route   GET /auth/profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @desc    Test protected route
// @route   GET /auth/protected
// @access  Private
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed a protected route!',
    user: req.user
  });
});

export default router;