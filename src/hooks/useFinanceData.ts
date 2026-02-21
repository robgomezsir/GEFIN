'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transacao, ResumoFluxo } from '@/types';
import { MESES } from '@/utils/format';

export function useFinanceData(mes: string, ano: number) {
    const [transactions, setTransactions] = useState<Transacao[]>([]);
    const [resumo, setResumo] = useState<ResumoFluxo | null>(null);
    const [saldoTotal, setSaldoTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        setLoading(true);
        // Reset states to avoid showing data from previous period
        setTransactions([]);
        setResumo(null);

        try {
            const { data: authData } = await supabase.auth.getUser();
            if (!authData.user) return;

            const { data, error } = await supabase
                .from('transacoes')
                .select('*')
                .eq('user_id', authData.user.id)
                .eq('mes', mes.toLowerCase())
                .eq('ano', ano)
                .order('data_registro', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);

            // Fetch Resumo (from View)
            const { data: resumoData, error: resumoError } = await supabase
                .from('v_resumo_fluxo')
                .select('*')
                .eq('user_id', authData.user.id)
                .eq('mes', mes.toLowerCase())
                .eq('ano', ano)
                .maybeSingle(); // Usar maybeSingle para não disparar erro se não encontrar nada

            if (!resumoError) {
                setResumo(resumoData);
            }

            // Calcular Saldo acumulado TOTAL do usuário
            const { data: totalData } = await supabase
                .from('transacoes')
                .select('tipo, valor, conta')
                .eq('user_id', authData.user.id);

            if (totalData) {
                const total = totalData.reduce((acc, current) => {
                    if (current.tipo === 'Receita') return acc + Number(current.valor);
                    return acc - Number(current.valor);
                }, 0);
                setSaldoTotal(total);
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

    const updateTransaction = async (id: number, updates: Partial<Transacao>) => {
        const { error } = await supabase
            .from('transacoes')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar transação:', error);
            throw error;
        }
    };

    const deleteTransaction = async (id: number) => {
        const { error } = await supabase
            .from('transacoes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir transação:', error);
            throw error;
        }
    };

    return {
        transactions,
        resumo,
        saldoTotal,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refresh: fetchTransactions
    };
}
