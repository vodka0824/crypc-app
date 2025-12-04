
// components/admin/FilterControls.tsx
import React from 'react';
import { Category } from '../../types';
import { categoryDisplayMap } from '../../data/mockData';

interface FilterControlsProps {
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  productCount: number;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filterCategory,
  setFilterCategory,
  productCount,
}) => {
  return (
    <div className="flex flex-wrap gap-2 py-4 bg-[#F5F5F7]">
      <button 
        onClick={() => setFilterCategory('All')}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${filterCategory === 'All' ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
      >
        全部 ({productCount})
      </button>
      {Object.values(Category).map(cat => (
        <button
          key={cat}
          onClick={() => setFilterCategory(cat)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${filterCategory === cat ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          {categoryDisplayMap[cat]}
        </button>
      ))}
    </div>
  );
};

export default FilterControls;
