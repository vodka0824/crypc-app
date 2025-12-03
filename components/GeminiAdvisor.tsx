import React, { useState } from 'react';
import { getPCRecommendation } from '../services/geminiService';
import { Sparkles, Send, Loader2 } from 'lucide-react';

const GeminiAdvisor: React.FC = () => {
  const [budget, setBudget] = useState('');
  const [usage, setUsage] = useState('');
  const [preferences, setPreferences] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await getPCRecommendation(budget, usage, preferences);
    setRecommendation(result);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI 智能配置顧問</h2>
          <p className="text-gray-500 text-sm">輸入您的需求，立即獲得專業建議</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">您的預算 (TWD)</label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="例如：40000"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">主要用途</label>
            <input
              type="text"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              placeholder="例如：3A遊戲大作、影片剪輯、文書處理"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">特別偏好 (選填)</label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="例如：白色系、RGB燈效、靜音機殼"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 transition-colors"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {loading ? 'AI 思考中...' : '產生配置建議'}
          </button>
        </form>

        <div className="bg-gray-50 rounded-2xl p-6 min-h-[300px] border border-gray-100 relative">
          {recommendation ? (
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line">
              {recommendation}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Sparkles className="h-10 w-10 mb-2 opacity-20" />
              <p>建議清單將顯示於此</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiAdvisor;