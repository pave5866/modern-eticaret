// Dummy veriler - API bağlantısı olmadığında kullanılacak
// NOT: Bu dosya artık kullanılmıyor, gerçek API entegrasyonu yapıldı.
// Sadece referans olarak tutulmuştur.

export const DUMMY_DATA = {
  products: [
    { 
      _id: '1', 
      name: 'Siyah T-Shirt', 
      price: 149.99, 
      description: 'Rahat ve şık siyah t-shirt', 
      images: ['https://picsum.photos/id/237/300/400'], 
      category: 'Giyim',
      stock: 25,
      rating: 4.5,
      numReviews: 12
    },
    { 
      _id: '2', 
      name: 'Mavi Kot Pantolon', 
      price: 299.99, 
      description: 'Slim fit mavi kot pantolon', 
      images: ['https://picsum.photos/id/238/300/400'], 
      category: 'Giyim',
      stock: 15,
      rating: 4.2,
      numReviews: 8
    },
    { 
      _id: '3', 
      name: 'Spor Ayakkabı', 
      price: 399.99, 
      description: 'Konforlu spor ayakkabı', 
      images: ['https://picsum.photos/id/239/300/400'], 
      category: 'Ayakkabı',
      stock: 10,
      rating: 4.7,
      numReviews: 15
    },
    { 
      _id: '4', 
      name: 'Deri Cüzdan', 
      price: 199.99, 
      description: 'Hakiki deri cüzdan', 
      images: ['https://picsum.photos/id/240/300/400'], 
      category: 'Aksesuar',
      stock: 30,
      rating: 4.0,
      numReviews: 5
    },
    { 
      _id: '5', 
      name: 'Akıllı Saat', 
      price: 1299.99, 
      description: 'Çok fonksiyonlu akıllı saat', 
      images: ['https://picsum.photos/id/241/300/400'], 
      category: 'Elektronik',
      stock: 8,
      rating: 4.8,
      numReviews: 20
    },
    { 
      _id: '6', 
      name: 'Bluetooth Kulaklık', 
      price: 499.99, 
      description: 'Kablosuz bluetooth kulaklık', 
      images: ['https://picsum.photos/id/242/300/400'], 
      category: 'Elektronik',
      stock: 12,
      rating: 4.6,
      numReviews: 18
    },
    { 
      _id: '7', 
      name: 'Laptop Çantası', 
      price: 249.99, 
      description: 'Su geçirmez laptop çantası', 
      images: ['https://picsum.photos/id/243/300/400'], 
      category: 'Aksesuar',
      stock: 20,
      rating: 4.3,
      numReviews: 9
    },
    { 
      _id: '8', 
      name: 'Güneş Gözlüğü', 
      price: 349.99, 
      description: 'UV korumalı güneş gözlüğü', 
      images: ['https://picsum.photos/id/244/300/400'], 
      category: 'Aksesuar',
      stock: 15,
      rating: 4.4,
      numReviews: 11
    },
    { 
      _id: '9', 
      name: 'Kış Montu', 
      price: 899.99, 
      description: 'Sıcak tutan kış montu', 
      images: ['https://picsum.photos/id/245/300/400'], 
      category: 'Giyim',
      stock: 7,
      rating: 4.9,
      numReviews: 25
    },
    { 
      _id: '10', 
      name: 'Spor Çorap', 
      price: 49.99, 
      description: 'Nefes alabilen spor çorap', 
      images: ['https://picsum.photos/id/246/300/400'], 
      category: 'Giyim',
      stock: 50,
      rating: 4.1,
      numReviews: 7
    }
  ],
  categories: ['Giyim', 'Ayakkabı', 'Aksesuar', 'Elektronik'],
  users: [
    { _id: '1', name: 'Test Kullanıcı', email: 'test@example.com', role: 'user' },
    { _id: '2', name: 'Admin Kullanıcı', email: 'admin@example.com', role: 'admin' }
  ],
  orders: [
    { _id: '1', userId: '1', products: ['1', '2'], totalAmount: 449.98, status: 'completed' },
    { _id: '2', userId: '1', products: ['3', '4'], totalAmount: 599.98, status: 'processing' }
  ]
}; 