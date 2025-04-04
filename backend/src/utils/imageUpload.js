const logger = require('./logger');
const cloudinary = require('../config/cloudinary');

/**
 * Resim yükleme yardımcı fonksiyonu - Base64 kullanarak
 * @param {string} fileDataUrl - base64 formatında resim verisi
 * @returns {Promise<string>} - Yüklenen resmin URL'i
 */
const uploadImage = async (fileDataUrl) => {
  try {
    logger.debug('Resim yükleme isteği başladı');
    
    // En basit konfigürasyonla yükleme yapılıyor - hiçbir ekstra parametre belirtmeden
    const uploadResult = await cloudinary.uploader.upload(fileDataUrl);
    
    logger.debug('Resim yükleme başarılı', { 
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url
    });
    
    return uploadResult.secure_url;
  } catch (error) {
    logger.error('Resim yükleme hatası:', { 
      error: error.message, 
      errorName: error.name 
    });
    throw new Error(`Cloudinary resim yükleme hatası: ${error.message}`);
  }
};

/**
 * Buffer'dan base64'e dönüştürme ve yükleme
 * @param {Buffer} buffer - Resim buffer'ı
 * @param {string} mimetype - Dosya MIME tipi
 * @returns {Promise<string>} - Yüklenen resmin URL'i
 */
const uploadImageBuffer = async (buffer, mimetype = 'image/jpeg') => {
  try {
    // Buffer'ı base64'e dönüştür
    const base64 = buffer.toString('base64');
    const dataURI = `data:${mimetype};base64,${base64}`;
    
    // Base64'ü Cloudinary'ye yükle
    return await uploadImage(dataURI);
  } catch (error) {
    logger.error('Buffer resim yükleme hatası:', { error: error.message });
    throw new Error(`Resim yükleme hatası: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  uploadImageBuffer
};