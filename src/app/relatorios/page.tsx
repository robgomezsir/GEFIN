'use client';

import * as React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Reports } from "@/components/features/Reports";
import { useFinanceData } from "@/hooks/useFinanceData";
import { MESES } from "@/utils/format";

import { useDate } from "@/context/DateContext";

export default function ReportsPage() {
    const { currentMonth, currentYear, handlePrevMonth, handleNextMonth } = useDate();
    const mesNome = MESES[currentMonth];

    const {
        transactions,
        resumo,
        saldoAnterior,
        loading
    } = useFinanceData(mesNome, currentYear);

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
