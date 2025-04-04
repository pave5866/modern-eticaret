const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { protect, authorize } = require('../middlewares/auth');

// Protected routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(settingsController.getSettings)
  .put(settingsController.updateSettings);

module.exports = router; 