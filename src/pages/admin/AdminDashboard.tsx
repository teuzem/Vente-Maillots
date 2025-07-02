import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  Star, 
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Textarea } from '../../components/ui/textarea';
import { useStore } from '../../store/useStore';
import { db } from '../../config/firebase';
import type { Product, Order, User, Review } from '../../types';

// Mock admin check - in a real app, this would be from the auth system
const isAdmin = (user: any) => {
  return user?.email === 'admin@sportswearstore.com' || user?.role === 'admin';
};

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  avgOrderValue: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    avgOrderValue: 0,
  });
  
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/connexion');
    } else if (!isAdmin(user)) {
      navigate('/');
      toast.error('Accès non autorisé');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];

        // Fetch reviews
        const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];

        // Calculate stats
        const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = ordersData.length;
        const totalCustomers = usersData.length;
        const totalProducts = productsData.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate changes (mock data for demo)
        const revenueChange = 12.5; // +12.5%
        const ordersChange = 8.2; // +8.2%
        const customersChange = 15.1; // +15.1%

        setStats({
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          revenueChange,
          ordersChange,
          customersChange,
          avgOrderValue,
        });

        // Generate sales data for the last 30 days
        const salesDataTemp: SalesData[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dayOrders = ordersData.filter(order => {
            const orderDate = new Date(order.createdAt);
            return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          });
          
          salesDataTemp.push({
            date: format(date, 'MMM dd', { locale: fr }),
            revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
            orders: dayOrders.length,
          });
        }

        setSalesData(salesDataTemp);
        setRecentOrders(ordersData.slice(0, 10));
        setProducts(productsData);
        setCustomers(usersData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin(user)) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || !isAdmin(user)) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{stats.revenueChange}%</span>
                  <span className="text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{stats.ordersChange}%</span>
                  <span className="text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{stats.customersChange}%</span>
                  <span className="text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Panier moyen</p>
                <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
                <div className="flex items-center text-sm">
                  <Activity className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-gray-500">{stats.totalProducts} produits</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du chiffre d'affaires</CardTitle>
            <CardDescription>30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), 'Chiffre d\'affaires']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre de commandes</CardTitle>
            <CardDescription>30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>Les 10 dernières commandes</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {order.shippingAddress.firstName[0]}{order.shippingAddress.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'shipped' ? 'secondary' :
                        order.status === 'cancelled' ? 'destructive' : 'outline'
                      }
                    >
                      {order.status === 'pending' ? 'En attente' :
                       order.status === 'confirmed' ? 'Confirmée' :
                       order.status === 'processing' ? 'En préparation' :
                       order.status === 'shipped' ? 'Expédiée' :
                       order.status === 'delivered' ? 'Livrée' :
                       order.status === 'cancelled' ? 'Annulée' : 'Remboursée'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(order.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const ProductsManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des produits</h2>
          <p className="text-gray-600">Gérez votre catalogue de produits</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produits ({products.length})</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Rechercher..." className="w-64" />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 10).map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}>
                      {product.stock} en stock
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.inStock ? 'default' : 'secondary'}>
                      {product.inStock ? 'Disponible' : 'Rupture'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const CustomersManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des clients</h2>
          <p className="text-gray-600">Gérez vos clients et leur historique</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Clients ({customers.length})</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Rechercher..." className="w-64" />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Total dépensé</TableHead>
                <TableHead>Inscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.slice(0, 10).map((customer) => {
                const customerOrders = recentOrders.filter(order => order.userId === customer.id);
                const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={customer.photoURL} />
                          <AvatarFallback>
                            {customer.displayName?.split(' ').map(n => n[0]).join('') || 
                             customer.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.displayName || 'Utilisateur'}</p>
                          <p className="text-sm text-gray-600">ID: {customer.id.slice(-8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.country || 'N/A'}</TableCell>
                    <TableCell>{customerOrders.length}</TableCell>
                    <TableCell>{formatPrice(totalSpent)}</TableCell>
                    <TableCell>
                      {format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const ReviewsManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des avis</h2>
          <p className="text-gray-600">Modérez les avis clients</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avis récents ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{review.userName}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.date), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                      {review.verified && (
                        <Badge variant="outline" className="text-xs">
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium mb-1">{review.title}</h4>
                    <p className="text-gray-600 mb-2">{review.comment}</p>
                    {review.images.length > 0 && (
                      <div className="flex gap-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt=""
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Approuver
                    </Button>
                    <Button size="sm" variant="outline">
                      Rejeter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout title="Administration - SPORTWEARstore">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen sticky top-0">
            <div className="p-6">
              <h2 className="text-xl font-bold">Administration</h2>
              <p className="text-sm text-gray-600">SPORTWEARstore</p>
            </div>
            
            <nav className="mt-6">
              <div className="px-6 space-y-1">
                <Link
                  to="/admin"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Tableau de bord
                </Link>
                
                <Link
                  to="/admin/products"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin/products' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-5 h-5 mr-3" />
                  Produits
                </Link>
                
                <Link
                  to="/admin/orders"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin/orders' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Commandes
                </Link>
                
                <Link
                  to="/admin/customers"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin/customers' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Clients
                </Link>
                
                <Link
                  to="/admin/reviews"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin/reviews' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-5 h-5 mr-3" />
                  Avis
                </Link>
                
                <Link
                  to="/admin/settings"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin/settings' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Paramètres
                </Link>
              </div>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/products" element={<ProductsManagement />} />
              <Route path="/customers" element={<CustomersManagement />} />
              <Route path="/reviews" element={<ReviewsManagement />} />
              <Route path="*" element={<DashboardOverview />} />
            </Routes>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
