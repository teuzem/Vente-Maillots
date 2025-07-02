import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  setPersistence, 
  browserSessionPersistence,
  browserLocalPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, EyeOff, Mail, Phone, Chrome } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { auth, db, googleProvider, facebookProvider } from '../../config/firebase';
import { useStore } from '../../store/useStore';
import type { User } from '../../types';

// Validation schemas
const emailSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (minimum 6 caractères)'),
  rememberMe: z.boolean().optional(),
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, 'Numéro de téléphone invalide'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setAuthenticated, addNotification } = useStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'phone' | 'verify'>('phone');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Redirect URL après connexion
  const from = (location.state as any)?.from?.pathname || '/';

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  // Configure reCAPTCHA for phone auth
  useEffect(() => {
    const setupRecaptcha = () => {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
        });
      }
    };

    setupRecaptcha();
    
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    };
  }, []);

  // Email/Password Sign In
  const handleEmailSignIn = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      // Set persistence based on remember me
      await setPersistence(
        auth, 
        data.rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData: User;

      if (userDoc.exists()) {
        userData = userDoc.data() as User;
        // Update last login
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
      } else {
        // Create new user document
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
          phoneNumber: firebaseUser.phoneNumber || undefined,
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

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      }

      setUser(userData);
      setAuthenticated(true);
      
      addNotification({
        type: 'success',
        title: 'Connexion réussie',
        message: `Bienvenue ${userData.displayName || userData.email} !`,
        read: false,
      });

      toast.success('Connexion réussie !');
      navigate(from, { replace: true });

    } catch (error: any) {
      console.error('Error signing in:', error);
      let errorMessage = 'Erreur de connexion';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cette adresse email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Phone Number Sign In
  const handlePhoneSignIn = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, data.phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setPhoneStep('verify');
      toast.success('Code de vérification envoyé !');
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast.error('Erreur lors de l\'envoi du code de vérification');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Phone Code
  const handleVerifyCode = async () => {
    if (!confirmationResult || !verificationCode) return;
    
    setIsLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      const firebaseUser = userCredential.user;

      // Handle user data similar to email sign in
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData: User;

      if (userDoc.exists()) {
        userData = userDoc.data() as User;
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
      } else {
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          phoneNumber: firebaseUser.phoneNumber || '',
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

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      }

      setUser(userData);
      setAuthenticated(true);
      
      addNotification({
        type: 'success',
        title: 'Connexion réussie',
        message: `Bienvenue !`,
        read: false,
      });

      toast.success('Connexion réussie !');
      navigate(from, { replace: true });

    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast.error('Code de vérification incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      // Handle user data
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData: User;

      if (userDoc.exists()) {
        userData = userDoc.data() as User;
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          lastLoginAt: serverTimestamp(),
          displayName: firebaseUser.displayName || userData.displayName,
          photoURL: firebaseUser.photoURL || userData.photoURL,
        }, { merge: true });
      } else {
        userData = {
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

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      }

      setUser(userData);
      setAuthenticated(true);
      
      addNotification({
        type: 'success',
        title: 'Connexion réussie',
        message: `Bienvenue ${userData.displayName} !`,
        read: false,
      });

      toast.success('Connexion avec Google réussie !');
      navigate(from, { replace: true });

    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error('Erreur de connexion avec Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook Sign In
  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, facebookProvider);
      const firebaseUser = userCredential.user;

      // Handle user data similar to Google
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData: User;

      if (userDoc.exists()) {
        userData = userDoc.data() as User;
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          lastLoginAt: serverTimestamp(),
          displayName: firebaseUser.displayName || userData.displayName,
          photoURL: firebaseUser.photoURL || userData.photoURL,
        }, { merge: true });
      } else {
        userData = {
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

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      }

      setUser(userData);
      setAuthenticated(true);
      
      addNotification({
        type: 'success',
        title: 'Connexion réussie',
        message: `Bienvenue ${userData.displayName} !`,
        read: false,
      });

      toast.success('Connexion avec Facebook réussie !');
      navigate(from, { replace: true });

    } catch (error: any) {
      console.error('Error signing in with Facebook:', error);
      toast.error('Erreur de connexion avec Facebook');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout 
      title="Connexion - SPORTWEARstore"
      description="Connectez-vous à votre compte SPORTWEARstore pour accéder à vos commandes, favoris et profil."
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Connexion
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Accédez à votre compte SPORTWEARstore
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 shadow-xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center">Se connecter</CardTitle>
              <CardDescription className="text-center">
                Choisissez votre méthode de connexion préférée
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="email" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <form onSubmit={emailForm.handleSubmit(handleEmailSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        {...emailForm.register('email')}
                        className={emailForm.formState.errors.email ? 'border-red-500' : ''}
                      />
                      {emailForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...emailForm.register('password')}
                          className={emailForm.formState.errors.password ? 'border-red-500' : ''}
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
                      {emailForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{emailForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rememberMe" 
                        {...emailForm.register('rememberMe')}
                      />
                      <Label htmlFor="rememberMe" className="text-sm">
                        Se souvenir de moi
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  {phoneStep === 'phone' ? (
                    <form onSubmit={phoneForm.handleSubmit(handlePhoneSignIn)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+33 6 12 34 56 78"
                          {...phoneForm.register('phoneNumber')}
                          className={phoneForm.formState.errors.phoneNumber ? 'border-red-500' : ''}
                        />
                        {phoneForm.formState.errors.phoneNumber && (
                          <p className="text-sm text-red-500">{phoneForm.formState.errors.phoneNumber.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Envoi...' : 'Envoyer le code'}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="verificationCode">Code de vérification</Label>
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder="123456"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                        />
                        <p className="text-sm text-gray-600">
                          Code envoyé par SMS au {phoneForm.getValues('phoneNumber')}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setPhoneStep('phone')}
                          className="flex-1"
                        >
                          Retour
                        </Button>
                        <Button
                          onClick={handleVerifyCode}
                          disabled={isLoading || verificationCode.length !== 6}
                          className="flex-1"
                        >
                          {isLoading ? 'Vérification...' : 'Vérifier'}
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 text-sm text-gray-500">
                  ou
                </span>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continuer avec Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleFacebookSignIn}
                  disabled={isLoading}
                >
                  <FaFacebook className="w-4 h-4 mr-2" />
                  Continuer avec Facebook
                </Button>
              </div>

              <div className="text-center mt-6 space-y-2">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  Mot de passe oublié ?
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pas encore de compte ?{' '}
                  <Link
                    to="/inscription"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
                  >
                    Créer un compte
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* reCAPTCHA container for phone auth */}
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
