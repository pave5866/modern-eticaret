import api from '../api';

const authAPI = {
  /**
   * Kullanıcı girişi yapar
   * @param {string} email - Kullanıcı e-posta adresi
   * @param {string} password - Kullanıcı şifresi
   * @returns {Promise} - Başarılı giriş sonrası kullanıcı bilgileri ve token
   */
  login: async (email, password) => {
    try {
      // FakeStore API endpoint'i
      const response = await api.post('/auth/login', { 
        username: email, // FakeStore API "username" bekliyor, email değil
        password: password 
      });
      
      // Başarılı giriş, token'ı localStorage'a kaydet
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Kullanıcı verisi olmadığından basit bir kullanıcı nesnesi oluştur
        const userData = {
          id: 1,
          email: email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          role: 'user'
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        return {
          data: {
            user: userData,
            token: response.data.token
          }
        };
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Kullanıcı kaydı yapar
   * @param {Object} userData - Kullanıcı kayıt bilgileri
   * @returns {Promise} - Başarılı kayıt sonrası kullanıcı bilgileri
   */
  register: async (userData) => {
    try {
      // FakeStore API için
      const response = await api.post('/users', {
        email: userData.email,
        username: userData.email.split('@')[0],
        password: userData.password,
        name: {
          firstname: userData.firstName || userData.name || userData.email.split('@')[0],
          lastname: userData.lastName || userData.email.split('@')[0]
        },
        phone: userData.phone || '555-5555'
      });
      
      // Başarılı kayıt, token üretiyoruz (FakeStore API token dönmüyor)
      const mockToken = `mock-token-${Date.now()}`;
      
      // Kullanıcı nesnesini oluştur
      const user = {
        id: response.data.id || Date.now(),
        email: userData.email,
        username: userData.email.split('@')[0],
        name: userData.firstName || userData.name || userData.email.split('@')[0],
        role: 'user'
      };
      
      return {
        data: {
          user: user,
          token: mockToken
        }
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Şifre sıfırlama e-postası gönderir
   * @param {string} email - Kullanıcı e-posta adresi
   * @returns {Promise} - Başarılı istek sonrası onay mesajı
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Şifre sıfırlama işlemini tamamlar
   * @param {string} token - Şifre sıfırlama token'ı
   * @param {string} password - Yeni şifre
   * @returns {Promise} - Başarılı sıfırlama sonrası onay mesajı
   */
  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/api/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Kullanıcıyı sistemden çıkarır
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Mevcut oturumun durumunu kontrol eder ve kullanıcı bilgisini sağlar
   * @returns {Object|null} - Oturum açılmışsa kullanıcı bilgisi, değilse null
   */
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        return null;
      }
      
      return JSON.parse(user);
    } catch (error) {
      return null;
    }
  },

  /**
   * JWT token'ının geçerli olup olmadığını API'ye sorarak kontrol eder
   * @returns {Promise<boolean>} - Token geçerliyse true, değilse false
   */
  verifyToken: async () => {
    try {
      const response = await api.get('/api/auth/verify');
      return response.data.valid === true;
    } catch (error) {
      return false;
    }
  }
};

export default authAPI;