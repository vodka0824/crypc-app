
// components/admin/ProductTable.tsx
import React, { useRef, useState } from 'react';
import { Category, Product } from '../../types';
import { categoryDisplayMap, categoryFilters } from '../../data/mockData';
import { Loader2, Square, CheckSquare, Edit, Trash2, Clock, Image as ImageIcon, Box, MoreVertical } from 'lucide-react';

interface ProductTableProps {
  isLoading: boolean;
  products: Product[];
  filteredProducts: Product[];
  filterCategory: string;
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isCompactMode: boolean; // New prop
}

const ProductTable: React.FC<ProductTableProps> = ({
  isLoading,
  products,
  filteredProducts,
  filterCategory,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  isCompactMode,
}) => {
  const isAllCategories = filterCategory === 'All';
  const dynamicSpecs = (!isAllCategories && filterCategory !== Category.OTHERS)
    ? categoryFilters[filterCategory as Category] || []
    : [];

  // Long press logic
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = (id: string) => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        if (selectedIds.size === 0) {
            if (window.navigator.vibrate) window.navigator.vibrate(50);
            onSelectOne(id);
        }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
    }
  };

  const handleMobileCardClick = (id: string, product: Product) => {
      if (isLongPress.current) return;
      if (selectedIds.size > 0) {
          onSelectOne(id);
      }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // --- Styles based on Compact Mode ---
  const cellPadding = isCompactMode ? 'py-1.5 px-3' : 'py-4 px-4';
  const headerPadding = isCompactMode ? 'py-2 px-3' : 'py-3 px-4';
  const textSize = isCompactMode ? 'text-xs' : 'text-sm';
  const imgSize = isCompactMode ? 'w-8 h-8' : 'w-12 h-12';
  const iconSize = isCompactMode ? 'h-4 w-4' : 'h-5 w-5';
  const actionBtnPadding = isCompactMode ? 'p-1' : 'p-2';

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3 bg-white rounded-3xl border border-gray-200">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span>讀取資料中...</span>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-200 p-8 text-center">
        <Box className="h-12 w-12 mb-2 opacity-20" />
        <p>{products.length === 0 ? '資料庫為空，請點擊上方「初始化」按鈕寫入預設資料。' : '找不到符合搜尋條件的商品'}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent md:bg-white md:rounded-3xl md:border md:border-gray-200 md:shadow-sm overflow-hidden">
      
      {/* --- Mobile View: Swipeable Card List (unchanged, compact mode only affects desktop table) --- */}
      <div className="md:hidden flex-1 overflow-y-auto pb-24 px-1 hide-scrollbar">
        {selectedIds.size > 0 && (
            <div className="sticky top-0 z-20 bg-[#F5F5F7]/95 backdrop-blur-sm p-2 mb-2 flex justify-between items-center rounded-lg border border-blue-200 text-blue-800 shadow-sm animate-fade-in">
                <span className="font-bold text-sm">已選取 {selectedIds.size} 項</span>
                <button onClick={onSelectAll} className="text-xs font-bold underline">
                    {selectedIds.size === filteredProducts.length ? '取消全選' : '全選'}
                </button>
            </div>
        )}

        <div className="space-y-3">
            {filteredProducts.map(product => {
                const isSelected = selectedIds.has(product.id);
                return (
                    <div 
                        key={product.id} 
                        className={`relative w-full h-[110px] overflow-x-auto snap-x snap-mandatory hide-scrollbar rounded-2xl transition-all ${isSelected ? 'ring-2 ring-blue-500 shadow-md transform scale-[0.98]' : 'shadow-sm'}`}
                        onTouchStart={() => handleTouchStart(product.id)}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => handleMobileCardClick(product.id, product)}
                    >
                        <div className="flex w-[calc(100%+140px)] h-full">
                            <div className="w-[100vw] snap-start flex-shrink-0 bg-white border border-gray-100 rounded-2xl flex items-center p-3 gap-3">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 relative overflow-hidden">
                                    {product.image ? (
                                        <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                    ) : (
                                        <div className="text-gray-300 flex flex-col items-center">
                                            <ImageIcon className="h-6 w-6 opacity-50" />
                                        </div>
                                    )}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                            <div className="bg-blue-500 text-white rounded-full p-1"><CheckSquare className="h-5 w-5" /></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{product.category}</span>
                                            <div className="flex items-center gap-1">
                                                {product.specDetails?.brand && (
                                                    <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 rounded-full">{product.specDetails.brand}</span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 leading-tight text-sm line-clamp-2 mt-0.5">
                                            {product.name}
                                        </h3>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="font-mono font-bold text-lg text-black">
                                            ${product.price.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-300 flex items-center animate-pulse">
                                            <MoreVertical className="h-3 w-3" /> 滑動操作
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-[70px] bg-gray-100 flex items-center justify-center snap-center">
                                <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-gray-200 active:scale-90 transition-transform"><Edit className="h-5 w-5" /></button>
                            </div>
                            <div className="w-[70px] bg-gray-100 flex items-center justify-center snap-center pr-4 rounded-r-2xl">
                                <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm border border-gray-200 active:scale-90 transition-transform"><Trash2 className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* --- Desktop View: Table (Visible only on md+ screens) --- */}
      <div className="hidden md:block flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <tr>
              <th className={`${headerPadding} w-12 text-center sticky left-0 bg-gray-50 z-20`}>
                <button onClick={onSelectAll} className="flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                  {selectedIds.size > 0 && selectedIds.size === filteredProducts.length ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                </button>
              </th>
              
              <th className={`${headerPadding} ${textSize} font-bold text-gray-500 uppercase tracking-wider w-[250px] min-w-[250px]`}>商品名稱 / ID</th>
              
              {isAllCategories ? (
                <>
                  <th className={`${headerPadding} ${textSize} font-bold text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap text-right`}>分類</th>
                  <th className={`${headerPadding} ${textSize} font-bold text-gray-500 uppercase tracking-wider min-w-[300px] text-right`}>規格詳情</th>
                </>
              ) : dynamicSpecs.length > 0 ? (
                dynamicSpecs.slice(0, 4).map(spec => (
                  <th key={spec.key} className={`${headerPadding} ${textSize} font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right`}>{spec.label}</th>
                ))
              ) : (
                <th className={`${headerPadding} ${textSize} font-bold text-gray-500 uppercase tracking-wider text-right`}>分類</th>
              )}
              
              <th className={`${headerPadding} ${textSize} font-bold text-gray-500 uppercase tracking-wider text-right w-28 whitespace-nowrap`}>價格</th>
              <th className={`${headerPadding} ${textSize} font-bold text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap text-right`}>
                <div className="flex items-center gap-1 justify-end"><Clock className="h-3 w-3" /> {isCompactMode ? '更新' : '最後更新'}</div>
              </th>
              <th className={`${headerPadding} ${textSize} font-bold text-gray-500 uppercase tracking-wider text-right w-24 sticky right-0 bg-gray-50 z-20`}>操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => {
                const isSelected = selectedIds.has(product.id);
                const showImage = product.category === Category.CASE;

                return (
                  <tr key={product.id} className={`group hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                    <td className={`${cellPadding} sticky left-0 bg-white group-hover:bg-gray-50 z-10 transition-colors text-center align-top`}>
                      <button onClick={() => onSelectOne(product.id)} className={`flex items-center justify-center ${isCompactMode ? 'mt-0.5' : 'mt-1'} ${isSelected ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </button>
                    </td>
                    
                    <td className={`${cellPadding} align-top`}>
                      <div className="flex gap-3 items-center">
                        {showImage && !isCompactMode && (
                          <div className={`${imgSize} rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden flex-shrink-0 border border-gray-200`}>
                            {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className={iconSize} />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className={`font-bold text-gray-900 ${isCompactMode ? 'text-xs' : 'text-base'} leading-snug line-clamp-1`} title={product.name}>{product.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{product.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    {isAllCategories ? (
                      <>
                        <td className={`${cellPadding} align-top text-right`}>
                          <span className={`inline-block ${isCompactMode ? 'px-1.5 py-0.5' : 'px-2.5 py-1'} bg-gray-100 text-gray-600 font-bold text-[10px] rounded-md border border-gray-200 whitespace-nowrap`}>
                            {categoryDisplayMap[product.category]}
                          </span>
                        </td>
                        <td className={`${cellPadding} align-top`}>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {product.specDetails && Object.keys(product.specDetails).length > 0 ? (
                              Object.entries(product.specDetails)
                                .filter(([key]) => key !== 'brand')
                                .slice(0, isCompactMode ? 4 : 8)
                                .map(([key, value]) => (
                                  <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 whitespace-nowrap">
                                    <span className="font-medium text-gray-400 mr-1 capitalize">{key}:</span> {value}
                                  </span>
                                ))
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </div>
                        </td>
                      </>
                    ) : dynamicSpecs.length > 0 ? (
                      dynamicSpecs.slice(0, 4).map(spec => (
                        <td key={spec.key} className={`${cellPadding} align-top text-right`}>
                          {product.specDetails?.[spec.key] ? (
                            <span className={`bg-white ${isCompactMode ? 'px-1.5 py-0.5' : 'px-2.5 py-1'} rounded text-[10px] font-medium text-gray-700 border border-gray-200 whitespace-nowrap`}>
                              {product.specDetails[spec.key]}
                            </span>
                          ) : <span className="text-gray-300 text-xs">-</span>}
                        </td>
                      ))
                    ) : (
                      <td className={`${cellPadding} align-top text-right`}>
                        <span className={`inline-block ${isCompactMode ? 'px-1.5 py-0.5' : 'px-2.5 py-1'} bg-gray-100 text-gray-600 font-bold text-[10px] rounded-md border border-gray-200`}>
                          {categoryDisplayMap[product.category]}
                        </span>
                      </td>
                    )}

                    <td className={`${cellPadding} font-bold text-right text-gray-900 tabular-nums ${isCompactMode ? 'text-sm' : 'text-base'} align-top`}>
                      {product.price.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-[10px] text-gray-400 font-mono whitespace-nowrap align-top text-right pt-2`}>
                        {formatTime(product.lastUpdated)}
                    </td>
                    <td className={`${cellPadding} text-right sticky right-0 bg-white group-hover:bg-gray-50 z-10 transition-colors align-top`}>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => onEdit(product)} className={`${actionBtnPadding} text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors`} title="編輯">
                          <Edit className={iconSize} />
                        </button>
                        <button onClick={() => onDelete(product.id)} className={`${actionBtnPadding} text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors`} title="刪除">
                          <Trash2 className={iconSize} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
