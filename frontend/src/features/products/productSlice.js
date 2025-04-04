import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../services/api';
import { toast } from 'react-toastify';

// Tüm ürünleri getir
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productAPI.getAll(params.limit);
      console.log('Ürün slice - getProducts cevap:', response);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Ürünler alınamadı');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Ürün detayını getir
export const getProductDetails = createAsyncThunk(
  'products/getProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productAPI.getById(id);
      if (!response.success) {
        return rejectWithValue(response.error || 'Ürün detayı alınamadı');
      }
      return response.product;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Ürün oluştur
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productAPI.create(productData);
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Ürün oluşturulamadı');
      }
      toast.success('Ürün başarıyla oluşturuldu');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Ürün oluşturma işlemi başarısız oldu';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Ürün güncelle
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productAPI.update(id, productData);
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Ürün güncellenemedi');
      }
      toast.success('Ürün başarıyla güncellendi');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Ürün güncelleme işlemi başarısız oldu';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Ürün sil
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productAPI.delete(id);
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Ürün silinemedi');
      }
      toast.success('Ürün başarıyla silindi');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Ürün silme işlemi başarısız oldu';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Kategorileri getir
export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getCategories();
      console.log('Ürün slice - getCategories cevap:', response);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Kategoriler alınamadı');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Kategoriye göre ürün ara
export const getProductsByCategory = createAsyncThunk(
  'products/getProductsByCategory',
  async (category, { rejectWithValue }) => {
    try {
      if (!category) {
        return rejectWithValue('Kategori belirtilmedi');
      }
      
      const response = await productAPI.getByCategory(category);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Ürünler alınamadı');
      }
      return { 
        category, 
        products: response.data 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Ürün ara
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await productAPI.search(query);
      if (!response.success) {
        return rejectWithValue(response.error || 'Arama sonuçları alınamadı');
      }
      return { query, products: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  products: [],
  productsLoading: false,
  productsError: null,
  
  filteredProducts: [],
  searchResults: [],
  searchQuery: '',
  
  productsByCategory: {},
  categoryProductsLoading: false,
  categoryProductsError: null,
  
  productDetails: null,
  loading: false,
  error: null,
  success: false,
  
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  
  currentCategory: null
};

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProductDetails: (state) => {
      state.productDetails = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    resetProductState: (state) => {
      return initialState;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Tüm ürünleri getir
      .addCase(getProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        console.log('getProducts.fulfilled - response:', action.payload);
        state.productsLoading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload;
      })
      
      // Ürün detayını getir
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Ürün oluştur
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Ürün güncelle
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.productDetails = action.payload;
        
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Ürün sil
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Kategorileri getir
      .addCase(getCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })
      
      // Kategoriye göre ürün ara
      .addCase(getProductsByCategory.pending, (state) => {
        state.categoryProductsLoading = true;
        state.categoryProductsError = null;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.categoryProductsLoading = false;
        state.productsByCategory[action.payload.category] = action.payload.products;
        state.currentCategory = action.payload.category;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.categoryProductsLoading = false;
        state.categoryProductsError = action.payload;
      })
      
      // Ürün ara
      .addCase(searchProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.searchResults = action.payload.products;
        state.searchQuery = action.payload.query;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload;
      });
  }
});

export const { resetProductDetails, resetProductState, setCurrentCategory } = productSlice.actions;
export default productSlice.reducer;