import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  Product, 
  CartItem, 
  User, 
  Wishlist, 
  SearchFilters, 
  GeoLocation,
  Notification
} from '../types';

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Products & Search
  products: Product[];
  searchQuery: string;
  searchFilters: SearchFilters;
  
  // Cart
  cart: CartItem[];
  cartTotal: number;
  
  // Wishlist
  wishlist: string[];
  
  // UI State
  theme: 'light' | 'dark';
  language: 'fr' | 'en' | 'es' | 'de' | 'it';
  currency: 'EUR' | 'USD' | 'GBP';
  
  // Location
  geoLocation: GeoLocation | null;
  
  // Notifications
  notifications: Notification[];
  
  // Loading states
  isLoading: boolean;
  isLoadingProducts: boolean;
  isLoadingCart: boolean;
}

interface AppActions {
  // User & Auth
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  
  // Products & Search
  setProducts: (products: Product[]) => void;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  clearSearchFilters: () => void;
  
  // Cart
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  calculateCartTotal: () => void;
  
  // Wishlist
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // UI
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'fr' | 'en' | 'es' | 'de' | 'it') => void;
  setCurrency: (currency: 'EUR' | 'USD' | 'GBP') => void;
  
  // Location
  setGeoLocation: (location: GeoLocation) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Loading
  setLoading: (isLoading: boolean) => void;
  setLoadingProducts: (isLoading: boolean) => void;
  setLoadingCart: (isLoading: boolean) => void;
}

export const useStore = create<AppState & AppActions>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      products: [],
      searchQuery: '',
      searchFilters: {},
      cart: [],
      cartTotal: 0,
      wishlist: [],
      theme: 'light',
      language: 'fr',
      currency: 'EUR',
      geoLocation: null,
      notifications: [],
      isLoading: false,
      isLoadingProducts: false,
      isLoadingCart: false,

      // Actions
      setUser: (user) => set((state) => {
        state.user = user;
        state.isAuthenticated = !!user;
      }),

      setAuthenticated: (isAuthenticated) => set((state) => {
        state.isAuthenticated = isAuthenticated;
      }),

      setProducts: (products) => set((state) => {
        state.products = products;
      }),

      setSearchQuery: (query) => set((state) => {
        state.searchQuery = query;
      }),

      setSearchFilters: (filters) => set((state) => {
        state.searchFilters = { ...state.searchFilters, ...filters };
      }),

      clearSearchFilters: () => set((state) => {
        state.searchFilters = {};
        state.searchQuery = '';
      }),

      addToCart: (product, size, color, quantity = 1) => set((state) => {
        const existingItem = state.cart.find(
          item => item.product.id === product.id && item.size === size && item.color === color
        );

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${size}-${color}-${Date.now()}`,
            product,
            size,
            color,
            quantity,
            addedAt: new Date().toISOString(),
          };
          state.cart.push(newItem);
        }
        
        // Recalculate total
        get().calculateCartTotal();
      }),

      removeFromCart: (itemId) => set((state) => {
        state.cart = state.cart.filter(item => item.id !== itemId);
        get().calculateCartTotal();
      }),

      updateCartItemQuantity: (itemId, quantity) => set((state) => {
        const item = state.cart.find(item => item.id === itemId);
        if (item) {
          if (quantity <= 0) {
            state.cart = state.cart.filter(item => item.id !== itemId);
          } else {
            item.quantity = quantity;
          }
        }
        get().calculateCartTotal();
      }),

      clearCart: () => set((state) => {
        state.cart = [];
        state.cartTotal = 0;
      }),

      calculateCartTotal: () => set((state) => {
        state.cartTotal = state.cart.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
        }, 0);
      }),

      addToWishlist: (productId) => set((state) => {
        if (!state.wishlist.includes(productId)) {
          state.wishlist.push(productId);
        }
      }),

      removeFromWishlist: (productId) => set((state) => {
        state.wishlist = state.wishlist.filter(id => id !== productId);
      }),

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      setTheme: (theme) => set((state) => {
        state.theme = theme;
      }),

      setLanguage: (language) => set((state) => {
        state.language = language;
      }),

      setCurrency: (currency) => set((state) => {
        state.currency = currency;
      }),

      setGeoLocation: (location) => set((state) => {
        state.geoLocation = location;
      }),

      addNotification: (notification) => set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        state.notifications.unshift(newNotification);
      }),

      removeNotification: (id) => set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }),

      markNotificationAsRead: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
        }
      }),

      clearAllNotifications: () => set((state) => {
        state.notifications = [];
      }),

      setLoading: (isLoading) => set((state) => {
        state.isLoading = isLoading;
      }),

      setLoadingProducts: (isLoading) => set((state) => {
        state.isLoadingProducts = isLoading;
      }),

      setLoadingCart: (isLoading) => set((state) => {
        state.isLoadingCart = isLoading;
      }),
    })),
    {
      name: 'sportswear-store',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        theme: state.theme,
        language: state.language,
        currency: state.currency,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
