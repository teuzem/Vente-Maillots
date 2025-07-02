import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye,
  Badge as BadgeIcon,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useStore } from '../../store/useStore';
import { Product } from '../../types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  showNewBadge?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showNewBadge = false,
  className = '' 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { 
    addToCart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    currency 
  } = useStore();

  const isWishlisted = isInWishlist(product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.inStock) {
      addToCart(product, product.sizes[0], product.colors[0]);
      toast.success(`${product.name} ajouté au panier`);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Retiré des favoris');
    } else {
      addToWishlist(product.id);
      toast.success('Ajouté aux favoris');
    }
  };

  const formatPrice = (price: number) => {
    const symbols = { EUR: '€', USD: '$', GBP: '£' };
    return `${price.toFixed(2)} ${symbols[currency]}`;
  };

  const discountAmount = product.originalPrice ? 
    ((product.originalPrice - product.price) / product.originalPrice * 100).toFixed(0) : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group ${className}`}
    >
      <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {/* Product Image */}
          <Link to={`/produit/${product.id}`}>
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onMouseEnter={() => {
                if (product.images.length > 1) {
                  setCurrentImageIndex(1);
                }
              }}
              onMouseLeave={() => setCurrentImageIndex(0)}
            />
          </Link>

          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {showNewBadge && (
              <Badge className="bg-green-600 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Nouveau
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-blue-600 text-white">
                <BadgeIcon className="w-3 h-3 mr-1" />
                Vedette
              </Badge>
            )}
            {product.bestseller && (
              <Badge className="bg-purple-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Best-seller
              </Badge>
            )}
            {product.discount && (
              <Badge variant="destructive">
                -{discountAmount}%
              </Badge>
            )}
          </div>

          {/* Stock status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-white">
                Rupture de stock
              </Badge>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm"
              onClick={handleToggleWishlist}
            >
              <Heart 
                className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </Button>
            <Link to={`/produit/${product.id}`}>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
          </div>

          {/* Quick add to cart */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter au panier
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Club & League */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {product.club}
            </Badge>
            <span className="text-xs text-gray-500">{product.league}</span>
          </div>

          {/* Product Name */}
          <Link to={`/produit/${product.id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Brand & Season */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.brand}
            </span>
            <span className="text-sm text-gray-500">
              {product.season}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            {/* Stock indicator */}
            {product.inStock && product.stock <= 5 && (
              <Badge variant="destructive" className="text-xs">
                Plus que {product.stock}
              </Badge>
            )}
          </div>

          {/* Available sizes preview */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs px-2 py-1 text-gray-500">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
