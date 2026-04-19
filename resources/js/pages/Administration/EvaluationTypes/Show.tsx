import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, Pencil, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface EvaluationType {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    evaluationType: EvaluationType;
}

export default function Show({ evaluationType }: Readonly<ShowProps>) {
    const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <AppLayout>
            <Head title={evaluationType.name} />

            <div className="max-w-5xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="border-gray-300" onClick={() => router.visit(route('evaluation-types.index'))}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">{evaluationType.name}</h1>
                            <p className="text-gray-600 mt-2">Détails du type d'évaluation.</p>
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => router.visit(route('evaluation-types.edit', evaluationType.id))}>
                        <Pencil className="w-4 h-4" />
                        Modifier
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl p-5 bg-linear-to-br from-blue-50/60 to-white ring-1 ring-blue-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                                    <Tag className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900">Informations principales</p>
                            </div>
                            <div className="rounded-xl bg-white/80 ring-1 ring-blue-100 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Nom</p>
                                <p className="font-semibold text-gray-900 mt-1">{evaluationType.name}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl p-5 bg-linear-to-br from-violet-50/60 to-white ring-1 ring-violet-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                                    <FileText className="h-5 w-5 text-violet-600" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900">Description</p>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {evaluationType.description || 'Aucune description renseignée pour ce type d\'évaluation.'}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-2xl p-5 bg-linear-to-br from-emerald-50/60 to-white ring-1 ring-emerald-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900">Historique</p>
                            </div>
                            <div className="rounded-xl bg-white/80 ring-1 ring-emerald-100 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Créé le</p>
                                <p className="font-semibold text-gray-900 mt-1">{formatDate(evaluationType.created_at)}</p>
                            </div>
                            <div className="rounded-xl bg-white/80 ring-1 ring-emerald-100 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Modifié le</p>
                                <p className="font-semibold text-gray-900 mt-1">{formatDate(evaluationType.updated_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
