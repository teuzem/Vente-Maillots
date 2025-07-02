import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Truck, 
  Shield, 
  Clock,
  Heart
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

export const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const footerLinks = {
    shop: [
      { name: 'Football', path: '/football' },
      { name: 'Basketball', path: '/basketball' },
      { name: 'Tennis', path: '/tennis' },
      { name: 'Natation', path: '/natation' },
      { name: 'Golf', path: '/golf' },
    ],
    customer: [
      { name: 'Mon Compte', path: '/profil' },
      { name: 'Mes Commandes', path: '/commandes' },
      { name: 'Service Client', path: '/support' },
      { name: 'Guide des Tailles', path: '/guide-tailles' },
      { name: 'Retours & Échanges', path: '/retours' },
    ],
    company: [
      { name: 'À Propos', path: '/about' },
      { name: 'Carrières', path: '/careers' },
      { name: 'Presse', path: '/press' },
      { name: 'Partenaires', path: '/partners' },
      { name: 'Affiliés', path: '/affiliates' },
    ],
    legal: [
      { name: 'Conditions Générales', path: '/terms' },
      { name: 'Politique de Confidentialité', path: '/privacy' },
      { name: 'Cookies', path: '/cookies' },
      { name: 'Mentions Légales', path: '/legal' },
    ],
  };

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'PayPal', icon: '🅿️' },
    { name: 'Apple Pay', icon: '📱' },
    { name: 'Google Pay', icon: '📱' },
  ];

  const features = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'Livraison Gratuite',
      description: 'Dès 75€ d\'achat',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Paiement Sécurisé',
      description: 'SSL & 3D Secure',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: '30 Jours',
      description: 'Satisfait ou remboursé',
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Service Client',
      description: '7j/7 de 9h à 18h',
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-blue-600 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl px-3 py-1 rounded-lg">
                SW
              </div>
              <span className="font-bold text-xl">SPORTWEARstore</span>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Votre destination premium pour les maillots sportifs authentiques des plus grands clubs du monde. 
              Qualité, authenticité et passion du sport depuis 2020.
            </p>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-3">
                Recevez nos offres exclusives et nouveautés
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  S'abonner
                </Button>
              </form>
            </div>
            
            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-3">Suivez-nous</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">Boutique</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Service Client</h4>
            <ul className="space-y-3">
              {footerLinks.customer.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>contact@sportswearstore.fr</span>
              </div>
              <div className="flex items-start space-x-2 text-gray-400">
                <MapPin className="h-4 w-4 mt-1" />
                <span>123 Avenue des Champs-Élysées<br />75008 Paris, France</span>
              </div>
            </div>
            
            <h5 className="font-medium mb-3">Informations légales</h5>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            © 2024 SPORTWEARstore. Tous droits réservés.
          </div>

          {/* Payment Methods */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">Paiement sécurisé :</span>
            <div className="flex items-center space-x-2">
              {paymentMethods.map((method) => (
                <div 
                  key={method.name}
                  className="bg-gray-800 p-2 rounded border border-gray-700"
                  title={method.name}
                >
                  <span className="text-lg">{method.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
