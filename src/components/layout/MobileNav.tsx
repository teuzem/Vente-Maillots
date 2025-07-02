import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Search, User, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useStore } from '../../store/useStore';

interface MobileNavProps {
  categories: Array<{
    name: string;
    path: string;
    icon: string;
  }>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ categories }) => {
  const location = useLocation();
  const { isAuthenticated, cart, wishlist } = useStore();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const quickLinks = [
    { 
      name: 'Accueil', 
      path: '/', 
      icon: <Home className="h-5 w-5" />, 
      count: null 
    },
    { 
      name: 'Recherche', 
      path: '/recherche', 
      icon: <Search className="h-5 w-5" />, 
      count: null 
    },
    { 
      name: 'Panier', 
      path: '/panier', 
      icon: <ShoppingCart className="h-5 w-5" />, 
      count: cartItemsCount 
    },
    { 
      name: 'Favoris', 
      path: '/favoris', 
      icon: <Heart className="h-5 w-5" />, 
      count: wishlist.length 
    },
  ];

  const userLinks = isAuthenticated ? [
    { name: 'Mon Profil', path: '/profil' },
    { name: 'Mes Commandes', path: '/commandes' },
  ] : [
    { name: 'Connexion', path: '/connexion' },
    { name: 'Inscription', path: '/inscription' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>

      {/* Quick Links */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Accès rapide</h3>
        <div className="space-y-2">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                location.pathname === link.path
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                {link.icon}
                <span>{link.name}</span>
              </div>
              {link.count !== null && link.count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {link.count > 9 ? '9+' : link.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Sports</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.path}
              to={category.path}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                location.pathname === category.path
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <Separator />

      {/* User Links */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Compte</h3>
        <div className="space-y-2">
          {userLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                location.pathname === link.path
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5" />
                <span>{link.name}</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 border-t">
        <div className="text-center text-sm text-gray-500">
          <div className="font-semibold text-blue-600">SPORTWEARstore</div>
          <div>Votre passion, notre expertise</div>
        </div>
      </div>
    </div>
  );
};
