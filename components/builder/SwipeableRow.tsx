
import React, { useState, useRef } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/uiHelpers';

interface SwipeableRowProps {
    children: React.ReactNode;
    onDelete: () => void;
    onReplace: () => void;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({ children, onDelete, onReplace }) => {
    const [offsetX, setOffsetX] = useState(0);
    const startX = useRef(0);
    
    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;
        // Limit swipe distance
        if (diff > -100 && diff < 100) {
            setOffsetX(diff);
        }
    };

    const handleTouchEnd = () => {
        if (offsetX < -80) {
            triggerHaptic();
            onDelete();
        } else if (offsetX > 80) {
            triggerHaptic();
            onReplace();
        }
        setOffsetX(0);
    };

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Background Actions */}
            <div className="absolute inset-0 flex justify-between items-center px-4 rounded-xl">
                <div className={`flex items-center gap-1 font-bold text-blue-600 transition-opacity ${offsetX > 40 ? 'opacity-100' : 'opacity-0'}`}>
                    <RefreshCw className="h-5 w-5" /> 更換
                </div>
                <div className={`flex items-center gap-1 font-bold text-red-600 transition-opacity ${offsetX < -40 ? 'opacity-100' : 'opacity-0'}`}>
                    刪除 <Trash2 className="h-5 w-5" />
                </div>
            </div>
            
            {/* Foreground Content */}
            <div 
                className="bg-white relative transition-transform duration-200 ease-out rounded-xl"
                style={{ transform: `translateX(${offsetX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
};

export default SwipeableRow;
