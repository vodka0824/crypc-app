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
        // Fallback to mock data only if firebase fails completely or is empty on first load?
        // For now, we just log error.
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
      alert("新增失敗，請檢查網路或 Firebase 設定");
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
      alert("更新失敗");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      console.error("Error deleting product: ", e);
      alert("刪除失敗");
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
    } catch (e) {
      console.error("Error batch importing: ", e);
      alert("批次匯入失敗");
    }
  };

  const resetToDefault = async () => {
    if (!window.confirm("這將會清除資料庫中所有現有商品，並重置為預設資料。確定嗎？")) return;
    
    setIsLoading(true);
    try {
      // 1. Delete all existing documents (Client-side deletion is not efficient for huge datasets, but fine for small shops)
      // Since we can't easily "delete collection" from client SDK, we list and delete.
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
      
      alert("資料庫已重置為預設值！");
    } catch (e) {
      console.error("Error resetting DB: ", e);
      alert("重置失敗，請檢查權限");
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
