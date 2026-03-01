'use client';

import * as React from 'react';

interface DateContextType {
    currentMonth: number;
    currentYear: number;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
}

const DateContext = React.createContext<DateContextType | undefined>(undefined);

export const DateProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    return (
        <DateContext.Provider value={{ currentMonth, currentYear, handlePrevMonth, handleNextMonth }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDate = () => {
    const context = React.useContext(DateContext);
    if (!context) throw new Error('useDate must be used within a DateProvider');
    return context;
};
