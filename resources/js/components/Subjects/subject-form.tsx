import { BookOpen, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface SubjectFormData {
    name: string;
    code: string;
    description: string;
}

interface SubjectFormProps {
    mode: 'create' | 'edit';
    data: SubjectFormData;
    errors: Record<string, string>;
    processing: boolean;
    onCancel: () => void;
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
    setData: <K extends keyof SubjectFormData>(key: K, value: SubjectFormData[K]) => void;
}

export function SubjectForm({
    mode,
    data,
    errors,
    processing,
    onCancel,
    onSubmit,
    setData,
}: Readonly<SubjectFormProps>) {
    let submitLabel = 'Mettre à jour';

    if (processing && mode === 'create') {
        submitLabel = 'Création...';
    } else if (processing) {
        submitLabel = 'Mise à jour...';
    } else if (mode === 'create') {
        submitLabel = 'Créer la matière';
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl p-5 bg-linear-to-br from-blue-50/60 to-white ring-1 ring-blue-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Informations de la matière</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-900 mb-2">Code *</label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(event) => setData('code', event.target.value.toUpperCase())}
                            disabled={processing}
                            placeholder="Ex: MATH101"
                            className={errors.code ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                        />
                        <p className="text-xs text-gray-500 mt-1">Code unique utilise pour identifier la matière.</p>
                        {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code}</p>}
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            disabled={processing}
                            placeholder="Ex: Mathématiques"
                            className={errors.name ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                        />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                        <Textarea
                            id="description"
                            rows={4}
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            disabled={processing}
                            placeholder="Décrivez brièvement le contenu et les objectifs de la matière..."
                            className={errors.description ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                        />
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">Optionnel, maximum 1000 caractères.</p>
                            <p className="text-xs text-gray-500">{data.description.length}/1000</p>
                        </div>
                        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-5 bg-linear-to-br from-amber-50/60 to-white ring-1 ring-amber-100 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Aperçu</h3>
                </div>
                <p className="text-sm text-gray-700">
                    <span className="font-medium">{data.code || 'CODE'}</span>
                    {' · '}
                    <span className="font-medium">{data.name || 'Nom de la matière'}</span>
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