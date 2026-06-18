import { Head, router } from '@inertiajs/react';
import {
    Users, Banknote, TrendingUp, TrendingDown, Wallet,
    CheckCircle2, AlertCircle, XCircle, AlertTriangle,
    BookOpen, ClipboardList, ArrowRight, CalendarDays,
    GraduationCap, UserCheck, ShieldCheck, FileBadge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ActiveYear { id: string; year: string; }

interface FinancialStats {
    total_invoices:  number;
    total_amount:    number;
    total_paid:      number;
    total_remaining: number;
    paid_count:      number;
    partial_count:   number;
    issued_count:    number;
}

interface MonthlyPayment { month: string; month_label: string; total: number; }

interface CashAccount { id: string; name: string; type: string; balance: number; }

interface RecentPayment {
    id: string;
    amount: number;
    payment_method: string;
    paid_at: string | null;
    cash_account: string | null;
    student_name: string;
    class_name: string;
}

interface StudentNoPay {
    id: string;
    enrollment_code: string;
    status: string;
    student?: { id: string; firstname: string; lastname: string; matricule?: string | null } | null;
    classroom?: { id: string; name: string; code: string } | null;
    invoice?: { id: string; total: number; amount_remaining: number; status: string } | null;
}

interface RecentEnrollment {
    id: string;
    enrollment_code: string;
    enrollment_date: string | null;
    status: string;
    student_name: string;
    matricule: string | null;
    class_name: string;
    class_code: string;
}

interface Assignment {
    id: string;
    subject: string;
    class_name: string;
    class_code: string;
}

interface PendingPermission {
    id: string;
    student_name: string;
    reason: string;
    start_date: string | null;
    end_date: string | null;
}

interface UpcomingExam {
    id: string;
    name: string;
    type: string;
    exam_date: string | null;
    center: string | null;
    registrations: number;
}

interface DashboardProps {
    activeYear:          ActiveYear | null;
    userRole:            string | null;
    financial?: {
        stats:           FinancialStats | null;
        monthlyPayments: MonthlyPayment[];
        cashAccounts:    CashAccount[];
        recentPayments:  RecentPayment[];
        studentsNoPay:   StudentNoPay[];
    };
    enrollments?: {
        total_students:    number;
        active_students:   number;
        enrollments_year:  number;
        enrollments_week:  number;
        recentEnrollments: RecentEnrollment[];
    };
    teaching?: {
        assignments: Assignment[];
    };
    academic?: {
        present_today:       number;
        absent_today:        number;
        pending_permissions: number;
        documents_month:     number;
        exams_open:          number;
        exam_registrations:  number;
        pendingPermissions:  PendingPermission[];
        upcomingExams:       UpcomingExam[];
    };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(n ?? 0) + ' F';

const pct = (paid: number, total: number) =>
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

const methodLabel: Record<string, string> = {
    CASH:          'Espèces',
    MOBILE_MONEY:  'Mobile Money',
    BANK_TRANSFER: 'Virement',
    CHEQUE:        'Chèque',
};

const cashTypeLabel: Record<string, string> = {
    CASH:         'Espèces',
    MOBILE_MONEY: 'Mobile Money',
    BANK:         'Banque',
};

const statusLabel: Record<string, { label: string; cls: string }> = {
    ISSUED:         { label: 'Non payé',  cls: 'bg-red-100 text-red-700'    },
    PARTIALLY_PAID: { label: 'Partiel',   cls: 'bg-orange-100 text-orange-700' },
    PAID:           { label: 'Soldé',     cls: 'bg-green-100 text-green-700' },
    ACTIVE:         { label: 'Actif',     cls: 'bg-green-100 text-green-700' },
    PENDING:        { label: 'En attente',cls: 'bg-gray-100 text-gray-600'   },
};

/* ------------------------------------------------------------------ */
/* Micro-composants                                                    */
/* ------------------------------------------------------------------ */

function KpiCard({ title, value, sub, icon: Icon, color }: {
    title: string; value: string | number; sub?: string;
    icon: React.ElementType;
    color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}) {
    const styles = {
        blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-600 dark:text-blue-400'    },
        green:  { bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400'  },
        orange: { bg: 'bg-orange-50 dark:bg-orange-900/20',text: 'text-orange-600 dark:text-orange-400'},
        red:    { bg: 'bg-red-50 dark:bg-red-900/20',      text: 'text-red-600 dark:text-red-400'      },
        purple: { bg: 'bg-purple-50 dark:bg-purple-900/20',text: 'text-purple-600 dark:text-purple-400'},
    };
    const { bg, text } = styles[color];
    return (
        <div className={`${bg} rounded-xl p-5 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
                    <p className={`text-2xl font-bold ${text} mt-1.5 truncate`}>{value}</p>
                    {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
                </div>
                <div className={`${bg} rounded-lg p-2 shrink-0 ml-3`}>
                    <Icon className={`w-6 h-6 ${text}`} />
                </div>
            </div>
        </div>
    );
}

function ProgressBar({ value, color = 'blue' }: { value: number; color?: 'blue' | 'green' | 'orange' | 'red' }) {
    const bar = { blue: 'bg-blue-500', green: 'bg-green-500', orange: 'bg-orange-400', red: 'bg-red-400' };
    return (
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${bar[color]}`} style={{ width: `${value}%` }} />
        </div>
    );
}

function SectionCard({ title, icon, count, children, action }: {
    title: string; icon: React.ReactNode; count?: number;
    children: React.ReactNode;
    action?: { label: string; href: string };
}) {
    return (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                        {icon}
                    </div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h2>
                    {count !== undefined && (
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                            {count}
                        </span>
                    )}
                </div>
                {action && (
                    <Button size="sm" variant="outline" className="text-xs gap-1 h-7"
                        onClick={() => router.get(action.href)}>
                        {action.label} <ArrowRight className="w-3 h-3" />
                    </Button>
                )}
            </div>
            {children}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tableau de bord', href: '/dashboard' }];

export default function Dashboard({ activeYear, userRole, financial, enrollments, teaching, academic }: Readonly<DashboardProps>) {

    const stats      = financial?.stats;
    const collectedPct = pct(Number(stats?.total_paid ?? 0), Number(stats?.total_amount ?? 0));
    const maxMonthly   = Math.max(...(financial?.monthlyPayments ?? []).map(m => Number(m.total)), 1);

    const isFinancial  = !!financial;
    const isEnrollment = !!enrollments;
    const isTeacher    = !!teaching;
    const isAcademic   = !!academic;
    const reasonLabel: Record<string, string> = { medical: 'Médical', familial: 'Familial', autre: 'Autre' };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />

            <div className="space-y-6 p-1">

                {/* ── En-tête ──────────────────────────────────────────── */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {activeYear ? `Année scolaire ${activeYear.year}` : 'Aucune année active'}
                        {userRole && ` · ${userRole}`}
                    </p>
                </div>

                {/* ── Alerte élèves 0 paiement ─────────────────────────── */}
                {isFinancial && (financial.studentsNoPay.length > 0) && (
                    <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-5 py-3.5">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                {financial.studentsNoPay.length} élève{financial.studentsNoPay.length > 1 ? 's' : ''} n'ont effectué aucun paiement
                            </p>
                            <p className="text-xs text-red-500 mt-0.5">
                                Ces élèves sont à risque d'exclusion faute de paiement.
                            </p>
                        </div>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 text-xs gap-1 shrink-0"
                            onClick={() => router.get(route('accounting.index'))}>
                            Voir <ArrowRight className="w-3 h-3" />
                        </Button>
                    </div>
                )}

                {/* ── KPIs financiers ──────────────────────────────────── */}
                {isFinancial && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard
                            title="Total facturé"
                            value={fmt(Number(stats?.total_amount ?? 0))}
                            sub={`${stats?.total_invoices ?? 0} factures`}
                            icon={Banknote}
                            color="blue"
                        />
                        <KpiCard
                            title="Encaissé"
                            value={fmt(Number(stats?.total_paid ?? 0))}
                            sub={`Taux ${collectedPct}%`}
                            icon={CheckCircle2}
                            color="green"
                        />
                        <KpiCard
                            title="Reste à recouvrer"
                            value={fmt(Number(stats?.total_remaining ?? 0))}
                            sub={`${(stats?.issued_count ?? 0) + (stats?.partial_count ?? 0)} dossiers ouverts`}
                            icon={AlertCircle}
                            color="orange"
                        />
                        <KpiCard
                            title="Soldés / Impayés"
                            value={`${stats?.paid_count ?? 0} / ${stats?.issued_count ?? 0}`}
                            sub={`${stats?.partial_count ?? 0} paiements partiels`}
                            icon={XCircle}
                            color="red"
                        />
                    </div>
                )}

                {/* ── KPIs inscriptions ─────────────────────────────────── */}
                {isEnrollment && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard
                            title="Élèves inscrits"
                            value={enrollments.enrollments_year}
                            sub={`Année ${activeYear?.year ?? '—'}`}
                            icon={Users}
                            color="blue"
                        />
                        <KpiCard
                            title="Cette semaine"
                            value={enrollments.enrollments_week}
                            sub="Nouvelles inscriptions"
                            icon={CalendarDays}
                            color="purple"
                        />
                        <KpiCard
                            title="Élèves actifs"
                            value={enrollments.active_students}
                            sub={`sur ${enrollments.total_students} au total`}
                            icon={GraduationCap}
                            color="green"
                        />
                        {isFinancial && (
                            <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex flex-col justify-between">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taux de recouvrement</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{collectedPct}%</p>
                                <ProgressBar
                                    value={collectedPct}
                                    color={collectedPct >= 80 ? 'green' : collectedPct >= 50 ? 'orange' : 'red'}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── KPIs vie scolaire & pédagogie ─────────────────────── */}
                {isAcademic && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard
                            title="Présences du jour"
                            value={academic.present_today}
                            sub={`${academic.absent_today} absence${academic.absent_today > 1 ? 's' : ''} aujourd'hui`}
                            icon={UserCheck}
                            color="green"
                        />
                        <KpiCard
                            title="Permissions en attente"
                            value={academic.pending_permissions}
                            sub="À traiter"
                            icon={ShieldCheck}
                            color="orange"
                        />
                        <KpiCard
                            title="Documents délivrés"
                            value={academic.documents_month}
                            sub="Ce mois-ci"
                            icon={FileBadge}
                            color="purple"
                        />
                        <KpiCard
                            title="Examens officiels"
                            value={academic.exams_open}
                            sub={`${academic.exam_registrations} inscription${academic.exam_registrations > 1 ? 's' : ''}`}
                            icon={GraduationCap}
                            color="blue"
                        />
                    </div>
                )}

                {/* ── Permissions en attente + Prochains examens ────────── */}
                {isAcademic && (
                    <div className="grid lg:grid-cols-2 gap-5">
                        <SectionCard
                            title="Permissions en attente"
                            icon={<ShieldCheck className="w-4 h-4" />}
                            count={academic.pendingPermissions.length}
                            action={{ label: 'Permissions', href: route('absence-permissions.index') }}
                        >
                            {academic.pendingPermissions.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6 px-5">Aucune demande en attente</p>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {academic.pendingPermissions.map(p => (
                                        <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.student_name}</p>
                                                <p className="text-xs text-gray-400">{reasonLabel[p.reason] ?? p.reason} · {p.start_date} → {p.end_date}</p>
                                            </div>
                                            <span className="shrink-0 ml-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                En attente
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Prochains examens officiels"
                            icon={<GraduationCap className="w-4 h-4" />}
                            count={academic.upcomingExams.length}
                            action={{ label: 'Examens', href: route('official-exams.index') }}
                        >
                            {academic.upcomingExams.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6 px-5">Aucun examen planifié</p>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {academic.upcomingExams.map(e => (
                                        <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    <span className="uppercase text-blue-600 dark:text-blue-400 font-bold mr-1.5">{e.type}</span>{e.name}
                                                </p>
                                                <p className="text-xs text-gray-400">{e.center ?? '—'} · {e.registrations} inscrit{e.registrations > 1 ? 's' : ''}</p>
                                            </div>
                                            <span className="shrink-0 ml-3 text-xs text-gray-500">{e.exam_date}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                )}

                {/* ── Évolution mensuelle + Caisses ────────────────────── */}
                {isFinancial && (
                    <div className="grid lg:grid-cols-3 gap-5">

                        {/* Graphe mensuel */}
                        <div className="lg:col-span-2 bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Encaissements — 6 derniers mois</h2>
                            </div>
                            {financial.monthlyPayments.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">Aucun paiement sur la période</p>
                            ) : (
                                <div className="flex items-end gap-2 h-32">
                                    {financial.monthlyPayments.map(m => {
                                        const h = Math.round((Number(m.total) / maxMonthly) * 100);
                                        return (
                                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                                                <div className="relative w-full flex items-end justify-center" style={{ height: '96px' }}>
                                                    <div className="absolute bottom-full mb-1.5 hidden group-hover:flex bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg z-10 flex-col items-center">
                                                        <span className="font-semibold">{fmt(Number(m.total))}</span>
                                                        <span className="text-gray-400">{m.month_label}</span>
                                                    </div>
                                                    <div
                                                        className="w-full rounded-t-lg bg-blue-500 hover:bg-blue-600 transition-colors cursor-default"
                                                        style={{ height: `${Math.max(h, 4)}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 truncate w-full text-center">{m.month_label.slice(0, 3)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Soldes caisses */}
                        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet className="w-4 h-4 text-gray-400" />
                                <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Soldes des caisses</h2>
                            </div>
                            {financial.cashAccounts.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">Aucune caisse active</p>
                            ) : (
                                <div className="space-y-3">
                                    {financial.cashAccounts.map(ca => (
                                        <div key={ca.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ca.name}</p>
                                                <p className="text-xs text-gray-400">{cashTypeLabel[ca.type] ?? ca.type}</p>
                                            </div>
                                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                                {fmt(Number(ca.balance))}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {fmt(financial.cashAccounts.reduce((s, ca) => s + Number(ca.balance), 0))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Derniers paiements + Dernières inscriptions ───────── */}
                <div className="grid lg:grid-cols-2 gap-5">

                    {/* Derniers paiements */}
                    {isFinancial && (
                        <SectionCard
                            title="Derniers paiements"
                            icon={<Banknote className="w-4 h-4" />}
                            count={financial.recentPayments.length}
                            action={{ label: 'Comptabilité', href: route('accounting.index') }}
                        >
                            {financial.recentPayments.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6 px-5">Aucun paiement enregistré</p>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {financial.recentPayments.map(p => (
                                        <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.student_name}</p>
                                                <p className="text-xs text-gray-400">{p.class_name} · {methodLabel[p.payment_method] ?? p.payment_method}</p>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
                                                <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(p.amount)}</p>
                                                <p className="text-xs text-gray-400">{p.paid_at ?? '—'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* Dernières inscriptions */}
                    {isEnrollment && (
                        <SectionCard
                            title="Dernières inscriptions"
                            icon={<ClipboardList className="w-4 h-4" />}
                            count={enrollments.recentEnrollments.length}
                            action={{ label: 'Inscriptions', href: route('enrollments.index') }}
                        >
                            {enrollments.recentEnrollments.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6 px-5">Aucune inscription pour cette année</p>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {enrollments.recentEnrollments.map(e => {
                                        const st = statusLabel[e.status] ?? { label: e.status, cls: 'bg-gray-100 text-gray-600' };
                                        return (
                                            <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.student_name}</p>
                                                    <p className="text-xs text-gray-400">{e.class_name} · {e.enrollment_date ?? '—'}</p>
                                                </div>
                                                <span className={`shrink-0 ml-3 text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>
                                                    {st.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </SectionCard>
                    )}
                </div>

                {/* ── Élèves sans paiement (table détaillée) ──────────── */}
                {isFinancial && financial.studentsNoPay.length > 0 && (
                    <SectionCard
                        title="Élèves à risque — aucun paiement"
                        icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
                        count={financial.studentsNoPay.length}
                        action={{ label: 'Voir tout', href: route('accounting.index') }}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Élève</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Classe</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant dû</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {financial.studentsNoPay.map(e => (
                                        <tr key={e.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 border-l-2 border-l-red-400">
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {e.student ? `${e.student.firstname} ${e.student.lastname}` : '—'}
                                                </p>
                                                {e.student?.matricule && <p className="text-xs text-gray-400">{e.student.matricule}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                                    {e.classroom?.name ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">
                                                {fmt(Number(e.invoice?.amount_remaining ?? 0))}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button size="sm" variant="outline" className="text-xs h-7"
                                                    onClick={() => router.get(route('enrollments.invoice', e.id))}>
                                                    Facture
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* ── Section enseignant ───────────────────────────────── */}
                {isTeacher && (
                    <SectionCard
                        title="Mes affectations"
                        icon={<BookOpen className="w-4 h-4" />}
                        count={teaching.assignments.length}
                        action={{ label: 'Affectations', href: route('subject-assignments.index') }}
                    >
                        {teaching.assignments.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6 px-5">
                                Aucune affectation pour l'année {activeYear?.year ?? 'courante'}
                            </p>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                                {teaching.assignments.map(a => (
                                    <div key={a.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                        <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">{a.subject}</p>
                                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                                            {a.class_name} <span className="opacity-60">({a.class_code})</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ── État vide ────────────────────────────────────────── */}
                {!isFinancial && !isEnrollment && !isTeacher && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <TrendingDown className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Tableau de bord non disponible</p>
                        <p className="text-sm text-gray-400 mt-1">Aucune donnée à afficher pour votre profil.</p>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
