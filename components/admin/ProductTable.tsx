
// components/admin/ProductTable.tsx
import React from 'react';
import { Category, Product } from '../../types';
import { categoryDisplayMap, categoryFilters } from '../../data/mockData';
import { Loader2, Square, CheckSquare, Edit, Trash2, Clock, Image as ImageIcon, Box } from 'lucide-react';
// @ts-ignore
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

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
  isCompactMode: boolean;
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

  // --- Style Helpers ---
  const headerClass = `flex items-center bg-gray-50 border-b border-gray-200 sticky top-0 z-30 shadow-sm ${isCompactMode ? 'py-2' : 'py-3'}`;
  const rowClass = (isSelected: boolean) => `flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/40' : 'bg-white'} ${isCompactMode ? 'text-xs' : 'text-sm'}`;
  
  // Column Widths
  const colCheckbox = "w-12 flex-shrink-0 text-center";
  const colName = "w-[250px] flex-shrink-0 px-4 text-left";
  const colCat = "w-24 flex-shrink-0 px-4 text-center";
  const colSpecs = "flex-1 min-w-[300px] px-4 text-left overflow-hidden";
  const colPrice = "w-28 flex-shrink-0 px-4 text-right font-mono"; // Mono for alignment
  const colTime = "w-36 flex-shrink-0 px-4 text-right";
  const colAction = "w-24 flex-shrink-0 px-4 text-right";

  const DesktopRow = ({ index, style }: ListChildComponentProps) => {
    const product = filteredProducts[index];
    const isSelected = selectedIds.has(product.id);
    const showImage = product.category === Category.CASE;
    
    return (
      <div style={style} className={rowClass(isSelected)}>
        <div className={`${colCheckbox}`}>
          <button onClick={() => onSelectOne(product.id)} className={`flex items-center justify-center w-full h-full ${isSelected ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>
            {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
          </button>
        </div>
        
        <div className={`${colName} flex items-center`}>
           <div className="flex gap-3 items-center w-full">
                {showImage && !isCompactMode && (
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden flex-shrink-0 border border-gray-200">
                    {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-4 w-4" />}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900 leading-snug truncate" title={product.name}>{product.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono truncate">{product.id}</div>
                </div>
            </div>
        </div>

        {isAllCategories ? (
            <>
                <div className={`${colCat} flex items-center justify-center`}>
                    <span className={`inline-block bg-gray-100 text-gray-600 font-bold rounded-md border border-gray-200 whitespace-nowrap ${isCompactMode ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
                        {categoryDisplayMap[product.category]}
                    </span>
                </div>
                <div className={`${colSpecs} flex items-center`}>
                    <div className="flex flex-wrap gap-1 h-full items-center content-center">
                    {product.specDetails && Object.keys(product.specDetails).length > 0 ? (
                        Object.entries(product.specDetails)
                        .filter(([key]) => key !== 'brand')
                        .slice(0, isCompactMode ? 3 : 6)
                        .map(([key, value]) => (
                            <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 whitespace-nowrap">
                            <span className="font-medium text-gray-400 mr-1 capitalize">{key}:</span> {value}
                            </span>
                        ))
                    ) : <span className="text-gray-300 text-xs">-</span>}
                    </div>
                </div>
            </>
        ) : (
            dynamicSpecs.slice(0, 4).map(spec => (
                <div key={spec.key} className="flex-1 px-4 text-center flex items-center justify-center">
                    {product.specDetails?.[spec.key] ? (
                        <span className={`bg-white rounded font-medium text-gray-700 border border-gray-200 whitespace-nowrap ${isCompactMode ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
                            {product.specDetails[spec.key]}
                        </span>
                    ) : <span className="text-gray-300 text-xs">-</span>}
                </div>
            ))
        )}

        <div className={`${colPrice} font-bold text-gray-900 tabular-nums flex items-center justify-end`}>
            {product.price.toLocaleString()}
        </div>
        <div className={`${colTime} text-[10px] text-gray-400 font-mono whitespace-nowrap flex items-center justify-end`}>
            {formatTime(product.lastUpdated)}
        </div>
        <div className={`${colAction} flex items-center justify-end`}>
            <div className="flex gap-1">
                <button onClick={() => onEdit(product)} className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors" title="編輯">
                    <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="刪除">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
      </div>
    );
  };

  const MobileRow = ({ index, style }: ListChildComponentProps) => {
    const product = filteredProducts[index];
    const isSelected = selectedIds.has(product.id);
    
    return (
        <div style={style} className="px-1 py-1.5">
            <div 
                className={`relative w-full h-full bg-white border border-gray-100 rounded-2xl flex items-center p-3 gap-3 transition-all ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'shadow-sm'}`}
                onClick={() => onSelectOne(product.id)}
            >
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 relative overflow-hidden">
                    {product.image ? (
                        <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                    ) : (
                        <div className="text-gray-300 flex flex-col items-center">
                            <ImageIcon className="h-5 w-5 opacity-50" />
                        </div>
                    )}
                    {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-blue-500 text-white rounded-full p-1"><CheckSquare className="h-4 w-4" /></div>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{product.category}</span>
                            {product.specDetails?.brand && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 rounded-full">{product.specDetails.brand}</span>}
                        </div>
                        <h3 className="font-bold text-gray-900 leading-tight text-sm line-clamp-1 mt-0.5">
                            {product.name}
                        </h3>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                        <div className="font-mono font-bold text-base text-black">
                            ${product.price.toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="p-1.5 bg-gray-50 rounded-full text-blue-600 active:scale-95"><Edit className="h-4 w-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="p-1.5 bg-gray-50 rounded-full text-red-600 active:scale-95"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 bg-white rounded-3xl border border-gray-200">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span>讀取資料中...</span>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-200 p-8 text-center">
        <Box className="h-12 w-12 mb-2 opacity-20" />
        <p>{products.length === 0 ? '資料庫為空，請點擊上方「初始化」按鈕寫入預設資料。' : '找不到符合搜尋條件的商品'}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent md:bg-white md:rounded-3xl md:border md:border-gray-200 md:shadow-sm overflow-hidden">
      
      {/* --- Mobile View (Virtualized List) --- */}
      <div className="md:hidden h-full">
        {selectedIds.size > 0 && (
            <div className="sticky top-0 z-20 bg-[#F5F5F7]/95 backdrop-blur-sm p-2 mb-1 flex justify-between items-center rounded-lg border border-blue-200 text-blue-800 shadow-sm">
                <span className="font-bold text-sm">已選取 {selectedIds.size} 項</span>
                <button onClick={onSelectAll} className="text-xs font-bold underline">
                    {selectedIds.size === filteredProducts.length ? '取消全選' : '全選'}
                </button>
            </div>
        )}
        <div className="flex-1 h-full">
            <AutoSizer>
            {({ height, width }) => (
                <List
                    height={height - (selectedIds.size > 0 ? 50 : 0)}
                    itemCount={filteredProducts.length}
                    itemSize={106} 
                    width={width}
                >
                    {MobileRow}
                </List>
            )}
            </AutoSizer>
        </div>
      </div>

      {/* --- Desktop View (Virtualized Flex-Table) --- */}
      <div className="hidden md:flex flex-col h-full">
        {/* Table Header */}
        <div className={headerClass}>
            <div className={`${colCheckbox}`}>
                <button onClick={onSelectAll} className="flex items-center justify-center w-full text-gray-400 hover:text-black">
                  {selectedIds.size > 0 && selectedIds.size === filteredProducts.length ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                </button>
            </div>
            <div className={`${colName} font-bold text-gray-500 uppercase tracking-wider text-sm`}>商品名稱 / ID</div>
            
            {isAllCategories ? (
                <>
                    <div className={`${colCat} font-bold text-gray-500 uppercase tracking-wider text-sm`}>分類</div>
                    <div className={`${colSpecs} font-bold text-gray-500 uppercase tracking-wider text-sm`}>規格詳情</div>
                </>
            ) : dynamicSpecs.length > 0 ? (
                dynamicSpecs.slice(0, 4).map(spec => (
                    <div key={spec.key} className="flex-1 min-w-[100px] px-4 text-center font-bold text-gray-500 uppercase tracking-wider text-sm">{spec.label}</div>
                ))
            ) : (
                <div className="flex-1 text-center px-4 font-bold text-gray-500 uppercase tracking-wider text-sm">分類</div>
            )}

            <div className={`${colPrice} font-bold text-gray-500 uppercase tracking-wider text-sm`}>價格</div>
            <div className={`${colTime} font-bold text-gray-500 uppercase tracking-wider text-sm`}>
                <div className="flex items-center gap-1 justify-end"><Clock className="h-3 w-3" /> {isCompactMode ? '更新' : '最後更新'}</div>
            </div>
            <div className={`${colAction} font-bold text-gray-500 uppercase tracking-wider text-sm`}>操作</div>
        </div>

        {/* Virtualized Body */}
        <div className="flex-1">
            <AutoSizer>
            {({ height, width }) => (
                <List
                    height={height}
                    itemCount={filteredProducts.length}
                    itemSize={isCompactMode ? 52 : 72}
                    width={width}
                >
                    {DesktopRow}
                </List>
            )}
            </AutoSizer>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
