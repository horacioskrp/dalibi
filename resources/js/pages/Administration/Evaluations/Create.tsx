import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface OptionItem {
    id: string;
    name: string;
    code?: string;
}

interface EvaluationLine {
    temp_id: string;
    evaluation_type_id: string;
    name: string;
    description: string;
    date: string;
    coefficient: string;
    status: 'scheduled' | 'completed';
}

interface CreateProps {
    evaluationTypes: OptionItem[];
    classrooms: OptionItem[];
    academicPeriods: OptionItem[];
}

const emptyLine = (): EvaluationLine => ({
    temp_id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    evaluation_type_id: '',
    name: '',
    description: '',
    date: '',
    coefficient: '1',
    status: 'scheduled',
});

export default function Create({ evaluationTypes, classrooms, academicPeriods }: Readonly<CreateProps>) {
    const [classId, setClassId] = useState('');
    const [academicPeriodId, setAcademicPeriodId] = useState('');
    const [evaluations, setEvaluations] = useState<EvaluationLine[]>([emptyLine()]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateLine = (index: number, key: keyof EvaluationLine, value: string) => {
        setEvaluations((prev) => prev.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
    };

    const addLine = () => setEvaluations((prev) => [...prev, emptyLine()]);
    const removeLine = (index: number) => {
        if (evaluations.length === 1) {
            return;
        }
        setEvaluations((prev) => prev.filter((_, i) => i !== index));
    };

    const submit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('evaluations.store'), {
            class_id: classId,
            academic_period_id: academicPeriodId,
            evaluations,
        }, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Créer des évaluations" />

            <div className="max-w-6xl space-y-6">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('evaluations.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Créer plusieurs évaluations</h1>
                        <p className="text-gray-600 mt-2">Ajoutez plusieurs lignes puis enregistrez en une seule opération.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-2xl p-5 bg-linear-to-br from-blue-50/60 to-white ring-1 ring-blue-100 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contexte commun</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="class_id" className="block text-sm font-medium text-gray-900 mb-2">Classe *</label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger id="class_id" className={errors.class_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Sélectionner une classe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>{item.name}{item.code ? ` (${item.code})` : ''}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.class_id && <p className="text-red-600 text-sm mt-1">{errors.class_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="academic_period_id" className="block text-sm font-medium text-gray-900 mb-2">Période académique *</label>
                                <Select value={academicPeriodId} onValueChange={setAcademicPeriodId}>
                                    <SelectTrigger id="academic_period_id" className={errors.academic_period_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Sélectionner une période" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicPeriods.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.academic_period_id && <p className="text-red-600 text-sm mt-1">{errors.academic_period_id}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl p-5 bg-linear-to-br from-violet-50/60 to-white ring-1 ring-violet-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Évaluations</h2>
                            <Button type="button" variant="outline" className="border-gray-300" onClick={addLine}>
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter une ligne
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {evaluations.map((line, index) => {
                                const typeErrorKey = `evaluations.${index}.evaluation_type_id`;
                                const nameErrorKey = `evaluations.${index}.name`;
                                const coefficientErrorKey = `evaluations.${index}.coefficient`;

                                return (
                                <div key={line.temp_id} className="rounded-xl border border-violet-200/70 bg-white/80 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-700">Évaluation #{index + 1}</p>
                                        <Button type="button" variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => removeLine(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div>
                                            <label htmlFor={`evaluation_type_id_${line.temp_id}`} className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                                            <Select value={line.evaluation_type_id} onValueChange={(value) => updateLine(index, 'evaluation_type_id', value)}>
                                                <SelectTrigger id={`evaluation_type_id_${line.temp_id}`} className={errors[typeErrorKey] ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {evaluationTypes.map((item) => (
                                                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label htmlFor={`evaluation_name_${line.temp_id}`} className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                                            <Input
                                                id={`evaluation_name_${line.temp_id}`}
                                                value={line.name}
                                                onChange={(e) => updateLine(index, 'name', e.target.value)}
                                                className={errors[nameErrorKey] ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor={`evaluation_date_${line.temp_id}`} className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                            <Input
                                                id={`evaluation_date_${line.temp_id}`}
                                                type="date"
                                                value={line.date}
                                                onChange={(e) => updateLine(index, 'date', e.target.value)}
                                                className="border-gray-200 bg-white focus-visible:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor={`evaluation_coefficient_${line.temp_id}`} className="block text-xs font-medium text-gray-700 mb-1">Coefficient *</label>
                                            <Input
                                                id={`evaluation_coefficient_${line.temp_id}`}
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={line.coefficient}
                                                onChange={(e) => updateLine(index, 'coefficient', e.target.value)}
                                                className={errors[coefficientErrorKey] ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor={`evaluation_status_${line.temp_id}`} className="block text-xs font-medium text-gray-700 mb-1">Statut *</label>
                                            <Select value={line.status} onValueChange={(value) => updateLine(index, 'status', value)}>
                                                <SelectTrigger id={`evaluation_status_${line.temp_id}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="scheduled">Planifiée</SelectItem>
                                                    <SelectItem value="completed">Terminée</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="lg:col-span-3">
                                            <label htmlFor={`evaluation_description_${line.temp_id}`} className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                            <Textarea
                                                id={`evaluation_description_${line.temp_id}`}
                                                rows={2}
                                                value={line.description}
                                                onChange={(e) => updateLine(index, 'description', e.target.value)}
                                                className="border-gray-200 bg-white focus-visible:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                        {errors[typeErrorKey] && <p className="text-red-600">{errors[typeErrorKey]}</p>}
                                        {errors[nameErrorKey] && <p className="text-red-600">{errors[nameErrorKey]}</p>}
                                        {errors[coefficientErrorKey] && <p className="text-red-600">{errors[coefficientErrorKey]}</p>}
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        {errors.evaluations && <p className="text-red-600 text-sm">{errors.evaluations}</p>}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les évaluations'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.get(route('evaluations.index'))}>Annuler</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
