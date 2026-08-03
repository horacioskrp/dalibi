import { Head, router, useForm } from '@inertiajs/react';
import { Coins, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useMoney } from '@/helpers/money';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Component {
    id: string;
    name: string;
    code: string | null;
    type: 'earning' | 'deduction';
    default_amount: number | null;
    is_default: boolean;
    active: boolean;
}

interface Props { components: Component[]; }

interface FormData {
    name: string; code: string; type: string; default_amount: string; is_default: boolean; active: boolean;
}

export default function Index({ components }: Readonly<Props>) {
    const fmt = useMoney();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '', code: '', type: 'earning', default_amount: '', is_default: false, active: true,
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('salary-components.store'), { preserveScroll: true, onSuccess: () => reset() });
    };

    const earnings = components.filter(c => c.type === 'earning');
    const deductions = components.filter(c => c.type === 'deduction');

    const Row = ({ c }: { c: Component }) => (
        <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {c.name}
                    {c.is_default && <span className="text-[10px] uppercase tracking-wide bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">auto</span>}
                    {!c.active && <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">inactive</span>}
                </p>
                {c.code && <p className="text-xs text-gray-400">{c.code}</p>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-gray-600">{c.default_amount != null ? fmt(c.default_amount) : '—'}</span>
                <button onClick={() => setDeletingId(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Supprimer">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <AppLayout>
            <Head title="Rubriques de paie" />
            <div className="space-y-6 max-w-5xl">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Coins className="w-7 h-7 text-amber-500" /> Rubriques de paie
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gains et retenues réutilisables dans les bulletins. Les rubriques « auto » sont appliquées à la génération d'un cycle.</p>
                </div>

                {/* Ajout */}
                <form onSubmit={submit} className="rounded-2xl bg-linear-to-br from-amber-50 to-white ring-1 ring-amber-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-amber-700">
                        <Plus className="h-4 w-4" /><p className="text-sm font-semibold">Ajouter une rubrique</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: Prime de transport" className={errors.name ? 'border-red-500' : ''} />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Type *</label>
                            <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="earning">Gain</SelectItem>
                                    <SelectItem value="deduction">Retenue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Montant par défaut</label>
                            <Input type="number" min={0} value={data.default_amount} onChange={e => setData('default_amount', e.target.value)} placeholder="Optionnel" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Code</label>
                            <Input value={data.code} onChange={e => setData('code', e.target.value)} placeholder="Ex: CNSS" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <Checkbox checked={data.is_default} onCheckedChange={c => setData('is_default', c === true)} />
                            Appliquer automatiquement à chaque bulletin
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <Checkbox checked={data.active} onCheckedChange={c => setData('active', c === true)} />
                            Active
                        </label>
                        <Button type="submit" disabled={processing} className="ml-auto gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4" /> Ajouter
                        </Button>
                    </div>
                </form>

                {/* Listes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-white ring-1 ring-emerald-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-700 mb-3">
                            <TrendingUp className="h-4 w-4" /><p className="text-sm font-semibold">Gains ({earnings.length})</p>
                        </div>
                        {earnings.length === 0 ? <p className="text-sm text-gray-400">Aucun gain.</p> : earnings.map(c => <Row key={c.id} c={c} />)}
                    </div>
                    <div className="rounded-2xl bg-white ring-1 ring-red-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-red-700 mb-3">
                            <TrendingDown className="h-4 w-4" /><p className="text-sm font-semibold">Retenues ({deductions.length})</p>
                        </div>
                        {deductions.length === 0 ? <p className="text-sm text-gray-400">Aucune retenue.</p> : deductions.map(c => <Row key={c.id} c={c} />)}
                    </div>
                </div>
            </div>

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette rubrique ?</AlertDialogTitle>
                        <AlertDialogDescription>Les bulletins déjà générés ne sont pas affectés (leurs lignes sont figées).</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
                            if (deletingId) router.delete(route('salary-components.destroy', deletingId), { preserveScroll: true, onFinish: () => setDeletingId(null) });
                        }}>Supprimer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
