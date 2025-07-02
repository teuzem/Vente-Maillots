export interface Product {
  id: string;
  name: string;
  brand: string;
  club: string;
  league: string;
  country: string;
  sport: string;
  type: string;
  season: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  currency: string;
  description: string;
  features: string[];
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  category: string;
  subcategory: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  clubs: string[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userCountry: string;
  userRegion: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  videos: string[];
  verified: boolean;
  helpful: number;
  date: string;
  reply?: AdminReply;
}

export interface AdminReply {
  adminName: string;
  message: string;
  date: string;
}

export interface CartItem {
  id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  addedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  country?: string;
  region?: string;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface UserPreferences {
  language: string;
  currency: string;
  newsletter: boolean;
  notifications: boolean;
  favoriteTeams: string[];
  favoriteSports: string[];
  theme: 'light' | 'dark' | 'auto';
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'applepay' | 'googlepay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface Wishlist {
  id: string;
  userId: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  sport?: string;
  league?: string;
  club?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  featured?: boolean;
  bestseller?: boolean;
  rating?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popularity';
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  currency?: string;
  language?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
}
