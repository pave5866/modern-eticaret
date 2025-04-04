const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboard.controller');

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', dashboardController.getDashboardStats);
router.post('/reset-database', dashboardController.resetDatabase);

module.exports = router; 