const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../middlewares/validators/auth.validator');
const { protect } = require('../middlewares/auth');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/login', (req, res) => {
  res.status(405).json({ 
    success: false, 
    message: 'Method Not Allowed. Please use POST for login.' 
  });
});
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password/:token', validateResetPassword, authController.resetPassword);
router.post('/logout', authController.logout);

// Profil işlemleri
router.put('/profile', protect, authController.updateProfile);
router.put('/profile/password', protect, authController.updatePassword);

module.exports = router;