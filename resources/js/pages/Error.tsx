import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, ArrowLeft, Clock, LayoutGrid, Lock, XCircle } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { dashboard } from '@/routes';

interface AuthProps {
    user: { id: string } | null;
}

const INFO: Record<number, { title: string; message: string; icon: typeof AlertCircle; tone: string }> = {
    403: { title: 'Accès refusé', message: "Vous n'avez pas l'autorisation d'accéder à cette page.", icon: Lock, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
    404: { title: 'Page introuvable', message: "La page que vous recherchez n'existe pas ou a été déplacée.", icon: AlertCircle, tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    419: { title: 'Session expirée', message: 'Votre session a expiré. Veuillez vous reconnecter, puis réessayer.', icon: Clock, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
    429: { title: 'Trop de requêtes', message: 'Vous avez effectué trop de requêtes. Patientez un instant avant de réessayer.', icon: AlertTriangle, tone: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
    500: { title: 'Erreur serveur', message: "Une erreur inattendue s'est produite. Nos équipes ont été notifiées.", icon: XCircle, tone: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
    503: { title: 'Maintenance en cours', message: 'Le service est momentanément indisponible. Merci de revenir dans quelques instants.', icon: Clock, tone: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
};

export default function ErrorPage({ status }: Readonly<{ status: number }>) {
    const auth = (usePage().props as { auth?: AuthProps }).auth;
    const isAuthed = Boolean(auth?.user);
    const info = INFO[status] ?? {
        title: 'Une erreur est survenue',
        message: "Quelque chose s'est mal passé. Veuillez réessayer.",
        icon: AlertTriangle,
        tone: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
    };
    const Icon = info.icon;

    return (
        <>
            <Head title={`${status} — ${info.title}`} />

            <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100">
                <header className="border-b border-gray-200/70 dark:border-gray-800">
                    <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
                        <Link href="/" aria-label="Dalibi" className="flex items-center">
                            <AppLogo className="h-8 w-auto fill-gray-900 dark:fill-white" />
                        </Link>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center px-4 py-16">
                    <div className="w-full max-w-md text-center">
                        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${info.tone}`}>
                            <Icon className="h-10 w-10" />
                        </div>

                        <p className="text-6xl font-bold tracking-tight text-gray-300 dark:text-gray-700">{status}</p>
                        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{info.title}</h1>
                        <p className="mx-auto mt-3 max-w-sm text-gray-500 dark:text-gray-400">{info.message}</p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href={isAuthed ? dashboard() : '/'}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <LayoutGrid className="h-4 w-4" /> {isAuthed ? 'Tableau de bord' : "Retour à l'accueil"}
                            </Link>
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <ArrowLeft className="h-4 w-4" /> Page précédente
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-gray-200/70 py-6 text-center text-sm text-gray-400 dark:border-gray-800">
                    &copy; {new Date().getFullYear()} Dalibi
                </footer>
            </div>
        </>
    );
}
