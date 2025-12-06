
import React from 'react';
import { StickyNote, Sparkles, Box, FolderOpen, Save, Share2, RotateCcw } from 'lucide-react';
import { CartItem, Category } from '../../types';
import { categoryDisplayMap } from '../../data/mockData';
import InstallmentCalculator from './InstallmentCalculator';

interface BuilderSummaryProps {
    cartItems: CartItem[];
    totalPrice: number;
    totalTDP: number;
    currentPsuWattage: number;
    recommendedPsuWattage: number;
    onAiOpen: () => void;
    onTemplateOpen: (mode: 'save' | 'load') => void;
    onShare: () => void;
    onReset: () => void;
}

const BuilderSummary: React.FC<BuilderSummaryProps> = ({
    cartItems,
    totalPrice,
    totalTDP,
    currentPsuWattage,
    recommendedPsuWattage,
    onAiOpen,
    onTemplateOpen,
    onShare,
    onReset
}) => {
    const wattagePercentage = currentPsuWattage > 0 ? (totalTDP / currentPsuWattage) * 100 : (totalTDP / recommendedPsuWattage) * 100;
    const wattageColor = wattagePercentage > 90 ? 'bg-red-500 shadow-red-200' : wattagePercentage > 70 ? 'bg-yellow-500 shadow-yellow-200' : 'bg-green-500 shadow-green-200';

    return (
        <div className="sticky top-24 self-start bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 max-h-[calc(100vh-120px)] flex flex-col overflow-y-auto custom-scrollbar supports-[backdrop-filter]:bg-white/60">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100/50 flex-shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900"><StickyNote className="h-5 w-5" /> 估價單摘要</h2>
                <button onClick={onAiOpen} className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-1.5 shadow-lg shadow-gray-200 active:scale-95"><Sparkles className="h-3 w-3 text-yellow-300" /> AI 配單</button>
            </div>

            <div className="flex-shrink-0 mb-6 bg-white/50 rounded-2xl p-5 border border-white shadow-inner text-center">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">預估總金額</div>
                <div className="text-4xl font-extrabold text-black tabular-nums tracking-tight">${totalPrice.toLocaleString()}</div>
                {totalTDP > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200/50">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5"><span>功耗負載</span><span>{totalTDP}W / {currentPsuWattage > 0 ? currentPsuWattage + 'W' : '未選電源'}</span></div>
                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner"><div className={`h-full transition-all duration-500 shadow-lg ${wattageColor}`} style={{ width: `${Math.min(wattagePercentage, 100)}%` }} /></div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400"><span>建議配置: {recommendedPsuWattage}W+</span>{currentPsuWattage > 0 && <span>(負載 {Math.round(wattagePercentage)}%)</span>}</div>
                    </div>
                )}
            </div>

            <InstallmentCalculator totalPrice={totalPrice} />

            <div className="space-y-3 mb-6 flex-1 pr-2 mt-6">
                {cartItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm bg-gray-50/50 rounded-xl border border-dashed border-gray-200">尚未選擇任何零件</div>
                ) : (
                    cartItems.map(item => {
                        return (
                            <div key={item.id} className="flex justify-between items-start text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0 group">
                                <div className="flex-1 pr-4 flex gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden relative shadow-sm">
                                        {item.image ? (
                                            <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                        ) : (
                                            <Box className="h-4 w-4 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block mb-1 mr-1">{categoryDisplayMap[item.category]?.split(' ')[0] || '其它'}</span>
                                        <span className="text-gray-800 font-bold line-clamp-1 block">{item.name}</span>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-gray-900 text-xs mt-1 whitespace-nowrap">${(item.price * item.quantity).toLocaleString()}</div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                <button onClick={() => onTemplateOpen('load')} className="px-3 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"><FolderOpen className="h-4 w-4" /> 載入</button>
                <button onClick={() => onTemplateOpen('save')} className="px-3 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"><Save className="h-4 w-4" /> 儲存</button>
                <button onClick={onShare} className="px-3 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"><Share2 className="h-4 w-4" /> 分享</button>
                <button onClick={onReset} className="px-3 py-2.5 text-sm font-bold text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"><RotateCcw className="h-4 w-4" /> 清空</button>
            </div>
        </div>
    );
};

export default BuilderSummary;
