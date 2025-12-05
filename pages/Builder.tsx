
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, BuildState, BuilderItem, ProductSpecs, BuildTemplate, CartItem } from '../types';
import { Plus, Check, RotateCcw, X, ChevronDown, ChevronRight, Cpu, Minus, Trash2, AlertTriangle, SlidersHorizontal, ListFilter, Eraser, Monitor, Disc, Save, FolderOpen, Search, RefreshCw, Sparkles, Loader2, Bot, Share2, Copy, StickyNote, Box, Fan, Wind, Zap, ShoppingCart, CircuitBoard, HardDrive, Gamepad2, Droplets, Mouse, MemoryStick, Clock, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { categoryFilters, categoryDisplayMap } from '../data/mockData';
import { useProducts } from '../contexts/ProductContext';
import { generateSmartBuild } from '../services/geminiService';
import ConfirmationModal from '../components/common/ConfirmationModal';
import toast from 'react-hot-toast';
import InstallmentCalculator from '../components/builder/InstallmentCalculator';
import { parseWattage, checkCompatibility } from '../utils/builderLogic';

const buildSlots = [
  { category: Category.CPU, icon: Cpu, label: 'CPU 處理器' },
  { category: Category.MB, icon: CircuitBoard, label: '主機板' },
  { category: Category.RAM, icon: MemoryStick, label: '記憶體' },
  { category: Category.GPU, icon: Gamepad2, label: '顯示卡' },
  { category: Category.SSD, icon: HardDrive, label: '固態硬碟' },
  { category: Category.COOLER, icon: Droplets, label: '散熱器(水冷)' },
  { category: Category.AIR_COOLER, icon: Wind, label: '散熱器(風冷)' },
  { category: Category.PSU, icon: Zap, label: '電源供應器' },
  { category: Category.CASE, icon: Box, label: '機殼' },
  { category: Category.MONITOR, icon: Monitor, label: '螢幕' },
  { category: Category.SOFTWARE, icon: Disc, label: '軟體' },
  { category: Category.OTHERS, icon: Mouse, label: '其它商品' },
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

  const build: BuildState = useMemo(() => {
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
            if (!state[Category.OTHERS]) state[Category.OTHERS] = [];
            state[Category.OTHERS].push(builderItem);
        }
    });
    return state as BuildState;
  }, [cartItems]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [modalSort, setModalSort] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);
  const [rowQuantities, setRowQuantities] = useState<Record<string, number>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<BuildTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateMode, setTemplateMode] = useState<'save' | 'load'>('load');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiBudget, setAiBudget] = useState<string>('');
  const [aiUsage, setAiUsage] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [qtySelectorId, setQtySelectorId] = useState<string | null>(null);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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

  const primaryPsu = build[Category.PSU]?.[0];

  const totalTDP = useMemo(() => {
      let tdp = 0;
      let hasMajorComponents = false;
      const ESTIMATES: Partial<Record<Category, number>> = {
          [Category.MB]: 50,
          [Category.RAM]: 15,
          [Category.SSD]: 10,
          [Category.COOLER]: 35,
          [Category.AIR_COOLER]: 10,
          [Category.CASE]: 10
      };

      cartItems.forEach(item => {
          if (item.category === Category.CPU || item.category === Category.GPU) {
              tdp += parseWattage(item.specDetails?.tdp) * item.quantity;
              hasMajorComponents = true;
          } 
          else if (item.category === Category.RAM) {
              const estimate = ESTIMATES[Category.RAM] || 0;
              const nameLower = item.name.toLowerCase();
              const isDualKit = nameLower.includes('*2') || nameLower.includes('x2');
              const multiplier = isDualKit ? 2 : 1;
              tdp += estimate * item.quantity * multiplier;
          }
          else if (item.category in ESTIMATES) {
              const estimate = ESTIMATES[item.category as keyof typeof ESTIMATES] || 0;
              tdp += estimate * item.quantity;
          }
      });
      const baseBuffer = hasMajorComponents ? 30 : 0;
      return tdp + baseBuffer;
  }, [cartItems]);

  const recommendedPsuWattage = useMemo(() => {
      if (totalTDP === 0) return 0;
      return Math.ceil((totalTDP * 1.3) / 50) * 50;
  }, [totalTDP]);

  const handleOpenSelection = (category: Category) => {
    setReplacingItemId(null);
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

  const handleSelectProduct = (product: Product, quantityToAdd: number) => {
    setCartItems(prev => {
        let newCart = [...prev];
        if (replacingItemId) {
             newCart = newCart.filter(item => item.id !== replacingItemId);
        }
        const existingIndex = newCart.findIndex(p => p.id === product.id);
        if (existingIndex >= 0) {
            newCart[existingIndex] = {
                ...newCart[existingIndex],
                quantity: replacingItemId ? quantityToAdd : newCart[existingIndex].quantity + quantityToAdd 
                // Note: If adding (not replacing), we usually append qty. If replacing, we might want to set exact qty or just add.
                // However, the UI flow for 'Update Qty' implies setting the absolute value.
                // For simplicity in this specialized list view:
                // If Item Exists -> Update to new Qty.
                // If Item New -> Add.
            };
            // Correct logic for "Update" button behavior:
            newCart[existingIndex].quantity = quantityToAdd;
        } else {
            newCart.push({ ...product, quantity: quantityToAdd });
        }
        return newCart;
    });
    setRowQuantities(prev => ({ ...prev, [product.id]: quantityToAdd }));
    if (replacingItemId) {
        setReplacingItemId(null);
        setIsModalOpen(false);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setConfirmModalState({
      isOpen: true,
      title: '清空分類',
      message: `確定要移除所有 ${categoryDisplayMap[category]} 嗎？此操作無法復原。`,
      onConfirm: () => {
        setCartItems(prev => prev.filter(item => item.category !== category));
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
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
    setConfirmModalState({
      isOpen: true,
      title: '清空估價單',
      message: '確定要清空目前的估價清單嗎？\n\n警告：此操作將移除所有已選項目且無法復原。',
      onConfirm: () => {
        setCartItems([]);
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleShareBuild = () => {
      const text = `【哭PC 配置單】\n總價：$${totalPrice.toLocaleString()}\n----------\n${cartItems.map(item => `${item.category}: ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`).join('\n')}\n----------\n此報價單由 CryPC 系統產生`;
      navigator.clipboard.writeText(text).then(() => {
          toast.success('配置單已複製到剪貼簿！');
      }).catch(() => {
          toast.error('複製失敗，請手動截圖。');
      });
  };

  const handleAiAutoBuild = async () => {
      if (!aiBudget || !aiUsage) {
          toast.error('請輸入預算與用途');
          return;
      }
      setIsAiLoading(true);
      setAiExplanation('');
      try {
          const numericBudget = parseInt(aiBudget.replace(/[^0-9]/g, ''));
          if (isNaN(numericBudget)) {
             toast.error('預算格式錯誤，請輸入數字');
             setIsAiLoading(false);
             return;
          }
          const result = await generateSmartBuild(allProducts, numericBudget, aiUsage);
          if (result.productIds && result.productIds.length > 0) {
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
              toast.error('AI 無法找到適合的配置，請嘗試調整預算。');
          }
      } catch (error: any) {
          toast.error(error.message || 'AI 配單發生錯誤');
      } finally {
          setIsAiLoading(false);
      }
  };

  const openTemplateModal = (mode: 'save' | 'load') => {
      setTemplateMode(mode);
      setNewTemplateName('');
      setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = () => {
      if (!newTemplateName.trim()) { toast.error('請輸入範本名稱'); return; }
      if (cartItems.length === 0) { toast.error('估價單為空，無法儲存。'); return; }
      const templateItems = cartItems.map(item => ({ productId: item.id, quantity: item.quantity }));
      const newTemplate: BuildTemplate = { id: Date.now().toString(), name: newTemplateName.trim(), timestamp: Date.now(), items: templateItems };
      const updatedTemplates = [newTemplate, ...templates];
      setTemplates(updatedTemplates);
      localStorage.setItem('crypc_templates', JSON.stringify(updatedTemplates));
      setIsTemplateModalOpen(false);
      toast.success('範本儲存成功！');
  };

  const handleLoadTemplate = (template: BuildTemplate) => {
      const executeLoad = () => {
          const newCartItems: CartItem[] = [];
          let missingCount = 0;
          template.items.forEach(tItem => {
              const currentProduct = allProducts.find(p => p.id === tItem.productId);
              if (currentProduct) { newCartItems.push({ ...currentProduct, quantity: tItem.quantity }); } 
              else { missingCount++; }
          });
          setCartItems(newCartItems);
          setIsTemplateModalOpen(false);
          setConfirmModalState(prev => ({ ...prev, isOpen: false })); // Close modal if open
          if (missingCount > 0) { toast(`範本載入成功，但有 ${missingCount} 個商品已下架或無法辨識。`, { icon: '⚠️' }); }
          else { toast.success('範本載入成功'); }
      };

      if (cartItems.length > 0) { 
          setConfirmModalState({
              isOpen: true,
              title: '載入範本',
              message: '載入範本將會覆蓋目前的估價單，確定要繼續嗎？',
              onConfirm: executeLoad
          });
      } else {
          executeLoad();
      }
  };

  const handleDeleteTemplate = (id: string) => {
      setConfirmModalState({
          isOpen: true,
          title: '刪除範本',
          message: '確定要刪除此範本嗎？',
          onConfirm: () => {
              const updated = templates.filter(t => t.id !== id);
              setTemplates(updated);
              localStorage.setItem('crypc_templates', JSON.stringify(updated));
              setConfirmModalState(prev => ({ ...prev, isOpen: false }));
              toast.success('範本已刪除');
          }
      });
  };

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
        case 'name-desc': products.sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    return products;
  }, [activeCategory, activeFilters, allProducts, modalSort, searchQuery]);

  const toggleFilter = (key: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        const updated = current.filter(v => v !== value);
        return updated.length > 0 ? { ...prev, [key]: updated } : (() => { const { [key]: _, ...rest } = prev; return rest; })();
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const toggleNode = (nodeId: string) => { setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] })); };
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const currentPsuWattage = primaryPsu ? parseWattage(primaryPsu.specDetails?.wattage) : 0;
  const wattagePercentage = currentPsuWattage > 0 ? (totalTDP / currentPsuWattage) * 100 : (totalTDP / recommendedPsuWattage) * 100;
  const wattageColor = wattagePercentage > 90 ? 'bg-red-500' : wattagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500';

  // Safe access for filters
  const currentFilters = activeCategory ? categoryFilters[activeCategory] : [];

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-10 pb-32 md:pb-12">
      <style>
        {`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}
      </style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        <div className="lg:col-span-8 flex flex-col gap-3 md:gap-5 order-2 lg:order-1">
           <div className="md:hidden flex justify-between items-center mb-2">
               <h1 className="text-xl font-bold text-gray-900">組裝估價</h1>
           </div>

          {buildSlots.map((slot) => {
            const items = build[slot.category] || [];
            const hasItems = items.length > 0;
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
                <div key={slot.category} className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden group ${hasItems ? 'border-gray-300 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                    {hasItems ? (
                        <div className="px-3 py-2 md:px-4 md:py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-1 md:p-2 rounded-md bg-black text-white">
                                    <slot.icon className="h-3 w-3 md:h-5 md:w-5" />
                                </div>
                                <span className="font-bold text-sm md:text-lg text-gray-800">{slot.label}</span>
                                <span className="text-[10px] md:text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{items.length}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-xs md:text-base font-bold text-gray-900 hidden sm:block"><span className="tabular-nums">${subtotal.toLocaleString()}</span></div>
                                <button onClick={(e) => handleClearCategory(e, slot.category)} className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 rounded transition-colors" title="清空分類"><Eraser className="h-4 w-4 md:h-5 md:w-5" /></button>
                                <button onClick={() => handleOpenSelection(slot.category)} className="bg-black text-white px-2 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors"><Plus className="h-3 w-3 md:hidden" /><span className="hidden md:inline">＋ 新增</span></button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={() => handleOpenSelection(slot.category)} 
                            className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 transition-all duration-200 gap-4 cursor-pointer hover:bg-gray-50/80 active:bg-gray-100"
                        >
                            <div className="flex items-center gap-4 group-hover:opacity-100 transition-opacity flex-1">
                                <div className="p-2 rounded-md bg-gray-100 text-gray-500 group-hover:text-gray-800 transition-colors">
                                    <slot.icon className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm md:text-lg text-gray-700 group-hover:text-black transition-colors">{slot.label}</span>
                                    <span className="text-xs text-gray-500 font-medium hidden md:block">點擊選擇商品</span>
                                </div>
                            </div>
                            <div className="md:hidden text-xs text-gray-400 flex items-center gap-1 font-medium justify-end"><span>選擇</span> <ChevronRight className="h-4 w-4" /></div>
                        </div>
                    )}

                    {hasItems && (
                        <div className="flex flex-col">
                            {items.map((item) => {
                                const errorMsg = checkCompatibility(item, build);
                                return (
                                    <div 
                                      key={item.uniqueId} 
                                      onClick={() => handleStartReplace(item)}
                                      className="flex flex-col md:flex-row md:items-center px-3 py-3 md:px-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-all relative group/item cursor-pointer"
                                      title="點擊更換商品"
                                    >
                                        
                                        <div className="flex-1 min-w-0 pr-8 md:pr-0">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <span className="font-bold text-sm md:text-lg text-gray-900 leading-tight">{item.name}</span>
                                                {(item.category === Category.CPU || item.category === Category.GPU) && item.specDetails?.tdp && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 ml-1 whitespace-nowrap">TDP {item.specDetails.tdp}</span>}
                                                {errorMsg && <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] md:text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-200"><AlertTriangle className="h-3 w-3" /><span className="hidden md:inline font-medium">{errorMsg}</span></span>}
                                            </div>
                                            {errorMsg && <div className="md:hidden text-[10px] text-red-500 mt-1">{errorMsg}</div>}
                                            <div className="hidden md:block text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 md:mt-0 md:ml-4 gap-3">
                                            <div className="font-bold text-base md:text-xl text-gray-900 tabular-nums min-w-[80px] text-right">${item.price.toLocaleString()}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg h-9">
                                                    <button onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.id, -1); }} className="w-8 hover:bg-gray-200 h-full rounded-l-lg text-gray-600 flex items-center justify-center" disabled={item.quantity <= 1}><Minus className="h-3 w-3" /></button>
                                                    <span className="w-8 text-center text-sm font-bold text-black">{item.quantity}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.id, 1); }} className="w-8 hover:bg-gray-200 h-full rounded-r-lg text-gray-600 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); setQtySelectorId(item.id); }} className="md:hidden flex items-center justify-center gap-1 bg-gray-50 border border-gray-200 rounded-lg h-8 px-3 text-sm font-bold text-black shadow-sm active:scale-95">x{item.quantity} <ChevronDown className="h-3 w-3 opacity-50 ml-1" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleStartReplace(item); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="更換商品"><RefreshCw className="h-5 w-5" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleRemoveProduct(item.id); }} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-5 w-5" /></button>
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

        <div className="hidden lg:block lg:col-span-4 order-1 lg:order-2 h-full">
           <div className="sticky top-24 self-start bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 p-6 max-h-[calc(100vh-120px)] flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900"><StickyNote className="h-5 w-5" /> 估價單摘要</h2>
                     <button onClick={() => setIsAiModalOpen(true)} className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"><Sparkles className="h-3 w-3 text-yellow-300" /> AI 配單</button>
                </div>

                <div className="flex-shrink-0 mb-6 bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">預估總金額</div>
                    <div className="text-4xl font-extrabold text-black tabular-nums tracking-tight">${totalPrice.toLocaleString()}</div>
                    {totalTDP > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5"><span>功耗負載</span><span>{totalTDP}W / {currentPsuWattage > 0 ? currentPsuWattage + 'W' : '未選電源'}</span></div>
                            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${wattageColor}`} style={{ width: `${Math.min(wattagePercentage, 100)}%` }} /></div>
                            <div className="flex justify-between mt-1.5 text-[10px] text-gray-400"><span>建議配置: {recommendedPsuWattage}W+</span>{currentPsuWattage > 0 && <span>(負載 {Math.round(wattagePercentage)}%)</span>}</div>
                        </div>
                    )}
                </div>

                <InstallmentCalculator totalPrice={totalPrice} />

                <div className="space-y-3 mb-6 flex-1 pr-2 mt-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">尚未選擇任何零件</div>
                    ) : (
                        cartItems.map(item => {
                            const slot = buildSlots.find(s => s.category === item.category);
                            const ItemIcon = slot ? slot.icon : Box;
                            return (
                                <div key={item.id} className="flex justify-between items-start text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0 group">
                                    <div className="flex-1 pr-4 flex gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden relative">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ItemIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block mb-1 mr-1">{categoryDisplayMap[item.category]?.split(' ')[0] || '其它'}</span>
                                            <span className="text-gray-800 font-bold line-clamp-1 block">{item.name}</span>
                                        </div>
                                    </div>
                                    <div className="font-mono font-bold text-gray-900 text-xs mt-1 whitespace-nowrap">${(item.price * item.quantity).toLocaleString()}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                    <button onClick={() => openTemplateModal('load')} className="px-3 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"><FolderOpen className="h-4 w-4" /> 載入</button>
                    <button onClick={() => openTemplateModal('save')} className="px-3 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"><Save className="h-4 w-4" /> 儲存</button>
                    <button onClick={handleShareBuild} className="px-3 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"><Share2 className="h-4 w-4" /> 分享</button>
                    <button onClick={resetBuild} className="px-3 py-2.5 text-sm font-bold text-red-600 border border-red-100 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"><RotateCcw className="h-4 w-4" /> 清空</button>
                </div>
           </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        confirmText="確認"
      >
        {confirmModalState.message}
      </ConfirmationModal>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] p-3 safe-area-bottom">
         <div className="flex items-center gap-2">
             <div className="flex-1 min-w-0">
                 <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">總金額</div>
                 <div className="text-xl font-bold text-black leading-none truncate">${totalPrice.toLocaleString()}</div>
             </div>
             <button onClick={handleShareBuild} className="p-3 bg-gray-100 text-gray-600 rounded-xl active:scale-95 transition-transform" title="複製清單"><Copy className="h-5 w-5" /></button>
             <button onClick={() => setIsAiModalOpen(true)} className="px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-1 shadow-md active:scale-95 transition-transform"><Sparkles className="h-4 w-4" /> <span className="text-sm">AI</span></button>
             <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button onClick={() => openTemplateModal('load')} className="p-2.5 rounded-lg text-gray-600 active:bg-white active:shadow-sm transition-all" title="載入範本"><FolderOpen className="h-5 w-5" /></button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button onClick={() => openTemplateModal('save')} className="p-2.5 rounded-lg text-gray-600 active:bg-white active:shadow-sm transition-all" title="儲存範本"><Save className="h-5 w-5" /></button>
             </div>
         </div>
      </div>
      
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

      {isModalOpen && activeCategory && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white w-full md:max-w-7xl h-[92vh] md:h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up md:animate-fade-in">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 flex-shrink-0">
                    <div><h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">{replacingItemId ? <RefreshCw className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5" />}{replacingItemId ? '更換' : '選擇'} {activeCategory ? categoryDisplayMap[activeCategory] : ''}</h2></div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X className="h-5 w-5" /></button>
                </div>
                <div className="flex flex-1 min-h-0">
                    <div className="hidden lg:block w-48 border-r border-gray-100 bg-gray-50 overflow-y-auto custom-scrollbar flex-shrink-0">
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-wider"><ListFilter className="h-4 w-4" /> 篩選條件</div>{Object.keys(activeFilters).length > 0 && (<button onClick={() => setActiveFilters({})} className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline">清除全部</button>)}</div>
                            <div className="space-y-1">
                                {activeCategory && categoryFilters[activeCategory]?.map(filter => {
                                    const options = getSmartOptions(activeCategory, filter.key);
                                    if (options.length === 0) return null;
                                    const isExpanded = expandedNodes[filter.key] ?? true;
                                    const activeCount = activeFilters[filter.key]?.length || 0;
                                    return (
                                        <div key={filter.key} className="border-b border-gray-200 last:border-0 pb-2 mb-2">
                                            <button onClick={() => toggleNode(filter.key as string)} className="w-full flex items-center justify-between py-2 text-left group transition-colors rounded-lg hover:bg-gray-100 px-2 -mx-2"><div className="flex items-center gap-2"><h4 className={`font-bold text-sm ${activeCount > 0 ? 'text-black' : 'text-gray-700'} group-hover:text-black`}>{filter.label}</h4>{activeCount > 0 && (<span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full ml-auto">{activeCount}</span>)}{isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}</div></button>
                                            {isExpanded && (<div className="pl-1 mt-1 space-y-1 mb-3">{options.map(option => { const isChecked = activeFilters[filter.key]?.includes(option); return (<button key={option} onClick={() => toggleFilter(filter.key as string, option)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 group/opt ${isChecked ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-white bg-black' : 'border-gray-300 bg-white group-hover/opt:border-gray-400'}`}>{isChecked && <Check className="h-3 w-3 text-white" />}</div><span className="truncate">{option}</span></button>); })}</div>)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                         <div className="lg:hidden p-4 border-b border-gray-100 flex-shrink-0"><button onClick={() => setMobileFiltersOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm"><SlidersHorizontal className="h-4 w-4" /> 篩選條件 {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}</button></div>
                         
                         {/* Header Row for Name/Price Sorting */}
                         <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm sticky top-0 z-20 backdrop-blur-sm">
                            <div 
                                className="font-bold text-gray-600 hover:text-black cursor-pointer flex items-center gap-1 transition-colors select-none group"
                                onClick={() => setModalSort(prev => {
                                    if (prev === 'name-asc') return 'name-desc';
                                    if (prev === 'name-desc') return 'default';
                                    return 'name-asc';
                                })}
                            >
                                商品名稱
                                {modalSort === 'name-asc' && <ArrowUp className="h-3.5 w-3.5 text-black" />}
                                {modalSort === 'name-desc' && <ArrowDown className="h-3.5 w-3.5 text-black" />}
                                {modalSort !== 'name-asc' && modalSort !== 'name-desc' && <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />}
                            </div>
                            <div 
                                className="font-bold text-gray-600 hover:text-black cursor-pointer flex items-center gap-1 transition-colors select-none group"
                                onClick={() => setModalSort(prev => {
                                    if (prev === 'price-asc') return 'price-desc';
                                    if (prev === 'price-desc') return 'default';
                                    return 'price-asc';
                                })}
                            >
                                金額
                                {modalSort === 'price-asc' && <ArrowUp className="h-3.5 w-3.5 text-black" />}
                                {modalSort === 'price-desc' && <ArrowDown className="h-3.5 w-3.5 text-black" />}
                                {modalSort !== 'price-asc' && modalSort !== 'price-desc' && <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />}
                            </div>
                         </div>

                         <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                             {/* Changed from Grid to List Layout */}
                             <div className="flex flex-col gap-3 pb-12">
                                 {filteredModalProducts.length === 0 ? (
                                     <div className="py-20 text-center text-gray-400"><Search className="h-16 w-16 mx-auto mb-4 opacity-20" /><p className="text-lg font-medium">沒有符合條件的商品</p><button onClick={() => { setActiveFilters({}); setSearchQuery(''); }} className="mt-2 text-blue-600 font-bold hover:underline">清除所有篩選</button></div>
                                 ) : (
                                     filteredModalProducts.map(product => {
                                         // Check cart status
                                         const cartItem = cartItems.find(i => i.id === product.id);
                                         const qtyInCart = cartItem ? cartItem.quantity : 0;
                                         
                                         // If user hasn't touched the local quantity yet, default to what's in cart (if any), else 1
                                         const currentQty = rowQuantities[product.id] || (qtyInCart > 0 ? qtyInCart : 1);
                                         const isSelected = qtyInCart > 0;

                                         return (
                                             <div key={product.id} className={`group border rounded-xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center gap-4 bg-white ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-gray-300 hover:shadow-md'}`}>
                                                 
                                                 {/* Product Info (No Image) */}
                                                 <div className="flex-1 min-w-0">
                                                     <div className="flex flex-wrap items-center gap-2 mb-1">
                                                         <h4 className="font-bold text-gray-900 text-base leading-tight">{product.name}</h4>
                                                         {isSelected && (
                                                             <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                                 <Check className="h-3 w-3" /> 已加入 x{qtyInCart}
                                                             </span>
                                                         )}
                                                     </div>
                                                     <div className="text-xs text-gray-500 mb-2 line-clamp-1">{product.description}</div>
                                                     <div className="flex flex-wrap gap-1">
                                                         {product.specDetails && Object.entries(product.specDetails)
                                                             .filter(([k]) => k !== 'brand')
                                                             .slice(0, 4).map(([k, v]) => (
                                                             <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                                                 <span className="opacity-50 mr-1">{k}:</span>{v}
                                                             </span>
                                                         ))}
                                                     </div>
                                                 </div>

                                                 {/* Price & Actions */}
                                                 <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4 mt-2 md:mt-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                                                     <div className="font-bold text-lg text-black tabular-nums whitespace-nowrap">
                                                         ${product.price.toLocaleString()}
                                                     </div>
                                                     
                                                     <div className="flex items-center gap-2">
                                                         {/* Qty Control */}
                                                         <div className={`flex items-center rounded-lg h-9 border ${isSelected ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                                             <button 
                                                                 onClick={(e) => { e.stopPropagation(); setRowQuantities(prev => ({ ...prev, [product.id]: Math.max(1, currentQty - 1) })); }}
                                                                 className="w-8 h-full flex items-center justify-center hover:bg-gray-100 rounded-l-lg text-gray-600"
                                                             >
                                                                 <Minus className="h-3 w-3" />
                                                             </button>
                                                             <span className="w-8 text-center text-sm font-bold text-black">{currentQty}</span>
                                                             <button 
                                                                 onClick={(e) => { e.stopPropagation(); setRowQuantities(prev => ({ ...prev, [product.id]: currentQty + 1 })); }}
                                                                 className="w-8 h-full flex items-center justify-center hover:bg-gray-100 rounded-r-lg text-gray-600"
                                                             >
                                                                 <Plus className="h-3 w-3" />
                                                             </button>
                                                         </div>

                                                         {/* Action Button */}
                                                         <button 
                                                             onClick={() => handleSelectProduct(product, currentQty)}
                                                             className={`h-9 px-4 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap ${
                                                                 replacingItemId 
                                                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                                    : isSelected 
                                                                        ? (currentQty !== qtyInCart ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-default')
                                                                        : 'bg-black text-white hover:bg-gray-800'
                                                             }`}
                                                             disabled={!replacingItemId && isSelected && currentQty === qtyInCart}
                                                         >
                                                             {replacingItemId ? (
                                                                 <><RefreshCw className="h-3.5 w-3.5" /> 更換</>
                                                             ) : isSelected ? (
                                                                 currentQty !== qtyInCart ? '更新數量' : '已在清單'
                                                             ) : (
                                                                 <><Plus className="h-3.5 w-3.5" /> 加入</>
                                                             )}
                                                         </button>
                                                     </div>
                                                 </div>
                                             </div>
                                         );
                                     })
                                 )}
                             </div>
                         </div>
                    </div>
                    {mobileFiltersOpen && activeCategory && (<div className="absolute inset-0 z-30 bg-white flex flex-col lg:hidden animate-fade-in"><div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm flex-shrink-0"><h3 className="font-bold text-lg">篩選條件</h3><button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><X className="h-5 w-5" /></button></div><div className="flex-1 overflow-y-auto p-4 custom-scrollbar"><div className="space-y-6">{categoryFilters[activeCategory]?.map(filter => { const options = getSmartOptions(activeCategory, filter.key); if (options.length === 0) return null; return (<div key={filter.key}><h4 className="font-bold text-gray-900 mb-2 text-sm">{filter.label}</h4><div className="flex flex-wrap gap-2">{options.map(option => { const isChecked = activeFilters[filter.key]?.includes(option); return (<button key={option} onClick={() => toggleFilter(filter.key as string, option)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${isChecked ? 'bg-black text-white border-black font-bold' : 'bg-white text-gray-600 border-gray-200'}`}>{option}</button>) })}</div></div>); })}</div></div><div className="p-4 border-t border-gray-100 bg-white flex-shrink-0"><button onClick={() => setMobileFiltersOpen(false)} className="w-full py-3 bg-black text-white rounded-xl font-bold">查看 {filteredModalProducts.length} 個結果</button></div></div>)}
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Builder;
