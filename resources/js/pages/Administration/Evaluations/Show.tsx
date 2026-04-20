import { Head, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Calendar, FileText, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Evaluation {
    id: string;
    name: string;
    description: string | null;
    date: string | null;
    coefficient: number;
    status: 'scheduled' | 'completed';
    evaluation_type?: { name: string };
    classroom?: { name: string; code: string };
    academic_period?: { name: string };
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    evaluation: Evaluation;
}

export default function Show({ evaluation }: Readonly<ShowProps>) {
    const formatDate = (date: string | null) => {
        if (!date) {
            return '—';
        }

        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title={evaluation.name} />

            <div className="max-w-6xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="border-gray-300" onClick={() => router.visit(route('evaluations.index'))}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">{evaluation.name}</h1>
                            <p className="text-gray-600 mt-2">Détails de l'évaluation.</p>
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => router.visit(route('evaluations.edit', evaluation.id))}>
                        <Pencil className="w-4 h-4" />
                        Modifier
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl p-5 bg-linear-to-br from-blue-50/60 to-white ring-1 ring-blue-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900">Informations principales</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="rounded-xl bg-white/80 ring-1 ring-blue-100 px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Type</p>
                                    <p className="font-semibold text-gray-900 mt-1">{evaluation.evaluation_type?.name || '—'}</p>
                                </div>
                                <div className="rounded-xl bg-white/80 ring-1 ring-blue-100 px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Classe</p>
                                    <p className="font-semibold text-gray-900 mt-1">{evaluation.classroom?.name || '—'} ({evaluation.classroom?.code || '—'})</p>
                                </div>
                                <div className="rounded-xl bg-white/80 ring-1 ring-blue-100 px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Période académique</p>
                                    <p className="font-semibold text-gray-900 mt-1">{evaluation.academic_period?.name || '—'}</p>
                                </div>
                                <div className="rounded-xl bg-white/80 ring-1 ring-blue-100 px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Date</p>
                                    <p className="font-semibold text-gray-900 mt-1">{formatDate(evaluation.date)}</p>
                                </div>
                                <div className="rounded-xl bg-white/80 ring-1 ring-blue-100 px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Coefficient</p>
                                    <p className="font-semibold text-gray-900 mt-1">{Number(evaluation.coefficient).toFixed(2)}</p>
                                </div>
                                <div className="rounded-xl bg-white/80 ring-1 ring-blue-100 px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Statut</p>
                                    <span className={`inline-flex items-center mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        evaluation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {evaluation.status === 'completed' ? 'Terminée' : 'Planifiée'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl p-5 bg-linear-to-br from-violet-50/60 to-white ring-1 ring-violet-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                                    <FileText className="h-5 w-5 text-violet-600" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900">Description</p>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{evaluation.description || 'Aucune description renseignée.'}</p>
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
                                <p className="text-xs uppercase tracking-wide text-gray-500">Créée le</p>
                                <p className="font-semibold text-gray-900 mt-1">{formatDate(evaluation.created_at)}</p>
                            </div>
                            <div className="rounded-xl bg-white/80 ring-1 ring-emerald-100 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Mise à jour le</p>
                                <p className="font-semibold text-gray-900 mt-1">{formatDate(evaluation.updated_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
