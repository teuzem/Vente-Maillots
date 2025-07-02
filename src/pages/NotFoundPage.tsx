import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';

const NotFoundPage: React.FC = () => {
  return (
    <Layout title="Page introuvable - SPORTWEARstore">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="text-9xl font-bold text-muted-foreground mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
          <p className="text-muted-foreground mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          
          <div className="space-y-3">
            <Button size="lg" asChild className="w-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Retourner à l'accueil
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full">
              <Link to="/recherche">
                <Search className="mr-2 h-4 w-4" />
                Rechercher un produit
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
