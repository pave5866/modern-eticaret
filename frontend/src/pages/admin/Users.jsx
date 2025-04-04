import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  XMarkIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Loading } from '../../components/ui'
import { userAPI } from '../../services/api'
import { showToast } from '../../utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

const userRoles = {
  user: {
    label: 'Kullanıcı',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  admin: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
}

export default function Users() {
  const queryClient = useQueryClient()
  const location = useLocation()
  const [selectedRole, setSelectedRole] = useState('Tümü')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [forceRefresh, setForceRefresh] = useState(0)
  const [roleChanged, setRoleChanged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [temporaryRole, setTemporaryRole] = useState('');
  const [lastVisitTime, setLastVisitTime] = useState(Date.now())

  // Kullanıcıları getir - useEffect'ten önce tanımlanmalı
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', currentPage, limit, selectedRole, searchQuery, sortBy, sortOrder, forceRefresh],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 100);
      if (selectedRole !== 'Tümü') params.append('role', selectedRole);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      try {
        // Veri getirme sırasında önbellek bypass header'ları ekle
        const randomBuster = Date.now() + '-' + Math.random();
        params.append('_nocache', randomBuster);
        
        const response = await userAPI.getAll(params);
        
        // Veri kontrolü
        if (!response || !response.data) {
          return { data: { users: [], pagination: { total: 0, pages: 1 } } };
        }
        
        // API yanıtı doğru formatta değilse düzeltme
        let userData = response.data;
        if (!userData.users && Array.isArray(userData)) {
          userData = { users: userData };
        }
        
        // Admin kullanıcıları üstte göstermek için veriyi düzenle
        if (userData.users && Array.isArray(userData.users)) {
          const users = [...userData.users];
          users.sort((a, b) => {
            // Önce role göre sırala (admin > user)
            if (a.role === 'admin' && b.role !== 'admin') return -1;
            if (a.role !== 'admin' && b.role === 'admin') return 1;
            
            // Sonra seçilen alana göre sırala
            if (sortBy === 'createdAt') {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            
            // Alfanümerik sıralama
            const valA = String(a[sortBy] || '').toLowerCase();
            const valB = String(b[sortBy] || '').toLowerCase();
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          });
          
          userData.users = users;
        }
        
        return { data: userData };
      } catch (error) {
        console.error('Kullanıcı verisi çekme hatası:', error);
        return { data: { users: [], pagination: { total: 0, pages: 1 } } };
      }
    },
    // Önbellek davranışını ultra agresif yap - neredeyse hiç önbellekleme yapma
    staleTime: 0,            // Veri her zaman eski olarak kabul edilsin (hemen yeniden sorgu)
    cacheTime: 0,            // Önbellekte tutma süresi (0 = kullanılmayan veriler hemen temizlenir)
    refetchOnWindowFocus: true,   // Pencere odaklandığında yeniden sorgu yap
    refetchOnMount: true,         // Bileşen monte edildiğinde yeniden sorgu yap
    refetchOnReconnect: true,     // Ağ bağlantısı yeniden kurulduğunda yeniden sorgu yap
    refetchInterval: 30000,       // Her 30 saniyede bir yeniden sorgu yap
  })

  // Modal kapanırken sayfayı yenileme işlemi - refetch tanımlandıktan sonra
  useEffect(() => {
    // Modal kapandıktan sonra ve rol değişikliği yapıldıysa
    if (!showModal && roleChanged) {
      console.log('Modal kapandı ve rol değişikliği yapıldı, veri yenileniyor...');
      
      // Tüm önbellekleri temizle
      queryClient.clear();
      
      // Sayfayı zorla yenile (hard reload gibi) 
      window.location.reload(true);
    }
  }, [showModal, roleChanged, queryClient]);

  // Sayfa ilk yüklendiğinde çalışacak
  useEffect(() => {
    // Sayfa ilk yüklendiğinde veriyi zorla getir
    const loadInitialData = async () => {
      try {
        // Önce tüm önbellekleri temizle
        if (userAPI.invalidateCache && typeof userAPI.invalidateCache === 'function') {
          await userAPI.invalidateCache();
        } else {
          console.log('invalidateCache fonksiyonu bulunamadı, önbellek temizleme atlanıyor');
        }
        
        // Veriyi zorla yeniden çek
        await refetch({
          fetchPolicy: 'network-only',
          refetchPage: true,
          force: true
        });
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
      }
    };
    
    loadInitialData();
  }, []);

  // Sayfa aktif olduğunda veriyi yeniden yükleme
  useEffect(() => {
    // Focus event listener ekle - herhangi bir navigasyon sonrasında çalışacak
    const handleFocus = () => {
      // Sayfa yeniden aktif olduğunda veriyi güncel tut
      refetch({ force: true });
      queryClient.invalidateQueries(['admin-users']);
    };

    // Sol menü linklerini dinle
    const handleSideNavClick = () => {
      // Kullanıcı herhangi bir menü öğesine tıkladıktan sonra
      // bu sayfaya döndüğünde veriyi güncelleyelim
      const menuLinks = document.querySelectorAll('nav a, nav button');
      menuLinks.forEach(link => {
        link.addEventListener('click', () => {
          // Sayfaya dönüldüğünde veriyi yeniden yükle
          setTimeout(() => {
            refetch({ force: true });
            queryClient.invalidateQueries(['admin-users']);
          }, 200);
        });
      });
    };

    // Event listener'ları ekle
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });
    
    // DOMContentLoaded olayında sol menü linklerini dinlemeye başla
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleSideNavClick);
    } else {
      handleSideNavClick();
    }

    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      document.removeEventListener('DOMContentLoaded', handleSideNavClick);
    };
  }, [queryClient, refetch]);

  // Kullanıcı rolü güncelle mutation
  const { mutate: updateUserRole, isLoading: isRoleUpdating } = useMutation({
    mutationFn: async ({ userId, role, onSuccess: customOnSuccess }) => {
      try {
        // API çağrısı yapılıyor
        const response = await userAPI.updateRole(userId, role);
        
        // Eğer başarısız ise hata fırlat
        if (!response.success && response.error) {
          throw new Error(response.error);
        }
        
        // İşlem başarılıysa ve özel onSuccess fonksiyonu varsa çağır
        if (customOnSuccess && typeof customOnSuccess === 'function') {
          customOnSuccess(response);
        }
        
        return response;
      } catch (error) {
        console.error('Rol güncelleme hatası:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Varsayılan onSuccess işlemi burada
      // Eğer özel bir onSuccess fonskiyonu dropdown'dan verilmediyse burası çalışır
      if (!variables.onSuccess) {
        setRoleChanged(true);
        
        showToast.success('Kullanıcı rolü güncellendi');
        
        // React Query önbelleğini temizle
        queryClient.invalidateQueries(['admin-users']);
        
        // Modal kapat
        setShowModal(false);
      }
    },
    onError: (error) => {
      // Hata mesajı göster ama sayfayı YENİLEME
      showToast.error(error.message || 'Rol güncelleme sırasında bir hata oluştu');
      
      // Sadece önbelleği temizle, ancak sayfayı YENİLEME
      queryClient.invalidateQueries(['admin-users']);
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const handleSearch = (value) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setTemporaryRole(user.role);
    setShowModal(true);
  }

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    setCurrentPage(1);
    
    // Rol filtrelemesi değiştiğinde tüm cache'i temizle
    queryClient.removeQueries(['admin-users']);
    
    // Hemen veriyi yeniden çek
    setTimeout(() => {
      refetch();
      setForceRefresh(prev => prev + 1);
    }, 0);
  }

  const handleCloseModal = () => {
    // Modal kapatılıyor
    setShowModal(false);
    
    // Önbelleği tamamen temizle
    queryClient.removeQueries(['admin-users']);
    
    // Veriyi yeniden çek - zorunlu yeniden yükleme
    refetch({fetchPolicy: 'network-only'});
    
    // Mevcut sekmede tüm kalan kullanıcı verilerini temizle
    setTimeout(() => {
      // Başka bir zorlamalı yenileme
      setForceRefresh(prev => prev + 1);
    }, 100);
  };

  // Rol değiştirme butonu için onClick fonksiyonu - hard refresh yapılacak
  const handleRoleUpdate = async () => {
    try {
      // Loading durumunu başlat
      setLoading(true);
      
      // Loading toast göster
      const loadingToast = showToast.loading('Rol değiştiriliyor...');
      
      // API çağrısı yap
      const response = await userAPI.updateRole(selectedUser._id, temporaryRole);
      
      // Loading toast'ı kapat
      toast.dismiss(loadingToast);
      
      // Response kontrolü
      if (!response) {
        throw new Error('API yanıtı alınamadı');
      }
      
      if (response.success) {
        // Başarılı olduğunu bildir
        const successToast = showToast.success(`Kullanıcı rolü başarıyla değiştirildi: ${userRoles[temporaryRole]?.label || temporaryRole}`);
        
        // Modal kapat
        setShowModal(false);
        
        // Önbellekleri agresif bir şekilde temizle
        queryClient.clear(); // Tüm önbelleği temizle
        queryClient.resetQueries(); // Tüm sorguları sıfırla
        queryClient.invalidateQueries(); // Tüm sorguları geçersiz kıl
        
        // Rol değişikliğini yerel olarak uygula - UI'ı güncelle
        try {
          if (data && data.data && data.data.users && Array.isArray(data.data.users)) {
            // Derin kopya oluştur - referans sorunlarını önlemek için
            const usersCopy = JSON.parse(JSON.stringify(data.data.users));
            
            const updatedUsers = usersCopy.map(user => {
              if (user._id === selectedUser._id) {
                // Yeni rol ile birlikte kullanıcıyı güncelle
                return { 
                  ...user, 
                  role: temporaryRole,
                  _lastUpdated: Date.now() // UI tarafında değişiklikleri farketmesini sağlamak için
                };
              }
              return user;
            });
            
            // Tüm önbellek anahtarlarını temizle ve güncelle
            queryClient.setQueriesData(
              ['admin-users'],
              (oldData) => {
                if (!oldData) return oldData;
                
                return {
                  ...oldData,
                  data: {
                    ...oldData.data,
                    users: updatedUsers
                  }
                };
              }
            );
            
            // Force refresh - yeni veri ile UI'ı güncelle
            setForceRefresh(prev => prev + 100);
          }
        } catch (localUpdateError) {
          console.error('Yerel veri güncelleme hatası:', localUpdateError);
        }
        
        // Veriyi agresif bir şekilde yeniden çek
        try {
          if (userAPI.invalidateCache && typeof userAPI.invalidateCache === 'function') {
            await userAPI.invalidateCache();
          }
          
          // Veriyi yeniden çek - birkaç kere dene
          for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 100 * i));
            await refetch({
              fetchPolicy: 'network-only',
              refetchPage: true,
              force: true
            });
          }
          
          // Başarı durumunu kaydet - navigation sonrası için
          localStorage.setItem('roleChangeSuccess', 'true');
          localStorage.setItem('lastRoleChange', JSON.stringify({
            userId: selectedUser._id,
            newRole: temporaryRole,
            timestamp: Date.now()
          }));
          
          // Hard refresh yapma, bunun yerine sadece veriyi agresif bir şekilde yenile
          // UI zaten güncellenmiş olmalı
        } catch (cacheError) {
          console.error('Önbellek temizleme hatası:', cacheError);
          localStorage.setItem('roleChangeSuccess', 'true');
        }
      } else {
        // Hata mesajını göster
        showToast.error(response.error || 'Rol değiştirme başarısız oldu');
        // Geçici rolü eski haline getir
        setTemporaryRole(selectedUser.role);
      }
    } catch (error) {
      // Sadece API çağrısı sırasında gerçek bir hata olduğunda göster
      console.error('Rol değiştirme hatası:', error);
      showToast.error('Rol değiştirme sırasında bir hata oluştu');
      // Geçici rolü eski haline getir
      setTemporaryRole(selectedUser.role);
    } finally {
      // Loading durumunu kapat
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde kontrol yapmak için
  useEffect(() => {
    const checkForRefresh = () => {
      // URL'de refresh parametresi var mı kontrol et
      const urlParams = new URLSearchParams(window.location.search);
      const refreshParam = urlParams.get('refresh');
      
      // Başarılı rol değişikliği kontrolü
      const roleChangeSuccess = localStorage.getItem('roleChangeSuccess');
      if (roleChangeSuccess === 'true') {
        // Başarı mesajını göster
        showToast.success('Kullanıcı rolü başarıyla değiştirildi');
        // Flag'i temizle
        localStorage.removeItem('roleChangeSuccess');
        
        // URL'den refresh parametresini temizle
        if (refreshParam) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    
      const needsRefresh = localStorage.getItem('needsRefresh');
      if (needsRefresh === 'true') {
        // Yenileme işlemi tamamlandı, bayrağı temizle
        localStorage.removeItem('needsRefresh');
        
        // Son rol değişiklik bilgisini al
        const lastChange = localStorage.getItem('lastRoleChange');
        if (lastChange) {
          try {
            const changeData = JSON.parse(lastChange);
            console.log('Rol değişikliği uygulandı:', changeData);
            
            // Force refresh için tetikle
            setTimeout(() => {
              setForceRefresh(prev => prev + 1);
            }, 100);
          } catch (e) {
            console.error('Rol değişikliği verisi okunamadı', e);
          }
          // Değişiklik bilgisini temizle
          localStorage.removeItem('lastRoleChange');
        }
      }
    };
    
    checkForRefresh();
  }, []);

  // URL değişikliğini izle - sayfaya her geldiğimizde
  useEffect(() => {
    // Sayfa tekrar görüntülendiğinde son ziyaretten belirli bir süre geçtiyse veriyi yenile
    const currentTime = Date.now();
    const timeThreshold = 500; // 500 milisaniye (yarım saniye)
    
    if (currentTime - lastVisitTime > timeThreshold) {
      console.log('Kullanıcılar sayfasına tekrar girildi, veriler yenileniyor...');
      
      // Veriyi tamamen taze şekilde getir
      queryClient.invalidateQueries(['admin-users']);
      
      // Hemen yeniden getir
      setTimeout(() => {
        refetch({
          fetchPolicy: 'network-only', 
          force: true
        });
        
        // Force refresh ile UI'ı yenilemeye zorla
        setForceRefresh(prev => prev + 1);
      }, 50);
    }
    
    // Son ziyaret zamanını güncelle
    setLastVisitTime(currentTime);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kullanıcılar</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kullanıcılarınızı yönetin ve düzenleyin
        </p>
      </div>

      {/* Filtreler ve Arama */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="E-posta ara..."
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              {selectedRole === 'Tümü' ? 'Tüm Roller' : userRoles[selectedRole]?.label}
            </button>
          </div>
        </div>
      </div>

      {/* Kullanıcı Tablosu */}
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/70">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  <button
                    onClick={() => handleSort('_id')}
                    className="inline-flex items-center gap-x-2 rounded px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    ID
                    {sortBy === '_id' && (
                      sortOrder === 'asc' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  <button
                    onClick={() => handleSort('email')}
                    className="inline-flex items-center gap-x-2 rounded px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    E-posta
                    {sortBy === 'email' && (
                      sortOrder === 'asc' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  <button
                    onClick={() => handleSort('role')}
                    className="inline-flex items-center gap-x-2 rounded px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Rol
                    {sortBy === 'role' && (
                      sortOrder === 'asc' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="inline-flex items-center gap-x-2 rounded px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Kayıt Tarihi
                    {sortBy === 'createdAt' && (
                      sortOrder === 'asc' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.data?.users && data.data.users.length > 0 ? (
                data.data.users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user._id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-x-4">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-purple-600">
                            <span className="text-sm font-medium text-white">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${userRoles[user.role]?.color}`}>
                        {userRoles[user.role]?.label || user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="inline-flex items-center justify-center rounded-full bg-white p-1.5 text-primary-600 shadow-sm hover:bg-primary-50 hover:text-primary-700 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <UserIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Kullanıcı bulunamadı</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Arama kriterlerinize uygun kullanıcı yok.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Önceki
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!data?.data?.pagination?.pages || currentPage >= data.data.pagination.pages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Sonraki
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Toplam <span className="font-medium">{data?.data?.users?.length || 0}</span> kullanıcı gösteriliyor
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              >
                <span className="sr-only">Önceki</span>
                <ArrowUpIcon className="h-5 w-5 rotate-90" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!data?.data?.pagination?.pages || currentPage >= data.data.pagination.pages}
                className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              >
                <span className="sr-only">Sonraki</span>
                <ArrowDownIcon className="h-5 w-5 -rotate-90" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => handleCloseModal()}
            />

            <div className="inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-8 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle">
              <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-gray-500 dark:hover:text-gray-400"
                  onClick={() => handleCloseModal()}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Kullanıcı Bilgileri
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser ? 'Kullanıcı bilgilerini görüntüle ve düzenle' : 'Kullanıcı bilgileri bulunamadı'}
                  </p>
                </div>

                {selectedUser && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 flex-shrink-0">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-purple-600">
                          <span className="text-xl font-medium text-white">
                            {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xl font-medium text-gray-900 dark:text-white">
                          {selectedUser.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-700/30">
                      <dl className="divide-y divide-gray-200 dark:divide-gray-600">
                        <div className="py-3 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Kullanıcı ID</dt>
                          <dd className="text-sm text-gray-900 dark:text-white col-span-2">{selectedUser._id}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Rol</dt>
                          <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                            <div className="relative">
                              <select
                                value={temporaryRole}
                                onChange={(e) => setTemporaryRole(e.target.value)}
                                disabled={loading || isRoleUpdating}
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                <option value="user">Kullanıcı</option>
                                <option value="admin">Admin</option>
                              </select>
                              {loading && (
                                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                  <svg className="h-5 w-5 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </dd>
                        </div>
                        <div className="py-3 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Kayıt Tarihi</dt>
                          <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                            {new Date(selectedUser.createdAt).toLocaleString('tr-TR')}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex justify-end gap-4">
                      {temporaryRole !== selectedUser?.role && (
                        <button
                          type="button"
                          onClick={handleRoleUpdate}
                          disabled={loading || isRoleUpdating}
                          className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
                        >
                          {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCloseModal()}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 