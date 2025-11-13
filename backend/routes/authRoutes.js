const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authController.getProfile);
router.post('/logout', authController.logout);

module.exports = router;
