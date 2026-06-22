import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StudentFormSteps, type StudentFormPayload } from '@/components/students/student-form-steps';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Student {
    id: string;
    matricule?: string | null;
    firstname: string;
    lastname: string;
    gender: 'male' | 'female';
    birth_date: string;
    place_of_birth?: string | null;
    nationality?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    profile_photo?: string | null;
    active: boolean;
    information?: {
        birth_certificate_number?: string | null;
        birth_certificate_issue_date?: string | null;
        birth_certificate_issue_place?: string | null;
        admission_type?: 'new' | 'transfer' | 're_admission';
    } | null;
    parent_info?: {
        father_firstname?: string | null;
        father_lastname?: string | null;
        father_profession?: string | null;
        father_phone?: string | null;
        mother_firstname?: string | null;
        mother_lastname?: string | null;
        mother_profession?: string | null;
        mother_phone?: string | null;
        email?: string | null;
    } | null;
    medical_info?: {
        blood_group?: string | null;
        allergies?: string | null;
        vaccinations?: string | null;
        emergency_contact_name?: string | null;
        emergency_contact_phone?: string | null;
    } | null;
}

interface EditProps {
    student: Student;
}

const normalizeDate = (value?: string | null): string => {
    if (!value) return '';
    return value.slice(0, 10);
};

export default function Edit({ student }: Readonly<EditProps>) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues = useMemo<StudentFormPayload>(() => ({
        matricule: student.matricule ?? '',
        firstname: student.firstname,
        lastname: student.lastname,
        gender: student.gender,
        birth_date: normalizeDate(student.birth_date),
        place_of_birth: student.place_of_birth ?? '',
        nationality: student.nationality ?? '',
        address: student.address ?? '',
        city: student.city ?? '',
        phone: student.phone ?? '',
        email: student.email ?? '',
        profile_photo: student.profile_photo ?? '',
        active: student.active,
        information: {
            birth_certificate_number: student.information?.birth_certificate_number ?? '',
            birth_certificate_issue_date: normalizeDate(student.information?.birth_certificate_issue_date),
            birth_certificate_issue_place: student.information?.birth_certificate_issue_place ?? '',
            admission_type: student.information?.admission_type ?? 'new',
        },
        parent: {
            father_firstname: student.parent_info?.father_firstname ?? '',
            father_lastname: student.parent_info?.father_lastname ?? '',
            father_profession: student.parent_info?.father_profession ?? '',
            father_phone: student.parent_info?.father_phone ?? '',
            mother_firstname: student.parent_info?.mother_firstname ?? '',
            mother_lastname: student.parent_info?.mother_lastname ?? '',
            mother_profession: student.parent_info?.mother_profession ?? '',
            mother_phone: student.parent_info?.mother_phone ?? '',
            email: student.parent_info?.email ?? '',
        },
        medical: {
            blood_group: student.medical_info?.blood_group ?? '',
            allergies: student.medical_info?.allergies ?? '',
            vaccinations: student.medical_info?.vaccinations ?? '',
            emergency_contact_name: student.medical_info?.emergency_contact_name ?? '',
            emergency_contact_phone: student.medical_info?.emergency_contact_phone ?? '',
        },
    }), [student]);

    const handleSubmit = (data: StudentFormPayload) => {
        setIsSubmitting(true);
        setErrors({});

        const payload = { ...data };

        router.put(route('students.update', student.id), payload as never, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Modifier élève" />

            <div className="space-y-6 max-w-6xl">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.get(route('students.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Modifier un élève</h1>
                        <p className="mt-2 text-gray-600">Mettez à jour les informations via le même formulaire par étapes.</p>
                    </div>
                </div>

                <StudentFormSteps
                    mode="edit"
                    initialValues={initialValues}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    onCancel={() => router.get(route('students.index'))}
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}
