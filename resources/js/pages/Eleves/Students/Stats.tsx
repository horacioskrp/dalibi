import { Head, router } from '@inertiajs/react';
import { GraduationCap, Users, UserCheck, UserX, BarChart3, Layers } from 'lucide-react';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Bar { label: string; count: number; }

interface YearRef { id: string; year: string; }

interface Props {
    summary: { enrolled: number; active: number; inactive: number; classes: number };
    byGender: { male: number; female: number };
    byNationality: Bar[];
    byAge: Bar[];
    byClass: Bar[];
    academicYears: YearRef[];
    selectedYear: YearRef | null;
}

function BarList({ title, items, color }: Readonly<{ title: string; items: Bar[]; color: string }>) {
    const max = Math.max(...items.map(i => i.count), 1);
    return (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{title}</h2>
            {items.length === 0 || items.every(i => i.count === 0) ? (
                <p className="text-sm text-gray-400 text-center py-6">Aucune donnée</p>
            ) : (
                <div className="space-y-3">
                    {items.map((i, idx) => (
                        <div key={`${i.label}-${idx}`}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">{i.label}</span>
                                <span className="font-semibold text-gray-900">{i.count}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round((i.count / max) * 100)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Stats({ summary, byGender, byNationality, byAge, byClass, academicYears, selectedYear }: Readonly<Props>) {
    const genderTotal = byGender.male + byGender.female;
    const malePct = genderTotal > 0 ? Math.round((byGender.male / genderTotal) * 100) : 0;

    const cards = [
        { label: `Inscrits ${selectedYear?.year ?? ''}`, value: summary.enrolled, color: 'text-blue-600', icon: GraduationCap },
        { label: 'Actifs', value: summary.active, color: 'text-emerald-600', icon: UserCheck },
        { label: 'Inactifs', value: summary.inactive, color: 'text-gray-400', icon: UserX },
        { label: 'Classes', value: summary.classes, color: 'text-violet-600', icon: Layers },
    ];

    const changeYear = (id: string) =>
        router.get(route('students.stats'), { academic_year_id: id }, { preserveScroll: true, replace: true });

    return (
        <AppLayout>
            <Head title="Statistiques élèves" />
            <div className="w-full space-y-6">

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3"><BarChart3 className="h-7 w-7 text-blue-600 shrink-0" />Statistiques élèves</h1>
                        <p className="mt-2 text-gray-500">Vue démographique et effectifs des élèves inscrits pour l'année sélectionnée.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="stats_year" className="text-sm font-medium text-gray-600">Année</label>
                        <select
                            id="stats_year"
                            value={selectedYear?.id ?? ''}
                            onChange={(e) => changeYear(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {academicYears.map((y) => (
                                <option key={y.id} value={y.id}>{y.year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map(c => {
                        const Icon = c.icon;
                        return (
                            <div key={c.label} className="bg-gray-50 ring-1 ring-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">{c.label}</p>
                                    <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                                </div>
                                <Icon className={`w-8 h-8 ${c.color} opacity-25`} />
                            </div>
                        );
                    })}
                </div>

                {/* Répartition par sexe (barre combinée) */}
                <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Répartition par sexe</h2>
                    {genderTotal === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Aucune donnée</p>
                    ) : (
                        <>
                            <div className="flex h-4 rounded-full overflow-hidden ring-1 ring-gray-100">
                                <div className="bg-blue-500" style={{ width: `${malePct}%` }} />
                                <div className="bg-pink-400" style={{ width: `${100 - malePct}%` }} />
                            </div>
                            <div className="flex justify-between mt-3 text-sm">
                                <span className="inline-flex items-center gap-2 text-blue-600"><span className="w-3 h-3 rounded-full bg-blue-500" /> Garçons : <strong>{byGender.male}</strong> ({malePct}%)</span>
                                <span className="inline-flex items-center gap-2 text-pink-500"><span className="w-3 h-3 rounded-full bg-pink-400" /> Filles : <strong>{byGender.female}</strong> ({100 - malePct}%)</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BarList title="Par tranche d'âge" items={byAge} color="bg-violet-500" />
                    <BarList title="Par nationalité (top 6)" items={byNationality} color="bg-emerald-500" />
                </div>

                <BarList title={`Effectifs par classe${selectedYear ? ` — ${selectedYear.year}` : ''}`} items={byClass} color="bg-blue-500" />
            </div>
        </AppLayout>
    );
}
