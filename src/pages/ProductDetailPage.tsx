import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck, 
  RotateCcw, 
  Shield,
  Share2,
  Zap,
  Users,
  Check,
  X,
  Plus,
  Minus,
  ImageIcon
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useProducts } from '../hooks/useProducts';
import { useReviews } from '../hooks/useReviews';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import type { Product } from '../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { getProductById, getRelatedProducts } = useProducts();
  const { getProductReviews, getRatingStats } = useReviews();
  
  const { 
    addToCart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    currency 
  } = useStore();

  const product = id ? getProductById(id) : null;
  const relatedProducts = id ? getRelatedProducts(id, 4) : [];
  const productReviews = id ? getProductReviews(id) : [];
  const ratingStats = getRatingStats(productReviews);

  const isInWishlistState = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || '');
    }
  }, [product]);

  if (!product) {
    return (
      <Layout title="Produit non trouvé">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            Le produit que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Button asChild>
            <Link to="/">Retourner à l'accueil</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }
    if (!selectedColor) {
      toast.error('Veuillez sélectionner une couleur');
      return;
    }
    if (!product.inStock || product.stock === 0) {
      toast.error('Produit non disponible');
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    toast.success(`${product.name} ajouté au panier !`, {
      icon: '🛒',
      duration: 3000,
    });
  };

  const handleWishlistToggle = () => {
    if (isInWishlistState) {
      removeFromWishlist(product.id);
      toast.success('Retiré des favoris', {
        icon: '💔',
        duration: 2000,
      });
    } else {
      addToWishlist(product.id);
      toast.success('Ajouté aux favoris !', {
        icon: '❤️',
        duration: 2000,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const discountPercentage = product.discount || 
    (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  const canIncreaseQuantity = quantity < product.stock && quantity < 10;
  const canDecreaseQuantity = quantity > 1;

  return (
    <Layout
      title={`${product.name} - ${product.club} | SPORTWEARstore`}
      description={`Achetez le ${product.name} officiel. ${product.description} Livraison gratuite dès 75€. En stock et authentique.`}
      keywords={`${product.name}, ${product.club}, ${product.brand}, ${product.sport}, maillot officiel`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link to={`/${product.sport.toLowerCase()}`} className="hover:text-primary">{product.sport}</Link>
          <span>/</span>
          <Link to={`/${product.sport.toLowerCase()}/${product.club.toLowerCase().replace(' ', '-')}`} className="hover:text-primary">{product.club}</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail images */}
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Product badges */}
            <div className="flex flex-wrap gap-2">
              {product.featured && (
                <Badge className="bg-yellow-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Coup de cœur
                </Badge>
              )}
              {product.bestseller && (
                <Badge className="bg-green-600 text-white">
                  🏆 Best-seller
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge variant="destructive">
                  -{discountPercentage}% 
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span className="font-medium">{product.brand}</span>
                <span>{product.league}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="font-medium text-primary">{product.club}</span>
                <span className="text-muted-foreground">{product.sport}</span>
                <span className="text-muted-foreground">{product.season}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm font-medium ml-2">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} avis)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.price >= 75 && (
                <Badge className="bg-green-100 text-green-800">
                  <Truck className="w-3 h-3 mr-1" />
                  Livraison gratuite
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">Caractéristiques :</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Size selection */}
            <div>
              <h3 className="font-semibold mb-3">Taille :</h3>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Link to="/guide-tailles" className="text-sm text-primary hover:underline inline-block mt-2">
                Guide des tailles
              </Link>
            </div>

            {/* Color selection */}
            <div>
              <h3 className="font-semibold mb-3">Couleur :</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                      selectedColor === color
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantité :</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={!canDecreaseQuantity}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, 10, q + 1))}
                    disabled={!canIncreaseQuantity}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock <= 5 ? `Plus que ${product.stock} en stock !` : `${product.stock} disponibles`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || product.stock === 0}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.inStock ? 'Ajouter au panier' : 'Non disponible'}
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className="flex-1"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isInWishlistState ? 'fill-red-500 text-red-500' : ''}`} />
                  {isInWishlistState ? 'Dans les favoris' : 'Ajouter aux favoris'}
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Livraison gratuite</div>
                    <div className="text-muted-foreground">Dès 75€ d'achat</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Retours gratuits</div>
                    <div className="text-muted-foreground">30 jours</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Paiement sécurisé</div>
                    <div className="text-muted-foreground">SSL & 3D Secure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({productReviews.length})</TabsTrigger>
              <TabsTrigger value="shipping">Livraison & Retours</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-4">Informations produit</h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Marque :</dt>
                          <dd className="font-medium">{product.brand}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Club :</dt>
                          <dd className="font-medium">{product.club}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Ligue :</dt>
                          <dd className="font-medium">{product.league}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Saison :</dt>
                          <dd className="font-medium">{product.season}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Type :</dt>
                          <dd className="font-medium">{product.type}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Sport :</dt>
                          <dd className="font-medium">{product.sport}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-4">Caractéristiques</h3>
                      <ul className="space-y-2 text-sm">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Rating summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{ratingStats.average}</div>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(ratingStats.average)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-muted-foreground">
                          Basé sur {ratingStats.total} avis
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2 text-sm">
                            <span className="w-8">{rating} ★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${ratingStats.percentages[rating as keyof typeof ratingStats.percentages]}%` }}
                              ></div>
                            </div>
                            <span className="w-12 text-muted-foreground">
                              {ratingStats.distribution[rating as keyof typeof ratingStats.distribution]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews list */}
                <div className="space-y-4">
                  {productReviews.length > 0 ? (
                    productReviews.slice(0, 5).map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">{review.userName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {review.userCountry}
                                </Badge>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    ✓ Achat vérifié
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold mb-2">{review.title}</h4>
                          <p className="text-muted-foreground mb-4">{review.comment}</p>
                          
                          {review.images.length > 0 && (
                            <div className="flex space-x-2 mb-4">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Avis ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <button className="text-muted-foreground hover:text-primary">
                              👍 Utile ({review.helpful})
                            </button>
                          </div>
                          
                          {review.reply && (
                            <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                              <div className="font-medium text-sm mb-1">
                                Réponse de {review.reply.adminName}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {review.reply.message}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Aucun avis pour ce produit pour le moment.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-4">Livraison</h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium">Livraison standard gratuite</div>
                            <div className="text-muted-foreground">Dès 75€ d'achat - 3 à 5 jours ouvrés</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Livraison express</div>
                            <div className="text-muted-foreground">7.99€ - 24 à 48h</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-4">Retours</h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Retours gratuits</div>
                            <div className="text-muted-foreground">30 jours pour changer d'avis</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="font-medium">Garantie qualité</div>
                            <div className="text-muted-foreground">Échange en cas de défaut</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Produits similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
