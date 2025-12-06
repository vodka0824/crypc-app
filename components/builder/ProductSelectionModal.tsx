
import React, { useState, useMemo } from 'react';
import { Category, Product, CartItem, ProductSpecs } from '../../types';
import { categoryFilters, categoryDisplayMap } from '../../data/mockData';
import { filterProducts, getSmartOptions } from '../../utils/searchHelper';
import { X, Search, RefreshCw, Plus, Minus, Trash2, ListFilter, ChevronDown, ChevronRight, Check, ArrowUp, ArrowDown, ArrowUpDown, SlidersHorizontal, Box } from 'lucide-react';

interface ProductSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeCategory: Category;
    allProducts: Product[];
    cartItems: CartItem[];
    replacingItemId: string | null;
    onSelectProduct: (product: Product, quantity: number) => void;
    onRemoveProduct: (id: string) => void;
    onQuantityChange: (id: string, delta: number) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
    isOpen,
    onClose,
    activeCategory,
    allProducts,
    cartItems,
    replacingItemId,
    onSelectProduct,
    onRemoveProduct,
    onQuantityChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
    const [modalSort, setModalSort] = useState<string>('default');
    const [rowQuantities, setRowQuantities] = useState<Record<string, number>>({});
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // --- Logic moved from Builder.tsx ---
    const filteredModalProducts = useMemo(() => {
        // The helper handles null category, but we know activeCategory is set here
        const result = filterProducts(allProducts, searchQuery, activeCategory, activeFilters);

        switch (modalSort) {
            case 'price-asc': result.sort((a, b) => a.price - b.price); break;
            case 'price-desc': result.sort((a, b) => b.price - a.price); break;
            case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
        }
        return result;
    }, [activeCategory, activeFilters, allProducts, modalSort, searchQuery]);

    const toggleFilter = (key: string, value: string) => {
        setActiveFilters(prev => {
            const current = prev[key] || [];
            if (current.includes(value)) {
                const updated = current.filter(v => v !== value);
                return updated.length > 0 ? { ...prev, [key]: updated } : (() => { const { [key]: _, ...rest } = prev; return rest; })();
            } else {
                return { ...prev, [key]: [...current, value] };
            }
        });
    };

    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    // Local Quantity Handler
    const handleLocalQtyChange = (e: React.MouseEvent, productId: string, delta: number) => {
        e.stopPropagation();
        setRowQuantities(prev => {
             const current = prev[productId] || 1;
             const next = Math.max(1, current + delta);
             return { ...prev, [productId]: next };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white w-full md:max-w-7xl h-[92vh] md:h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up md:animate-fade-in">
                
                {/* Mobile Drag Handle */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                {/* Header (Desktop) */}
                <div className="hidden md:flex px-6 py-4 border-b border-gray-100 justify-between items-center bg-white z-10 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {replacingItemId ? <RefreshCw className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5" />}
                            {replacingItemId ? '更換' : '選擇'} {categoryDisplayMap[activeCategory]}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X className="h-5 w-5" /></button>
                </div>

                {/* Header (Mobile) */}
                <div className="md:hidden px-4 pb-3 border-b border-gray-100 flex flex-col gap-3 bg-white sticky top-0 z-20">
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="搜尋商品..."
                                className="w-full pl-9 pr-8 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-black focus:ring-1 rounded-xl text-sm transition-all outline-none font-medium"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full text-gray-500">
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2.5 bg-gray-100 rounded-xl text-gray-500">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                        {categoryFilters[activeCategory]?.map(filter => {
                             const isActive = Object.keys(activeFilters).includes(filter.key as string);
                             return (
                                 <button 
                                     key={filter.key}
                                     onClick={() => setMobileFiltersOpen(true)}
                                     className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${isActive ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                                 >
                                     {filter.label} <ChevronDown className="h-3 w-3" />
                                 </button>
                             )
                        })}
                    </div>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Desktop Sidebar Filters */}
                    <div className="hidden lg:block w-48 border-r border-gray-100 bg-gray-50 overflow-y-auto custom-scrollbar flex-shrink-0">
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-wider"><ListFilter className="h-4 w-4" /> 篩選條件</div>
                                {Object.keys(activeFilters).length > 0 && (<button onClick={() => setActiveFilters({})} className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline">清除全部</button>)}
                            </div>
                            <div className="space-y-1">
                                {categoryFilters[activeCategory]?.map(filter => {
                                    const options = getSmartOptions(allProducts, activeCategory, filter.key, searchQuery, activeFilters);
                                    if (options.length === 0) return null;
                                    const isExpanded = expandedNodes[filter.key] ?? true;
                                    const activeCount = activeFilters[filter.key]?.length || 0;
                                    return (
                                        <div key={filter.key} className="border-b border-gray-200 last:border-0 pb-2 mb-2">
                                            <button onClick={() => toggleNode(filter.key as string)} className="w-full flex items-center justify-between py-2 text-left group transition-colors rounded-lg hover:bg-gray-100 px-2 -mx-2"><div className="flex items-center gap-2"><h4 className={`font-bold text-sm ${activeCount > 0 ? 'text-black' : 'text-gray-700'} group-hover:text-black`}>{filter.label}</h4>{activeCount > 0 && (<span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full ml-auto">{activeCount}</span>)}{isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}</div></button>
                                            {isExpanded && (<div className="pl-1 mt-1 space-y-1 mb-3">{options.map((option: string) => { const isChecked = activeFilters[filter.key]?.includes(option); return (<button key={option} onClick={() => toggleFilter(filter.key as string, option)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 group/opt ${isChecked ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-white bg-black' : 'border-gray-300 bg-white group-hover/opt:border-gray-400'}`}>{isChecked && <Check className="h-3 w-3 text-white" />}</div><span className="truncate">{option}</span></button>); })}</div>)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Products Grid */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                         {/* Desktop Search & Sort */}
                         <div className="hidden lg:flex px-4 py-3 border-b border-gray-100 bg-gray-50/50 justify-between items-center text-sm sticky top-0 z-20 backdrop-blur-sm">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" placeholder="搜尋商品..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><X className="h-3 w-3" /></button>}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="font-bold text-gray-600 hover:text-black cursor-pointer flex items-center gap-1 transition-colors select-none group" onClick={() => setModalSort(prev => { if (prev === 'name-asc') return 'name-desc'; if (prev === 'name-desc') return 'default'; return 'name-asc'; })}>名稱 {modalSort === 'name-asc' && <ArrowUp className="h-3.5 w-3.5 text-black" />}{modalSort === 'name-desc' && <ArrowDown className="h-3.5 w-3.5 text-black" />}{modalSort !== 'name-asc' && modalSort !== 'name-desc' && <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />}</div>
                                <div className="font-bold text-gray-600 hover:text-black cursor-pointer flex items-center justify-end gap-1 transition-colors select-none group min-w-[80px]" onClick={() => setModalSort(prev => { if (prev === 'price-asc') return 'price-desc'; if (prev === 'price-desc') return 'default'; return 'price-asc'; })}>金額 {modalSort === 'price-asc' && <ArrowUp className="h-3.5 w-3.5 text-black" />}{modalSort === 'price-desc' && <ArrowDown className="h-3.5 w-3.5 text-black" />}{modalSort !== 'price-asc' && modalSort !== 'price-desc' && <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />}</div>
                            </div>
                         </div>

                         <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
                             <div className="flex flex-col md:grid md:grid-cols-2 xl:grid-cols-3 gap-0 md:gap-4 p-0 md:p-6 pb-20 md:pb-12">
                                 {filteredModalProducts.length === 0 ? (
                                     <div className="col-span-full py-20 text-center text-gray-400">
                                         <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                         <p className="text-lg font-medium">沒有符合條件的商品</p>
                                         <button onClick={() => { setActiveFilters({}); setSearchQuery(''); }} className="mt-2 text-blue-600 font-bold hover:underline">清除所有篩選</button>
                                     </div>
                                 ) : (
                                     filteredModalProducts.map((product: Product) => {
                                         const currentQty = rowQuantities[product.id] || 1;
                                         const qtyInCart = cartItems.find(i => i.id === product.id)?.quantity || 0;
                                         const isSelected = qtyInCart > 0;

                                         return (
                                             <div key={product.id} className={`group bg-white md:border md:border-gray-100 md:rounded-2xl p-3 md:p-4 hover:shadow-lg hover:border-gray-200 transition-all border-b border-gray-100 last:border-0 md:border-b ${isSelected ? 'md:bg-white bg-gray-50 border-b-gray-200' : ''}`}>
                                                 <div className={`flex flex-row md:flex-col gap-3 md:gap-4 items-center md:items-stretch ${isSelected ? 'opacity-100' : ''}`}>
                                                     <div className="hidden md:flex w-16 h-16 md:w-full md:h-40 bg-gray-50 rounded-xl md:rounded-lg flex-shrink-0 items-center justify-center p-1 border border-gray-100 overflow-hidden">
                                                         {product.image ? <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" alt="" /> : <Box className="h-6 w-6 md:h-12 md:w-12 text-gray-300" />}
                                                     </div>
                                                     <div className="flex-1 min-w-0 flex flex-col md:block justify-center">
                                                         <div className="flex justify-between items-start mb-0.5 md:mb-1">
                                                             <h4 className={`font-bold leading-tight text-sm line-clamp-2 md:line-clamp-2 ${isSelected ? 'text-black' : 'text-gray-900'}`} title={product.name}>{product.name}</h4>
                                                         </div>
                                                         <div className="text-xs text-gray-500 line-clamp-1 mb-1 md:mb-2">{product.description}</div>
                                                         <div className="hidden md:flex flex-wrap gap-1 mb-3">
                                                             {product.specDetails && Object.entries(product.specDetails).filter(([k]) => k !== 'brand').slice(0, 3).map(([k, v]) => (
                                                                 <span key={k} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">{v}</span>
                                                             ))}
                                                         </div>
                                                         <div className="mt-auto md:pt-3 md:border-t md:border-gray-50 flex items-center justify-between gap-3 relative">
                                                             <div className="font-bold text-base md:text-lg text-black tabular-nums">${product.price.toLocaleString()}</div>
                                                             <div className="md:hidden">
                                                                {replacingItemId ? (
                                                                    <button onClick={() => onSelectProduct(product, 1)} className="h-9 px-4 rounded-full bg-black text-white font-bold text-xs shadow-sm active:scale-95 flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> 更換</button>
                                                                ) : qtyInCart > 0 ? (
                                                                    <div className="flex items-center bg-white rounded-full h-9 px-1 shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-gray-100 animate-fade-in transition-all duration-300 min-w-[100px]" onClick={(e) => e.stopPropagation()}>
                                                                        <button onClick={(e) => { e.stopPropagation(); if(qtyInCart === 1) onRemoveProduct(product.id); else onQuantityChange(product.id, -1); }} className="w-8 h-8 flex items-center justify-center text-gray-600 active:scale-90 transition-transform">{qtyInCart === 1 ? <Trash2 className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4" />}</button>
                                                                        <span className="flex-1 text-center font-bold text-black text-sm tabular-nums select-none">{qtyInCart}</span>
                                                                        <button onClick={(e) => { e.stopPropagation(); onSelectProduct(product, 1); }} className="w-8 h-8 flex items-center justify-center text-gray-600 active:scale-90 transition-transform"><Plus className="h-4 w-4" /></button>
                                                                    </div>
                                                                ) : (
                                                                    <button onClick={(e) => { e.stopPropagation(); onSelectProduct(product, 1); }} className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-black hover:bg-gray-50 transition-all active:scale-90"><Plus className="h-5 w-5" /></button>
                                                                )}
                                                             </div>
                                                             <div className="hidden md:flex items-center gap-2">
                                                                 <div className="flex items-center bg-gray-50 rounded-lg h-9 border border-gray-200">
                                                                     <button onClick={(e) => handleLocalQtyChange(e, product.id, -1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-200 rounded-l-lg text-gray-600"><Minus className="h-3 w-3" /></button>
                                                                     <span className="w-8 text-center text-sm font-bold text-black">{currentQty}</span>
                                                                     <button onClick={(e) => handleLocalQtyChange(e, product.id, 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-200 rounded-r-lg text-gray-600"><Plus className="h-3 w-3" /></button>
                                                                 </div>
                                                                 <button onClick={() => onSelectProduct(product, currentQty)} className={`h-9 px-4 rounded-lg font-bold text-sm shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap ${replacingItemId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-black text-white hover:bg-gray-800'}`}>{replacingItemId ? <RefreshCw className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} <span className="hidden md:inline">{replacingItemId ? '更換' : '加入'}</span><span className="md:hidden">加入</span></button>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         );
                                     })
                                 )}
                             </div>
                         </div>
                    </div>
                    {/* Mobile Filters Overlay */}
                    {mobileFiltersOpen && activeCategory && (<div className="absolute inset-0 z-30 bg-white flex flex-col lg:hidden animate-fade-in"><div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm flex-shrink-0"><h3 className="font-bold text-lg">篩選條件</h3><button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><X className="h-5 w-5" /></button></div><div className="flex-1 overflow-y-auto p-4 custom-scrollbar"><div className="space-y-6">{categoryFilters[activeCategory]?.map(filter => { const options = getSmartOptions(allProducts, activeCategory!, filter.key, searchQuery, activeFilters); if (options.length === 0) return null; return (<div key={filter.key}><h4 className="font-bold text-gray-900 mb-2 text-sm">{filter.label}</h4><div className="flex flex-wrap gap-2">{options.map((option: string) => { const isChecked = activeFilters[filter.key]?.includes(option); return (<button key={option} onClick={() => toggleFilter(filter.key as string, option)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${isChecked ? 'bg-black text-white border-black font-bold' : 'bg-white text-gray-600 border-gray-200'}`}>{option}</button>) })}</div></div>); })}</div></div><div className="p-4 border-t border-gray-100 bg-white flex-shrink-0"><button onClick={() => setMobileFiltersOpen(false)} className="w-full py-3 bg-black text-white rounded-xl font-bold">查看 {filteredModalProducts.length} 個結果</button></div></div>)}
                </div>
            </div>
         </div>
    );
};

export default ProductSelectionModal;
