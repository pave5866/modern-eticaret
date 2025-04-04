import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProduct } from '../../features/products/productSlice';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  FormHelperText,
  VStack,
  HStack,
  Text,
  useToast,
  Container,
  Heading,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const AddProductPage = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    featured: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Elektronik', 
    'Giyim',
    'Kitap',
    'Ev & Yaşam',
    'Spor & Outdoor',
    'Kozmetik',
    'Oyuncak & Hobi',
    'Mobilya',
    'Aksesuar',
    'Diğer'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon kontrolleri
    if (!formData.name || !formData.description || !formData.price || 
        !formData.category || !formData.stock) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm gerekli alanları doldurun',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Form verilerini hazırla
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('description', formData.description);
    productData.append('price', formData.price);
    productData.append('category', formData.category);
    productData.append('stock', formData.stock);
    productData.append('featured', formData.featured);
    
    // Not: Şu an için resim yükleme devre dışı bırakılmıştır
    // Cloudinary sorunları giderildiğinde tekrar eklenecektir

    setIsSubmitting(true);
    
    try {
      const resultAction = await dispatch(createProduct(productData));
      
      if (createProduct.fulfilled.match(resultAction)) {
        toast({
          title: 'Başarılı',
          description: 'Ürün başarıyla oluşturuldu',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/admin/products');
      } else {
        const errorMessage = resultAction.error?.message || 'Ürün oluşturulurken bir hata oluştu';
        toast({
          title: 'Hata',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: error.message || 'Ürün oluşturulurken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <Container maxW="container.xl" py={8}>
        <Card 
          bg={bgColor} 
          boxShadow="lg" 
          borderWidth="1px" 
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          transition="all 0.3s"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
        >
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Heading size="lg">Yeni Ürün Ekle</Heading>
                <Button 
                  leftIcon={<FiArrowLeft />} 
                  onClick={() => navigate('/admin/products')}
                  colorScheme="gray"
                  variant="outline"
                >
                  Geri Dön
                </Button>
              </HStack>

              <form onSubmit={handleSubmit}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Ürün Adı</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ürün adını girin"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Açıklama</FormLabel>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Ürün açıklamasını girin"
                        minH="150px"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Kategori seçin"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </VStack>

                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Fiyat (₺)</FormLabel>
                      <Input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Ürün fiyatını girin"
                        min="0"
                        step="0.01"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Stok Miktarı</FormLabel>
                      <Input
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="Stok miktarını girin"
                        min="0"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Öne Çıkan Ürün</FormLabel>
                      <Switch
                        name="featured"
                        isChecked={formData.featured}
                        onChange={handleChange}
                        colorScheme="blue"
                        size="lg"
                      />
                      <FormHelperText>
                        Öne çıkan ürünler ana sayfada gösterilir
                      </FormHelperText>
                    </FormControl>

                    <Box mt={4}>
                      <Text mb={2} fontWeight="bold">Resimler</Text>
                      <Text fontSize="sm" color="red.500" mb={2}>
                        Not: Resim yükleme şu anda geçici olarak devre dışı bırakılmıştır. 
                        Ürününüz varsayılan bir resimle eklenecektir. Daha sonra ürün düzenlemeden resim ekleyebileceksiniz.
                      </Text>
                    </Box>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      width="full"
                      mt={4}
                      leftIcon={<FiSave />}
                      isLoading={isSubmitting}
                      loadingText="Kaydediliyor..."
                    >
                      Ürünü Kaydet
                    </Button>
                  </VStack>
                </SimpleGrid>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default AddProductPage;