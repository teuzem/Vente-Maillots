import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCcw,
  Eye,
  Download,
  MessageSquare,
  Star,
  Search,
  Filter
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { useStore } from '../store/useStore';
import { db } from '../config/firebase';
import type { Order, OrderStatus } from '../types';

const statusConfig = {
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    progress: 20,
  },
  confirmed: {
    label: 'Confirmée',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    progress: 40,
  },
  processing: {
    label: 'En préparation',
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
    progress: 60,
  },
  shipped: {
    label: 'Expédiée',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck,
    progress: 80,
  },
  delivered: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    progress: 100,
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    progress: 0,
  },
  refunded: {
    label: 'Remboursée',
    color: 'bg-gray-100 text-gray-800',
    icon: RefreshCcw,
    progress: 0,
  },
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, currency } = useStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/connexion');
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(ordersQuery);
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount-high':
          return b.total - a.total;
        case 'amount-low':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter, sortBy]);

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  };

  const getStatusIcon = (status: OrderStatus) => {
    const IconComponent = statusConfig[status].icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const downloadInvoice = (orderId: string) => {
    // Simulate invoice download
    console.log('Downloading invoice for order:', orderId);
  };

  const trackOrder = (trackingNumber: string) => {
    // Simulate tracking
    window.open(`https://tracking.example.com/${trackingNumber}`, '_blank');
  };

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const config = statusConfig[order.status];
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Commande #{order.id.slice(-8)}
              </CardTitle>
              <CardDescription>
                {formatDate(order.createdAt)} • {order.items.length} article{order.items.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge className={config.color}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{config.label}</span>
              </Badge>
              <p className="text-lg font-bold mt-1">
                {formatPrice(order.total)}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress bar */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{config.progress}%</span>
              </div>
              <Progress value={config.progress} className="h-2" />
            </div>
          )}

          {/* Order items preview */}
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.size} • {item.color} • Qté: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatPrice(item.total)}
                </p>
              </div>
            ))}
            
            {order.items.length > 2 && (
              <p className="text-sm text-gray-600 text-center">
                +{order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''} article{order.items.length - 2 > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Shipping info */}
          {order.trackingNumber && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Numéro de suivi</p>
                  <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => trackOrder(order.trackingNumber!)}
                >
                  <Truck className="w-4 h-4 mr-1" />
                  Suivre
                </Button>
              </div>
            </div>
          )}

          {/* Estimated delivery */}
          {order.estimatedDelivery && order.status === 'shipped' && (
            <div className="text-sm text-gray-600">
              <strong>Livraison estimée:</strong> {formatDate(order.estimatedDelivery)}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/commandes/${order.id}`)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Détails
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadInvoice(order.id)}
            >
              <Download className="w-4 h-4 mr-1" />
              Facture
            </Button>

            {order.status === 'delivered' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/avis/${order.id}`)}
              >
                <Star className="w-4 h-4 mr-1" />
                Avis
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) return null;

  return (
    <Layout title="Mes Commandes - SPORTWEARstore">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mes Commandes</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Suivez vos commandes et gérez vos achats
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {orders.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total commandes
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getOrdersByStatus('delivered').length}
                </div>
                <div className="text-sm text-gray-600">
                  Livrées
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {getOrdersByStatus('shipped').length + getOrdersByStatus('processing').length}
                </div>
                <div className="text-sm text-gray-600">
                  En cours
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                </div>
                <div className="text-sm text-gray-600">
                  Total dépensé
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Rechercher par numéro ou produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmée</SelectItem>
                      <SelectItem value="processing">En préparation</SelectItem>
                      <SelectItem value="shipped">Expédiée</SelectItem>
                      <SelectItem value="delivered">Livrée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                      <SelectItem value="refunded">Remboursée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Plus récentes</SelectItem>
                      <SelectItem value="oldest">Plus anciennes</SelectItem>
                      <SelectItem value="amount-high">Montant décroissant</SelectItem>
                      <SelectItem value="amount-low">Montant croissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSortBy('newest');
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders list */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {orders.length === 0 
                    ? 'Vous n\'avez pas encore passé de commande.'
                    : 'Aucune commande ne correspond à vos critères de recherche.'
                  }
                </p>
                {orders.length === 0 && (
                  <Button onClick={() => navigate('/')}>
                    Découvrir nos produits
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Pagination placeholder for when there are many orders */}
          {filteredOrders.length > 10 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Affichage de {Math.min(10, filteredOrders.length)} sur {filteredOrders.length} commandes
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;
