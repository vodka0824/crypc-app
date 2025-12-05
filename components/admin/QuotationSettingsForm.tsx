
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { QuotationSettings } from '../../types';

const QuotationSettingsForm: React.FC = () => {
  const { quotationSettings, updateQuotationSettings } = useProducts();
  const [formData, setFormData] = useState<QuotationSettings>(quotationSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when context updates (e.g., initial fetch)
  useEffect(() => {
    setFormData(quotationSettings);
  }, [quotationSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTermChange = (index: number, value: string) => {
    const newTerms = [...formData.terms];
    newTerms[index] = value;
    setFormData(prev => ({ ...prev, terms: newTerms }));
  };

  const addTerm = () => {
    setFormData(prev => ({ ...prev, terms: [...prev.terms, ''] }));
  };

  const removeTerm = (index: number) => {
    const newTerms = formData.terms.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, terms: newTerms }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateQuotationSettings(formData);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-1">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Company Information Section */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText className="h-5 w-5" /></div>
            公司基本資料
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">公司名稱 / 抬頭</label>
              <input 
                type="text" 
                name="companyName"
                value={formData.companyName} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder="例如: 哭PC 科技有限公司"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">聯絡電話</label>
              <input 
                type="text" 
                name="companyPhone"
                value={formData.companyPhone} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">電子信箱</label>
              <input 
                type="text" 
                name="companyEmail"
                value={formData.companyEmail} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">公司地址</label>
              <input 
                type="text" 
                name="companyAddress"
                value={formData.companyAddress} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Terms & Conditions Section */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">注意事項與條款</h2>
          <div className="space-y-3">
            {formData.terms.map((term, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-none pt-3 text-gray-400 font-mono text-sm">{index + 1}.</div>
                <input 
                  type="text" 
                  value={term} 
                  onChange={(e) => handleTermChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  placeholder="輸入條款內容..."
                />
                <button 
                  type="button" 
                  onClick={() => removeTerm(index)}
                  className="flex-none p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={addTerm}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" /> 新增條款
            </button>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">頁尾文字</h2>
          <input 
            type="text" 
            name="footerText"
            value={formData.footerText} 
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors"
            placeholder="例如: Powered by CryPC System"
          />
        </div>

        <div className="sticky bottom-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isSaving ? '儲存中...' : '儲存設定'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default QuotationSettingsForm;
