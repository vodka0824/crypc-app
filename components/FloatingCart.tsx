import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface FloatingCartProps {
  cartCount: number;
  toggleCart: () => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ cartCount, toggleCart }) => {
  return (
    <button
      onClick={toggleCart}
      className="fixed bottom-6 right-6 z-[9999] bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      aria-label="開啟報價單"
    >
      <div className="relative">
        <ShoppingBag className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
            {cartCount}
          </span>
        )}
      </div>
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold whitespace-nowrap">
        報價單
      </span>
    </button>
  );
};

export default FloatingCart;