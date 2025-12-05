
import React, { useState, useEffect } from 'react';
import { X, Printer, Monitor, Edit3 } from 'lucide-react';
import { CartItem } from '../types';
import { useProducts } from '../contexts/ProductContext';

interface QuotationPreviewProps {
  items: CartItem[];
  onClose: () => void;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ items, onClose }) => {
  const { quotationSettings } = useProducts();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [date, setDate] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    // Generate random Quote ID and Date on mount
    const today = new Date();
    const id = 'Q' + today.getFullYear().toString().substr(-2) + 
               (today.getMonth() + 1).toString().padStart(2, '0') + 
               today.getDate().toString().padStart(2, '0') + 
               '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    setQuoteId(id);
    setDate(today.toLocaleDateString('zh-TW'));
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[11000] flex items-start justify-center bg-gray-900/95 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:block">
      
      {/* Action Bar (Sticky on Mobile, Fixed on Desktop) */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md p-4 flex justify-between items-center text-white print:hidden z-50 shadow-md border-b border-gray-700">
        <div className="flex items-center gap-2">
           <Monitor className="h-5 w-5 text-blue-400" />
           <span className="font-bold text-lg hidden sm:inline">正式報價單預覽</span>
           <span className="font-bold text-lg sm:hidden">報價單預覽</span>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base shadow-lg shadow-blue-900/20"
            >
                <Printer className="h-4 w-4" /> 
                <span className="hidden sm:inline">列印 / 另存PDF</span>
                <span className="sm:hidden">列印</span>
            </button>
            <button 
                onClick={onClose}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
                <X className="h-4 w-4" /> 
                <span className="hidden sm:inline">關閉</span>
            </button>
        </div>
      </div>

      {/* A4 Paper Container */}
      <div className="bg-white text-black w-full md:max-w-[210mm] min-h-[297mm] mx-auto mt-[72px] md:my-20 p-8 md:p-12 shadow-2xl print:shadow-none print:m-0 print:w-full print:max-w-none print:h-auto rounded-none md:rounded-sm flex flex-col relative animate-fade-in">
        
        {/* Header - Dynamic from Settings */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-black pb-6 mb-6 gap-6 md:gap-0">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{quotationSettings.companyName || '公司名稱'} - 報價單</h1>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>{quotationSettings.companyAddress}</p>
                    <p>Tel: {quotationSettings.companyPhone} | Email: {quotationSettings.companyEmail}</p>
                </div>
            </div>
            <div className="w-full md:w-auto text-left md:text-right flex flex-row md:flex-col justify-between md:justify-start gap-4 md:gap-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                <div className="mb-0 md:mb-2">
                    <span className="text-gray-500 text-xs md:text-sm block uppercase tracking-wider">報價單號</span>
                    <span className="font-mono font-bold text-lg md:text-xl">{quoteId}</span>
                </div>
                <div>
                    <span className="text-gray-500 text-xs md:text-sm block uppercase tracking-wider">日期</span>
                    <span className="font-medium">{date}</span>
                </div>
            </div>
        </div>

        {/* Customer Info Input Section */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded print:bg-transparent print:border-none print:p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 print:hidden">客戶名稱 (Customer)</label>
                    <div className="flex items-center border-b border-gray-300 print:border-b-0">
                        <span className="hidden print:inline-block text-gray-600 font-bold mr-2 w-20">客戶名稱:</span>
                        <input 
                            type="text" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="請輸入客戶姓名"
                            className="flex-1 bg-transparent focus:outline-none py-1 font-bold text-lg text-gray-900 placeholder-gray-300 print:placeholder-transparent"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 print:hidden">聯絡電話 (Phone)</label>
                    <div className="flex items-center border-b border-gray-300 print:border-b-0">
                        <span className="hidden print:inline-block text-gray-600 font-bold mr-2 w-20">聯絡電話:</span>
                        <input 
                            type="text" 
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="請輸入聯絡電話"
                            className="flex-1 bg-transparent focus:outline-none py-1 font-mono text-lg text-gray-900 placeholder-gray-300 print:placeholder-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Items Container */}
        <div className="flex-grow">
            {/* Desktop & Print View: Table */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-black bg-gray-50 print:bg-transparent">
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider w-12 text-center">#</th>
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider">產品名稱 / 規格</th>
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider text-right w-32">單價</th>
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider text-center w-20">數量</th>
                        <th className="py-3 px-2 text-sm font-bold uppercase tracking-wider text-right w-32">金額</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                        <tr key={item.id} className="text-sm">
                            <td className="py-3 px-2 text-center text-gray-500 align-top">{index + 1}</td>
                            <td className="py-3 px-2 align-top">
                                <div className="font-bold text-gray-900">{item.name}</div>
                                {item.description && (
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2 print:line-clamp-none">
                                        {item.description}
                                    </div>
                                )}
                            </td>
                            <td className="py-3 px-2 text-right font-mono align-top text-gray-900">
                                {item.price.toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-center font-mono align-top text-gray-900">
                                {item.quantity}
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-bold align-top text-gray-900">
                                {(item.price * item.quantity).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {/* Empty Rows Filler for aesthetic in print */}
                    {items.length < 8 && Array.from({ length: 8 - items.length }).map((_, i) => (
                            <tr key={`empty-${i}`} className="h-12 border-b border-gray-100 print:hidden">
                            <td></td><td></td><td></td><td></td><td></td>
                            </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-black">
                        <td colSpan={3} className="pt-4 text-right font-bold text-gray-600 text-lg">總計金額 (Total):</td>
                        <td colSpan={2} className="pt-4 text-right">
                            <span className="text-3xl font-bold text-black font-mono">
                                ${totalAmount.toLocaleString()}
                            </span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {/* Remarks Section */}
        <div className="mt-6 border-t border-gray-200 pt-4 print:mt-4 print:border-t-0">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2 print:hidden">
                <Edit3 className="h-3 w-3" />
                備註事項 / 交貨指示 (Remarks)
            </label>
            <div className="hidden print:block text-xs font-bold text-gray-900 uppercase mb-1">備註事項 (Remarks):</div>
            <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="點擊此處輸入備註..."
                className="w-full min-h-[80px] bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-black rounded-xl p-3 text-sm outline-none transition-all resize-none shadow-sm print:shadow-none print:bg-transparent print:border print:border-gray-300 print:p-2 print:resize-none print:placeholder-transparent print:min-h-[60px] font-medium text-gray-900"
            />
        </div>

        {/* Footer Terms & Signatures - Dynamic Terms */}
        <div className="mt-8 pt-6 border-t-2 border-black grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-500 break-inside-avoid">
            <div>
                <h4 className="font-bold text-black mb-2 uppercase">注意事項 (Terms & Conditions)</h4>
                <ul className="list-disc list-inside space-y-1">
                    {quotationSettings.terms.map((term, idx) => (
                        <li key={idx}>{term}</li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col justify-end space-y-8">
                <div className="flex justify-between items-end border-b border-gray-400 pb-2">
                    <span className="text-gray-600 font-bold">客戶簽名 (Customer Signature):</span>
                    <span className="w-32"></span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-400 pb-2">
                     <span className="text-gray-600 font-bold">業務專員 (Sales Representative):</span>
                     <span className="w-32"></span>
                </div>
            </div>
        </div>
        
        {/* Footer Branding - Dynamic */}
        <div className="mt-8 text-center text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-2">
            {quotationSettings.footerText}
        </div>

      </div>
    </div>
  );
};

export default QuotationPreview;
