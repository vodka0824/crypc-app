
// components/admin/ProductEditModal.tsx
import React from 'react';
import { Save, X, LayoutGrid, AlignLeft, Tag, ImageIcon, Loader2 } from 'lucide-react';
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
  const isCaseCategory = currentProduct.category === Category.CASE;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
      <div className="relative bg-white w-full md:max-w-2xl h-[95vh] md:h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col transition-transform animate-slide-up md:animate-none overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg text-white"><LayoutGrid className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-none mb-1">{currentProduct.id && products.some(p => p.id === currentProduct.id) ? '編輯商品' : '新增商品'}</h2>
              <p className="text-xs text-gray-500">{isOthersCategory ? '基本資料' : '完整編輯模式'}</p>
            </div>
          </div>
          <button onClick={!isLoading ? onClose : undefined} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="product-form" onSubmit={onSave} className="space-y-6">
            
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-gray-900 border-b border-gray-200 pb-2">
                <AlignLeft className="h-4 w-4" />
                <h3 className="font-bold text-sm">基本資訊</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">商品 ID</label>
                    <input 
                      type="text" 
                      value={currentProduct.id || ''} 
                      onChange={e => setCurrentProduct(p => ({ ...p, id: e.target.value }))} 
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:border-black focus:ring-1 focus:ring-black transition-colors disabled:bg-gray-100" 
                      required 
                      placeholder="例如: cpu-123" 
                      disabled={products.some(p => p.id === currentProduct.id) || isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">分類</label>
                    <div className="relative">
                      <select disabled={isLoading} value={currentProduct.category} onChange={e => setCurrentProduct(p => ({ ...p, category: e.target.value as Category, specDetails: {} }))} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer font-medium disabled:bg-gray-100">
                        {Object.values(Category).map(cat => ( <option key={cat} value={cat}>{categoryDisplayMap[cat]}</option>))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">商品名稱</label>
                  <input type="text" value={currentProduct.name || ''} onChange={e => setCurrentProduct(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black text-sm font-bold disabled:bg-gray-100" required placeholder="輸入完整商品名稱..." disabled={isLoading} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={isCaseCategory ? "" : "col-span-2"}>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">價格 (NT$)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                      <input type="number" value={currentProduct.price || ''} onChange={e => setCurrentProduct(p => ({ ...p, price: Number(e.target.value) }))} className="w-full pl-6 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black font-bold disabled:bg-gray-100" required disabled={isLoading} />
                    </div>
                  </div>
                  {isCaseCategory && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">圖片 URL (機殼推薦)</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input type="text" value={currentProduct.image || ''} onChange={e => setCurrentProduct(p => ({ ...p, image: e.target.value }))} className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black truncate disabled:bg-gray-100" placeholder="https://..." disabled={isLoading} />
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">詳細規格描述 {isOthersCategory && '(主要顯示)'}</label>
                  <textarea 
                    value={currentProduct.description || ''} 
                    onChange={e => setCurrentProduct(p => ({ ...p, description: e.target.value }))} 
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black h-24 resize-none leading-relaxed disabled:bg-gray-100" 
                    placeholder="輸入詳細規格，例如：頻率、快取、保固資訊等..."
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {!isOthersCategory && (
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-900 border-b border-gray-200 pb-2">
                  <Tag className="h-4 w-4" />
                  <h3 className="font-bold text-sm">規格參數 (Specs)</h3>
                  <span className="text-[10px] bg-white border border-gray-200 text-gray-400 px-1.5 py-0.5 rounded ml-auto">用於篩選</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {currentCategorySpecs.length > 0 ? (
                    currentCategorySpecs.map(spec => {
                      const currentVal = currentProduct.specDetails?.[spec.key] || '';
                      const currentValArray = currentVal.split(',').map((s: string) => s.trim()).filter((s: string) => s);
                      return (
                        <div key={spec.key} className="col-span-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex justify-between">
                            {spec.label} <span className="text-gray-300 font-normal lowercase font-mono">.{spec.key}</span>
                          </label>
                          <input 
                            type="text" 
                            value={currentProduct.specDetails?.[spec.key] || ''} 
                            onChange={(e) => handleSpecChange(spec.key as string, e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black shadow-sm placeholder-gray-300 disabled:bg-gray-100" 
                            placeholder="輸入..." 
                            disabled={isLoading}
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {getExistingValuesForSpec(spec.key).slice(0, 5).map((val, idx) => {
                              const isActive = currentValArray.includes(val);
                              return (
                                <button 
                                  key={`${spec.key}-${idx}`} 
                                  type="button" 
                                  onClick={() => toggleSpecValue(spec.key as string, val)} 
                                  className={`text-[9px] px-2 py-0.5 rounded border transition-all ${isActive ? 'bg-black text-white border-black font-bold' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'} disabled:opacity-50`}
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
                    <div className="col-span-2 text-center text-gray-400 text-xs py-10 border border-dashed border-gray-200 rounded-xl bg-white">
                      此分類目前沒有定義特定的篩選規格。
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-white md:rounded-b-3xl flex justify-end gap-3 z-10 flex-shrink-0">
          <button onClick={!isLoading ? onClose : undefined} disabled={isLoading} className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">取消</button>
          <button type="submit" form="product-form" disabled={isLoading} className="px-6 py-2.5 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-gray-700 min-w-[120px]">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isLoading ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
