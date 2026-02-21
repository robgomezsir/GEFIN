'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [incomeTypes, setIncomeTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: catData, error: catError } = await supabase
                .from('categorias_despesa')
                .select('*')
                .order('nome');

            const { data: incData, error: incError } = await supabase
                .from('tipos_receita')
                .select('*')
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
        const { error } = await supabase.from('categorias_despesa').insert({ nome });
        if (!error) fetchData();
        return { error };
    };

    const addIncomeType = async (nome: string) => {
        const { error } = await supabase.from('tipos_receita').insert({ nome });
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
