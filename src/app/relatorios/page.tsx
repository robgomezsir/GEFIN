'use client';

import * as React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Reports } from "@/components/features/Reports";
import { useFinanceData } from "@/hooks/useFinanceData";
import { MESES } from "@/utils/format";

export default function ReportsPage() {
    const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

    const mesNome = MESES[currentMonth];
    const {
        transactions,
        resumo,
        saldoAnterior,
        loading
    } = useFinanceData(mesNome, currentYear);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    return (
        <PageLayout>
            <div className="animate-in fade-in duration-500">
                <Reports
                    transactions={transactions}
                    resumo={resumo}
                    saldoAnterior={saldoAnterior}
                    mes={mesNome}
                    ano={currentYear}
                    onBack={() => window.location.href = '/'}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                />
            </div>
        </PageLayout>
    );
}
