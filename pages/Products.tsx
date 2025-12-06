
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Category, Product, ProductSpecs } from '../types';
import { Filter, ShoppingBag, X, ChevronDown, ChevronRight, SlidersHorizontal, Check, Home, Cpu, CircuitBoard, HardDrive, Monitor, Disc, Box, Wind, Search, MemoryStick, Gamepad2, Droplets, Zap, Mouse } from 'lucide-react';
import { categoryFilters, categoryDisplayMap } from '../data/mockData';
import { useProducts } from '../contexts/ProductContext';
import { filterProducts, getSmartOptions } from '../utils/searchHelper';

interface ProductsProps {
  addToCart: (product: Product) => void;
}

const Products: React.FC<ProductsProps> = ({ addToCart }) => {
  const { products: allProducts } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedCategory !== 'All') {
      setExpandedNodes(prev => ({ ...prev, [selectedCategory]: true }));
    }
  }, [selectedCategory]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const filteredProducts = useMemo(() => {
    const result = filterProducts(allProducts, searchQuery, selectedCategory, activeFilters);

    switch (sortOption) {
      case 'price-asc':
        result.sort((a: Product, b: Product) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a: Product, b: Product) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategory, activeFilters, allProducts, sortOption, searchQuery]);

  const handleCategorySelect = (cat: Category | 'All') => {
    if (selectedCategory === cat) {
        if (cat !== 'All') toggleNode(cat);
    } else {
        setSelectedCategory(cat);
        setActiveFilters({});
        if (cat !== 'All') {
            setExpandedNodes(prev => ({ ...prev, [cat]: true }));
        }
    }
  };

  const toggleFilter = (key: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        const updated = current.filter(v => v !== value);
        return updated.length > 0 ? { ...prev, [key]: updated } : (() => {
          const { [key]: _, ...rest } = prev;
          return rest;
        })();
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case Category.CPU: return Cpu;
      case Category.MB: return CircuitBoard;
      case Category.GPU: return Gamepad2;
      case Category.RAM: return MemoryStick;
      case Category.SSD: return HardDrive;
      case Category.CASE: return Box;
      case Category.PSU: return Zap;
      case Category.COOLER: return Droplets;
      case Category.AIR_COOLER: return Wind;
      case Category.MONITOR: return Monitor;
      case Category.SOFTWARE: return Disc;
      case Category.OTHERS: return Mouse;
      default: return Box;
    }
  };

  const renderTree = () => {
    const orderedCategories = [
        Category.CPU, Category.MB, Category.GPU, Category.RAM, Category.SSD, Category.CASE, Category.PSU, Category.COOLER, Category.AIR_COOLER, Category.MONITOR, Category.SOFTWARE
    ];

    return (
        <div className="space-y-3 select-none">
            <div 
                onClick={() => handleCategorySelect('All')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedCategory === 'All' ? 'bg-black text-white font-bold shadow-lg shadow-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <span className="flex-1 text-base">全部商品</span>
            </div>

            {orderedCategories.map(cat => {
                const isCatActive = selectedCategory === cat;
                const isCatExpanded = expandedNodes[cat];
                const filters = categoryFilters[cat];

                return (
                    <div key={cat} className="space-y-1">
                        <div 
                            onClick={() => handleCategorySelect(cat)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${isCatActive ? 'bg-black text-white shadow-lg shadow-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {isCatExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            <span className={`flex-1 text-base font-medium ${isCatActive ? 'text-white' : 'text-gray-900'}`}>
                                {categoryDisplayMap[cat]}
                            </span>
                        </div>

                        {isCatExpanded && filters && (
                            <div className="pl-6 space-y-2 border-l-2 border-gray-100 ml-4 mt-2 mb-2 animate-fade-in">
                                {filters.map(filter => {
                                    const options = getSmartOptions(allProducts, cat, filter.key, searchQuery, activeFilters);
                                    if (options.length === 0) return null;

                                    const isFilterExpanded = expandedNodes[`${cat}-${filter.key}`];

                                    return (
                                        <div key={filter.key}>
                                            <div 
                                                onClick={() => toggleNode(`${cat}-${filter.key}`)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                 {isFilterExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                 <span>{filter.label}</span>
                                            </div>

                                            {isFilterExpanded && (
                                                <div className="pl-6 py-1 space-y-1.5">
                                                    {options.map((option: string) => {
                                                        const isChecked = activeFilters[filter.key]?.includes(option);
                                                        return (
                                                            <div 
                                                                key={option} 
                                                                onClick={() => toggleFilter(filter.key as string, option)}
                                                                className="flex items-center gap-2 py-1.5 cursor-pointer group"
                                                            >
                                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                                    isChecked ? 'bg-black border-black shadow-sm' : 'border-gray-300 bg-white group-hover:border-gray-400'
                                                                }`}>
                                                                    {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
                                                                </div>
                                                                <span className={`text-sm ${isChecked ? 'text-black font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                                    {option}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
  };

  const Breadcrumbs = () => (
    <nav className="flex items-center text-sm md:text-base text-gray-500 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
      <Link to="/" className="flex items-center hover:text-black transition-colors flex-shrink-0">
        <Home className="h-5 w-5 mr-1.5" />
        首頁
      </Link>
      <ChevronRight className="h-5 w-5 mx-2 text-gray-300 flex-shrink-0" />
      <button 
        onClick={() => { setSelectedCategory('All'); setActiveFilters({}); setSearchQuery(''); }}
        className={`hover:text-black transition-colors flex-shrink-0 ${selectedCategory === 'All' ? 'font-bold text-gray-900' : ''}`}
      >
        精選零組件
      </button>
      {selectedCategory !== 'All' && (
        <>
          <ChevronRight className="h-5 w-5 mx-2 text-gray-300 flex-shrink-0" />
          <button
             onClick={() => setActiveFilters({})}
             className={`hover:text-black transition-colors flex-shrink-0 ${Object.keys(activeFilters).length === 0 ? 'font-bold text-gray-900' : ''}`}
          >
            {categoryDisplayMap[selectedCategory]}
          </button>
        </>
      )}
      {Object.entries(activeFilters).map(([key, values]: [string, string[]]) => {
         if (values.length === 0) return null;
         return (
           <React.Fragment key={key}>
             <ChevronRight className="h-5 w-5 mx-2 text-gray-300 flex-shrink-0" />
             <span className="font-bold text-gray-900 flex-shrink-0">
               {values.join(', ')}
             </span>
           </React.Fragment>
         );
      })}
    </nav>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }
        `}
      </style>

      <Breadcrumbs />

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 w-full md:w-auto">精選零組件</h1>
        
        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto items-center">
            <div className="relative flex-grow md:flex-grow-0 w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="搜尋商品..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-3 bg-white border border-gray-300 rounded-xl leading-tight focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm text-sm transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
            </div>

            <div className="relative flex-grow md:flex-grow-0 w-full md:w-auto">
                <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full md:w-auto appearance-none bg-white border border-gray-300 text-gray-700 py-3 pl-5 pr-12 rounded-xl leading-tight focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-sm text-sm font-medium transition-all"
                >
                    <option value="default">預設排序</option>
                    <option value="price-asc">價格: 低到高</option>
                    <option value="price-desc">價格: 高到低</option>
                    <option value="name-asc">名稱: A-Z</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <ChevronDown className="h-5 w-5" />
                </div>
            </div>

            <button 
              className="lg:hidden flex items-center justify-center gap-2 px-5 py-3 bg-black text-white rounded-xl flex-shrink-0 font-bold w-full md:w-auto shadow-lg shadow-gray-300"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-5 w-5" /> 規格篩選
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className={`
          lg:w-80 flex-shrink-0 
          ${mobileFiltersOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block bg-white'}
        `}>
          <div className="flex justify-between items-center mb-8 lg:hidden">
            <h2 className="text-2xl font-bold">產品分類</h2>
            <button onClick={() => setMobileFiltersOpen(false)}><X className="h-8 w-8" /></button>
          </div>

          <div className="sticky top-24 max-h-[calc(100vh-100px)] overflow-y-auto pr-3 hide-scrollbar">
             {renderTree()}
             {mobileFiltersOpen && (
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full mt-8 bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg"
                >
                  查看 {filteredProducts.length} 個商品
                </button>
             )}
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: Product, index: number) => {
                const CategoryIcon = getCategoryIcon(product.category);
                
                return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-[2rem] overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 transition-all duration-300 group border border-gray-100/50 flex flex-col animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-64 bg-gray-50/50 p-8 flex items-center justify-center overflow-hidden group/image">
                      {product.image ? (
                         <>
                            <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                                <CategoryIcon className="h-24 w-24 opacity-50" />
                            </div>
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 mix-blend-multiply"
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                         </>
                      ) : (
                         <div className="flex flex-col items-center justify-center text-gray-300">
                             <CategoryIcon className="h-24 w-24 mb-3 opacity-50" />
                             <span className="text-sm font-medium text-gray-400">CryPC Selection</span>
                         </div>
                      )}
                      
                      {product.specDetails?.brand && (
                        <span className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-gray-100 z-20">
                          {product.specDetails.brand}
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8 text-white backdrop-blur-sm z-30">
                        <div className="w-full space-y-3">
                            <h4 className="font-bold border-b border-gray-600 pb-2 mb-3 text-lg">{product.name}</h4>
                            {Object.entries(product.specDetails || {}).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm text-gray-300">
                                  <span className="capitalize opacity-70">{key}:</span>
                                  <span className="font-bold text-white">{value}</span>
                              </div>
                            ))}
                            <div className="pt-4 text-center text-sm text-gray-400 font-medium">點擊查看詳情</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</span>
                        {product.specDetails?.socket && <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{product.specDetails.socket}</span>}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug line-clamp-2">{product.name}</h3>
                      
                      <div className="flex-grow mb-6">
                        {product.specDetails && Object.keys(product.specDetails).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(product.specDetails)
                              .filter(([key]) => key !== 'brand')
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <div key={key} className="flex items-center text-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-3 flex-shrink-0"></span>
                                  <span className="text-gray-400 capitalize w-20 flex-shrink-0 font-medium text-xs">{key}</span>
                                  <span className="text-gray-700 font-bold truncate text-xs">{value}</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{product.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50">
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">NT$ {product.price.toLocaleString()}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="px-5 py-3 bg-accent text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-200 flex gap-2 items-center font-bold"
                        >
                          <ShoppingBag className="h-5 w-5" />
                          加入
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center text-gray-400 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">沒有符合條件的商品，請嘗試調整篩選器。</p>
                <button 
                  onClick={() => { setActiveFilters({}); setSearchQuery(''); }}
                  className="mt-6 text-blue-600 hover:underline text-base font-medium"
                >
                  清除所有篩選
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
