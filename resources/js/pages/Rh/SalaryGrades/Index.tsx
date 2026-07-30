import { Head, router, useForm } from '@inertiajs/react';
import { Layers, Plus, Trash2, Clock, Save } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

    const gradeForm = useForm({ name: '', category: '', echelon: '', base_amount: '', active: true });
    const senForm = useForm({
        seniority_enabled: settings.seniority_enabled,
        seniority_rate_per_year: String(settings.seniority_rate_per_year),
        seniority_cap_percent: String(settings.seniority_cap_percent),
    });

    const addGrade = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        gradeForm.post(route('salary-grades.store'), { preserveScroll: true, onSuccess: () => gradeForm.reset() });
    };

    const saveSettings = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        senForm.put(route('salary-grades.settings'), { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Grilles salariales" />
            <div className="space-y-6 max-w-5xl">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Layers className="w-7 h-7 text-blue-600" /> Grilles salariales
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Chaque catégorie/échelon porte un salaire de base ; l'employé y est rattaché depuis sa fiche.</p>
                </div>

                {/* Ajout grille */}
                <form onSubmit={addGrade} className="rounded-2xl bg-linear-to-br from-blue-50 to-white ring-1 ring-blue-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-blue-700"><Plus className="h-4 w-4" /><p className="text-sm font-semibold">Ajouter une grille</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                            <Input value={gradeForm.data.name} onChange={e => gradeForm.setData('name', e.target.value)} placeholder="Ex: Enseignant — Catégorie B, échelon 2" className={gradeForm.errors.name ? 'border-red-500' : ''} />
                            {gradeForm.errors.name && <p className="text-red-600 text-sm mt-1">{gradeForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Catégorie</label>
                            <Input value={gradeForm.data.category} onChange={e => gradeForm.setData('category', e.target.value)} placeholder="Ex: B" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Échelon</label>
                            <Input type="number" min={0} value={gradeForm.data.echelon} onChange={e => gradeForm.setData('echelon', e.target.value)} placeholder="Ex: 2" />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Salaire de base (F) *</label>
                            <Input type="number" min={0} value={gradeForm.data.base_amount} onChange={e => gradeForm.setData('base_amount', e.target.value)} placeholder="Ex: 145000" className={gradeForm.errors.base_amount ? 'border-red-500' : ''} />
                            {gradeForm.errors.base_amount && <p className="text-red-600 text-sm mt-1">{gradeForm.errors.base_amount}</p>}
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm text-gray-700 h-10">
                                <Checkbox checked={gradeForm.data.active} onCheckedChange={c => gradeForm.setData('active', c === true)} /> Active
                            </label>
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" disabled={gradeForm.processing} className="gap-2 bg-blue-600 hover:bg-blue-700 w-full"><Plus className="w-4 h-4" /> Ajouter</Button>
                        </div>
                    </div>
                </form>

                {/* Liste grilles */}
                <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-3">{grades.length} grille(s)</p>
                    {grades.length === 0 ? <p className="text-sm text-gray-400">Aucune grille.</p> : (
                        <div className="divide-y divide-slate-100">
                            {grades.map(g => (
                                <div key={g.id} className="flex items-center justify-between gap-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                            {g.name}
                                            {!g.active && <span className="text-[10px] uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">inactive</span>}
                                        </p>
                                        <p className="text-xs text-gray-400">{[g.category && `Cat. ${g.category}`, g.echelon != null && `échelon ${g.echelon}`].filter(Boolean).join(' · ') || '—'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-sm font-semibold text-gray-900">{fmt(g.base_amount)}</span>
                                        <button onClick={() => setDeletingId(g.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Réglage ancienneté */}
                <form onSubmit={saveSettings} className="rounded-2xl bg-linear-to-br from-amber-50 to-white ring-1 ring-amber-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-amber-700"><Clock className="h-4 w-4" /><p className="text-sm font-semibold">Prime d'ancienneté (automatique)</p></div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <Checkbox checked={senForm.data.seniority_enabled} onCheckedChange={c => senForm.setData('seniority_enabled', c === true)} />
                        Activer la prime d'ancienneté (appliquée automatiquement à chaque bulletin)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Taux par année (% du base)</label>
                            <Input type="number" min={0} max={100} step="0.5" value={senForm.data.seniority_rate_per_year} onChange={e => senForm.setData('seniority_rate_per_year', e.target.value)} disabled={!senForm.data.seniority_enabled} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Plafond (% du base, 0 = aucun)</label>
                            <Input type="number" min={0} max={100} step="0.5" value={senForm.data.seniority_cap_percent} onChange={e => senForm.setData('seniority_cap_percent', e.target.value)} disabled={!senForm.data.seniority_enabled} />
                        </div>
                    </div>
                    <Button type="submit" disabled={senForm.processing} className="gap-2 bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4" /> Enregistrer</Button>
                </form>
            </div>

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
