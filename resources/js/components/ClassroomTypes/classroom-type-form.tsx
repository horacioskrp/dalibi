import { CheckCircle2, Save, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ClassroomTypeFormData {
    name: string;
    description: string;
    active: boolean;
}

interface ClassroomTypeFormProps {
    mode: 'create' | 'edit';
    data: ClassroomTypeFormData;
    errors: Record<string, string>;
    processing: boolean;
    onCancel: () => void;
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
    setData: <K extends keyof ClassroomTypeFormData>(key: K, value: ClassroomTypeFormData[K]) => void;
}

export function ClassroomTypeForm({
    mode,
    data,
    errors,
    processing,
    onCancel,
    onSubmit,
    setData,
}: Readonly<ClassroomTypeFormProps>) {
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
                        <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Informations du type</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            disabled={processing}
                            className={errors.name ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                            placeholder="Ex: Classe générale"
                        />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                        <Textarea
                            id="description"
                            rows={4}
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            disabled={processing}
                            className={errors.description ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                            placeholder="Description du type de classe..."
                        />
                        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-5 bg-linear-to-br from-emerald-50/60 to-white ring-1 ring-emerald-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-emerald-100">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Statut</h3>
                </div>

                <div className="flex items-center gap-3">
                    <Checkbox
                        id="active"
                        checked={data.active}
                        onCheckedChange={(checked) => setData('active', checked === true)}
                    />
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">Type actif</label>
                </div>
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