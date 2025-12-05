
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
      
      <div className="relative bg-[#FDFDFD] w-full md:max-w-5xl h-[95vh] md:h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col transition-all animate-slide-up md:animate-fade-in overflow-hidden border border-white/50">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 flex-shrink-0 sticky top-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-lg ${isEditMode ? 'bg-blue-600 shadow-blue-200' : 'bg-black shadow-gray-200'}`}>
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">{isEditMode ? '編輯商品' : '新增商品'}</h2>
              <p className="text-xs text-gray-500 font-medium">{isOthersCategory ? '一般商品資料' : '詳細規格配置'}</p>
            </div>
          </div>
          <button onClick={!isLoading ? onClose : undefined} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content - 2 Column Layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FDFDFD]">
          <form id="product-form" onSubmit={onSave} className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Visuals & Core Pricing */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Image Preview & Input */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="aspect-square w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                        {currentProduct.image && !imgError ? (
                            <img 
                                src={currentProduct.image} 
                                alt="Preview" 
                                onError={() => setImgError(true)}
                                className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" 
                            />
                        ) : (
                            <div className="text-center text-gray-300">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <span className="text-xs font-bold">預覽圖片</span>
                            </div>
                        )}
                        {/* ID Overlay */}
                        <div className="absolute top-3 left-3 bg-black/5 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-gray-600 border border-white/50">
                            {currentProduct.id || 'NEW-ID'}
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">圖片連結 (URL)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={currentProduct.image || ''} 
                                    onChange={e => setCurrentProduct(p => ({ ...p, image: e.target.value }))} 
                                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl text-sm transition-all outline-none border hover:border-gray-200" 
                                    placeholder="https://..." 
                                    disabled={isLoading} 
                                />
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing & Category */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">商品分類</label>
                        <div className="relative">
                            <select 
                                disabled={isLoading} 
                                value={currentProduct.category} 
                                onChange={e => setCurrentProduct(p => ({ ...p, category: e.target.value as Category, specDetails: {} }))} 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl text-sm appearance-none cursor-pointer font-bold outline-none border hover:border-gray-200 transition-all"
                            >
                                {Object.values(Category).map(cat => ( <option key={cat} value={cat}>{categoryDisplayMap[cat]}</option>))}
                            </select>
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">售價 (NT$)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={currentProduct.price || ''} 
                                onChange={e => setCurrentProduct(p => ({ ...p, price: Number(e.target.value) }))} 
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl text-xl font-bold transition-all outline-none border hover:border-gray-200" 
                                required 
                                disabled={isLoading} 
                            />
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        </div>
                    </div>
                </div>

              </div>

              {/* Right Column: Details & Specs */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Basic Info */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <h3 className="font-bold text-gray-900">基本資訊</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">商品名稱</label>
                            <input 
                                type="text" 
                                value={currentProduct.name || ''} 
                                onChange={e => setCurrentProduct(p => ({ ...p, name: e.target.value }))} 
                                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl text-base font-bold transition-all outline-none border hover:border-gray-200 placeholder-gray-300" 
                                required 
                                placeholder="例如: Intel i9-14900K 處理器" 
                                disabled={isLoading} 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">商品 ID (唯一識別碼)</label>
                            <input 
                                type="text" 
                                value={currentProduct.id || ''} 
                                onChange={e => setCurrentProduct(p => ({ ...p, id: e.target.value }))} 
                                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl text-sm font-mono transition-all outline-none border hover:border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed" 
                                required 
                                placeholder="例如: cpu-001" 
                                disabled={isEditMode || isLoading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">詳細描述 / 備註</label>
                            <textarea 
                                value={currentProduct.description || ''} 
                                onChange={e => setCurrentProduct(p => ({ ...p, description: e.target.value }))} 
                                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl text-sm leading-relaxed h-28 resize-none transition-all outline-none border hover:border-gray-200 placeholder-gray-300" 
                                placeholder="輸入詳細規格，例如：頻率、快取、保固資訊等..."
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Specs Section */}
                {!isOthersCategory && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Tag className="h-5 w-5 text-gray-400" />
                                <h3 className="font-bold text-gray-900">規格參數 (Specs)</h3>
                            </div>
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                                用於前台篩選與 AI 配單
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {currentCategorySpecs.length > 0 ? (
                                currentCategorySpecs.map(spec => {
                                    const currentVal = currentProduct.specDetails?.[spec.key] || '';
                                    const currentValArray = currentVal.split(',').map((s: string) => s.trim()).filter((s: string) => s);
                                    
                                    return (
                                        <div key={spec.key} className="space-y-2">
                                            <div className="flex justify-between items-baseline">
                                                <label className="text-xs font-bold text-gray-700">{spec.label}</label>
                                                <span className="text-[10px] text-gray-400 font-mono">{spec.key}</span>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={currentProduct.specDetails?.[spec.key] || ''} 
                                                onChange={(e) => handleSpecChange(spec.key as string, e.target.value)} 
                                                className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl text-sm transition-all outline-none border hover:border-gray-200" 
                                                placeholder={`輸入 ${spec.label}...`} 
                                                disabled={isLoading}
                                            />
                                            {/* Quick Select Chips */}
                                            <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                                                {getExistingValuesForSpec(spec.key).slice(0, 6).map((val, idx) => {
                                                    const isActive = currentValArray.includes(val);
                                                    return (
                                                        <button 
                                                            key={`${spec.key}-${idx}`} 
                                                            type="button" 
                                                            onClick={() => toggleSpecValue(spec.key as string, val)} 
                                                            className={`
                                                                text-[10px] px-2.5 py-1 rounded-lg border transition-all active:scale-95
                                                                ${isActive 
                                                                    ? 'bg-black text-white border-black font-bold shadow-sm' 
                                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-black'
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
                                <div className="col-span-2 py-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <Tag className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-xs">此分類目前沒有定義特定的篩選規格。</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

              </div>
            </div>
          </form>
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white md:rounded-b-3xl flex justify-end gap-3 z-10 flex-shrink-0">
          <button 
            onClick={!isLoading ? onClose : undefined} 
            disabled={isLoading} 
            className="px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button 
            type="submit" 
            form="product-form" 
            disabled={isLoading} 
            className="px-8 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-700 disabled:transform-none"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isLoading ? '儲存中...' : '儲存變更'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductEditModal;
