'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from './base';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Evitar erro de hidratação (montar apenas no cliente)
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="md" className="h-14 w-14 p-0 rounded-2xl">
                <div className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Button
            variant="secondary"
            size="md"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-14 w-14 p-0 rounded-2xl shadow-lg border-none bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
            aria-label="Alternar tema"
        >
            {theme === 'dark' ? (
                <Sun size={22} className="text-amber-400" />
            ) : (
                <Moon size={22} className="text-slate-600" />
            )}
        </Button>
    );
}
