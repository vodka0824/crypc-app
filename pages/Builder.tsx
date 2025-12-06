
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Category, Product, BuildState, BuilderItem, BuildTemplate, CartItem } from '../types';
import { Cpu, CircuitBoard, MemoryStick, Gamepad2, HardDrive, Droplets, Wind, Zap, Box, Monitor, Disc, Mouse, Sparkles, Loader2, Bot, Save, FolderOpen, Copy, MoreHorizontal, ClipboardCopy, Trash2, X, Check, Send, Clock, ChevronDown, RefreshCw, Plus } from 'lucide-react';
import { categoryDisplayMap } from '../data/mockData';
import { useProducts } from '../contexts/ProductContext';
import { generateSmartBuild } from '../services/geminiService';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { parseWattage, checkCompatibility } from '../utils/builderLogic';
import MobileStepProgress from '../components/builder/MobileStepProgress';
import { triggerHaptic } from '../utils/uiHelpers';

// New Components
import BuilderSlot from '../components/builder/BuilderSlot';
import BuilderSummary from '../components/builder/BuilderSummary';
import ProductSelectionModal from '../components/builder/ProductSelectionModal';

// Slot definition for UI iteration
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

  // --- Derived State ---
  const build: BuildState = useMemo(() => {
    const state: any = {};
    Object.values(Category).forEach(cat => { state[cat] = []; });
    cartItems.forEach(item => {
        const builderItem: BuilderItem = { ...item, uniqueId: item.id };
        if (state[item.category]) { state[item.category].push(builderItem); } 
        else { if (!state[Category.OTHERS]) state[Category.OTHERS] = []; state[Category.OTHERS].push(builderItem); }
    });
    return state as BuildState;
  }, [cartItems]);

  // --- Optimization: Memoize Compatibility Checks ---
  const compatibilityMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    cartItems.forEach(item => {
        const error = checkCompatibility(item, build);
        if (error) {
            map[item.id] = error;
        }
    });
    return map;
  }, [cartItems, build]);

  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);

  // Modals & UI State
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
        try { setTemplates(JSON.parse(savedTemplates)); } catch (e) { console.error("Failed to parse templates"); }
    }
  }, []);

  // --- Calculations ---
  const totalTDP = useMemo(() => {
      let tdp = 0;
      let hasMajorComponents = false;
      const ESTIMATES: Partial<Record<Category, number>> = {
          [Category.MB]: 50, [Category.RAM]: 15, [Category.SSD]: 10,
          [Category.COOLER]: 35, [Category.AIR_COOLER]: 10, [Category.CASE]: 10
      };
      cartItems.forEach(item => {
          if (item.category === Category.CPU || item.category === Category.GPU) {
              tdp += parseWattage(item.specDetails?.tdp) * item.quantity;
              hasMajorComponents = true;
          } else if (item.category === Category.RAM) {
              const estimate = ESTIMATES[Category.RAM] || 0;
              const nameLower = item.name.toLowerCase();
              const isDualKit = nameLower.includes('*2') || nameLower.includes('x2');
              const multiplier = isDualKit ? 2 : 1;
              tdp += estimate * item.quantity * multiplier;
          } else if (item.category in ESTIMATES) {
              const estimate = ESTIMATES[item.category as keyof typeof ESTIMATES] || 0;
              tdp += estimate * item.quantity;
          }
      });
      return tdp + (hasMajorComponents ? 30 : 0);
  }, [cartItems]);

  const recommendedPsuWattage = useMemo(() => {
      if (totalTDP === 0) return 0;
      return Math.ceil((totalTDP * 1.3) / 50) * 50;
  }, [totalTDP]);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const primaryPsu = build[Category.PSU]?.[0];
  const currentPsuWattage = primaryPsu ? parseWattage(primaryPsu.specDetails?.wattage) : 0;

  // --- Handlers ---
  const handleOpenSelection = useCallback((category: Category) => {
    setReplacingItemId(null);
    setActiveCategory(category);
    setIsModalOpen(true);
  }, []);

  const handleStartReplace = useCallback((item: BuilderItem) => {
    setReplacingItemId(item.id);
    setActiveCategory(item.category);
    setIsModalOpen(true);
  }, []);

  const handleSelectProduct = (product: Product, quantityToAdd: number) => {
    triggerHaptic();
    setCartItems(prev => {
        let newCart = [...prev];
        if (replacingItemId) { newCart = newCart.filter(item => item.id !== replacingItemId); }
        const existingIndex = newCart.findIndex(p => p.id === product.id);
        if (existingIndex >= 0) {
            newCart[existingIndex] = { ...newCart[existingIndex], quantity: replacingItemId ? quantityToAdd : newCart[existingIndex].quantity + quantityToAdd };
        } else {
            newCart.push({ ...product, quantity: quantityToAdd });
        }
        return newCart;
    });
    if (replacingItemId) { setReplacingItemId(null); setIsModalOpen(false); }
  };

  const handleRemoveProduct = useCallback((productId: string) => {
    triggerHaptic();
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const handleClearCategory = useCallback((category: Category) => {
    setConfirmModalState({
      isOpen: true, title: '清空分類', message: `確定要移除所有 ${categoryDisplayMap[category]} 嗎？`,
      onConfirm: () => {
        setCartItems(prev => prev.filter(item => item.category !== category));
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, []);

  const handleQuantityChange = useCallback((productId: string, delta: number) => {
    triggerHaptic();
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  }, []);

  const handleDirectUpdateQuantity = (productId: string, newQty: number) => {
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item));
    setQtySelectorId(null);
  };

  const getCurrentSelectorQty = () => {
    if (!qtySelectorId) return 1;
    const item = cartItems.find(i => i.id === qtySelectorId);
    return item ? item.quantity : 1;
  };

  const resetBuild = () => {
    setConfirmModalState({
      isOpen: true, title: '清空估價單', message: '確定要清空目前的估價清單嗎？\n\n警告：此操作將移除所有已選項目且無法復原。',
      onConfirm: () => { setCartItems([]); setConfirmModalState(prev => ({ ...prev, isOpen: false })); }
    });
  };

  const handleShareBuild = () => {
      const text = `【哭PC 配置單】\n總價：$${totalPrice.toLocaleString()}\n----------\n${cartItems.map(item => `${item.category}: ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`).join('\n')}\n----------\n此報價單由 CryPC 系統產生`;
      navigator.clipboard.writeText(text).then(() => toast.success('配置單已複製到剪貼簿！')).catch(() => toast.error('複製失敗'));
  };

  const handleAiAutoBuild = async () => {
      if (!aiBudget || !aiUsage) { toast.error('請輸入預算與用途'); return; }
      setIsAiLoading(true);
      setAiExplanation('');
      try {
          const numericBudget = parseInt(aiBudget.replace(/[^0-9]/g, ''));
          if (isNaN(numericBudget)) { toast.error('預算格式錯誤'); setIsAiLoading(false); return; }
          const result = await generateSmartBuild(allProducts, numericBudget, aiUsage);
          if (result.productIds && result.productIds.length > 0) {
              const newItems: CartItem[] = [];
              result.productIds.forEach(id => {
                  const product = allProducts.find(p => p.id === id);
                  if (product) newItems.push({ ...product, quantity: 1 });
              });
              setCartItems(newItems);
              setAiExplanation(result.explanation);
          } else { toast.error('AI 無法找到適合的配置'); }
      } catch (error: any) { toast.error(error.message || 'AI 配單發生錯誤'); } finally { setIsAiLoading(false); }
  };

  const openTemplateModal = (mode: 'save' | 'load') => { setTemplateMode(mode); setNewTemplateName(''); setIsTemplateModalOpen(true); setMobileMenuOpen(false); };
  
  const handleSaveTemplate = () => {
      if (!newTemplateName.trim()) { toast.error('請輸入範本名稱'); return; }
      if (cartItems.length === 0) { toast.error('估價單為空'); return; }
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
              if (currentProduct) { newCartItems.push({ ...currentProduct, quantity: tItem.quantity }); } else { missingCount++; }
          });
          setCartItems(newCartItems);
          setIsTemplateModalOpen(false);
          setConfirmModalState(prev => ({ ...prev, isOpen: false }));
          if (missingCount > 0) toast(`範本載入成功，但有 ${missingCount} 個商品已下架`, { icon: '⚠️' }); else toast.success('範本載入成功');
      };
      if (cartItems.length > 0) { setConfirmModalState({ isOpen: true, title: '載入範本', message: '載入範本將會覆蓋目前的估價單，確定要繼續嗎？', onConfirm: executeLoad }); } else { executeLoad(); }
  };

  const handleDeleteTemplate = (id: string) => {
      setConfirmModalState({
          isOpen: true, title: '刪除範本', message: '確定要刪除此範本嗎？',
          onConfirm: () => {
              const updated = templates.filter(t => t.id !== id);
              setTemplates(updated);
              localStorage.setItem('crypc_templates', JSON.stringify(updated));
              setConfirmModalState(prev => ({ ...prev, isOpen: false }));
              toast.success('範本已刪除');
          }
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-10 pb-32 md:pb-12">
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}</style>
      <MobileStepProgress cartItems={cartItems} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative mt-4 md:mt-0">
        <div className="lg:col-span-8 flex flex-col gap-3 md:gap-5 order-2 lg:order-1">
           <div className="md:hidden flex justify-between items-center mb-2"><h1 className="text-xl font-bold text-gray-900">組裝估價</h1></div>
           {buildSlots.map((slot) => (
                <BuilderSlot
                    key={slot.category}
                    category={slot.category}
                    icon={slot.icon}
                    label={slot.label}
                    items={build[slot.category] || []}
                    buildState={build}
                    // Pass the memoized map instead of calculating inside
                    compatibilityMap={compatibilityMap}
                    onOpenSelection={handleOpenSelection}
                    onClearCategory={handleClearCategory}
                    onRemoveItem={handleRemoveProduct}
                    onQuantityChange={handleQuantityChange}
                    onReplaceItem={handleStartReplace}
                    onOpenQtySelector={setQtySelectorId}
                />
           ))}
        </div>

        <div className="hidden lg:block lg:col-span-4 order-1 lg:order-2 h-full">
            <BuilderSummary 
                cartItems={cartItems}
                totalPrice={totalPrice}
                totalTDP={totalTDP}
                currentPsuWattage={currentPsuWattage}
                recommendedPsuWattage={recommendedPsuWattage}
                onAiOpen={() => setIsAiModalOpen(true)}
                onTemplateOpen={openTemplateModal}
                onShare={handleShareBuild}
                onReset={resetBuild}
            />
        </div>
      </div>

      {/* --- Modals & Overlays --- */}
      
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
      >
        {confirmModalState.message}
      </ConfirmationModal>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] px-4 py-3 safe-area-bottom">
         <div className="flex items-center gap-3">
             <div className="flex-1 min-w-0 flex flex-col">
                 <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">預估總金額</div>
                 <div className="text-2xl font-bold text-black leading-none truncate tracking-tight">${totalPrice.toLocaleString()}</div>
             </div>
             <button onClick={() => setIsAiModalOpen(true)} className="h-12 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-1.5"><Sparkles className="h-4 w-4 text-yellow-300" /> <span className="text-sm">AI 配單</span></button>
             <button onClick={() => setMobileMenuOpen(true)} className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl active:bg-gray-200 active:scale-95 transition-all"><MoreHorizontal className="h-6 w-6" /></button>
         </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative bg-white w-full rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col gap-3 h-auto max-h-[85vh] safe-area-bottom">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-2 flex-shrink-0" />
                <button onClick={handleShareBuild} className="flex items-center justify-center gap-3 w-full p-4 bg-black text-white hover:bg-gray-800 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"><ClipboardCopy className="h-5 w-5" /> 複製報價單</button>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => openTemplateModal('load')} className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 border border-gray-100 active:bg-gray-200 transition-colors"><FolderOpen className="h-6 w-6 text-blue-600" /> <span className="text-sm">載入範本</span></button>
                    <button onClick={() => openTemplateModal('save')} className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 border border-gray-100 active:bg-gray-200 transition-colors"><Save className="h-6 w-6 text-green-600" /> <span className="text-sm">儲存範本</span></button>
                </div>
                <button onClick={resetBuild} className="w-full p-4 text-red-600 font-bold border border-red-100 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 active:scale-95 transition-transform mt-2"><Trash2 className="h-5 w-5" /> 清空重選</button>
            </div>
        </div>
      )}
      
      {/* Qty Selector */}
      {qtySelectorId && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setQtySelectorId(null)}>
           <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl transform transition-transform animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-gray-900">選擇數量</h3><button onClick={() => setQtySelectorId(null)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X className="h-5 w-5" /></button></div>
              <div className="grid grid-cols-5 gap-3">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (<button key={num} onClick={() => handleDirectUpdateQuantity(qtySelectorId, num)} className={`py-3 rounded-xl font-bold text-lg border-2 transition-all active:scale-95 ${(getCurrentSelectorQty() === num) ? 'border-black bg-black text-white' : 'border-gray-100 bg-white text-gray-900 hover:border-gray-300'}`}>{num}</button>))}</div>
           </div>
        </div>
      )}

      {/* AI Chat Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[75] flex items-end md:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={() => setIsAiModalOpen(false)} />
            <div className="relative bg-[#F5F5F7] w-full md:max-w-lg h-[85vh] md:h-[80vh] rounded-t-3xl md:rounded-[2rem] shadow-2xl flex flex-col animate-scale-in overflow-hidden border border-white/50">
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm z-10">
                    <div className="flex items-center gap-3"><div className="p-2 bg-black rounded-lg text-white shadow-md"><Bot className="h-5 w-5" /></div><div><h3 className="font-bold text-gray-900 text-lg">AI 配單助手</h3><p className="text-[10px] text-green-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> 線上</p></div></div>
                    <button onClick={() => setIsAiModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="flex items-start gap-3"><div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm"><Bot className="h-4 w-4" /></div><div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-sm leading-relaxed text-gray-700 border border-gray-100">嗨！我是您的 AI 組裝顧問。<br/>請告訴我您的<b>預算</b>以及<b>主要用途</b>，我將為您推薦最適合的配置。</div></div>
                    {(aiBudget || aiUsage) && !aiExplanation && (<div className="flex justify-end"><div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md shadow-blue-200 max-w-[85%] text-sm">預算: ${aiBudget || '?'}<br/>用途: {aiUsage || '?'}</div></div>)}
                    {isAiLoading && (<div className="flex items-start gap-3"><div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1"><Bot className="h-4 w-4" /></div><div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm w-[70%] border border-gray-100 space-y-2"><div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div><div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div><div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div></div></div>)}
                    {aiExplanation && (<div className="flex items-start gap-3 animate-fade-in"><div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm"><Check className="h-4 w-4" /></div><div className="space-y-3 max-w-[85%]"><div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed text-gray-700 border border-gray-100 whitespace-pre-line">{aiExplanation}</div><div className="flex gap-2"><button onClick={() => { setIsAiModalOpen(false); setAiExplanation(''); }} className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-transform">採用此配置</button><button onClick={() => setAiExplanation('')} className="px-5 py-2.5 bg-white text-gray-600 text-xs font-bold rounded-xl border border-gray-200 active:scale-95 transition-transform hover:bg-gray-50">重新詢問</button></div></div></div>)}
                </div>
                {!aiExplanation && (<div className="p-6 bg-white border-t border-gray-100"><div className="flex flex-col gap-4"><div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">{usagePresets.map(preset => (<button key={preset.label} onClick={() => setAiUsage(preset.value)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${aiUsage === preset.value ? 'bg-black text-white border-black shadow-sm' : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'}`}>{preset.label}</button>))}</div><div className="flex gap-3"><input type="number" value={aiBudget} onChange={(e) => setAiBudget(e.target.value)} placeholder="預算..." className="w-1/3 p-3 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 rounded-xl text-sm font-bold outline-none transition-all" /><input type="text" value={aiUsage} onChange={(e) => setAiUsage(e.target.value)} placeholder="描述您的需求..." className="flex-1 p-3 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 rounded-xl text-sm outline-none transition-all" /><button onClick={handleAiAutoBuild} disabled={isAiLoading || !aiBudget} className="p-3 bg-blue-600 text-white rounded-xl active:scale-90 transition-transform disabled:opacity-50 shadow-lg shadow-blue-200 hover:bg-blue-700"><Send className="h-5 w-5" /></button></div></div></div>)}
            </div>
        </div>
      )}

      {/* Template Modal */}
      {isTemplateModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTemplateModalOpen(false)} />
              <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 animate-scale-in border border-white/50">
                  <div className="flex justify-between items-center mb-8"><div className="flex items-center gap-4"><div className="p-3 bg-gray-100 rounded-2xl">{templateMode === 'save' ? <Save className="h-6 w-6 text-black" /> : <FolderOpen className="h-6 w-6 text-black" />}</div><div><h3 className="text-2xl font-bold text-gray-900">{templateMode === 'save' ? '儲存配置' : '載入配置'}</h3><p className="text-xs text-gray-500 font-medium">{templateMode === 'save' ? '將目前的清單儲存為範本' : '從儲存的範本中還原'}</p></div></div><button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"><X className="h-6 w-6" /></button></div>
                  {templateMode === 'save' ? (<div className="space-y-6"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">範本名稱</label><input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="例如: 遊戲機 40K (2024)" className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 rounded-xl font-bold text-lg transition-all outline-none" autoFocus /></div><button onClick={handleSaveTemplate} className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg active:scale-95">確認儲存</button></div>) : (<div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">{templates.length === 0 ? (<div className="text-center text-gray-400 py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100"><FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" /><p className="text-sm font-bold">暫無儲存的範本</p></div>) : (templates.map(template => (<div key={template.id} className="group border border-gray-200 rounded-2xl p-5 hover:border-black transition-all bg-white hover:shadow-lg cursor-pointer" onClick={() => handleLoadTemplate(template)}><div className="flex justify-between items-start mb-3"><div><div className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{template.name}</div><div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1 font-medium"><Clock className="h-3 w-3" /> {new Date(template.timestamp).toLocaleString()}</div></div><button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }} className="text-gray-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"><Trash2 className="h-5 w-5" /></button></div><div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50"><span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">{template.items.length} 個零件</span><span className="text-xs font-bold text-blue-600 flex items-center gap-1">載入 <ArrowRight className="h-3 w-3" /></span></div></div>)))}</div>)}
              </div>
          </div>
      )}

      {/* Selection Modal (Refactored & Virtualized) */}
      {isModalOpen && activeCategory && (
          <ProductSelectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              activeCategory={activeCategory}
              allProducts={allProducts}
              cartItems={cartItems}
              replacingItemId={replacingItemId}
              onSelectProduct={handleSelectProduct}
              onRemoveProduct={handleRemoveProduct}
              onQuantityChange={handleQuantityChange}
          />
      )}
    </div>
  );
};

// Import needed for template modal arrow icon
import { ArrowRight } from 'lucide-react';

export default Builder;
