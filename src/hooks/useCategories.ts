'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [incomeTypes, setIncomeTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setLoading(true);
        try {
            const { data: catData, error: catError } = await supabase
                .from('categorias_despesa')
                .select('*')
                .eq('user_id', user.id)
                .order('nome');

            const { data: incData, error: incError } = await supabase
                .from('tipos_receita')
                .select('*')
                .eq('user_id', user.id)
                .order('nome');

            if (!catError) setCategories(catData || []);
            if (!incError) setIncomeTypes(incData || []);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (nome: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Usuário não autenticado' } };

        const { error } = await supabase.from('categorias_despesa').insert({ nome, user_id: user.id });
        if (!error) fetchData();
        return { error };
    };

    const addIncomeType = async (nome: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Usuário não autenticado' } };

        const { error } = await supabase.from('tipos_receita').insert({ nome, user_id: user.id });
        if (!error) fetchData();
        return { error };
    };

    const deleteCategory = async (id: number) => {
        const { error } = await supabase.from('categorias_despesa').delete().eq('id', id);
        if (!error) fetchData();
        return { error };
    };

    const deleteIncomeType = async (id: number) => {
        const { error } = await supabase.from('tipos_receita').delete().eq('id', id);
        if (!error) fetchData();
        return { error };
    };

    useEffect(() => {
        fetchData();

        // Inscrever em mudanças em tempo real
        const catChannel = supabase
            .channel('public:categorias_despesa')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias_despesa' }, () => {
                fetchData();
            })
            .subscribe();

        const incChannel = supabase
            .channel('public:tipos_receita')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tipos_receita' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(catChannel);
            supabase.removeChannel(incChannel);
        };
    }, []);

    return {
        categories,
        incomeTypes,
        loading,
        addCategory,
        addIncomeType,
        deleteCategory,
        deleteIncomeType,
        refresh: fetchData
    };
}
