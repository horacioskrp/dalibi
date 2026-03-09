import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface School {
    id: string;
    name: string;
    code: string;
}

interface Student {
    id: string;
    firstname: string;
    lastname: string;
    matricule?: string | null;
}

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface AcademicYear {
    id: string;
    year: string;
    active: boolean;
}

interface Schooling {
    id: string;
    class_id: string;
    inscription_fee: number;
    school_fee: number;
    classroom?: {
        name: string;
        code: string;
    };
}

interface CreateProps {
    schools: School[];
    students: Student[];
    classrooms: Classroom[];
    academicYears: AcademicYear[];
    schoolings: Schooling[];
}

export default function Create({ schools, students, classrooms, academicYears, schoolings }: Readonly<CreateProps>) {
    const [formData, setFormData] = useState({
        school_id: '',
        student_id: '',
        class_id: '',
        academic_year_id: '',
        enrollment_code: '',
        schooling_id: '',
        enrollment_date: new Date().toISOString().slice(0, 10),
        status: 'paid',
        discount_percentage: 0,
        amount_to_pay: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtrer les schoolings basés sur la classe sélectionnée
    const filteredSchoolings = formData.class_id 
        ? schoolings.filter((s) => s.class_id === formData.class_id)
        : schoolings;

    const calculateAmountToPay = () => {
        if (formData.schooling_id) {
            const schooling = schoolings.find((s) => s.id === formData.schooling_id);
            if (schooling) {
                const inscriptionFee = schooling.inscription_fee;
                const discountPercentage = formData.discount_percentage || 0;
                const amountToPay = inscriptionFee - (inscriptionFee * discountPercentage / 100);
                setFormData((prev) => ({ ...prev, amount_to_pay: Math.max(0, amountToPay) }));
            }
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const payload = { ...formData };

        router.post(route('enrollments.store'), payload as never, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Nouvelle inscription" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.get(route('enrollments.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Créer une inscription</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                    <div className="bg-white rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="school_id" className="block text-sm font-medium text-gray-900 mb-2">École *</label>
                            <select
                                id="school_id"
                                value={formData.school_id}
                                onChange={(event) => setFormData((prev) => ({ ...prev, school_id: event.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.school_id ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Sélectionner une école</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name} ({school.code})
                                    </option>
                                ))}
                            </select>
                            {errors.school_id && <p className="text-red-600 text-sm mt-1">{errors.school_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="student_id" className="block text-sm font-medium text-gray-900 mb-2">Élève *</label>
                            <select
                                id="student_id"
                                value={formData.student_id}
                                onChange={(event) => setFormData((prev) => ({ ...prev, student_id: event.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.student_id ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Sélectionner un élève</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.firstname} {student.lastname} {student.matricule ? `(${student.matricule})` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.student_id && <p className="text-red-600 text-sm mt-1">{errors.student_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="class_id" className="block text-sm font-medium text-gray-900 mb-2">Classe *</label>
                            <select
                                id="class_id"
                                value={formData.class_id}
                                onChange={(event) => {
                                    const selectedClassId = event.target.value;
                                    setFormData((prev) => ({ ...prev, class_id: selectedClassId }));
                                    
                                    // Sélectionner automatiquement le schooling pour cette classe
                                    if (selectedClassId) {
                                        const classSchoolings = schoolings.filter((s) => s.class_id === selectedClassId);
                                        if (classSchoolings.length > 0) {
                                            const selectedSchooling = classSchoolings[0]; // Prendre le premier (plus récent)
                                            setFormData((prev) => ({ 
                                                ...prev, 
                                                class_id: selectedClassId,
                                                schooling_id: selectedSchooling.id 
                                            }));
                                            
                                            // Recalculer le montant
                                            setTimeout(() => {
                                                const inscriptionFee = selectedSchooling.inscription_fee;
                                                const discountPercentage = formData.discount_percentage || 0;
                                                const amountToPay = inscriptionFee - (inscriptionFee * discountPercentage / 100);
                                                setFormData((prev) => ({ ...prev, amount_to_pay: Math.max(0, amountToPay) }));
                                            }, 0);
                                        } else {
                                            setFormData((prev) => ({ ...prev, class_id: selectedClassId, schooling_id: '' }));
                                        }
                                    } else {
                                        setFormData((prev) => ({ ...prev, class_id: '', schooling_id: '' }));
                                    }
                                }}
                                className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.class_id ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Sélectionner une classe</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name} ({classroom.code})
                                    </option>
                                ))}
                            </select>
                            {errors.class_id && <p className="text-red-600 text-sm mt-1">{errors.class_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="academic_year_id" className="block text-sm font-medium text-gray-900 mb-2">Année académique *</label>
                            <select
                                id="academic_year_id"
                                value={formData.academic_year_id}
                                onChange={(event) => setFormData((prev) => ({ ...prev, academic_year_id: event.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.academic_year_id ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Sélectionner une année</option>
                                {academicYears.map((academicYear) => (
                                    <option key={academicYear.id} value={academicYear.id}>
                                        {academicYear.year}{academicYear.active ? ' (active)' : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.academic_year_id && <p className="text-red-600 text-sm mt-1">{errors.academic_year_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="enrollment_code" className="block text-sm font-medium text-gray-900 mb-2">Code d'inscription</label>
                            <Input
                                id="enrollment_code"
                                value={formData.enrollment_code}
                                onChange={(event) => setFormData((prev) => ({ ...prev, enrollment_code: event.target.value }))}
                                className={errors.enrollment_code ? 'border-red-500' : 'border-gray-300'}
                                placeholder="Auto-généré si vide"
                            />
                            {errors.enrollment_code && <p className="text-red-600 text-sm mt-1">{errors.enrollment_code}</p>}
                        </div>

                        <div>
                            <label htmlFor="schooling_id" className="block text-sm font-medium text-gray-900 mb-2">Tarification</label>
                            <select
                                id="schooling_id"
                                value={formData.schooling_id}
                                onChange={(event) => {
                                    setFormData((prev) => ({ ...prev, schooling_id: event.target.value }));
                                    setTimeout(() => calculateAmountToPay(), 0);
                                }}
                                className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.schooling_id ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={!formData.class_id}
                            >
                                <option value="">{formData.class_id ? 'Sélectionner' : 'Sélectionner d\'abord une classe'}</option>
                                {filteredSchoolings.length > 0 && filteredSchoolings.map((schooling) => (
                                    <option key={schooling.id} value={schooling.id}>
                                        {schooling.classroom?.name ?? 'Classe'} - Inscr.: {schooling.inscription_fee} | Scolarité: {schooling.school_fee}
                                    </option>
                                ))}
                                {filteredSchoolings.length === 0 && formData.class_id && (
                                    <option value="" disabled>Aucune tarification pour cette classe</option>
                                )}
                            </select>
                            {errors.schooling_id && <p className="text-red-600 text-sm mt-1">{errors.schooling_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="enrollment_date" className="block text-sm font-medium text-gray-900 mb-2">Date d'inscription *</label>
                            <Input
                                id="enrollment_date"
                                type="date"
                                value={formData.enrollment_date}
                                onChange={(event) => setFormData((prev) => ({ ...prev, enrollment_date: event.target.value }))}
                                className={errors.enrollment_date ? 'border-red-500' : 'border-gray-300'}
                            />
                            {errors.enrollment_date && <p className="text-red-600 text-sm mt-1">{errors.enrollment_date}</p>}
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">Statut *</label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="paid">Payé</option>
                                <option value="unpaid">Non payé</option>
                            </select>
                            {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
                        </div>

                        <div>
                            <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-900 mb-2">Pourcentage de réduction (%)</label>
                            <Input
                                id="discount_percentage"
                                type="number"
                                value={formData.discount_percentage}
                                onChange={(event) => {
                                    setFormData((prev) => ({ ...prev, discount_percentage: Number.parseFloat(event.target.value) || 0 }));
                                    setTimeout(() => calculateAmountToPay(), 0);
                                }}
                                min="0"
                                max="100"
                                step="0.01"
                                className={errors.discount_percentage ? 'border-red-500' : 'border-gray-300'}
                                placeholder="0"
                            />
                            {errors.discount_percentage && <p className="text-red-600 text-sm mt-1">{errors.discount_percentage}</p>}
                        </div>

                        <div>
                            <label htmlFor="amount_to_pay" className="block text-sm font-medium text-gray-900 mb-2">Montant à payer</label>
                            <Input
                                id="amount_to_pay"
                                type="text"
                                value={formData.amount_to_pay.toFixed(2)}
                                readOnly
                                className="border-gray-300 bg-gray-50 cursor-not-allowed"
                                placeholder="Calculé automatiquement"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? 'Création...' : 'Créer'}
                        </Button>
                        <Button type="button" variant="outline" className="border-gray-300 text-gray-700" onClick={() => router.get(route('enrollments.index'))}>
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
