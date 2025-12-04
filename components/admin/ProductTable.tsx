
// components/admin/ProductTable.tsx
import React from 'react';
import { Category, Product } from '../../types';
import { categoryDisplayMap, categoryFilters } from '../../data/mockData';
import { Loader2, Square, CheckSquare, Edit, Trash2, FileText, Clock } from 'lucide-react';

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

  // Sticky header offset calculation:
  // Navbar (64px) + Toolbar (~80px) + Category Filters (~60px) ~= 204px
  // Adjust based on actual UI. Using top-[190px] as a safe bet for desktop.
  
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm relative isolate">
      <div className="overflow-x-auto rounded-3xl">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-[190px] z-20 shadow-sm">
            <tr>
              <th className="px-6 py-4 w-12 sticky left-0 bg-gray-50 z-20">
                <button onClick={onSelectAll} className="flex items-center text-gray-500 hover:text-black">
                  {selectedIds.size > 0 && selectedIds.size === filteredProducts.length ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                </button>
              </th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[240px]">商品名稱 / ID</th>
              
              {isAllCategories ? (
                <>
                  <th className="px-6 py-4 font-bold text-gray-900 w-32 whitespace-nowrap">分類</th>
                  <th className="px-6 py-4 font-bold text-gray-900 min-w-[200px]">規格詳情</th>
                </>
              ) : dynamicSpecs.length > 0 ? (
                dynamicSpecs.slice(0, 4).map(spec => (
                  <th key={spec.key} className="px-4 py-4 font-bold text-gray-700 whitespace-nowrap">{spec.label}</th>
                ))
              ) : (
                <th className="px-6 py-4 font-bold text-gray-900">分類</th>
              )}
              
              <th className="px-6 py-4 font-bold text-gray-900 text-right whitespace-nowrap w-28">價格</th>
              <th className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap w-32">
                <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 最後更新</div>
              </th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right w-24 sticky right-0 bg-gray-50 z-20">操作</th>
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
                  <tr key={product.id} className={`group hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 transition-colors">
                      <button onClick={() => onSelectOne(product.id)} className={`flex items-center ${isSelected ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {showImage && (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden flex-shrink-0 border border-gray-200">
                            {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <FileText className="h-5 w-5" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 leading-tight line-clamp-2" title={product.name}>{product.name}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{product.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    {isAllCategories ? (
                      <>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 font-bold text-xs rounded-lg border border-gray-200 whitespace-nowrap">
                            {categoryDisplayMap[product.category]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {product.specDetails && Object.keys(product.specDetails).length > 0 ? (
                              Object.entries(product.specDetails)
                                .filter(([key]) => key !== 'brand')
                                .slice(0, 6)
                                .map(([key, value]) => (
                                  <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 whitespace-nowrap">
                                    <span className="font-semibold text-gray-400 mr-1 capitalize">{key}:</span> {value}
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
                        <td key={spec.key} className="px-4 py-4 text-sm text-gray-600">
                          {product.specDetails?.[spec.key] ? (
                            <span className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200 whitespace-nowrap">
                              {product.specDetails[spec.key]}
                            </span>
                          ) : <span className="text-gray-300">-</span>}
                        </td>
                      ))
                    ) : (
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 font-bold text-xs rounded-lg border border-gray-200">
                          {categoryDisplayMap[product.category]}
                        </span>
                      </td>
                    )}

                    <td className="px-6 py-4 font-bold text-right text-gray-900 tabular-nums">
                      {product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono whitespace-nowrap">
                        {formatTime(product.lastUpdated)}
                    </td>
                    <td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-gray-50 z-10 transition-colors">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEdit(product)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
