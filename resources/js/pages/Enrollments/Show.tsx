import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface School {
    name: string;
    code: string;
}

interface Student {
    firstname: string;
    lastname: string;
    matricule?: string | null;
}

interface Classroom {
    name: string;
    code: string;
}

interface AcademicYear {
    year: string;
}

interface Schooling {
    inscription_fee: number;
    school_fee: number;
}

interface User {
    firstname?: string | null;
    lastname?: string | null;
    email?: string | null;
}

interface Enrollment {
    id: string;
    enrollment_code: string;
    enrollment_date: string;
    status: 'paid' | 'unpaid';
    created_at: string;
    updated_at: string;
    school?: School | null;
    student?: Student | null;
    classroom?: Classroom | null;
    academic_year?: AcademicYear | null;
    schooling?: Schooling | null;
    enrolled_by?: User | null;
}

interface ShowProps {
    enrollment: Enrollment;
}

const statusMap: Record<Enrollment['status'], string> = {
    paid: 'Payé',
    unpaid: 'Non payé',
};

const statusBadgeClass: Record<Enrollment['status'], string> = {
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-red-100 text-red-700',
};

const formatMoney = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);

export default function Show({ enrollment }: Readonly<ShowProps>) {
    const enrolledByName = [enrollment.enrolled_by?.firstname, enrollment.enrolled_by?.lastname].filter(Boolean).join(' ');

    return (
        <AppLayout>
            <Head title="Détail inscription" />

            <div className="space-y-6 max-w-5xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.get(route('enrollments.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Détail de l'inscription</h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => window.open(route('enrollments.receipt', enrollment.id), '_blank')} className="bg-green-600 hover:bg-green-700 gap-2">
                            <Printer className="w-4 h-4" />
                            Imprimer le reçu
                        </Button>
                        <Button onClick={() => router.get(route('enrollments.edit', enrollment.id))} className="bg-blue-600 hover:bg-blue-700">
                            Modifier
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Code d'inscription</p>
                        <p className="font-semibold text-gray-900 mt-1">{enrollment.enrollment_code}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <p className="mt-1">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[enrollment.status]}`}>
                                {statusMap[enrollment.status]}
                            </span>
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">École</p>
                        <p className="font-medium text-gray-900 mt-1">
                            {enrollment.school ? `${enrollment.school.name} (${enrollment.school.code})` : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Élève</p>
                        <p className="font-medium text-gray-900 mt-1">
                            {enrollment.student ? `${enrollment.student.firstname} ${enrollment.student.lastname}` : '-'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Classe</p>
                        <p className="font-medium text-gray-900 mt-1">
                            {enrollment.classroom ? `${enrollment.classroom.name} (${enrollment.classroom.code})` : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Année académique</p>
                        <p className="font-medium text-gray-900 mt-1">{enrollment.academic_year?.year ?? '-'}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Date d'inscription</p>
                        <p className="font-medium text-gray-900 mt-1">{new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Enregistré par</p>
                        <p className="font-medium text-gray-900 mt-1">{enrolledByName || enrollment.enrolled_by?.email || '-'}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Montant d'inscription payé</p>
                        <p className="font-bold text-blue-700 mt-1 text-lg">
                            {enrollment.schooling ? formatMoney(enrollment.schooling.inscription_fee) : '-'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Créé le</p>
                        <p className="font-medium text-gray-900 mt-1">{new Date(enrollment.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Modifié le</p>
                        <p className="font-medium text-gray-900 mt-1">{new Date(enrollment.updated_at).toLocaleString('fr-FR')}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
