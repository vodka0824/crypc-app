import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../contexts/ProductContext';
import { Category, Product, ProductSpecs } from '../types';

import AdminHeader from '../components/admin/AdminHeader';
import FilterControls from '../components/admin/FilterControls';
import ProductTable from '../components/admin/ProductTable';
import ProductEditModal from '../components/admin/ProductEditModal';
import ProductImportModal from '../components/admin/ProductImportModal';
import BatchActionsToolbar from '../components/admin/BatchActionsToolbar';
import BatchSpecModal from '../components/admin/BatchSpecModal';
import ConfirmationModal from '../components/common/ConfirmationModal';

// For Confirmation Modal State
interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => Promise<void>;
}

const Admin: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefault, isLoading } = useProducts();
  
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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleBatchPriceUpdate = () => {
    const input = prompt('請輸入價格調整方式：\n例如："+100", "-50", "*1.1", 或直接輸入數字 "12000"');
    if (!input || input.trim() === '') return;
  
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
      (async () => {
        setIsSubmitting(true);
        const toastId = toast.loading(`正在更新 ${updates.length} 筆價格...`);
        try {
          for (const p of updates) {
            await updateProduct(p);
          }
          toast.success(`成功更新 ${updates.length} 筆價格`, { id: toastId });
          setSelectedIds(new Set());
        } catch (error) {
          toast.error('批次更新價格失敗', { id: toastId });
        } finally {
          setIsSubmitting(false);
        }
      })();
    } else {
      toast.error('沒有商品價格需要更新');
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
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 pb-32">
      <AdminHeader
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onImport={() => setIsImporting(true)}
        onReset={resetToDefault}
      />

      <FilterControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        productCount={products.length}
      />

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

      <BatchActionsToolbar
        selectedIds={selectedIds}
        isSameCategory={isSameCategory}
        commonCategory={commonCategory}
        onBatchDelete={handleBatchDelete}
        onBatchPriceUpdate={handleBatchPriceUpdate}
        onOpenBatchSpecEdit={() => {
            if (!isSameCategory) return;
            setBatchSpecData({});
            setIsBatchSpecEditing(true);
        }}
        onClearSelection={() => setSelectedIds(new Set())}
      />

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
    </div>
  );
};

export default Admin;