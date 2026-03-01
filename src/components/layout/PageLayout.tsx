'use client';

import * as React from 'react';
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/features/AuthForm";
import { MainLayout } from "./MainLayout";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-black">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return <AuthForm />;
    }

    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
};
