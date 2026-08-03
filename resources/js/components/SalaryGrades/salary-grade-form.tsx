import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export interface SalaryGradeFormData {
    name: string;
    category: string;
    echelon: string;
    base_amount: string;
    sort_order: string;
    active: boolean;
}

interface Props {
    mode: 'create' | 'edit';
    data: SalaryGradeFormData;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    setData: <K extends keyof SalaryGradeFormData>(key: K, value: SalaryGradeFormData[K]) => void;
}

function Err({ msg }: { msg?: string }) {
    return msg ? <p className="text-red-600 text-sm mt-1">{msg}</p> : null;
}

export function SalaryGradeForm({ mode, data, errors, processing, onSubmit, onCancel, setData }: Readonly<Props>) {
    let submitLabel = 'Mettre à jour';
    if (processing && mode === 'create') submitLabel = 'Création...';
    else if (processing) submitLabel = 'Mise à jour...';
    else if (mode === 'create') submitLabel = 'Créer la grille';

    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
            <div className="rounded-2xl bg-linear-to-br from-blue-50 to-white ring-1 ring-blue-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-blue-700">
                    <Layers className="h-4 w-4" />
                    <p className="text-sm font-semibold">Définition de la grille</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                        <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: Enseignant — Catégorie B, échelon 2" className={errors.name ? 'border-red-500' : ''} />
                        <Err msg={errors.name} />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">Catégorie</label>
                        <Input id="category" value={data.category} onChange={e => setData('category', e.target.value)} placeholder="Ex: B" className={errors.category ? 'border-red-500' : ''} />
                        <Err msg={errors.category} />
                    </div>

                    <div>
                        <label htmlFor="echelon" className="block text-sm font-medium text-gray-900 mb-2">Échelon</label>
                        <Input id="echelon" type="number" min={0} value={data.echelon} onChange={e => setData('echelon', e.target.value)} placeholder="Ex: 2" className={errors.echelon ? 'border-red-500' : ''} />
                        <Err msg={errors.echelon} />
                    </div>

                    <div>
                        <label htmlFor="base_amount" className="block text-sm font-medium text-gray-900 mb-2">Salaire de base (F) *</label>
                        <Input id="base_amount" type="number" min={0} value={data.base_amount} onChange={e => setData('base_amount', e.target.value)} placeholder="Ex: 145000" className={errors.base_amount ? 'border-red-500' : ''} />
                        <Err msg={errors.base_amount} />
                    </div>

                    <div>
                        <label htmlFor="sort_order" className="block text-sm font-medium text-gray-900 mb-2">Ordre d'affichage</label>
                        <Input id="sort_order" type="number" min={0} value={data.sort_order} onChange={e => setData('sort_order', e.target.value)} placeholder="0" className={errors.sort_order ? 'border-red-500' : ''} />
                        <Err msg={errors.sort_order} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <Checkbox checked={data.active} onCheckedChange={c => setData('active', c === true)} /> Grille active
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">{submitLabel}</Button>
                <Button type="button" variant="outline" className="border-slate-200 text-gray-700" onClick={onCancel}>Annuler</Button>
            </div>
        </form>
    );
}
