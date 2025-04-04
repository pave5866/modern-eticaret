/**
 * HTTP isteği ile admin kullanıcısı oluşturma script'i
 * 
 * Bu script, backend API'ye HTTP isteği göndererek admin rolüne sahip bir kullanıcı ekler.
 * Kullanım: node createAdminUserHttp.js
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '../.env') });

// API URL
const API_URL = process.env.API_URL || 'https://modern-ecommerce-fullstack.onrender.com/api';

// Admin kullanıcı bilgileri
const adminUser = {
  name: 'Kadir ERDEM',
  email: 'kerdem5866@gmail.com',
  password: 'Salako5866.',
  role: 'admin'
};

// Admin kullanıcısını oluştur
async function createAdminUser() {
  try {
    console.log('Admin kullanıcısı oluşturuluyor...');
    console.log(`API URL: ${API_URL}`);
    
    // Önce kayıt ol
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      name: adminUser.name,
      email: adminUser.email,
      password: adminUser.password
    });
    
    console.log('Kayıt yanıtı:', registerResponse.data);
    
    // Eğer kullanıcı zaten varsa, giriş yap
    if (registerResponse.data.error && registerResponse.data.error.includes('already exists')) {
      console.log('Kullanıcı zaten var, giriş yapılıyor...');
      
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: adminUser.email,
        password: adminUser.password
      });
      
      console.log('Giriş yanıtı:', loginResponse.data);
      
      if (loginResponse.data.success) {
        // Token al
        const token = loginResponse.data.token;
        
        // Admin rolüne yükselt
        const updateResponse = await axios.put(`${API_URL}/users/role`, 
          { role: 'admin' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Rol güncelleme yanıtı:', updateResponse.data);
        console.log('İşlem tamamlandı!');
      }
    } else if (registerResponse.data.success) {
      console.log('Yeni kullanıcı oluşturuldu, giriş yapılıyor...');
      
      // Giriş yap
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: adminUser.email,
        password: adminUser.password
      });
      
      console.log('Giriş yanıtı:', loginResponse.data);
      
      if (loginResponse.data.success) {
        // Token al
        const token = loginResponse.data.token;
        
        // Admin rolüne yükselt
        const updateResponse = await axios.put(`${API_URL}/users/role`, 
          { role: 'admin' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Rol güncelleme yanıtı:', updateResponse.data);
        console.log('İşlem tamamlandı!');
      }
    }
  } catch (error) {
    console.error('Hata:', error.response ? error.response.data : error.message);
  }
}

// Script'i çalıştır
createAdminUser();