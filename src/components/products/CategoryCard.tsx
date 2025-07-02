import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  className = '' 
}) => {
  const getCategoryPath = (categoryId: string) => {
    return `/${categoryId}`;
  };

  const getTotalClubs = () => {
    return category.subcategories.reduce((total, sub) => total + sub.clubs.length, 0);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group ${className}`}
    >
      <Link to={getCategoryPath(category.id)}>
        <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6 text-center">
            {/* Icon */}
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">{category.icon}</span>
              </div>
            </div>

            {/* Category Name */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              {category.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {category.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {category.subcategories.length}
                </div>
                <div className="text-xs text-gray-500">
                  Ligues
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {getTotalClubs()}+
                </div>
                <div className="text-xs text-gray-500">
                  Clubs
                </div>
              </div>
            </div>

            {/* Subcategories Preview */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 justify-center">
                {category.subcategories.slice(0, 3).map((sub) => (
                  <span
                    key={sub.id}
                    className="inline-block text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300"
                  >
                    {sub.name}
                  </span>
                ))}
                {category.subcategories.length > 3 && (
                  <span className="inline-block text-xs px-2 py-1 text-gray-500">
                    +{category.subcategories.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 transition-colors">
              <span className="text-sm font-medium">Explorer</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
