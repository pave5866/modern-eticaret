const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/address.controller');

router.use(protect); // Tüm adres rotaları için auth gerekli

router.route('/')
  .get(getMyAddresses)
  .post(createAddress);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

module.exports = router; 