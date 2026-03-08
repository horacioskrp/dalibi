import { Head, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
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
    return (
        <AppLayout>
            <Head title={evaluation.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="border-gray-300" onClick={() => router.visit(route('evaluations.index'))}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{evaluation.name}</h1>
                            <p className="text-gray-600 mt-1">Détails de l'évaluation</p>
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.visit(route('evaluations.edit', evaluation.id))}>
                        Modifier
                    </Button>
                </div>

                <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-xl font-semibold text-gray-900">{evaluation.name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-gray-700">Type</p>
                            <p className="text-gray-600">{evaluation.evaluation_type?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Classe</p>
                            <p className="text-gray-600">{evaluation.classroom?.name || '—'} ({evaluation.classroom?.code || '—'})</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Période académique</p>
                            <p className="text-gray-600">{evaluation.academic_period?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Date</p>
                            <p className="text-gray-600">{evaluation.date ? new Date(evaluation.date).toLocaleDateString('fr-FR') : '—'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Coefficient</p>
                            <p className="text-gray-600">{Number(evaluation.coefficient).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Statut</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                evaluation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {evaluation.status === 'completed' ? 'Terminée' : 'Planifiée'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="font-medium text-gray-700">Description</p>
                        <p className="text-gray-600">{evaluation.description || '—'}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
