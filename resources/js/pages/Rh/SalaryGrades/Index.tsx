import { Head, router, useForm } from '@inertiajs/react';
import { Layers, Plus, Pencil, Trash2, Clock, Save, Users } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMoney } from '@/helpers/money';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Grade {
    id: string;
    name: string;
    category: string | null;
    echelon: number | null;
    base_amount: number;
    active: boolean;
    employee_profiles_count: number;
}

interface Settings {
    seniority_enabled: boolean;
    seniority_rate_per_year: number;
    seniority_cap_percent: number;
}

interface Props { grades: Grade[]; settings: Settings; }

export default function Index({ grades, settings }: Readonly<Props>) {
    const fmt = useMoney();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [seniorityOpen, setSeniorityOpen] = useState(false);

    const senForm = useForm({
        seniority_enabled: settings.seniority_enabled,
        seniority_rate_per_year: String(settings.seniority_rate_per_year),
        seniority_cap_percent: String(settings.seniority_cap_percent),
    });

    const saveSettings = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        senForm.put(route('salary-grades.settings'), { preserveScroll: true, onSuccess: () => setSeniorityOpen(false) });
    };

    return (
        <AppLayout>
            <Head title="Grilles salariales" />
            <div className="space-y-5">
                {/* En-tête */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Layers className="w-7 h-7 text-blue-600" /> Grilles salariales
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Chaque catégorie/échelon porte un salaire de base ; l'employé y est rattaché depuis sa fiche.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => setSeniorityOpen(true)}>
                            <Clock className="w-4 h-4 text-amber-600" /> Prime d'ancienneté
                        </Button>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('salary-grades.create'))}>
                            <Plus className="w-4 h-4" /> Nouvelle grille
                        </Button>
                    </div>
                </div>

                {/* État de l'ancienneté */}
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-4 py-2.5 flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-amber-500" />
                    {settings.seniority_enabled
                        ? <span>Prime d'ancienneté <strong className="text-emerald-600">active</strong> : +{settings.seniority_rate_per_year}% du base par année{settings.seniority_cap_percent > 0 ? `, plafonnée à ${settings.seniority_cap_percent}%` : ''}.</span>
                        : <span>Prime d'ancienneté <strong className="text-gray-500">désactivée</strong>.</span>}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-700">{grades.length} grille(s)</p>
                    </div>
                    {grades.length === 0 ? (
                        <div className="px-5 py-16 text-center text-gray-400">
                            <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Aucune grille salariale</p>
                            <Button className="mt-3 gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('salary-grades.create'))}>
                                <Plus className="w-4 h-4" /> Créer la première grille
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grille</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Catégorie / échelon</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Employés</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Salaire de base</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                        <th className="px-4 py-3 w-24"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {grades.map(g => (
                                        <tr key={g.id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-3 font-medium text-gray-900">{g.name}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {[g.category && `Cat. ${g.category}`, g.echelon != null && `échelon ${g.echelon}`].filter(Boolean).join(' · ') || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 text-gray-600">
                                                    <Users className="w-3.5 h-3.5 text-gray-400" /> {g.employee_profiles_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(g.base_amount)}</td>
                                            <td className="px-4 py-3">
                                                {g.active
                                                    ? <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                                                    : <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Inactive</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => router.get(route('salary-grades.employees', g.id))} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" aria-label="Affecter des employés" title="Affecter des employés"><Users className="w-4 h-4" /></button>
                                                    <button onClick={() => router.get(route('salary-grades.edit', g.id))} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" aria-label="Modifier"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeletingId(g.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal : prime d'ancienneté */}
            <Dialog open={seniorityOpen} onOpenChange={setSeniorityOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-amber-600" /> Prime d'ancienneté</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={saveSettings} className="space-y-4">
                        <p className="text-sm text-gray-500">Calcul automatique appliqué à chaque bulletin, en fonction de la date d'embauche de l'employé.</p>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <Checkbox checked={senForm.data.seniority_enabled} onCheckedChange={c => senForm.setData('seniority_enabled', c === true)} />
                            Activer la prime d'ancienneté
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Taux par année (% du base)</label>
                                <Input type="number" min={0} max={100} step="0.5" value={senForm.data.seniority_rate_per_year} onChange={e => senForm.setData('seniority_rate_per_year', e.target.value)} disabled={!senForm.data.seniority_enabled} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Plafond (% du base, 0 = aucun)</label>
                                <Input type="number" min={0} max={100} step="0.5" value={senForm.data.seniority_cap_percent} onChange={e => senForm.setData('seniority_cap_percent', e.target.value)} disabled={!senForm.data.seniority_enabled} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Exemple : 2%/an plafonné à 30% → un employé avec 5 ans d'ancienneté reçoit +10% du salaire de base.</p>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setSeniorityOpen(false)}>Annuler</Button>
                            <Button type="submit" disabled={senForm.processing} className="gap-2 bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4" /> Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette grille ?</AlertDialogTitle>
                        <AlertDialogDescription>Impossible si des employés y sont rattachés. Les bulletins déjà générés ne sont pas affectés.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
                            if (deletingId) router.delete(route('salary-grades.destroy', deletingId), { preserveScroll: true, onFinish: () => setDeletingId(null) });
                        }}>Supprimer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
