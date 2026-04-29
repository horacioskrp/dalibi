import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
    Hash,
    Pencil,
    Save,
    Tag,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

            <div className="max-w-5xl space-y-6">
                {/* En-tête */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.get(route('evaluations.index'))}
                        className="p-2 hover:bg-indigo-50 rounded-xl transition text-indigo-600 border border-indigo-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                            <Pencil className="w-7 h-7 text-indigo-600" />
                            Modifier l'évaluation
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            {evaluation.classroom?.name || '—'}
                            {evaluation.academic_period?.name ? ` • ${evaluation.academic_period.name}` : ''}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-2xl p-6 bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
                        <h2 className="text-base font-semibold text-indigo-800 mb-5 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            Informations de l'évaluation
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Type */}
                            <div className="space-y-1.5">
                                <label htmlFor="evaluation_type_id" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Tag className="w-4 h-4 text-indigo-400" />
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.evaluation_type_id}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, evaluation_type_id: value }))}
                                >
                                    <SelectTrigger
                                        id="evaluation_type_id"
                                        className={`bg-white ${errors.evaluation_type_id ? 'border-red-400 ring-1 ring-red-300' : 'border-indigo-200'}`}
                                    >
                                        <SelectValue placeholder="Type d'évaluation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {evaluationTypes.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.evaluation_type_id && (
                                    <p className="text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" />{errors.evaluation_type_id}</p>
                                )}
                            </div>

                            {/* Nom */}
                            <div className="space-y-1.5">
                                <label htmlFor="evaluation_name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="evaluation_name"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Devoir 1"
                                    className={errors.name ? 'border-red-400 bg-red-50/40 ring-1 ring-red-300' : 'border-indigo-200 bg-white focus-visible:ring-indigo-400'}
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" />{errors.name}</p>
                                )}
                            </div>

                            {/* Date */}
                            <div className="space-y-1.5">
                                <label htmlFor="evaluation_date" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <CalendarDays className="w-4 h-4 text-indigo-400" />
                                    Date
                                </label>
                                <Input
                                    id="evaluation_date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                                    className="border-indigo-200 bg-white focus-visible:ring-indigo-400"
                                />
                            </div>

                            {/* Coefficient */}
                            <div className="space-y-1.5">
                                <label htmlFor="evaluation_coefficient" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Hash className="w-4 h-4 text-indigo-400" />
                                    Coefficient <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="evaluation_coefficient"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.coefficient}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, coefficient: e.target.value }))}
                                    className={errors.coefficient ? 'border-red-400 bg-red-50/40 ring-1 ring-red-300' : 'border-indigo-200 bg-white focus-visible:ring-indigo-400'}
                                />
                                {errors.coefficient && (
                                    <p className="text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" />{errors.coefficient}</p>
                                )}
                            </div>

                            {/* Statut */}
                            <div className="space-y-1.5">
                                <label htmlFor="evaluation_status" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    Statut <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'scheduled' | 'completed' }))}
                                >
                                    <SelectTrigger id="evaluation_status" className="border-indigo-200 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">
                                            <span className="flex items-center gap-2 text-amber-600">
                                                <Clock className="w-3.5 h-3.5" />
                                                Planifiée
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            <span className="flex items-center gap-2 text-emerald-600">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Terminée
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label htmlFor="evaluation_description" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    Description
                                </label>
                                <Textarea
                                    id="evaluation_description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Description optionnelle..."
                                    className="border-indigo-200 bg-white focus-visible:ring-indigo-400 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pb-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm min-w-40"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => router.get(route('evaluations.index'))}
                        >
                            <X className="w-4 h-4 mr-1.5" />
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

