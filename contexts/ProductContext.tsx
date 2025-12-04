
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { initialProducts } from '../data/mockData';
import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  updateDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  importProducts: (newProducts: Product[]) => Promise<void>;
  resetToDefault: () => Promise<void>;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for Firebase Firestore
  useEffect(() => {
    setIsLoading(true);
    // Subscribe to the "products" collection
    const unsubscribe = onSnapshot(collection(db, "products"), 
      (snapshot) => {
        const productList = snapshot.docs.map(doc => doc.data() as Product);
        setProducts(productList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firebase Snapshot Error:", error);
        toast.error("無法連接至資料庫");
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Product) => {
    try {
      // Use setDoc with a specific ID (product.id) to ensure we control the ID
      await setDoc(doc(db, "products", product.id), {
        ...product,
        lastUpdated: Date.now()
      });
    } catch (e) {
      console.error("Error adding product: ", e);
      toast.error("新增失敗，請檢查網路連線");
      throw e;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const productRef = doc(db, "products", updatedProduct.id);
      await updateDoc(productRef, {
        ...updatedProduct,
        lastUpdated: Date.now()
      });
    } catch (e) {
      console.error("Error updating product: ", e);
      toast.error("更新失敗");
      throw e;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      console.error("Error deleting product: ", e);
      toast.error("刪除失敗");
      throw e;
    }
  };

  const importProducts = async (newProducts: Product[]) => {
    const batch = writeBatch(db);
    
    newProducts.forEach((product) => {
      const docRef = doc(db, "products", product.id);
      batch.set(docRef, { ...product, lastUpdated: Date.now() });
    });

    try {
      await batch.commit();
      toast.success(`成功匯入 ${newProducts.length} 筆商品`);
    } catch (e) {
      console.error("Error batch importing: ", e);
      toast.error("批次匯入失敗");
      throw e;
    }
  };

  const resetToDefault = async () => {
    // Confirmation moved to UI layer (Admin.tsx)
    setIsLoading(true);
    try {
      // 1. Delete all existing documents
      const batchDelete = writeBatch(db);
      products.forEach(p => {
        const docRef = doc(db, "products", p.id);
        batchDelete.delete(docRef);
      });
      await batchDelete.commit();

      // 2. Upload initial data
      const batchAdd = writeBatch(db);
      initialProducts.forEach(p => {
        const docRef = doc(db, "products", p.id);
        batchAdd.set(docRef, { ...p, lastUpdated: Date.now() });
      });
      await batchAdd.commit();
      
      toast.success("資料庫已重置為預設值！");
    } catch (e) {
      console.error("Error resetting DB: ", e);
      toast.error("重置失敗，請檢查權限");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, importProducts, resetToDefault, isLoading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
