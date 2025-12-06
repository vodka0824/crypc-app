
import React, { useEffect, useState, useRef } from 'react';
import { StickyNote, Sparkles, Box, FolderOpen, Save, Share2, RotateCcw, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CartItem, Category } from '../../types';
import { categoryDisplayMap } from '../../data/mockData';
import InstallmentCalculator from './InstallmentCalculator';

// --- Helper: CountUp Animation Component ---
const CountUp = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        const start = displayValue;
        const end = value;
        if (start === end) return;

        const duration = 800; // ms
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (Out Quart)
            const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
            const ease = easeOutQuart(progress);

            const current = Math.floor(start + (end - start) * ease);
            setDisplayValue(current);

            if (progress < 1) {
                intervalRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(end);
            }
        };

        intervalRef.current = requestAnimationFrame(animate);
        return () => {
            if (intervalRef.current) cancelAnimationFrame(intervalRef.current);
        };
    }, [value]);

    return <span className="tabular-nums tracking-tight">{displayValue.toLocaleString()}</span>;
};

// --- Helper: Circular TDP Gauge Component ---
const TdpGauge = ({ current, max, recommended }: { current: number, max: number, recommended: number }) => {
    const hasPsu = max > 0;
    // If no PSU, show load relative to recommended wattage for context
    const limit = hasPsu ? max : recommended; 
    const percentage = Math.min((current / limit) * 100, 100);
    
    // Color Logic
    let colorClass = "text-green-500";
    let strokeColor = "#22c55e"; // Green
    if (percentage > 90) {
        colorClass = "text-red-500";
        strokeColor = "#ef4444"; // Red
    } else if (percentage > 75) {
        colorClass = "text-yellow-500";
        strokeColor = "#eab308"; // Yellow
    }

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-20 h-20">
            {/* SVG Gauge */}
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 72 72">
                {/* Track */}
                <circle cx="36" cy="36" r={radius} stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
                {/* Progress */}
                <circle 
                    cx="36" 
                    cy="36" 
                    r={radius} 
                    stroke={strokeColor} 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-xs font-bold ${colorClass}`}>{Math.round(percentage)}%</div>
                <Zap className={`h-3 w-3 ${colorClass} opacity-80`} />
            </div>
        </div>
    );
};

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
    return (
        <div className="sticky top-24 self-start bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white p-6 max-h-[calc(100vh-120px)] flex flex-col transition-all duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <StickyNote className="h-5 w-5" /> 
                    <span>配置摘要</span>
                </h2>
                <button 
                    onClick={onAiOpen} 
                    className="group relative px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles className="h-3 w-3 text-yellow-300 relative z-10" />
                    <span className="relative z-10">AI 診斷</span>
                </button>
            </div>

            {/* Dashboard Card */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 relative overflow-hidden group">
                <div className="flex items-center justify-between relative z-10">
                    {/* Price Section */}
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">預估總金額</div>
                        <div className="text-4xl font-black text-gray-900 tracking-tighter">
                            <span className="text-lg align-top mr-1 text-gray-400 font-medium">$</span>
                            <CountUp value={totalPrice} />
                        </div>
                    </div>

                    {/* Gauge Section */}
                    <div className="flex flex-col items-center">
                        {totalTDP > 0 ? (
                            <TdpGauge 
                                current={totalTDP} 
                                max={currentPsuWattage} 
                                recommended={recommendedPsuWattage} 
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center">
                                <span className="text-gray-300 text-xs">TDP</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Power Info Footer */}
                {totalTDP > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200/60 flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                            <span className="text-gray-400 font-medium">系統功耗</span>
                            <span className="font-bold text-gray-700">{totalTDP}W</span>
                        </div>
                        <div className="text-right flex flex-col">
                            <span className="text-gray-400 font-medium">建議電源</span>
                            <span className={`font-bold ${currentPsuWattage >= recommendedPsuWattage ? 'text-green-600' : 'text-orange-500'}`}>
                                {currentPsuWattage > 0 ? `${currentPsuWattage}W` : '未選購'} 
                                <span className="text-gray-400 font-normal"> / {recommendedPsuWattage}W+</span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Installment (Collapsible-ish feel) */}
            <div className="mb-6">
                <InstallmentCalculator totalPrice={totalPrice} />
            </div>

            {/* Receipt Style Item List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-0.5 mb-6 relative">
                 {/* Receipt Top Border Decoration (Optional) */}
                 <div className="sticky top-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                 
                {cartItems.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                        <Box className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <span className="text-gray-400 text-xs font-medium">清單是空的</span>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="group flex justify-between items-baseline text-sm py-2 hover:bg-gray-50 px-2 rounded-lg transition-colors cursor-default">
                            <div className="flex-1 min-w-0 pr-3">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded uppercase tracking-wider min-w-[30px] text-center">
                                        {categoryDisplayMap[item.category]?.split(' ')[0] || '其它'}
                                    </span>
                                    <span className="font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-medium">x{item.quantity}</span>
                                <span className="font-mono font-bold text-gray-900 w-16 text-right">
                                    ${(item.price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                 <div className="sticky bottom-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-4 gap-2 flex-shrink-0 pt-4 border-t border-gray-100">
                <button onClick={() => onTemplateOpen('load')} className="col-span-1 flex flex-col items-center justify-center py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black transition-all active:scale-95 group">
                    <FolderOpen className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">載入</span>
                </button>
                <button onClick={() => onTemplateOpen('save')} className="col-span-1 flex flex-col items-center justify-center py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black transition-all active:scale-95 group">
                    <Save className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">儲存</span>
                </button>
                <button onClick={onShare} className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-all active:scale-95 shadow-md">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-bold">分享清單</span>
                </button>
                <button onClick={onReset} className="col-span-4 mt-1 py-2 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <RotateCcw className="h-3 w-3" /> 清空重選
                </button>
            </div>
        </div>
    );
};

export default BuilderSummary;
