import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';

// Pages
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Store provider
import { useStore } from './store/useStore';

// Global styles
import './index.css';

const App: React.FC = () => {
  const { theme } = useStore();

  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/produit/:id" element={<ProductDetailPage />} />
              <Route path="/categorie/:category" element={<CategoryPage />} />
              <Route path="/football" element={<CategoryPage />} />
              <Route path="/basketball" element={<CategoryPage />} />
              <Route path="/tennis" element={<CategoryPage />} />
              <Route path="/natation" element={<CategoryPage />} />
              <Route path="/golf" element={<CategoryPage />} />
              <Route path="/recherche" element={<SearchPage />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/favoris" element={<WishlistPage />} />
              <Route path="/commande" element={<CheckoutPage />} />
              
              {/* Auth routes */}
              <Route path="/connexion" element={<LoginPage />} />
              <Route path="/inscription" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/commandes" element={<OrdersPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: theme === 'dark' ? '#333' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
