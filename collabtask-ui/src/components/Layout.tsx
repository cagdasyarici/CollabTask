import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavbar = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};