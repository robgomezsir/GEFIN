import * as React from 'react';
import { Card } from '@/components/ui/base';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft, Plus, Target } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: number;
    type: 'receita' | 'despesa' | 'fluxo' | 'saldo' | 'disponibilidade';
    percent?: number;
    className?: string;
}

const icons = {
    receita: <TrendingUp className="text-emerald-500" size={24} />,
    despesa: <TrendingDown className="text-rose-500" size={24} />,
    fluxo: <ArrowRightLeft className="text-blue-500" size={24} />,
    saldo: <Wallet className="text-violet-500" size={24} />,
    disponibilidade: <Target className="text-indigo-500" size={24} />,
};

const colors = {
    receita: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5",
    despesa: "border-rose-200 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-500/5",
    fluxo: "border-blue-200 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/5",
    saldo: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/5",
    disponibilidade: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/5",
};

export const SummaryCard = ({ title, value, type, percent, className }: SummaryCardProps) => {
    return (
        <Card
            className={cn(
                "relative overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-300 shadow-sm",
                "bg-white dark:bg-slate-900",
                className
            )}
        >
            <div className="flex flex-col p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {title}
                    </p>
                    <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 transition-transform duration-300",
                    )}>
                        {React.cloneElement(icons[type] as React.ReactElement<any>, { size: 18 })}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h3 className={cn(
                        "text-lg font-black tracking-tight",
                        type === 'receita' ? "text-emerald-600" : 
                        type === 'despesa' ? "text-rose-600" : 
                        type === 'fluxo' ? "text-blue-600" : 
                        "text-slate-900 dark:text-white"
                    )}>
                        {type === 'disponibilidade' && percent !== undefined ? `${percent.toFixed(0)}%` : formatCurrency(value)}
                    </h3>

                    {type === 'disponibilidade' && percent !== undefined && (
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    percent > 20 ? "bg-indigo-500" : "bg-rose-500"
                                )}
                                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] pointer-events-none">
                {React.cloneElement(icons[type] as React.ReactElement<any>, { size: 48 })}
            </div>
        </Card>
    );
};
