import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Shield, 
  Check, 
  ArrowLeft,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { FaPaypal, FaApplePay, FaGooglePay } from 'react-icons/fa';
import { doc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';

import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import { useStore } from '../store/useStore';
import { db } from '../config/firebase';
import type { Address, Order, OrderItem, PaymentMethod } from '../types';

// Validation schemas
const addressSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  company: z.string().optional(),
  street: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(5, 'Code postal requis'),
  country: z.string().min(2, 'Pays requis'),
  phone: z.string().optional(),
});

const paymentSchema = z.object({
  method: z.enum(['card', 'paypal', 'applepay', 'googlepay']),
  cardNumber: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
  cardName: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;

const countries = [
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'ES', name: 'Espagne', currency: 'EUR' },
  { code: 'IT', name: 'Italie', currency: 'EUR' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP' },
  { code: 'US', name: 'États-Unis', currency: 'USD' },
];

const shippingOptions = [
  {
    id: 'standard',
    name: 'Livraison Standard',
    description: '5-7 jours ouvrés',
    price: 4.99,
    estimated: '5-7 jours',
  },
  {
    id: 'express',
    name: 'Livraison Express',
    description: '2-3 jours ouvrés',
    price: 9.99,
    estimated: '2-3 jours',
  },
  {
    id: 'overnight',
    name: 'Livraison 24h',
    description: 'Livraison le lendemain',
    price: 19.99,
    estimated: '24h',
  },
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    cart, 
    cartTotal, 
    currency, 
    clearCart,
    addNotification 
  } = useStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);

  // Forms
  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: user?.displayName?.split(' ')[0] || '',
      lastName: user?.displayName?.split(' ')[1] || '',
      company: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'FR',
      phone: user?.phoneNumber || '',
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'card',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardName: user?.displayName || '',
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/connexion', { 
        state: { from: { pathname: '/commande' } }
      });
    }
  }, [isAuthenticated, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/panier');
    }
  }, [cart, navigate]);

  // Calculate totals
  const selectedShippingOption = shippingOptions.find(s => s.id === selectedShipping);
  const shippingCost = selectedShippingOption?.price || 0;
  const subtotal = cartTotal;
  const discount = promoDiscount;
  const taxRate = 0.20; // 20% TVA
  const taxAmount = (subtotal + shippingCost - discount) * taxRate;
  const total = subtotal + shippingCost + taxAmount - discount;

  // Handle address selection
  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsAddingAddress(false);
  };

  // Add new address
  const handleAddAddress = async (data: AddressFormData) => {
    if (!user) return;
    
    try {
      const newAddress: Address = {
        id: Date.now().toString(),
        type: 'home',
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: false,
      };
      
      // In a real app, save to user's addresses in Firestore
      setSelectedAddress(newAddress);
      setIsAddingAddress(false);
      toast.success('Adresse ajoutée');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Erreur lors de l\'ajout de l\'adresse');
    }
  };

  // Apply promo code
  const handleApplyPromo = () => {
    // Simulate promo code validation
    const validCodes = {
      'WELCOME10': 10,
      'SPORT15': 15,
      'VIP20': 20,
    };
    
    const code = promoCode.toUpperCase();
    if (validCodes[code as keyof typeof validCodes]) {
      const discount = (subtotal * validCodes[code as keyof typeof validCodes]) / 100;
      setPromoDiscount(discount);
      toast.success(`Code promo appliqué ! -${validCodes[code as keyof typeof validCodes]}%`);
    } else {
      toast.error('Code promo invalide');
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) return;
    
    setIsLoading(true);
    try {
      // Create order items
      const orderItems: OrderItem[] = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0],
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity,
      }));

      // Create order
      const orderData: Omit<Order, 'id'> = {
        userId: user.id,
        items: orderItems,
        subtotal,
        shipping: shippingCost,
        tax: taxAmount,
        total,
        currency,
        status: 'pending',
        shippingAddress: selectedAddress,
        billingAddress: selectedAddress, // Same as shipping for now
        paymentMethod: {
          type: paymentForm.getValues('method'),
          last4: paymentForm.getValues('cardNumber')?.slice(-4),
          brand: 'visa', // Would be detected from card number
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save order to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update product stock
      for (const item of cart) {
        const productRef = doc(db, 'products', item.product.id);
        await updateDoc(productRef, {
          stock: increment(-item.quantity),
        });
      }

      // Clear cart
      clearCart();

      // Add notification
      addNotification({
        type: 'success',
        title: 'Commande confirmée',
        message: `Votre commande #${orderRef.id.slice(-8)} a été confirmée`,
        read: false,
      });

      toast.success('Commande confirmée !');
      navigate(`/commandes/${orderRef.id}`);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Erreur lors de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Adresse de livraison</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingAddress(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle adresse
        </Button>
      </div>

      {/* Existing addresses */}
      {user?.addresses && user.addresses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Adresses sauvegardées</h3>
          {user.addresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer transition-all ${
                selectedAddress?.id === address.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSelectAddress(address)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.company && (
                      <p className="text-sm text-gray-600">{address.company}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {address.street}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.postalCode} {address.city}, {address.country}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-gray-600">{address.phone}</p>
                    )}
                  </div>
                  {address.isDefault && (
                    <Badge variant="secondary">Par défaut</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new address form */}
      {isAddingAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle adresse</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addressForm.handleSubmit(handleAddAddress)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    {...addressForm.register('firstName')}
                  />
                  {addressForm.formState.errors.firstName && (
                    <p className="text-sm text-red-500">{addressForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    {...addressForm.register('lastName')}
                  />
                  {addressForm.formState.errors.lastName && (
                    <p className="text-sm text-red-500">{addressForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="company">Entreprise (optionnel)</Label>
                <Input
                  id="company"
                  {...addressForm.register('company')}
                />
              </div>

              <div>
                <Label htmlFor="street">Adresse</Label>
                <Input
                  id="street"
                  {...addressForm.register('street')}
                />
                {addressForm.formState.errors.street && (
                  <p className="text-sm text-red-500">{addressForm.formState.errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    {...addressForm.register('city')}
                  />
                  {addressForm.formState.errors.city && (
                    <p className="text-sm text-red-500">{addressForm.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    {...addressForm.register('postalCode')}
                  />
                  {addressForm.formState.errors.postalCode && (
                    <p className="text-sm text-red-500">{addressForm.formState.errors.postalCode.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Select {...addressForm.register('country')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  {...addressForm.register('phone')}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Sauvegarder</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsAddingAddress(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Continue button */}
      {selectedAddress && (
        <div className="flex justify-end">
          <Button onClick={() => setCurrentStep(2)}>
            Continuer vers la livraison
          </Button>
        </div>
      )}
    </div>
  );

  const renderShippingStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Options de livraison</h2>
      
      <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
        <div className="space-y-3">
          {shippingOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label
                htmlFor={option.id}
                className="flex-1 cursor-pointer p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span className="font-medium">{option.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <span className="font-medium">
                    {option.price === 0 ? 'Gratuit' : `${option.price.toFixed(2)} €`}
                  </span>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button onClick={() => setCurrentStep(3)}>
          Continuer vers le paiement
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Paiement</h2>
      
      {/* Payment methods */}
      <div className="space-y-4">
        <RadioGroup 
          value={paymentForm.watch('method')} 
          onValueChange={(value) => paymentForm.setValue('method', value as any)}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="w-4 h-4" />
                Carte bancaire
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                <FaPaypal className="w-4 h-4" />
                PayPal
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="applepay" id="applepay" />
              <Label htmlFor="applepay" className="flex items-center gap-2 cursor-pointer">
                <FaApplePay className="w-4 h-4" />
                Apple Pay
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="googlepay" id="googlepay" />
              <Label htmlFor="googlepay" className="flex items-center gap-2 cursor-pointer">
                <FaGooglePay className="w-4 h-4" />
                Google Pay
              </Label>
            </div>
          </div>
        </RadioGroup>

        {/* Card form */}
        {paymentForm.watch('method') === 'card' && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  {...paymentForm.register('cardNumber')}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Mois</Label>
                  <Select {...paymentForm.register('expiryMonth')}>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="expiryYear">Année</Label>
                  <Select {...paymentForm.register('expiryYear')}>
                    <SelectTrigger>
                      <SelectValue placeholder="AA" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                          {String(new Date().getFullYear() + i).slice(-2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={4}
                    {...paymentForm.register('cvv')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cardName">Nom sur la carte</Label>
                <Input
                  id="cardName"
                  {...paymentForm.register('cardName')}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Promo code */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Code promo"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button variant="outline" onClick={handleApplyPromo}>
              Appliquer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button 
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Traitement...' : `Finaliser la commande (${total.toFixed(2)} €)`}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout 
      title="Commande - SPORTWEARstore"
      description="Finalisez votre commande sur SPORTWEARstore de manière sécurisée"
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Finaliser votre commande</h1>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Suivez les étapes pour compléter votre achat
            </p>
          </div>

          {renderStepIndicator()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {currentStep === 1 && renderAddressStep()}
                  {currentStep === 2 && renderShippingStep()}
                  {currentStep === 3 && renderPaymentStep()}
                </CardContent>
              </Card>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Récapitulatif de commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart items */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.size} • {item.color} • Qté: {item.quantity}
                          </p>
                          <p className="font-medium">
                            {(item.product.price * item.quantity).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span>
                        {shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)} €`}
                      </span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Réduction</span>
                        <span>-{discount.toFixed(2)} €</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>TVA (20%)</span>
                      <span>{taxAmount.toFixed(2)} €</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{total.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Security badges */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Paiement 100% sécurisé</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
