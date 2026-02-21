'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transacao, ResumoFluxo } from '@/types';
import { MESES } from '@/utils/format';

export function useFinanceData(mes: string, ano: number) {
    const [transactions, setTransactions] = useState<Transacao[]>([]);
    const [resumo, setResumo] = useState<ResumoFluxo | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transacoes')
                .select('*')
                .eq('mes', mes.toLowerCase())
                .eq('ano', ano)
                .order('data_registro', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);

            // Fetch Resumo (from View)
            const { data: resumoData, error: resumoError } = await supabase
                .from('v_resumo_fluxo')
                .select('*')
                .eq('mes', mes.toLowerCase())
                .eq('ano', ano)
                .single();

            if (!resumoError) {
                setResumo(resumoData);
            }
        } catch (err) {
            console.error('Erro ao buscar transações:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();

        // Sincronização Realtime
        const channel = supabase
            .channel(`db-changes-${mes}-${ano}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'transacoes',
                filter: `mes=eq.${mes.toLowerCase()}`
            }, () => {
                fetchTransactions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [mes, ano]);

    const addTransaction = async (transaction: Partial<Transacao>) => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { error } = await supabase
            .from('transacoes')
            .insert({
                ...transaction,
                user_id: userData.user.id
            });

        if (error) {
            console.error('Erro ao salvar transação:', error);
            throw error;
        }
    };

    return {
        transactions,
        resumo,
        loading,
        addTransaction,
        refresh: fetchTransactions
    };
}
