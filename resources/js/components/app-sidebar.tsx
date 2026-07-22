import { Link } from '@inertiajs/react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { mainNavItems } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
        >
            <SidebarHeader className="px-3 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="sm"
                            asChild
                        >
                            <Link href="/dashboard" prefetch aria-label="Tableau de bord" className="flex items-center gap-2">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="pt-2">
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
