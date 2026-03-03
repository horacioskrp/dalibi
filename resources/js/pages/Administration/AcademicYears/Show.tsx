import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, FileText, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface AcademicYear {
    id: string;
    year: string;
    start_date: string;
    end_date: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    academicYear: AcademicYear;
}

export default function Show({ academicYear }: Readonly<ShowProps>) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateShort = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <AppLayout>
            <Head title={academicYear.year} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.get(route('academic-years.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {academicYear.year}
                                </h1>
                                <div className="mt-1">
                                    {academicYear.active ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Année active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                                            <XCircle className="w-4 h-4" />
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.get(route('academic-years.edit', academicYear.id))}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Modifier
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informations principales */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Informations de l'année académique
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Année</p>
                                    <p className="font-medium text-gray-900 mt-1">{academicYear.year}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Statut</p>
                                    <p className="font-medium text-gray-900 mt-1">
                                        {academicYear.active ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date de début</p>
                                    <p className="font-medium text-gray-900 mt-1">
                                        {formatDateShort(academicYear.start_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date de fin</p>
                                    <p className="font-medium text-gray-900 mt-1">
                                        {formatDateShort(academicYear.end_date)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Période */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                Période
                            </h2>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Du</p>
                                        <p className="text-lg font-bold text-blue-600 mt-1">
                                            {formatDate(academicYear.start_date)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-0.5 bg-blue-300"></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Au</p>
                                        <p className="text-lg font-bold text-blue-600 mt-1">
                                            {formatDate(academicYear.end_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Historique */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Historique
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Créée le</p>
                                        <p className="font-medium text-gray-900">{formatDate(academicYear.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Dernière modification</p>
                                        <p className="font-medium text-gray-900">{formatDate(academicYear.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Classes</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">0</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Étudiants inscrits</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">0</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Enseignants</p>
                                    <p className="text-2xl font-bold text-purple-600 mt-1">0</p>
                                </div>
                            </div>
                        </div>

                        {/* État */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">État</h2>
                            <div className={`p-4 rounded-lg ${academicYear.active ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-2">
                                    {academicYear.active ? (
                                        <>
                                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                                            <div>
                                                <p className="font-semibold text-green-900">Année en cours</p>
                                                <p className="text-sm text-green-700 mt-0.5">
                                                    Cette année est actuellement active
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-6 h-6 text-gray-600" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Année inactive</p>
                                                <p className="text-sm text-gray-700 mt-0.5">
                                                    Cette année n'est pas active
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
