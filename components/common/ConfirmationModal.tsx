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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title}
          </h3>
          {!isLoading && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="text-gray-600 mb-6">
          {children}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-red-400"
          >
            {isLoading ? '處理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
