import { ClipboardList, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface EvaluationTypeFormData {
    name: string;
    category: string;
    description: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    continu: 'Contrôle continu (note de classe)',
    composition: 'Composition (examen)',
};

interface EvaluationTypeFormProps {
    mode: 'create' | 'edit';
    data: EvaluationTypeFormData;
    errors: Record<string, string>;
    processing: boolean;
    onCancel: () => void;
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
    setData: <K extends keyof EvaluationTypeFormData>(key: K, value: EvaluationTypeFormData[K]) => void;
}

export function EvaluationTypeForm({
    mode,
    data,
    errors,
    processing,
    onCancel,
    onSubmit,
    setData,
}: Readonly<EvaluationTypeFormProps>) {
    let submitLabel = 'Mettre à jour';

    if (processing && mode === 'create') {
        submitLabel = 'Création...';
    } else if (processing) {
        submitLabel = 'Mise à jour...';
    } else if (mode === 'create') {
        submitLabel = 'Créer le type';
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl p-5 bg-linear-to-br from-blue-50/60 to-white ring-1 ring-blue-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Informations du type d'évaluation</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            disabled={processing}
                            placeholder="Ex: Devoir surveillé"
                            className={errors.name ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                        />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Catégorie *</label>
                        <Select value={data.category} onValueChange={(v) => setData('category', v)} disabled={processing}>
                            <SelectTrigger className={errors.category ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white'}>
                                <SelectValue placeholder="Choisir une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">Détermine si les notes alimentent la « note de classe » ou la « composition » du bulletin.</p>
                        {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                        <Textarea
                            id="description"
                            rows={4}
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            disabled={processing}
                            placeholder="Précisez le contexte pédagogique de ce type d'évaluation..."
                            className={errors.description ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                        />
                        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-5 bg-linear-to-br from-amber-50/60 to-white ring-1 ring-amber-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Aperçu</h3>
                </div>
                <p className="text-sm text-gray-700 mt-3">
                    <span className="font-semibold">{data.name || 'Nom du type'}</span>
                    {data.category && <span className="ml-2 text-xs text-gray-500">— {CATEGORY_LABELS[data.category] ?? data.category}</span>}
                </p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {data.description || 'Aucune description renseignée.'}
                </p>
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={processing} className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
                    Annuler
                </Button>
                <Button type="submit" disabled={processing} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Save className="w-4 h-4" />
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}