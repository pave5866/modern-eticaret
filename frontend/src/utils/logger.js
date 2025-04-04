/**
 * Frontend için güvenli bir logger modülü
 * Üretim ortamında logları kapatabilir veya sadece belirli seviyeleri gösterebiliriz
 */

import pino from 'pino';

// Varsayılan log seviyesi
const defaultLevel = import.meta.env.PROD ? 'warn' : 'info';

// Loglama ayarları
const logger = pino({
  level: import.meta.env.VITE_LOG_LEVEL || defaultLevel,
  browser: {
    asObject: true,
    transmit: {
      level: 'error',
      send: () => {}
    }
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
  enabled: import.meta.env.MODE !== 'test',
  base: undefined
});

// Sadece production olmayan ortamlarda konsola çıktı verecek logger
const productionSafeLogger = {
  debug: (message, ...args) => {
    if (!import.meta.env.PROD) {
      logger.debug(message, ...args);
    }
  },
  info: (message, ...args) => {
    if (!import.meta.env.PROD) {
      logger.info(message, ...args);
    }
  },
  warn: (message, ...args) => {
    logger.warn(message, ...args);
  },
  error: (message, ...args) => {
    logger.error(message, ...args);
  }
};

export default productionSafeLogger;