import * as React from 'react';
import { Card } from '@/components/ui/base';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft, Plus } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: number;
    type: 'receita' | 'despesa' | 'fluxo' | 'saldo';
    className?: string;
}

const icons = {
    receita: <TrendingUp className="text-emerald-500" size={24} />,
    despesa: <TrendingDown className="text-rose-500" size={24} />,
    fluxo: <ArrowRightLeft className="text-blue-500" size={24} />,
    saldo: <Wallet className="text-violet-500" size={24} />,
};

const colors = {
    receita: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5",
    despesa: "border-rose-200 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-500/5",
    fluxo: "border-blue-200 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/5",
    saldo: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/5",
};

export const SummaryCard = ({ title, value, type, className }: SummaryCardProps) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <Card
            className={cn(
                "relative overflow-hidden border-2 transition-all duration-300 cursor-pointer select-none",
                colors[type],
                isExpanded ? "min-w-[200px]" : "min-w-[140px]",
                className
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex flex-col items-center justify-center py-2 text-center">
                <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800 transition-transform duration-300",
                    isExpanded && "scale-90"
                )}>
                    {icons[type]}
                </div>

                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 capitalize tracking-wider">
                    {title}
                </p>

                <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                )}>
                    <div className="overflow-hidden">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {formatCurrency(value)}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Indicação visual de que é expansível */}
            {!isExpanded && (
                <div className="absolute top-1 right-1 opacity-20">
                    <Plus size={12} className="text-slate-400" />
                </div>
            )}

            {/* Decorative background element */}
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                {React.cloneElement(icons[type] as React.ReactElement<any>, { size: 60 })}
            </div>
        </Card>
    );
};
