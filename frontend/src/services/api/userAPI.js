import axios from 'axios';

// Base URL tanımla - backend URL'i
const API_BASE_URL = '/api'; // veya process.env.REACT_APP_API_URL gibi bir çevre değişkeni kullanılabilir

// Tarayıcı önbelleğini agresif şekilde engelleyen headers
const addNoCacheHeaders = () => {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest',
    'If-Modified-Since': new Date(0).toUTCString(),
    'If-None-Match': 'no-match-for-this'
  };
};

// API çağrıları için temel axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tüm isteklere rastgele bir önbellek kırıcı parametre ekle
axiosInstance.interceptors.request.use(config => {
  // URL'ye rastgele bir parametre ekle
  const separator = config.url.includes('?') ? '&' : '?';
  config.url = `${config.url}${separator}_nocache=${Date.now()}-${Math.random()}`;
  return config;
});

// Kullanıcı API işlemleri
const userAPI = {
  getAll: async (params) => {
    try {
      // Önbellek karşıtı sorgu parametresi ekle
      if (params) {
        params.append('_nocache', `${Date.now()}-${Math.random()}`);
      }
      
      // Normal GET isteği kullan
      const response = await axiosInstance.get(`/users${params ? `?${params.toString()}` : ''}`, {
        headers: addNoCacheHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Kullanıcı verileri getirme hatası:', error);
      return { success: false, error: 'Kullanıcılar alınamadı' };
    }
  },
  
  updateRole: async (userId, role) => {
    try {
      const timestamp = Date.now();
      const randomToken = Math.random().toString(36).substring(2);
      
      // Normal PUT isteği
      const response = await axiosInstance.put(`/users/${userId}/role?_t=${timestamp}-${randomToken}`, { 
        role,
        _timestamp: timestamp,
      }, {
        headers: addNoCacheHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      return { success: false, error: 'Rol güncellenemedi' };
    }
  },
  
  // Önbelleği temizleme fonksiyonu (sadece client-side)
  invalidateCache: async () => {
    try {
      console.log('Client-side önbellek temizleniyor...');
      
      // Tarayıcı önbelleğini temizle
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }
      
      // LocalStorage'dan geçici verileri temizle
      localStorage.removeItem('needsRefresh');
      localStorage.removeItem('lastRoleChange');
      
      return { success: true };
    } catch (error) {
      console.error('Önbellek temizleme hatası:', error);
      return { success: false, error: error.message };
    }
  }
};

export default userAPI; 