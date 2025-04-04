const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Frontend loglarını almak için endpoint
router.post('/', (req, res) => {
  const { level, message, meta, source, timestamp } = req.body;
  
  // Log seviyesine göre uygun logger metodunu çağır
  if (level === 'error') {
    logger.error(`[${source}] ${message}`, meta);
  } else if (level === 'warn') {
    logger.warn(`[${source}] ${message}`, meta);
  } else if (level === 'info') {
    logger.info(`[${source}] ${message}`, meta);
  } else {
    logger.debug(`[${source}] ${message}`, meta);
  }
  
  // Başarılı yanıt dön
  res.status(200).json({ success: true });
});

module.exports = router; 