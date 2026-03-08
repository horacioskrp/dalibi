import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Tag } from 'lucide-react';
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
    return (
        <AppLayout>
            <Head title={evaluationType.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="border-gray-300" onClick={() => router.visit(route('evaluation-types.index'))}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{evaluationType.name}</h1>
                            <p className="text-gray-600 mt-1">Type d'évaluation</p>
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.visit(route('evaluation-types.edit', evaluationType.id))}>
                        Modifier
                    </Button>
                </div>

                <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Tag className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{evaluationType.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Description</p>
                        <p className="text-gray-600">{evaluationType.description || '—'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <p className="font-medium text-gray-700">Créé le</p>
                            <p>{new Date(evaluationType.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Modifié le</p>
                            <p>{new Date(evaluationType.updated_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
