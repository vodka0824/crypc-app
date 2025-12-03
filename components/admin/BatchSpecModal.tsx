// components/admin/BatchSpecModal.tsx
import React from 'react';
import { Layers, X, AlertTriangle } from 'lucide-react';
import { Category, Product, ProductSpecs } from '../../types';
import { categoryDisplayMap, categoryFilters } from '../../data/mockData';

interface BatchSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: Set<string>;
  commonCategory: Category;
  batchSpecData: Partial<ProductSpecs>;
  setBatchSpecData: React.Dispatch<React.SetStateAction<Partial<ProductSpecs>>>;
  onSave: () => void;
  products: Product[];
}

const BatchSpecModal: React.FC<BatchSpecModalProps> = ({
  isOpen,
  onClose,
  selectedIds,
  commonCategory,
  batchSpecData,
  setBatchSpecData,
  onSave,
  products,
}) => {
  if (!isOpen || !commonCategory) return null;

  const getExistingValuesForCategorySpec = (cat: Category, key: keyof ProductSpecs): string[] => {
    const values = new Set<string>();
    products.forEach(p => {
      if (p.category === cat && p.specDetails?.[key]) {
        const raw = p.specDetails[key]!;
        raw.split(',').forEach(v => {
          const trimmed = v.trim();
          if (trimmed) values.add(trimmed);
        });
      }
    });
    return Array.from(values).sort();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5" /> 批次更新標籤
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              將套用至 <span className="font-bold text-black">{selectedIds.size}</span> 個 {categoryDisplayMap[commonCategory]} 商品
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 mb-4 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>注意：僅有您輸入內容的欄位會被更新。未填寫的欄位將保持原狀，不會被清空。</span>
          </div>
          {categoryFilters[commonCategory]?.map(spec => (
            <div key={spec.key}>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{spec.label} <span className="text-gray-300 font-normal lowercase">({spec.key})</span></label>
              <input 
                type="text" 
                value={batchSpecData[spec.key] || ''} 
                onChange={(e) => setBatchSpecData(prev => ({ ...prev, [spec.key]: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder={`輸入新的 ${spec.label}...`}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {getExistingValuesForCategorySpec(commonCategory, spec.key).map((val, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setBatchSpecData(prev => ({ ...prev, [spec.key]: val }))}
                    className="text-[10px] px-2 py-1 rounded bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black transition-colors"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50">取消</button>
          <button onClick={onSave} className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">確認更新</button>
        </div>
      </div>
    </div>
  );
};

export default BatchSpecModal;
