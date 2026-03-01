'use client';

import * as React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { TransactionsByYear } from "@/components/features/TransactionsByYear";
import { TransactionForm } from "@/components/features/TransactionForm";
import { useFinanceData } from "@/hooks/useFinanceData";
import { MESES } from "@/utils/format";
import { Transacao } from "@/types";

export default function TransactionsPage() {
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
    const [editingTransaction, setEditingTransaction] = React.useState<Transacao | null>(null);
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    // We need a dummy month just to get the refresh functions from the hook if needed, 
    // though TransactionsByYear handles its own fetching.
    const { addTransaction, updateTransaction, deleteTransaction, refresh } = useFinanceData(MESES[new Date().getMonth()], currentYear);

    const handleEdit = (t: Transacao) => {
        setEditingTransaction(t);
        setIsFormOpen(true);
    };

    const handleSave = async (data: any) => {
        if (editingTransaction) {
            await updateTransaction(editingTransaction.id, data);
        } else {
            await addTransaction(data);
        }
        setIsFormOpen(false);
        setEditingTransaction(null);
        // TransactionsByYear will need to refresh. 
        // Since it uses its own state/effect, it should handle it if we trigger a global refresh or pass down a refresh prop.
        window.location.reload(); // Simple way for now to ensure all data is synced
    };

    return (
        <PageLayout>
            <div className="animate-in fade-in duration-500">
                <TransactionsByYear
                    initialYear={currentYear}
                    onEditTransaction={handleEdit}
                    onBack={() => window.location.href = '/'}
                />

                {(isFormOpen || editingTransaction) && (
                    <TransactionForm
                        onClose={() => {
                            setIsFormOpen(false);
                            setEditingTransaction(null);
                        }}
                        onSave={handleSave}
                        initialData={editingTransaction}
                        onDelete={async () => {
                            if (editingTransaction) {
                                await deleteTransaction(editingTransaction.id);
                                setIsFormOpen(false);
                                setEditingTransaction(null);
                                window.location.reload();
                            }
                        }}
                    />
                )}
            </div>
        </PageLayout>
    );
}
