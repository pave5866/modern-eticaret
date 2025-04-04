// Request interceptor
api.interceptors.request.use(
  (config) => {
    // LocalStorage'dan token'ı al
    const token = localStorage.getItem('token');
    
    // Token varsa header'a ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); 