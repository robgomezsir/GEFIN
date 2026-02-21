import * as React from 'react';
import { Card } from '@/components/ui/base';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from 'lucide-react';

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
    receita: "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10",
    despesa: "border-rose-100 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-900/10",
    fluxo: "border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10",
    saldo: "border-violet-100 bg-violet-50/50 dark:border-violet-900/30 dark:bg-violet-900/10",
};

export const SummaryCard = ({ title, value, type, className }: SummaryCardProps) => {
    return (
        <Card className={cn("relative overflow-hidden border-2", colors[type], className)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
                        {title}
                    </p>
                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {formatCurrency(value)}
                    </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                    {icons[type]}
                </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-4 -bottom-4 opacity-10">
                {React.cloneElement(icons[type] as React.ReactElement<any>, { size: 80 })}
            </div>
        </Card>
    );
};
