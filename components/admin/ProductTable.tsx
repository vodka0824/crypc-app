
// components/admin/ProductTable.tsx
import React from 'react';
import { Category, Product } from '../../types';
import { categoryDisplayMap, categoryFilters } from '../../data/mockData';
import { Loader2, Square, CheckSquare, Edit, Trash2, Clock, Image as ImageIcon } from 'lucide-react';

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

  return (
    // Fixed height container acting as the "Scroll View"
    <div className="h-full bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          {/* Sticky Header: Sticks to the top of this container */}
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <tr>
              <th className="px-4 py-3 w-12 text-center sticky left-0 bg-gray-50 z-20">
                <button onClick={onSelectAll} className="flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                  {selectedIds.size > 0 && selectedIds.size === filteredProducts.length ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                </button>
              </th>
              
              <th className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider w-[250px] min-w-[250px]">商品名稱 / ID</th>
              
              {isAllCategories ? (
                <>
                  <th className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">分類</th>
                  {/* Flexible width for specs to take up remaining space */}
                  <th className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider min-w-[300px]">規格詳情</th>
                </>
              ) : dynamicSpecs.length > 0 ? (
                dynamicSpecs.slice(0, 4).map(spec => (
                  <th key={spec.key} className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{spec.label}</th>
                ))
              ) : (
                <th className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider">分類</th>
              )}
              
              <th className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider text-right w-28 whitespace-nowrap">價格</th>
              <th className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap">
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> 最後更新</div>
              </th>
              <th className="px-4 py-3 text-sm font-bold text-gray-500 uppercase tracking-wider text-right w-24 sticky right-0 bg-gray-50 z-20">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>讀取資料中...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-gray-400">
                  {products.length === 0 ? '資料庫為空，請點擊上方「初始化」按鈕寫入預設資料。' : '找不到符合搜尋條件的商品'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const isSelected = selectedIds.has(product.id);
                const showImage = product.category === Category.CASE;

                return (
                  <tr key={product.id} className={`group hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-4 py-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 transition-colors text-center align-top">
                      <button onClick={() => onSelectOne(product.id)} className={`flex items-center justify-center mt-1 ${isSelected ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </button>
                    </td>
                    
                    <td className="px-4 py-4 align-top">
                      <div className="flex gap-4">
                        {showImage && (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden flex-shrink-0 border border-gray-200">
                            {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-base leading-snug line-clamp-2" title={product.name}>{product.name}</div>
                          <div className="text-xs text-gray-400 font-mono mt-1">{product.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    {isAllCategories ? (
                      <>
                        <td className="px-4 py-4 align-top">
                          <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 font-bold text-xs rounded-md border border-gray-200 whitespace-nowrap">
                            {categoryDisplayMap[product.category]}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {product.specDetails && Object.keys(product.specDetails).length > 0 ? (
                              Object.entries(product.specDetails)
                                .filter(([key]) => key !== 'brand')
                                .slice(0, 8)
                                .map(([key, value]) => (
                                  <span key={key} className="inline-flex items-center px-2 py-1 rounded bg-white border border-gray-200 text-xs text-gray-600 whitespace-nowrap">
                                    <span className="font-medium text-gray-400 mr-1.5 capitalize">{key}:</span> {value}
                                  </span>
                                ))
                            ) : (
                              <span className="text-gray-300 text-sm">-</span>
                            )}
                          </div>
                        </td>
                      </>
                    ) : dynamicSpecs.length > 0 ? (
                      dynamicSpecs.slice(0, 4).map(spec => (
                        <td key={spec.key} className="px-4 py-4 align-top">
                          {product.specDetails?.[spec.key] ? (
                            <span className="bg-white px-2.5 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200 whitespace-nowrap">
                              {product.specDetails[spec.key]}
                            </span>
                          ) : <span className="text-gray-300 text-sm">-</span>}
                        </td>
                      ))
                    ) : (
                      <td className="px-4 py-4 align-top">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 font-bold text-xs rounded-md border border-gray-200">
                          {categoryDisplayMap[product.category]}
                        </span>
                      </td>
                    )}

                    <td className="px-4 py-4 font-bold text-right text-gray-900 tabular-nums text-base align-top">
                      {product.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400 font-mono whitespace-nowrap align-top pt-5">
                        {formatTime(product.lastUpdated)}
                    </td>
                    <td className="px-4 py-4 text-right sticky right-0 bg-white group-hover:bg-gray-50 z-10 transition-colors align-top">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEdit(product)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors" title="編輯">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="刪除">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
