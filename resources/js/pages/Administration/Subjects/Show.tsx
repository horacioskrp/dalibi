import { Head, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Subject {
    id: string;
    name: string;
    code: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    subject: Subject;
}

export default function Show({ subject }: Readonly<ShowProps>) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppLayout>
            <Head title={subject.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.get(route('subjects.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {subject.name}
                                </h1>
                                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                    {subject.code}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.get(route('subjects.edit', subject.id))}
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
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Informations de la matière
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Code</p>
                                    <p className="font-medium text-gray-900 mt-1">{subject.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Nom</p>
                                    <p className="font-medium text-gray-900 mt-1">{subject.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Description
                            </h2>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {subject.description || 'Aucune description disponible'}
                            </p>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Historique
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Créée le</p>
                                        <p className="font-medium text-gray-900">{formatDate(subject.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Dernière modification</p>
                                        <p className="font-medium text-gray-900">{formatDate(subject.updated_at)}</p>
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
                                    <p className="text-sm text-gray-600">Classes associées</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">0</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Enseignants</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
