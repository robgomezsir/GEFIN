'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transacao, ResumoFluxo } from '@/types';
import { MESES } from '@/utils/format';

export function useFinanceData(mes: string, ano: number) {
    const [transactions, setTransactions] = useState<Transacao[]>([]);
    const [resumo, setResumo] = useState<ResumoFluxo | null>(null);
    const [saldoTotal, setSaldoTotal] = useState(0);
    const [saldoAnterior, setSaldoAnterior] = useState(0);
    const [rendaPrevista, setRendaPrevista] = useState(0);
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

            // Calcular Saldo acumulado TOTAL do usuário e SALDO ANTERIOR
            const { data: totalData } = await supabase
                .from('transacoes')
                .select('tipo, valor, mes, ano')
                .eq('user_id', authData.user.id);

            if (totalData) {
                let total = 0;
                let anterior = 0;
                const currentMonthIndex = MESES.indexOf(mes.toLowerCase()); // Ensure current month is lowercase for comparison

                totalData.forEach(t => {
                    const val = Number(t.valor);
                    const isReceita = t.tipo === 'Receita';
                    // Normalizar para minúsculas antes de buscar o índice
                    const tMonthIndex = MESES.indexOf(t.mes.toLowerCase());

                    // Saldo Total (Até hoje)
                    if (isReceita) total += val;
                    else total -= val;

                    // Saldo Anterior (Antes do mês/ano selecionado)
                    // Só conta se o ano for menor OU (se for o mesmo ano E o mês for realmente anterior)
                    if (t.ano < ano || (t.ano === ano && tMonthIndex !== -1 && tMonthIndex < currentMonthIndex)) {
                        if (isReceita) anterior += val;
                        else anterior -= val;
                    }
                });

                setSaldoTotal(total);
                setSaldoAnterior(anterior);
            }

            // Buscar Renda Prevista (Meta)
            const { data: configData } = await supabase
                .from('configuracoes')
                .select('valor')
                .eq('user_id', authData.user.id)
                .eq('chave', 'renda_prevista')
                .single();

            if (configData) setRendaPrevista(Number(configData.valor));
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

        // Forçar atualização imediata para feedback instantâneo na UI
        fetchTransactions();
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

        // Forçar atualização imediata para feedback instantâneo na UI
        fetchTransactions();
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

        // Forçar atualização imediata para feedback instantâneo na UI
        fetchTransactions();
    };

    return {
        transactions,
        resumo,
        saldoTotal,
        saldoAnterior,
        rendaPrevista,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refresh: fetchTransactions
    };
}
