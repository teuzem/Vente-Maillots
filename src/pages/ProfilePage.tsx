import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Settings, 
  Bell,
  Shield,
  Camera,
  Edit2,
  Plus,
  Trash2,
  Heart,
  Package,
  Star,
  LogOut
} from 'lucide-react';
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  deleteUser,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import toast from 'react-hot-toast';

import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { useStore } from '../store/useStore';
import { auth, db, storage } from '../config/firebase';
import type { Address } from '../types';

// Validation schemas
const profileSchema = z.object({
  displayName: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
});

const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  company: z.string().optional(),
  street: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(5, 'Code postal requis'),
  country: z.string().min(2, 'Pays requis'),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Mot de passe requis'),
  newPassword: z.string().min(8, 'Minimum 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Doit contenir majuscule, minuscule et chiffre'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const countries = [
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'ES', name: 'Espagne', currency: 'EUR' },
  { code: 'IT', name: 'Italie', currency: 'EUR' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP' },
  { code: 'US', name: 'États-Unis', currency: 'USD' },
];

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
];

const currencies = [
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'USD', name: 'Dollar US ($)' },
  { code: 'GBP', name: 'Livre Sterling (£)' },
];

const sports = [
  'Football', 'Basketball', 'Tennis', 'Golf', 'Natation', 
  'Rugby', 'Volleyball', 'Baseball', 'Hockey', 'Course à pied'
];

const teams = [
  'Real Madrid', 'FC Barcelone', 'Arsenal', 'Liverpool', 'PSG', 
  'Bayern Munich', 'Manchester United', 'Chelsea', 'Juventus', 
  'AC Milan', 'Lakers', 'Golden State Warriors', 'Boston Celtics'
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    user, 
    setUser,
    isAuthenticated,
    language,
    currency,
    theme,
    setLanguage,
    setCurrency,
    setTheme,
    setAuthenticated
  } = useStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Forms
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      country: user?.country || 'FR',
    },
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: 'home',
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'FR',
      phone: '',
      isDefault: false,
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/connexion');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  // Upload profile picture
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    try {
      // Delete old profile picture if exists
      if (user.photoURL && user.photoURL.includes('firebase')) {
        const oldRef = ref(storage, user.photoURL);
        await deleteObject(oldRef).catch(() => {});
      }

      // Upload new picture
      const fileRef = ref(storage, `users/${user.id}/profile.jpg`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL,
        });
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.id), {
        photoURL: downloadURL,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setUser({
        ...user,
        photoURL: downloadURL,
      });

      toast.success('Photo de profil mise à jour');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName,
        });

        // Update email if changed
        if (data.email !== user.email) {
          await updateEmail(auth.currentUser, data.email);
        }
      }

      // Update Firestore
      const updatedUser = {
        ...user,
        displayName: data.displayName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        country: data.country,
      };

      await updateDoc(doc(db, 'users', user.id), {
        ...updatedUser,
        updatedAt: serverTimestamp(),
      });

      setUser(updatedUser);
      toast.success('Profil mis à jour');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Veuillez vous reconnecter pour modifier votre email');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (data: PasswordFormData) => {
    if (!user || !auth.currentUser?.email) return;

    setIsLoading(true);
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        data.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, data.newPassword);

      toast.success('Mot de passe mis à jour');
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Mot de passe actuel incorrect');
      } else {
        toast.error('Erreur lors de la mise à jour du mot de passe');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add/Update address
  const handleSaveAddress = async (data: AddressFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const address: Address = {
        id: editingAddress?.id || Date.now().toString(),
        type: data.type,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company || '',
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone || '',
        isDefault: data.isDefault || false,
      };

      let updatedAddresses = [...(user.addresses || [])];
      
      if (editingAddress) {
        // Update existing
        const index = updatedAddresses.findIndex(a => a.id === editingAddress.id);
        if (index !== -1) {
          updatedAddresses[index] = address;
        }
      } else {
        // Add new
        updatedAddresses.push(address);
      }

      // If this is default, remove default from others
      if (data.isDefault) {
        updatedAddresses = updatedAddresses.map(a => ({
          ...a,
          isDefault: a.id === address.id,
        }));
      }

      const updatedUser = {
        ...user,
        addresses: updatedAddresses,
      };

      await updateDoc(doc(db, 'users', user.id), {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });

      setUser(updatedUser);
      setEditingAddress(null);
      setShowAddAddress(false);
      addressForm.reset();
      toast.success(editingAddress ? 'Adresse mise à jour' : 'Adresse ajoutée');
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;

    try {
      const updatedAddresses = user.addresses?.filter(a => a.id !== addressId) || [];
      
      const updatedUser = {
        ...user,
        addresses: updatedAddresses,
      };

      await updateDoc(doc(db, 'users', user.id), {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });

      setUser(updatedUser);
      toast.success('Adresse supprimée');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Update preferences
  const handleUpdatePreferences = async (key: string, value: any) => {
    if (!user) return;

    try {
      const updatedPreferences = {
        ...user.preferences,
        [key]: value,
      };

      const updatedUser = {
        ...user,
        preferences: updatedPreferences,
      };

      await updateDoc(doc(db, 'users', user.id), {
        preferences: updatedPreferences,
        updatedAt: serverTimestamp(),
      });

      setUser(updatedUser);

      // Update global state
      if (key === 'language') setLanguage(value);
      if (key === 'currency') setCurrency(value);
      if (key === 'theme') setTheme(value);

      toast.success('Préférences mises à jour');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user) return;

    try {
      // Delete user document
      await updateDoc(doc(db, 'users', user.id), {
        deleted: true,
        deletedAt: serverTimestamp(),
      });

      // Delete Firebase Auth user
      await deleteUser(auth.currentUser);

      toast.success('Compte supprimé');
      setUser(null);
      setAuthenticated(false);
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Veuillez vous reconnecter pour supprimer votre compte');
      } else {
        toast.error('Erreur lors de la suppression du compte');
      }
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthenticated(false);
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <Layout title="Mon Profil - SPORTWEARstore">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback>
                        {user.displayName?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureUpload}
                    />
                  </div>
                  
                  <h3 className="font-semibold text-lg">{user.displayName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {user.email}
                  </p>
                  
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full justify-center">
                      Membre depuis {new Date(user.createdAt).getFullYear()}
                    </Badge>
                    {user.preferences?.favoriteTeams && user.preferences.favoriteTeams.length > 0 && (
                      <Badge variant="outline" className="w-full justify-center">
                        ⚽ {user.preferences.favoriteTeams.length} équipe{user.preferences.favoriteTeams.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/commandes')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Mes commandes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/favoris')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Mes favoris
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="addresses">Adresses</TabsTrigger>
                  <TabsTrigger value="preferences">Préférences</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                </TabsList>

                {/* Profile tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>
                        Mettez à jour vos informations de profil
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="displayName">Nom complet</Label>
                            <Input
                              id="displayName"
                              {...profileForm.register('displayName')}
                            />
                            {profileForm.formState.errors.displayName && (
                              <p className="text-sm text-red-500">{profileForm.formState.errors.displayName.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              {...profileForm.register('email')}
                            />
                            {profileForm.formState.errors.email && (
                              <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phoneNumber">Téléphone</Label>
                            <Input
                              id="phoneNumber"
                              {...profileForm.register('phoneNumber')}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="country">Pays</Label>
                            <Select 
                              value={profileForm.watch('country')}
                              onValueChange={(value) => profileForm.setValue('country', value)}
                            >
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

                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Addresses tab */}
                <TabsContent value="addresses" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Mes adresses</CardTitle>
                          <CardDescription>
                            Gérez vos adresses de livraison
                          </CardDescription>
                        </div>
                        <Button onClick={() => setShowAddAddress(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {user.addresses && user.addresses.length > 0 ? (
                        <div className="space-y-4">
                          {user.addresses.map((address) => (
                            <Card key={address.id} className="border">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant={address.isDefault ? "default" : "secondary"}>
                                        {address.type === 'home' ? 'Domicile' : 
                                         address.type === 'work' ? 'Travail' : 'Autre'}
                                      </Badge>
                                      {address.isDefault && (
                                        <Badge variant="outline">Par défaut</Badge>
                                      )}
                                    </div>
                                    
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
                                      {address.postalCode} {address.city}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {countries.find(c => c.code === address.country)?.name}
                                    </p>
                                    {address.phone && (
                                      <p className="text-sm text-gray-600">{address.phone}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingAddress(address);
                                        addressForm.reset(address);
                                      }}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteAddress(address.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600">Aucune adresse enregistrée</p>
                          <Button 
                            className="mt-4"
                            onClick={() => setShowAddAddress(true)}
                          >
                            Ajouter votre première adresse
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Add/Edit address form */}
                  {(showAddAddress || editingAddress) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {editingAddress ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={addressForm.handleSubmit(handleSaveAddress)} className="space-y-4">
                          <div>
                            <Label>Type d'adresse</Label>
                            <Select 
                              value={addressForm.watch('type')}
                              onValueChange={(value) => addressForm.setValue('type', value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home">Domicile</SelectItem>
                                <SelectItem value="work">Travail</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="addressFirstName">Prénom</Label>
                              <Input
                                id="addressFirstName"
                                {...addressForm.register('firstName')}
                              />
                            </div>
                            <div>
                              <Label htmlFor="addressLastName">Nom</Label>
                              <Input
                                id="addressLastName"
                                {...addressForm.register('lastName')}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="addressCompany">Entreprise (optionnel)</Label>
                            <Input
                              id="addressCompany"
                              {...addressForm.register('company')}
                            />
                          </div>

                          <div>
                            <Label htmlFor="addressStreet">Adresse</Label>
                            <Input
                              id="addressStreet"
                              {...addressForm.register('street')}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="addressCity">Ville</Label>
                              <Input
                                id="addressCity"
                                {...addressForm.register('city')}
                              />
                            </div>
                            <div>
                              <Label htmlFor="addressPostalCode">Code postal</Label>
                              <Input
                                id="addressPostalCode"
                                {...addressForm.register('postalCode')}
                              />
                            </div>
                            <div>
                              <Label>Pays</Label>
                              <Select 
                                value={addressForm.watch('country')}
                                onValueChange={(value) => addressForm.setValue('country', value)}
                              >
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
                            <Label htmlFor="addressPhone">Téléphone (optionnel)</Label>
                            <Input
                              id="addressPhone"
                              {...addressForm.register('phone')}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="addressDefault"
                              className="rounded"
                              {...addressForm.register('isDefault')}
                            />
                            <Label htmlFor="addressDefault" className="text-sm">
                              Définir comme adresse par défaut
                            </Label>
                          </div>

                          <div className="flex gap-2">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                setShowAddAddress(false);
                                setEditingAddress(null);
                                addressForm.reset();
                              }}
                            >
                              Annuler
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Preferences tab */}
                <TabsContent value="preferences" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Préférences</CardTitle>
                      <CardDescription>
                        Personnalisez votre expérience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Language & Currency */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Langue</Label>
                          <Select 
                            value={user.preferences?.language || 'fr'}
                            onValueChange={(value) => handleUpdatePreferences('language', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Devise</Label>
                          <Select 
                            value={user.preferences?.currency || 'EUR'}
                            onValueChange={(value) => handleUpdatePreferences('currency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((curr) => (
                                <SelectItem key={curr.code} value={curr.code}>
                                  {curr.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Theme */}
                      <div>
                        <Label>Thème</Label>
                        <Select 
                          value={user.preferences?.theme || 'light'}
                          onValueChange={(value) => handleUpdatePreferences('theme', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Clair</SelectItem>
                            <SelectItem value="dark">Sombre</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Notifications */}
                      <div className="space-y-4">
                        <Label>Notifications</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Notifications push</p>
                              <p className="text-sm text-gray-600">Recevoir des notifications dans le navigateur</p>
                            </div>
                            <Switch
                              checked={user.preferences?.notifications || false}
                              onCheckedChange={(checked) => handleUpdatePreferences('notifications', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Newsletter</p>
                              <p className="text-sm text-gray-600">Recevoir nos dernières actualités et offres</p>
                            </div>
                            <Switch
                              checked={user.preferences?.newsletter || false}
                              onCheckedChange={(checked) => handleUpdatePreferences('newsletter', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Favorite teams */}
                      <div>
                        <Label>Équipes favorites</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          {teams.map((team) => (
                            <Button
                              key={team}
                              type="button"
                              variant={user.preferences?.favoriteTeams?.includes(team) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const currentTeams = user.preferences?.favoriteTeams || [];
                                const updatedTeams = currentTeams.includes(team)
                                  ? currentTeams.filter(t => t !== team)
                                  : [...currentTeams, team];
                                handleUpdatePreferences('favoriteTeams', updatedTeams);
                              }}
                              className="text-xs h-8"
                            >
                              {team}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Favorite sports */}
                      <div>
                        <Label>Sports favoris</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          {sports.map((sport) => (
                            <Button
                              key={sport}
                              type="button"
                              variant={user.preferences?.favoriteSports?.includes(sport) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const currentSports = user.preferences?.favoriteSports || [];
                                const updatedSports = currentSports.includes(sport)
                                  ? currentSports.filter(s => s !== sport)
                                  : [...currentSports, sport];
                                handleUpdatePreferences('favoriteSports', updatedSports);
                              }}
                              className="text-xs h-8"
                            >
                              {sport}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security tab */}
                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Modifier le mot de passe</CardTitle>
                      <CardDescription>
                        Changez votre mot de passe pour sécuriser votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            {...passwordForm.register('currentPassword')}
                          />
                          {passwordForm.formState.errors.currentPassword && (
                            <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            {...passwordForm.register('newPassword')}
                          />
                          {passwordForm.formState.errors.newPassword && (
                            <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            {...passwordForm.register('confirmPassword')}
                          />
                          {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                          )}
                        </div>

                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-600">Zone de danger</CardTitle>
                      <CardDescription>
                        Actions irréversibles concernant votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            Supprimer mon compte
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Votre compte, vos commandes et toutes vos données seront définitivement supprimées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                              Supprimer définitivement
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
