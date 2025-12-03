import React, { useState, useEffect } from 'react';
import { X, Printer, Monitor, ArrowLeft, ArrowRight, Edit3 } from 'lucide-react';
import { CartItem } from '../types';

interface QuotationPreviewProps {
  items: CartItem[];
  onClose: () => void;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ items, onClose }) => {
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
      {/* Mobile: w-full, less padding. Desktop: max-w-[210mm], A4 height mimic */}
      <div className="bg-white text-black w-full md:max-w-[210mm] min-h-[297mm] mx-auto mt-[72px] md:my-20 p-5 md:p-12 shadow-2xl print:shadow-none print:m-0 print:w-full print:max-w-none print:h-auto rounded-none md:rounded-sm flex flex-col relative animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-black pb-6 mb-6 md:mb-8 gap-6 md:gap-0">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">哭PC 電腦估價單</h1>
                <p className="text-sm text-gray-600">CryPC Technology Co., Ltd.</p>
                <p className="text-sm text-gray-600">台北市中正區數位大道 101 號</p>
                <p className="text-sm text-gray-600">Tel: 0800-888-999 | Email: service@crypc.com</p>
            </div>
            <div className="w-full md:w-auto text-left md:text-right flex flex-row md:flex-col justify-between md:justify-start gap-4 md:gap-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                <div className="mb-0 md:mb-2">
                    <span className="text-gray-500 text-xs md:text-sm block uppercase tracking-wider">報價單號 (ID)</span>
                    <span className="font-mono font-bold text-lg md:text-xl">{quoteId}</span>
                </div>
                <div>
                    <span className="text-gray-500 text-xs md:text-sm block uppercase tracking-wider">日期 (Date)</span>
                    <span className="font-medium">{date}</span>
                </div>
            </div>
        </div>

        {/* Customer Info Input Section */}
        <div className="mb-6 md:mb-8 p-4 bg-gray-50 border border-gray-200 rounded print:bg-transparent print:border-none print:p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 print:hidden">客戶名稱 (Customer Name)</label>
                    <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="請輸入客戶姓名"
                        className="w-full bg-transparent border-b border-gray-300 focus:border-black outline-none py-1 font-bold text-lg text-gray-900 placeholder-gray-300 print:placeholder-transparent"
                    />
                     <span className="hidden print:block text-xs text-gray-500 mt-1">客戶名稱</span>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 print:hidden">聯絡電話 (Phone)</label>
                    <input 
                        type="text" 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="請輸入聯絡電話"
                        className="w-full bg-transparent border-b border-gray-300 focus:border-black outline-none py-1 font-mono text-lg text-gray-900 placeholder-gray-300 print:placeholder-transparent"
                    />
                    <span className="hidden print:block text-xs text-gray-500 mt-1">聯絡電話</span>
                </div>
            </div>
        </div>

        {/* Items Container */}
        <div className="flex-grow">
            
            {/* Mobile View: Card List (Hidden on Desktop & Print) */}
            <div className="md:hidden print:hidden space-y-4 mb-6">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-2">購買項目</div>
                {items.map((item, index) => (
                    <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-gray-900 line-clamp-2 w-2/3">{item.name}</span>
                            <span className="font-mono font-bold text-sm text-black">
                                ${(item.price * item.quantity).toLocaleString()}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2 line-clamp-1">{item.description}</div>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs text-gray-600 font-mono">
                            <span>單價: ${item.price.toLocaleString()}</span>
                            <span className="font-bold bg-white px-2 py-0.5 rounded border border-gray-200">x {item.quantity}</span>
                        </div>
                    </div>
                ))}
                
                {/* Mobile Total */}
                <div className="bg-black text-white p-4 rounded-xl flex justify-between items-center mt-4">
                     <span className="font-bold">總計金額</span>
                     <span className="font-mono text-xl font-bold">${totalAmount.toLocaleString()}</span>
                </div>
            </div>

            {/* Desktop & Print View: Table */}
            <div className="hidden md:block print:block">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-3 text-sm font-bold uppercase tracking-wider w-12 text-center">#</th>
                            <th className="py-3 text-sm font-bold uppercase tracking-wider">產品名稱 (Product)</th>
                            <th className="py-3 text-sm font-bold uppercase tracking-wider text-right w-32">單價</th>
                            <th className="py-3 text-sm font-bold uppercase tracking-wider text-center w-20">數量</th>
                            <th className="py-3 text-sm font-bold uppercase tracking-wider text-right w-32">金額</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.map((item, index) => (
                            <tr key={item.id} className="text-sm">
                                <td className="py-3 text-center text-gray-500 align-top">{index + 1}</td>
                                <td className="py-3 align-top pr-2">
                                    <div className="font-bold text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.description}
                                    </div>
                                </td>
                                <td className="py-3 text-right font-mono align-top text-gray-900">
                                    {item.price.toLocaleString()}
                                </td>
                                <td className="py-3 text-center font-mono align-top text-gray-900">
                                    {item.quantity}
                                </td>
                                <td className="py-3 text-right font-mono font-bold align-top text-gray-900">
                                    {(item.price * item.quantity).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {/* Empty Rows Filler for aesthetic in print */}
                        {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                             <tr key={`empty-${i}`} className="h-12 border-b border-gray-100 print:hidden">
                                <td></td><td></td><td></td><td></td><td></td>
                             </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-black">
                            <td colSpan={3} className="pt-4 text-right font-bold text-gray-600">總計金額 (Total):</td>
                            <td colSpan={2} className="pt-4 text-right">
                                <span className="text-3xl font-bold text-black font-mono">
                                    {totalAmount.toLocaleString()}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        {/* Remarks Section */}
        <div className="mt-6 md:mt-8 border-t md:border-t-0 border-gray-200 pt-6 md:pt-2 print:mt-6 print:border-none">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2 print:hidden">
                <Edit3 className="h-3 w-3" />
                備註事項 / 交貨指示 (Remarks)
            </label>
            <div className="hidden print:block text-xs font-bold text-gray-500 uppercase mb-2">備註事項 (Remarks)</div>
            <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="點擊此處輸入備註..."
                className="w-full min-h-[100px] bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-black rounded-xl p-4 text-sm outline-none transition-all resize-none shadow-sm print:shadow-none print:bg-transparent print:border-none print:p-0 print:resize-none print:placeholder-transparent print:min-h-[auto] font-medium text-gray-900"
            />
        </div>

        {/* Footer Terms */}
        <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-500 break-inside-avoid">
            <div>
                <h4 className="font-bold text-black mb-2 uppercase">注意事項 (Terms & Conditions)</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li>本報價單有效期限為 7 天。</li>
                    <li>產品價格可能因市場波動而調整，以實際下單當日為準。</li>
                    <li>自備零件組裝費另計，軟體安裝僅提供正版授權安裝服務。</li>
                    <li>如遇缺貨，本公司保留更換同級產品之權利。</li>
                </ul>
            </div>
            <div className="flex flex-col justify-end">
                <div className="border-b border-gray-400 pb-2 mb-8 md:mb-2 mt-4 md:mt-0">
                    <span className="text-gray-400">客戶簽名 (Customer Signature):</span>
                </div>
                <div className="h-0 md:h-10"></div>
                <div className="border-b border-gray-400 pb-2 mb-2">
                     <span className="text-gray-400">業務專員 (Sales Representative):</span>
                </div>
            </div>
        </div>
        
        {/* Footer Branding */}
        <div className="mt-8 text-center text-xs text-gray-300 font-mono">
            Powered by CryPC Quotation System
        </div>

      </div>
    </div>
  );
};

export default QuotationPreview;