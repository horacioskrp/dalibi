import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface EvaluationType {
    id: string;
    name: string;
}

interface Evaluation {
    id: string;
    name: string;
    description: string | null;
    date: string | null;
    coefficient: number;
    status: 'scheduled' | 'completed';
    evaluation_type_id: string;
    classroom?: { name: string; code: string };
    academic_period?: { name: string };
}

interface EditProps {
    evaluation: Evaluation;
    evaluationTypes: EvaluationType[];
}

export default function Edit({ evaluation, evaluationTypes }: Readonly<EditProps>) {
    const [formData, setFormData] = useState({
        evaluation_type_id: evaluation.evaluation_type_id,
        name: evaluation.name,
        description: evaluation.description || '',
        date: evaluation.date ? evaluation.date.split(' ')[0] : '',
        coefficient: String(evaluation.coefficient),
        status: evaluation.status,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.put(route('evaluations.update', evaluation.id), formData, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Modifier évaluation" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('evaluations.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Modifier l'évaluation</h1>
                        <p className="text-gray-600 mt-1">{evaluation.classroom?.name || '—'} • {evaluation.academic_period?.name || '—'}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="evaluation_type_id" className="block text-sm font-medium text-gray-900 mb-2">Type *</label>
                            <Select value={formData.evaluation_type_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, evaluation_type_id: value }))}>
                                <SelectTrigger id="evaluation_type_id" className={errors.evaluation_type_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {evaluationTypes.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.evaluation_type_id && <p className="text-red-600 text-sm mt-1">{errors.evaluation_type_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="evaluation_name" className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                            <input
                                id="evaluation_name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="evaluation_date" className="block text-sm font-medium text-gray-900 mb-2">Date</label>
                            <input
                                id="evaluation_date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="evaluation_coefficient" className="block text-sm font-medium text-gray-900 mb-2">Coefficient *</label>
                            <input
                                id="evaluation_coefficient"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.coefficient}
                                onChange={(e) => setFormData((prev) => ({ ...prev, coefficient: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.coefficient ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.coefficient && <p className="text-red-600 text-sm mt-1">{errors.coefficient}</p>}
                        </div>

                        <div>
                            <label htmlFor="evaluation_status" className="block text-sm font-medium text-gray-900 mb-2">Statut *</label>
                            <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'scheduled' | 'completed' }))}>
                                <SelectTrigger id="evaluation_status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">Planifiée</SelectItem>
                                    <SelectItem value="completed">Terminée</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="evaluation_description" className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                            <textarea
                                id="evaluation_description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.get(route('evaluations.index'))}>Annuler</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
