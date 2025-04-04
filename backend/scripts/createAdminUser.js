/**
 * Admin kullanıcısı oluşturma script'i
 * 
 * Bu script, MongoDB veritabanına admin rolüne sahip bir kullanıcı ekler.
 * Kullanım: node createAdminUser.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB bağlantı URL'i
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/modern-ecommerce';

// Admin kullanıcı bilgileri
const adminUser = {
  name: 'Kadir ERDEM',
  email: 'kerdem5866@gmail.com',
  password: 'Salako5866.',
  role: 'admin',
  isActive: true
};

// MongoDB'ye bağlan
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB bağlantısı başarılı');
  createAdminUser();
})
.catch(err => {
  console.error('MongoDB bağlantı hatası:', err);
  process.exit(1);
});

// User model şeması
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// User modelini oluştur
const User = mongoose.model('User', userSchema);

// Admin kullanıcısını oluştur
async function createAdminUser() {
  try {
    // Kullanıcının var olup olmadığını kontrol et
    const existingUser = await User.findOne({ email: adminUser.email });
    
    if (existingUser) {
      console.log(`"${adminUser.email}" e-posta adresiyle bir kullanıcı zaten var.`);
      
      // Kullanıcı var ama admin değilse, admin yap
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`Kullanıcı rolü "admin" olarak güncellendi.`);
      } else {
        console.log('Kullanıcı zaten admin rolüne sahip.');
      }
      
      // Şifreyi güncelle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('Kullanıcı şifresi güncellendi.');
      
      process.exit(0);
    } else {
      // Yeni admin kullanıcısı oluştur
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      const newUser = new User({
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
      
      await newUser.save();
      console.log(`"${adminUser.email}" e-posta adresiyle yeni bir admin kullanıcısı oluşturuldu.`);
      process.exit(0);
    }
  } catch (error) {
    console.error('Admin kullanıcısı oluşturma hatası:', error);
    process.exit(1);
  }
}