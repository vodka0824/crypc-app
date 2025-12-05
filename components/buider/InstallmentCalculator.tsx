
import React, { useState } from 'react';
import { CreditCard, Banknote } from 'lucide-react';

interface InstallmentCalculatorProps {
  totalPrice: number;
}

const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({ totalPrice }) => {
    const [mode, setMode] = useState<'credit' | 'cardless'>('credit');

    if (totalPrice === 0) return null;

    const calculateCreditCard = (price: number, periods: number, rateHigh: number, rateLow: number) => {
        const thresholdCheck = (price * 0.0249) > 498;
        let total = 0;
        if (thresholdCheck) {
            total = price * rateHigh + 498;
        } else {
            total = price * rateLow;
        }
        total = Math.round(total);
        const monthly = Math.round(total / periods);
        return { total, monthly };
    };

    const calculateCardless = (price: number, periods: number, factor: number) => {
        const step1 = Math.ceil(price / factor);
        const monthly = Math.ceil(step1 / periods);
        const total = monthly * periods;
        return { total, monthly };
    };

    const creditRows = [
        { periods: 3, ...calculateCreditCard(totalPrice, 3, 1.03, 1.0549) },
        { periods: 6, ...calculateCreditCard(totalPrice, 6, 1.035, 1.0599) },
        { periods: 12, ...calculateCreditCard(totalPrice, 12, 1.06, 1.0849) },
        { periods: 24, ...calculateCreditCard(totalPrice, 24, 1.06, 1.0849) },
    ];

    const cardlessRows = [
        { periods: 6, ...calculateCardless(totalPrice, 6, 0.9551) },
        { periods: 9, ...calculateCardless(totalPrice, 9, 0.9391) },
        { periods: 12, ...calculateCardless(totalPrice, 12, 0.92218) },
        { periods: 15, ...calculateCardless(totalPrice, 15, 0.905) },
        { periods: 18, ...calculateCardless(totalPrice, 18, 0.885) },
        { periods: 21, ...calculateCardless(totalPrice, 21, 0.8735) },
        { periods: 24, ...calculateCardless(totalPrice, 24, 0.8624) },
        { periods: 30, ...calculateCardless(totalPrice, 30, 0.83333) },
    ];

    const activeRows = mode === 'credit' ? creditRows : cardlessRows;

    return (
        <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
                <button 
                    onClick={() => setMode('credit')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'credit' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                >
                    <CreditCard className="h-3.5 w-3.5" /> 刷卡分期
                </button>
                <button 
                    onClick={() => setMode('cardless')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'cardless' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                >
                    <Banknote className="h-3.5 w-3.5" /> 無卡分期
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                        <tr>
                            <th className="py-2 pl-4 text-left">期數</th>
                            <th className="py-2 text-right">每期金額</th>
                            <th className="py-2 pr-4 text-right text-gray-400">總價</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {activeRows.map((row) => (
                            <tr key={row.periods} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-2.5 pl-4 font-bold text-gray-700">
                                    {row.periods} 期
                                </td>
                                <td className="py-2.5 text-right font-bold text-black font-mono text-base">
                                    ${row.monthly.toLocaleString()}
                                </td>
                                <td className="py-2.5 pr-4 text-right text-gray-400 text-xs font-mono">
                                    ${row.total.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
                * 試算金額僅供參考，實際分期利率與總額以{mode === 'credit' ? '銀行' : '審核'}結果為準。
            </p>
        </div>
    );
};

export default InstallmentCalculator;
