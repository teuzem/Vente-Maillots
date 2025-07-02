import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Star, 
  Shield, 
  Truck, 
  Heart,
  ShoppingCart,
  TrendingUp,
  Award,
  Users,
  Target
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { useStore } from '../store/useStore';
import { useProducts } from '../hooks/useProducts';
import { Product, Category } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { CategoryCard } from '../components/products/CategoryCard';
import { HeroSlider } from '../components/home/HeroSlider';
import { FeaturedBrands } from '../components/home/FeaturedBrands';
import { NewsletterSignup } from '../components/home/NewsletterSignup';

const HomePage: React.FC = () => {
  const { currency } = useStore();
  const { products, isLoading } = useProducts();
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories
  useEffect(() => {
    fetch('/data/categories.json')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Filter products
  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  const bestsellers = products.filter(p => p.bestseller).slice(0, 6);
  const newArrivals = products
    .sort((a, b) => new Date(b.season).getTime() - new Date(a.season).getTime())
    .slice(0, 6);

  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      value: '500K+',
      label: 'Clients satisfaits',
      color: 'text-blue-600'
    },
    {
      icon: <Award className="h-6 w-6" />,
      value: '1000+',
      label: 'Maillots authentiques',
      color: 'text-purple-600'
    },
    {
      icon: <Target className="h-6 w-6" />,
      value: '150+',
      label: 'Clubs partenaires',
      color: 'text-green-600'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      value: '4.9/5',
      label: 'Note moyenne',
      color: 'text-yellow-600'
    }
  ];

  return (
    <Layout>
      <Helmet>
        <title>SPORTWEARstore - Maillots Sportifs Authentiques | Real Madrid, Barcelone, Arsenal</title>
        <meta name="description" content="Découvrez la plus grande collection de maillots sportifs authentiques. Real Madrid, FC Barcelone, Arsenal, PSG, Lakers et plus. Livraison gratuite dès 75€." />
        <meta name="keywords" content="maillots sportifs, football, basketball, Real Madrid, Barcelone, Arsenal, PSG, authentique, officiel" />
        <meta property="og:title" content="SPORTWEARstore - Maillots Sportifs Authentiques" />
        <meta property="og:description" content="La référence des maillots sportifs authentiques. Plus de 1000 maillots des plus grands clubs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sportswearstore.fr" />
        
        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SPORTWEARstore",
            "url": "https://sportswearstore.fr",
            "logo": "https://sportswearstore.fr/logo.png",
            "description": "Spécialiste des maillots sportifs authentiques",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33-1-23-45-67-89",
              "contactType": "Customer Service"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                🎉 Nouvelle collection 2024/25 disponible
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Votre passion,
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {' '}notre expertise
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Découvrez la plus grande collection de maillots sportifs authentiques. 
                Des plus grands clubs européens aux équipes NBA, trouvez votre maillot parfait.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  Découvrir la collection
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                  Nouveautés 2024/25
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">100% Authentique</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span className="text-sm">Livraison gratuite</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm">500K+ clients</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <HeroSlider products={featuredProducts.slice(0, 4)} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explorez nos sports
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Des plus grands clubs de football aux équipes NBA legendaires, 
              trouvez les maillots de vos équipes préférées.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Produits phares
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Nos maillots les plus populaires, sélectionnés pour vous
              </p>
            </div>
            <Link to="/recherche?featured=true">
              <Button variant="outline">
                Voir tout
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Meilleures ventes
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Les maillots préférés de nos clients
              </p>
            </div>
            <Link to="/recherche?bestseller=true">
              <Button variant="outline">
                Voir tout
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestsellers.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <FeaturedBrands />

      {/* New Arrivals */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nouveautés 2024/25
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Découvrez en avant-première les derniers maillots de la saison
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} showNewBadge />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à arborer les couleurs de votre équipe ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez la communauté SPORTWEARstore et portez votre passion avec fierté. 
              Authenticité garantie, livraison rapide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/recherche">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Explorer la collection
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/inscription">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
