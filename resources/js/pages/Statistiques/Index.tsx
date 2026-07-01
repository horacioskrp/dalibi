import { Head, router } from '@inertiajs/react';
import { BarChart3, Download, FileSpreadsheet, GraduationCap, Layers, PieChart as PieIcon, School, TrendingUp, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import {
    Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart,
    ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

/* ---------------- Types ---------------- */
interface YearOption { id: string; year: string; active?: boolean }
interface ClassOption { id: string; name: string }
interface Filters { academic_year_id: string | null; class_id: string | null; gender: string | null }

interface Enrollment {
    total: number;
    gender: { male: number; female: number; other: number };
    ips: number | null;
    part_filles: number;
    by_class: { name: string; male: number; female: number; total: number }[];
    academic_status: Record<string, number>;
    rates: { promotion: number; redoublement: number; abandon: number };
    age_distribution: { age: number; total: number }[];
    age_moyen: number | null;
    by_city: { city: string; total: number }[];
}
interface Finance {
    billed: number; collected: number; remaining: number; recovery_rate: number;
    total_invoices: number; paid_count: number; partial_count: number; unpaid_count: number;
    by_class: { name: string; billed: number; collected: number; rate: number }[];
    by_method: { method: string; total: number; count: number }[];
    monthly: { month: string; total: number }[];
}
interface Success {
    bulletins: number; moyenne_generale: number | null; pass_rate: number;
    mentions: { passable: number; assez_bien: number; bien: number; tres_bien: number };
    exams: { name: string; type: string; center: string | null; registered: number; admitted: number; failed: number; absent: number; admission_rate: number; presentation_rate: number }[];
    exams_summary: { registered: number; admitted: number; admission_rate: number };
}
interface Resources {
    total_students: number; total_teachers: number; rem: number | null;
    class_count: number; avg_class_size: number; threshold: number;
    overcrowded: { name: string; total: number }[];
    class_sizes: { name: string; total: number }[];
}
interface Props {
    filters: Filters;
    academicYears: YearOption[];
    classes: ClassOption[];
    enrollment: Enrollment;
    finance: Finance;
    success: Success;
    resources: Resources;
}

/* ---------------- Helpers ---------------- */
const money = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F';
const methodLabel: Record<string, string> = { CASH: 'Espèces', MOBILE_MONEY: 'Mobile Money', BANK_TRANSFER: 'Virement', CHEQUE: 'Chèque' };
const BLUE = '#2563eb', PINK = '#db2777', GREEN = '#16a34a', ORANGE = '#ea580c', VIOLET = '#7c3aed', SLATE = '#94a3b8';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Statistiques', href: '/statistiques' }];

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string | number; sub?: string; icon: React.ElementType; tone: string }) {
    return (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                    <p className={`text-2xl font-bold mt-1.5 ${tone}`}>{value}</p>
                    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
                <div className={`rounded-lg p-2 ${tone.replace('text-', 'bg-').replace('600', '50')} dark:bg-gray-700`}>
                    <Icon className={`w-6 h-6 ${tone}`} />
                </div>
            </div>
        </div>
    );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4"><span className="text-gray-400">{icon}</span><h2 className="font-semibold text-sm text-gray-900 dark:text-white">{title}</h2></div>
            {children}
        </div>
    );
}

/* ---------------- Page ---------------- */
type Tab = 'effectifs' | 'finances' | 'reussite' | 'encadrement';

export default function StatisticsIndex({ filters, academicYears, classes, enrollment, finance, success, resources }: Readonly<Props>) {
    const [tab, setTab] = useState<Tab>('effectifs');

    const setFilter = (key: keyof Filters, value: string) => {
        router.get(route('statistics.index'), {
            ...filters,
            [key]: value === 'all' ? '' : value,
        }, { preserveScroll: true, preserveState: false, replace: true });
    };

    const exportUrl = (section: Tab, format: 'pdf' | 'xlsx') => {
        const q = new URLSearchParams();
        if (filters.academic_year_id) q.set('academic_year_id', filters.academic_year_id);
        if (filters.class_id) q.set('class_id', filters.class_id);
        if (filters.gender) q.set('gender', filters.gender);
        return `/statistiques/${section}/export/${format}?${q.toString()}`;
    };

    const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
        { key: 'effectifs', label: 'Effectifs & parité', icon: Users },
        { key: 'finances', label: 'Finances & recouvrement', icon: Wallet },
        { key: 'reussite', label: 'Réussite & examens', icon: GraduationCap },
        { key: 'encadrement', label: 'Encadrement', icon: School },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistiques" />
            <div className="space-y-6 p-1">
                {/* En-tête + filtres */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <BarChart3 className="h-7 w-7 text-blue-600 shrink-0" /> Statistiques
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Indicateurs de l'établissement — effectifs, finances et réussite.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={filters.academic_year_id ?? ''} onValueChange={(v) => setFilter('academic_year_id', v)}>
                            <SelectTrigger className="w-40 bg-white dark:bg-card"><SelectValue placeholder="Année" /></SelectTrigger>
                            <SelectContent>{academicYears.map((y) => <SelectItem key={y.id} value={y.id}>{y.year}{y.active ? ' · active' : ''}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={filters.class_id ?? 'all'} onValueChange={(v) => setFilter('class_id', v)}>
                            <SelectTrigger className="w-40 bg-white dark:bg-card"><SelectValue placeholder="Classe" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Toutes les classes</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={filters.gender ?? 'all'} onValueChange={(v) => setFilter('gender', v)}>
                            <SelectTrigger className="w-32 bg-white dark:bg-card"><SelectValue placeholder="Sexe" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="male">Garçons</SelectItem><SelectItem value="female">Filles</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Onglets + export */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex gap-1">
                        {tabs.map((t) => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                                <t.icon className="w-4 h-4" /> {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 pb-2">
                        <a href={exportUrl(tab, 'pdf')}><Button variant="outline" size="sm" className="gap-1.5 text-xs"><Download className="w-3.5 h-3.5" /> PDF</Button></a>
                        <a href={exportUrl(tab, 'xlsx')}><Button variant="outline" size="sm" className="gap-1.5 text-xs"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</Button></a>
                    </div>
                </div>

                {/* ---- Effectifs & parité ---- */}
                {tab === 'effectifs' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Kpi label="Effectif total" value={enrollment.total} sub={`${enrollment.gender.male} G · ${enrollment.gender.female} F`} icon={Users} tone="text-blue-600" />
                            <Kpi label="Indice de parité (IPS)" value={enrollment.ips ?? '—'} sub={`${enrollment.part_filles}% de filles`} icon={PieIcon} tone="text-pink-600" />
                            <Kpi label="Taux de redoublement" value={`${enrollment.rates.redoublement}%`} sub={`Promotion ${enrollment.rates.promotion}%`} icon={TrendingUp} tone="text-orange-600" />
                            <Kpi label="Taux d'abandon" value={`${enrollment.rates.abandon}%`} sub={`Âge moyen ${enrollment.age_moyen ?? '—'}`} icon={GraduationCap} tone="text-red-600" />
                        </div>
                        <div className="grid lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2"><Card title="Effectifs par classe (garçons / filles)" icon={<Users className="w-4 h-4" />}>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={enrollment.by_class}>
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                                        <RTooltip />
                                        <Bar dataKey="male" name="Garçons" stackId="a" fill={BLUE} radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="female" name="Filles" stackId="a" fill={PINK} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card></div>
                            <Card title="Répartition par sexe" icon={<PieIcon className="w-4 h-4" />}>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}
                                            data={[{ name: 'Garçons', value: enrollment.gender.male }, { name: 'Filles', value: enrollment.gender.female }, { name: 'Autre', value: enrollment.gender.other }].filter((d) => d.value > 0)}>
                                            {[BLUE, PINK, SLATE].map((c) => <Cell key={c} fill={c} />)}
                                        </Pie>
                                        <RTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-5">
                            <Card title="Pyramide des âges" icon={<BarChart3 className="w-4 h-4" />}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={enrollment.age_distribution}>
                                        <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                                        <RTooltip />
                                        <Bar dataKey="total" name="Élèves" fill={VIOLET} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Origine géographique (top villes)" icon={<Users className="w-4 h-4" />}>
                                {enrollment.by_city.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Non renseigné</p> : (
                                    <div className="space-y-2">
                                        {enrollment.by_city.map((c) => (
                                            <div key={c.city} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">{c.city}</span>
                                                <span className="font-semibold">{c.total}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                )}

                {/* ---- Finances ---- */}
                {tab === 'finances' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Kpi label="Total facturé" value={money(finance.billed)} sub={`${finance.total_invoices} factures`} icon={Wallet} tone="text-blue-600" />
                            <Kpi label="Encaissé" value={money(finance.collected)} icon={TrendingUp} tone="text-green-600" />
                            <Kpi label="Taux de recouvrement" value={`${finance.recovery_rate}%`} sub={money(finance.remaining) + ' restant'} icon={PieIcon} tone="text-orange-600" />
                            <Kpi label="Impayés" value={finance.unpaid_count} sub={`${finance.partial_count} partiels`} icon={GraduationCap} tone="text-red-600" />
                        </div>
                        <div className="grid lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2"><Card title="Encaissements mensuels" icon={<TrendingUp className="w-4 h-4" />}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={finance.monthly}>
                                        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BLUE} stopOpacity={0.35} /><stop offset="95%" stopColor={BLUE} stopOpacity={0} /></linearGradient></defs>
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`} />
                                        <RTooltip formatter={(v: number) => money(Number(v))} />
                                        <Area type="monotone" dataKey="total" stroke={BLUE} strokeWidth={2} fill="url(#g)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card></div>
                            <Card title="Modes de paiement" icon={<PieIcon className="w-4 h-4" />}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie dataKey="total" nameKey="method" innerRadius={45} outerRadius={85} paddingAngle={2}
                                            data={finance.by_method.map((m) => ({ ...m, method: methodLabel[m.method] ?? m.method }))}>
                                            {finance.by_method.map((_, i) => <Cell key={i} fill={[GREEN, BLUE, VIOLET, ORANGE, SLATE][i % 5]} />)}
                                        </Pie>
                                        <RTooltip formatter={(v: number) => money(Number(v))} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                        <Card title="Recouvrement par classe" icon={<Wallet className="w-4 h-4" />}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
                                        <th className="py-2">Classe</th><th className="py-2 text-right">Facturé</th><th className="py-2 text-right">Encaissé</th><th className="py-2 text-right">Taux</th></tr></thead>
                                    <tbody>{finance.by_class.map((c) => (
                                        <tr key={c.name} className="border-b border-gray-50 dark:border-gray-700/50">
                                            <td className="py-2">{c.name}</td><td className="py-2 text-right">{money(c.billed)}</td>
                                            <td className="py-2 text-right text-green-600">{money(c.collected)}</td>
                                            <td className="py-2 text-right font-semibold">{c.rate}%</td>
                                        </tr>))}</tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ---- Réussite ---- */}
                {tab === 'reussite' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Kpi label="Bulletins validés" value={success.bulletins} icon={GraduationCap} tone="text-blue-600" />
                            <Kpi label="Moyenne générale" value={success.moyenne_generale ?? '—'} icon={BarChart3} tone="text-violet-600" />
                            <Kpi label="Réussite interne (≥10)" value={`${success.pass_rate}%`} icon={TrendingUp} tone="text-green-600" />
                            <Kpi label="Admission examens off." value={`${success.exams_summary.admission_rate}%`} sub={`${success.exams_summary.admitted}/${success.exams_summary.registered}`} icon={PieIcon} tone="text-orange-600" />
                        </div>
                        <div className="grid lg:grid-cols-3 gap-5">
                            <Card title="Répartition des mentions" icon={<PieIcon className="w-4 h-4" />}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie dataKey="value" nameKey="name" innerRadius={50} outerRadius={88} paddingAngle={2}
                                            data={[{ name: 'Passable', value: success.mentions.passable }, { name: 'Assez bien', value: success.mentions.assez_bien }, { name: 'Bien', value: success.mentions.bien }, { name: 'Très bien', value: success.mentions.tres_bien }].filter((d) => d.value > 0)}>
                                            {[SLATE, BLUE, VIOLET, GREEN].map((c) => <Cell key={c} fill={c} />)}
                                        </Pie>
                                        <RTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                            <div className="lg:col-span-2"><Card title="Examens officiels (CEPD / BEPC / BAC)" icon={<GraduationCap className="w-4 h-4" />}>
                                {success.exams.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Aucun examen officiel pour cette année</p> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
                                                <th className="py-2">Examen</th><th className="py-2 text-right">Inscrits</th><th className="py-2 text-right">Admis</th><th className="py-2 text-right">Admission</th></tr></thead>
                                            <tbody>{success.exams.map((e, i) => (
                                                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50">
                                                    <td className="py-2"><span className="uppercase text-blue-600 font-bold mr-1.5">{e.type}</span>{e.name}</td>
                                                    <td className="py-2 text-right">{e.registered}</td><td className="py-2 text-right text-green-600">{e.admitted}</td>
                                                    <td className="py-2 text-right font-semibold">{e.admission_rate}%</td>
                                                </tr>))}</tbody>
                                        </table>
                                    </div>
                                )}
                            </Card></div>
                        </div>
                    </div>
                )}

                {/* ---- Encadrement ---- */}
                {tab === 'encadrement' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Kpi label="Ratio élèves / enseignant" value={resources.rem ?? '—'} sub={`${resources.total_teachers} enseignants`} icon={GraduationCap} tone="text-blue-600" />
                            <Kpi label="Effectif total" value={resources.total_students} icon={Users} tone="text-violet-600" />
                            <Kpi label="Taille moyenne / classe" value={resources.avg_class_size} sub={`${resources.class_count} classes`} icon={Layers} tone="text-green-600" />
                            <Kpi label="Classes pléthoriques" value={resources.overcrowded.length} sub={`> ${resources.threshold} élèves`} icon={School} tone="text-orange-600" />
                        </div>
                        <Card title="Effectif par classe (rouge = pléthorique)" icon={<Layers className="w-4 h-4" />}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={resources.class_sizes}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                                    <RTooltip />
                                    <Bar dataKey="total" name="Élèves" radius={[4, 4, 0, 0]}>
                                        {resources.class_sizes.map((c, i) => <Cell key={i} fill={c.total > resources.threshold ? ORANGE : BLUE} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                        {resources.overcrowded.length > 0 && (
                            <Card title="Classes pléthoriques à surveiller" icon={<School className="w-4 h-4" />}>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {resources.overcrowded.map((c) => (
                                        <div key={c.name} className="flex items-center justify-between rounded-lg bg-orange-50 dark:bg-orange-900/20 px-4 py-2.5">
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.name}</span>
                                            <span className="text-sm font-bold text-orange-600">{c.total} élèves</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
