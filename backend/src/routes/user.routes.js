const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const userController = require('../controllers/user.controller');

// Kullanıcı profil işlemleri
router.use(protect);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/profile/password', userController.updatePassword);

// Admin işlemleri
router.use(authorize('admin'));
router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router; 