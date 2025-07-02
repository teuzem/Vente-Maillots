import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/products/ProductCard';
import { useProducts } from '../hooks/useProducts';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { products, isLoading } = useProducts();

  // Filter products by category
  const filteredProducts = products.filter(product => 
    product.sport.toLowerCase() === category?.toLowerCase() ||
    product.category.toLowerCase() === category?.toLowerCase()
  );

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Catégorie';

  return (
    <Layout title={`${categoryName} - SPORTWEARstore`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Aucun produit trouvé dans cette catégorie.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
