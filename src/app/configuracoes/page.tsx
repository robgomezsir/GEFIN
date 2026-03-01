'use client';

import * as React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Settings } from "@/components/features/Settings";

export default function SettingsPage() {
    return (
        <PageLayout>
            <div className="animate-in fade-in duration-500">
                <Settings onBack={() => window.location.href = '/'} />
            </div>
        </PageLayout>
    );
}
