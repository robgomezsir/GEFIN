'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, glass, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-slate-200 bg-[var(--card)] p-6 shadow-sm transition-all dark:border-slate-800",
                glass && "bg-opacity-80 backdrop-blur-md dark:bg-opacity-80",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
            ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
            danger: "bg-red-500 text-white hover:bg-red-600"
        };
        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-11 px-6",
            lg: "h-14 px-8 text-lg"
        };
        return (
            <button
                ref={ref}
                disabled={loading || props.disabled}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : children}
            </button>
        );
    }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            className={cn(
                "flex h-12 w-full rounded-xl border border-slate-200 bg-[var(--card)] px-4 py-2 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 dark:border-slate-800 dark:text-white",
                className
            )}
            {...props}
        />
    )
);
Input.displayName = "Input";
