import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Select, InputNumber, Switch, Upload, message, Spin, Alert, Space, Divider, Card } from 'antd';
import { UploadOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { getCategories } from '../../features/products/productSlice';
import { toast } from 'react-toastify';
import ImgCrop from 'antd-img-crop';

const { TextArea } = Input;
const { Option } = Select;

const ProductForm = ({ initialValues, onFinish, buttonText, loading }) => {
  const [form] = Form.useForm();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadDisabled, setUploadDisabled] = useState(false);
  
  const dispatch = useDispatch();
  const { categories, categoriesLoading, categoriesError } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (initialValues?.images && initialValues.images.length > 0) {
      const fileList = initialValues.images.map((url, index) => ({
        uid: `-${index}`,
        name: `image-${index}.jpg`,
        status: 'done',
        url: url,
        thumbUrl: url,
      }));
      setImageList(fileList);
    }
  }, [initialValues]);

  // Form değerleri değiştiğinde form içeriğini güncelle
  useEffect(() => {
    form.setFieldsValue({
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      price: initialValues?.price || 0,
      stock: initialValues?.stock || 0,
      category: initialValues?.category || undefined,
      featured: initialValues?.featured || false
    });
  }, [initialValues, form]);

  // Resim önizleme
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // Resim yükleme için dosyayı base64'e çevir
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Resim değişikliği
  const handleImageChange = async ({ fileList: newFileList }) => {
    // Mevcut dosyaların base64 içeriğini koru
    const processedFileList = await Promise.all(newFileList.map(async (file) => {
      // Eğer dosya zaten bir URL'e sahipse, o halde mevcut bir resimdir ve değiştirilmemelidir
      if (file.url) {
        return file;
      }
      
      // Yeni yüklenen dosya
      if (file.originFileObj && !file.url && !file.base64) {
        try {
          setImageLoading(true);
          const base64 = await getBase64(file.originFileObj);
          setImageLoading(false);
          return { ...file, base64 };
        } catch (error) {
          setImageLoading(false);
          message.error('Görsel yüklenirken bir hata oluştu');
          return file;
        }
      }
      return file;
    }));
    
    setImageList(processedFileList);
  };

  // Form gönderildiğinde
  const handleSubmit = async (values) => {
    try {
      // Görselleri hazırla
      let images = [];
      
      // Önce mevcut URL'leri ekle
      imageList.forEach(image => {
        if (image.url) {
          images.push(image.url);
        } else if (image.base64) {
          images.push(image.base64);
        }
      });
      
      // Form değerlerini hazırla
      const productData = {
        ...values,
        images: images
      };
      
      // onFinish callback'ini çağır
      await onFinish(productData);
      
      // Başarılı olduğunda formu sıfırla
      if (!initialValues) {
        form.resetFields();
        setImageList([]);
      }
    } catch (error) {
      toast.error('Ürün kaydedilirken bir hata oluştu!');
    }
  };

  return (
    <Spin spinning={loading || categoriesLoading} tip="İşleminiz yapılıyor...">
      <Card title="Ürün Bilgileri" className="product-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: initialValues?.name || '',
            description: initialValues?.description || '',
            price: initialValues?.price || 0,
            stock: initialValues?.stock || 0,
            category: initialValues?.category || undefined,
            featured: initialValues?.featured || false
          }}
        >
          <Form.Item
            name="name"
            label="Ürün Adı"
            rules={[{ required: true, message: 'Lütfen ürün adını girin!' }]}
          >
            <Input placeholder="Ürün adını girin" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Ürün Açıklaması"
            rules={[{ required: true, message: 'Lütfen ürün açıklamasını girin!' }]}
          >
            <TextArea
              placeholder="Ürün açıklamasını girin"
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>

          <Space style={{ display: 'flex', width: '100%' }}>
            <Form.Item
              name="price"
              label="Fiyat"
              rules={[{ required: true, message: 'Lütfen ürün fiyatını girin!' }]}
              style={{ width: '50%' }}
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
                addonAfter="₺"
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Stok"
              rules={[{ required: true, message: 'Lütfen stok miktarını girin!' }]}
              style={{ width: '50%' }}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Space>

          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: 'Lütfen bir kategori seçin!' }]}
          >
            <Select
              placeholder="Kategori seçin"
              loading={categoriesLoading}
              notFoundContent={categoriesError ? 'Kategori yüklenirken hata oluştu' : 'Kategori bulunamadı'}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              dropdownRender={menu => (
                <div>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Input.Group compact>
                      <Input
                        style={{ width: 'calc(100% - 100px)' }}
                        placeholder="Yeni kategori"
                        onPressEnter={(e) => {
                          e.preventDefault();
                          // Bu özellik ayrı bir formda eklenebilir
                        }}
                      />
                      <Button type="primary" icon={<PlusOutlined />}>
                        Ekle
                      </Button>
                    </Input.Group>
                  </div>
                </div>
              )}
            >
              {categories?.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="featured"
            label="Öne Çıkan Ürün"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Ürün Görselleri"
            tooltip="En fazla 5 görsel ekleyebilirsiniz. PNG, JPG, JPEG veya GIF formatlarında, maksimum 2MB boyutunda olmalıdır."
            rules={[{ required: false }]}
          >
            {uploadDisabled ? (
              <Alert
                message="Şu anda görsel yükleme özelliği devre dışı"
                description="Cloudinary bağlantı sorunları nedeniyle görsel yükleme geçici olarak devre dışı bırakıldı. Mevcut görseller korunacaktır."
                type="warning"
                showIcon
              />
            ) : (
              <ImgCrop rotate>
                <Upload
                  listType="picture-card"
                  fileList={imageList}
                  onPreview={handlePreview}
                  onChange={handleImageChange}
                  beforeUpload={() => {
                    return false; // Otomatik yüklemeyi engelle
                  }}
                  maxCount={5}
                >
                  {imageList.length >= 5 ? null : (
                    <div>
                      {imageLoading ? <LoadingOutlined /> : <UploadOutlined />}
                      <div style={{ marginTop: 8 }}>Yükle</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            )}
            <div style={{ marginTop: 8 }}>
              <Alert
                message="Görsel Yükleme Notu"
                description="Görseller şu anda yerel depolama sistemine kaydedilmektedir. Cloudinary bağlantı sorunu çözüldüğünde otomatik olarak Cloudinary'ye aktarılacaktır."
                type="info"
                showIcon
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', marginTop: 16 }}
              size="large"
            >
              {buttonText || 'Kaydet'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};

export default ProductForm;