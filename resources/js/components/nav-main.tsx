import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

// Style de l'élément actif (parent ou sous-item) — factorisé pour éviter la triplication.
const ACTIVE_CLASS =
    'data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-semibold data-[active=true]:[&>svg]:text-sidebar-primary-foreground';

export function NavMain({ items = [] }: Readonly<{ items: NavItem[] }>) {
    const { currentUrl, isCurrentUrl } = useCurrentUrl();

    const auth = (usePage().props as { auth?: { permissions?: string[] } }).auth;
    const permissions = auth?.permissions ?? [];
    const allowed = (item: NavItem) => !item.permission || permissions.includes(item.permission);

    // Filtre par permission : on masque les entrées non autorisées
    // (un groupe disparaît s'il n'a plus aucun sous-élément visible).
    const visibleItems = items
        .map((item) => (item.items ? { ...item, items: item.items.filter(allowed) } : item))
        .filter((item) => (item.items ? item.items.length > 0 : allowed(item)));

    // Un groupe est actif si l'un de ses sous-items correspond à l'URL courante.
    const isGroupActive = (item: NavItem) =>
        item.items?.some((sub) => isCurrentUrl(sub.href)) ?? false;

    // État d'ouverture contrôlé : le groupe courant s'ouvre automatiquement
    // (et à chaque navigation), tout en laissant l'utilisateur replier/déplier.
    const [openTitles, setOpenTitles] = useState<Set<string>>(
        () => new Set(visibleItems.filter(isGroupActive).map((i) => i.title)),
    );

    useEffect(() => {
        const active = visibleItems.find(isGroupActive);
        if (active) {
            setOpenTitles((prev) => (prev.has(active.title) ? prev : new Set(prev).add(active.title)));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUrl]);

    const setOpen = (title: string, open: boolean) =>
        setOpenTitles((prev) => {
            const next = new Set(prev);
            open ? next.add(title) : next.delete(title);
            return next;
        });

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {visibleItems.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        open={openTitles.has(item.title)}
                        onOpenChange={(o) => setOpen(item.title, o)}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            {item.items ? (
                                <>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isGroupActive(item)}
                                            tooltip={{ children: item.title }}
                                            className={ACTIVE_CLASS}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isCurrentUrl(subItem.href)}
                                                        className={ACTIVE_CLASS}
                                                    >
                                                        <Link href={subItem.href} prefetch>
                                                            {subItem.icon && <subItem.icon />}
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                    className={ACTIVE_CLASS}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
