import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    Hash,
    Plus,
    Save,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Badge } from '@/components/ui/badge';
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
    is_current?: boolean;
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
    currentAcademicPeriodId?: string;
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

export default function Create({ evaluationTypes, classrooms, academicPeriods, currentAcademicPeriodId }: Readonly<CreateProps>) {
    const [classId, setClassId] = useState('');
    const [academicPeriodId, setAcademicPeriodId] = useState(currentAcademicPeriodId ?? '');
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: Record<string, any> = {
            class_id: classId,
            academic_period_id: academicPeriodId,
            evaluations,
        };

        router.post(route('evaluations.store'), payload, {
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

            <div className="space-y-6">
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
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Créer des évaluations
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">Ajoutez plusieurs évaluations puis enregistrez en une seule opération.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Contexte commun */}
                    <div className="rounded-2xl p-6 bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
                        <h2 className="text-base font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            Contexte commun
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Classe */}
                            <div className="space-y-1.5">
                                <label htmlFor="class_id" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                                    Classe <span className="text-red-500">*</span>
                                </label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger
                                        id="class_id"
                                        className={`bg-white ${errors.class_id ? 'border-red-400 ring-1 ring-red-300' : 'border-indigo-200 focus:ring-indigo-400'}`}
                                    >
                                        <SelectValue placeholder="Sélectionner une classe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name}{item.code ? ` (${item.code})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.class_id && <p className="text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" />{errors.class_id}</p>}
                            </div>

                            {/* Période académique */}
                            <div className="space-y-1.5">
                                <label htmlFor="academic_period_id" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <CalendarDays className="w-4 h-4 text-indigo-400" />
                                    Période académique <span className="text-red-500">*</span>
                                </label>
                                <Select value={academicPeriodId} onValueChange={setAcademicPeriodId}>
                                    <SelectTrigger
                                        id="academic_period_id"
                                        className={`bg-white ${errors.academic_period_id ? 'border-red-400 ring-1 ring-red-300' : 'border-indigo-200 focus:ring-indigo-400'}`}
                                    >
                                        <SelectValue placeholder="Sélectionner une période" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicPeriods.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                <span className="flex items-center gap-2">
                                                    {item.name}
                                                    {item.is_current && (
                                                        <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-emerald-200">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.academic_period_id && <p className="text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" />{errors.academic_period_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Lignes d'évaluations */}
                    <div className="rounded-2xl p-6 bg-linear-to-br from-violet-50 to-purple-50 border border-violet-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-violet-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-violet-500" />
                                Évaluations
                                <Badge className="ml-1 bg-violet-100 text-violet-700 border-violet-200 text-xs">
                                    {evaluations.length}
                                </Badge>
                            </h2>
                            <Button
                                type="button"
                                onClick={addLine}
                                className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Ajouter une ligne
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {evaluations.map((line, index) => {
                                const typeErrorKey = `evaluations.${index}.evaluation_type_id`;
                                const nameErrorKey = `evaluations.${index}.name`;
                                const coefficientErrorKey = `evaluations.${index}.coefficient`;

                                return (
                                    <div
                                        key={line.temp_id}
                                        className="rounded-xl border border-violet-200 bg-white shadow-sm p-5 space-y-4"
                                    >
                                        {/* Header de ligne */}
                                        <div className="flex items-center justify-between pb-2 border-b border-violet-100">
                                            <span className="flex items-center gap-2 text-sm font-semibold text-violet-700">
                                                <Hash className="w-4 h-4" />
                                                Évaluation #{index + 1}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                                                onClick={() => removeLine(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Type */}
                                            <div className="space-y-1.5">
                                                <label htmlFor={`evaluation_type_id_${line.temp_id}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                    <Tag className="w-3.5 h-3.5 text-violet-400" />
                                                    Type <span className="text-red-500">*</span>
                                                </label>
                                                <Select
                                                    value={line.evaluation_type_id}
                                                    onValueChange={(value) => updateLine(index, 'evaluation_type_id', value)}
                                                >
                                                    <SelectTrigger
                                                        id={`evaluation_type_id_${line.temp_id}`}
                                                        className={errors[typeErrorKey] ? 'border-red-400 ring-1 ring-red-300 bg-red-50/40' : 'border-gray-200 bg-white'}
                                                    >
                                                        <SelectValue placeholder="Type d'évaluation" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {evaluationTypes.map((item) => (
                                                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors[typeErrorKey] && <p className="text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" />{errors[typeErrorKey]}</p>}
                                            </div>

                                            {/* Nom */}
                                            <div className="space-y-1.5">
                                                <label htmlFor={`evaluation_name_${line.temp_id}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                                                    Nom <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    id={`evaluation_name_${line.temp_id}`}
                                                    value={line.name}
                                                    onChange={(e) => updateLine(index, 'name', e.target.value)}
                                                    placeholder="Ex: Devoir 1"
                                                    className={errors[nameErrorKey] ? 'border-red-400 bg-red-50/40 ring-1 ring-red-300' : 'border-gray-200 bg-white focus-visible:ring-violet-400'}
                                                />
                                                {errors[nameErrorKey] && <p className="text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" />{errors[nameErrorKey]}</p>}
                                            </div>

                                            {/* Date */}
                                            <div className="space-y-1.5">
                                                <label htmlFor={`evaluation_date_${line.temp_id}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                    <CalendarDays className="w-3.5 h-3.5 text-violet-400" />
                                                    Date
                                                </label>
                                                <Input
                                                    id={`evaluation_date_${line.temp_id}`}
                                                    type="date"
                                                    value={line.date}
                                                    onChange={(e) => updateLine(index, 'date', e.target.value)}
                                                    className="border-gray-200 bg-white focus-visible:ring-violet-400"
                                                />
                                            </div>

                                            {/* Coefficient */}
                                            <div className="space-y-1.5">
                                                <label htmlFor={`evaluation_coefficient_${line.temp_id}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                    <Hash className="w-3.5 h-3.5 text-violet-400" />
                                                    Coefficient <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    id={`evaluation_coefficient_${line.temp_id}`}
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    value={line.coefficient}
                                                    onChange={(e) => updateLine(index, 'coefficient', e.target.value)}
                                                    className={errors[coefficientErrorKey] ? 'border-red-400 bg-red-50/40 ring-1 ring-red-300' : 'border-gray-200 bg-white focus-visible:ring-violet-400'}
                                                />
                                                {errors[coefficientErrorKey] && <p className="text-red-600 text-xs flex items-center gap-1"><X className="w-3 h-3" />{errors[coefficientErrorKey]}</p>}
                                            </div>

                                            {/* Statut */}
                                            <div className="space-y-1.5">
                                                <label htmlFor={`evaluation_status_${line.temp_id}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                                                    Statut <span className="text-red-500">*</span>
                                                </label>
                                                <Select
                                                    value={line.status}
                                                    onValueChange={(value) => updateLine(index, 'status', value)}
                                                >
                                                    <SelectTrigger id={`evaluation_status_${line.temp_id}`} className="border-gray-200 bg-white">
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
                                            <div className="space-y-1.5 lg:col-span-3">
                                                <label htmlFor={`evaluation_description_${line.temp_id}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                                                    Description
                                                </label>
                                                <Textarea
                                                    id={`evaluation_description_${line.temp_id}`}
                                                    rows={2}
                                                    value={line.description}
                                                    onChange={(e) => updateLine(index, 'description', e.target.value)}
                                                    placeholder="Description optionnelle..."
                                                    className="border-gray-200 bg-white focus-visible:ring-violet-400 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {errors.evaluations && (
                            <p className="text-red-600 text-sm flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <X className="w-4 h-4 shrink-0" />
                                {errors.evaluations}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pb-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm min-w-45"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les évaluations'}
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
