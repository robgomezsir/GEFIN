'use client';

import { useState, useEffect } from 'react';
import { calcularSaldosDoAno } from '@/utils/balances';

export function useAnnualData(ano: number) {
    const [annualData, setAnnualData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnualData = async () => {
        setLoading(true);
        try {
            const data = await calcularSaldosDoAno(ano);
            setAnnualData(data);
        } catch (err) {
            console.error('Erro ao buscar dados anuais:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnualData();
    }, [ano]);

    return { annualData, loading, refresh: fetchAnnualData };
}
