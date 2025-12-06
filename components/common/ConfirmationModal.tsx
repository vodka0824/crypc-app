
// components/common/ConfirmationModal.tsx
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = '確認',
  children,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 animate-scale-in border border-white/50">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl">
               <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            {title}
          </h3>
          {!isLoading && (
            <button 
                onClick={onClose} 
                className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="text-gray-600 text-base leading-relaxed mb-8">
          {children}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-6 py-3.5 border border-gray-200 bg-white text-gray-700 rounded-xl font-bold text-base hover:bg-gray-50 transition-all hover:shadow-sm active:scale-95 disabled:opacity-50"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-8 py-3.5 bg-red-600 text-white rounded-xl font-bold text-base hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 active:scale-95 disabled:opacity-50 disabled:bg-red-400"
          >
            {isLoading ? '處理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
