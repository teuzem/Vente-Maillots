import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatSupport } from '../support/ChatSupport';
import { useStore } from '../../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
  title?: string;
  description?: string;
  keywords?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showFooter = true,
  className = '',
  title,
  description,
  keywords
}) => {
  const { isAuthenticated } = useStore();

  return (
    <>
      {/* SEO Meta Tags */}
      {title && (
        <Helmet>
          <title>{title}</title>
          {description && <meta name="description" content={description} />}
          {keywords && <meta name="keywords" content={keywords} />}
        </Helmet>
      )}
      
      <div className={`min-h-screen flex flex-col ${className}`}>
        <Header />
        
        <main className="flex-1">
          {children}
        </main>
        
        {showFooter && <Footer />}
        
        {/* Chat Support - Always available */}
        <ChatSupport />
      </div>
    </>
  );
};
