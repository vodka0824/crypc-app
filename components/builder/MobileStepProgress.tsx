
import React from 'react';
import { Category, CartItem } from '../../types';

interface MobileStepProgressProps {
    cartItems: CartItem[];
}

const MobileStepProgress: React.FC<MobileStepProgressProps> = ({ cartItems }) => {
    const hasCategory = (cat: Category) => cartItems.some(i => i.category === cat);
    
    // Ordered specifically for the assembly flow
    const steps = [
        { label: '處理器', category: Category.CPU },
        { label: '記憶體', category: Category.RAM },
        { label: '主機板', category: Category.MB },
        { label: '儲存', category: Category.SSD },
        { label: '顯卡', category: Category.GPU },
        { label: '電源', category: Category.PSU },
        { label: '機殼', category: Category.CASE },
    ];

    const activeStepsCount = steps.filter(s => hasCategory(s.category)).length;

    return (
        <div className="md:hidden flex justify-between items-center px-4 py-3 bg-white border-b border-gray-100 sticky top-16 z-20 overflow-x-auto hide-scrollbar">
            {steps.map((step, idx) => {
                const isActive = hasCategory(step.category);
                return (
                    <div key={idx} className="flex flex-col items-center gap-1 min-w-[3.5rem] flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 border-2 ${isActive ? 'bg-black border-black scale-110' : 'bg-white border-gray-300'}`} />
                        <span className={`text-[10px] font-bold ${isActive ? 'text-black' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                );
            })}
            {/* Progress Line Background */}
            <div className="absolute top-[20px] left-8 right-8 h-[2px] bg-gray-100 -z-10" />
            {/* Active Progress Line */}
            <div 
                className="absolute top-[20px] left-8 h-[2px] bg-black -z-10 transition-all duration-500" 
                style={{ width: `calc(${(activeStepsCount > 0 ? (activeStepsCount - 1) : 0) / (steps.length - 1)} * (100% - 4rem))` }} 
            />
        </div>
    );
};

export default MobileStepProgress;
