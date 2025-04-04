import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Aşağıdaki yorum şimdilik kalacak, sorun çözülünce kullanılacak
// import { Toaster } from 'react-hot-toast'
import router from './routes'
import './index.css'

// Sayfada önbellek sorunu kontrolü için yardımcı fonksiyon
function checkAndClearCacheIfNeeded() {
  // URL'de refresh parametresi varsa
  if (window.location.search.includes('refresh=')) {
    console.log('Sayfa önbellek temizleme isteği algılandı');
    
    // Önbellek temizleme işlemleri
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
            .then(() => console.log(`Cache ${cacheName} silindi`))
            .catch(err => console.error(`Cache ${cacheName} silinemedi`, err));
        });
      });
    }
    
    // Eğer service worker varsa etkisizleştir
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
    
    // Temiz bir URL ile sayfayı yeniden yükle
    // Ancak sonsuz döngüye girmeyi önlemek için zaman damgasını kontrol et
    const refreshParam = new URLSearchParams(window.location.search).get('refresh');
    const currentTime = Date.now();
    const refreshTime = parseInt(refreshParam);
    
    // Eğer refresh parametresi 10 saniyeden daha eskiyse veya geçersizse
    if (isNaN(refreshTime) || (currentTime - refreshTime) > 10000) {
      // Parametre olmadan URL'ye geri dön
      window.location.href = window.location.href.split('?')[0];
    }
  }
}

// Sayfa yüklendiğinde önbellek kontrolü yap
checkAndClearCacheIfNeeded();

// React Query konfigürasyonu - ultra agresif önbellek yönetimi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Her durum için yenilenme davranışları
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Önbellek davranışı
      staleTime: 0,        // Her zaman stale (eski) data olarak işaretle
      cacheTime: 1000 * 5, // Sadece 5 saniye önbellekte tut
      retry: 3,            // Başarısız istekler için 3 deneme
      // Önbellek bypass stratejileri
      networkMode: 'always', // Her zaman ağ isteği yap
      refetchInterval: 30000, // Her 30 saniyede bir yenile
    },
    mutations: {
      // Mutasyon sonrası davranışlar
      onSuccess: () => {
        // Başarılı her mutasyondan sonra tüm sorguları geçersiz kıl
        queryClient.invalidateQueries();
        // 3 saniye sonra yeniden getir - önbellek yenilemesinin işlemesi için
        setTimeout(() => {
          queryClient.refetchQueries();
        }, 3000);
      },
      retry: 2
    }
  }
});

// Global önbellek temizleme zamanlayıcısı
const cleanupInterval = setInterval(() => {
  console.log('Zamanlanmış önbellek temizliği çalıştırılıyor');
  try {
    // Tüm sorguları geçersiz kıl ve yeniden getir
    queryClient.invalidateQueries();
    queryClient.refetchQueries();
  } catch (error) {
    console.error('Zamanlanmış temizleme hatası:', error);
  }
}, 3 * 60 * 1000); // 3 dakikada bir

// Component unmount olduğunda interval'i temizle
window.addEventListener('beforeunload', () => {
  clearInterval(cleanupInterval);
});

// Toast bileşeni geçici olarak yorumlandı
const ToasterPlaceholder = () => null;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* Toaster geçici olarak kaldırıldı
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000, // Toast mesajları 3 saniye görünsün
          style: {
            fontSize: '14px',
            maxWidth: '500px',
            padding: '16px',
          }
        }} 
      />
      */}
    </QueryClientProvider>
  </StrictMode>
)