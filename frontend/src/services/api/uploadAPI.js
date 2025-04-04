import { api } from '../api';
import logger from '../../utils/logger';

// Resim yükleme için özel yardımcı fonksiyonlar
export const uploadAPI = {
  // Tek resim yükleme
  uploadImage: async (file) => {
    try {
      logger.info('Tek resim yükleme başlatılıyor', { fileName: file.name, size: file.size });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      logger.info('Resim yükleme başarılı', { url: response.data.data.url });
      return response.data;
    } catch (error) {
      logger.error('Resim yükleme hatası', { error: error.message, file: file.name });
      throw error;
    }
  },
  
  // Çoklu resim yükleme
  uploadImages: async (files) => {
    try {
      logger.info('Çoklu resim yükleme başlatılıyor', { fileCount: files.length });
      
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      const response = await api.post('/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      logger.info('Çoklu resim yükleme başarılı', { urlCount: response.data.data.urls.length });
      return response.data;
    } catch (error) {
      logger.error('Çoklu resim yükleme hatası', { error: error.message, fileCount: files.length });
      throw error;
    }
  },
  
  // Base64 formatında resim yükleme (alternatif yöntem)
  uploadBase64Image: async (base64Data, fileName = 'image.jpg') => {
    try {
      logger.info('Base64 resim yükleme başlatılıyor', { fileName });
      
      const response = await api.post('/uploads/base64', {
        image: base64Data,
        name: fileName
      });
      
      logger.info('Base64 resim yükleme başarılı', { url: response.data.data.url });
      return response.data;
    } catch (error) {
      logger.error('Base64 resim yükleme hatası', { error: error.message });
      throw error;
    }
  },
  
  // URL'den resim yükleme (alternatif yöntem)
  uploadImageFromUrl: async (imageUrl) => {
    try {
      logger.info('URL\'den resim yükleme başlatılıyor', { imageUrl });
      
      const response = await api.post('/uploads/url', {
        url: imageUrl
      });
      
      logger.info('URL\'den resim yükleme başarılı', { url: response.data.data.url });
      return response.data;
    } catch (error) {
      logger.error('URL\'den resim yükleme hatası', { error: error.message, url: imageUrl });
      throw error;
    }
  },
  
  // Resim silme
  deleteImage: async (publicId) => {
    try {
      logger.info('Resim silme işlemi başlatılıyor', { publicId });
      
      const response = await api.delete(`/uploads/image/${publicId}`);
      
      logger.info('Resim silme başarılı', { publicId });
      return response.data;
    } catch (error) {
      logger.error('Resim silme hatası', { error: error.message, publicId });
      throw error;
    }
  }
};

export default uploadAPI;