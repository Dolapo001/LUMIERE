import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor for Auth Token
apiClient.interceptors.request.use((config: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('lumiere_token') : null;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error: any) => {
    return Promise.reject(error);
});

// Response Interceptor for Data Unwrapping and Silent Token Refresh
apiClient.interceptors.response.use(
    (response: any) => response.data, 
    async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('lumiere_refresh') : null;

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshToken });
                    const newAccessToken = (response.data as any).access;
                    
                    localStorage.setItem('lumiere_token', newAccessToken);
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    console.error('Refresh token expired or invalid');
                    localStorage.removeItem('lumiere_token');
                    localStorage.removeItem('lumiere_refresh');
                    // Optional: redirect to login or trigger global logout state
                }
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (credentials: any) => (apiClient.post('/auth/login/', credentials) as any),
    register: (data: any) => (apiClient.post('/auth/register/', data) as any),
    getProfile: () => (apiClient.get('/auth/profile/') as any),
    updateProfile: (data: any) => (apiClient.patch('/auth/profile/', data) as any),
};

export const addressApi = {
    getAddresses: () => (apiClient.get('/addresses/') as any),
    createAddress: (data: any) => (apiClient.post('/addresses/', data) as any),
    updateAddress: (id: number | string, data: any) => (apiClient.patch(`/addresses/${id}/`, data) as any),
    deleteAddress: (id: number | string) => (apiClient.delete(`/addresses/${id}/`) as any),
};

const MOCK_PRODUCTS: any[] = [
  { id: '1', name: 'Structured Wool Coat', price: 350.00, imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', inStock: true, category: 'Outerwear', brand: 'Lumière', storeId: '1', currency: 'USD', tags: [], stock: 10, is_featured: true },
  { id: '2', name: 'Minimalist Tote Bag', price: 120.00, imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80', inStock: true, category: 'Accessories', brand: 'Lumière', storeId: '1', currency: 'USD', tags: [], stock: 10, is_featured: true },
  { id: '3', name: 'Essential Cotton Tee', price: 45.00, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', inStock: true, category: 'Tops', brand: 'Lumière', storeId: '1', currency: 'USD', tags: [], stock: 10, is_featured: true },
  { id: '4', name: 'Classic Leather Belt', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', inStock: false, category: 'Accessories', brand: 'Lumière', storeId: '1', currency: 'USD', tags: [], stock: 0, is_featured: true },
  { id: '5', name: 'Cashmere Knit Sweater', price: 210.00, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', inStock: true, category: 'Knitwear', brand: 'Lumière', storeId: '1', currency: 'USD', tags: [], stock: 10, is_featured: true },
  { id: '6', name: 'Tailored Trousers', price: 145.00, imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80', inStock: true, category: 'Bottoms', brand: 'Lumière', storeId: '1', currency: 'USD', tags: [], stock: 10, is_featured: true },
  { id: '7', name: 'Oxford Footwear', price: 295.00, imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80', inStock: true, category: 'Footwear', brand: 'Lumière', storeId: '1', currency: 'USD', tags: [], stock: 10, is_featured: true },
  { id: '8', name: 'Silk Sleepwear Set', price: 180.00, imageUrl: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=600&q=80', inStock: true, category: 'Tops', brand: 'Lumière', storeId: '1', currency: 'USD', tags: [], stock: 10, is_featured: true }
];

export const productApi = {
    getProducts: async (params?: any): Promise<any> => {
      // Hit real Django Backend Endpoint
      const queryParams = { ...params };
      
      // Map frontend category to backend query
      if (queryParams.category === 'all') {
        delete queryParams.category;
      } else if (queryParams.category) {
        queryParams.category_name = queryParams.category;
        delete queryParams.category;
      }
      
      // Map frontend search 'q' to backend 'search'
      if (queryParams.q) {
        queryParams.search = queryParams.q;
        delete queryParams.q;
      }

      if (queryParams.color === 'all') delete queryParams.color;
      if (queryParams.price === 'all') delete queryParams.price;
      
      return (apiClient.get('/products/', { params: queryParams }) as any);
    },
    getProduct: async (id: string): Promise<any> => {
      return (apiClient.get(`/products/${id}/`) as any);
    },
    getRelatedProducts: async (id: string): Promise<any> => {
      return (apiClient.get(`/products/${id}/related/`) as any);
    },
    getCategoryProducts: async (categoryName: string): Promise<any> => {
      return (apiClient.get('/products/', { params: { category_name: categoryName } }) as any);
    },
    getCategories: async (): Promise<any> => {
      return (apiClient.get('/products/categories/') as any).catch(() => []); 
    },
    getMetadata: async (): Promise<any> => {
      return (apiClient.get('/products/metadata/') as any);
    },
    getSuggestions: async (q: string): Promise<any> => {
      return (apiClient.get(`/products/suggestions/?q=${encodeURIComponent(q)}`) as any);
    },
    validateCart: async (items: any[]): Promise<any> => {
      return (apiClient.post('/products/validate_cart/', { items }) as any);
    },
};

export const chatApi = {
    sendMessage: (data: { message: string, history?: any, session_id?: string }): Promise<any> => (apiClient.post('/chat/', data) as any),
    getHistory: (): Promise<{ history: any[], session_id: string | null }> => (apiClient.get('/chat/history/') as any),
    streamMessage: async (data: { message: string, history?: any, session_id?: string }, retryCount = 0): Promise<ReadableStream<Uint8Array> | null> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('lumiere_token') : null;
        const MAX_RETRIES = 2;
        
        try {
            console.log(`[ChatAPI] Sending message (attempt ${retryCount + 1}):`, data.message);
            const response = await fetch(`${API_BASE_URL}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[ChatAPI] Server error:', response.status, errorData);
                
                if (response.status >= 500 && retryCount < MAX_RETRIES) {
                    const delay = Math.pow(2, retryCount) * 1000;
                    console.warn(`[ChatAPI] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return chatApi.streamMessage(data, retryCount + 1);
                }
                
                throw new Error(errorData.error || `Failed to start stream (Status ${response.status})`);
            }
            
            return response.body; 
        } catch (error: any) {
            console.error('[ChatAPI] Fetch error:', error);
            if (retryCount < MAX_RETRIES) {
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return chatApi.streamMessage(data, retryCount + 1);
            }
            throw error;
        }
    }
};

export const adminApi = {
    getOrders: () => (apiClient.get('/admin/orders/') as any),
    updateOrderStatus: (id: string | number, status: string) => (apiClient.patch(`/admin/orders/${id}/update/`, { status }) as any),
};

export const orderApi = {
    placeOrder: (orderData: any): Promise<any> => (apiClient.post('/checkout/', orderData) as any),
    getHistory: (): Promise<any> => (apiClient.get('/orders/history/') as any),
    getOrder: (id: string | number): Promise<any> => (apiClient.get(`/orders/${id}/`) as any),
    trackOrder: (orderId: string): Promise<any> => (apiClient.get('/orders/track/', { params: { order_id: orderId } }) as any),
};

export default apiClient;
