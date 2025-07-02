import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck,
  Lock,
  ArrowRight,
  Heart
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { 
    cart, 
    cartTotal,
    updateCartItemQuantity, 
    removeFromCart,
    addToWishlist,
    currency 
  } = useStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const shippingCost = cartTotal >= 75 ? 0 : 7.99;
  const totalWithShipping = cartTotal + shippingCost;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateCartItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    removeFromCart(itemId);
    toast.success(`${productName} retiré du panier`, {
      icon: '🗑️',
      duration: 2000,
    });
  };

  const handleMoveToWishlist = (itemId: string, productId: string, productName: string) => {
    addToWishlist(productId);
    removeFromCart(itemId);
    toast.success(`${productName} déplacé vers les favoris`, {
      icon: '❤️',
      duration: 2000,
    });
  };

  if (cart.length === 0) {
    return (
      <Layout title="Votre panier - SPORTWEARstore">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
              <p className="text-muted-foreground">
                Découvrez notre collection de maillots sportifs authentiques et ajoutez vos favoris !
              </p>
            </div>
            
            <div className="space-y-3">
              <Button size="lg" asChild className="w-full">
                <Link to="/">
                  Découvrir nos produits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full">
                <Link to="/favoris">
                  <Heart className="mr-2 h-4 w-4" />
                  Voir mes favoris
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Votre panier - SPORTWEARstore">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Votre panier ({cart.length} articles)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <Link to={`/produit/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/produit/${item.product.id}`}
                        className="font-semibold hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      
                      <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                        <span>{item.product.brand}</span>
                        <span>•</span>
                        <span>{item.product.club}</span>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">Taille:</span>
                          <Badge variant="outline" className="text-xs">{item.size}</Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-muted-foreground">Couleur:</span>
                          <Badge variant="outline" className="text-xs">{item.color}</Badge>
                        </div>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || item.quantity >= 10}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-bold">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-muted-foreground">
                              {formatPrice(item.product.price)} / unité
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-4 mt-4 text-sm">
                        <button
                          onClick={() => handleMoveToWishlist(item.id, item.product.id, item.product.name)}
                          className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Déplacer vers les favoris
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.product.name)}
                          className="flex items-center text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Résumé de la commande</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sous-total ({cart.length} articles)</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>
                      {shippingCost === 0 ? (
                        <Badge className="bg-green-100 text-green-800 px-2 py-1">
                          Gratuite
                        </Badge>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  {cartTotal < 75 && (
                    <div className="text-sm text-muted-foreground">
                      Ajoutez {formatPrice(75 - cartTotal)} pour la livraison gratuite
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(totalWithShipping)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mt-6" asChild>
                  <Link to="/commande">
                    Procéder au paiement
                    <Lock className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <div className="flex items-center justify-center text-sm text-muted-foreground mt-4">
                  <Lock className="h-4 w-4 mr-1" />
                  Paiement sécurisé SSL
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Truck className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium">Livraison rapide</div>
                    <div className="text-sm text-muted-foreground">
                      {shippingCost === 0 ? 'Gratuite' : '7.99€'} • 3-5 jours ouvrés
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">
                Continuer mes achats
              </Link>
            </Button>
          </div>
        </div>

        {/* Free Shipping Progress */}
        {cartTotal < 75 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  🚚 Plus que {formatPrice(75 - cartTotal)} pour la livraison gratuite !
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((cartTotal / 75) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((cartTotal / 75) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
