
import React from 'react';
import { Category, BuilderItem, BuildState } from '../../types';
import { Plus, Eraser, ChevronRight, AlertTriangle, Minus, RefreshCw, Trash2 } from 'lucide-react';
import SwipeableRow from './SwipeableRow';

interface BuilderSlotProps {
    category: Category;
    icon: React.ElementType;
    label: string;
    items: BuilderItem[];
    buildState: BuildState;
    compatibilityMap: Record<string, string | null>; // Updated to receive pre-calculated errors
    onOpenSelection: (category: Category) => void;
    onClearCategory: (category: Category) => void;
    onRemoveItem: (id: string) => void;
    onQuantityChange: (id: string, delta: number) => void;
    onReplaceItem: (item: BuilderItem) => void;
    onOpenQtySelector: (id: string) => void;
}

const BuilderSlot: React.FC<BuilderSlotProps> = ({
    category,
    icon: Icon,
    label,
    items,
    // buildState is kept in props if needed for other logic, but compatibility is now passed in
    compatibilityMap,
    onOpenSelection,
    onClearCategory,
    onRemoveItem,
    onQuantityChange,
    onReplaceItem,
    onOpenQtySelector
}) => {
    const hasItems = items.length > 0;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden group ${hasItems ? 'border-gray-300 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
            {hasItems ? (
                <div className="px-3 py-2 md:px-4 md:py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-1 md:p-2 rounded-md bg-black text-white">
                            <Icon className="h-3 w-3 md:h-5 md:w-5" />
                        </div>
                        <span className="font-bold text-sm md:text-lg text-gray-800">{label}</span>
                        <span className="text-[10px] md:text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{items.length}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs md:text-base font-bold text-gray-900 hidden sm:block"><span className="tabular-nums">${subtotal.toLocaleString()}</span></div>
                        <button onClick={(e) => { e.stopPropagation(); onClearCategory(category); }} className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 rounded transition-colors" title="清空分類"><Eraser className="h-4 w-4 md:h-5 md:w-5" /></button>
                        <button onClick={() => onOpenSelection(category)} className="bg-black text-white px-2 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors"><Plus className="h-3 w-3 md:hidden" /><span className="hidden md:inline">＋ 新增</span></button>
                    </div>
                </div>
            ) : (
                <div 
                    onClick={() => onOpenSelection(category)} 
                    className="flex flex-row items-center justify-between p-3 md:p-4 transition-all duration-200 gap-4 cursor-pointer hover:bg-gray-50/80 active:bg-gray-100"
                >
                    <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity flex-1">
                        <div className="p-2 rounded-md bg-gray-100 text-gray-400 group-hover:text-gray-600 transition-colors">
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-bold text-sm md:text-lg text-gray-500 group-hover:text-black transition-colors">{label}</span>
                            <span className="text-xs text-gray-400 font-medium hidden md:block">點擊選擇商品</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-300 flex items-center gap-1 font-medium justify-end">
                        <span className="md:hidden">選擇</span> <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            )}

            {hasItems && (
                <div className="flex flex-col">
                    {items.map((item) => {
                        // Optimization: Read error from map instead of calculating it here
                        const errorMsg = compatibilityMap[item.id];
                        
                        const ItemContent = (
                            <div className="flex flex-col md:flex-row md:items-center px-3 py-3 md:px-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-all relative group/item cursor-pointer">
                                <div className="flex-1 min-w-0 pr-8 md:pr-0">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="font-bold text-sm md:text-lg text-gray-900 leading-tight">{item.name}</span>
                                        {(item.category === Category.CPU || item.category === Category.GPU) && item.specDetails?.tdp && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 ml-1 whitespace-nowrap">TDP {item.specDetails.tdp}</span>}
                                        {/* Desktop Error Badge */}
                                        {errorMsg && <span className="hidden md:inline-flex flex-shrink-0 items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-200"><AlertTriangle className="h-3 w-3" /><span className="font-medium">{errorMsg}</span></span>}
                                    </div>
                                    {/* Mobile Single Line Error (Icon + Text combined) */}
                                    {errorMsg && (
                                        <div className="md:hidden mt-1 flex items-center gap-1 text-[10px] text-red-500 w-full overflow-hidden">
                                            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate whitespace-nowrap font-medium">{errorMsg}</span>
                                        </div>
                                    )}
                                    <div className="hidden md:block text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</div>
                                </div>

                                <div className="flex items-center justify-between mt-2 md:mt-0 md:ml-4 gap-3">
                                    <div className="font-bold text-base md:text-xl text-gray-900 tabular-nums min-w-[80px] text-right">${item.price.toLocaleString()}</div>
                                    <div className="flex items-center gap-2">
                                        {/* Mobile: White Smart Capsule Button */}
                                        <div className="md:hidden flex items-center bg-white border border-gray-200 rounded-full h-8 px-1 shadow-[0_2px_8px_rgba(0,0,0,0.08)]" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); if (item.quantity <= 1) onRemoveItem(item.id); else onQuantityChange(item.id, -1); }} 
                                                className="w-7 h-full flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
                                            >
                                                {item.quantity <= 1 ? <Trash2 className="h-3.5 w-3.5 text-red-500" /> : <Minus className="h-3.5 w-3.5" />}
                                            </button>
                                            {/* Trigger Quantity Selector on Click */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onOpenQtySelector(item.id); }}
                                                className="w-6 text-center text-sm font-bold text-black tabular-nums leading-none"
                                            >
                                                {item.quantity}
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onQuantityChange(item.id, 1); }} 
                                                className="w-7 h-full flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {/* Desktop: Standard Layout */}
                                        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg h-9">
                                            <button onClick={(e) => { e.stopPropagation(); onQuantityChange(item.id, -1); }} className="w-8 hover:bg-gray-200 h-full rounded-l-lg text-gray-600 flex items-center justify-center" disabled={item.quantity <= 1}><Minus className="h-3 w-3" /></button>
                                            <span className="w-8 text-center text-sm font-bold text-black">{item.quantity}</span>
                                            <button onClick={(e) => { e.stopPropagation(); onQuantityChange(item.id, 1); }} className="w-8 hover:bg-gray-200 h-full rounded-r-lg text-gray-600 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); onReplaceItem(item); }} className="hidden md:block p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="更換商品"><RefreshCw className="h-5 w-5" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }} className="hidden md:block p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-5 w-5" /></button>
                                    </div>
                                </div>
                            </div>
                        );

                        // Mobile Swipe Wrapper
                        return (
                            <div key={item.uniqueId}>
                                <div className="md:hidden">
                                    <SwipeableRow onDelete={() => onRemoveItem(item.id)} onReplace={() => onReplaceItem(item)}>
                                        {ItemContent}
                                    </SwipeableRow>
                                </div>
                                <div className="hidden md:block">
                                    {ItemContent}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default React.memo(BuilderSlot);
