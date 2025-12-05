
// components/admin/ProductEditModal.tsx
import React, { useState, useEffect } from 'react';
import { Save, X, LayoutGrid, AlignLeft, Tag, ImageIcon, Loader2, DollarSign, Package, FileText, Check } from 'lucide-react';
import { Category, Product, ProductSpecs } from '../../types';
import { categoryDisplayMap, categoryFilters } from '../../data/mockData';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct: Partial<Product>;
  setCurrentProduct: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  onSave: (e: React.FormEvent) => void;
  products: Product[];
  isLoading?: boolean;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  currentProduct,
  setCurrentProduct,
  onSave,
  products,
  isLoading = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset image error state when image url changes
  useEffect(() => {
    setImgError(false);
  }, [currentProduct.image]);

  if (!isOpen) return null;

  const handleSpecChange = (key: string, value: string) => {
    setCurrentProduct(prev => ({
      ...prev,
      specDetails: { ...prev?.specDetails, [key]: value }
    }));
  };

  const toggleSpecValue = (key: string, valueToToggle: string) => {
    const currentStr = currentProduct.specDetails?.[key] || '';
    const currentValues = currentStr.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    let newValues = currentValues.includes(valueToToggle)
      ? currentValues.filter((v: string) => v !== valueToToggle)
      : [...currentValues, valueToToggle];
    handleSpecChange(key, newValues.join(', '));
  };

  const getExistingValuesForSpec = (key: keyof ProductSpecs): string[] => {
    const values = new Set<string>();
    products.forEach(p => {
      if (p.category === currentProduct.category && p.specDetails?.[key]) {
        const raw = p.specDetails[key]!;
        raw.split(',').forEach(v => {
          const trimmed = v.trim();
          if (trimmed) values.add(trimmed);
        });
      }
    });
    return Array.from(values).sort();
  };

  const currentCategorySpecs = categoryFilters[currentProduct.category as Category] || [];
  const isOthersCategory = currentProduct.category === Category.OTHERS;
  const isEditMode = currentProduct.id && products.some(p => p.id === currentProduct.id);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={!isLoading ? onClose : undefined} />
      
      <div className="relative bg-[#F8F9FA] w-full md:max-w-6xl h-[95vh] md:h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col transition-all animate-slide-up md:animate-fade-in overflow-hidden border border-white/50">
        
        {/* Header - Compact */}
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 flex-shrink-0 sticky top-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white shadow-md ${isEditMode ? 'bg-blue-600 shadow-blue-200' : 'bg-black shadow-gray-200'}`}>
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-none mb-0.5">{isEditMode ? '編輯商品' : '新增商品'}</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{isOthersCategory ? '一般資料' : '詳細規格'}</p>
            </div>
          </div>
          <button onClick={!isLoading ? onClose : undefined} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content - Compact 2 Column Layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8F9FA]">
          <form id="product-form" onSubmit={onSave} className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Visuals & Core Pricing (Span 4) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Image Preview & Input */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <div className="aspect-[4/3] w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden relative group max-h-[220px]">
                        {currentProduct.image && !imgError ? (
                            <img 
                                src={currentProduct.image} 
                                alt="Preview" 
                                onError={() => setImgError(true)}
                                className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105" 
                            />
                        ) : (
                            <div className="text-center text-gray-300">
                                <ImageIcon className="h-10 w-10 mx-auto mb-1 opacity-50" />
                                <span className="text-[10px] font-bold uppercase">No Image</span>
                            </div>
                        )}
                        {/* Floating ID Tag */}
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/20 z-10 shadow-sm">
                            {currentProduct.id || 'NEW'}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">圖片連結 (URL)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={currentProduct.image || ''} 
                                onChange={e => setCurrentProduct(p => ({ ...p, image: e.target.value }))} 
                                className="w-full pl-8 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-lg text-xs transition-all outline-none border hover:border-gray-200" 
                                placeholder="https://..." 
                                disabled={isLoading} 
                            />
                            <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Core Info Card (Category & Price) */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">商品分類</label>
                        <div className="relative">
                            <select 
                                disabled={isLoading} 
                                value={currentProduct.category} 
                                onChange={e => setCurrentProduct(p => ({ ...p, category: e.target.value as Category, specDetails: {} }))} 
                                className="w-full pl-9 pr-8 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-lg text-sm appearance-none cursor-pointer font-bold outline-none border hover:border-gray-200 transition-all"
                            >
                                {Object.values(Category).map(cat => ( <option key={cat} value={cat}>{categoryDisplayMap[cat]}</option>))}
                            </select>
                            <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="8" height="5" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">售價 (NT$)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={currentProduct.price || ''} 
                                onChange={e => setCurrentProduct(p => ({ ...p, price: Number(e.target.value) }))} 
                                className="w-full pl-8 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-lg text-lg font-bold transition-all outline-none border hover:border-gray-200" 
                                required 
                                disabled={isLoading} 
                            />
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        </div>
                    </div>
                </div>

              </div>

              {/* Right Column: Details & Specs (Span 8) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Basic Info */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <h3 className="font-bold text-gray-900 text-sm">基本資訊</h3>
                    </div>

                    {/* ID & Name in one row */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">ID (Unique)</label>
                            <input 
                                type="text" 
                                value={currentProduct.id || ''} 
                                onChange={e => setCurrentProduct(p => ({ ...p, id: e.target.value }))} 
                                className="w-full px-3 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-lg text-xs font-mono transition-all outline-none border hover:border-gray-200 disabled:opacity-60" 
                                required 
                                placeholder="cpu-001" 
                                disabled={isEditMode || isLoading}
                            />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">商品名稱</label>
                            <input 
                                type="text" 
                                value={currentProduct.name || ''} 
                                onChange={e => setCurrentProduct(p => ({ ...p, name: e.target.value }))} 
                                className="w-full px-3 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-lg text-sm font-bold transition-all outline-none border hover:border-gray-200 placeholder-gray-300" 
                                required 
                                placeholder="例如: Intel i9-14900K 處理器" 
                                disabled={isLoading} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">詳細描述 / 備註</label>
                        <textarea 
                            value={currentProduct.description || ''} 
                            onChange={e => setCurrentProduct(p => ({ ...p, description: e.target.value }))} 
                            className="w-full px-3 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-lg text-xs leading-relaxed h-16 resize-none transition-all outline-none border hover:border-gray-200 placeholder-gray-300" 
                            placeholder="輸入詳細規格，例如：頻率、快取、保固資訊等..."
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Specs Section - 3 Columns Grid */}
                {!isOthersCategory && (
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <h3 className="font-bold text-gray-900 text-sm">規格參數 (Specs)</h3>
                            </div>
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                用於篩選與配單
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            {currentCategorySpecs.length > 0 ? (
                                currentCategorySpecs.map(spec => {
                                    const currentVal = currentProduct.specDetails?.[spec.key] || '';
                                    const currentValArray = currentVal.split(',').map((s: string) => s.trim()).filter((s: string) => s);
                                    
                                    return (
                                        <div key={spec.key} className="space-y-1.5">
                                            <div className="flex justify-between items-baseline">
                                                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">{spec.label}</label>
                                                <span className="text-[9px] text-gray-300 font-mono">{spec.key}</span>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={currentProduct.specDetails?.[spec.key] || ''} 
                                                onChange={(e) => handleSpecChange(spec.key as string, e.target.value)} 
                                                className="w-full px-3 py-1.5 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-lg text-xs transition-all outline-none border hover:border-gray-200" 
                                                placeholder={`輸入...`} 
                                                disabled={isLoading}
                                            />
                                            {/* Quick Select Chips */}
                                            <div className="flex flex-wrap gap-1 min-h-[20px]">
                                                {getExistingValuesForSpec(spec.key).slice(0, 5).map((val, idx) => {
                                                    const isActive = currentValArray.includes(val);
                                                    return (
                                                        <button 
                                                            key={`${spec.key}-${idx}`} 
                                                            type="button" 
                                                            onClick={() => toggleSpecValue(spec.key as string, val)} 
                                                            className={`
                                                                text-[9px] px-2 py-0.5 rounded-md border transition-all active:scale-95
                                                                ${isActive 
                                                                    ? 'bg-black text-white border-black font-bold' 
                                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-black'
                                                                }
                                                            `}
                                                            disabled={isLoading}
                                                        >
                                                            {val}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-3 py-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Tag className="h-6 w-6 mb-1 opacity-20" />
                                    <p className="text-[10px]">此分類無特定規格。</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

              </div>
            </div>
          </form>
        </div>
        
        {/* Footer Actions - Compact */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white md:rounded-b-3xl flex justify-end gap-3 z-10 flex-shrink-0">
          <button 
            onClick={!isLoading ? onClose : undefined} 
            disabled={isLoading} 
            className="px-5 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button 
            type="submit" 
            form="product-form" 
            disabled={isLoading} 
            className="px-6 py-2 bg-black text-white rounded-lg font-bold text-xs hover:bg-gray-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:bg-gray-700 disabled:transform-none"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {isLoading ? '儲存中...' : '儲存變更'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductEditModal;
