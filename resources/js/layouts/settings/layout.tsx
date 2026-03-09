import { Link } from '@inertiajs/react';
import { User, Lock, Shield, Palette } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Mon profil',
        href: edit(),
        icon: User,
    },
    {
        title: 'Mot de passe',
        href: editPassword(),
        icon: Lock,
    },
    {
        title: 'Authentification 2FA',
        href: show(),
        icon: Shield,
    },
    {
        title: 'Apparence',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: Readonly<PropsWithChildren>) {
    const { isCurrentUrl } = useCurrentUrl();

    // When server-side rendering, we only render the layout on the client...
    if (globalThis.window === undefined) {
        return null;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="px-4 py-6">
                <Heading
                    title="Mon compte"
                    description="Gérez votre profil et les paramètres de votre compte"
                />

                <div className="flex flex-col lg:flex-row lg:gap-6 mt-6">
                    <aside className="w-full lg:w-64">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                            <nav
                                className="flex flex-col space-y-1"
                                aria-label="Settings"
                            >
                                {sidebarNavItems.map((item, index) => (
                                    <Link
                                        key={`${toUrl(item.href)}-${index}`}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                                            isCurrentUrl(item.href)
                                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon className="h-5 w-5" />
                                        )}
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <Separator className="my-6 lg:hidden" />

                    <div className="flex-1 max-w-3xl">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <section className="p-6 space-y-8">
                                {children}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
