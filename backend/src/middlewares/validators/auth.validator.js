const { body, param, validationResult } = require('express-validator');
const createError = require('http-errors');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = createError(400, 'Validation Error');
    error.errors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    return next(error);
  }
  next();
};

// Register validation
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('İsim alanı zorunludur')
    .isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalıdır')
    .isLength({ max: 50 }).withMessage('İsim en fazla 50 karakter olabilir'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email alanı zorunludur')
    .isEmail().withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Şifre alanı zorunludur')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  
  handleValidationErrors
];

// Login validation
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email alanı zorunludur')
    .isEmail().withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Şifre alanı zorunludur'),
  
  handleValidationErrors
];

// Forgot password validation
exports.validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email alanı zorunludur')
    .isEmail().withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),
  
  handleValidationErrors
];

// Reset password validation
exports.validateResetPassword = [
  param('token')
    .trim()
    .notEmpty().withMessage('Token gereklidir'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Şifre alanı zorunludur')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  
  handleValidationErrors
]; 