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

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-fade-in-up">
      <span className="font-bold text-sm whitespace-nowrap">已選擇 {selectedIds.size} 項</span>
      <div className="h-6 w-px bg-gray-700"></div>
      <div className="flex gap-2">
        {isSameCategory && commonCategory !== Category.OTHERS && (
          <button onClick={onOpenBatchSpecEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-bold">
            <Tag className="h-4 w-4" /> 批次標籤
          </button>
        )}
        <button onClick={onBatchPriceUpdate} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-800 rounded-lg transition-colors text-sm font-bold">
          <DollarSign className="h-4 w-4" /> 調整價格
        </button>
        <button onClick={onBatchDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-bold">
          <Trash2 className="h-4 w-4" /> 刪除
        </button>
        <button onClick={onClearSelection} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-800 rounded-lg transition-colors text-sm text-gray-400">
          <X className="h-4 w-4" /> 取消
        </button>
      </div>
    </div>
  );
};

export default BatchActionsToolbar;
