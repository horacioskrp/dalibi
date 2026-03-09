import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Percent, Calendar, FileText, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

type ScholarshipType = 'percentage' | 'fixed';

interface Scholarship {
    id: string;
    name: string;
    description: string | null;
    type: ScholarshipType;
    value: string;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    scholarship: Scholarship;
}

export default function Show({ scholarship }: Readonly<ShowProps>) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formattedValue = scholarship.type === 'percentage'
        ? `${Number(scholarship.value)}%`
        : new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(scholarship.value));

    return (
        <AppLayout>
            <Head title={scholarship.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.get(route('scholarships.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                                <Percent className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {scholarship.name}
                                </h1>
                                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                    {scholarship.type === 'percentage' ? 'Pourcentage' : 'Montant fixe'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.get(route('scholarships.edit', scholarship.id))}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Modifier
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-blue-600" />
                                Informations de la bourse
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Nom</p>
                                    <p className="font-medium text-gray-900 mt-1">{scholarship.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Valeur</p>
                                    <p className="font-medium text-gray-900 mt-1">{formattedValue}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Description
                            </h2>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {scholarship.description || 'Aucune description disponible'}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Historique
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Créée le</p>
                                        <p className="font-medium text-gray-900">{formatDate(scholarship.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Dernière modification</p>
                                        <p className="font-medium text-gray-900">{formatDate(scholarship.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Type</p>
                                    <p className="text-xl font-bold text-blue-600 mt-1">
                                        {scholarship.type === 'percentage' ? 'Pourcentage' : 'Montant fixe'}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Valeur actuelle</p>
                                    <p className="text-xl font-bold text-green-600 mt-1 flex items-center gap-1">
                                        <Wallet className="w-5 h-5" />
                                        {formattedValue}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
