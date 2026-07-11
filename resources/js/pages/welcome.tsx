import { Head, Link, usePage } from '@inertiajs/react';
import {
    Archive, ArrowRight, BarChart3, Calendar, GraduationCap, LayoutGrid,
    LogIn, NotebookPen, UserCheck, Users, Wallet,
} from 'lucide-react';
import { dashboard, login } from '@/routes';
import { route } from '@/helpers/route';

interface AuthProps {
    user: { id: string; name?: string } | null;
    permissions?: string[];
}

interface ModuleCard {
    title: string;
    description: string;
    icon: typeof Users;
    href: string;
    permission: string;
    color: string;
}

const modules: ModuleCard[] = [
    { title: 'Élèves', description: 'Inscriptions, dossiers et effectifs', icon: Users, href: route('students.index'), permission: 'view_students', color: 'from-blue-500 to-blue-600' },
    { title: 'Notes & Bulletins', description: 'Saisie des notes et bulletins', icon: NotebookPen, href: route('bulletins.index'), permission: 'view_bulletins', color: 'from-violet-500 to-purple-600' },
    { title: 'Examens', description: 'Évaluations et examens officiels', icon: GraduationCap, href: route('evaluations.index'), permission: 'view_evaluations', color: 'from-indigo-500 to-blue-600' },
    { title: 'Présences', description: "Appel et suivi de l'assiduité", icon: UserCheck, href: route('attendances.index'), permission: 'view_attendances', color: 'from-emerald-500 to-teal-600' },
    { title: 'Comptabilité', description: 'Écolage, paiements et caisses', icon: Wallet, href: route('accounting.index'), permission: 'view_finances', color: 'from-amber-500 to-orange-600' },
    { title: 'Documents & Archives', description: 'Certificats et archivage', icon: Archive, href: route('archives.index'), permission: 'view_archives', color: 'from-rose-500 to-pink-600' },
    { title: 'Statistiques', description: 'Indicateurs et pilotage', icon: BarChart3, href: route('statistics.index'), permission: 'view_statistics', color: 'from-cyan-500 to-blue-600' },
    { title: 'Calendrier', description: "Événements de l'année scolaire", icon: Calendar, href: route('calendar.index'), permission: 'view_calendar', color: 'from-fuchsia-500 to-purple-600' },
];

export default function Welcome() {
    const auth = (usePage().props as { auth?: AuthProps }).auth;
    const isAuthed = Boolean(auth?.user);
    const permissions = auth?.permissions ?? [];

    // Connecté : on n'affiche que les modules autorisés. Non connecté : tout,
    // mais le clic renvoie vers la connexion (les routes sont derrière l'auth).
    const visibleModules = modules.filter((m) => !isAuthed || permissions.includes(m.permission));

    return (
        <>
            <Head title="Dalibi — Gestion scolaire" />

            <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100">
                {/* Barre supérieure */}
                <header className="sticky top-0 z-10 border-b border-gray-200/70 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-[#0a0a0a]/80">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <GraduationCap className="h-5 w-5" />
                            </span>
                            <span className="text-lg font-bold tracking-tight">Dalibi</span>
                        </div>

                        {isAuthed ? (
                            <Link href={dashboard()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                                <LayoutGrid className="h-4 w-4" /> Tableau de bord
                            </Link>
                        ) : (
                            <Link href={login()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                                <LogIn className="h-4 w-4" /> Se connecter
                            </Link>
                        )}
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                    {/* Hero */}
                    <div className="mb-12 text-center">
                        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                            Logiciel de gestion scolaire
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            {isAuthed ? (
                                <>Bonjour{auth?.user?.name ? `, ${auth.user.name}` : ''} 👋</>
                            ) : (
                                <>Bienvenue sur <span className="text-blue-600">Dalibi</span></>
                            )}
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-500 dark:text-gray-400 md:text-lg">
                            {isAuthed
                                ? 'Choisissez un module pour commencer.'
                                : 'Connectez-vous pour accéder aux modules de votre établissement.'}
                        </p>
                    </div>

                    {/* Cartes des modules */}
                    {visibleModules.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-400 dark:border-gray-800 dark:bg-[#161615]">
                            Aucun module accessible avec votre profil.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {visibleModules.map((m) => (
                                <Link
                                    key={m.title}
                                    href={m.href}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-[#161615] dark:hover:border-blue-900"
                                >
                                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${m.color} text-white shadow-md`}>
                                        <m.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold">{m.title}</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{m.description}</p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
                                        {isAuthed ? 'Ouvrir' : 'Se connecter'} <ArrowRight className="h-4 w-4" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>

                <footer className="border-t border-gray-200/70 py-8 text-center text-sm text-gray-400 dark:border-gray-800">
                    &copy; {new Date().getFullYear()} Dalibi — Logiciel de gestion scolaire open source pour l&apos;Afrique.
                </footer>
            </div>
        </>
    );
}
