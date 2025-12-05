
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
    // Mobile: Horizontal Scroll (flex-nowrap, overflow-x-auto)
    // Desktop: Wrap (md:flex-wrap)
    <div className="flex flex-nowrap md:flex-wrap gap-2 py-4 bg-[#F5F5F7] overflow-x-auto hide-scrollbar px-1 -mx-1 md:px-0 md:mx-0">
      <button 
        onClick={() => setFilterCategory('All')}
        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all border whitespace-nowrap ${filterCategory === 'All' ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
      >
        全部 ({productCount})
      </button>
      {Object.values(Category).map(cat => (
        <button
          key={cat}
          onClick={() => setFilterCategory(cat)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all border whitespace-nowrap ${filterCategory === cat ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          {categoryDisplayMap[cat]}
        </button>
      ))}
    </div>
  );
};

export default FilterControls;
