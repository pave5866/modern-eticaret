import { create } from 'zustand'
import { authAPI } from '../services/index'
import { showToast } from '../utils/toast'
import { useCartStore } from './cartStore'

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  register: async (data) => {
    try {
      const response = await authAPI.register(data)
      const { data: { user, token } } = response

      if (user && token) {
        // Admin kullanıcı kaydı yapıldığında sepeti temizle
        if (user.role === 'admin') {
          const clearCart = useCartStore.getState().clearCart;
          clearCart();
        }
        
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      }
      
      return response
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Kayıt olurken bir hata oluştu')
      throw error
    }
  },

  login: async (data) => {
    try {
      const response = await authAPI.login(data.email, data.password);
      
      if (response && response.data) {
        // Veri yapısını kontrol et ve doğru şekilde çıkar
        let userData, tokenData;
        
        // Gelecek farklı API yanıt formatlarını kontrol et
        if (response.data.success === true && response.data.data) {
          // Backend yanıt yapısı: { success: true, data: { user: {...}, token: '...' } }
          userData = response.data.data.user;
          tokenData = response.data.data.token;
        } else if (response.data.token && response.data.user) {
          // Alternatif yanıt yapısı: { token: '...', user: {...} }
          userData = response.data.user;
          tokenData = response.data.token;
        } else if (response.data.data && response.data.token) {
          // Başka bir olası yapı: { data: {...}, token: '...' }
          userData = response.data.data;
          tokenData = response.data.token;
        } else if (response.data.user && response.data.token) {
          // AuthAPI'den gelen format: { user: {...}, token: '...' }
          userData = response.data.user;
          tokenData = response.data.token;
        }

        if (userData && tokenData) {
          // Admin kullanıcı giriş yaptığında sepeti temizle
          if (userData.role === 'admin') {
            const clearCart = useCartStore.getState().clearCart;
            clearCart();
          }
          
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', tokenData);
          set({ user: userData, token: tokenData, isAuthenticated: true });
          return response;
        }
      }
      
      throw new Error('Geçersiz sunucu yanıtı');
    } catch (error) {
      // Hata durumunda localStorge ve state temizle
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
      
      // FakeStore API ve yaygın hataları kontrol et
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Kullanıcı adı veya şifre hatalı');
        } else if (error.response.status === 400) {
          throw new Error('Kullanıcı adı ve şifre gereklidir');
        } else if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        } else {
          throw new Error('Giriş yapılamadı: ' + (error.response.statusText || 'Sunucu hatası'));
        }
      } else if (error.request) {
        throw new Error('Sunucuya bağlanılamadı, internet bağlantınızı kontrol edin');
      } else {
        throw error;
      }
    }
  },

  logout: async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Hata olsa bile devam et
    } finally {
      // Kullanıcı çıkış yaptığında sepeti temizle
      const clearCart = useCartStore.getState().clearCart;
      clearCart();
      
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  updateUser: async (data) => {
    try {
      const response = await authAPI.update(data)
      const updatedUser = response?.data?.user || response?.data || response?.user || response

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
        set({ user: updatedUser })
      }

      return response
    } catch (error) {
      throw error
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await authAPI.forgotPassword({ email })
      return response.data
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Bir hata oluştu')
      throw error
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, { password })
      return response.data
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Bir hata oluştu')
      throw error
    }
  }
}))