import { supabase } from '@/lib/supabase';
import { MESES } from '@/utils/format';

export async function calcularSaldosDoAno(ano: number) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];

    // 1. Buscar valor inicial do ano (transação especial)
    const { data: transacoesIniciais } = await supabase
        .from('transacoes')
        .select('valor')
        .eq('user_id', authData.user.id)
        .eq('ano', ano)
        .eq('conta', 'Valor inicial do Ano')
        .single();

    const valorInicial = transacoesIniciais?.valor ?? 0;

    // 2. Buscar resumos mensais da view
    const { data: resumos } = await supabase
        .from('v_resumo_fluxo')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('ano', ano);

    let saldoAnterior = valorInicial;
    const resultado = MESES.map(mes => {
        const resumoMes = resumos?.find(r => r.mes === mes);

        const receitas = resumoMes?.total_receitas ?? 0;
        const despesas = resumoMes?.total_despesas ?? 0;
        const fluxo = receitas - despesas;
        const saldoAcumulado = saldoAnterior + fluxo;

        const item = {
            mes,
            receitas,
            despesas,
            fluxo,
            saldoAnterior,
            saldoAcumulado
        };

        saldoAnterior = saldoAcumulado; // Encademento para o próximo mês
        return item;
    });

    return resultado;
}
