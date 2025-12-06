
// pages/Admin.tsx
import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../contexts/ProductContext';
import { Category, Product, ProductSpecs } from '../types';
import { Upload, Database, Plus, Search, X, DollarSign, Loader2, Package, FileText } from 'lucide-react';

import AdminHeader from '../components/admin/AdminHeader';
import FilterControls from '../components/admin/FilterControls';
import ProductTable from '../components/admin/ProductTable';
import ProductEditModal from '../components/admin/ProductEditModal';
import ProductImportModal from '../components/admin/ProductImportModal';
import BatchActionsToolbar from '../components/admin/BatchActionsToolbar';
import BatchSpecModal from '../components/admin/BatchSpecModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import QuotationSettingsForm from '../components/admin/QuotationSettingsForm';

// For Confirmation Modal State
interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => Promise<void>;
}

const Admin: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefault, isLoading } = useProducts();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'products' | 'quotation'>('products');

  // Product Management State
  const [isEditing, setIsEditing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- UX State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });
  
  // Batch Operation State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchSpecEditing, setIsBatchSpecEditing] = useState(false);
  const [batchSpecData, setBatchSpecData] = useState<Partial<ProductSpecs>>({});
  
  // Price Update State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceUpdateInput, setPriceUpdateInput] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      
      let matchesSearch = true;
      const queryRaw = searchQuery.trim().toLowerCase();

      if (queryRaw) {
        // Combine all searchable text fields including specs
        const productText = [
          p.name,
          p.id,
          p.category,
          ...Object.values(p.specDetails || {})
        ].join(' ').toLowerCase();
        
        // Advanced Logic: 
        // 1. Split by '|' for OR groups (e.g. "Intel i7 | AMD R7")
        // 2. Inside each group, split by space for AND requirements (e.g. "Intel" AND "i7")
        const orGroups = queryRaw.split('|');

        matchesSearch = orGroups.some(group => {
            const andTerms = group.trim().split(/\s+/).filter(t => t);
            if (andTerms.length === 0) return false;
            
            // The product must contain ALL terms in this specific group
            return andTerms.every(term => productText.includes(term));
        });
      }

      return matchesCategory && matchesSearch;
    });
  }, [products, filterCategory, searchQuery]);

  const selectedProductsList = useMemo(() => products.filter(p => selectedIds.has(p.id)), [products, selectedIds]);
  const selectedCategories = useMemo(() => Array.from(new Set(selectedProductsList.map(p => p.category))), [selectedProductsList]);
  const isSameCategory = selectedCategories.length === 1;
  const commonCategory = isSameCategory ? selectedCategories[0] : null;

  const closeConfirmationModal = () => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleEdit = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentProduct({
      id: Date.now().toString(),
      name: '',
      price: 0,
      category: Category.CPU,
      description: '',
      image: '',
      specDetails: {}
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.id || !currentProduct.name) return;

    setIsSubmitting(true);
    const toastId = toast.loading('儲存中...');
    
    try {
      const productToSave = { ...currentProduct, lastUpdated: Date.now() } as Product;
      const isUpdating = products.some(p => p.id === currentProduct.id);
      
      if (isUpdating) {
        await updateProduct(productToSave);
      } else {
        await addProduct(productToSave);
      }
      
      toast.success(isUpdating ? '商品更新成功' : '商品新增成功', { id: toastId });
      setIsEditing(false);
      setCurrentProduct({});
    } catch (error) {
      toast.error('操作失敗', { id: toastId });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setConfirmationState({
      isOpen: true,
      title: '確認刪除',
      message: <p>您確定要永久刪除 <strong className="text-red-600">{product.name}</strong> 嗎？此操作無法復原。</p>,
      onConfirm: async () => {
        setIsSubmitting(true);
        const toastId = toast.loading('刪除中...');
        try {
          await deleteProduct(id);
          setSelectedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          toast.success('商品已刪除', { id: toastId });
          closeConfirmationModal();
        } catch (error) {
          toast.error('刪除失敗', { id: toastId });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleResetDb = () => {
    setConfirmationState({
      isOpen: true,
      title: '確認重置資料庫',
      message: <p>這將會清除資料庫中所有現有商品，並重置為預設資料。<br/><strong className="text-red-600">警告：此操作無法復原。</strong></p>,
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          await resetToDefault();
          closeConfirmationModal();
        } catch (error) {
          // Errors handled in context
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleBatchDelete = () => {
    setConfirmationState({
      isOpen: true,
      title: '確認批次刪除',
      message: <p>您確定要永久刪除選取的 <strong className="text-red-600">{selectedIds.size}</strong> 個商品嗎？此操作無法復原。</p>,
      onConfirm: async () => {
        setIsSubmitting(true);
        const toastId = toast.loading(`正在刪除 ${selectedIds.size} 個商品...`);
        try {
          for (const id of Array.from(selectedIds)) {
            await deleteProduct(id);
          }
          setSelectedIds(new Set());
          toast.success('批次刪除成功', { id: toastId });
          closeConfirmationModal();
        } catch (error) {
          toast.error('批次刪除失敗', { id: toastId });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const executeBatchPriceUpdate = async () => {
    const input = priceUpdateInput.trim();
    if (!input) return;
  
    const updates: Product[] = [];
    selectedIds.forEach(id => {
      const product = products.find(p => p.id === id);
      if (product) {
        let newPrice = product.price;
        const value = parseFloat(input.substring(1));
        
        if (input.startsWith('*')) newPrice = Math.round(product.price * value);
        else if (input.startsWith('+')) newPrice = product.price + parseInt(input.substring(1));
        else if (input.startsWith('-')) newPrice = Math.max(0, product.price - parseInt(input.substring(1)));
        else if (!isNaN(parseInt(input))) newPrice = parseInt(input);
        
        if (newPrice !== product.price) {
          updates.push({ ...product, price: newPrice, lastUpdated: Date.now() });
        }
      }
    });
  
    if (updates.length > 0) {
      setIsSubmitting(true);
      const toastId = toast.loading(`正在更新 ${updates.length} 筆價格...`);
      try {
        for (const p of updates) {
          await updateProduct(p);
        }
        toast.success(`成功更新 ${updates.length} 筆價格`, { id: toastId });
        setSelectedIds(new Set());
        setIsPriceModalOpen(false);
        setPriceUpdateInput('');
      } catch (error) {
        toast.error('批次更新價格失敗', { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('沒有商品價格需要更新');
      setIsPriceModalOpen(false);
    }
  };
  
  const handleSaveBatchSpecs = async () => {
    if (!commonCategory) return;
  
    const updatesToApply = Object.entries(batchSpecData).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') acc[key] = value.trim();
      return acc;
    }, {} as Record<string, string>);
  
    if (Object.keys(updatesToApply).length === 0) {
      toast.error('沒有輸入任何變更');
      return;
    }
  
    setConfirmationState({
      isOpen: true,
      title: '確認批次更新',
      message: (
        <p>確定要將 <strong className="text-blue-600">{Object.keys(updatesToApply).length}</strong> 個標籤套用到 <strong className="text-blue-600">{selectedIds.size}</strong> 個商品嗎？<br/>
        <span className="text-xs text-gray-500">(這將覆蓋現有的對應欄位)</span></p>
      ),
      onConfirm: async () => {
        setIsSubmitting(true);
        const toastId = toast.loading('批次更新中...');
        try {
          for (const id of Array.from(selectedIds)) {
            const product = products.find(p => p.id === id);
            if (product) {
              await updateProduct({
                ...product,
                specDetails: { ...product.specDetails, ...updatesToApply },
                lastUpdated: Date.now(),
              });
            }
          }
          toast.success('批次更新完成', { id: toastId });
          setIsBatchSpecEditing(false);
          setBatchSpecData({});
          setSelectedIds(new Set());
          closeConfirmationModal();
        } catch (error) {
          toast.error('批次更新失敗', { id: toastId });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };
  
  // Unified Button Styles
  const buttonBaseClass = "h-11 px-5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm";
  const buttonSecondaryClass = "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300";
  const buttonPrimaryClass = "bg-black border border-black text-white hover:bg-gray-800 shadow-md";

  return (
    // Main Container: Full viewport height minus navbar. Flex column layout.
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#F5F5F7]">
      
      {/* 1. Header & Tab Navigation */}
      <div className="flex-shrink-0 pt-4 md:pt-6 bg-[#F5F5F7] z-30">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 w-full">
            <AdminHeader isLoading={isLoading} />
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-4 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setActiveTab('products')}
                className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 transition-all relative whitespace-nowrap ${
                  activeTab === 'products' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Package className="h-4 w-4" /> 商品管理
                {activeTab === 'products' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('quotation')}
                className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 transition-all relative whitespace-nowrap ${
                  activeTab === 'quotation' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <FileText className="h-4 w-4" /> 報價單設定
                {activeTab === 'quotation' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
              </button>
            </div>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <div className="h-full max-w-[1280px] mx-auto px-2 md:px-8 pb-0 md:pb-4">
            
            {/* -- Tab: Products -- */}
            {activeTab === 'products' && (
              <div className="flex flex-col h-full">
                {/* Product Toolbar - Mobile Stacked, Desktop Row */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between bg-white p-3 md:p-3 rounded-2xl shadow-sm border border-gray-200 mb-3 flex-shrink-0">
                  {/* Search Input */}
                  <div className="relative flex-1 w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                          type="text" 
                          placeholder="搜尋... (空白=同時符合, | =擇一符合)" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all font-medium text-sm md:text-base placeholder-gray-400"
                      />
                      {searchQuery && (
                          <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                          >
                          <X className="h-4 w-4" />
                          </button>
                      )}
                  </div>

                  {/* Action Buttons - Horizontal Scroll on Mobile */}
                  <div className="flex gap-2 md:gap-3 shrink-0 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                      <button onClick={() => setIsImporting(true)} className={`${buttonBaseClass} ${buttonSecondaryClass} whitespace-nowrap`}>
                          <Upload className="h-4 w-4" /> <span className="">匯入</span>
                      </button>
                      <button onClick={handleResetDb} className={`${buttonBaseClass} ${buttonSecondaryClass} whitespace-nowrap`} title="重置為預設資料">
                          <Database className="h-4 w-4" /> <span className="">初始化</span>
                      </button>
                      <button onClick={handleAddNew} className={`${buttonBaseClass} ${buttonPrimaryClass} whitespace-nowrap`}>
                          <Plus className="h-4 w-4" /> <span className="">新增</span>
                      </button>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex-shrink-0">
                  <FilterControls
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    productCount={products.length}
                  />
                </div>

                {/* Table Container (Flex Grow) */}
                <div className="flex-1 min-h-0 mt-2 md:mt-4">
                  <ProductTable
                    isLoading={isLoading}
                    products={products}
                    filteredProducts={filteredProducts}
                    filterCategory={filterCategory}
                    selectedIds={selectedIds}
                    onSelectAll={toggleSelectAll}
                    onSelectOne={toggleSelectOne}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            )}

            {/* -- Tab: Quotation Settings -- */}
            {activeTab === 'quotation' && (
              <div className="h-full overflow-y-auto custom-scrollbar pb-20 px-2">
                 <QuotationSettingsForm />
              </div>
            )}

        </div>
      </div>

      {/* 3. Floating Action Toolbar (Only for Products Tab) */}
      {activeTab === 'products' && (
        <BatchActionsToolbar
          selectedIds={selectedIds}
          isSameCategory={isSameCategory}
          commonCategory={commonCategory}
          onBatchDelete={handleBatchDelete}
          onBatchPriceUpdate={() => { setIsPriceModalOpen(true); setPriceUpdateInput(''); }}
          onOpenBatchSpecEdit={() => {
              if (!isSameCategory) return;
              setBatchSpecData({});
              setIsBatchSpecEditing(true);
          }}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}

      {/* Modals */}
      <ProductEditModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        currentProduct={currentProduct}
        setCurrentProduct={setCurrentProduct}
        onSave={handleSave}
        products={products}
        isLoading={isSubmitting}
      />

      <BatchSpecModal
        isOpen={isBatchSpecEditing}
        onClose={() => setIsBatchSpecEditing(false)}
        selectedIds={selectedIds}
        commonCategory={commonCategory as Category}
        batchSpecData={batchSpecData}
        setBatchSpecData={setBatchSpecData}
        onSave={handleSaveBatchSpecs}
        products={products}
      />
      
      <ProductImportModal
        isOpen={isImporting}
        onClose={() => setIsImporting(false)}
      />

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        isLoading={isSubmitting}
      >
        {confirmationState.message}
      </ConfirmationModal>

      {/* Inline Modal for Price Update */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsPriceModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <DollarSign className="h-5 w-5 text-black" />
                批次調整價格
              </h3>
              <button onClick={() => setIsPriceModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-gray-600 text-sm">請輸入調整方式：</p>
              <ul className="text-xs text-gray-500 list-disc list-inside bg-gray-50 p-3 rounded-lg">
                <li><code className="bg-gray-200 px-1 rounded text-black">+100</code> : 全部加 100 元</li>
                <li><code className="bg-gray-200 px-1 rounded text-black">-50</code> : 全部減 50 元</li>
                <li><code className="bg-gray-200 px-1 rounded text-black">*1.1</code> : 全部漲價 10%</li>
                <li><code className="bg-gray-200 px-1 rounded text-black">12000</code> : 全部設定為 12000 元</li>
              </ul>
              <input 
                type="text" 
                autoFocus
                value={priceUpdateInput}
                onChange={(e) => setPriceUpdateInput(e.target.value)}
                placeholder="例如: *0.9 (打九折)"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-mono text-lg"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsPriceModalOpen(false)} 
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button 
                onClick={executeBatchPriceUpdate}
                disabled={isSubmitting || !priceUpdateInput.trim()}
                className="px-6 py-2.5 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '確認調整'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
