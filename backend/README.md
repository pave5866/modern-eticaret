# Modern E-Ticaret Backend

Bu klasör, e-ticaret uygulamasının backend kısmını içerir.

## Teknolojiler

- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Kurulum

```bash
# Bağımlılıkları yükleme
npm install

# Geliştirme sunucusunu başlatma
npm run dev
```

## API Rotaları

- `/api/auth`: Kimlik doğrulama işlemleri
- `/api/users`: Kullanıcı işlemleri
- `/api/products`: Ürün işlemleri
- `/api/orders`: Sipariş işlemleri
- `/api/categories`: Kategori işlemleri

## Yapı

- `controllers`: API kontrolleri
- `middleware`: Middleware fonksiyonları
- `models`: MongoDB modelleri
- `routes`: API rotaları
- `utils`: Yardımcı fonksiyonlar