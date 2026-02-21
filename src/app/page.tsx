'use client';

import { Dashboard } from "@/components/features/Dashboard";
import { AuthForm } from "@/components/features/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
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
    <main className="min-h-screen bg-slate-50 dark:bg-black">
      <Dashboard />
    </main>
  );
}
