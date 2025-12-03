// components/admin/FilterControls.tsx
import React from 'react';
import { Search, X } from 'lucide-react';
import { Category } from '../../types';
import { categoryDisplayMap } from '../../data/mockData';

interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  productCount: number;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  productCount,
}) => {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="搜尋商品名稱、ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm transition-shadow"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="清除搜尋"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <button 
          onClick={() => setFilterCategory('All')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterCategory === 'All' ? 'bg-black text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
        >
          全部 ({productCount})
        </button>
        {Object.values(Category).map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterCategory === cat ? 'bg-black text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            {categoryDisplayMap[cat]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterControls;
