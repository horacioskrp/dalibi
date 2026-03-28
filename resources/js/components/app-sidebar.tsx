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
                            <div>
                                <div className="flex items-center gap-2">
                                    <AppLogo />
                                </div>
                            </div>
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
