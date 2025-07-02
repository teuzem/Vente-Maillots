import React from 'react';
import { motion } from 'framer-motion';

export const FeaturedBrands: React.FC = () => {
  const brands = [
    {
      name: 'Nike',
      logo: 'https://logoeps.com/wp-content/uploads/2013/03/nike-vector-logo.png',
      description: 'Just Do It',
    },
    {
      name: 'Adidas',
      logo: 'https://logoeps.com/wp-content/uploads/2012/10/adidas-vector-logo.png',
      description: 'Impossible is Nothing',
    },
    {
      name: 'Puma',
      logo: 'https://logoeps.com/wp-content/uploads/2013/03/puma-vector-logo.png',
      description: 'Forever Faster',
    },
    {
      name: 'Jordan',
      logo: 'https://logoeps.com/wp-content/uploads/2013/03/jordan-vector-logo.png',
      description: 'Become Legendary',
    },
    {
      name: 'Under Armour',
      logo: 'https://logoeps.com/wp-content/uploads/2013/03/under-armour-vector-logo.png',
      description: 'I Will',
    },
    {
      name: 'New Balance',
      logo: 'https://logoeps.com/wp-content/uploads/2013/03/new-balance-vector-logo.png',
      description: 'Fearlessly Independent',
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nos marques partenaires
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Nous travaillons exclusivement avec les plus grandes marques sportives 
            pour vous garantir authenticité et qualité.
          </p>
        </motion.div>

        {/* Brand Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 transition-all duration-300 group-hover:shadow-lg group-hover:bg-white dark:group-hover:bg-gray-700">
                <div className="aspect-square max-w-20 mx-auto mb-3 relative">
                  {/* Fallback brand representation */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {brand.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Authenticité garantie</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">6+</div>
              <div className="text-gray-600 dark:text-gray-400">Marques partenaires</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
              <div className="text-gray-600 dark:text-gray-400">Vérification qualité</div>
            </div>
          </div>
        </motion.div>

        {/* Quality Assurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Garantie d'authenticité</h3>
            <p className="mb-4">
              Chaque maillot est vérifié et authentifié par nos experts. 
              Nous garantissons l'origine officielle de tous nos produits.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Hologrammes officiels
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Étiquettes d'authenticité
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Certificats de garantie
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
