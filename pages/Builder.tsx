
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, BuildState, BuilderItem, ProductSpecs, BuildTemplate, CartItem } from '../types';
import { Plus, Check, RotateCcw, X, ChevronDown, ChevronRight, Cpu, Minus, Trash2, AlertTriangle, SlidersHorizontal, ListFilter, Eraser, Monitor, Disc, Save, FolderOpen, Search, RefreshCw, Sparkles, Loader2, Bot, Share2, Copy, StickyNote, Box, Fan, Wind, Zap } from 'lucide-react';
import { categoryFilters, categoryDisplayMap } from '../data/mockData';
import { useProducts } from '../contexts/ProductContext';
import { generateSmartBuild } from '../services/geminiService';

// Slot definition for UI iteration
const buildSlots = [
  { category: Category.CPU, icon: Cpu, label: 'CPU 處理器' },
  { category: Category.MB, icon: Check, label: '主機板' },
  { category: Category.RAM, icon: Check, label: '記憶體' },
  { category: Category.GPU, icon: Check, label: '顯示卡' },
  { category: Category.SSD, icon: Check, label: '固態硬碟' },
  { category: Category.COOLER, icon: Check, label: '散熱器(水冷)' },
  { category: Category.AIR_COOLER, icon: Wind, label: '散熱器(風冷)' },
  { category: Category.PSU, icon: Check, label: '電源供應器' },
  { category: Category.CASE, icon: Check, label: '機殼' },
  { category: Category.MONITOR, icon: Monitor, label: '螢幕' },
  { category: Category.SOFTWARE, icon: Disc, label: '軟體' },
  { category: Category.OTHERS, icon: Box, label: '其它商品' },
];

const usagePresets = [
    { label: '電競遊戲 (3A)', value: '遊玩 3A 大作遊戲，追求高畫質與流暢度' },
    { label: '文書辦公', value: '日常文書處理、網頁瀏覽、股票看盤，追求穩定與靜音' },
    { label: '影音創作', value: '影片剪輯、3D 建模渲染、圖形設計' },
    { label: '程式開發', value: '軟體開發、虛擬機運行、多工處理' }
];

interface BuilderProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const Builder: React.FC<BuilderProps> = ({ cartItems, setCartItems }) => {
  const { products: allProducts } = useProducts();

  // --- Derived State: Map Global Cart to Categories ---
  const build: BuildState = useMemo(() => {
    // Initialize state with known categories to avoid undefined errors
    const state: any = {};
    Object.values(Category).forEach(cat => {
        state[cat] = [];
    });

    cartItems.forEach(item => {
        const builderItem: BuilderItem = {
            ...item,
            uniqueId: item.id
        };
        if (state[item.category]) {
            state[item.category].push(builderItem);
        } else {
            // Fallback for items with unknown categories
            if (!state[Category.OTHERS]) state[Category.OTHERS] = [];
            state[Category.OTHERS].push(builderItem);
        }
    });
    return state as BuildState;
  }, [cartItems]);

  
  // Selection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [modalSort, setModalSort] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Replace Mode State
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);
  
  // Local state for quantity input in modal (product.id -> quantity)
  const [rowQuantities, setRowQuantities] = useState<Record<string, number>>({});
  
  // Selection Modal Filter State
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<BuildTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateMode, setTemplateMode] = useState<'save' | 'load'>('load');

  // AI Builder Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiBudget, setAiBudget] = useState<string>('');
  const [aiUsage, setAiUsage] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');

  // Quantity Selector Sheet State (Mobile)
  const [qtySelectorId, setQtySelectorId] = useState<string | null>(null);

  // Load templates from local storage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('crypc_templates');
    if (savedTemplates) {
        try {
            setTemplates(JSON.parse(savedTemplates));
        } catch (e) {
            console.error("Failed to parse templates");
        }
    }
  }, []);

  // --- Helpers ---
  const primaryCpu = build[Category.CPU]?.[0];
  const primaryMb = build[Category.MB]?.[0];
  const primaryRam = build[Category.RAM]?.[0];
  const primaryPsu = build[Category.PSU]?.[0];
  const primaryCase = build[Category.CASE]?.[0];
  const primaryGpu = build[Category.GPU]?.[0];
  const primaryCooler = build[Category.COOLER]?.[0];
  const primaryAirCooler = build[Category.AIR_COOLER]?.[0];

  const parseWattage = (val?: string): number => {
    if (!val) return 0;
    const match = val.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const parseDimension = (val?: string): number => {
    if (!val) return 9999; // If no limit specified, assume infinite
    const match = val.match(/(\d+)/);
    return match ? parseInt(match[0]) : 9999;
  }

  // --- Advanced Power Calculation Logic ---
  const totalTDP = useMemo(() => {
      let tdp = 0;
      let hasMajorComponents = false;

      // Component-specific estimates (Conservative Peak Values)
      const ESTIMATES: Partial<Record<Category, number>> = {
          [Category.MB]: 50,       // Chipset, VRM, Onboard Audio/LAN/Wifi overhead
          [Category.RAM]: 15,      // Per kit/module (DDR5 runs hotter, includes RGB)
          [Category.SSD]: 10,      // NVMe Gen4/5 peak write
          [Category.COOLER]: 35,   // Pump + Fans (Liquid AIO)
          [Category.AIR_COOLER]: 10,// Fan overhead
          [Category.CASE]: 10      // Front panel USB, simple controller
      };

      cartItems.forEach(item => {
          // 1. Explicit TDP from Specs (CPU & GPU are the biggest consumers)
          if (item.category === Category.CPU || item.category === Category.GPU) {
              tdp += parseWattage(item.specDetails?.tdp);
              hasMajorComponents = true;
          } 
          // 2. Estimated components based on Category
          else if (item.category in ESTIMATES) {
              const estimate = ESTIMATES[item.category as keyof typeof ESTIMATES] || 0;
              tdp += estimate * item.quantity;
          }
      });

      // 3. Base System Buffer
      // Covers: Fans (3-5W each), USB peripherals (Keyboard/Mouse ~5W), RGB Strips, Efficiency loss margin
      // Only apply buffer if we actually have components selected
      const baseBuffer = hasMajorComponents ? 30 : 0;

      return tdp + baseBuffer;
  }, [cartItems]);

  const recommendedPsuWattage = useMemo(() => {
      if (totalTDP === 0) return 0;
      // Safety factor: Total Power * 1.3 to 1.5 usually recommended for peak load & efficiency curve
      // Rounded up to nearest 50W
      return Math.ceil((totalTDP * 1.3) / 50) * 50;
  }, [totalTDP]);

  // --- Compatibility Validation Logic (Enhanced) ---
  const checkCompatibility = (item: Product): string | null => {
    // 1. MB Checks
    if (item.category === Category.MB) {
        // Check vs CPU Socket
        if (primaryCpu?.specDetails?.socket && item.specDetails?.socket !== primaryCpu.specDetails.socket) {
            return `腳位不符: CPU ${primaryCpu.specDetails.socket} vs MB ${item.specDetails?.socket}`;
        }
        // Check vs RAM Type
        if (primaryRam?.specDetails?.type && item.specDetails?.memoryType) {
            if (primaryRam.specDetails.type !== item.specDetails.memoryType) {
                return `記憶體不符: RAM ${primaryRam.specDetails.type} vs MB 支援 ${item.specDetails.memoryType}`;
            }
        }
    }

    // 2. CPU Checks
    if (item.category === Category.CPU && primaryMb?.specDetails?.socket) {
      if (item.specDetails?.socket !== primaryMb.specDetails.socket) {
        return `腳位不符: MB ${primaryMb.specDetails.socket} vs CPU ${item.specDetails?.socket}`;
      }
    }

    // 3. RAM Checks
    if (item.category === Category.RAM) {
        // Check vs MB Support
        if (primaryMb?.specDetails?.memoryType && item.specDetails?.type !== primaryMb.specDetails.memoryType) {
             return `記憶體不符: MB 支援 ${primaryMb.specDetails.memoryType} vs RAM ${item.specDetails?.type}`;
        }
        // Check vs Existing RAM (Mixing types)
        const otherRam = build[Category.RAM]?.find(r => r.id !== item.id);
        if (otherRam && otherRam.specDetails?.type !== item.specDetails?.type) {
             return `混插警告: ${otherRam.specDetails?.type} 與 ${item.specDetails?.type}`;
        }
    }

    // 4. Physical Size Checks (GPU vs Case)
    if (item.category === Category.GPU && primaryCase?.specDetails?.gpuLength) {
        const caseLimit = parseDimension(primaryCase.specDetails.gpuLength);
        const gpuLen = parseDimension(item.specDetails?.gpuLength);
        if (gpuLen > caseLimit) {
            return `顯卡過長: 卡 ${gpuLen}mm > 機殼限 ${caseLimit}mm`;
        }
    }
    if (item.category === Category.CASE && primaryGpu?.specDetails?.gpuLength) {
        const caseLimit = parseDimension(item.specDetails?.gpuLength);
        const gpuLen = parseDimension(primaryGpu.specDetails.gpuLength);
        if (gpuLen > caseLimit) {
            return `機殼過小: 限長 ${caseLimit}mm < 顯卡 ${gpuLen}mm`;
        }
    }

    // 5. Physical Size Checks (Air Cooler vs Case)
    if (item.category === Category.AIR_COOLER && primaryCase?.specDetails?.coolerHeight) {
        const caseLimit = parseDimension(primaryCase.specDetails.coolerHeight);
        const coolerH = parseDimension(item.specDetails?.coolerHeight);
        if (coolerH > caseLimit) {
            return `散熱器過高: 高 ${coolerH}mm > 機殼限 ${caseLimit}mm`;
        }
    }
    if (item.category === Category.CASE && primaryAirCooler?.specDetails?.coolerHeight) {
        const caseLimit = parseDimension(item.specDetails?.coolerHeight);
        const coolerH = parseDimension(primaryAirCooler.specDetails.coolerHeight);
        if (coolerH > caseLimit) {
            return `機殼過窄: 限高 ${caseLimit}mm < 散熱器 ${coolerH}mm`;
        }
    }
    
    return null;
  };


  // --- Handlers ---
  const handleOpenSelection = (category: Category) => {
    setReplacingItemId(null); // Ensure we are in add mode, not replace mode
    setActiveCategory(category);
    setActiveFilters({});
    setExpandedNodes({});
    setMobileFiltersOpen(false);
    setModalSort('default');
    setSearchQuery('');
    setRowQuantities({});
    setIsModalOpen(true);
  };

  const handleStartReplace = (item: BuilderItem) => {
    setReplacingItemId(item.id);
    setActiveCategory(item.category);
    setActiveFilters({});
    setExpandedNodes({});
    setMobileFiltersOpen(false);
    setModalSort('default');
    setSearchQuery('');
    setRowQuantities({});
    setIsModalOpen(true);
  };

  const handleSwitchCategory = (newCategory: Category) => {
    if (activeCategory === newCategory) return;
    setActiveCategory(newCategory);
    setActiveFilters({}); // Reset filters for new category
    setSearchQuery(''); // Reset search
    setExpandedNodes({}); // Reset tree
    setRowQuantities({}); // Reset quantity inputs
    if (replacingItemId) {
        const item = cartItems.find(i => i.id === replacingItemId);
        if (item && item.category !== newCategory) {
             setReplacingItemId(null); // Exit replace mode if switching to a different category type
        }
    }
  };

  const handleSelectProduct = (product: Product, quantityToAdd: number) => {
    setCartItems(prev => {
        let newCart = [...prev];
        
        // If replacing, remove the old item first
        if (replacingItemId) {
             newCart = newCart.filter(item => item.id !== replacingItemId);
        }

        const existingIndex = newCart.findIndex(p => p.id === product.id);
        if (existingIndex >= 0) {
            newCart[existingIndex] = {
                ...newCart[existingIndex],
                quantity: newCart[existingIndex].quantity + quantityToAdd
            };
        } else {
            newCart.push({ ...product, quantity: quantityToAdd });
        }
        return newCart;
    });
    setRowQuantities(prev => ({ ...prev, [product.id]: 1 }));

    // If replacing, close modal immediately
    if (replacingItemId) {
        setReplacingItemId(null);
        setIsModalOpen(false);
    }
  };

  // Direct Cart Manipulation for Mobile UI
  const handleMobileAdd = (product: Product) => {
    if (replacingItemId) {
        handleSelectProduct(product, 1);
        return;
    }
    setCartItems(prev => [...prev, { ...product, quantity: 1 }]);
  };

  const handleMobileIncrement = (productId: string) => {
    setCartItems(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleMobileDecrement = (productId: string) => {
    setCartItems(prev => {
        const existing = prev.find(item => item.id === productId);
        if (existing && existing.quantity > 1) {
             return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
        } else {
             return prev.filter(item => item.id !== productId);
        }
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    if (window.confirm(`確定要清空 ${categoryDisplayMap[category]} 嗎？`)) {
        setCartItems(prev => prev.filter(item => item.category !== category));
    }
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
        if (item.id === productId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
        }
        return item;
    }));
  };

  const handleDirectUpdateQuantity = (productId: string, newQty: number) => {
    if (isModalOpen) {
        setRowQuantities(prev => ({ ...prev, [productId]: newQty }));
    } else {
        setCartItems(prev => prev.map(item => {
            if (item.id === productId) {
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    }
    setQtySelectorId(null);
  };

  const getCurrentSelectorQty = () => {
    if (!qtySelectorId) return 1;
    if (isModalOpen) {
        return rowQuantities[qtySelectorId] || 1;
    } else {
        const item = cartItems.find(i => i.id === qtySelectorId);
        return item ? item.quantity : 1;
    }
  };

  const resetBuild = () => {
    if(window.confirm('確定要清空目前的估價清單嗎？\n\n警告：此操作將移除所有已選項目且無法復原。')) {
        setCartItems([]);
    }
  };

  const handleShareBuild = () => {
      const text = `【哭PC 配置單】
總價：$${totalPrice.toLocaleString()}
----------
${cartItems.map(item => `${item.category}: ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`).join('\n')}
----------
此報價單由 CryPC 系統產生`;
      
      navigator.clipboard.writeText(text).then(() => {
          alert('配置單已複製到剪貼簿！');
      }).catch(() => {
          alert('複製失敗，請手動截圖。');
      });
  };

  // --- AI Auto Build Handler ---
  const handleAiAutoBuild = async () => {
      if (!aiBudget || !aiUsage) {
          alert('請輸入預算與用途');
          return;
      }

      setIsAiLoading(true);
      setAiExplanation('');
      
      try {
          // Clean non-numeric characters from budget
          const numericBudget = parseInt(aiBudget.replace(/[^0-9]/g, ''));
          
          if (isNaN(numericBudget)) {
             alert('預算格式錯誤，請輸入數字');
             setIsAiLoading(false);
             return;
          }

          const result = await generateSmartBuild(allProducts, numericBudget, aiUsage);
          
          if (result.productIds && result.productIds.length > 0) {
              // Map IDs back to full products
              const newItems: CartItem[] = [];
              result.productIds.forEach(id => {
                  const product = allProducts.find(p => p.id === id);
                  if (product) {
                      newItems.push({ ...product, quantity: 1 });
                  }
              });

              setCartItems(newItems);
              setAiExplanation(result.explanation);
          } else {
              alert('AI 無法找到適合的配置，請嘗試調整預算。');
          }
      } catch (error: any) {
          alert(error.message || 'AI 配單發生錯誤');
      } finally {
          setIsAiLoading(false);
      }
  };


  // --- Template Handlers ---
  const openTemplateModal = (mode: 'save' | 'load') => {
      setTemplateMode(mode);
      setNewTemplateName('');
      setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = () => {
      if (!newTemplateName.trim()) {
          alert('請輸入範本名稱');
          return;
      }
      if (cartItems.length === 0) {
          alert('估價單為空，無法儲存。');
          return;
      }
      const templateItems = cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
      }));
      const newTemplate: BuildTemplate = {
          id: Date.now().toString(),
          name: newTemplateName.trim(),
          timestamp: Date.now(),
          items: templateItems
      };
      const updatedTemplates = [newTemplate, ...templates];
      setTemplates(updatedTemplates);
      localStorage.setItem('crypc_templates', JSON.stringify(updatedTemplates));
      setIsTemplateModalOpen(false);
      alert('範本儲存成功！');
  };

  const handleLoadTemplate = (template: BuildTemplate) => {
      if (cartItems.length > 0) {
          if (!window.confirm('載入範本將會覆蓋目前的估價單，確定要繼續嗎？')) {
              return;
          }
      }
      const newCartItems: CartItem[] = [];
      let missingCount = 0;
      template.items.forEach(tItem => {
          const currentProduct = allProducts.find(p => p.id === tItem.productId);
          if (currentProduct) {
              newCartItems.push({
                  ...currentProduct,
                  quantity: tItem.quantity
              });
          } else {
              missingCount++;
          }
      });
      setCartItems(newCartItems);
      setIsTemplateModalOpen(false);
      if (missingCount > 0) {
          alert(`範本載入成功，但有 ${missingCount} 個商品已下架或無法辨識，已自動略過。`);
      }
  };

  const handleDeleteTemplate = (id: string) => {
      if (window.confirm('確定要刪除此範本嗎？')) {
          const updated = templates.filter(t => t.id !== id);
          setTemplates(updated);
          localStorage.setItem('crypc_templates', JSON.stringify(updated));
      }
  };

  // --- Filter Logic ---
  const getSmartOptions = (category: Category, filterKey: keyof ProductSpecs) => {
     let relevantProducts = allProducts.filter(p => p.category === category);
     
     if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        relevantProducts = relevantProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.specDetails?.brand?.toLowerCase().includes(query)
        );
     }

     Object.entries(activeFilters).forEach(([key, selectedValues]: [string, string[]]) => {
      if (key !== filterKey && selectedValues.length > 0) {
        relevantProducts = relevantProducts.filter(p => {
          const val = p.specDetails?.[key as keyof ProductSpecs];
          if (!val) return false;
          const productValues = val.split(',').map(s => s.trim());
          return productValues.some(v => selectedValues.includes(v));
        });
      }
    });
    
    const values = new Set<string>();
    relevantProducts.forEach(p => {
      if (p.specDetails?.[filterKey]) {
           p.specDetails[filterKey]!.split(',').forEach(v => values.add(v.trim()));
      }
    });
    return Array.from(values).sort();
  };

  const filteredModalProducts = useMemo(() => {
    if (!activeCategory) return [];
    
    let products = allProducts.filter(p => p.category === activeCategory);
    
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        products = products.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.specDetails?.brand?.toLowerCase().includes(query)
        );
    }

    if (Object.keys(activeFilters).length > 0) {
        products = products.filter(product => {
            return Object.entries(activeFilters).every(([key, selectedValues]: [string, string[]]) => {
                if (selectedValues.length === 0) return true;
                const productValue = product.specDetails?.[key as keyof ProductSpecs];
                if (!productValue) return false;
                const values = productValue.split(',').map(s => s.trim());
                return values.some(v => selectedValues.includes(v));
            });
        });
    }

    switch (modalSort) {
        case 'price-asc': products.sort((a, b) => a.price - b.price); break;
        case 'price-desc': products.sort((a, b) => b.price - a.price); break;
        case 'name-asc': products.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return products;
  }, [activeCategory, activeFilters, allProducts, modalSort, searchQuery]);

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

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- Wattage Visuals ---
  const currentPsuWattage = primaryPsu ? parseWattage(primaryPsu.specDetails?.wattage) : 0;
  const wattagePercentage = currentPsuWattage > 0 ? (totalTDP / currentPsuWattage) * 100 : (totalTDP / recommendedPsuWattage) * 100;
  const wattageColor = wattagePercentage > 90 ? 'bg-red-500' : wattagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-10 pb-32 md:pb-12">
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      {/* Main Grid Layout for PC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Column: Build Slots (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-3 md:gap-5 order-2 lg:order-1">
          {/* Header for Mobile/Tablet */}
           <div className="md:hidden flex justify-between items-center mb-2">
               <h1 className="text-xl font-bold text-gray-900">組裝估價</h1>
           </div>

          {buildSlots.map((slot) => {
            const items = build[slot.category] || [];
            const hasItems = items.length > 0;
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
                <div key={slot.category} className={`
                    bg-white rounded-xl border transition-all duration-200 overflow-hidden group
                    ${hasItems ? 'border-gray-300 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-300'}
                `}>
                    {hasItems ? (
                        <div className="px-3 py-2 md:px-5 md:py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-1 md:p-2 rounded-md bg-black text-white">
                                    <slot.icon className="h-3 w-3 md:h-5 md:w-5" />
                                </div>
                                <span className="font-bold text-sm md:text-lg text-gray-800">{slot.label}</span>
                                <span className="text-[10px] md:text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{items.length}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-xs md:text-base font-bold text-gray-900 hidden sm:block">
                                    <span className="tabular-nums">${subtotal.toLocaleString()}</span>
                                </div>
                                <button onClick={(e) => handleClearCategory(e, slot.category)} className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 rounded transition-colors" title="清空分類">
                                    <Eraser className="h-4 w-4 md:h-5 md:w-5" />
                                </button>
                                <button onClick={() => handleOpenSelection(slot.category)} className="bg-black text-white px-2 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors">
                                    <Plus className="h-3 w-3 md:hidden" />
                                    <span className="hidden md:inline">＋ 新增</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div onClick={() => handleOpenSelection(slot.category)} className="flex items-center justify-between p-3 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                                <div className="p-2 rounded-md bg-gray-100 text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <slot.icon className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <span className="font-bold text-sm md:text-lg text-gray-500 group-hover:text-black transition-colors">{slot.label}</span>
                            </div>
                            <div className="text-xs md:text-sm text-gray-300 group-hover:text-black flex items-center gap-1 font-medium">
                                <span>選擇零件</span> <ChevronRight className="h-4 w-4" />
                            </div>
                        </div>
                    )}

                    {hasItems && (
                        <div className="p-1 md:p-3 space-y-2">
                            {items.map((item) => {
                                const errorMsg = checkCompatibility(item);
                                return (
                                    <div key={item.uniqueId} className="flex flex-col md:flex-row md:items-center p-3 rounded-xl bg-white border border-transparent hover:border-gray-200 hover:shadow-md transition-all relative group/item">
                                        <div className="flex-1 min-w-0 pr-8 md:pr-0">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <span className="font-bold text-sm md:text-lg text-gray-900 leading-tight">{item.name}</span>
                                                {(item.category === Category.CPU || item.category === Category.GPU) && item.specDetails?.tdp && (
                                                   <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 ml-1 whitespace-nowrap">
                                                      TDP {item.specDetails.tdp}
                                                   </span>
                                                )}
                                                {errorMsg && (
                                                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] md:text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-200">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        <span className="hidden md:inline font-medium">{errorMsg}</span>
                                                    </span>
                                                )}
                                            </div>
                                            {errorMsg && <div className="md:hidden text-[10px] text-red-500 mt-1">{errorMsg}</div>}
                                            <div className="hidden md:block text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 md:mt-0 md:ml-6 gap-6">
                                            <div className="font-bold text-base md:text-xl text-gray-900 tabular-nums min-w-[80px] text-right">
                                                ${item.price.toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg h-9">
                                                    <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 hover:bg-gray-200 h-full rounded-l-lg text-gray-600 flex items-center justify-center" disabled={item.quantity <= 1}><Minus className="h-3 w-3" /></button>
                                                    <span className="w-8 text-center text-sm font-bold text-black">{item.quantity}</span>
                                                    <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 hover:bg-gray-200 h-full rounded-r-lg text-gray-600 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                                                </div>

                                                <button 
                                                   onClick={() => setQtySelectorId(item.id)}
                                                   className="md:hidden flex items-center justify-center gap-1 bg-gray-50 border border-gray-200 rounded-lg h-8 px-3 text-sm font-bold text-black shadow-sm active:scale-95"
                                                >
                                                   x{item.quantity} <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
                                                </button>

                                                {/* Replace Button */}
                                                <button 
                                                    onClick={() => handleStartReplace(item)} 
                                                    className="p-2.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                    title="更換商品"
                                                >
                                                    <RefreshCw className="h-5 w-5" />
                                                </button>

                                                <button onClick={() => handleRemoveProduct(item.id)} className="p-2.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Sidebar (Summary) - PC Only (lg:col-span-4) */}
        <div className="hidden lg:block lg:col-span-4 order-1 lg:order-2 h-full">
           <div className="sticky top-24 self-start bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 p-6 max-h-[calc(100vh-120px)] flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                        <StickyNote className="h-5 w-5" /> 估價單摘要
                    </h2>
                     <button 
                        onClick={() => setIsAiModalOpen(true)}
                        className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                        AI 配單
                    </button>
                </div>

                <div className="flex-shrink-0 mb-6 bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">預估總金額</div>
                    <div className="text-4xl font-extrabold text-black tabular-nums tracking-tight">${totalPrice.toLocaleString()}</div>
                    
                    {totalTDP > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                                <span>功耗負載</span>
                                <span>{totalTDP}W / {currentPsuWattage > 0 ? currentPsuWattage + 'W' : '未選電源'}</span>
                            </div>
                            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${wattageColor}`} 
                                    style={{ width: `${Math.min(wattagePercentage, 100)}%` }} 
                                />
                            </div>
                            <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                                <span>建議配置: {recommendedPsuWattage}W+</span>
                                {currentPsuWattage > 0 && <span>(負載 {Math.round(wattagePercentage)}%)</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Item List */}
                <div className="space-y-3 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                             尚未選擇任何零件
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-start text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <div className="flex-1 pr-4">
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded mr-2 inline-block mb-1">{categoryDisplayMap[item.category]?.split(' ')[0] || '其它'}</span>
                                    <span className="text-gray-800 font-bold line-clamp-1 block">{item.name}</span>
                                </div>
                                <div className="font-mono font-bold text-gray-900 text-xs mt-1">
                                    ${(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                    <button onClick={() => openTemplateModal('load')} className="px-3 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                        <FolderOpen className="h-4 w-4" /> 載入
                    </button>
                    <button onClick={() => openTemplateModal('save')} className="px-3 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                        <Save className="h-4 w-4" /> 儲存
                    </button>
                    <button onClick={handleShareBuild} className="px-3 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                        <Share2 className="h-4 w-4" /> 分享
                    </button>
                    <button onClick={resetBuild} className="px-3 py-2.5 text-sm font-bold text-red-600 border border-red-100 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 transition-colors">
                        <RotateCcw className="h-4 w-4" /> 清空
                    </button>
                </div>
           </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] p-3 safe-area-bottom">
         <div className="flex items-center gap-2">
             <div className="flex-1 min-w-0">
                 <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">總金額</div>
                 <div className="text-xl font-bold text-black leading-none truncate">${totalPrice.toLocaleString()}</div>
             </div>
             
             <button onClick={handleShareBuild} className="p-3 bg-gray-100 text-gray-600 rounded-xl active:scale-95 transition-transform" title="複製清單">
                 <Copy className="h-5 w-5" />
             </button>

             <button 
                onClick={() => setIsAiModalOpen(true)}
                className="px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-1 shadow-md active:scale-95 transition-transform"
             >
                 <Sparkles className="h-4 w-4" /> <span className="text-sm">AI</span>
             </button>
             
             {/* Templates Group */}
             <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button onClick={() => openTemplateModal('load')} className="p-2.5 rounded-lg text-gray-600 active:bg-white active:shadow-sm transition-all" title="載入範本">
                    <FolderOpen className="h-5 w-5" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button onClick={() => openTemplateModal('save')} className="p-2.5 rounded-lg text-gray-600 active:bg-white active:shadow-sm transition-all" title="儲存範本">
                    <Save className="h-5 w-5" />
                </button>
             </div>
         </div>
      </div>
      
      {/* Qty Selector Modal */}
      {qtySelectorId && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setQtySelectorId(null)}>
           <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl transform transition-transform animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-gray-900">選擇數量</h3>
                 <button onClick={() => setQtySelectorId(null)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <button key={num} onClick={() => handleDirectUpdateQuantity(qtySelectorId, num)} className={`py-3 rounded-xl font-bold text-lg border-2 transition-all active:scale-95 ${(getCurrentSelectorQty() === num) ? 'border-black bg-black text-white' : 'border-gray-100 bg-white text-gray-900 hover:border-gray-300'}`}>
                       {num}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsAiModalOpen(false)} />
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-fade-in border border-white/20">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-black rounded-xl text-white">
                             <Bot className="h-6 w-6" />
                        </div>
                        <div>
                             <h2 className="text-2xl font-bold text-gray-900">AI 智能配單</h2>
                             <p className="text-sm text-gray-500">告訴我需求，剩下的交給我。</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-6 w-6" /></button>
                </div>
                
                {!aiExplanation ? (
                    <div className="space-y-6">
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">預算上限 (NT$)</label>
                             <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                 <input 
                                     type="number" 
                                     value={aiBudget}
                                     onChange={(e) => setAiBudget(e.target.value)}
                                     className="w-full pl-8 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl font-bold text-lg transition-all"
                                     placeholder="30000"
                                 />
                             </div>
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">主要用途</label>
                             <div className="grid grid-cols-2 gap-3">
                                 {usagePresets.map(preset => (
                                     <button
                                         key={preset.label}
                                         onClick={() => setAiUsage(preset.value)}
                                         className={`p-3 text-left rounded-xl border transition-all ${aiUsage === preset.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}
                                     >
                                         <div className="font-bold text-sm mb-1">{preset.label}</div>
                                         <div className={`text-xs ${aiUsage === preset.value ? 'text-gray-300' : 'text-gray-500'} line-clamp-1`}>{preset.value}</div>
                                     </button>
                                 ))}
                             </div>
                             <textarea 
                                 value={aiUsage}
                                 onChange={(e) => setAiUsage(e.target.value)}
                                 className="w-full mt-3 p-4 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-xl text-sm transition-all resize-none"
                                 rows={3}
                                 placeholder="或手動輸入詳細需求..."
                             />
                         </div>
                         <button 
                             onClick={handleAiAutoBuild}
                             disabled={isAiLoading || !aiBudget || !aiUsage}
                             className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             {isAiLoading ? (
                                 <><Loader2 className="h-5 w-5 animate-spin" /> AI 思考中...</>
                             ) : (
                                 <><Sparkles className="h-5 w-5" /> 生成配置單</>
                             )}
                         </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                         <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                             <div className="flex items-start gap-3">
                                 <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                                 <div>
                                     <h3 className="font-bold text-green-800 text-lg mb-2">配單完成！</h3>
                                     <p className="text-green-700 text-sm leading-relaxed whitespace-pre-line">{aiExplanation}</p>
                                 </div>
                             </div>
                         </div>
                         <div className="flex gap-4">
                             <button onClick={() => { setIsAiModalOpen(false); setAiExplanation(''); }} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50">
                                 關閉
                             </button>
                             <button onClick={() => { setAiExplanation(''); }} className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">
                                 再試一次
                             </button>
                         </div>
                    </div>
                )}
            </div>
        </div>
      )}
      
      {/* Product Selection Modal */}
      {isModalOpen && activeCategory && (
         <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white w-full md:max-w-7xl h-[92vh] md:h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up md:animate-fade-in">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 flex-shrink-0">
                    <div>
                         <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {replacingItemId ? <RefreshCw className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5" />}
                            {replacingItemId ? '更換' : '選擇'} {categoryDisplayMap[activeCategory]}
                         </h2>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X className="h-5 w-5" /></button>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Sidebar Filters (Desktop) - Improved Accordion Layout */}
                    {/* MODIFIED: Reduced width from w-60 to w-48 and padding from p-4 to p-3 */}
                    <div className="hidden lg:block w-48 border-r border-gray-100 bg-gray-50 overflow-y-auto custom-scrollbar flex-shrink-0">
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-wider">
                                    <ListFilter className="h-4 w-4" /> 篩選條件
                                </div>
                                {Object.keys(activeFilters).length > 0 && (
                                    <button 
                                        onClick={() => setActiveFilters({})}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                                    >
                                        清除全部
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                {categoryFilters[activeCategory]?.map(filter => {
                                    const options = getSmartOptions(activeCategory, filter.key);
                                    if (options.length === 0) return null;
                                    
                                    // Treat undefined as open (expanded) by default for better visibility
                                    const isExpanded = expandedNodes[filter.key] ?? true;
                                    const activeCount = activeFilters[filter.key]?.length || 0;

                                    return (
                                        <div key={filter.key} className="border-b border-gray-200 last:border-0 pb-2 mb-2">
                                            <button 
                                                onClick={() => toggleNode(filter.key as string)}
                                                className="w-full flex items-center justify-between py-2 text-left group transition-colors rounded-lg hover:bg-gray-100 px-2 -mx-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`font-bold text-sm ${activeCount > 0 ? 'text-black' : 'text-gray-700'} group-hover:text-black`}>
                                                        {filter.label}
                                                    </h4>
                                                    {activeCount > 0 && (
                                                        <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                            {activeCount}
                                                        </span>
                                                    )}
                                                </div>
                                                {isExpanded ? 
                                                    <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600"/> : 
                                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600"/>
                                                }
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="mt-1 space-y-1 pl-1 pb-2 animate-fade-in">
                                                    {options.map(opt => (
                                                        <label key={opt} className="flex items-center gap-3 py-1.5 cursor-pointer group/item hover:bg-white hover:shadow-sm rounded-lg px-2 -mx-2 transition-all">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                                                                activeFilters[filter.key]?.includes(opt) 
                                                                ? 'bg-black border-black' 
                                                                : 'bg-white border-gray-300 group-hover/item:border-gray-500'
                                                            }`}>
                                                                {activeFilters[filter.key]?.includes(opt) && <Check className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={activeFilters[filter.key]?.includes(opt) || false}
                                                                onChange={() => toggleFilter(filter.key as string, opt)}
                                                                className="hidden"
                                                            />
                                                            <span className={`text-sm leading-tight ${activeFilters[filter.key]?.includes(opt) ? 'font-bold text-black' : 'font-medium text-gray-600 group-hover/item:text-gray-900'}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {(!categoryFilters[activeCategory] || categoryFilters[activeCategory].length === 0) && (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        此分類暫無篩選條件
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-white min-w-0">
                        {/* Toolbar - Added overflow handling */}
                        <div className="p-4 border-b border-gray-100 flex gap-3 overflow-x-auto custom-scrollbar bg-white z-10 flex-shrink-0">
                             {/* Category Quick Switch */}
                             {buildSlots.map(slot => (
                                 <button
                                    key={slot.category}
                                    onClick={() => handleSwitchCategory(slot.category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 flex-shrink-0 ${activeCategory === slot.category ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                 >
                                    <slot.icon className="h-3 w-3" />
                                    {slot.label}
                                 </button>
                             ))}
                        </div>
                        
                        {/* Search & Sort */}
                        <div className="p-4 border-b border-gray-100 flex gap-3 bg-white z-10 flex-shrink-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="搜尋商品名稱..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-10 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-xl text-sm transition-all"
                                />
                                {/* Clear Button */}
                                {searchQuery && (
                                  <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <select 
                                value={modalSort} 
                                onChange={(e) => setModalSort(e.target.value)}
                                className="px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm font-bold focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                <option value="default">預設排序</option>
                                <option value="price-asc">價格低 → 高</option>
                                <option value="price-desc">價格高 → 低</option>
                            </select>
                            <button 
                                onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden px-3 py-2 bg-gray-100 rounded-xl"
                            >
                                <SlidersHorizontal className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Product List - Optimized Grid */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 custom-scrollbar">
                            {filteredModalProducts.length === 0 ? (
                                <div className="text-center py-24 text-gray-400">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium">沒有找到符合條件的商品</p>
                                    <button onClick={() => { setActiveFilters({}); setSearchQuery(''); }} className="mt-4 text-blue-600 hover:underline">清除篩選條件</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {filteredModalProducts.map(product => {
                                        const showImage = product.category === Category.CASE;
                                        const existingCartItem = cartItems.find(item => item.id === product.id);
                                        const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;
                                        const isSelected = quantityInCart > 0;

                                        return (
                                        <div 
                                            key={product.id} 
                                            onClick={() => handleMobileAdd(product)} 
                                            className={`group flex flex-row items-stretch gap-4 p-4 rounded-xl bg-white border hover:shadow-lg transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}
                                        >
                                            {/* Left: Image (Only for Case) */}
                                            {showImage && (
                                                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                                                    {product.image ? (
                                                        <img src={product.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" alt="" />
                                                    ) : (
                                                        <Box className="h-8 w-8 text-gray-300" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Middle: Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                <div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-black transition-colors">{product.name}</h4>
                                                    </div>
                                                    
                                                    {/* Specs Tags */}
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {product.specDetails?.brand && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{product.specDetails.brand}</span>}
                                                        {product.specDetails?.socket && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded font-bold">{product.specDetails.socket}</span>}
                                                        {product.specDetails?.chipset && <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded font-bold">{product.specDetails.chipset}</span>}
                                                        {product.specDetails?.wattage && <span className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded font-bold">{product.specDetails.wattage}</span>}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-xs text-gray-400 mt-2 line-clamp-1 group-hover:text-gray-500 transition-colors">{product.description}</div>
                                            </div>

                                            {/* Right: Price & Action */}
                                            <div className="flex flex-col justify-between items-end pl-2">
                                                <div className="text-right">
                                                    <div className="font-bold text-xl text-black tabular-nums tracking-tight">
                                                        ${product.price.toLocaleString()}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="text-xs font-bold text-blue-600 mt-1 flex items-center justify-end gap-1">
                                                            <Check className="h-3 w-3" /> 已加入
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div 
                                                    className="mt-2" 
                                                    onClick={(e) => e.stopPropagation()} 
                                                >
                                                    {replacingItemId ? (
                                                        <button 
                                                            onClick={() => handleSelectProduct(product, 1)}
                                                            className="px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" /> 更換
                                                        </button>
                                                    ) : isSelected ? (
                                                        <div className="flex items-center bg-white border border-gray-200 rounded-lg h-9 shadow-sm">
                                                            <button 
                                                                onClick={() => handleMobileDecrement(product.id)} 
                                                                className="w-9 h-full flex items-center justify-center hover:bg-gray-100 rounded-l-lg text-gray-600 transition-colors"
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </button>
                                                            <div className="w-8 text-center text-sm font-bold border-x border-gray-100 flex items-center justify-center h-3/5 text-black">
                                                                {quantityInCart}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleSelectProduct(product, 1)}
                                                                className="w-9 h-full flex items-center justify-center hover:bg-gray-100 rounded-r-lg text-gray-600 transition-colors"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleSelectProduct(product, 1)}
                                                            className="px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 bg-black text-white hover:bg-gray-800 hover:scale-105 hover:shadow-md"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" /> 選擇
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
         </div>
      )}
      
      {/* Template Modal */}
      {isTemplateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTemplateModalOpen(false)} />
              <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-fade-in">
                  <h3 className="text-xl font-bold mb-4">{templateMode === 'save' ? '儲存配置範本' : '載入配置範本'}</h3>
                  
                  {templateMode === 'save' ? (
                      <div className="space-y-4">
                          <input 
                              type="text" 
                              value={newTemplateName}
                              onChange={(e) => setNewTemplateName(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none"
                              placeholder="輸入範本名稱 (例如: 30K 遊戲機)"
                              autoFocus
                          />
                          <div className="flex gap-3">
                              <button onClick={() => setIsTemplateModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50">取消</button>
                              <button onClick={handleSaveTemplate} className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">儲存</button>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {templates.length === 0 ? (
                              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                  沒有已儲存的範本
                              </div>
                          ) : (
                              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                  {templates.map(t => (
                                      <div key={t.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group">
                                          <div onClick={() => handleLoadTemplate(t)} className="flex-1 cursor-pointer">
                                              <div className="font-bold text-gray-900">{t.name}</div>
                                              <div className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleDateString()} · {t.items.length} 個項目</div>
                                          </div>
                                          <button onClick={() => handleDeleteTemplate(t.id)} className="p-2 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                      </div>
                                  ))}
                              </div>
                          )}
                           <button onClick={() => setIsTemplateModalOpen(false)} className="w-full py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 mt-2">關閉</button>
                      </div>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

export default Builder;
