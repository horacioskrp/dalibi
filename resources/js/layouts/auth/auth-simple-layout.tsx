import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: Readonly<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh bg-background">
            {/* Section image - 50% */}
            <div className="relative hidden w-1/2 overflow-hidden lg:block">
                <img
                    src="/images/login-hero.jpg"
                    alt="Ecolio"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-10 left-10 right-10 text-white">
                    <h2 className="text-3xl font-bold mb-2">Bienvenue sur Ecolio</h2>
                    <p className="text-blue-100 text-lg">
                        Gérez votre établissement scolaire de manière efficace
                    </p>
                </div>
            </div>

            {/* Section formulaire - 50% */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md bg-blue-600">
                                    <AppLogoIcon className="size-9 fill-current text-white" />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                                <p className="text-center text-sm text-gray-600">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
