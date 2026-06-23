import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { DemoBanner } from '@/components/demo-banner';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: Readonly<AppLayoutProps>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden bg-gray-50 dark:bg-gray-900">
                <AppSidebarHeader />
                <DemoBanner />
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
