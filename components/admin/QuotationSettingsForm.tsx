
// components/admin/QuotationSettingsForm.tsx
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, FileText, Loader2, ChevronDown, Info, AlignLeft } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { QuotationSettings } from '../../types';

// Reusable Accordion Component
const SettingsSection = ({ 
    title, 
    icon: Icon, 
    isOpen, 
    onToggle, 
    children 
}: { 
    title: string, 
    icon: any, 
    isOpen: boolean, 
    onToggle: () => void, 
    children: React.ReactNode 
}) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
            <button 
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-gray-900">{title}</span>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="p-5 pt-0 animate-fade-in border-t border-gray-50">
                    <div className="pt-5">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

const QuotationSettingsForm: React.FC = () => {
  const { quotationSettings, updateQuotationSettings } = useProducts();
  const [formData, setFormData] = useState<QuotationSettings>(quotationSettings);
  const [isSaving, setIsSaving] = useState(false);
  
  // Accordion state
  const [openSections, setOpenSections] = useState({
      company: true,
      terms: false,
      footer: false
  });

  // Sync state when context updates
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

  const toggleSection = (section: keyof typeof openSections) => {
      setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="max-w-3xl mx-auto p-1 pb-24">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Company Information Section */}
        <SettingsSection 
            title="公司基本資料" 
            icon={FileText} 
            isOpen={openSections.company} 
            onToggle={() => toggleSection('company')}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">公司名稱 / 抬頭</label>
                    <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors text-sm font-medium"
                        placeholder="例如: 哭PC 科技有限公司"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">聯絡電話</label>
                    <input 
                        type="text" 
                        name="companyPhone"
                        value={formData.companyPhone} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors text-sm font-medium"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">電子信箱</label>
                    <input 
                        type="text" 
                        name="companyEmail"
                        value={formData.companyEmail} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors text-sm font-medium"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">公司地址</label>
                    <input 
                        type="text" 
                        name="companyAddress"
                        value={formData.companyAddress} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors text-sm font-medium"
                    />
                </div>
            </div>
        </SettingsSection>

        {/* Terms & Conditions Section */}
        <SettingsSection 
            title="注意事項與條款" 
            icon={Info} 
            isOpen={openSections.terms} 
            onToggle={() => toggleSection('terms')}
        >
            <div className="space-y-3">
                {formData.terms.map((term, index) => (
                    <div key={index} className="flex gap-2 items-start">
                        <span className="flex-none pt-3 text-gray-400 font-mono text-xs w-6 text-center">{index + 1}.</span>
                        <input 
                            type="text" 
                            value={term} 
                            onChange={(e) => handleTermChange(index, e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors text-sm font-medium"
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
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100"
                >
                    <Plus className="h-4 w-4" /> 新增條款
                </button>
            </div>
        </SettingsSection>

        {/* Footer Section */}
        <SettingsSection 
            title="頁尾文字" 
            icon={AlignLeft} 
            isOpen={openSections.footer} 
            onToggle={() => toggleSection('footer')}
        >
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">自訂頁尾內容</label>
                <input 
                    type="text" 
                    name="footerText"
                    value={formData.footerText} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors text-sm font-medium"
                    placeholder="例如: Powered by CryPC System"
                />
            </div>
        </SettingsSection>

        {/* Fixed Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40 md:static md:bg-transparent md:border-0 md:p-0 md:flex md:justify-end safe-area-bottom">
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full md:w-auto px-8 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isSaving ? '儲存中...' : '儲存所有設定'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default QuotationSettingsForm;
