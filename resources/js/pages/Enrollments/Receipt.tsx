import { Head } from '@inertiajs/react';

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
    school?: School | null;
    student?: Student | null;
    classroom?: Classroom | null;
    academic_year?: AcademicYear | null;
    enrolled_by?: User | null;
}

interface ReceiptProps {
    enrollment: Enrollment;
}

const ReceiptBlock = ({ enrollment }: { enrollment: Enrollment }) => {
    const enrolledByName = [enrollment.enrolled_by?.firstname, enrollment.enrolled_by?.lastname].filter(Boolean).join(' ');
    const studentName = enrollment.student
        ? `${enrollment.student.firstname} ${enrollment.student.lastname}`
        : '-';

    return (
        <div className="w-full h-full p-12 flex flex-col justify-between">
            {/* Header */}
            <div className="border-b-2 border-gray-900 pb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">{enrollment.school?.name ?? 'École'}</h1>
                <p className="text-sm text-gray-600 mt-1">REÇU D'INSCRIPTION</p>
            </div>

            {/* Content */}
            <div className="space-y-6 flex-1 py-8">
                {/* Receipt Number and Date */}
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Numéro de reçu</p>
                        <p className="text-lg font-bold text-gray-900">{enrollment.enrollment_code}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Date</p>
                        <p className="text-lg font-bold text-gray-900">
                            {new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                </div>

                {/* Student Info */}
                <div className="border-l-4 border-blue-600 pl-4 py-4">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Élève</p>
                            <p className="text-base font-semibold text-gray-900">{studentName}</p>
                            {enrollment.student?.matricule && (
                                <p className="text-xs text-gray-600 mt-1">N° Matricule : {enrollment.student.matricule}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Classe</p>
                            <p className="text-base font-semibold text-gray-900">
                                {enrollment.classroom
                                    ? `${enrollment.classroom.name} (${enrollment.classroom.code})`
                                    : '-'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Année académique</p>
                            <p className="text-base font-semibold text-gray-900">
                                {enrollment.academic_year?.year ?? '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">
                                Année : {new Date(enrollment.created_at).getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="text-center">
                    <div
                        className={`inline-block px-6 py-2 rounded-lg font-bold ${
                            enrollment.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {enrollment.status === 'paid' ? '✓ PAYÉ' : '✗ NON PAYÉ'}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-900 pt-6 text-center space-y-3">
                <p className="text-xs text-gray-600">
                    Reçu établi le {new Date(enrollment.created_at).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(enrollment.created_at).toLocaleTimeString('fr-FR')}
                </p>
                <p className="text-xs text-gray-600">
                    Enregistré par : {enrolledByName || enrollment.enrolled_by?.email || '-'}
                </p>
                <p className="text-xs italic text-gray-500 mt-6">
                    Ce document est un reçu d'inscription. Veuillez le conserver.
                </p>
            </div>
        </div>
    );
};

export default function Receipt({ enrollment }: Readonly<ReceiptProps>) {
    return (
        <>
            <Head title={`Reçu - ${enrollment.enrollment_code}`} />
            <div className="bg-white">
                {/* Copie 1 */}
                <div className="h-screen flex items-center justify-center break-after-page bg-white">
                    <ReceiptBlock enrollment={enrollment} />
                </div>
                {/* Copie 2 — duplicata */}
                <div className="h-screen flex items-center justify-center bg-white">
                    <ReceiptBlock enrollment={enrollment} />
                </div>
            </div>
            <style>{`
                @media print {
                    body { margin: 0; padding: 0; background: white; }
                    .break-after-page { page-break-after: always; }
                }
            `}</style>
        </>
    );
}
