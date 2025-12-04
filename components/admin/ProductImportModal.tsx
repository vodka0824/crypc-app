
// components/admin/ProductImportModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Category, Product } from '../../types';
import { useProducts } from '../../contexts/ProductContext';
import { FileSpreadsheet, X, FileUp, Download, ArrowRight, CheckCircle, RotateCcw, AlertTriangle, RefreshCw } from 'lucide-react';
import { categoryDisplayMap } from '../../data/mockData';

const isValidCategory = (cat: string): cat is Category => {
  return Object.values(Category).includes(cat as Category);
};

interface ImportPreviewItem extends Partial<Product> {
  status: 'new' | 'update' | 'error';
  errorMessage?: string;
  originalPrice?: number;
}

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductImportModal: React.FC<ProductImportModalProps> = ({ isOpen, onClose }) => {
  const { products, importProducts } = useProducts();
  
  const [importStep, setImportStep] = useState<'input' | 'preview'>('input');
  const [importData, setImportData] = useState('');
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [matchByName, setMatchByName] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<string>('Generic');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const csvTemplates: Record<string, string> = {
    'Generic': `id,name,price,category,description,image\ndemo-001,範例商品名稱,1000,其它,這是一個通用範本的描述,https://example.com/image.jpg`,
    [Category.CPU]: `id,name,price,category,description,brand,socket,chipset,tdp\ncpu-demo,Intel Core i5-14500,7500,處理器,14核/20緒 2.6GHz,Intel,LGA1700,B760,65W`,
    [Category.MB]: `id,name,price,category,description,brand,socket,chipset,type,memoryType\nmb-demo,ASUS ROG STRIX B760-A,6590,主機板,ATX/Wi-Fi 6E/白化版,ASUS,LGA1700,B760,ATX,DDR5`,
    [Category.GPU]: `id,name,price,category,description,brand,series,vram,gpuLength,tdp\ngpu-demo,Gigabyte RTX 4070 EAGLE,20990,顯示卡,三風扇/OC版,NVIDIA,RTX 40 Series,12GB,261mm,200W`,
    [Category.RAM]: `id,name,price,category,description,type,capacity,clock\nram-demo,Kingston Fury Beast 32GB,3200,記憶體,DDR5-6000/CL30/黑,DDR5,32GB,6000`,
    [Category.SSD]: `id,name,price,category,description,type,capacity\nssd-demo,Samsung 990 PRO 1TB,4500,固態硬碟,讀:7450/寫:6900,M.2 NVMe,1TB`,
    [Category.CASE]: `id,name,price,category,description,brand,type,radiatorSupport,coolerHeight,gpuLength\ncase-demo,Montech Air 903 MAX,2190,機殼,E-ATX/內含四風扇/黑,Montech,ATX,360mm,180mm,400mm`,
    [Category.PSU]: `id,name,price,category,description,brand,wattage,efficiency\npsu-demo,Seasonic Focus GX-850,3990,電源供應器,全模組/十年保,Seasonic,850W,金牌`,
    [Category.COOLER]: `id,name,price,category,description,brand,type,size,features\ncooler-demo,Valkyrie A360,4990,散熱器(水冷),360mm/2.4吋螢幕,Valkyrie,水冷,360mm,LCD螢幕`,
    [Category.AIR_COOLER]: `id,name,price,category,description,brand,coolerHeight,socket\nair-demo,Noctua NH-D15,3690,散熱器(風冷),雙塔雙扇/頂級空冷,Noctua,165mm,"LGA1700, AM5"`,
    [Category.MONITOR]: `id,name,price,category,description,brand,size,resolution,panelType,refreshRate\nmon-demo,ASUS VG27AQ,8800,螢幕,2K/IPS/165Hz/G-Sync,ASUS,27",2K,平面,165Hz`,
    [Category.SOFTWARE]: `id,name,price,category,description,brand,licenseType\nsw-demo,Windows 11 Home,3990,軟體,家用隨機版/64位元,Microsoft,OEM`,
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const dataLines = lines.filter(line => !line.trim().startsWith('#') && !line.trim().startsWith('//'));

    if (dataLines.length < 2) throw new Error('CSV 內容為空或缺少標題列');

    const splitCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      return result;
    };

    const headers = splitCSVLine(dataLines[0]);
    const coreFields = ['id', 'name', 'price', 'category', 'description', 'image'];
    
    if (!headers.includes('name') || !headers.includes('price') || !headers.includes('category')) {
      throw new Error('CSV 標題必須包含至少: name, price, category');
    }

    return dataLines.slice(1).map(line => {
      if (!line.trim()) return null;
      const values = splitCSVLine(line);
      const productObj: any = { specDetails: {} };

      headers.forEach((header, index) => {
        const value = values[index];
        if (coreFields.includes(header)) {
          if (header === 'price') {
            const numStr = value ? value.replace(/[^0-9.-]+/g, "") : "0";
            productObj[header] = numStr ? Number(numStr) : 0;
          } else {
            productObj[header] = value;
          }
        } else if (value) {
          productObj.specDetails[header] = value;
        }
      });
      return productObj;
    }).filter(item => item !== null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportData(text);
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  useEffect(() => {
    if (importStep === 'preview' && importData) {
      generatePreviews();
    }
  }, [matchByName]);

  const generatePreviews = () => {
    try {
      const parsedData = parseCSV(importData);
      const previews: ImportPreviewItem[] = parsedData.map((item: any, index: number) => {
        let existing = item.id ? products.find(p => p.id === item.id) : undefined;
        if (!existing && matchByName && item.name) {
          existing = products.find(p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase());
          if (existing) item.id = existing.id;
        }
        if (!item.id || String(item.id).trim() === '') {
          item.id = `${Date.now()}-${index}`;
        }
        let status: ImportPreviewItem['status'] = existing ? 'update' : 'new';
        let error = '';
        if (!item.name) { status = 'error'; error = '缺少名稱'; } 
        else if (typeof item.price !== 'number' || isNaN(item.price)) { status = 'error'; error = '價格錯誤'; } 
        else if (!isValidCategory(item.category)) { status = 'error'; error = `分類錯誤: ${item.category}`; }

        return { ...item, status, errorMessage: error, originalPrice: existing?.price };
      });
      setPreviewItems(previews);
    } catch (e: any) {
      alert(`解析失敗: ${e.message}`);
    }
  };

  const handlePreview = () => {
    generatePreviews();
    setImportStep('preview');
  };

  const handleConfirmImport = async () => {
    const validItems = previewItems.filter(i => i.status !== 'error').map(i => {
      const { status, errorMessage, originalPrice, ...product } = i;
      return { specDetails: {}, lastUpdated: Date.now(), ...product } as Product;
    });
    if (validItems.length === 0) { alert('沒有有效的資料可匯入'); return; }
    
    await importProducts(validItems);
    
    alert(`成功匯入 ${validItems.length} 筆資料`);
    closeModal();
  };

  const closeModal = () => {
    setImportStep('input');
    setImportData('');
    setPreviewItems([]);
    setMatchByName(false);
    onClose();
  };

  const loadTemplate = () => {
    const template = csvTemplates[templateCategory] || csvTemplates['Generic'];
    setImportData(template);
  };

  if (!isOpen) return null;

  const errorCount = previewItems.filter(i => i.status === 'error').length;
  const newCount = previewItems.filter(i => i.status === 'new').length;
  const updateCount = previewItems.filter(i => i.status === 'update').length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative bg-white w-full max-w-[1400px] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-white z-10 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
              <FileSpreadsheet className="h-7 w-7 text-green-600" /> 商品批次匯入
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {importStep === 'input' ? '請上傳 CSV 檔案或直接貼上內容。系統會自動辨識欄位。' : '請確認匯入內容無誤。'}
            </p>
          </div>
          <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        {importStep === 'input' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50">
            <div className="lg:w-1/3 p-6 lg:p-8 flex flex-col gap-6 border-r border-gray-200 bg-white h-full overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">方式一：上傳 CSV 檔案</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileUp className="h-8 w-8 text-green-600" />
                  </div>
                  <span className="font-bold text-gray-900">點擊上傳檔案</span>
                  <span className="text-xs text-gray-500 mt-1">支援 .csv 格式 (Excel)</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">還沒有檔案？下載範本</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select 
                      value={templateCategory} 
                      onChange={(e) => setTemplateCategory(e.target.value)}
                      className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:border-black focus:ring-1 focus:ring-black text-sm font-bold cursor-pointer"
                    >
                      <option value="Generic">通用 (全部欄位)</option>
                      {Object.values(Category).map(cat => (
                        <option key={cat} value={cat}>{categoryDisplayMap[cat]}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  <button 
                    onClick={loadTemplate} 
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all font-bold text-sm whitespace-nowrap"
                  >
                    <Download className="h-4 w-4" /> 載入
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 lg:p-8 flex flex-col h-full min-h-[400px]">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-gray-900">方式二：直接編輯 / 貼上內容</label>
                <span className="text-xs font-mono text-gray-400">Rows: {importData.split('\n').length - 1}</span>
              </div>
              <textarea 
                className="flex-1 w-full p-6 bg-white border border-gray-200 rounded-2xl font-mono text-sm leading-relaxed focus:ring-2 focus:ring-black focus:border-transparent resize-none shadow-sm whitespace-pre text-gray-800" 
                placeholder={`id,name,price,category,description...\ncpu-001,Intel Core i5,6500,處理器...`} 
                value={importData} 
                onChange={(e) => setImportData(e.target.value)} 
              />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeModal} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50">取消</button>
                <button 
                  onClick={handlePreview} 
                  disabled={!importData.trim()}
                  className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  預覽並驗證 <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex gap-8 items-center justify-between text-sm flex-shrink-0">
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-500">總筆數:</span>
                  <span className="font-mono font-bold text-lg">{previewItems.length}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /><span className="font-bold">新增: {newCount}</span></div>
                <div className="flex items-center gap-2 text-blue-600"><RotateCcw className="h-4 w-4" /><span className="font-bold">更新: {updateCount}</span></div>
                <div className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" /><span className="font-bold">錯誤: {errorCount}</span></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all select-none">
                <input type="checkbox" checked={matchByName} onChange={(e) => setMatchByName(e.target.checked)} className="rounded border-gray-300 text-black focus:ring-black h-4 w-4" />
                <span className="font-bold text-gray-700 flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" />若名稱相同則自動更新</span>
              </label>
            </div>
            <div className="flex-1 overflow-hidden p-4 lg:p-8 flex flex-col min-h-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-auto relative">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                    <tr>
                      <th className="p-4 font-bold text-gray-900 w-20">狀態</th>
                      <th className="p-4 font-bold text-gray-900 w-24">ID</th>
                      <th className="p-4 font-bold text-gray-900 w-48">名稱</th>
                      <th className="p-4 font-bold text-gray-900 w-24">價格</th>
                      <th className="p-4 font-bold text-gray-900 w-24">分類</th>
                      <th className="p-4 font-bold text-gray-900 w-56">產品標籤 (Specs)</th>
                      <th className="p-4 font-bold text-gray-900 w-32">驗證訊息</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewItems.map((item, idx) => (
                      <tr key={idx} className={`hover:bg-gray-50 transition-colors ${item.status === 'error' ? 'bg-red-50/30' : ''}`}>
                        <td className="p-4 align-top">
                          {item.status === 'new' && <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">新增</span>}
                          {item.status === 'update' && <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">更新</span>}
                          {item.status === 'error' && <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">錯誤</span>}
                        </td>
                        <td className="p-4 text-xs font-mono text-gray-500 align-top">{item.id}</td>
                        <td className="p-4 font-medium text-gray-900 align-top">{item.name || '-'}</td>
                        <td className="p-4 font-mono align-top">${item.price?.toLocaleString()}</td>
                        <td className="p-4 text-sm text-gray-600 align-top">{item.category}</td>
                        <td className="p-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {item.specDetails && Object.entries(item.specDetails).length > 0 ? (
                              Object.entries(item.specDetails).map(([k, v]) => (
                                <span key={k} className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] border border-gray-200">
                                  <span className="font-bold mr-1 opacity-70">{k}:</span> {v}
                                </span>
                              ))
                            ) : <span className="text-gray-300 text-xs">-</span>}
                          </div>
                        </td>
                        <td className="p-4 text-sm align-top">
                          {item.status === 'error' ? (
                            <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {item.errorMessage}</span>
                          ) : <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> OK</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white border-t border-gray-200 p-6 flex justify-between items-center flex-shrink-0">
              <button onClick={() => setImportStep('input')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">返回修改</button>
              <button onClick={handleConfirmImport} disabled={errorCount > 0 && previewItems.length === errorCount} className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Download className="h-4 w-4" /> 確認匯入 {previewItems.length - errorCount} 筆資料
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImportModal;
