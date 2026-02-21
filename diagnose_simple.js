
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://mlgriwjbfdgmclmlmutb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZ3Jpd2piZmRnbWNsbWxtdXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTYwOTgsImV4cCI6MjA4NzI3MjA5OH0.NJw4JjLiEM04DWBY18qdYLvB_0WnAoUjAIDVv0_J9jo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("Starting diagnosis...");

    // Check ALL transactions
    const { data: transactions, error } = await supabase
        .from('transacoes')
        .select('*');

    if (error) {
        console.error("Error fetching transactions:", error);
        return;
    }

    if (!transactions || transactions.length === 0) {
        console.log("No transactions found in the database.");
        return;
    }

    console.log(`Total transactions in DB: ${transactions.length}`);

    // Grouping by Year and Month to see where the balance comes from
    const groups = {};
    transactions.forEach(t => {
        const key = `${t.ano}-${t.mes}`;
        if (!groups[key]) groups[key] = { receita: 0, despesa: 0, count: 0 };
        if (t.tipo === 'Receita') groups[key].receita += Number(t.valor);
        else groups[key].despesa += Number(t.valor);
        groups[key].count++;
    });

    console.log("\nSummary of Transactions by Period:");
    console.table(groups);

    // Calculate balance before Jan 2025
    let balanceBeforeJan2025 = 0;
    const itemsBefore = [];

    const MESES_LOWER = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    transactions.forEach(t => {
        const tMonthIndex = MESES_LOWER.indexOf(t.mes.toLowerCase());
        if (t.ano < 2025 || (t.ano === 2025 && tMonthIndex < 0)) { // 0 is Janeiro
            if (t.tipo === 'Receita') balanceBeforeJan2025 += Number(t.valor);
            else balanceBeforeJan2025 -= Number(t.valor);
            itemsBefore.push(t);
        }
    });

    console.log(`\nCalculation for Janeiro 2025 (Balance from before): R$ ${balanceBeforeJan2025.toFixed(2)}`);

    if (itemsBefore.length > 0) {
        console.log("\nFound these transactions BEFORE Jan 2025:");
        console.table(itemsBefore.map(t => ({ tipo: t.tipo, valor: t.valor, mes: t.mes, ano: t.ano, conta: t.conta })));
    } else {
        console.log("\nNo transactions found strictly before Jan 2025.");
    }
}

diagnose();
