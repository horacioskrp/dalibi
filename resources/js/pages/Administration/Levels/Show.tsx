import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Level {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    level: Level;
}

export default function Show({ level }: Readonly<ShowProps>) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <Head title={level.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.get(route('levels.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                                <GraduationCap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 capitalize">{level.name}</h1>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.get(route('levels.edit', level.id))}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Modifier
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                Informations du niveau
                            </h2>
                            <div>
                                <p className="text-sm text-gray-600">Nom</p>
                                <p className="font-medium text-gray-900 mt-1 capitalize">{level.name}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Description
                            </h2>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {level.description || 'Aucune description disponible'}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Historique
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Créé le</p>
                                    <p className="font-medium text-gray-900">{formatDate(level.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Dernière modification</p>
                                    <p className="font-medium text-gray-900">{formatDate(level.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
