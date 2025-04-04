# Modern E-Ticaret Full Stack Uygulaması

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br />

Bu proje, modern bir full stack e-ticaret uygulamasıdır. Kullanıcı dostu arayüzü, responsive tasarımı ve zengin özellikleriyle kapsamlı bir alışveriş deneyimi sunmaktadır.

## 🌟 Özellikler

- 👤 Kullanıcı kimlik doğrulama ve yetkilendirme
- 🛍️ Ürün listeleme ve filtreleme
- 🛒 Sepet yönetimi
- 💳 Ödeme işlemleri
- 📦 Sipariş takibi
- 👨‍💼 Admin paneli
- 📱 Responsive tasarım (mobil, tablet ve masaüstü uyumlu)
- 🌓 Karanlık/Aydınlık tema desteği
- ✨ Zengin animasyonlar ve geçişler

## 🛠️ Teknolojik Bileşenler

### Frontend
- React.js
- TailwindCSS
- React Query
- Framer Motion
- Heroicons
- Context API
- Zustand (State yönetimi)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## 📋 Kurulum Gereksinimleri

- Node.js (v16 veya üzeri)
- npm veya yarn
- MongoDB (yerel kurulum veya MongoDB Atlas)
- Git

## 🚀 Kurulum Adımları

### 1. Projeyi İndirme

```bash
git clone https://github.com/pave5866/modern-ecommerce-fullstack.git
cd modern-ecommerce-fullstack
```

### 2. Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükleme
npm install

# .env dosyasını oluşturma
```

`.env` dosyasını backend klasöründe oluşturun ve aşağıdaki gibi düzenleyin:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/e-ticaret  # Kendi MongoDB bağlantı adresinizi kullanın
JWT_SECRET=your_jwt_secret_key  # Güvenli bir anahtar belirleyin
JWT_EXPIRE=30d  # Token geçerlilik süresi
SMTP_HOST=your_smtp_host  # E-posta bildirimleri için (isteğe bağlı)
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### 3. Frontend Kurulumu

```bash
cd frontend

# Bağımlılıkları yükleme
npm install

# .env dosyasını oluşturma
```

`.env` dosyasını frontend klasöründe oluşturun:

```
VITE_API_URL=http://localhost:5000/api  # Backend API URL
```

## ▶️ Proje Çalıştırma

### Backend Sunucusunu Başlatma

```bash
cd backend
npm run dev  # Geliştirme modunda çalıştırma
```

Backend sunucu varsayılan olarak `http://localhost:5000` adresinde çalışmaya başlayacaktır.

### Frontend Uygulamasını Başlatma

```bash
cd frontend
npm run dev
```

Frontend uygulama varsayılan olarak `http://localhost:5173` adresinde çalışmaya başlayacaktır.

## 🌐 Canlıya Alma (Deployment)

### Backend Deployment

#### Vercel ile Deployment

1. [Vercel](https://vercel.com) hesabı oluşturun
2. Vercel CLI kurun: `npm i -g vercel`
3. Projenin kök dizininde `vercel.json` dosyası oluşturun:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/server.js"
    }
  ]
}
```

4. Komut satırında: `vercel --prod`

#### Heroku ile Deployment

1. [Heroku](https://heroku.com) hesabı oluşturun
2. Heroku CLI kurun
3. Komut satırında:

```bash
heroku login
heroku create your-app-name
git push heroku main
```

4. Heroku Dashboard'dan ortam değişkenlerini ayarlayın

### Frontend Deployment

#### Vercel ile Deployment

1. Frontend klasöründe: `vercel --prod`

#### Netlify ile Deployment

1. [Netlify](https://netlify.com) hesabı oluşturun
2. GitHub reponuzu Netlify ile bağlayın
3. Build ayarlarını yapılandırın:
   - Build komut: `npm run build`
   - Publish directory: `dist`
4. Ortam değişkenlerini Netlify dashboard'dan ayarlayın

## 💾 Veritabanı Yapılandırması

MongoDB veritabanınızı yapılandırmak için aşağıdaki adımları izleyin:

1. MongoDB Atlas hesabı oluşturun veya yerel bir MongoDB sunucusu kurun
2. Yeni bir veritabanı oluşturun: `e-ticaret`
3. Gerekli koleksiyonlar otomatik olarak oluşturulacaktır

## 👨‍💼 Admin Kullanıcı Oluşturma

İlk admin kullanıcısını oluşturmak için:

1. Normal bir kullanıcı olarak kayıt olun
2. MongoDB veritabanınıza erişin
3. `users` koleksiyonunda, oluşturduğunuz kullanıcının `role` alanını `admin` olarak güncelleyin

## 📁 Proje Yapısı

```
modern-ecommerce-fullstack/
├── backend/               # Backend kodları
│   ├── controllers/       # API kontrolleri
│   ├── middleware/        # Middleware fonksiyonları
│   ├── models/            # MongoDB modelleri
│   ├── routes/            # API rotaları
│   ├── utils/             # Yardımcı fonksiyonlar
│   ├── server.js          # Ana sunucu dosyası
│   └── package.json       # Backend bağımlılıkları
├── frontend/              # Frontend kodları
│   ├── public/            # Statik dosyalar
│   ├── src/               # Kaynak kodları
│   │   ├── assets/        # Resimler, fontlar vb.
│   │   ├── components/    # React bileşenleri
│   │   ├── contexts/      # Context API dosyaları
│   │   ├── hooks/         # Özel React Hooks
│   │   ├── layouts/       # Sayfa şablonları
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── services/      # API servisleri
│   │   ├── store/         # Zustand store
│   │   ├── styles/        # CSS/SCSS dosyaları
│   │   ├── utils/         # Yardımcı fonksiyonlar
│   │   ├── App.jsx        # Ana uygulama bileşeni
│   │   └── main.jsx       # Giriş dosyası
│   ├── index.html         # HTML şablonu
│   └── package.json       # Frontend bağımlılıkları
└── README.md              # Proje dokümantasyonu
```

## ❓ SSS (Sık Sorulan Sorular)

**S: MongoDB bağlantı hatası alıyorum, ne yapmalıyım?**  
C: MongoDB servisinizin çalıştığından ve .env dosyasındaki bağlantı dizesinin doğru olduğundan emin olun.

**S: "jwt malformed" hatası alıyorum, nasıl çözerim?**  
C: JWT_SECRET değişkeninizin frontend ve backend arasında tutarlı olduğundan emin olun.

**S: Frontend API'ye bağlanamıyor, neden?**  
C: CORS ayarlarının doğru yapılandırıldığından ve backend servisinin çalıştığından emin olun.

## 🔧 Sorun Giderme

- **Backend bağlantı sorunları**: `backend/server.js` dosyasında port ve host ayarlarını kontrol edin.
- **MongoDB bağlantı sorunları**: MongoDB servisinin çalıştığından emin olun ve bağlantı URL'sini doğrulayın.
- **Stillerin yüklenmemesi**: Frontend build sürecinin başarıyla tamamlandığından emin olun.

## 🤝 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Sorularınız veya önerileriniz için issues açabilir veya aşağıdaki iletişim kanallarını kullanabilirsiniz:

- GitHub: [pave5866](https://github.com/pave5866)

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.