import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Rate, Typography, Button, Image, Badge, Space, message } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, EyeOutlined } from '@ant-design/icons';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import LazyLoad from 'react-lazyload';
import './ProductCard.css';

const { Meta } = Card;
const { Text, Title } = Typography;

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { userInfo } = useSelector((state) => state.auth);

  if (!product) {
    return null;
  }

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  // Resim URL'sini güvenli bir şekilde al
  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066139/default-product_dljmyw.png';
  };

  // Sepete ekle
  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    message.success('Ürün sepete eklendi');
  };

  // Favorilere ekle/çıkar
  const handleToggleWishlist = () => {
    if (!userInfo) {
      message.info('Favorilere eklemek için giriş yapmalısınız');
      return;
    }
    dispatch(toggleWishlist(product));
    if (isInWishlist) {
      message.success('Ürün favorilerden çıkarıldı');
    } else {
      message.success('Ürün favorilere eklendi');
    }
  };

  // Stok durumuna göre badge rengi
  const getStockStatus = () => {
    if (product.stock <= 0) {
      return { status: 'error', text: 'Stokta Yok' };
    } else if (product.stock < 5) {
      return { status: 'warning', text: 'Son Birkaç Ürün' };
    } else {
      return { status: 'success', text: 'Stokta' };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Badge.Ribbon
      text={product.featured ? 'Öne Çıkan' : stockStatus.text}
      color={product.featured ? 'cyan' : stockStatus.status}
      style={{ display: 'block' }}
    >
      <Card
        hoverable
        className="product-card"
        cover={
          <LazyLoad height={200} offset={100} once>
            <Link to={`/product/${product._id}`}>
              <div className="product-image-container">
                <Image
                  alt={product.name}
                  src={getImageUrl()}
                  fallback="https://res.cloudinary.com/dlkrduwav/image/upload/v1716066139/default-product_dljmyw.png"
                  preview={false}
                  className="product-image"
                />
              </div>
            </Link>
          </LazyLoad>
        }
        actions={[
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => window.location.href = `/product/${product._id}`}
          />,
          <Button
            type="text"
            icon={isInWishlist ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            onClick={handleToggleWishlist}
          />,
          <Button 
            type="text"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          />
        ]}
      >
        <Meta
          title={
            <Link to={`/product/${product._id}`} className="product-title">
              {product.name}
            </Link>
          }
          description={
            <>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text type="secondary" className="product-category">
                  {product.category}
                </Text>
                
                <Rate 
                  disabled 
                  allowHalf 
                  defaultValue={product.ratings || 0} 
                  style={{ fontSize: '14px' }}
                />
                
                <div className="product-price">
                  <Title level={5} style={{ margin: 0, color: '#1677ff' }}>
                    {product.price.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </Title>
                </div>
              </Space>
            </>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;