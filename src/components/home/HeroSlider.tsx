import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Product } from '../../types';
import { Link } from 'react-router-dom';

interface HeroSliderProps {
  products: Product[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [products.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  if (products.length === 0) {
    return (
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl"></div>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative aspect-square max-w-lg mx-auto">
      {/* Main Product Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          {/* Background Circle */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full border border-white/20"></div>
          
          {/* Product Image */}
          <div className="absolute inset-8 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
            <img
              src={currentProduct.images[0]}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-6">
              <div className="text-white">
                <Badge className="mb-2 bg-white/20 text-white border-white/30">
                  {currentProduct.club}
                </Badge>
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {currentProduct.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(currentProduct.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm opacity-90">
                    {currentProduct.rating} ({currentProduct.reviewCount})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {currentProduct.price}€
                    </span>
                    {currentProduct.originalPrice && (
                      <span className="text-sm line-through opacity-70">
                        {currentProduct.originalPrice}€
                      </span>
                    )}
                  </div>
                  <Link to={`/produit/${currentProduct.id}`}>
                    <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Small Product Previews */}
      <div className="absolute -right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col space-y-4">
        {products.map((product, index) => (
          <motion.button
            key={product.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              index === currentIndex
                ? 'border-white scale-110'
                : 'border-white/30 hover:border-white/60'
            }`}
            whileHover={{ scale: index === currentIndex ? 1.1 : 1.05 }}
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
