
// components/admin/BatchActionsToolbar.tsx
import React from 'react';
import { Trash2, DollarSign, Tag, X } from 'lucide-react';
import { Category } from '../../types';

interface BatchActionsToolbarProps {
  selectedIds: Set<string>;
  isSameCategory: boolean;
  commonCategory: Category | null;
  onBatchDelete: () => void;
  onBatchPriceUpdate: () => void;
  onOpenBatchSpecEdit: () => void;
  onClearSelection: () => void;
}

const BatchActionsToolbar: React.FC<BatchActionsToolbarProps> = ({
  selectedIds,
  isSameCategory,
  commonCategory,
  onBatchDelete,
  onBatchPriceUpdate,
  onOpenBatchSpecEdit,
  onClearSelection,
}) => {
  if (selectedIds.size === 0) {
    return null;
  }

  // Added 'md:hidden' class to hide on desktop
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 md:px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 md:gap-6 z-50 animate-fade-in-up w-[92%] md:w-auto overflow-x-auto hide-scrollbar max-w-full safe-area-bottom">
      <span className="font-bold text-sm whitespace-nowrap flex-shrink-0">已選 {selectedIds.size}</span>
      <div className="h-6 w-px bg-gray-700 flex-shrink-0"></div>
      <div className="flex gap-2 flex-nowrap">
        {isSameCategory && commonCategory !== Category.OTHERS && (
          <button onClick={onOpenBatchSpecEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-bold whitespace-nowrap flex-shrink-0">
            <Tag className="h-4 w-4" /> <span className="hidden sm:inline">批次標籤</span><span className="sm:hidden">標籤</span>
          </button>
        )}
        <button onClick={onBatchPriceUpdate} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-800 rounded-lg transition-colors text-sm font-bold whitespace-nowrap flex-shrink-0">
          <DollarSign className="h-4 w-4" /> <span className="hidden sm:inline">調整價格</span><span className="sm:hidden">改價</span>
        </button>
        <button onClick={onBatchDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-bold whitespace-nowrap flex-shrink-0">
          <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">刪除</span>
        </button>
        <button onClick={onClearSelection} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-800 rounded-lg transition-colors text-sm text-gray-400 whitespace-nowrap flex-shrink-0 ml-auto">
          <X className="h-4 w-4" /> <span className="hidden sm:inline">取消</span>
        </button>
      </div>
    </div>
  );
};

export default BatchActionsToolbar;
