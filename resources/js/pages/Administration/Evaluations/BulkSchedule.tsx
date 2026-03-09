import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Info, X } from 'lucide-react';
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

interface Classroom {
    id: string;
    name: string;
    code: string;
    classroom_type_id: string;
}

interface ClassroomType {
    id: string;
    name: string;
}

interface AcademicPeriod {
    id: string;
    name: string;
}

interface BulkScheduleProps {
    evaluationTypes: EvaluationType[];
    classrooms: Classroom[];
    classroomTypes: ClassroomType[];
    academicPeriods: AcademicPeriod[];
}

export default function BulkSchedule({
    evaluationTypes,
    classrooms,
    classroomTypes,
    academicPeriods,
}: Readonly<BulkScheduleProps>) {
    const [selectionMode, setSelectionMode] = useState<'specific' | 'type'>('specific');
    const [selectedClassroomIds, setSelectedClassroomIds] = useState<string[]>([]);
    const [selectedClassroomTypeId, setSelectedClassroomTypeId] = useState('');
    const [formData, setFormData] = useState({
        academic_period_id: '',
        evaluation_type_id: '',
        name: '',
        description: '',
        date: '',
        coefficient: '1.00',
        status: 'scheduled' as 'scheduled' | 'completed',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleClassroom = (id: string) => {
        setSelectedClassroomIds((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const getApplicableClassrooms = () => {
        if (selectionMode === 'type' && selectedClassroomTypeId) {
            return classrooms.filter((c) => c.classroom_type_id === selectedClassroomTypeId);
        }
        return classrooms.filter((c) => selectedClassroomIds.includes(c.id));
    };

    const applicableCount = getApplicableClassrooms().length;
    const getClassroomTypeName = () => {
        if (selectionMode === 'type' && selectedClassroomTypeId) {
            return classroomTypes.find((t) => t.id === selectedClassroomTypeId)?.name || '';
        }
        return '';
    };

    const submit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const payload = {
            ...formData,
            classroom_ids: selectionMode === 'specific' ? selectedClassroomIds : [],
            classroom_type_id: selectionMode === 'type' ? selectedClassroomTypeId : null,
        };

        router.post(route('evaluations.bulk-store'), payload, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => setIsSubmitting(false),
        });
    };

    const isFormValid =
        formData.academic_period_id &&
        formData.evaluation_type_id &&
        formData.name &&
        formData.coefficient &&
        applicableCount > 0;

    return (
        <AppLayout>
            <Head title="Programmation en masse" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.get(route('evaluations.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Programmation en masse</h1>
                        <p className="text-gray-600 mt-1">Créez la même évaluation pour plusieurs classes</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Selection Mode */}
                    <div className="bg-white rounded-lg border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sélection des classes</h2>
                        
                        {/* Mode Toggle */}
                        <div className="flex gap-2 mb-6 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectionMode('specific');
                                    setSelectedClassroomIds([]);
                                    setSelectedClassroomTypeId('');
                                }}
                                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                    selectionMode === 'specific'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Classes spécifiques
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectionMode('type');
                                    setSelectedClassroomIds([]);
                                    setSelectedClassroomTypeId('');
                                }}
                                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                    selectionMode === 'type'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Par type de classe
                            </button>
                        </div>

                        {/* Classes Specific Mode */}
                        {selectionMode === 'specific' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {classrooms.map((classroom) => (
                                        <button
                                            key={classroom.id}
                                            type="button"
                                            onClick={() => toggleClassroom(classroom.id)}
                                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                                                selectedClassroomIds.includes(classroom.id)
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {classroom.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Code: {classroom.code}
                                                    </div>
                                                </div>
                                                {selectedClassroomIds.includes(classroom.id) && (
                                                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Type Mode */}
                        {selectionMode === 'type' && (
                            <div className="space-y-4">
                                <Select value={selectedClassroomTypeId} onValueChange={setSelectedClassroomTypeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un type de classe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classroomTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedClassroomTypeId && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                                            Classes du type {getClassroomTypeName()}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {getApplicableClassrooms().map((classroom) => (
                                                <div
                                                    key={classroom.id}
                                                    className="p-3 rounded-lg border border-blue-200 bg-blue-50"
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {classroom.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Code: {classroom.code}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {errors.classrooms && (
                            <p className="text-red-600 text-sm mt-3">{errors.classrooms}</p>
                        )}
                    </div>

                    {/* Evaluation Details */}
                    <div className="bg-white rounded-lg border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de l'évaluation</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="academic_period_id"
                                    className="block text-sm font-medium text-gray-900 mb-2"
                                >
                                    Période académique *
                                </label>
                                <Select
                                    value={formData.academic_period_id}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            academic_period_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger
                                        id="academic_period_id"
                                        className={
                                            errors.academic_period_id ? 'border-red-500' : ''
                                        }
                                    >
                                        <SelectValue placeholder="Sélectionnez une période" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicPeriods.map((period) => (
                                            <SelectItem key={period.id} value={period.id}>
                                                {period.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.academic_period_id && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.academic_period_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="evaluation_type_id"
                                    className="block text-sm font-medium text-gray-900 mb-2"
                                >
                                    Type d'évaluation *
                                </label>
                                <Select
                                    value={formData.evaluation_type_id}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            evaluation_type_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger
                                        id="evaluation_type_id"
                                        className={
                                            errors.evaluation_type_id ? 'border-red-500' : ''
                                        }
                                    >
                                        <SelectValue placeholder="Sélectionnez un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {evaluationTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.evaluation_type_id && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.evaluation_type_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                                    Nom *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Ex: Devoir de mathématiques"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-2">
                                    Date
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            date: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="coefficient" className="block text-sm font-medium text-gray-900 mb-2">
                                    Coefficient *
                                </label>
                                <input
                                    id="coefficient"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.coefficient}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            coefficient: e.target.value,
                                        }))
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.coefficient ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.coefficient && (
                                    <p className="text-red-600 text-sm mt-1">{errors.coefficient}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                                    Statut *
                                </label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: value as 'scheduled' | 'completed',
                                        }))
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Planifiée</SelectItem>
                                        <SelectItem value="completed">Terminée</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-900 mb-2"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Notes additionnelles..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div
                        className={`rounded-lg border-2 p-4 transition-all ${
                            isFormValid
                                ? 'border-green-200 bg-green-50'
                                : 'border-amber-200 bg-amber-50'
                        }`}
                    >
                        <div className="flex gap-3">
                            <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                isFormValid ? 'text-green-600' : 'text-amber-600'
                            }`} />
                            <div>
                                <h3
                                    className={`font-semibold mb-1 ${
                                        isFormValid ? 'text-green-900' : 'text-amber-900'
                                    }`}
                                >
                                    {isFormValid
                                        ? `${applicableCount} évaluation${applicableCount > 1 ? 's' : ''} sera${
                                            applicableCount > 1 ? '' : ''
                                          } créée`
                                        : 'Complétez le formulaire'}
                                </h3>
                                {isFormValid ? (
                                    <p className="text-sm text-green-700">
                                        L'évaluation "{formData.name}" sera créée pour toutes les classes
                                        sélectionnées et sera effectif dès l'enregistrement.
                                    </p>
                                ) : (
                                    <p className="text-sm text-amber-700">
                                        Veuillez sélectionner au moins une classe et remplir les champs
                                        obligatoires.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get(route('evaluations.index'))}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 gap-2"
                            disabled={!isFormValid || isSubmitting}
                        >
                            {isSubmitting ? 'Création en cours...' : 'Créer les évaluations'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
