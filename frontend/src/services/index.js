import api, { 
  productAPI, 
  userAPI, 
  orderAPI, 
  logAPI, 
  addressAPI, 
  adminAPI, 
  reviewAPI 
} from './api';

// API services
const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  update: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export { 
  api, 
  productAPI, 
  userAPI, 
  authAPI, 
  orderAPI, 
  logAPI,
  addressAPI,
  adminAPI,
  reviewAPI
};