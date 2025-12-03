import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import QuotationPreview from './components/QuotationPreview';
import Diy from './pages/Diy';
import Builder from './pages/Builder';
import Admin from './pages/Admin';
import { Product, CartItem } from './types';
import { ProductProvider } from './contexts/ProductContext';

const App: React.FC = () => {
  // --- Quote/Cart State Management ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuotePreviewOpen, setIsQuotePreviewOpen] = useState(false); // New State
  const [isLoaded, setIsLoaded] = useState(false);

  // Load quote from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('crypc_quote');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse quote", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save quote to LocalStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('crypc_quote', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <ProductProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
          <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
          <Navbar cartCount={cartItems.reduce((a, c) => a + c.quantity, 0)} toggleCart={toggleCart} />
          
          <div className="flex-grow">
            <Routes>
              {/* Builder now manages the global cart directly */}
              <Route path="/" element={<Builder cartItems={cartItems} setCartItems={setCartItems} />} />
              <Route path="/diy" element={<Diy addToCart={addToCart} />} />
              <Route path="/admin" element={<Admin />} />
              
              {/* Redirect old routes to home */}
              <Route path="/products" element={<Navigate to="/" replace />} />
              <Route path="/about" element={<Navigate to="/" replace />} />
              <Route path="/contact" element={<Navigate to="/" replace />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <div className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
            &copy; 2024 CryPC 估價系統 (內部專用版)
          </div>

          <CartSidebar 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cartItems={cartItems} 
            removeFromCart={removeFromCart} 
            onOpenPreview={() => setIsQuotePreviewOpen(true)}
          />
          
          {isQuotePreviewOpen && (
            <QuotationPreview 
              items={cartItems} 
              onClose={() => setIsQuotePreviewOpen(false)} 
            />
          )}
        </div>
      </HashRouter>
    </ProductProvider>
  );
};

export default App;