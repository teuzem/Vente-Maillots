import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/button';
import { useStore } from '../store/useStore';
import { useProducts } from '../hooks/useProducts';

const WishlistPage: React.FC = () => {
  const { wishlist } = useStore();
  const { allProducts } = useProducts();

  const wishlistProducts = allProducts.filter(product => 
    wishlist.includes(product.id)
  );

  return (
    <Layout title="Mes Favoris - SPORTWEARstore">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mes Favoris ({wishlistProducts.length})</h1>
        
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 max-w-md mx-auto">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Votre liste de favoris est vide</h2>
            <p className="text-muted-foreground mb-6">
              Découvrez notre collection et ajoutez vos maillots préférés !
            </p>
            <Button asChild>
              <Link to="/">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Découvrir nos produits
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;
