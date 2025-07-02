import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, EyeOff, Mail, Chrome, UserIcon } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { auth, db, googleProvider, facebookProvider } from '../../config/firebase';
import { useStore } from '../../store/useStore';
import type { User } from '../../types';

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Adresse email invalide'),
  password: z.string()
    .min(8, 'Mot de passe trop court (minimum 8 caractères)')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions'),
  newsletter: z.boolean().optional(),
  country: z.string().optional(),
  favoriteTeams: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const countries = [
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'ES', name: 'Espagne', currency: 'EUR' },
  { code: 'IT', name: 'Italie', currency: 'EUR' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP' },
  { code: 'US', name: 'États-Unis', currency: 'USD' },
  { code: 'CA', name: 'Canada', currency: 'USD' },
  { code: 'BE', name: 'Belgique', currency: 'EUR' },
  { code: 'CH', name: 'Suisse', currency: 'EUR' },
  { code: 'NL', name: 'Pays-Bas', currency: 'EUR' },
];

const popularTeams = [
  'Real Madrid', 'FC Barcelone', 'Arsenal', 'Liverpool', 'PSG', 
  'Bayern Munich', 'Manchester United', 'Chelsea', 'Juventus', 
  'AC Milan', 'Lakers', 'Golden State Warriors', 'Boston Celtics'
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setAuthenticated, addNotification } = useStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      newsletter: true,
      country: 'FR',
      favoriteTeams: [],
    },
  });

  // Email/Password Registration
  const handleEmailRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Update profile with display name
      await updateProfile(firebaseUser, {
        displayName: `${data.firstName} ${data.lastName}`,
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user document in Firestore
      const selectedCountry = countries.find(c => c.code === data.country);
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: firebaseUser.photoURL || undefined,
        phoneNumber: firebaseUser.phoneNumber || undefined,
        country: data.country,
        addresses: [],
        preferences: {
          language: 'fr',
          currency: selectedCountry?.currency as 'EUR' | 'USD' | 'GBP' || 'EUR',
          newsletter: data.newsletter || false,
          notifications: true,
          favoriteTeams: selectedTeams,
          favoriteSports: [],
          theme: 'light',
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      setUser(userData);
      setAuthenticated(true);
      
      addNotification({
        type: 'success',
        title: 'Compte créé avec succès',
        message: `Bienvenue ${userData.displayName} ! Un email de vérification a été envoyé.`,
        read: false,
      });

      toast.success('Compte créé avec succès ! Vérifiez votre email.');
      navigate('/');

    } catch (error: any) {
      console.error('Error creating account:', error);
      let errorMessage = 'Erreur lors de la création du compte';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mot de passe trop faible';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign Up
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      // Create user document
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined,
        addresses: [],
        preferences: {
          language: 'fr',
          currency: 'EUR',
          newsletter: false,
          notifications: true,
          favoriteTeams: [],
          favoriteSports: [],
          theme: 'light',
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      setUser(userData);
      setAuthenticated(true);
      
      addNotification({
        type: 'success',
        title: 'Compte créé avec succès',
        message: `Bienvenue ${userData.displayName} !`,
        read: false,
      });

      toast.success('Compte créé avec Google !');
      navigate('/');

    } catch (error: any) {
      console.error('Error signing up with Google:', error);
      toast.error('Erreur lors de la création du compte avec Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook Sign Up
  const handleFacebookSignUp = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, facebookProvider);
      const firebaseUser = userCredential.user;

      // Create user document
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined,
        addresses: [],
        preferences: {
          language: 'fr',
          currency: 'EUR',
          newsletter: false,
          notifications: true,
          favoriteTeams: [],
          favoriteSports: [],
          theme: 'light',
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      setUser(userData);
      setAuthenticated(true);
      
      addNotification({
        type: 'success',
        title: 'Compte créé avec succès',
        message: `Bienvenue ${userData.displayName} !`,
        read: false,
      });

      toast.success('Compte créé avec Facebook !');
      navigate('/');

    } catch (error: any) {
      console.error('Error signing up with Facebook:', error);
      toast.error('Erreur lors de la création du compte avec Facebook');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => 
      prev.includes(team) 
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };

  return (
    <Layout 
      title="Inscription - SPORTWEARstore"
      description="Créez votre compte SPORTWEARstore pour profiter d'une expérience personnalisée et de nos offres exclusives."
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Créer un compte
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Rejoignez la communauté SPORTWEARstore
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 shadow-xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center">S'inscrire</CardTitle>
              <CardDescription className="text-center">
                Créez votre compte pour une expérience personnalisée
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Social Registration */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  S'inscrire avec Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleFacebookSignUp}
                  disabled={isLoading}
                >
                  <FaFacebook className="w-4 h-4 mr-2" />
                  S'inscrire avec Facebook
                </Button>
              </div>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 text-sm text-gray-500">
                  ou avec votre email
                </span>
              </div>

              {/* Email Registration Form */}
              <form onSubmit={form.handleSubmit(handleEmailRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      {...form.register('firstName')}
                      className={form.formState.errors.firstName ? 'border-red-500' : ''}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      {...form.register('lastName')}
                      className={form.formState.errors.lastName ? 'border-red-500' : ''}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean.dupont@email.com"
                    {...form.register('email')}
                    className={form.formState.errors.email ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Select {...form.register('country')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre pays" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...form.register('password')}
                        className={form.formState.errors.password ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...form.register('confirmPassword')}
                        className={form.formState.errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* Favorite Teams */}
                <div className="space-y-2">
                  <Label>Équipes favorites (optionnel)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {popularTeams.map((team) => (
                      <Button
                        key={team}
                        type="button"
                        variant={selectedTeams.includes(team) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTeam(team)}
                        className="text-xs h-8"
                      >
                        {team}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="acceptTerms" 
                      {...form.register('acceptTerms')}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm">
                      J'accepte les{' '}
                      <Link to="/conditions" className="text-blue-600 hover:text-blue-800">
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link to="/confidentialite" className="text-blue-600 hover:text-blue-800">
                        politique de confidentialité
                      </Link>
                    </Label>
                  </div>
                  {form.formState.errors.acceptTerms && (
                    <p className="text-sm text-red-500">{form.formState.errors.acceptTerms.message}</p>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="newsletter" 
                      {...form.register('newsletter')}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Je souhaite recevoir la newsletter et les offres exclusives
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Création du compte...' : 'Créer mon compte'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Déjà un compte ?{' '}
                  <Link
                    to="/connexion"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
