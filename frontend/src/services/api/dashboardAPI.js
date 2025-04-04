import api from '../api'
import logger from '../../utils/logger'

export const dashboardAPI = {
  getStats: async (timeFilter = 'week') => {
    try {
      logger.info('Dashboard istatistikleri alınıyor', { timeFilter });
      const response = await api.get(`/dashboard/stats?timeFilter=${timeFilter}`);
      return response;
    } catch (error) {
      logger.error('Dashboard istatistikleri alınırken hata oluştu', {
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },
  
  resetDatabase: async () => {
    try {
      logger.info('Veritabanı sıfırlama isteği gönderiliyor');
      const response = await api.post('/dashboard/reset-database');
      return response;
    } catch (error) {
      logger.error('Veritabanı sıfırlanırken hata oluştu', {
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  }
}