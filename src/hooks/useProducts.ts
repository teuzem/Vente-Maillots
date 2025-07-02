import { useState, useEffect } from 'react';
import type { Product, Category, SearchFilters } from '../types';
import { useStore } from '../store/useStore';

export const useProducts = () => {
  const { 
    products, 
    setProducts, 
    searchQuery, 
    searchFilters,
    isLoadingProducts,
    setLoadingProducts 
  } = useStore();

  const [categories, setCategories] = useState<Category[]>([]);

  // Load products from JSON
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch('/data/products.json');
      const productsData: Product[] = await response.json();
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load categories from JSON
  const loadCategories = async () => {
    try {
      const response = await fetch('/data/categories.json');
      const categoriesData: Category[] = await response.json();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Filter products based on search query and filters
  const filteredProducts = products.filter(product => {
    // Text search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        product.club.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.league.toLowerCase().includes(searchLower) ||
        product.sport.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (searchFilters.category && product.category !== searchFilters.category) {
      return false;
    }

    // Subcategory filter
    if (searchFilters.subcategory && product.subcategory !== searchFilters.subcategory) {
      return false;
    }

    // Sport filter
    if (searchFilters.sport && product.sport !== searchFilters.sport) {
      return false;
    }

    // League filter
    if (searchFilters.league && product.league !== searchFilters.league) {
      return false;
    }

    // Club filter
    if (searchFilters.club && product.club !== searchFilters.club) {
      return false;
    }

    // Brand filter
    if (searchFilters.brand && product.brand !== searchFilters.brand) {
      return false;
    }

    // Price range filter
    if (searchFilters.priceMin && product.price < searchFilters.priceMin) {
      return false;
    }
    if (searchFilters.priceMax && product.price > searchFilters.priceMax) {
      return false;
    }

    // Size filter
    if (searchFilters.sizes && searchFilters.sizes.length > 0) {
      const hasSize = searchFilters.sizes.some(size => product.sizes.includes(size));
      if (!hasSize) return false;
    }

    // Color filter
    if (searchFilters.colors && searchFilters.colors.length > 0) {
      const hasColor = searchFilters.colors.some(color => 
        product.colors.some(productColor => 
          productColor.toLowerCase().includes(color.toLowerCase())
        )
      );
      if (!hasColor) return false;
    }

    // Stock filter
    if (searchFilters.inStock && !product.inStock) {
      return false;
    }

    // Featured filter
    if (searchFilters.featured && !product.featured) {
      return false;
    }

    // Bestseller filter
    if (searchFilters.bestseller && !product.bestseller) {
      return false;
    }

    // Rating filter
    if (searchFilters.rating && product.rating < searchFilters.rating) {
      return false;
    }

    return true;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (searchFilters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id); // Assuming newer products have higher IDs
      case 'popularity':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  // Get product by ID
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Get featured products
  const getFeaturedProducts = () => {
    return products.filter(product => product.featured);
  };

  // Get bestseller products
  const getBestsellerProducts = () => {
    return products.filter(product => product.bestseller);
  };

  // Get products by category
  const getProductsByCategory = (categoryId: string) => {
    return products.filter(product => product.category === categoryId);
  };

  // Get related products
  const getRelatedProducts = (productId: string, limit = 4) => {
    const product = getProductById(productId);
    if (!product) return [];

    return products
      .filter(p => 
        p.id !== productId && 
        (p.sport === product.sport || p.league === product.league || p.brand === product.brand)
      )
      .slice(0, limit);
  };

  // Get unique values for filters
  const getFilterOptions = () => {
    const sports = [...new Set(products.map(p => p.sport))];
    const leagues = [...new Set(products.map(p => p.league))];
    const clubs = [...new Set(products.map(p => p.club))];
    const brands = [...new Set(products.map(p => p.brand))];
    const sizes = [...new Set(products.flatMap(p => p.sizes))];
    const colors = [...new Set(products.flatMap(p => p.colors))];
    
    const priceRange = products.reduce(
      (range, product) => ({
        min: Math.min(range.min, product.price),
        max: Math.max(range.max, product.price),
      }),
      { min: Infinity, max: 0 }
    );

    return {
      sports: sports.sort(),
      leagues: leagues.sort(),
      clubs: clubs.sort(),
      brands: brands.sort(),
      sizes: sizes.sort(),
      colors: colors.sort(),
      priceRange: priceRange.min === Infinity ? { min: 0, max: 0 } : priceRange,
    };
  };

  // Initialize data loading
  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
    if (categories.length === 0) {
      loadCategories();
    }
  }, []);

  return {
    products: sortedProducts,
    allProducts: products,
    categories,
    isLoading: isLoadingProducts,
    getProductById,
    getFeaturedProducts,
    getBestsellerProducts,
    getProductsByCategory,
    getRelatedProducts,
    getFilterOptions,
    loadProducts,
    loadCategories,
  };
};
