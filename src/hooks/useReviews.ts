import { useState, useEffect } from 'react';
import type { Review } from '../types';

export const useReviews = (productId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reviews from JSON
  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/data/reviews.json');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des avis');
      }
      const reviewsData: Review[] = await response.json();
      setReviews(reviewsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur lors du chargement des avis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get reviews for a specific product
  const getProductReviews = (id: string) => {
    return reviews.filter(review => review.productId === id);
  };

  // Get filtered reviews
  const filteredReviews = productId 
    ? reviews.filter(review => review.productId === productId)
    : reviews;

  // Calculate rating statistics
  const getRatingStats = (productReviews: Review[]) => {
    if (productReviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    productReviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
    });

    const average = totalRating / productReviews.length;
    const total = productReviews.length;

    const percentages = {
      5: (distribution[5] / total) * 100,
      4: (distribution[4] / total) * 100,
      3: (distribution[3] / total) * 100,
      2: (distribution[2] / total) * 100,
      1: (distribution[1] / total) * 100,
    };

    return {
      average: Math.round(average * 10) / 10,
      total,
      distribution,
      percentages,
    };
  };

  // Sort reviews
  const sortReviews = (reviewsList: Review[], sortBy: 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful') => {
    return [...reviewsList].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });
  };

  // Filter reviews by rating
  const filterByRating = (reviewsList: Review[], minRating: number) => {
    return reviewsList.filter(review => review.rating >= minRating);
  };

  // Filter verified reviews only
  const getVerifiedReviews = (reviewsList: Review[]) => {
    return reviewsList.filter(review => review.verified);
  };

  // Get reviews with media (images or videos)
  const getReviewsWithMedia = (reviewsList: Review[]) => {
    return reviewsList.filter(review => 
      review.images.length > 0 || review.videos.length > 0
    );
  };

  // Get reviews by country
  const getReviewsByCountry = (reviewsList: Review[], country: string) => {
    return reviewsList.filter(review => 
      review.userCountry.toLowerCase() === country.toLowerCase()
    );
  };

  // Add helpful vote (mock function - would connect to backend)
  const addHelpfulVote = async (reviewId: string) => {
    try {
      // Mock API call - in real app, this would update the backend
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + 1 }
            : review
        )
      );
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du vote:', error);
      return false;
    }
  };

  // Submit new review (mock function)
  const submitReview = async (newReview: Omit<Review, 'id' | 'date' | 'helpful'>) => {
    try {
      const review: Review = {
        ...newReview,
        id: `review-${Date.now()}`,
        date: new Date().toISOString(),
        helpful: 0,
      };

      setReviews(prevReviews => [review, ...prevReviews]);
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
      return false;
    }
  };

  // Get recent reviews across all products
  const getRecentReviews = (limit = 5) => {
    return sortReviews(reviews, 'newest').slice(0, limit);
  };

  // Get top rated reviews
  const getTopRatedReviews = (limit = 5) => {
    return sortReviews(reviews, 'rating-high').slice(0, limit);
  };

  useEffect(() => {
    if (reviews.length === 0) {
      loadReviews();
    }
  }, []);

  return {
    reviews: filteredReviews,
    allReviews: reviews,
    isLoading,
    error,
    getProductReviews,
    getRatingStats,
    sortReviews,
    filterByRating,
    getVerifiedReviews,
    getReviewsWithMedia,
    getReviewsByCountry,
    addHelpfulVote,
    submitReview,
    getRecentReviews,
    getTopRatedReviews,
    loadReviews,
  };
};
