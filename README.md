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

![localhost_5173_products](https://github.com/user-attachments/assets/d2517432-8b47-45f0-91ef-2c1de783dfaa)
![localhost_5173_ (3)](https://github.com/user-attachments/assets/2b1f497d-7d92-431c-b284-725f9346a9bd)
![localhost_5173_ (4)](https://github.com/user-attachments/assets/d79c3d1c-5af9-4b65-a0e9-31d14497f234)


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
