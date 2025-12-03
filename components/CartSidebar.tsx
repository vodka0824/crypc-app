import React, { useState } from 'react';
import { X, Trash2, Loader2, FileText, Printer, Eye } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  removeFromCart: (id: string) => void;
  onOpenPreview: () => void; // New Prop
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cartItems, removeFromCart, onOpenPreview }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleReview = () => {
    setIsProcessing(true);
    // Simulate short loading
    setTimeout(() => {
        setIsProcessing(false);
        onClose(); // Close sidebar
        onOpenPreview(); // Open Preview
    }, 500);
  };

  return (
    <div className={`fixed inset-0 z-[10000] overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar panel */}
      <div className={`absolute inset-y-0 right-0 max-w-md w-full flex transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full w-full bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              目前報價內容
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p>報價單目前是空的。</p>
                <button onClick={onClose} className="mt-4 text-blue-600 font-medium hover:underline">
                  返回新增項目
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  {/* Removed Image Section */}
                  
                  <div className="flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3 className="line-clamp-2">{item.name}</h3>
                        <p className="ml-4 flex-shrink-0 font-mono">{item.price.toLocaleString()}</p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{item.category}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm mt-2">
                      <p className="text-gray-500">數量 {item.quantity}</p>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> 移除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 p-6 space-y-4 bg-gray-50">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>總計金額</p>
                <p className="font-mono text-xl">{total.toLocaleString()}</p>
              </div>
              
              <button
                onClick={handleReview}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-transparent bg-black px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    準備中...
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                    預覽正式報價單
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;