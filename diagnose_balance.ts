
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function diagnose() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log("No user found");
        return;
    }

    const { data: transactions, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total transactions found: ${transactions?.length}`);

    const totalsByYearMonth = transactions?.reduce((acc: any, t) => {
        const key = `${t.ano}-${t.mes}`;
        if (!acc[key]) acc[key] = { receita: 0, despesa: 0 };
        if (t.tipo === 'Receita') acc[key].receita += Number(t.valor);
        else acc[key].despesa += Number(t.valor);
        return acc;
    }, {});

    console.log("Totals by Year-Month:");
    console.table(totalsByYearMonth);

    const beforeJan2025 = transactions?.filter(t => t.ano < 2025);
    const balanceBeforeJan2025 = beforeJan2025?.reduce((acc, t) => {
        return t.tipo === 'Receita' ? acc + Number(t.valor) : acc - Number(t.valor);
    }, 0);

    console.log(`\nBalance before Jan 2025: ${balanceBeforeJan2025}`);
    if (beforeJan2025 && beforeJan2025.length > 0) {
        console.log("Sample transactions before Jan 2025:");
        console.table(beforeJan2025.slice(0, 5).map(t => ({ tipo: t.tipo, valor: t.valor, mes: t.mes, ano: t.ano, conta: t.conta })));
    }
}

diagnose();
