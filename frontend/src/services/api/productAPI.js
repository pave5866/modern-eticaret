import api from '../api'

export const productAPI = {
  getAll: async (params) => {
    const response = await api.get('/products', params)
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  
  getByCategory: async (category, limit = 10, skip = 0) => {
    const response = await api.get('/products', { 
      params: { category, limit, skip } 
    })
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/products/categories')
    return response.data
  },

  create: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  update: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
  
  search: async (query) => {
    const response = await api.get('/products/search', { params: { q: query } })
    return response.data
  }
}